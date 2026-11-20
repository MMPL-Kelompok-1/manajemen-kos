import { statusInfo, toneBadgeClass, toneDotClass, type StatusKind } from "@/components/ui/status";

// Badge status. Contoh: <StatusBadge status="lunas" />, <StatusBadge kind="order" status="pending" />.
export default function StatusBadge(props: StatusKind & { className?: string }) {
  const { label, tone } = statusInfo(props);
  return <span className={`badge shrink-0 ${toneBadgeClass[tone]} ${props.className ?? ""}`}>{label}</span>;
}

// Status di tabel: titik berwarna + label, sesuai resep tabel tactile.
export function StatusDot(props: StatusKind) {
  const { label, tone } = statusInfo(props);
  return (
    <span className="inline-flex items-center gap-2 whitespace-nowrap">
      <span className={`size-2 shrink-0 rounded-full ${toneDotClass[tone]}`} aria-hidden="true" />
      {label}
    </span>
  );
}
