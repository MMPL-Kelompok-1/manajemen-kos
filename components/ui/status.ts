// Satu peta untuk semua status di aplikasi. Hue hanya membawa makna:
// hijau = selesai, biru = sedang diproses / informasi, kuning = perlu tindakan, merah = masalah.
import type { KosStatus, RoomManagementData } from "@/lib/data";
import type { PaymentStatus } from "@/lib/payment";

export type Tone = "neutral" | "green" | "red" | "amber" | "blue";

export const toneBadgeClass: Record<Tone, string> = {
  neutral: "badge-neutral",
  green: "badge-green",
  red: "badge-red",
  amber: "badge-amber",
  blue: "badge-blue",
};

export const toneDotClass: Record<Tone, string> = {
  neutral: "bg-ink-8",
  green: "bg-green-9",
  red: "bg-red-9",
  amber: "bg-amber-9",
  blue: "bg-blue-9",
};

export type StatusInfo = { label: string; tone: Tone };

export type OrderStatus = "pending" | "confirmed" | "cancelled";
export type RoomStatus = RoomManagementData["units"][number]["status"];

export const kosStatus: Record<KosStatus, StatusInfo> = {
  belum_pilih_kos: { label: "Belum pilih kos", tone: "neutral" },
  belum_bayar: { label: "Belum bayar", tone: "amber" },
  menunggu_konfirmasi: { label: "Menunggu konfirmasi", tone: "blue" },
  lunas: { label: "Lunas", tone: "green" },
  terlambat: { label: "Terlambat", tone: "red" },
};

export const paymentStatus: Record<PaymentStatus, StatusInfo> = {
  menunggu_pembayaran: kosStatus.belum_bayar,
  menunggu_konfirmasi: kosStatus.menunggu_konfirmasi,
  lunas: kosStatus.lunas,
};

export const orderStatus: Record<OrderStatus, StatusInfo> = {
  pending: { label: "Menunggu pembayaran", tone: "neutral" },
  confirmed: { label: "Terkonfirmasi", tone: "green" },
  cancelled: { label: "Dibatalkan", tone: "red" },
};

// "Terisi" bukan peringatan: biru (informasi), bukan kuning.
export const roomStatus: Record<RoomStatus, StatusInfo> = {
  TERISI: { label: "Terisi", tone: "blue" },
  "SIAP HUNI": { label: "Siap huni", tone: "green" },
  PERAWATAN: { label: "Perawatan", tone: "neutral" },
};

const fallback: StatusInfo = { label: "Tidak diketahui", tone: "neutral" };

export type StatusKind =
  | { kind?: "kos"; status: KosStatus }
  | { kind: "payment"; status: PaymentStatus }
  | { kind: "order"; status: OrderStatus }
  | { kind: "room"; status: RoomStatus };

export function statusInfo(props: StatusKind): StatusInfo {
  switch (props.kind) {
    case "payment":
      return paymentStatus[props.status] ?? fallback;
    case "order":
      return orderStatus[props.status] ?? fallback;
    case "room":
      return roomStatus[props.status] ?? fallback;
    default:
      return kosStatus[props.status] ?? fallback;
  }
}
