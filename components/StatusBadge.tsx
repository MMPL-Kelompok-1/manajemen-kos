import type { TenantStatus } from "@/lib/data";

const config: Record<TenantStatus, { label: string; className: string }> = {
  belum_pilih_kos: { label: "Belum pilih kos", className: "bg-ctp-mantle text-ctp-subtext1" },
  belum_bayar: { label: "Belum bayar", className: "bg-ctp-yellow/15 text-ctp-yellow" },
  menunggu_konfirmasi: { label: "Menunggu konfirmasi", className: "bg-ctp-blue/15 text-ctp-blue" },
  lunas: { label: "Lunas", className: "bg-ctp-green/15 text-ctp-green" },
  terlambat: { label: "Terlambat", className: "bg-ctp-red/15 text-ctp-red" },
};

export default function StatusBadge({ status }: { status: TenantStatus }) {
  const { label, className } = config[status];
  return (
    <span className={`inline-flex shrink-0 items-center rounded-full px-3 py-1 text-xs font-semibold ${className}`}>
      {label}
    </span>
  );
}
