// Lapisan data / backend.
import { OrderStatusEnum, PaymentStatusEnum, RoomStatusEnum, type Kos as PrismaKos, type Order as PrismaOrder, type Payment as PrismaPayment, type Room as PrismaRoom, type User as PrismaUser } from "@prisma/client";
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
};

export type AccountInfo = {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: Role;
  roomNumber: string | null;
};

export type TenantStatus =
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

function toPayment(payment: PrismaPayment, order: Pick<PrismaOrder, "id" | "client_id" | "room_id" | "created_at" | "status">): Payment {
  return {
    id: payment.id,
    registrationId: order.client_id,
    kosId: order.room_id,
    amount: payment.amount.toNumber(),
    status: payment.status === PaymentStatusEnum.paid
      ? order.status === OrderStatusEnum.confirmed
        ? "lunas"
        : "menunggu_konfirmasi"
      : payment.method === "manual_transfer" && order.status === OrderStatusEnum.pending
        ? "menunggu_konfirmasi"
        : "menunggu_pembayaran",
    createdAt: order.created_at.toISOString(),
    updatedAt: (payment.paid_at ?? payment.expired_at).toISOString(),
    paidAt: payment.paid_at?.toISOString() ?? null,
  };
}

function toKos(kos: PrismaKos & { rooms: PrismaRoom[] }): Kos {
  const availableRooms = kos.rooms.filter((room) => room.status === RoomStatusEnum.available);
  const sortedRooms = [...kos.rooms].sort((left, right) => left.price.toNumber() - right.price.toNumber());
  const price = sortedRooms[0]?.price.toNumber() ?? 0;

  return {
    id: kos.id,
    name: kos.name,
    area: kos.address,
    address: kos.address,
    price,
    gender: "Tidak ditentukan",
    roomSize: "Tidak ditentukan",
    bathroom: "Tidak ditentukan",
    roomsLeft: availableRooms.length,
    description: "Informasi kos belum tersedia.",
    facilities: [...new Set(kos.rooms.flatMap((room) => room.facilities))],
    photos: kos.background_img ? [kos.background_img] : [],
    status: availableRooms.length > 0 ? RoomStatusEnum.available : RoomStatusEnum.occupied,
  };
}

// ---------- Kos ----------

export async function getKosList(): Promise<Kos[]> {
  await connection();
  const now = new Date();
  const kosList = await prisma.kos.findMany({
    where: {
      rooms: {
        some: {
          status: RoomStatusEnum.available,
          orders: {
            none: {
              status: OrderStatusEnum.pending,
              payments: { some: { expired_at: { gt: now } } },
            },
          },
        },
      },
    },
    include: {
      rooms: {
        where: {
          status: RoomStatusEnum.available,
          orders: {
            none: {
              status: OrderStatusEnum.pending,
              payments: { some: { expired_at: { gt: now } } },
            },
          },
        },
      },
    },
  });
  return kosList.map(toKos);
}

export async function getKos(id: string): Promise<Kos | null> {
  const kos = await prisma.kos.findUnique({ where: { id }, include: { rooms: true } });
  return kos ? toKos(kos) : null;
}

export const getRooms = getKosList;
export const getRoomById = getKos;

// ---------- Akun ----------

function parseAccountFields(input: Record<string, unknown>) {
  const name = cleanString(input.name);
  const phone = cleanString(input.phone).replace(/[\s\-()]/g, "");
  const email = cleanString(input.email).toLowerCase();

  if (name.length < 3) throw new ApiError("Nama minimal 3 karakter", 400);
  if (!PHONE_RE.test(phone)) {
    throw new ApiError("Nomor HP tidak valid, contoh: 081234567890", 400);
  }
  if (!EMAIL_RE.test(email)) {
    throw new ApiError("Gunakan alamat Gmail (contoh: nama@gmail.com)", 400);
  }
  return { name, phone, email };
}

export async function registerAccount(input: Record<string, unknown>): Promise<AccountInfo> {
  const { name, phone, email } = parseAccountFields(input);
  const password = typeof input.password === "string" ? input.password : "";
  if (password.length < MIN_PASSWORD) {
    throw new ApiError(`Kata sandi minimal ${MIN_PASSWORD} karakter`, 400);
  }

  if (await prisma.user.findUnique({ where: { email }, select: { id: true } })) {
    throw new ApiError("Gmail ini sudah terdaftar. Silakan masuk.", 409);
  }

  const user = await prisma.user.create({
    data: {
      name,
      phone,
      email,
      password: await hashPassword(password),
      role: "client",
    },
  });
  return toAccount(user);
}

export async function authenticateUser(input: Record<string, unknown>): Promise<AccountInfo> {
  return authenticateAccount(input, "client");
}

export async function authenticateAccount(
  input: Record<string, unknown>,
  expectedRole?: Role,
): Promise<AccountInfo> {
  const email = cleanString(input.email).toLowerCase();
  const password = typeof input.password === "string" ? input.password : "";
  const user = await prisma.user.findUnique({ where: { email } });
  if (
    !user ||
    (expectedRole && user.role !== expectedRole) ||
    !(await verifyPassword(password, user.password))
  ) {
    throw new ApiError("Gmail atau kata sandi salah", 401);
  }
  return toAccount(user);
}

export async function getAccount(id: string): Promise<AccountInfo | null> {
  const user = await prisma.user.findUnique({ where: { id } });
  return user ? toAccount(user) : null;
}

// ---------- Pembayaran ----------

function deriveStatus(latest: Payment | null, lastLunas: Payment | null): TenantStatus {
  if (!latest) return "belum_pilih_kos";
  if (latest.status === "menunggu_pembayaran") return "belum_bayar";
  if (latest.status === "menunggu_konfirmasi") return "menunggu_konfirmasi";
  if (lastLunas?.paidAt && addOneMonth(lastLunas.paidAt) < new Date().toISOString()) {
    return "terlambat";
  }
  return "lunas";
}

export async function createPayment(registrationId: string, kosId: string) {
  return prisma.$transaction(async (tx) => {
    const now = new Date();
    const user = await tx.user.findUnique({ where: { id: registrationId } });
    if (!user || user.role !== "client") {
      throw new ApiError("Akun penghuni tidak ditemukan. Silakan masuk ulang.", 404);
    }

    await tx.order.updateMany({
      where: {
        client_id: registrationId,
        status: OrderStatusEnum.pending,
        AND: [
          { payments: { some: {} } },
          { payments: { every: { expired_at: { lte: now } } } },
        ],
      },
      data: { status: OrderStatusEnum.cancelled },
    });

    const orders = await tx.order.findMany({
      where: { client_id: registrationId },
      include: { payments: true, room: true },
      orderBy: { created_at: "asc" },
    });
    if (orders.some((order) =>
      order.status === OrderStatusEnum.pending &&
      order.payments.some((payment) => payment.expired_at > now)
    )) {
      throw new ApiError("Anda masih memiliki pembayaran yang belum selesai.", 409);
    }

    const kos = await tx.kos.findUnique({ where: { id: kosId } });
    if (!kos) throw new ApiError("Kos tidak ditemukan", 404);

    const existingConfirmedOrder = [...orders].reverse().find(
      (order) => order.status === OrderStatusEnum.confirmed,
    );
    const occupiedKosId = existingConfirmedOrder
      ? (await tx.room.findUnique({ where: { id: existingConfirmedOrder.room_id } }))?.kos_id ?? null
      : null;
    if (occupiedKosId && occupiedKosId !== kos.id) {
      throw new ApiError("Anda sudah menjadi penghuni di kos lain.", 409);
    }

    const room = occupiedKosId && existingConfirmedOrder
      ? await tx.room.findUnique({ where: { id: existingConfirmedOrder.room_id }, include: { kos: true } })
      : await tx.room.findFirst({
          where: {
            kos_id: kos.id,
            status: RoomStatusEnum.available,
            orders: {
              none: {
                status: OrderStatusEnum.pending,
                payments: { some: { expired_at: { gt: now } } },
              },
            },
          },
          orderBy: { price: "asc" },
          include: { kos: true },
        });
    if (!room) throw new ApiError("Maaf, kamar di kos ini sudah penuh", 409);

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

    return { payment: toPayment(payment, order), kosName: room.kos.name };
  }, { isolationLevel: "Serializable" });
}

export async function markPaymentPaid(paymentId: string, registrationId: string): Promise<Payment> {
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

export async function confirmPayment(paymentId: string, ownerId: string): Promise<Payment> {
  return prisma.$transaction(async (tx) => {
    const now = new Date();
    const payment = await tx.payment.findUnique({
      where: { id: paymentId },
      include: {
        order: {
          include: { room: { include: { kos: { include: { rooms: true } } } } },
        },
      },
    });
    if (!payment || payment.order.room.kos.owner_id !== ownerId) {
      throw new ApiError("Pembayaran tidak ditemukan", 404);
    }
    if (payment.expired_at <= now) throw new ApiError("Waktu pembayaran sudah habis", 409);
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
      include: { room: { include: { kos: { include: { rooms: true } } } } },
    });
    await tx.room.update({
      where: { id: order.room_id },
      data: { status: RoomStatusEnum.occupied },
    });
    return toPayment(updatedPayment, order);
  }, { isolationLevel: "Serializable" });
}

export async function setRoomNumber(registrationId: string, value: unknown, ownerId: string): Promise<AccountInfo> {
  const roomNumber = cleanString(value);
  if (roomNumber.length > 20) throw new ApiError("Nomor kamar maksimal 20 karakter", 400);

  const user = await prisma.user.findUnique({
    where: { id: registrationId },
    include: {
      orders: {
        where: { room: { kos: { owner_id: ownerId } } },
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
  status: TenantStatus;
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

export async function getUserDashboard(registrationId: string): Promise<UserDashboardData | null> {
  const user = await prisma.user.findFirst({
    where: { id: registrationId, role: "client" },
    include: {
      orders: {
        orderBy: { created_at: "asc" },
        include: { payments: true, room: { include: { kos: { include: { rooms: true } } } } },
      },
    },
  });
  if (!user) return null;

  const latestOrder = user.orders[user.orders.length - 1] ?? null;
  const mine = user.orders.flatMap((order) => order.payments.map((payment) => toPayment(payment, order)));
  const latest = mine[mine.length - 1] ?? null;
  const lastLunas = [...mine].reverse().find((payment) => payment.status === "lunas") ?? null;
  const kos = latestOrder ? toKos(latestOrder.room.kos) : null;
  const account = toAccount(user, latestOrder?.room.room_number ?? null);
  const orderHistory: ClientOrderHistory[] = user.orders.map((order) => ({
    orderId: order.id,
    kosId: order.room.kos_id,
    kosName: order.room.kos.name,
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
  status: TenantStatus;
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
  payments: { id: string; amount: number; status: PaymentStatus; expiredAt: string }[];
};

export async function getAdminOverview(ownerId: string): Promise<AdminOverview> {
  const [users, rooms] = await Promise.all([
    prisma.user.findMany({
      where: {
        role: "client",
        orders: { some: { room: { kos: { owner_id: ownerId } } } },
      },
      include: {
        orders: {
          where: { room: { kos: { owner_id: ownerId } } },
          include: { room: { include: { kos: true } }, payments: true },
          orderBy: { created_at: "asc" },
        },
      },
    }),
    prisma.room.findMany({ where: { kos: { owner_id: ownerId } }, include: { kos: true } }),
  ]);
  const rows: TenantRow[] = users.map((user) => {
    const orders = user.orders;
    const latestOrder = orders[orders.length - 1] ?? null;
    const latestPayment = latestOrder?.payments
      .slice()
      .sort((left, right) => right.expired_at.getTime() - left.expired_at.getTime())[0] ?? null;
    const paidPayments = orders
      .filter((order) => order.status === OrderStatusEnum.confirmed)
      .flatMap((order) => order.payments)
      .filter((payment) => payment.status === "paid" && payment.paid_at)
      .sort((left, right) => right.paid_at!.getTime() - left.paid_at!.getTime());
    const lastPaidAt = paidPayments[0]?.paid_at?.toISOString() ?? null;
    const paymentStatus: PaymentStatus | null = latestPayment?.status === PaymentStatusEnum.paid
      ? latestOrder?.status === OrderStatusEnum.confirmed
        ? "lunas"
        : "menunggu_konfirmasi"
      : latestPayment?.status === PaymentStatusEnum.unpaid
        ? latestPayment.method === "manual_transfer"
          ? "menunggu_konfirmasi"
          : "menunggu_pembayaran"
        : null;
    const status: TenantStatus = !latestOrder || latestOrder.status === "cancelled"
      ? "belum_pilih_kos"
      : paymentStatus === "lunas"
        ? lastPaidAt && addOneMonth(lastPaidAt) < new Date().toISOString()
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
      kosName: latestOrder?.room.kos.name ?? null,
      roomNumber: latestOrder?.room.room_number ?? null,
      status,
      amount: latestPayment ? latestPayment.amount.toNumber() : null,
      paymentId: paymentStatus === "menunggu_konfirmasi" || paymentStatus === "lunas"
        ? latestPayment?.id ?? null
        : null,
      paymentStatus,
      lastPaidAt,
      dueAt: lastPaidAt ? addOneMonth(lastPaidAt) : null,
    };
  });

  const orders: AdminOrderRow[] = users.flatMap((user) =>
    user.orders.map((order) => ({
      orderId: order.id,
      clientName: user.name,
      clientEmail: user.email,
      kosName: order.room.kos.name,
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
    }))
  ).sort((left, right) => right.startDate.localeCompare(left.startDate));

  rows.sort((a, b) => a.name.localeCompare(b.name, "id"));
  const count = (status: TenantStatus) => rows.filter((row) => row.status === status).length;
  const kosSummary = new Map<string, AdminOverview["kosSummary"][number]>();
  for (const room of rooms) {
    const current = kosSummary.get(room.kos_id);
    const roomsLeft = room.status === "available" ? 1 : 0;
    const price = room.price.toNumber();
    if (current) {
      current.roomsLeft += roomsLeft;
      current.price = Math.min(current.price, price);
    } else {
      kosSummary.set(room.kos_id, {
        id: room.kos_id,
        name: room.kos.name,
        roomsLeft,
        price,
      });
    }
  }
  return {
    rows,
    orders,
    stats: {
      lunas: count("lunas"),
      menungguKonfirmasi: count("menunggu_konfirmasi"),
      terlambat: count("terlambat"),
      belumBayar: count("belum_bayar"),
      totalKamarTersisa: rooms.filter((room) => room.status === "available").length,
    },
    kosSummary: [...kosSummary.values()],
  };
}
