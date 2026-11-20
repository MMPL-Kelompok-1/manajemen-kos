import { RoleEnum, RoomStatusEnum } from "@prisma/client";
import { ApiError } from "@/lib/errors";
import { roomDisplayName, toAccount, toPayment, toRoomAsKos } from "@/lib/mappers";
import { getBankInfo } from "@/lib/payment";
import { prisma } from "@/lib/prisma";
import { deriveTenantStatus } from "@/lib/status";
import type {
  AdminOrderRow,
  AdminOverview,
  ClientOrderHistory,
  TenantRow,
  UserDashboardData,
} from "@/lib/types";

// Batas jumlah data yang dimuat dashboard admin dalam satu request.
const ADMIN_CLIENT_LIMIT = 200;
const ADMIN_RECENT_ORDER_LIMIT = 30;

const paymentSelect = {
  id: true,
  amount: true,
  status: true,
  method: true,
  paid_at: true,
  expired_at: true,
} as const;

export async function getUserDashboard(registrationId: string): Promise<UserDashboardData | null> {
  const user = await prisma.user.findFirst({
    where: { id: registrationId, role: RoleEnum.client },
    include: {
      orders: {
        orderBy: { created_at: "asc" },
        include: { payments: true, room: true },
      },
    },
  });
  if (!user) return null;

  const latestOrder = user.orders[user.orders.length - 1] ?? null;
  const summary = deriveTenantStatus(user.orders);

  const orderHistory: ClientOrderHistory[] = user.orders.map((order) => ({
    orderId: order.id,
    kosId: order.room.id,
    kosName: roomDisplayName(order.room),
    roomNumber: order.room.room_number,
    startDate: order.start_date.toISOString(),
    endDate: order.end_date.toISOString(),
    status: order.status,
    payments: order.payments.map((payment) => toPayment(payment, order)),
  }));

  return {
    account: toAccount(user, latestOrder?.room.room_number ?? null),
    kos: latestOrder ? toRoomAsKos(latestOrder.room) : null,
    payment:
      latestOrder && summary.latestPayment ? toPayment(summary.latestPayment, latestOrder) : null,
    orderHistory,
    status: summary.status,
    lastPaidAt: summary.lastPaidAt,
    dueAt: summary.dueAt,
    bank: getBankInfo(),
  };
}

export async function getAdminOverview(ownerId: string): Promise<AdminOverview> {
  const [owner, users, rooms, recentOrders] = await Promise.all([
    prisma.user.findFirst({ where: { id: ownerId, role: RoleEnum.owner }, select: { id: true } }),
    // User tidak punya created_at, jadi "terbaru" diurutkan dari id (cuid kira-kira berurutan waktu).
    prisma.user.findMany({
      where: { role: RoleEnum.client },
      orderBy: { id: "desc" },
      take: ADMIN_CLIENT_LIMIT,
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
            payments: { select: paymentSelect },
          },
        },
      },
    }),
    prisma.room.findMany({
      select: { id: true, name: true, room_number: true, status: true, price: true },
    }),
    prisma.order.findMany({
      where: { client: { role: RoleEnum.client } },
      orderBy: { created_at: "desc" },
      take: ADMIN_RECENT_ORDER_LIMIT,
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
        payments: { select: paymentSelect },
      },
    }),
  ]);
  if (!owner) throw new ApiError("Unauthorized", 403);

  const now = new Date();
  const rows: TenantRow[] = users.map((user) => {
    const latestOrder = user.orders[user.orders.length - 1] ?? null;
    const { status, latestPayment, paymentStatus, lastPaidAt, dueAt } = deriveTenantStatus(
      user.orders,
      now,
    );
    return {
      registrationId: user.id,
      name: user.name,
      phone: user.phone,
      email: user.email,
      kosName: latestOrder ? roomDisplayName(latestOrder.room) : null,
      roomNumber: latestOrder?.room.room_number ?? null,
      status,
      amount: latestPayment ? latestPayment.amount.toNumber() : null,
      paymentId:
        paymentStatus === "menunggu_konfirmasi" || paymentStatus === "lunas"
          ? (latestPayment?.id ?? null)
          : null,
      paymentStatus,
      lastPaidAt,
      dueAt,
    };
  });
  rows.sort((a, b) => a.name.localeCompare(b.name, "id"));

  const orders: AdminOrderRow[] = recentOrders.map((order) => ({
    orderId: order.id,
    clientName: order.client.name,
    clientEmail: order.client.email,
    kosName: roomDisplayName(order.room),
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

  const stats = { lunas: 0, menungguKonfirmasi: 0, terlambat: 0, belumBayar: 0 };
  for (const row of rows) {
    if (row.status === "lunas") stats.lunas++;
    else if (row.status === "menunggu_konfirmasi") stats.menungguKonfirmasi++;
    else if (row.status === "terlambat") stats.terlambat++;
    else if (row.status === "belum_bayar") stats.belumBayar++;
  }

  const kosSummary: AdminOverview["kosSummary"] = rooms.map((room) => ({
    id: room.id,
    name: roomDisplayName(room),
    roomsLeft: room.status === RoomStatusEnum.available ? 1 : 0,
    price: room.price.toNumber(),
  }));

  return {
    rows,
    orders,
    stats: {
      ...stats,
      totalKamarTersisa: kosSummary.reduce((sum, kos) => sum + kos.roomsLeft, 0),
    },
    kosSummary,
  };
}
