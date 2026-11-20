import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import type { Tone } from "@/components/ui/status";

const toneClass: Record<Tone, string> = {
  neutral: "bg-ink-3 text-ink-11",
  green: "bg-green-3 text-green-11",
  red: "bg-red-3 text-red-11",
  amber: "bg-amber-3 text-amber-11",
  blue: "bg-blue-3 text-blue-11",
};

type Props = {
  tone?: Tone;
  icon?: LucideIcon;
  title?: ReactNode;
  children?: ReactNode;
  className?: string;
};

// Pesan sebaris berwarna. Merah = alert (dibacakan langsung), lainnya = status.
export default function Notice({ tone = "neutral", icon: Icon, title, children, className = "" }: Props) {
  return (
    <div
      role={tone === "red" ? "alert" : "status"}
      className={`flex items-start gap-3 rounded-container px-4 py-3 text-sm ${toneClass[tone]} ${className}`}
    >
      {Icon && <Icon size={16} className="mt-0.5 shrink-0" aria-hidden="true" />}
      <div className="min-w-0">
        {title && <p>{title}</p>}
        {children && <div className={title ? "mt-0.5 opacity-90" : undefined}>{children}</div>}
      </div>
    </div>
  );
}
