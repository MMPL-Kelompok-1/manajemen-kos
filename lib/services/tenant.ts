import { RoleEnum } from "@prisma/client";
import { roomDisplayName, toPayment } from "@/lib/mappers";
import { prisma } from "@/lib/prisma";
import { deriveTenantStatus } from "@/lib/status";
import type {
  ClientOrderHistory,
  TenantDetail,
  TenantManagementData,
  TenantRow,
} from "@/lib/types";

// Batas data awal daftar penghuni. Detail satu penghuni tetap memuat semua riwayat.
const TENANT_LIMIT = 200;

const paymentSelect = {
  id: true,
  amount: true,
  status: true,
  method: true,
  paid_at: true,
  expired_at: true,
} as const;

export async function getTenantManagementData(): Promise<TenantManagementData> {
  const users = await prisma.user.findMany({
    where: { role: RoleEnum.client },
    take: TENANT_LIMIT,
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
  });

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
      paymentId: paymentStatus === "menunggu_konfirmasi" ? (latestPayment?.id ?? null) : null,
      paymentStatus,
      lastPaidAt,
      dueAt,
    };
  });
  rows.sort((a, b) => a.name.localeCompare(b.name, "id"));

  const stats = {
    total: rows.length,
    lunas: 0,
    menungguKonfirmasi: 0,
    terlambat: 0,
    belumBayar: 0,
    belumPilihKos: 0,
  };
  for (const row of rows) {
    if (row.status === "lunas") stats.lunas++;
    else if (row.status === "menunggu_konfirmasi") stats.menungguKonfirmasi++;
    else if (row.status === "terlambat") stats.terlambat++;
    else if (row.status === "belum_bayar") stats.belumBayar++;
    else stats.belumPilihKos++;
  }

  return { rows, stats };
}

export async function getTenantDetail(tenantId: string): Promise<TenantDetail | null> {
  const user = await prisma.user.findFirst({
    where: { id: tenantId, role: RoleEnum.client },
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

  const orders: ClientOrderHistory[] = user.orders.map((order) => ({
    orderId: order.id,
    kosId: order.room.id,
    kosName: roomDisplayName(order.room),
    roomNumber: order.room.room_number,
    startDate: order.start_date.toISOString(),
    endDate: order.end_date.toISOString(),
    status: order.status,
    payments: order.payments
      .slice()
      .sort((a, b) => b.expired_at.getTime() - a.expired_at.getTime())
      .map((payment) => toPayment(payment, order)),
  }));

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    status: summary.status,
    lastPaidAt: summary.lastPaidAt,
    dueAt: summary.dueAt,
    kosName: latestOrder ? roomDisplayName(latestOrder.room) : null,
    roomNumber: latestOrder?.room.room_number ?? null,
    amount: summary.latestPayment ? summary.latestPayment.amount.toNumber() : null,
    paymentId:
      summary.paymentStatus === "menunggu_konfirmasi" ? (summary.latestPayment?.id ?? null) : null,
    paymentStatus: summary.paymentStatus,
    orders,
  };
}
