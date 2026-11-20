import { NextResponse } from "next/server";
import { authenticateAccount } from "@/lib/services/auth";
import { withSession } from "@/lib/auth";
import { ApiError } from "@/lib/errors";
import { errorResponse, readJson } from "@/lib/http";
import { LOGIN_LIMIT, assertNotLimited, clientIp, recordHit, resetHits } from "@/lib/rate-limit";

// POST /api/auth/login  body: { email, password }; peran diambil dari akun.
// Maksimal 5 percobaan gagal per 15 menit, dihitung per IP dan per email.
export async function POST(request: Request) {
  const body = await readJson(request);
  if (!body) return NextResponse.json({ error: "Body JSON tidak valid" }, { status: 400 });

  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const keys = [`login:ip:${clientIp(request)}`];
  if (email) keys.push(`login:email:${email}`);

  try {
    assertNotLimited(keys, LOGIN_LIMIT);
    let account;
    try {
      account = await authenticateAccount(body);
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) recordHit(keys, LOGIN_LIMIT);
      throw error;
    }
    resetHits(keys);
    const response = NextResponse.json({ role: account.role, name: account.name });
    return withSession(response, account.id, account.role);
  } catch (error) {
    return errorResponse(error);
  }
}
