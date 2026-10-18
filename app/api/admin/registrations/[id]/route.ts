import { NextResponse } from "next/server";
import { setRoomNumber } from "@/lib/data";
import { requireRole } from "@/lib/auth";
import { errorResponse, readJson } from "@/lib/http";

// PATCH /api/admin/registrations/:id  body: { roomNumber }  (khusus admin)
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireRole("admin");
    const { id } = await params;
    const body = await readJson(request);
    if (!body) return NextResponse.json({ error: "Body JSON tidak valid" }, { status: 400 });
    const account = await setRoomNumber(id, body.roomNumber);
    return NextResponse.json({ id: account.id, roomNumber: account.roomNumber });
  } catch (error) {
    return errorResponse(error);
  }
}
