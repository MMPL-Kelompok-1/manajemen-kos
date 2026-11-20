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
    <div className="fixed inset-0 z-50 flex items-end justify-center md:items-center md:p-6">
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
        className="relative z-10 max-h-[92svh] w-full overflow-y-auto md:max-w-[440px]"
      >
        {/* key: tab dari luar berubah = form dipasang ulang, tanpa menyalin state lewat effect. */}
        <AuthForms key={`${tab}:${kosId ?? ""}`} initialTab={tab} kosId={kosId} isModal onClose={closeModal} />
      </div>
    </div>
  );
}
