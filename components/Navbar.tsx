"use client";

import Link from "next/link";
import { Search } from "lucide-react";
import { useState } from "react";
import { useAuthModal } from "@/components/auth/AuthModalContext";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { openModal } = useAuthModal();

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-6 px-5 md:px-6">
        <Link href="/" className="flex items-center gap-2.5 font-bold">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Search size={16} />
          </span>
          KosanKu
        </Link>

        <nav className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
          <Link href="/#keunggulan" className="hover:text-foreground">
            Keunggulan
          </Link>
          <Link href="/#kos" className="hover:text-foreground">
            Kos
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => openModal("masuk")}
            className="hidden rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition hover:bg-muted sm:inline-flex"
          >
            Masuk
          </button>
          <button
            type="button"
            onClick={() => openModal("daftar")}
            className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-muted hover:text-foreground"
          >
            Daftar
          </button>
          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Buka menu"
            className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-muted md:hidden"
          >
            <Search size={20} />
          </button>
        </div>
      </div>

      {mobileOpen && (
        <nav className="border-t border-border bg-background px-4 py-3 md:hidden">
          <ul className="flex flex-col gap-1">
            <li>
              <Link
                href="/#keunggulan"
                className="block rounded-xl px-3 py-3 text-base font-medium text-foreground hover:bg-background"
              >
                Keunggulan
              </Link>
            </li>
            <li>
              <Link
                href="/#kos"
                className="block rounded-xl px-3 py-3 text-base font-medium text-foreground hover:bg-background"
              >
                Kos
              </Link>
            </li>
          </ul>
          <div className="mt-3 flex flex-col gap-2 border-t border-border pt-3">
            <button
              type="button"
              onClick={() => { openModal("masuk"); setMobileOpen(false); }}
              className="w-full rounded-xl border border-border py-3 text-center text-sm font-medium text-foreground transition hover:bg-muted"
            >
              Masuk
            </button>
            <button
              type="button"
              onClick={() => { openModal("daftar"); setMobileOpen(false); }}
              className="w-full rounded-xl bg-primary py-3 text-center text-sm font-medium text-primary-foreground transition hover:bg-muted hover:text-foreground"
            >
              Daftar
            </button>
          </div>
        </nav>
      )}
    </header>
  );
}
