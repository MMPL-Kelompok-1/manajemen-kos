// Pemeriksaan sesi untuk halaman (Server Component) dan API (Route Handler).
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { NextResponse, connection } from "next/server";
import { ApiError } from "@/lib/data";
import {
  SESSION_COOKIE,
  createSessionToken,
  parseSessionToken,
  sessionCookieOptions,
  type Role,
  type Session,
} from "@/lib/session";

export type { Role, Session };

export async function getSession(): Promise<Session | null> {
  // Menandai render sebagai request-time: sesi selalu dicek per request (dan memakai waktu saat ini).
  await connection();
  const now = Date.now();
  const store = await cookies();
  return parseSessionToken(store.get(SESSION_COOKIE)?.value, now);
}

// Untuk halaman: alihkan ke login bila bukan penghuni.
export async function requireUser(): Promise<Session> {
  const session = await getSession();
  if (!session || session.role !== "user") redirect("/login");
  return session;
}

// Untuk halaman: alihkan ke login admin bila bukan admin.
export async function requireAdmin(): Promise<Session> {
  const session = await getSession();
  if (!session || session.role !== "admin") redirect("/admin/login");
  return session;
}

// Untuk API: lempar error 401 bila peran tidak sesuai.
export async function requireRole(role: Role): Promise<Session> {
  const session = await getSession();
  if (!session || session.role !== role) {
    throw new ApiError("Silakan masuk terlebih dahulu", 401);
  }
  return session;
}

// Menyimpan cookie sesi pada response.
export function withSession(response: NextResponse, id: string, role: Role): NextResponse {
  response.cookies.set(SESSION_COOKIE, createSessionToken(id, role), sessionCookieOptions);
  return response;
}

// Kredensial admin dari environment. Di development ada nilai default; di production wajib diatur.
export function checkAdminCredentials(email: string, password: string): boolean {
  const isDev = process.env.NODE_ENV !== "production";
  const adminEmail = process.env.ADMIN_EMAIL ?? (isDev ? "admin@KosanKu.local" : "");
  const adminPassword = process.env.ADMIN_PASSWORD ?? (isDev ? "admin12345" : "");
  if (!adminEmail || !adminPassword) return false;
  return (
    email.trim().toLowerCase() === adminEmail.trim().toLowerCase() && password === adminPassword
  );
}
