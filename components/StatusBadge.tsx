import type { KosStatus } from "@/lib/data";

const config: Record<KosStatus, { label: string; className: string }> = {
  belum_pilih_kos: {
    label: "Belum pilih kos",
    className: "bg-muted text-muted-foreground",
  },
  belum_bayar: { label: "Belum bayar", className: "bg-amber-3 text-amber-11" },
  menunggu_konfirmasi: {
    label: "Menunggu konfirmasi",
    className: "bg-blue-3 text-blue-11",
  },
  lunas: { label: "Lunas", className: "bg-green-3 text-green-11" },
  terlambat: { label: "Terlambat", className: "bg-red-3 text-red-11" },
};

export default function StatusBadge({ status }: { status: KosStatus }) {
  const { label, className } = config[status];
  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-full px-3 py-1 text-xs font-semibold ${className}`}
    >
      {label}
    </span>
  );
}
