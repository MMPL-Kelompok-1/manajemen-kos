import "dotenv/config";
import fs from "fs";
import path from "path";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, RoleEnum, RoomStatusEnum } from "@prisma/client";
import { Pool } from "pg";
import { hashPassword } from "../lib/password";

type SeedKos = {
  name: string;
  area?: string;
  price: number;
  gender?: string;
  roomSize?: string;
  bathroom?: string;
  description?: string;
  facilities?: string[];
  photos?: string[];
  roomsLeft?: number;
};

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

function readKosData(): SeedKos[] {
  const candidates = [
    path.join(process.cwd(), "prisma", "seed-data", "kos.json"),
    path.join(process.cwd(), "data", "kos.json"),
  ];
  const file = candidates.find((candidate) => fs.existsSync(candidate));
  if (!file) throw new Error(`Data kos tidak ditemukan. Dicari di: ${candidates.join(", ")}`);
  return JSON.parse(fs.readFileSync(file, "utf-8")) as SeedKos[];
}

async function main() {
  console.log("Menjalankan seeder...");
  const ownerPassword = process.env.OWNER_PASSWORD;
  if (!ownerPassword) throw new Error("OWNER_PASSWORD harus diatur sebelum menjalankan seeder.");
  const ownerEmail = process.env.OWNER_EMAIL || "owner@atmint.com";
  const ownerName = process.env.OWNER_NAME || "Juragan Kos";
  const ownerPhone = process.env.OWNER_PHONE || "081234567890";
  const password = await hashPassword(ownerPassword);

  const owner = await prisma.user.upsert({
    where: { email: ownerEmail },
    update: { name: ownerName, phone: ownerPhone, password, role: RoleEnum.owner },
    create: { name: ownerName, email: ownerEmail, phone: ownerPhone, password, role: RoleEnum.owner },
  });
  console.log(`Owner siap: ${owner.email}`);

  // Nomor kamar unik dan stabil (A-01, A-02, ...) sehingga seeder aman dijalankan ulang.
  const kosData = readKosData();
  for (const [index, item] of kosData.entries()) {
    const roomNumber = `A-${String(index + 1).padStart(2, "0")}`;
    const data = {
      name: item.name,
      area: item.area || "Dekat Kampus",
      price: item.price,
      gender: item.gender || "Campur",
      room_size: item.roomSize || "3 x 4 m",
      bathroom: item.bathroom || "Dalam",
      description: item.description || "",
      facilities: item.facilities || [],
      photos: item.photos || [],
      status: (item.roomsLeft ?? 1) > 0 ? RoomStatusEnum.available : RoomStatusEnum.occupied,
    };
    await prisma.room.upsert({
      where: { room_number: roomNumber },
      update: data,
      create: { room_number: roomNumber, ...data },
    });
    console.log(`Kamar ${roomNumber} terdaftar: ${item.name}`);
  }

  console.log("Seeding selesai.");
}

main()
  .catch((error) => {
    console.error("Gagal melakukan seeding:");
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
