// Informasi rekening tujuan pembayaran.
// GANTI dengan rekening asli sebelum dipakai.
// Untuk pembayaran otomatis (Midtrans, Xendit, QRIS), integrasikan di app/api/payments/route.ts.
export type BankInfo = {
  bank: string;
  accountNumber: string;
  accountName: string;
};

export const BANK_INFO: BankInfo = {
  bank: "BCA",
  accountNumber: "1234567890",
  accountName: "PT StayEase Indonesia",
};

export type PaymentStatus = "menunggu_pembayaran" | "menunggu_konfirmasi" | "lunas";

export type PaymentResult = {
  payment: {
    id: string;
    amount: number;
    status: PaymentStatus;
    kosName: string;
  };
  bank: BankInfo;
};
