"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { CalendarDays, CreditCard, KeyRound, LogOut, PanelLeft } from "lucide-react";

const menu = [
  { label: "Kos Anda", href: "/dashboard", icon: KeyRound },
  { label: "Histori Pesanan", href: "/dashboard/histori", icon: CalendarDays },
  { label: "Pembayaran", href: "/dashboard/pembayaran", icon: CreditCard },
];

export default function UserShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false); // HP: sidebar sebagai laci
  const [collapsed, setCollapsed] = useState(false); // desktop: sidebar bisa disembunyikan
  const [loggingOut, setLoggingOut] = useState(false);

  const aktif = (href: string) =>
    href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(href);
  const judul = menu.find((m) => aktif(m.href))?.label ?? "Dashboard";

  function toggleSidebar() {
    if (window.innerWidth >= 768) setCollapsed((v) => !v);
    else setMobileOpen((v) => !v);
  }

  async function keluar() {
    setLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      router.push("/");
      router.refresh();
    }
  }

  return (
    <div className="flex min-h-dvh w-full bg-background text-foreground">
      {/* Latar gelap saat sidebar terbuka di HP */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 flex-col border-r border-border bg-background transition-transform md:sticky md:top-0 md:h-dvh md:translate-x-0 ${
          mobileOpen ? "flex translate-x-0" : "flex -translate-x-full"
        } ${collapsed ? "md:hidden" : "md:flex"}`}
      >
        <Link
          href="/"
          className="flex h-16 items-center gap-3 border-b border-border px-5 font-bold"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">
            K
          </span>
          KosanKu
        </Link>

        <nav aria-label="Menu penghuni" className="flex-1 p-3">
          <ul className="flex flex-col gap-1">
            {menu.map((item) => {
              const Icon = item.icon;
              const sedangAktif = aktif(item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    aria-current={sedangAktif ? "page" : undefined}
                    className={`flex h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium transition-colors ${
                      sedangAktif
                        ? "bg-muted text-foreground"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    <Icon size={18} />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>

      {/* Konten */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-4 border-b border-border bg-background/95 px-4 backdrop-blur md:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={toggleSidebar}
              aria-label="Buka atau tutup menu"
              className="flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <PanelLeft size={20} />
            </button>
            <h1 className="text-base font-semibold">{judul}</h1>
          </div>
          <button
            type="button"
            onClick={keluar}
            disabled={loggingOut}
            className="inline-flex h-10 items-center gap-2 rounded-full border border-border px-4 text-sm font-medium hover:bg-muted disabled:opacity-60"
          >
            <LogOut size={16} />
            Keluar
          </button>
        </header>

        <main className="mx-auto w-full max-w-5xl flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
