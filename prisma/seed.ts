import { PrismaClient, RoleEnum, RoomStatusEnum } from '@prisma/client';
import { hashPassword } from '../lib/password';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function main() {
  console.log('Menjalankan seeder untuk skema B2B2C...');
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

  // 3. Mapping data dari kos.json ke relasi Kos dan Room
  for (const item of kosData) {
    // Buat entitas properti Kos
    const kos = await prisma.kos.create({
      data: {
        name: item.name,
        address: item.address || 'Alamat tidak tersedia',
        phone: '081234567890', // Dummy phone
        background_img: item.photos && item.photos.length > 0 ? item.photos[0] : '',
        owner_id: owner.id,
      },
    });

    // Buat entitas Kamar di dalam Kos tersebut
    const statusKamar = item.roomsLeft > 0 ? RoomStatusEnum.available : RoomStatusEnum.occupied;
    
    await prisma.room.create({
      data: {
        room_number: `A-${Math.floor(Math.random() * 100)}`, // Generate nomor kamar acak
        price: item.price,
        facilities: item.facilities || [],
        status: statusKamar,
        kos_id: kos.id,
      },
    });

    console.log(`✅ Properti terdaftar: ${kos.name} beserta kamarnya.`);
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