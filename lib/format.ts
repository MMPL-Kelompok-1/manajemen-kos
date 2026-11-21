// Format harga dalam Rupiah, contoh: Rp 1.500.000
export function formatRupiah(value: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

// Angka besar jadi ringkas untuk figure, contoh: Rp 1,5 jt. Nilai penuh tetap ada di title.
export function formatRupiahCompact(value: number): string {
  if (Math.abs(value) < 1_000_000) return formatRupiah(value);
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

// Format tanggal, contoh: 18 Oktober 2026. Zona waktu dipaku agar server dan browser sama.
export function formatDate(iso: string | null | undefined): string {
  if (!iso) return "–";
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Jakarta",
  }).format(new Date(iso));
}

export function addOneMonth(iso: string): string {
  const date = new Date(iso);
  date.setMonth(date.getMonth() + 1);
  return date.toISOString();
}

const MONTH_LABELS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "Mei",
  "Jun",
  "Jul",
  "Agu",
  "Sep",
  "Okt",
  "Nov",
  "Des",
];

// Kunci bulan YYYY-MM menurut zona Asia/Jakarta, dipakai untuk laporan keuangan.
export function jakartaMonthKey(value: string | Date): string {
  const date = typeof value === "string" ? new Date(value) : value;
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
  }).formatToParts(date);
  const year = parts.find((part) => part.type === "year")?.value ?? "";
  const month = parts.find((part) => part.type === "month")?.value ?? "";
  return `${year}-${month}`;
}

export function currentJakartaMonthKey(now: Date = new Date()): string {
  return jakartaMonthKey(now);
}

// Batas awal dan akhir bulan (zona Asia/Jakarta) untuk kueri database.
export function jakartaMonthBounds(monthKey: string): { start: Date; end: Date } {
  const [year, month] = monthKey.split("-").map(Number);
  const nextMonth = month === 12 ? `${year + 1}-01` : `${year}-${String(month + 1).padStart(2, "0")}`;
  return {
    start: new Date(`${monthKey}-01T00:00:00+07:00`),
    end: new Date(`${nextMonth}-01T00:00:00+07:00`),
  };
}

// Label pendek dari kunci YYYY-MM, contoh: "Nov 2026".
export function formatMonthKey(monthKey: string): string {
  const [year, month] = monthKey.split("-");
  const label = MONTH_LABELS[Number(month) - 1] ?? month;
  return `${label} ${year}`;
}
