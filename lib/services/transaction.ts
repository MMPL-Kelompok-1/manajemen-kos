import { OrderStatusEnum, PaymentStatusEnum, RoleEnum } from "@prisma/client";
import { currentJakartaMonthKey, jakartaMonthBounds } from "@/lib/format";
import { roomDisplayName, toPayment } from "@/lib/mappers";
import { prisma } from "@/lib/prisma";
import { MANUAL_TRANSFER } from "@/lib/status";
import type { TransactionManagementData, TransactionRow } from "@/lib/types";

const TRANSACTION_LIMIT = 300;

export async function getTransactionManagementData(): Promise<TransactionManagementData> {
  const month = currentJakartaMonthKey();
  const { start, end } = jakartaMonthBounds(month);

  const [payments, received, pending, unpaid, totalCount] = await Promise.all([
    prisma.payment.findMany({
      where: { order: { client: { role: RoleEnum.client } } },
      orderBy: { expired_at: "desc" },
      take: TRANSACTION_LIMIT,
      select: {
        id: true,
        amount: true,
        status: true,
        method: true,
        paid_at: true,
        expired_at: true,
        order: {
          select: {
            id: true,
            status: true,
            created_at: true,
            client_id: true,
            room_id: true,
            client: { select: { name: true, email: true } },
            room: { select: { name: true, room_number: true } },
          },
        },
      },
    }),
    prisma.payment.aggregate({
      where: { status: PaymentStatusEnum.paid, paid_at: { gte: start, lt: end } },
      _sum: { amount: true },
    }),
    prisma.payment.aggregate({
      where: {
        status: PaymentStatusEnum.unpaid,
        method: MANUAL_TRANSFER,
        order: { status: OrderStatusEnum.pending },
      },
      _sum: { amount: true },
      _count: true,
    }),
    prisma.payment.aggregate({
      where: {
        status: PaymentStatusEnum.unpaid,
        order: { status: OrderStatusEnum.pending },
        OR: [{ method: null }, { method: { not: MANUAL_TRANSFER } }],
      },
      _sum: { amount: true },
      _count: true,
    }),
    prisma.payment.count({ where: { order: { client: { role: RoleEnum.client } } } }),
  ]);

  const now = new Date();
  const rows: TransactionRow[] = payments.map((payment) => {
    const derived = toPayment(payment, payment.order);
    return {
      id: payment.id,
      orderId: payment.order.id,
      tenantId: payment.order.client_id,
      tenantName: payment.order.client.name,
      tenantEmail: payment.order.client.email,
      kosName: roomDisplayName(payment.order.room),
      roomNumber: payment.order.room.room_number,
      amount: payment.amount.toNumber(),
      status: derived.status,
      method: payment.method,
      createdAt: payment.order.created_at.toISOString(),
      paidAt: payment.paid_at?.toISOString() ?? null,
      expiredAt: payment.expired_at.toISOString(),
      orderStatus: payment.order.status,
      canConfirm:
        payment.status === PaymentStatusEnum.unpaid &&
        payment.method === MANUAL_TRANSFER &&
        payment.order.status === OrderStatusEnum.pending &&
        payment.expired_at > now,
    };
  });

  return {
    rows,
    stats: {
      receivedThisMonth: received._sum.amount?.toNumber() ?? 0,
      pendingAmount: pending._sum.amount?.toNumber() ?? 0,
      pendingCount: pending._count,
      unpaidAmount: unpaid._sum.amount?.toNumber() ?? 0,
      unpaidCount: unpaid._count,
      totalCount,
    },
  };
}
