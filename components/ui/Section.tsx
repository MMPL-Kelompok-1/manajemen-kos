import type { ReactNode } from "react";

type Props = {
  title: ReactNode;
  description?: ReactNode;
  /** Aksi bagian: di kanan judul, di atas data. Di HP pindah ke bawah judul. */
  actions?: ReactNode;
  as?: "h1" | "h2";
  id?: string;
  className?: string;
  children?: ReactNode;
};

export default function Section({
  title,
  description,
  actions,
  as: Heading = "h2",
  id,
  className = "",
  children,
}: Props) {
  const headingId = id ? `${id}-title` : undefined;
  return (
    <section id={id} aria-labelledby={headingId} className={`space-y-6 ${className}`}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <Heading id={headingId} className="text-section">
            {title}
          </Heading>
          {description && <p className="mt-1.5 text-sm text-ink-11">{description}</p>}
        </div>
        {actions && <div className="flex flex-wrap items-center gap-2 max-sm:[&>*]:flex-1">{actions}</div>}
      </div>
      {children}
    </section>
  );
}
