"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { PanelLeft } from "lucide-react";
import LogoutButton from "@/components/auth/LogoutButton";
import { useFocusTrap } from "@/components/ui/useFocusTrap";

export type NavItem = {
  label: string;
  href: string;
  /** Elemen ikon (misalnya <KeyRound />). Elemen bisa dikirim dari Server Component. */
  icon: ReactNode;
};

type Props = {
  navItems: NavItem[];
  /** Nama area, dipakai sebagai judul cadangan dan label navigasi. */
  title: string;
  children: ReactNode;
};

const DESKTOP = "(min-width: 48rem)";

export default function AppShell({ navItems, title, children }: Props) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false); // HP: sidebar sebagai laci
  const [collapsed, setCollapsed] = useState(false); // desktop: sidebar bisa disembunyikan
  const asideRef = useRef<HTMLElement>(null);

  // Item aktif = href terpanjang yang cocok, supaya "/dashboard" tidak ikut aktif di "/dashboard/histori".
  const active = navItems
    .filter((item) => pathname === item.href || pathname.startsWith(`${item.href}/`))
    .sort((a, b) => b.href.length - a.href.length)[0];
  const heading = active?.label ?? title;

  useFocusTrap(asideRef, mobileOpen, () => setMobileOpen(false));

  // Laci HP ditutup otomatis jika layar melebar ke ukuran desktop.
  useEffect(() => {
    if (!mobileOpen) return;
    const mq = window.matchMedia(DESKTOP);
    const onChange = () => mq.matches && setMobileOpen(false);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [mobileOpen]);

  function toggleSidebar() {
    if (window.matchMedia(DESKTOP).matches) setCollapsed((v) => !v);
    else setMobileOpen((v) => !v);
  }

  return (
    <div className="flex min-h-dvh w-full bg-ground text-ink-12">
      <a
        href="#konten"
        className="btn btn-secondary fixed left-3 top-3 z-[60] -translate-y-20 focus-visible:translate-y-0"
      >
        Lewati ke konten
      </a>

      {mobileOpen && (
        <div
          className="animate-fade-in fixed inset-0 z-30 backdrop-blur-[2px] md:hidden"
          style={{ background: "var(--backdrop)" }}
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        ref={asideRef}
        id="app-sidebar"
        aria-label={`Menu ${title}`}
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-ground transition-[transform,visibility] duration-200 ease-[var(--ease-drawer)] motion-reduce:transition-none max-md:bg-panel max-md:shadow-[var(--shadow-panel)] md:sticky md:top-0 md:h-dvh md:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "max-md:invisible -translate-x-full"
        } ${collapsed ? "md:hidden" : ""}`}
      >
        <Link
          href="/"
          onClick={() => setMobileOpen(false)}
          className="flex h-14 shrink-0 items-center px-5 font-headline text-[17px] text-ink-12"
        >
          KosanKu
        </Link>

        <nav aria-label={`Navigasi ${title}`} className="flex-1 overflow-y-auto px-3 pb-3">
          <ul className="flex flex-col gap-0.5">
            {navItems.map((item) => {
              const isActive = item === active;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    aria-current={isActive ? "page" : undefined}
                    className={`flex h-11 items-center gap-2.5 rounded-control px-3 text-sm transition-colors duration-150 md:h-9 [&_svg]:size-4 [&_svg]:shrink-0 ${
                      isActive ? "bg-ink-4 text-ink-12" : "text-ink-11 hover:bg-ink-3 hover:text-ink-12"
                    }`}
                  >
                    <span aria-hidden="true" className="contents">
                      {item.icon}
                    </span>
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="hairline-b sticky top-0 z-20 flex h-14 shrink-0 items-center justify-between gap-4 bg-ground/95 px-5 backdrop-blur md:px-6">
          <div className="flex min-w-0 items-center gap-2">
            <button
              type="button"
              onClick={toggleSidebar}
              aria-label="Buka atau tutup menu"
              aria-controls="app-sidebar"
              className="btn btn-ghost btn-icon -ml-2 shrink-0"
            >
              <PanelLeft size={18} aria-hidden="true" />
            </button>
            <p className="truncate text-sm text-ink-12">{heading}</p>
          </div>
          <LogoutButton redirectTo="/" />
        </header>

        <main id="konten" tabIndex={-1} className="flex-1 outline-none">
          {children}
        </main>
      </div>
    </div>
  );
}
