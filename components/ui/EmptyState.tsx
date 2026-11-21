import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

type Props = {
  icon?: LucideIcon;
  title: string;
  description?: ReactNode;
  action?: ReactNode;
  /** "panel" = panel ink-2 berdiri sendiri; "inline" = di dalam kartu yang sudah ada. */
  variant?: "panel" | "inline";
  /** Untuk kegagalan muat: diumumkan ke pembaca layar. */
  role?: "alert" | "status";
  headingLevel?: "h1" | "h2" | "h3";
};

// Kosong / gagal muat: dua baris (apa yang tidak ada, apa yang bisa dilakukan) + satu aksi.
export default function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  variant = "panel",
  role,
  headingLevel: Heading = "h3",
}: Props) {
  return (
    <div
      role={role}
      className={`flex flex-col items-center px-6 text-center ${
        variant === "panel" ? "rounded-container bg-ink-2 py-11" : "py-10"
      }`}
    >
      {Icon && <Icon size={18} className="mb-3 text-ink-9 max-md:size-6" aria-hidden="true" />}
      <Heading className="text-sm text-ink-12">{title}</Heading>
      {description && <p className="mt-1 max-w-sm text-sm text-ink-11">{description}</p>}
      {action && <div className="mt-5 flex w-full justify-center max-sm:[&>*]:w-full">{action}</div>}
    </div>
  );
}
