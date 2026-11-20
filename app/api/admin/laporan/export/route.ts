import { requireRole } from "@/lib/auth";
import { currentJakartaMonthKey, formatDate } from "@/lib/format";
import { errorResponse } from "@/lib/http";
import { getFinancialExportRows } from "@/lib/services/report";

function csvCell(value: string | number | null): string {
  const text = value === null ? "" : String(value);
  return `"${text.replace(/"/g, '""')}"`;
}

// GET /api/admin/laporan/export?tahun=2026  (khusus pemilik)
export async function GET(request: Request) {
  // Dibaca di luar try: akses request menghentikan prerender saat build,
  // dan sinyal itu tidak boleh tertangkap oleh catch di bawah.
  const { searchParams } = new URL(request.url);
  try {
    await requireRole("owner");

    const requested = Number(searchParams.get("tahun"));
    const currentYear = Number(currentJakartaMonthKey().slice(0, 4));
    const year =
      Number.isInteger(requested) && requested >= 2000 && requested <= 2100
        ? requested
        : currentYear;

    const rows = await getFinancialExportRows(year);
    const lines = [
      [
        "Kode pembayaran",
        "Tanggal bayar",
        "Nama penghuni",
        "Email",
        "Kos",
        "Nomor kamar",
        "Nominal",
        "Metode",
      ],
      ...rows.map((row) => [
        row.paymentId,
        row.paidAt ? formatDate(row.paidAt) : "",
        row.tenantName,
        row.tenantEmail,
        row.roomName,
        row.roomNumber,
        row.amount,
        row.method === "manual_transfer" ? "Transfer manual" : (row.method ?? ""),
      ]),
    ];
    const csv = lines.map((line) => line.map(csvCell).join(",")).join("\r\n");

    return new Response(`\uFEFF${csv}`, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="laporan-keuangan-${year}.csv"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    return errorResponse(error);
  }
}
