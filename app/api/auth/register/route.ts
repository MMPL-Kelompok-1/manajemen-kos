import { NextResponse } from "next/server";
import { registerAccount } from "@/lib/data";
import { withSession } from "@/lib/auth";
import { errorResponse, readJson } from "@/lib/http";

// POST /api/auth/register  body: { name, phone, email, password }
export async function POST(request: Request) {
  const body = await readJson(request);
  if (!body) return NextResponse.json({ error: "Body JSON tidak valid" }, { status: 400 });
  try {
    const account = await registerAccount(body);
    const response = NextResponse.json({ role: "user", name: account.name }, { status: 201 });
    return withSession(response, account.id, "user");
  } catch (error) {
    return errorResponse(error);
  }
}
