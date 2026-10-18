import { NextResponse } from "next/server";
import { authenticateUser } from "@/lib/data";
import { checkAdminCredentials, withSession } from "@/lib/auth";
import { errorResponse, readJson } from "@/lib/http";

// POST /api/auth/login  body: { role: "user" | "admin", email, password }
export async function POST(request: Request) {
  const body = await readJson(request);
  if (!body) return NextResponse.json({ error: "Body JSON tidak valid" }, { status: 400 });

  const email = typeof body.email === "string" ? body.email : "";
  const password = typeof body.password === "string" ? body.password : "";

  try {
    if (body.role === "admin") {
      if (!checkAdminCredentials(email, password)) {
        return NextResponse.json({ error: "Gmail atau kata sandi admin salah" }, { status: 401 });
      }
      return withSession(NextResponse.json({ role: "admin" }), "admin", "admin");
    }

    const account = await authenticateUser({ email, password });
    const response = NextResponse.json({ role: "user", name: account.name });
    return withSession(response, account.id, "user");
  } catch (error) {
    return errorResponse(error);
  }
}
