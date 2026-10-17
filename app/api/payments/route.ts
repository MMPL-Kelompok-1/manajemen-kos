import { NextResponse } from "next/server";
import { createPayment } from "@/lib/data";
import { errorResponse, readJson } from "@/lib/http";
import { BANK_INFO, type PaymentResult } from "@/lib/payment";

// POST /api/payments  body: { registrationId, kosId }
export async function POST(request: Request) {
  const body = await readJson(request);
  if (!body) return NextResponse.json({ error: "Body JSON tidak valid" }, { status: 400 });
  try {
    const { payment, kosName } = await createPayment(body);
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
