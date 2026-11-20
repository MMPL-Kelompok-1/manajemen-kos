import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { errorResponse, readJson } from "@/lib/http";
import { createRoom } from "@/lib/services/room";

// POST /api/admin/rooms  (khusus pemilik)
// body: { roomNumber, name, area, price, gender?, roomSize?, bathroom?, description?, facilities? }
export async function POST(request: Request) {
  try {
    await requireRole("owner");
    const body = await readJson(request);
    if (!body) return NextResponse.json({ error: "Body JSON tidak valid" }, { status: 400 });
    const room = await createRoom(body);
    return NextResponse.json({ id: room.id }, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
