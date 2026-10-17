import { NextResponse } from "next/server";
import { ApiError } from "@/lib/data";

// Mengubah error menjadi response JSON yang konsisten.
export function errorResponse(error: unknown) {
  if (error instanceof ApiError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }
  console.error(error);
  return NextResponse.json({ error: "Terjadi kesalahan di server" }, { status: 500 });
}

// Membaca body JSON; mengembalikan null jika tidak valid.
export async function readJson(request: Request): Promise<Record<string, unknown> | null> {
  try {
    const body = await request.json();
    return body && typeof body === "object" ? (body as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}
