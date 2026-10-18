"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, Search, X } from "lucide-react";

const navLinks = [
  { href: "/#top", label: "Beranda" },
  { href: "/#why", label: "Keunggulan" },
  { href: "/#kos", label: "Kos" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-50 border-b border-ctp-surface0 bg-ctp-base/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2 text-lg font-bold"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-ctp-accent text-ctp-on-lavender">
            <Search size={16} />
          </span>
          KosanKu
        </Link>

        <nav className="hidden items-center gap-8 text-sm text-ctp-subtext0 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="hover:text-ctp-text"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/login"
            className="hidden rounded-full px-4 py-2 text-sm font-medium text-ctp-subtext1 hover:bg-ctp-mantle sm:inline-flex"
          >
            Masuk
          </Link>
          <Link
            href="/login?tab=daftar"
            className="rounded-full bg-ctp-accent px-4 py-2 text-sm font-medium text-ctp-on-lavender hover:bg-ctp-mantle hover:text-ctp-text"
          >
            Daftar
          </Link>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Tutup menu" : "Buka menu"}
            aria-expanded={open}
            className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-ctp-mantle md:hidden"
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {open && (
        <nav className="border-t border-ctp-surface0 bg-ctp-base px-4 py-3 md:hidden">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="block rounded-xl px-3 py-3 text-base font-medium text-ctp-text hover:bg-ctp-base"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/login"
            onClick={() => setOpen(false)}
            className="mt-2 block rounded-xl border border-ctp-surface0 px-3 py-3 text-center text-base font-medium"
          >
            Masuk
          </Link>
        </nav>
      )}
    </header>
  );
}
