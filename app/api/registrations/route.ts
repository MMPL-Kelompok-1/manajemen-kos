import { NextResponse } from "next/server";
import { registerUser } from "@/lib/data";
import { errorResponse, readJson } from "@/lib/http";

// POST /api/registrations  body: { name, phone, email }
export async function POST(request: Request) {
  const body = await readJson(request);
  if (!body) return NextResponse.json({ error: "Body JSON tidak valid" }, { status: 400 });
  try {
    const registration = await registerUser(body);
    return NextResponse.json(registration, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
