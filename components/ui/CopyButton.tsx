"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Copy } from "lucide-react";

type State = "idle" | "copied" | "failed";

type Props = {
  value: string;
  /** Apa yang disalin, untuk pembaca layar. Contoh: "nomor rekening". */
  label: string;
  className?: string;
};

// Tanda centang muncul saat diklik, sebelum clipboard menjawab. Tanpa toast.
export default function CopyButton({ value, label, className = "" }: Props) {
  const [state, setState] = useState<State>("idle");
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  function reset(after: number) {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setState("idle"), after);
  }

  function copy() {
    setState("copied");
    reset(1500);
    const write = navigator.clipboard?.writeText(value) ?? Promise.reject(new Error("no clipboard"));
    write.catch(() => {
      setState("failed");
      reset(2500);
    });
  }

  const text = state === "copied" ? "Tersalin" : state === "failed" ? "Gagal menyalin" : "Salin";

  return (
    <button
      type="button"
      onClick={copy}
      aria-label={state === "idle" ? `Salin ${label}` : text}
      className={`btn btn-pill touch-target shrink-0 ${state === "failed" ? "text-red-11" : ""} ${className}`}
    >
      {state === "copied" ? (
        <Check size={14} aria-hidden="true" />
      ) : (
        <Copy size={14} className="text-ink-11" aria-hidden="true" />
      )}
      <span aria-live="polite">{text}</span>
    </button>
  );
}
