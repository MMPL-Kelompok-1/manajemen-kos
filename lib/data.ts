// Lapisan data / backend.
// Data disimpan sebagai file JSON di folder /data.
// Untuk production, ganti readCollection/writeCollection dengan database.
import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";
import { connection } from "next/server";
import { BANK_INFO, type BankInfo, type PaymentStatus } from "@/lib/payment";
import { hashPassword, verifyPassword } from "@/lib/password";
import { addOneMonth } from "@/lib/format";

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

// Akun penghuni / calon penghuni. Koleksi "registrations" dipakai untuk kompatibilitas data lama.
export type Registration = {
  id: string;
  name: string;
  phone: string;
  email: string;
  passwordHash?: string;
  roomNumber?: string | null; // nomor kamar, diisi admin
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
  paidAt: string | null; // tanggal pembayaran dikonfirmasi lunas
};

export type AccountInfo = {
  id: string;
  name: string;
  email: string;
  phone: string;
  roomNumber: string | null;
};

// Status yang ditampilkan ke admin dan penghuni.
export type TenantStatus =
  | "belum_pilih_kos"
  | "belum_bayar"
  | "menunggu_konfirmasi"
  | "lunas"
  | "terlambat";

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
const MIN_PASSWORD = 8;

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

function toAccount(reg: Registration): AccountInfo {
  return {
    id: reg.id,
    name: reg.name,
    email: reg.email,
    phone: reg.phone,
    roomNumber: reg.roomNumber ?? null,
  };
}

// ---------- Kos ----------

export async function getKosList(): Promise<Kos[]> {
  return readCollection<Kos>("kos");
}

export async function getKos(id: string): Promise<Kos | null> {
  const list = await readCollection<Kos>("kos");
  return list.find((k) => k.id === id) ?? null;
}

// ---------- Akun ----------

function parseAccountFields(input: Record<string, unknown>) {
  const name = cleanString(input.name);
  const phone = cleanString(input.phone).replace(/[\s\-()]/g, "");
  const email = cleanString(input.email).toLowerCase();

  if (name.length < 3) throw new ApiError("Nama minimal 3 karakter", 400);
  if (!PHONE_RE.test(phone)) {
    throw new ApiError("Nomor HP tidak valid, contoh: 081234567890", 400);
  }
  if (!EMAIL_RE.test(email)) {
    throw new ApiError("Gunakan alamat Gmail (contoh: nama@gmail.com)", 400);
  }
  return { name, phone, email };
}

export async function registerAccount(input: Record<string, unknown>): Promise<AccountInfo> {
  const { name, phone, email } = parseAccountFields(input);
  const password = typeof input.password === "string" ? input.password : "";
  if (password.length < MIN_PASSWORD) {
    throw new ApiError(`Kata sandi minimal ${MIN_PASSWORD} karakter`, 400);
  }

  const registrations = await readCollection<Registration>("registrations");
  if (registrations.some((r) => r.email === email)) {
    throw new ApiError("Gmail ini sudah terdaftar. Silakan masuk.", 409);
  }

  const registration: Registration = {
    id: randomUUID(),
    name,
    phone,
    email,
    passwordHash: hashPassword(password),
    roomNumber: null,
    createdAt: new Date().toISOString(),
  };
  registrations.push(registration);
  await writeCollection("registrations", registrations);
  return toAccount(registration);
}

export async function authenticateUser(input: Record<string, unknown>): Promise<AccountInfo> {
  const email = cleanString(input.email).toLowerCase();
  const password = typeof input.password === "string" ? input.password : "";

  const registrations = await readCollection<Registration>("registrations");
  const user = registrations.find((r) => r.email === email);
  if (!user || !verifyPassword(password, user.passwordHash)) {
    throw new ApiError("Gmail atau kata sandi salah", 401);
  }
  return toAccount(user);
}

export async function getAccount(id: string): Promise<AccountInfo | null> {
  const registrations = await readCollection<Registration>("registrations");
  const reg = registrations.find((r) => r.id === id);
  return reg ? toAccount(reg) : null;
}

// ---------- Pembayaran ----------

// Status turunan dari riwayat pembayaran seorang penghuni.
function deriveStatus(latest: Payment | null, lastLunas: Payment | null): TenantStatus {
  if (!latest) return "belum_pilih_kos";
  if (latest.status === "menunggu_pembayaran") return "belum_bayar";
  if (latest.status === "menunggu_konfirmasi") return "menunggu_konfirmasi";
  if (lastLunas?.paidAt && addOneMonth(lastLunas.paidAt) < new Date().toISOString()) {
    return "terlambat";
  }
  return "lunas";
}

// Membuat tagihan. Satu penghuni hanya boleh punya satu tagihan yang belum lunas,
// dan perpanjangan hanya untuk kos yang sama dengan yang sudah ditempati.
export async function createPayment(registrationId: string, kosId: string) {
  const registrations = await readCollection<Registration>("registrations");
  if (!registrations.some((r) => r.id === registrationId)) {
    throw new ApiError("Akun tidak ditemukan. Silakan masuk ulang.", 404);
  }

  const payments = await readCollection<Payment>("payments");
  const mine = payments.filter((p) => p.registrationId === registrationId);
  if (mine.some((p) => p.status !== "lunas")) {
    throw new ApiError("Anda masih memiliki pembayaran yang belum selesai.", 409);
  }

  const kos = await getKos(kosId);
  if (!kos) throw new ApiError("Kos tidak ditemukan", 404);

  const occupiedKosId = mine.find((p) => p.status === "lunas")?.kosId ?? null;
  if (occupiedKosId && occupiedKosId !== kos.id) {
    throw new ApiError("Anda sudah menjadi penghuni di kos lain.", 409);
  }
  if (!occupiedKosId && kos.roomsLeft <= 0) {
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
    paidAt: null,
  };

  payments.push(payment);
  await writeCollection("payments", payments);
  return { payment, kosName: kos.name };
}

// Penghuni menekan "Saya sudah membayar". Hanya untuk tagihan miliknya sendiri.
export async function markPaymentPaid(paymentId: string, registrationId: string): Promise<Payment> {
  const payments = await readCollection<Payment>("payments");
  const payment = payments.find((p) => p.id === paymentId && p.registrationId === registrationId);
  if (!payment) throw new ApiError("Pembayaran tidak ditemukan", 404);

  if (payment.status === "menunggu_pembayaran") {
    payment.status = "menunggu_konfirmasi";
    payment.updatedAt = new Date().toISOString();
    await writeCollection("payments", payments);
  }
  return payment;
}

// Admin mengonfirmasi pembayaran lunas. Kamar berkurang hanya pada penghuni baru.
export async function confirmPayment(paymentId: string): Promise<Payment> {
  const payments = await readCollection<Payment>("payments");
  const payment = payments.find((p) => p.id === paymentId);
  if (!payment) throw new ApiError("Pembayaran tidak ditemukan", 404);
  if (payment.status === "lunas") return payment;

  const isNewResident = !payments.some(
    (p) => p.registrationId === payment.registrationId && p.status === "lunas"
  );

  const now = new Date().toISOString();
  payment.status = "lunas";
  payment.paidAt = now;
  payment.updatedAt = now;
  await writeCollection("payments", payments);

  if (isNewResident) {
    const kosList = await readCollection<Kos>("kos");
    const kos = kosList.find((k) => k.id === payment.kosId);
    if (kos && kos.roomsLeft > 0) {
      kos.roomsLeft -= 1;
      await writeCollection("kos", kosList);
    }
  }
  return payment;
}

// Admin mengatur nomor kamar penghuni.
export async function setRoomNumber(registrationId: string, value: unknown): Promise<AccountInfo> {
  const roomNumber = cleanString(value);
  if (roomNumber.length > 20) throw new ApiError("Nomor kamar maksimal 20 karakter", 400);

  const registrations = await readCollection<Registration>("registrations");
  const reg = registrations.find((r) => r.id === registrationId);
  if (!reg) throw new ApiError("Penghuni tidak ditemukan", 404);

  reg.roomNumber = roomNumber || null;
  await writeCollection("registrations", registrations);
  return toAccount(reg);
}

// ---------- Data dashboard ----------

export type UserDashboardData = {
  account: AccountInfo;
  kos: Kos | null;
  payment: Payment | null;
  status: TenantStatus;
  lastPaidAt: string | null;
  dueAt: string | null;
  bank: BankInfo;
};

export async function getUserDashboard(registrationId: string): Promise<UserDashboardData | null> {
  const account = await getAccount(registrationId);
  if (!account) return null;

  const payments = await readCollection<Payment>("payments");
  const mine = payments
    .filter((p) => p.registrationId === registrationId)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  const latest = mine[mine.length - 1] ?? null;
  const lastLunas = [...mine].reverse().find((p) => p.status === "lunas") ?? null;

  const kos = latest ? await getKos(latest.kosId) : null;
  return {
    account,
    kos,
    payment: latest,
    status: deriveStatus(latest, lastLunas),
    lastPaidAt: lastLunas?.paidAt ?? null,
    dueAt: lastLunas?.paidAt ? addOneMonth(lastLunas.paidAt) : null,
    bank: BANK_INFO,
  };
}

export type TenantRow = {
  registrationId: string;
  name: string;
  phone: string;
  email: string;
  kosName: string | null;
  roomNumber: string | null;
  status: TenantStatus;
  amount: number | null;
  paymentId: string | null;
  paymentStatus: PaymentStatus | null;
  lastPaidAt: string | null;
  dueAt: string | null;
};

export type AdminOverview = {
  rows: TenantRow[];
  stats: {
    lunas: number;
    menungguKonfirmasi: number;
    terlambat: number;
    belumBayar: number;
    totalKamarTersisa: number;
  };
  kosSummary: { id: string; name: string; roomsLeft: number; price: number }[];
};

export async function getAdminOverview(): Promise<AdminOverview> {
  const [registrations, payments, kosList] = await Promise.all([
    readCollection<Registration>("registrations"),
    readCollection<Payment>("payments"),
    readCollection<Kos>("kos"),
  ]);
  const kosMap = new Map(kosList.map((k) => [k.id, k]));

  const rows: TenantRow[] = registrations.map((reg) => {
    const mine = payments
      .filter((p) => p.registrationId === reg.id)
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    const latest = mine[mine.length - 1] ?? null;
    const lastLunas = [...mine].reverse().find((p) => p.status === "lunas") ?? null;
    const kos = latest ? kosMap.get(latest.kosId) ?? null : null;

    return {
      registrationId: reg.id,
      name: reg.name,
      phone: reg.phone,
      email: reg.email,
      kosName: kos?.name ?? null,
      roomNumber: reg.roomNumber ?? null,
      status: deriveStatus(latest, lastLunas),
      amount: latest?.amount ?? null,
      paymentId: latest?.id ?? null,
      paymentStatus: latest?.status ?? null,
      lastPaidAt: lastLunas?.paidAt ?? null,
      dueAt: lastLunas?.paidAt ? addOneMonth(lastLunas.paidAt) : null,
    };
  });

  rows.sort((a, b) => a.name.localeCompare(b.name, "id"));

  const count = (status: TenantStatus) => rows.filter((r) => r.status === status).length;
  return {
    rows,
    stats: {
      lunas: count("lunas"),
      menungguKonfirmasi: count("menunggu_konfirmasi"),
      terlambat: count("terlambat"),
      belumBayar: count("belum_bayar"),
      totalKamarTersisa: kosList.reduce((sum, k) => sum + k.roomsLeft, 0),
    },
    kosSummary: kosList.map((k) => ({ id: k.id, name: k.name, roomsLeft: k.roomsLeft, price: k.price })),
  };
}
