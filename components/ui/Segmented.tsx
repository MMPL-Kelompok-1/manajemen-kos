"use client";

import type { ReactNode } from "react";

type Option<T extends string> = { value: T; label: ReactNode };

type Props<T extends string> = {
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
  /** Nama grup untuk pembaca layar. */
  label: string;
  className?: string;
};

export default function Segmented<T extends string>({ options, value, onChange, label, className = "" }: Props<T>) {
  return (
    <div role="group" aria-label={label} className={`segmented ${className}`}>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          aria-pressed={option.value === value}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
