// Rekening tujuan dibaca dari env BANK_NAME, BANK_ACCOUNT_NUMBER, BANK_ACCOUNT_NAME.
export type BankInfo = {
  bank: string;
  accountNumber: string;
  accountName: string;
};

const DEV_BANK_INFO: BankInfo = {
  bank: "BCA",
  accountNumber: "1234567890",
  accountName: "PT KosanKu Indonesia",
};

// Dibaca saat dipakai (bukan saat import) agar build tetap jalan tanpa env.
export function getBankInfo(): BankInfo {
  const bank = process.env.BANK_NAME;
  const accountNumber = process.env.BANK_ACCOUNT_NUMBER;
  const accountName = process.env.BANK_ACCOUNT_NAME;
  if (bank && accountNumber && accountName) return { bank, accountNumber, accountName };
  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "BANK_NAME, BANK_ACCOUNT_NUMBER, dan BANK_ACCOUNT_NAME wajib diatur di environment production.",
    );
  }
  return DEV_BANK_INFO;
}

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
