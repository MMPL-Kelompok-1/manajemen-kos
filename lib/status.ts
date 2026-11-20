// Satu-satunya tempat penurunan status pembayaran dan status penghuni.
import {
  OrderStatusEnum,
  PaymentStatusEnum,
  type Order as PrismaOrder,
  type Payment as PrismaPayment,
} from "@prisma/client";
import { addOneMonth } from "@/lib/format";
import type { PaymentStatus } from "@/lib/payment";
import type { KosStatus } from "@/lib/types";

type PaymentLike = Pick<PrismaPayment, "status" | "method" | "paid_at" | "expired_at">;
type OrderLike = Pick<PrismaOrder, "status">;

export const MANUAL_TRANSFER = "manual_transfer";

export function derivePaymentStatus(payment: PaymentLike, order: OrderLike): PaymentStatus {
  if (payment.status === PaymentStatusEnum.paid) {
    return order.status === OrderStatusEnum.confirmed ? "lunas" : "menunggu_konfirmasi";
  }
  if (payment.method === MANUAL_TRANSFER && order.status === OrderStatusEnum.pending) {
    return "menunggu_konfirmasi";
  }
  return "menunggu_pembayaran";
}

export type TenantStatusSummary<P extends PaymentLike> = {
  status: KosStatus;
  latestPayment: P | null;
  paymentStatus: PaymentStatus | null;
  lastPaidAt: string | null;
  dueAt: string | null;
};

// `orders` harus urut dari yang paling lama (created_at asc).
export function deriveTenantStatus<P extends PaymentLike>(
  orders: (OrderLike & { payments: P[] })[],
  now: Date = new Date(),
): TenantStatusSummary<P> {
  const latestOrder = orders[orders.length - 1] ?? null;
  const latestPayment =
    latestOrder?.payments.reduce<P | null>(
      (latest, payment) =>
        !latest || payment.expired_at.getTime() > latest.expired_at.getTime() ? payment : latest,
      null,
    ) ?? null;
  const paymentStatus =
    latestOrder && latestPayment ? derivePaymentStatus(latestPayment, latestOrder) : null;

  let lastPaid: Date | null = null;
  for (const order of orders) {
    for (const payment of order.payments) {
      if (derivePaymentStatus(payment, order) !== "lunas" || !payment.paid_at) continue;
      if (!lastPaid || payment.paid_at > lastPaid) lastPaid = payment.paid_at;
    }
  }
  const lastPaidAt = lastPaid?.toISOString() ?? null;
  const dueAt = lastPaidAt ? addOneMonth(lastPaidAt) : null;

  let status: KosStatus;
  if (!latestOrder || !latestPayment || latestOrder.status === OrderStatusEnum.cancelled) {
    status = "belum_pilih_kos";
  } else if (paymentStatus === "lunas") {
    status = dueAt && dueAt < now.toISOString() ? "terlambat" : "lunas";
  } else if (paymentStatus === "menunggu_konfirmasi") {
    status = "menunggu_konfirmasi";
  } else {
    status = "belum_bayar";
  }

  return { status, latestPayment, paymentStatus, lastPaidAt, dueAt };
}
