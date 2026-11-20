import { OrderStatusEnum, PaymentStatusEnum, RoomStatusEnum } from "@prisma/client";
import { ApiError } from "@/lib/errors";
import { roomDisplayName, toPayment } from "@/lib/mappers";
import { prisma } from "@/lib/prisma";
import { MANUAL_TRANSFER } from "@/lib/status";
import type { Payment } from "@/lib/types";

const PAYMENT_WINDOW_MS = 24 * 60 * 60 * 1000;

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
        throw new ApiError("Anda masih memiliki pembayaran yang belum selesai.", 409);
      }

      const room = await tx.room.findUnique({ where: { id: kosId } });
      if (!room) throw new ApiError("Kamar tidak ditemukan", 404);

      const existingConfirmedOrder = orders.findLast(
        (order) => order.status === OrderStatusEnum.confirmed,
      );
      if (existingConfirmedOrder && existingConfirmedOrder.room_id !== room.id) {
        throw new ApiError("Anda sudah menempati kamar lain.", 409);
      }
      if (!existingConfirmedOrder && room.status !== RoomStatusEnum.available) {
        throw new ApiError("Maaf, kamar ini sudah penuh / tidak tersedia", 409);
      }

      const endDate = new Date(now);
      endDate.setMonth(endDate.getMonth() + 1);
      const order = await tx.order.create({
        data: {
          client_id: registrationId,
          room_id: room.id,
          start_date: now,
          end_date: endDate,
          status: OrderStatusEnum.pending,
          payments: {
            create: {
              status: PaymentStatusEnum.unpaid,
              amount: room.price,
              expired_at: new Date(now.getTime() + PAYMENT_WINDOW_MS),
            },
          },
        },
        include: { payments: true },
      });
      const payment = order.payments[0];
      if (!payment) throw new Error("Payment tidak berhasil dibuat.");

      return { payment: toPayment(payment, order), kosName: roomDisplayName(room) };
    },
    { isolationLevel: "Serializable" },
  );
}

// Penghuni menandai tagihannya sudah ditransfer. Update dilakukan dengan satu
// updateMany bersyarat agar tidak ada celah antara pengecekan dan penulisan.
export async function markPaymentPaid(paymentId: string, registrationId: string): Promise<Payment> {
  const now = new Date();
  const { count } = await prisma.payment.updateMany({
    where: {
      id: paymentId,
      status: PaymentStatusEnum.unpaid,
      expired_at: { gt: now },
      order: { client_id: registrationId, status: OrderStatusEnum.pending },
    },
    data: { method: MANUAL_TRANSFER },
  });

  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: { order: true },
  });
  if (!payment || payment.order.client_id !== registrationId) {
    throw new ApiError("Pembayaran tidak ditemukan", 404);
  }
  if (count === 0 && payment.status === PaymentStatusEnum.unpaid) {
    if (payment.expired_at <= now) throw new ApiError("Waktu pembayaran sudah habis", 409);
    if (payment.order.status !== OrderStatusEnum.pending) {
      throw new ApiError("Pembayaran ini sudah tidak aktif", 409);
    }
  }
  return toPayment(payment, payment.order);
}

export async function confirmPayment(paymentId: string, ownerId: string): Promise<Payment> {
  return prisma.$transaction(
    async (tx) => {
      const owner = await tx.user.findFirst({ where: { id: ownerId, role: "owner" } });
      if (!owner) throw new ApiError("Unauthorized", 403);

      const now = new Date();
      const payment = await tx.payment.findUnique({
        where: { id: paymentId },
        include: { order: true },
      });
      if (!payment) throw new ApiError("Pembayaran tidak ditemukan", 404);
      if (payment.expired_at <= now) throw new ApiError("Waktu pembayaran sudah habis", 409);
      if (payment.status !== PaymentStatusEnum.unpaid) {
        throw new ApiError("Pembayaran ini sudah diproses", 409);
      }
      if (payment.order.status !== OrderStatusEnum.pending) {
        throw new ApiError("Pesanan ini sudah tidak menunggu konfirmasi", 409);
      }
      if (payment.method !== MANUAL_TRANSFER) {
        throw new ApiError("Client belum mengirim konfirmasi pembayaran", 409);
      }

      const updatedPayment = await tx.payment.update({
        where: { id: paymentId },
        data: { status: PaymentStatusEnum.paid, paid_at: now },
      });
      const order = await tx.order.update({
        where: { id: payment.order_id },
        data: { status: OrderStatusEnum.confirmed },
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
