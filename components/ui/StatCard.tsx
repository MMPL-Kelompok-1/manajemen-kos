import type { ReactNode } from "react";
import { toneDotClass, type Tone } from "@/components/ui/status";

type Props = {
  value: ReactNode;
  label: string;
  /** Titik warna di depan label: hanya untuk angka yang mewakili status. */
  tone?: Tone;
  /** Isi tambahan di bawah label, misalnya bilah persentase. */
  children?: ReactNode;
  className?: string;
};

// Angka 24/32 ink-12 dengan label 13/20 tepat di bawahnya.
export default function StatCard({ value, label, tone, children, className = "" }: Props) {
  return (
    <div className={`surface-raised min-w-0 p-4 ${className}`}>
      <p className="text-figure truncate">{value}</p>
      <p className="mt-1 flex items-center gap-1.5 text-sm text-ink-11">
        {tone && <span className={`size-1.5 shrink-0 rounded-full ${toneDotClass[tone]}`} aria-hidden="true" />}
        {label}
      </p>
      {children}
    </div>
  );
}
