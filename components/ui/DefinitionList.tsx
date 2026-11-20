import type { ReactNode } from "react";

type RowProps = {
  label: string;
  value: ReactNode;
  /** "lead" = nilai 16/24 (ringkasan kartu); "body" = nilai 13/20. */
  size?: "lead" | "body";
  className?: string;
};

// Label di bawah nilai secara visual, tetapi dt tetap lebih dulu di DOM.
export function DefinitionRow({ label, value, size = "body", className = "" }: RowProps) {
  return (
    <div className={`flex min-w-0 flex-col-reverse ${className}`}>
      <dt className="text-sm text-ink-10">{label}</dt>
      <dd className={`truncate tabular-nums text-ink-12 ${size === "lead" ? "text-lg" : "text-sm"}`}>
        {value}
      </dd>
    </div>
  );
}

type ListProps = {
  items: RowProps[];
  className?: string;
  size?: RowProps["size"];
};

export function DefinitionList({ items, className = "grid grid-cols-2 gap-4", size }: ListProps) {
  return (
    <dl className={className}>
      {items.map((item) => (
        <DefinitionRow key={item.label} size={size} {...item} />
      ))}
    </dl>
  );
}
