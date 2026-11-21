"use client";

import { useRef } from "react";
import { useAuthModal } from "./AuthModalContext";
import AuthForms from "./AuthForms";
import { useFocusTrap } from "@/components/ui/useFocusTrap";

export default function AuthModal() {
  const { isOpen } = useAuthModal();
  if (!isOpen) return null;
  return <OpenAuthModal />;
}

// Dipasang hanya saat terbuka; fokus, Escape, dan kunci scroll ditangani useFocusTrap.
function OpenAuthModal() {
  const { tab, kosId, closeModal } = useAuthModal();
  const panelRef = useRef<HTMLDivElement>(null);
  useFocusTrap(panelRef, true, closeModal);

  return (
    <div className="fixed inset-0 z-100 flex items-end justify-center md:items-center md:p-6">
      <div
        className="animate-fade-in fixed inset-0 backdrop-blur-[2px]"
        style={{ background: "var(--backdrop)" }}
        onClick={closeModal}
        aria-hidden="true"
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
        className="relative z-10 w-full md:max-w-[440px]"
      >
        <button
          type="button"
          onClick={closeModal}
          aria-label="Tutup"
          className="group absolute left-1/2 top-0 flex h-14 w-[88px] -translate-x-1/2 -translate-y-full items-end justify-center pb-3 md:hidden"
        >
          <span className="block h-[5px] w-9 rounded-full bg-white shadow-[inset_0_-0.5px_0_rgb(0_0_0/.08),0_0_0_0.5px_rgb(0_0_0/.12),0_1px_2px_rgb(0_0_0/.28)] transition-transform duration-150 ease-[var(--ease-out)] group-active:scale-95" />
        </button>
        <div className="max-h-[92svh] overflow-y-auto">
          {/* key: tab dari luar berubah = form dipasang ulang, tanpa menyalin state lewat effect. */}
          <AuthForms key={`${tab}:${kosId ?? ""}`} initialTab={tab} kosId={kosId} isModal onClose={closeModal} />
        </div>
      </div>
    </div>
  );
}
