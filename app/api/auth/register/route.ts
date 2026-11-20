import { NextResponse } from "next/server";
import { registerAccount } from "@/lib/services/auth";
import { withSession } from "@/lib/auth";
import { errorResponse, readJson } from "@/lib/http";
import { REGISTER_LIMIT, assertNotLimited, clientIp, recordHit } from "@/lib/rate-limit";

// POST /api/auth/register  body: { name, phone, email, password }
// Maksimal 10 percobaan pendaftaran per jam per IP.
export async function POST(request: Request) {
  const body = await readJson(request);
  if (!body) return NextResponse.json({ error: "Body JSON tidak valid" }, { status: 400 });

  const keys = [`register:ip:${clientIp(request)}`];
  try {
    assertNotLimited(keys, REGISTER_LIMIT);
    recordHit(keys, REGISTER_LIMIT);
    const account = await registerAccount(body);
    const response = NextResponse.json({ role: account.role, name: account.name }, { status: 201 });
    return withSession(response, account.id, account.role);
  } catch (error) {
    return errorResponse(error);
  }
}
