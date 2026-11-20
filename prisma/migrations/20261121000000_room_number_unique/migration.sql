-- DropIndex
DROP INDEX "Room_room_number_idx";

-- CreateIndex
CREATE UNIQUE INDEX "Room_room_number_key" ON "Room"("room_number");
