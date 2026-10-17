// Lapisan data / backend.
// Data disimpan sebagai file JSON di folder /data.
// Untuk production, ganti readCollection/writeCollection dengan database.
import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";
import { connection } from "next/server";
import type { PaymentStatus } from "@/lib/payment";

export type Kos = {
  id: string;
  name: string;
  area: string;
  address: string;
  price: number; // harga per bulan (Rupiah)
  gender: "Putra" | "Putri" | "Campur";
  roomSize: string;
  bathroom: "Dalam" | "Luar";
  roomsLeft: number;
  description: string;
  facilities: string[];
  photos: string[];
};

export type Registration = {
  id: string;
  name: string;
  phone: string;
  email: string;
  createdAt: string;
};

export type Payment = {
  id: string;
  registrationId: string;
  kosId: string;
  amount: number;
  status: PaymentStatus;
  createdAt: string;
  updatedAt: string;
};

export class ApiError extends Error {
  readonly status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

const DATA_DIR = path.join(process.cwd(), "data");
const EMAIL_RE = /^[a-z0-9._%+-]+@gmail\.com$/;
const PHONE_RE = /^(08\d{8,11}|628\d{8,11})$/;

function cleanString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

async function readCollection<T>(name: string): Promise<T[]> {
  // Menandai render sebagai request-time (diperlukan oleh cacheComponents saat membaca file).
  await connection();
  try {
    const raw = await fs.readFile(path.join(DATA_DIR, `${name}.json`), "utf-8");
    return JSON.parse(raw) as T[];
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw error;
  }
}

async function writeCollection<T>(name: string, items: T[]): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  const file = path.join(DATA_DIR, `${name}.json`);
  const tmp = `${file}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(items, null, 2), "utf-8");
  await fs.rename(tmp, file);
}

export async function getKosList(): Promise<Kos[]> {
  return readCollection<Kos>("kos");
}

export async function getKos(id: string): Promise<Kos | null> {
  const list = await readCollection<Kos>("kos");
  return list.find((k) => k.id === id) ?? null;
}

// Pendaftaran: nama, nomor HP, dan Gmail.
// Jika Gmail sudah terdaftar, data pengguna tersebut diperbarui.
export async function registerUser(input: Record<string, unknown>): Promise<Registration> {
  const name = cleanString(input.name);
  const phone = cleanString(input.phone).replace(/[\s\-()]/g, "");
  const email = cleanString(input.email).toLowerCase();

  if (name.length < 3) {
    throw new ApiError("Nama minimal 3 karakter", 400);
  }
  if (!PHONE_RE.test(phone)) {
    throw new ApiError("Nomor HP tidak valid, contoh: 081234567890", 400);
  }
  if (!EMAIL_RE.test(email)) {
    throw new ApiError("Gunakan alamat Gmail (contoh: nama@gmail.com)", 400);
  }

  const registrations = await readCollection<Registration>("registrations");
  const existing = registrations.find((r) => r.email === email);

  if (existing) {
    existing.name = name;
    existing.phone = phone;
    await writeCollection("registrations", registrations);
    return existing;
  }

  const registration: Registration = {
    id: randomUUID(),
    name,
    phone,
    email,
    createdAt: new Date().toISOString(),
  };
  registrations.push(registration);
  await writeCollection("registrations", registrations);
  return registration;
}

// Pembayaran: nominal selalu sama dengan harga kos.
export async function createPayment(input: Record<string, unknown>) {
  const registrationId = cleanString(input.registrationId);
  const kosId = cleanString(input.kosId);

  const registrations = await readCollection<Registration>("registrations");
  if (!registrations.some((r) => r.id === registrationId)) {
    throw new ApiError("Pendaftaran tidak ditemukan. Silakan daftar ulang.", 404);
  }

  const kos = await getKos(kosId);
  if (!kos) {
    throw new ApiError("Kos tidak ditemukan", 404);
  }
  if (kos.roomsLeft <= 0) {
    throw new ApiError("Maaf, kamar di kos ini sudah penuh", 409);
  }

  const now = new Date().toISOString();
  const payment: Payment = {
    id: `PAY-${randomUUID().slice(0, 8).toUpperCase()}`,
    registrationId,
    kosId: kos.id,
    amount: kos.price,
    status: "menunggu_pembayaran",
    createdAt: now,
    updatedAt: now,
  };

  const payments = await readCollection<Payment>("payments");
  payments.push(payment);
  await writeCollection("payments", payments);

  return { payment, kosName: kos.name };
}

export async function markPaymentPaid(id: string): Promise<Payment> {
  const payments = await readCollection<Payment>("payments");
  const payment = payments.find((p) => p.id === id);
  if (!payment) {
    throw new ApiError("Pembayaran tidak ditemukan", 404);
  }
  if (payment.status === "menunggu_pembayaran") {
    payment.status = "menunggu_konfirmasi";
    payment.updatedAt = new Date().toISOString();
    await writeCollection("payments", payments);
  }
  return payment;
}
