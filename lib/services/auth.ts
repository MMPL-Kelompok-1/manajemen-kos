import { OrderStatusEnum, RoleEnum } from "@prisma/client";
import { ApiError } from "@/lib/errors";
import { toAccount } from "@/lib/mappers";
import { hashPassword, verifyPassword } from "@/lib/password";
import { prisma } from "@/lib/prisma";
import type { AccountInfo } from "@/lib/types";
import { EMAIL_RE, MIN_PASSWORD, PHONE_RE, cleanString } from "@/lib/validation";

export async function registerAccount(input: Record<string, unknown>): Promise<AccountInfo> {
  const name = cleanString(input.name);
  const email = cleanString(input.email).toLowerCase();
  const phone = cleanString(input.phone);
  const password = cleanString(input.password);

  if (!name) throw new ApiError("Nama lengkap wajib diisi", 400);
  if (!email || !EMAIL_RE.test(email)) {
    throw new ApiError("Format email tidak valid (harus @gmail.com)", 400);
  }
  if (!phone || !PHONE_RE.test(phone)) {
    throw new ApiError("Format nomor HP tidak valid (harus diawali 08/628, 10-13 digit)", 400);
  }
  if (!password || password.length < MIN_PASSWORD) {
    throw new ApiError(`Kata sandi minimal ${MIN_PASSWORD} karakter`, 400);
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new ApiError("Email sudah terdaftar", 409);

  const user = await prisma.user.create({
    data: { name, email, phone, password: await hashPassword(password), role: RoleEnum.client },
  });
  return toAccount(user);
}

export async function authenticateAccount(input: Record<string, unknown>): Promise<AccountInfo> {
  const email = cleanString(input.email).toLowerCase();
  const password = cleanString(input.password);
  if (!email || !password) throw new ApiError("Email dan kata sandi wajib diisi", 400);

  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      orders: {
        where: { status: OrderStatusEnum.confirmed },
        include: { room: true },
        take: 1,
        orderBy: { created_at: "desc" },
      },
    },
  });
  if (!user || !(await verifyPassword(password, user.password))) {
    throw new ApiError("Email atau kata sandi salah", 401);
  }
  return toAccount(user, user.orders[0]?.room.room_number ?? null);
}
