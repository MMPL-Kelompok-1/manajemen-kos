import { OrderStatusEnum, Prisma, RoomStatusEnum } from "@prisma/client";
import { connection } from "next/server";
import { ApiError } from "@/lib/errors";
import { roomDisplayName, toAccount, toRoomAsKos } from "@/lib/mappers";
import { prisma } from "@/lib/prisma";
import type { AccountInfo, Kos, RoomManagementData, RoomUnitStatus } from "@/lib/types";
import { cleanString } from "@/lib/validation";

const ROOM_NUMBER_MAX = 20;
const ROOM_NAME_MAX = 80;
const ROOM_PRICE_MAX = 100_000_000;
const ROOM_NUMBER_TAKEN = "Nomor kamar sudah dipakai";

function activePendingOrders(now: Date) {
  return {
    where: {
      status: OrderStatusEnum.pending,
      payments: { some: { expired_at: { gt: now } } },
    },
  };
}

function isUniqueViolation(error: unknown): boolean {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";
}

export async function getKosList(): Promise<Kos[]> {
  await connection();
  const rooms = await prisma.room.findMany({
    include: { orders: activePendingOrders(new Date()) },
    orderBy: { room_number: "asc" },
  });
  return rooms.map((room) => toRoomAsKos(room, room.orders.length > 0));
}

export async function getKos(id: string): Promise<Kos | null> {
  const room = await prisma.room.findUnique({
    where: { id },
    include: { orders: activePendingOrders(new Date()) },
  });
  return room ? toRoomAsKos(room, room.orders.length > 0) : null;
}

export async function setRoomNumber(
  registrationId: string,
  value: unknown,
  ownerId: string,
): Promise<AccountInfo> {
  const owner = await prisma.user.findFirst({ where: { id: ownerId, role: "owner" } });
  if (!owner) throw new ApiError("Unauthorized", 403);

  const roomNumber = cleanString(value);
  if (roomNumber.length > ROOM_NUMBER_MAX) {
    throw new ApiError(`Nomor kamar maksimal ${ROOM_NUMBER_MAX} karakter`, 400);
  }

  const user = await prisma.user.findUnique({
    where: { id: registrationId },
    include: {
      orders: { orderBy: { created_at: "desc" }, take: 1, include: { room: true } },
    },
  });
  if (!user) throw new ApiError("Penghuni tidak ditemukan", 404);
  const latestOrder = user.orders[0];
  if (!latestOrder) throw new ApiError("Penghuni belum memilih kamar", 409);

  const nextNumber = roomNumber || latestOrder.room.room_number;
  if (nextNumber !== latestOrder.room.room_number) {
    const taken = await prisma.room.findFirst({
      where: { room_number: nextNumber, id: { not: latestOrder.room_id } },
      select: { id: true },
    });
    if (taken) throw new ApiError(ROOM_NUMBER_TAKEN, 409);
    try {
      await prisma.room.update({
        where: { id: latestOrder.room_id },
        data: { room_number: nextNumber },
      });
    } catch (error) {
      if (isUniqueViolation(error)) throw new ApiError(ROOM_NUMBER_TAKEN, 409);
      throw error;
    }
  }
  return toAccount(user, nextNumber);
}

function optionalText(value: unknown, label: string, max: number): string | null {
  const text = cleanString(value);
  if (text.length > max) throw new ApiError(`${label} maksimal ${max} karakter`, 400);
  return text || null;
}

export async function createRoom(input: Record<string, unknown>): Promise<{ id: string }> {
  const roomNumber = cleanString(input.roomNumber);
  if (!roomNumber || roomNumber.length > ROOM_NUMBER_MAX) {
    throw new ApiError(`Nomor kamar wajib diisi, maksimal ${ROOM_NUMBER_MAX} karakter`, 400);
  }
  const name = cleanString(input.name);
  if (!name || name.length > ROOM_NAME_MAX) {
    throw new ApiError(`Nama kamar wajib diisi, maksimal ${ROOM_NAME_MAX} karakter`, 400);
  }
  const area = cleanString(input.area);
  if (!area || area.length > 120) {
    throw new ApiError("Area wajib diisi, maksimal 120 karakter", 400);
  }
  const price = input.price;
  if (typeof price !== "number" || !Number.isInteger(price) || price <= 0 || price > ROOM_PRICE_MAX) {
    throw new ApiError("Harga harus bilangan bulat positif, maksimal Rp 100.000.000", 400);
  }

  let facilities: string[] = [];
  if (input.facilities !== undefined) {
    if (!Array.isArray(input.facilities) || input.facilities.length > 30) {
      throw new ApiError("Fasilitas harus berupa daftar (maksimal 30 item)", 400);
    }
    facilities = [
      ...new Set(input.facilities.map(cleanString).filter((item) => item.length > 0)),
    ];
    if (facilities.some((item) => item.length > 40)) {
      throw new ApiError("Nama fasilitas maksimal 40 karakter", 400);
    }
  }

  const data: Prisma.RoomCreateInput = {
    room_number: roomNumber,
    name,
    area,
    price,
    gender: optionalText(input.gender, "Jenis penghuni", 20),
    room_size: optionalText(input.roomSize, "Ukuran kamar", 20),
    bathroom: optionalText(input.bathroom, "Kamar mandi", 40),
    description: optionalText(input.description, "Deskripsi", 2000),
    facilities,
    photos: [],
    status: RoomStatusEnum.available,
  };

  const taken = await prisma.room.findUnique({ where: { room_number: roomNumber }, select: { id: true } });
  if (taken) throw new ApiError(ROOM_NUMBER_TAKEN, 409);
  try {
    const room = await prisma.room.create({ data, select: { id: true } });
    return room;
  } catch (error) {
    if (isUniqueViolation(error)) throw new ApiError(ROOM_NUMBER_TAKEN, 409);
    throw error;
  }
}

function toUnitStatus(status: RoomStatusEnum): RoomUnitStatus {
  if (status === RoomStatusEnum.occupied) return "TERISI";
  if (status === RoomStatusEnum.available) return "SIAP HUNI";
  return "PERAWATAN";
}

export async function getRoomManagementData(): Promise<RoomManagementData> {
  const rooms = await prisma.room.findMany({
    orderBy: { room_number: "asc" },
    include: {
      orders: {
        where: { status: OrderStatusEnum.confirmed },
        orderBy: { end_date: "desc" },
        take: 1,
        include: { client: { select: { name: true } } },
      },
    },
  });

  let occupiedRooms = 0;
  let availableRooms = 0;
  let potentialRevenue = 0;
  const typeMap = new Map<string, RoomManagementData["roomTypes"][number]>();

  const units: RoomManagementData["units"] = rooms.map((room) => {
    const price = room.price.toNumber();
    potentialRevenue += price;
    const status = toUnitStatus(room.status);
    if (status === "TERISI") occupiedRooms++;
    if (status === "SIAP HUNI") availableRooms++;

    const latestOrder = room.orders[0];
    // Lantai diambil dari awal area, misal "Lantai 1 - Sayap Timur" menjadi "Lantai 1".
    const floor = room.area ? room.area.split("-")[0].trim() : "Lantai 1";
    const typeName = roomDisplayName(room);

    const existing = typeMap.get(typeName);
    if (existing) {
      existing.total++;
      if (status === "SIAP HUNI") existing.available++;
    } else {
      typeMap.set(typeName, {
        id: room.id,
        name: typeName,
        price,
        available: status === "SIAP HUNI" ? 1 : 0,
        total: 1,
        size: room.room_size || "3 x 4 m",
        floor: floor.replace("Lantai", "Lt."),
        image: room.photos[0] ?? "",
        facilities: room.facilities,
      });
    }

    return {
      id: room.id,
      number: room.room_number,
      type: typeName,
      floor,
      price,
      status,
      tenantName: latestOrder?.client.name,
      dueDate: latestOrder?.end_date.toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
      notes:
        status === "SIAP HUNI"
          ? "Kamar Kosong - Bersih & Siap Check-in"
          : status === "PERAWATAN"
            ? "Sedang Pemeliharaan"
            : undefined,
    };
  });

  const totalRooms = rooms.length;
  return {
    stats: {
      totalRooms,
      occupiedRooms,
      availableRooms,
      occupancyRate: totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 1000) / 10 : 0,
      potentialRevenue,
    },
    roomTypes: Array.from(typeMap.values()),
    units,
  };
}
