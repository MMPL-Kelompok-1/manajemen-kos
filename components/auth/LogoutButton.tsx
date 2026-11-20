"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

export default function LogoutButton({ redirectTo = "/" }: { redirectTo?: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);

  async function logout() {
    setLoading(true);
    setFailed(false);
    try {
      const res = await fetch("/api/auth/logout", { method: "POST" });
      if (!res.ok) throw new Error("logout failed");
      router.replace(redirectTo);
      router.refresh();
    } catch {
      setFailed(true);
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={logout}
      disabled={loading}
      className={`btn btn-secondary shrink-0 ${failed ? "text-red-11" : ""}`}
    >
      <LogOut size={16} className="text-ink-11" aria-hidden="true" />
      <span role={failed ? "alert" : undefined}>
        {loading ? "Keluar…" : failed ? "Gagal keluar, coba lagi" : "Keluar"}
      </span>
    </button>
  );
}
