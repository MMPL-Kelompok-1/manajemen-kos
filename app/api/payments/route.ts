import { NextResponse } from "next/server";
import { createPayment } from "@/lib/data";
import { requireRole } from "@/lib/auth";
import { errorResponse, readJson } from "@/lib/http";
import { BANK_INFO, type PaymentResult } from "@/lib/payment";

// POST /api/payments  body: { kosId }   (wajib masuk sebagai penghuni)
export async function POST(request: Request) {
  try {
    const session = await requireRole("user");
    const body = await readJson(request);
    if (!body) return NextResponse.json({ error: "Body JSON tidak valid" }, { status: 400 });

    const kosId = typeof body.kosId === "string" ? body.kosId : "";
    const { payment, kosName } = await createPayment(session.id, kosId);
    const result: PaymentResult = {
      payment: {
        id: payment.id,
        amount: payment.amount,
        status: payment.status,
        kosName,
      },
      bank: BANK_INFO,
    };
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
