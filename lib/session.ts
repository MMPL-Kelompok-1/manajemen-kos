// Sesi berbentuk token "payload.tanda-tangan" yang ditandatangani HMAC-SHA256.
// Aman dipakai di Route Handler maupun Server Component (tidak mengakses cookies() sendiri).
import { createHmac, timingSafeEqual } from "crypto";

export const SESSION_COOKIE = "KosanKu_session";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 hari

export type Role = "admin" | "user";
export type Session = { id: string; role: Role; exp: number };

function getSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (secret) return secret;
  if (process.env.NODE_ENV === "production") {
    throw new Error("SESSION_SECRET belum diatur di environment.");
  }
  return "dev-only-secret-ganti-di-production";
}

function sign(data: string): string {
  return createHmac("sha256", getSecret()).update(data).digest("base64url");
}

export function createSessionToken(id: string, role: Role): string {
  const session: Session = { id, role, exp: Date.now() + SESSION_MAX_AGE * 1000 };
  const payload = Buffer.from(JSON.stringify(session)).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

export function parseSessionToken(token: string | undefined, now: number): Session | null {
  if (!token) return null;
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;

  const expected = Buffer.from(sign(payload));
  const actual = Buffer.from(signature);
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) return null;

  try {
    const session = JSON.parse(Buffer.from(payload, "base64url").toString("utf-8")) as Session;
    if (session.exp < now) return null;
    if (session.role !== "admin" && session.role !== "user") return null;
    return session;
  } catch {
    return null;
  }
}

export const sessionCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: SESSION_MAX_AGE,
};
