-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "RoleEnum" AS ENUM ('client', 'owner');

-- CreateEnum
CREATE TYPE "RoomStatusEnum" AS ENUM ('available', 'occupied', 'maintenance');

-- CreateEnum
CREATE TYPE "OrderStatusEnum" AS ENUM ('pending', 'confirmed', 'cancelled');

-- CreateEnum
CREATE TYPE "PaymentStatusEnum" AS ENUM ('unpaid', 'paid', 'refunded');

-- CreateEnum
CREATE TYPE "ReminderTypeEnum" AS ENUM ('payment', 'checkin', 'review');

-- CreateEnum
CREATE TYPE "ReminderStatusEnum" AS ENUM ('pending', 'sent', 'failed');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "role" "RoleEnum" NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Room" (
    "id" TEXT NOT NULL,
    "room_number" TEXT NOT NULL,
    "name" TEXT,
    "area" TEXT,
    "price" DECIMAL(10,2) NOT NULL,
    "gender" TEXT,
    "room_size" TEXT,
    "bathroom" TEXT,
    "description" TEXT,
    "facilities" TEXT[],
    "photos" TEXT[],
    "status" "RoomStatusEnum" NOT NULL,

    CONSTRAINT "Room_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL,
    "room_id" TEXT NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "status" "OrderStatusEnum" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "client_id" TEXT NOT NULL,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "gateway_transaction_id" TEXT,
    "method" TEXT,
    "status" "PaymentStatusEnum" NOT NULL DEFAULT 'unpaid',
    "url" TEXT,
    "snap_token" TEXT,
    "order_id" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "raw_response" JSONB,
    "paid_at" TIMESTAMP(3),
    "expired_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Review" (
    "id" TEXT NOT NULL,
    "room_id" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "client_id" TEXT NOT NULL,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Reminder" (
    "id" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "client_id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "reminder_type" "ReminderTypeEnum" NOT NULL,
    "message" TEXT NOT NULL,
    "status" "ReminderStatusEnum" NOT NULL DEFAULT 'pending',
    "scheduled_at" TIMESTAMP(3) NOT NULL,
    "sent_at" TIMESTAMP(3),

    CONSTRAINT "Reminder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WebhookLog" (
    "id" TEXT NOT NULL,
    "order_id" TEXT,
    "payload" JSONB NOT NULL,
    "event_type" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WebhookLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE INDEX "Room_status_idx" ON "Room"("status");

-- CreateIndex
CREATE INDEX "Room_room_number_idx" ON "Room"("room_number");

-- CreateIndex
CREATE INDEX "Order_room_id_idx" ON "Order"("room_id");

-- CreateIndex
CREATE INDEX "Order_client_id_created_at_idx" ON "Order"("client_id", "created_at");

-- CreateIndex
CREATE INDEX "Payment_order_id_idx" ON "Payment"("order_id");

-- CreateIndex
CREATE INDEX "Review_room_id_created_at_idx" ON "Review"("room_id", "created_at");

-- CreateIndex
CREATE INDEX "Review_client_id_idx" ON "Review"("client_id");

-- CreateIndex
CREATE INDEX "Reminder_order_id_idx" ON "Reminder"("order_id");

-- CreateIndex
CREATE INDEX "Reminder_client_id_idx" ON "Reminder"("client_id");

-- CreateIndex
CREATE INDEX "Reminder_status_scheduled_at_idx" ON "Reminder"("status", "scheduled_at");

-- CreateIndex
CREATE INDEX "WebhookLog_order_id_idx" ON "WebhookLog"("order_id");

-- CreateIndex
CREATE INDEX "WebhookLog_event_type_created_at_idx" ON "WebhookLog"("event_type", "created_at");

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "Room"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "Room"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reminder" ADD CONSTRAINT "Reminder_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reminder" ADD CONSTRAINT "Reminder_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WebhookLog" ADD CONSTRAINT "WebhookLog_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;
