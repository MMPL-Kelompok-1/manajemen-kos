import {
  RoomStatusEnum,
  type Order as PrismaOrder,
  type Payment as PrismaPayment,
  type Room as PrismaRoom,
  type User as PrismaUser,
} from "@prisma/client";
import { derivePaymentStatus } from "@/lib/status";
import type { AccountInfo, Kos, Payment } from "@/lib/types";

export function roomDisplayName(room: Pick<PrismaRoom, "name" | "room_number">): string {
  return room.name || `Kamar ${room.room_number}`;
}

export function toAccount(
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

type PaymentInput = Pick<PrismaPayment, "id" | "amount" | "status" | "method" | "paid_at" | "expired_at">;
type OrderInput = Pick<PrismaOrder, "id" | "client_id" | "room_id" | "created_at" | "status">;

export function toPayment(payment: PaymentInput, order: OrderInput): Payment {
  return {
    id: payment.id,
    registrationId: order.client_id,
    kosId: order.room_id,
    amount: payment.amount.toNumber(),
    status: derivePaymentStatus(payment, order),
    createdAt: order.created_at.toISOString(),
    updatedAt: (payment.paid_at ?? payment.expired_at).toISOString(),
    paidAt: payment.paid_at?.toISOString() ?? null,
    expiredAt: payment.expired_at.toISOString(),
  };
}

export function toRoomAsKos(room: PrismaRoom, hasActivePendingOrder = false): Kos {
  const isAvailable = room.status === RoomStatusEnum.available && !hasActivePendingOrder;
  return {
    id: room.id,
    name: roomDisplayName(room),
    area: room.area || "KosanKu",
    address: room.area || "KosanKu",
    price: room.price.toNumber(),
    gender: room.gender || "Campur",
    roomSize: room.room_size || "3 x 4 m",
    bathroom: room.bathroom || "Dalam",
    roomsLeft: isAvailable ? 1 : 0,
    description: room.description || "Fasilitas lengkap dan nyaman.",
    facilities: room.facilities,
    photos: room.photos.length > 0 ? room.photos : ["/images/hero.jpg"],
    status: room.status,
  };
}
