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

// Untuk halaman: alihkan ke login bila bukan client.
export async function requireUser(): Promise<Session> {
  const session = await getSession();
  if (!session || session.role !== "client") redirect("/login");
  return session;
}

// Untuk halaman: alihkan ke login pemilik bila bukan owner.
export async function requireAdmin(): Promise<Session> {
  const session = await getSession();
  if (!session || session.role !== "owner") redirect("/admin/login");
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
