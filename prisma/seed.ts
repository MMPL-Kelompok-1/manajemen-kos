import { PrismaClient, RoleEnum, RoomStatusEnum } from '@prisma/client';
import { hashPassword } from '../lib/password';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function main() {
  console.log('Menjalankan seeder...');
  const ownerPassword = process.env.OWNER_PASSWORD;
  if (!ownerPassword) throw new Error('OWNER_PASSWORD harus diatur sebelum menjalankan seeder.');
  const ownerEmail = process.env.OWNER_EMAIL || 'owner@atmint.com';
  const hashedOwnerPassword = await hashPassword(ownerPassword);

  // 1. Baca data dari JSON
  const kosDataPath = path.join(process.cwd(), 'data', 'kos.json');
  const kosData = JSON.parse(fs.readFileSync(kosDataPath, 'utf-8'));

  // 2. Buat satu User dengan role Owner
  const owner = await prisma.user.upsert({
    where: { email: ownerEmail },
    update: {
      name: process.env.OWNER_NAME || 'Juragan Kos',
      phone: process.env.OWNER_PHONE || '081234567890',
      password: hashedOwnerPassword,
      role: RoleEnum.owner,
    },
    create: {
      name: 'Juragan Kos',
      email: ownerEmail,
      password: hashedOwnerPassword,
      phone: process.env.OWNER_PHONE || '081234567890',
      role: RoleEnum.owner,
    },
  });

  console.log(`✅ Owner berhasil dibuat: ${owner.email}`);

  // 3. Mapping data langsung ke entitas Room (Kamar)
  for (const item of kosData) {
    const statusKamar = item.roomsLeft > 0 ? RoomStatusEnum.available : RoomStatusEnum.occupied;

    await prisma.room.create({
      data: {
        room_number: `A-${Math.floor(Math.random() * 100)}`,
        name: item.name,
        area: item.area || 'Dekat Kampus',
        price: item.price,
        gender: item.gender || 'Campur',
        room_size: item.roomSize || '3 x 4 m',
        bathroom: item.bathroom || 'Dalam',
        description: item.description || '',
        facilities: item.facilities || [],
        photos: item.photos || [],
        status: statusKamar,
      },
    });

    console.log(`✅ Kamar terdaftar: ${item.name}`);
  }

  console.log('🌱 Seeding selesai!');
}

main()
  .catch((e) => {
    console.error('Gagal melakukan seeding:');
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
