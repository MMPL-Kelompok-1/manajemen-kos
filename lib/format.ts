// Format harga dalam Rupiah, contoh: Rp 1.500.000
export function formatRupiah(value: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

// Format tanggal, contoh: 18 Oktober 2026. Zona waktu dipaku agar server dan browser sama.
export function formatDate(iso: string | null | undefined): string {
  if (!iso) return "-";
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Jakarta",
  }).format(new Date(iso));
}

// Menambah satu bulan (dipakai untuk jatuh tempo sewa bulanan).
export function addOneMonth(iso: string): string {
  const date = new Date(iso);
  date.setMonth(date.getMonth() + 1);
  return date.toISOString();
}
