import { NextResponse } from "next/server";
import { authenticateAccount } from "@/lib/data";
import { withSession } from "@/lib/auth";
import { errorResponse, readJson } from "@/lib/http";

// POST /api/auth/login  body: { role: "client" | "owner", email, password }
export async function POST(request: Request) {
  const body = await readJson(request);
  if (!body) return NextResponse.json({ error: "Body JSON tidak valid" }, { status: 400 });

  const role = body.role === "owner" || body.role === "admin"
    ? "owner"
    : body.role === "client" || body.role === "user"
      ? "client"
      : null;
  if (!role) return NextResponse.json({ error: "Peran akun tidak valid" }, { status: 400 });

  try {
    const account = await authenticateAccount(body, role);
    const response = NextResponse.json({ role: account.role, name: account.name });
    return withSession(response, account.id, account.role);
  } catch (error) {
    return errorResponse(error);
  }
}
