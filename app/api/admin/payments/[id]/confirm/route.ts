import { NextResponse } from "next/server";
import { confirmPayment } from "@/lib/data";
import { requireRole } from "@/lib/auth";
import { errorResponse } from "@/lib/http";

// POST /api/admin/payments/:id/confirm  (khusus admin)
export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireRole("owner");
    const { id } = await params;
    const payment = await confirmPayment(id);
    return NextResponse.json({ id: payment.id, status: payment.status, paidAt: payment.paidAt });
  } catch (error) {
    return errorResponse(error);
  }
}
