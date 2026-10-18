import { NextResponse } from "next/server";
import { markPaymentPaid } from "@/lib/data";
import { requireRole } from "@/lib/auth";
import { errorResponse } from "@/lib/http";

// POST /api/payments/:id/paid
// Dipanggil saat penghuni menekan "Saya sudah membayar" pada tagihannya sendiri.
export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireRole("client");
    const { id } = await params;
    const payment = await markPaymentPaid(id, session.id);
    return NextResponse.json({ id: payment.id, status: payment.status });
  } catch (error) {
    return errorResponse(error);
  }
}
