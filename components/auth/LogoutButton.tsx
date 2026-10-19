"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

export default function LogoutButton({ redirectTo = "/" }: { redirectTo?: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function logout() {
    setLoading(true);
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace(redirectTo);
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={logout}
      disabled={loading}
      className="flex items-center gap-2 rounded-full border border-border px-3 py-2 text-sm font-medium hover:bg-muted disabled:opacity-50"
    >
      <LogOut size={16} />
      <span>{loading ? "Keluar..." : "Keluar"}</span>
    </button>
  );
}
