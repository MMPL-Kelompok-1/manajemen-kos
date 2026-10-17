import { NextResponse } from "next/server";
import { markPaymentPaid } from "@/lib/data";
import { errorResponse } from "@/lib/http";

// POST /api/payments/:id/paid
// Dipanggil saat pengguna menekan "Saya sudah membayar".
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const payment = await markPaymentPaid(id);
    return NextResponse.json({ id: payment.id, status: payment.status });
  } catch (error) {
    return errorResponse(error);
  }
}
