// Lapisan data / backend.
import {
  OrderStatusEnum,
  PaymentStatusEnum,
  RoomStatusEnum,
  type Order as PrismaOrder,
  type Payment as PrismaPayment,
  type Room as PrismaRoom,
  type User as PrismaUser,
} from "@prisma/client";
import { connection } from "next/server";
import type { Role } from "@/lib/session";
import { BANK_INFO, type BankInfo, type PaymentStatus } from "@/lib/payment";
import { hashPassword, verifyPassword } from "@/lib/password";
import { addOneMonth } from "@/lib/format";
import { prisma } from "@/lib/prisma";

export type Kos = {
  id: string;
  name: string;
  area: string;
  address: string;
  price: number;
  gender: string;
  roomSize: string;
  bathroom: string;
  roomsLeft: number;
  description: string;
  facilities: string[];
  photos: string[];
  status: RoomStatusEnum;
};

export type Payment = {
  id: string;
  registrationId: string;
  kosId: string;
  amount: number;
  status: PaymentStatus;
  createdAt: string;
  updatedAt: string;
  paidAt: string | null;
  expiredAt: string | null;
};

export type AccountInfo = {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: Role;
  roomNumber: string | null;
};

export type KosStatus =
  | "belum_pilih_kos"
  | "belum_bayar"
  | "menunggu_konfirmasi"
  | "lunas"
  | "terlambat";

export class ApiError extends Error {
  readonly status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

const EMAIL_RE = /^[a-z0-9._%+-]+@gmail\.com$/;
const PHONE_RE = /^(08\d{8,11}|628\d{8,11})$/;
const MIN_PASSWORD = 8;

function cleanString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function toAccount(
  user: Pick<PrismaUser, "id" | "name" | "email" | "phone" | "role">,
  roomNumber: string | null = null,
): AccountInfo {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    roomNumber,
  };
}
type PaymentInput = Pick<
  PrismaPayment,
  "id" | "amount" | "status" | "method" | "paid_at" | "expired_at"
>;
type OrderInput = Pick<
  PrismaOrder,
  "id" | "client_id" | "room_id" | "created_at" | "status"
>;

function toPayment(payment: PaymentInput, order: OrderInput): Payment {
  return {
    id: payment.id,
    registrationId: order.client_id,
    kosId: order.room_id,
    amount: payment.amount.toNumber(),
    status:
      payment.status === PaymentStatusEnum.paid
        ? order.status === OrderStatusEnum.confirmed
          ? "lunas"
          : "menunggu_konfirmasi"
        : payment.method === "manual_transfer" &&
            order.status === OrderStatusEnum.pending
          ? "menunggu_konfirmasi"
          : "menunggu_pembayaran",
    createdAt: order.created_at.toISOString(),
    updatedAt: (payment.paid_at ?? payment.expired_at).toISOString(),
    paidAt: payment.paid_at?.toISOString() ?? null,
    expiredAt: payment.expired_at?.toISOString() ?? null,
  };
}

function toRoomAsKos(
  room: PrismaRoom,
  hasActivePendingOrder: boolean = false,
): Kos {
  const isAvailable =
    room.status === RoomStatusEnum.available && !hasActivePendingOrder;
  return {
    id: room.id,
    name: room.name || `Kamar ${room.room_number}`,
    area: room.area || "KosanKu",
    address: room.area || "KosanKu",
    price: room.price.toNumber(),
    gender: room.gender || "Campur",
    roomSize: room.room_size || "3 x 4 m",
    bathroom: room.bathroom || "Dalam",
    roomsLeft: isAvailable ? 1 : 0,
    description: room.description || "Fasilitas lengkap dan nyaman.",
    facilities: room.facilities || [],
    photos:
      room.photos && room.photos.length > 0
        ? room.photos
        : ["/images/hero.jpg"],
    status: room.status,
  };
}

// ---------- Kamar / Kos ----------

export async function getKosList(): Promise<Kos[]> {
  await connection();
  const now = new Date();
  const rooms = await prisma.room.findMany({
    include: {
      orders: {
        where: {
          status: OrderStatusEnum.pending,
          payments: { some: { expired_at: { gt: now } } },
        },
      },
    },
    orderBy: { room_number: "asc" },
  });
  return rooms.map((room) => toRoomAsKos(room, room.orders.length > 0));
}

export async function getKos(id: string): Promise<Kos | null> {
  const now = new Date();
  const room = await prisma.room.findUnique({
    where: { id },
    include: {
      orders: {
        where: {
          status: OrderStatusEnum.pending,
          payments: { some: { expired_at: { gt: now } } },
        },
      },
    },
  });
  return room ? toRoomAsKos(room, room.orders.length > 0) : null;
}

// ---------- Autentikasi akun & pendaftaran ----------

export async function registerAccount(
  input: Record<string, unknown>,
): Promise<AccountInfo> {
  const name = cleanString(input.name);
  const email = cleanString(input.email).toLowerCase();
  const phone = cleanString(input.phone);
  const password = cleanString(input.password);

  if (!name) throw new ApiError("Nama lengkap wajib diisi", 400);
  if (!email || !EMAIL_RE.test(email))
    throw new ApiError("Format email tidak valid (harus @gmail.com)", 400);
  if (!phone || !PHONE_RE.test(phone))
    throw new ApiError(
      "Format nomor HP tidak valid (harus diawali 08/628, 10-13 digit)",
      400,
    );
  if (!password || password.length < MIN_PASSWORD) {
    throw new ApiError(`Kata sandi minimal ${MIN_PASSWORD} karakter`, 400);
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new ApiError("Email sudah terdaftar", 409);

  const hashedPassword = await hashPassword(password);
  const user = await prisma.user.create({
    data: {
      name,
      email,
      phone,
      password: hashedPassword,
      role: "client",
    },
  });

  return toAccount(user);
}

export async function authenticateAccount(
  input: Record<string, unknown>,
): Promise<AccountInfo> {
  const email = cleanString(input.email).toLowerCase();
  const password = cleanString(input.password);

  if (!email || !password)
    throw new ApiError("Email dan kata sandi wajib diisi", 400);

  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      orders: {
        where: { status: "confirmed" },
        include: { room: true },
        take: 1,
        orderBy: { created_at: "desc" },
      },
    },
  });
  if (!user) throw new ApiError("Email atau kata sandi salah", 401);

  const valid = await verifyPassword(password, user.password);
  if (!valid) throw new ApiError("Email atau kata sandi salah", 401);

  const confirmedOrder = user.orders[0];
  return toAccount(user, confirmedOrder?.room.room_number ?? null);
}

export async function authenticateAdmin(
  input: Record<string, unknown>,
): Promise<AccountInfo> {
  const email = cleanString(input.email).toLowerCase();
  const password = cleanString(input.password);

  if (!email || !password)
    throw new ApiError("Email dan kata sandi wajib diisi", 400);

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || user.role !== "owner")
    throw new ApiError("Email atau kata sandi salah", 401);

  const valid = await verifyPassword(password, user.password);
  if (!valid) throw new ApiError("Email atau kata sandi salah", 401);

  return toAccount(user);
}

// ---------- Pembayaran ----------

function deriveStatus(
  latest: Payment | null,
  lastLunas: Payment | null,
): KosStatus {
  if (!latest) return "belum_pilih_kos";
  if (latest.status === "lunas") {
    if (
      lastLunas?.paidAt &&
      addOneMonth(lastLunas.paidAt) < new Date().toISOString()
    ) {
      return "terlambat";
    }
    return "lunas";
  }
  if (latest.status === "menunggu_konfirmasi") return "menunggu_konfirmasi";
  return "belum_bayar";
}

export async function createPayment(registrationId: string, kosId: string) {
  return prisma.$transaction(
    async (tx) => {
      const now = new Date();
      const orders = await tx.order.findMany({
        where: { client_id: registrationId },
        include: { payments: true },
        orderBy: { created_at: "asc" },
      });
      if (
        orders.some(
          (order) =>
            order.status === OrderStatusEnum.pending &&
            order.payments.some((payment) => payment.expired_at > now),
        )
      ) {
        throw new ApiError(
          "Anda masih memiliki pembayaran yang belum selesai.",
          409,
        );
      }

      const room = await tx.room.findUnique({ where: { id: kosId } });
      if (!room) throw new ApiError("Kamar tidak ditemukan", 404);

      const existingConfirmedOrder = [...orders]
        .reverse()
        .find((order) => order.status === OrderStatusEnum.confirmed);
      if (
        existingConfirmedOrder &&
        existingConfirmedOrder.room_id !== room.id
      ) {
        throw new ApiError("Anda sudah menempati kamar lain.", 409);
      }

      if (!existingConfirmedOrder && room.status !== RoomStatusEnum.available) {
        throw new ApiError("Maaf, kamar ini sudah penuh / tidak tersedia", 409);
      }

      const startDate = now;
      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + 1);
      const order = await tx.order.create({
        data: {
          client_id: registrationId,
          room_id: room.id,
          start_date: startDate,
          end_date: endDate,
          status: OrderStatusEnum.pending,
          payments: {
            create: {
              status: PaymentStatusEnum.unpaid,
              amount: room.price,
              expired_at: new Date(now.getTime() + 24 * 60 * 60 * 1000),
            },
          },
        },
        include: { payments: true },
      });
      const payment = order.payments[0];
      if (!payment) throw new Error("Payment tidak berhasil dibuat.");

      return {
        payment: toPayment(payment, order),
        kosName: room.name || `Kamar ${room.room_number}`,
      };
    },
    { isolationLevel: "Serializable" },
  );
}

export async function markPaymentPaid(
  paymentId: string,
  registrationId: string,
): Promise<Payment> {
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: { order: true },
  });
  if (!payment || payment.order.client_id !== registrationId) {
    throw new ApiError("Pembayaran tidak ditemukan", 404);
  }

  if (payment.status === PaymentStatusEnum.unpaid) {
    if (payment.expired_at < new Date()) {
      throw new ApiError("Waktu pembayaran sudah habis", 409);
    }
    if (payment.order.status !== OrderStatusEnum.pending) {
      throw new ApiError("Pembayaran ini sudah tidak aktif", 409);
    }
    const updated = await prisma.payment.update({
      where: { id: paymentId },
      data: { method: "manual_transfer" },
    });
    return toPayment(updated, payment.order);
  }
  return toPayment(payment, payment.order);
}

export async function confirmPayment(
  paymentId: string,
  ownerId: string,
): Promise<Payment> {
  return prisma.$transaction(
    async (tx) => {
      const owner = await tx.user.findFirst({
        where: { id: ownerId, role: "owner" },
      });
      if (!owner) throw new ApiError("Unauthorized", 403);

      const now = new Date();
      const payment = await tx.payment.findUnique({
        where: { id: paymentId },
        include: { order: { include: { room: true } } },
      });
      if (!payment) {
        throw new ApiError("Pembayaran tidak ditemukan", 404);
      }
      if (payment.expired_at <= now)
        throw new ApiError("Waktu pembayaran sudah habis", 409);
      if (payment.status !== PaymentStatusEnum.unpaid) {
        throw new ApiError("Pembayaran ini sudah diproses", 409);
      }
      if (payment.order.status !== OrderStatusEnum.pending) {
        throw new ApiError("Pesanan ini sudah tidak menunggu konfirmasi", 409);
      }
      if (payment.method !== "manual_transfer") {
        throw new ApiError("Client belum mengirim konfirmasi pembayaran", 409);
      }

      const updatedPayment = await tx.payment.update({
        where: { id: paymentId },
        data: { status: PaymentStatusEnum.paid, paid_at: now },
      });
      const order = await tx.order.update({
        where: { id: payment.order_id },
        data: { status: OrderStatusEnum.confirmed },
        include: { room: true },
      });
      await tx.room.update({
        where: { id: order.room_id },
        data: { status: RoomStatusEnum.occupied },
      });
      return toPayment(updatedPayment, order);
    },
    { isolationLevel: "Serializable" },
  );
}

export async function setRoomNumber(
  registrationId: string,
  value: unknown,
  ownerId: string,
): Promise<AccountInfo> {
  const owner = await prisma.user.findFirst({
    where: { id: ownerId, role: "owner" },
  });
  if (!owner) throw new ApiError("Unauthorized", 403);

  const roomNumber = cleanString(value);
  if (roomNumber.length > 20)
    throw new ApiError("Nomor kamar maksimal 20 karakter", 400);

  const user = await prisma.user.findUnique({
    where: { id: registrationId },
    include: {
      orders: {
        orderBy: { created_at: "desc" },
        take: 1,
        include: { room: true },
      },
    },
  });
  if (!user) throw new ApiError("Penghuni tidak ditemukan", 404);
  const latestOrder = user.orders[0];
  if (!latestOrder) throw new ApiError("Penghuni belum memilih kamar", 409);
  await prisma.room.update({
    where: { id: latestOrder.room_id },
    data: { room_number: roomNumber || latestOrder.room.room_number },
  });
  return toAccount(user, roomNumber || latestOrder.room.room_number);
}

// ---------- Data dashboard ----------

export type UserDashboardData = {
  account: AccountInfo;
  kos: Kos | null;
  payment: Payment | null;
  orderHistory: ClientOrderHistory[];
  status: KosStatus;
  lastPaidAt: string | null;
  dueAt: string | null;
  bank: BankInfo;
};

export type ClientOrderHistory = {
  orderId: string;
  kosId: string;
  kosName: string;
  roomNumber: string;
  startDate: string;
  endDate: string;
  status: OrderStatusEnum;
  payments: Payment[];
};

export async function getUserDashboard(
  registrationId: string,
): Promise<UserDashboardData | null> {
  const user = await prisma.user.findFirst({
    where: { id: registrationId, role: "client" },
    include: {
      orders: {
        orderBy: { created_at: "asc" },
        include: { payments: true, room: true },
      },
    },
  });
  if (!user) return null;

  const latestOrder = user.orders[user.orders.length - 1] ?? null;
  const mine = user.orders.flatMap((order) =>
    order.payments.map((payment) => toPayment(payment, order)),
  );
  const latest = mine[mine.length - 1] ?? null;
  const lastLunas =
    [...mine].reverse().find((payment) => payment.status === "lunas") ?? null;
  const kos = latestOrder ? toRoomAsKos(latestOrder.room) : null;
  const account = toAccount(user, latestOrder?.room.room_number ?? null);

  const orderHistory: ClientOrderHistory[] = user.orders.map((order) => ({
    orderId: order.id,
    kosId: order.room.id,
    kosName: order.room.name || `Kamar ${order.room.room_number}`,
    roomNumber: order.room.room_number,
    startDate: order.start_date.toISOString(),
    endDate: order.end_date.toISOString(),
    status: order.status,
    payments: order.payments.map((payment) => toPayment(payment, order)),
  }));

  return {
    account,
    kos,
    payment: latest,
    orderHistory,
    status: deriveStatus(latest, lastLunas),
    lastPaidAt: lastLunas?.paidAt ?? null,
    dueAt: lastLunas?.paidAt ? addOneMonth(lastLunas.paidAt) : null,
    bank: BANK_INFO,
  };
}

export type TenantRow = {
  registrationId: string;
  name: string;
  phone: string;
  email: string;
  kosName: string | null;
  roomNumber: string | null;
  status: KosStatus;
  amount: number | null;
  paymentId: string | null;
  paymentStatus: PaymentStatus | null;
  lastPaidAt: string | null;
  dueAt: string | null;
};

export type AdminOverview = {
  rows: TenantRow[];
  orders: AdminOrderRow[];
  stats: {
    lunas: number;
    menungguKonfirmasi: number;
    terlambat: number;
    belumBayar: number;
    totalKamarTersisa: number;
  };
  kosSummary: { id: string; name: string; roomsLeft: number; price: number }[];
};

export type AdminOrderRow = {
  orderId: string;
  clientName: string;
  clientEmail: string;
  kosName: string;
  roomNumber: string;
  startDate: string;
  endDate: string;
  status: OrderStatusEnum;
  payments: {
    id: string;
    amount: number;
    status: PaymentStatus;
    expiredAt: string;
  }[];
};

export async function getAdminOverview(
  ownerId: string,
): Promise<AdminOverview> {
  const [owner, users, rooms, recentOrders] = await Promise.all([
    prisma.user.findFirst({
      where: { id: ownerId, role: "owner" },
      select: { id: true },
    }),
    prisma.user.findMany({
      where: { role: "client" },
      select: {
        id: true,
        name: true,
        phone: true,
        email: true,
        orders: {
          orderBy: { created_at: "asc" },
          select: {
            id: true,
            status: true,
            room: { select: { name: true, room_number: true } },
            payments: {
              select: {
                id: true,
                amount: true,
                status: true,
                method: true,
                paid_at: true,
                expired_at: true,
              },
            },
          },
        },
      },
    }),
    prisma.room.findMany({
      select: {
        id: true,
        name: true,
        room_number: true,
        status: true,
        price: true,
      },
    }),
    // Hanya 30 order terbaru untuk daftar "Pesanan masuk"
    prisma.order.findMany({
      where: { client: { role: "client" } },
      orderBy: { created_at: "desc" },
      take: 30,
      select: {
        id: true,
        client_id: true,
        room_id: true,
        created_at: true,
        status: true,
        start_date: true,
        end_date: true,
        client: { select: { name: true, email: true } },
        room: { select: { name: true, room_number: true } },
        payments: {
          select: {
            id: true,
            amount: true,
            status: true,
            method: true,
            paid_at: true,
            expired_at: true,
          },
        },
      },
    }),
  ]);
  if (!owner) throw new ApiError("Unauthorized", 403);

  const nowIso = new Date().toISOString();

  const rows: TenantRow[] = users.map((user) => {
    const orders = user.orders;
    const latestOrder = orders[orders.length - 1] ?? null;
    const latestPayment =
      latestOrder?.payments
        .slice()
        .sort(
          (left, right) =>
            right.expired_at.getTime() - left.expired_at.getTime(),
        )[0] ?? null;
    const paidPayments = orders
      .filter((order) => order.status === OrderStatusEnum.confirmed)
      .flatMap((order) => order.payments)
      .filter((payment) => payment.status === "paid" && payment.paid_at)
      .sort(
        (left, right) => right.paid_at!.getTime() - left.paid_at!.getTime(),
      );
    const lastPaidAt = paidPayments[0]?.paid_at?.toISOString() ?? null;
    const paymentStatus: PaymentStatus | null =
      latestPayment?.status === PaymentStatusEnum.paid
        ? latestOrder?.status === OrderStatusEnum.confirmed
          ? "lunas"
          : "menunggu_konfirmasi"
        : latestPayment?.status === PaymentStatusEnum.unpaid
          ? latestPayment.method === "manual_transfer"
            ? "menunggu_konfirmasi"
            : "menunggu_pembayaran"
          : null;
    const status: KosStatus =
      !latestOrder || latestOrder.status === "cancelled"
        ? "belum_pilih_kos"
        : paymentStatus === "lunas"
          ? lastPaidAt && addOneMonth(lastPaidAt) < nowIso
            ? "terlambat"
            : "lunas"
          : paymentStatus === "menunggu_konfirmasi"
            ? "menunggu_konfirmasi"
            : "belum_bayar";

    return {
      registrationId: user.id,
      name: user.name,
      phone: user.phone,
      email: user.email,
      kosName:
        latestOrder?.room.name ??
        (latestOrder?.room.room_number
          ? `Kamar ${latestOrder.room.room_number}`
          : null),
      roomNumber: latestOrder?.room.room_number ?? null,
      status,
      amount: latestPayment ? latestPayment.amount.toNumber() : null,
      paymentId:
        paymentStatus === "menunggu_konfirmasi" || paymentStatus === "lunas"
          ? (latestPayment?.id ?? null)
          : null,
      paymentStatus,
      lastPaidAt,
      dueAt: lastPaidAt ? addOneMonth(lastPaidAt) : null,
    };
  });

  const orders: AdminOrderRow[] = recentOrders.map((order) => ({
    orderId: order.id,
    clientName: order.client.name,
    clientEmail: order.client.email,
    kosName: order.room.name || `Kamar ${order.room.room_number}`,
    roomNumber: order.room.room_number,
    startDate: order.start_date.toISOString(),
    endDate: order.end_date.toISOString(),
    status: order.status,
    payments: order.payments.map((payment) => ({
      id: payment.id,
      amount: payment.amount.toNumber(),
      status: toPayment(payment, order).status,
      expiredAt: payment.expired_at.toISOString(),
    })),
  }));

  rows.sort((a, b) => a.name.localeCompare(b.name, "id"));

  const stats = {
    lunas: 0,
    menungguKonfirmasi: 0,
    terlambat: 0,
    belumBayar: 0,
  };
  for (const row of rows) {
    if (row.status === "lunas") stats.lunas++;
    else if (row.status === "menunggu_konfirmasi") stats.menungguKonfirmasi++;
    else if (row.status === "terlambat") stats.terlambat++;
    else if (row.status === "belum_bayar") stats.belumBayar++;
  }

  const kosSummary: AdminOverview["kosSummary"] = rooms.map((room) => ({
    id: room.id,
    name: room.name || `Kamar ${room.room_number}`,
    roomsLeft: room.status === RoomStatusEnum.available ? 1 : 0,
    price: room.price.toNumber(),
  }));

  return {
    rows,
    orders,
    stats: {
      ...stats,
      totalKamarTersisa: kosSummary.reduce(
        (sum, kos) => sum + kos.roomsLeft,
        0,
      ),
    },
    kosSummary,
  };
}

export type RoomManagementData = {
  stats: {
    totalRooms: number;
    occupiedRooms: number;
    availableRooms: number;
    occupancyRate: number;
    potentialRevenue: number;
  };
  roomTypes: {
    id: string;
    name: string;
    price: number;
    available: number;
    total: number;
    size: string;
    floor: string;
    image: string;
    facilities: string[];
  }[];
  units: {
    id: string;
    number: string;
    type: string;
    typeBadgeClass: string;
    floor: string;
    price: number;
    status: "TERISI" | "SIAP HUNI" | "PERAWATAN";
    tenantName?: string;
    dueDate?: string;
    notes?: string;
  }[];
};

export async function getRoomManagementData(): Promise<RoomManagementData> {
  const rooms = await prisma.room.findMany({
    orderBy: { room_number: "asc" },
    include: {
      orders: {
        where: { status: OrderStatusEnum.confirmed },
        orderBy: { end_date: "desc" },
        take: 1,
        include: {
          client: { select: { name: true } },
        },
      },
    },
  });

  const totalRooms = rooms.length;
  let occupiedRooms = 0;
  let availableRooms = 0;
  let potentialRevenue = 0;

  // Kelompokkan tipe kamar berdasarkan nama atau kategori
  const typeMap = new Map<
    string,
    {
      id: string;
      name: string;
      price: number;
      available: number;
      total: number;
      size: string;
      floor: string;
      image: string;
      facilities: string[];
    }
  >();

  const units = rooms.map((room) => {
    const priceNum = room.price.toNumber();
    potentialRevenue += priceNum;

    let uiStatus: "TERISI" | "SIAP HUNI" | "PERAWATAN" = "SIAP HUNI";
    if (room.status === RoomStatusEnum.occupied) {
      uiStatus = "TERISI";
      occupiedRooms++;
    } else if (room.status === RoomStatusEnum.available) {
      uiStatus = "SIAP HUNI";
      availableRooms++;
    } else {
      uiStatus = "PERAWATAN";
    }

    const latestOrder = room.orders[0];
    const tenantName = latestOrder?.client.name;
    const dueDate = latestOrder
      ? latestOrder.end_date.toLocaleDateString("id-ID", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
      : undefined;

    // Deteksi lantai dari area (misal: "Lantai 1 - Sayap Timur" -> "Lantai 1")
    const floor = room.area ? room.area.split("-")[0].trim() : "Lantai 1";

    const typeName = room.name || `Kamar ${room.room_number}`;
    const badgeClass = typeName.toLowerCase().includes("deluxe")
      ? "bg-primary/10 text-primary"
      : typeName.toLowerCase().includes("executive")
        ? "bg-secondary/15 text-secondary"
        : typeName.toLowerCase().includes("standard")
          ? "bg-tertiary-container/30 text-tertiary"
          : "bg-surface-bright text-on-surface-variant";

    // Agregasi katalog Room Types
    if (!typeMap.has(typeName)) {
      typeMap.set(typeName, {
        id: room.id,
        name: typeName,
        price: priceNum,
        available: room.status === RoomStatusEnum.available ? 1 : 0,
        total: 1,
        size: room.room_size || "3 x 4 m",
        floor: floor.replace("Lantai", "Lt."),
        image:
          room.photos[0] ||
          "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af",
        facilities:
          room.facilities.length > 0 ? room.facilities : ["WiFi", "Kasur"],
      });
    } else {
      const existing = typeMap.get(typeName)!;
      existing.total++;
      if (room.status === RoomStatusEnum.available) {
        existing.available++;
      }
    }

    return {
      id: room.id,
      number: room.room_number.startsWith("Kamar")
        ? room.room_number
        : `${room.room_number}`,
      type: typeName,
      typeBadgeClass: badgeClass,
      floor,
      price: priceNum,
      status: uiStatus,
      tenantName,
      dueDate,
      notes:
        uiStatus === "SIAP HUNI"
          ? "Kamar Kosong - Bersih & Siap Check-in"
          : uiStatus === "PERAWATAN"
            ? "Sedang Pemeliharaan"
            : undefined,
    };
  });

  const occupancyRate =
    totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 1000) / 10 : 0;

  return {
    stats: {
      totalRooms,
      occupiedRooms,
      availableRooms,
      occupancyRate,
      potentialRevenue,
    },
    roomTypes: Array.from(typeMap.values()),
    units,
  };
}
