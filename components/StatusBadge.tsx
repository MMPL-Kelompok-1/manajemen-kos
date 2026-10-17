import type { TenantStatus } from "@/lib/data";

const config: Record<TenantStatus, { label: string; className: string }> = {
  belum_pilih_kos: { label: "Belum pilih kos", className: "bg-zinc-100 text-zinc-700" },
  belum_bayar: { label: "Belum bayar", className: "bg-amber-100 text-amber-800" },
  menunggu_konfirmasi: { label: "Menunggu konfirmasi", className: "bg-blue-100 text-blue-800" },
  lunas: { label: "Lunas", className: "bg-emerald-100 text-emerald-800" },
  terlambat: { label: "Terlambat", className: "bg-red-100 text-red-700" },
};

export default function StatusBadge({ status }: { status: TenantStatus }) {
  const { label, className } = config[status];
  return (
    <span className={`inline-flex shrink-0 items-center rounded-full px-3 py-1 text-xs font-semibold ${className}`}>
      {label}
    </span>
  );
}
