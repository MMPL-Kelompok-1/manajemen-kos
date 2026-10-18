"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, Search, X } from "lucide-react";
import { useAuthModal } from "@/components/auth/AuthModalContext";

const navLinks = [
  { href: "/#top", label: "Beranda" },
  { href: "/#why", label: "Keunggulan" },
  { href: "/#kos", label: "Kos" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { openModal } = useAuthModal();

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
          <button
            type="button"
            onClick={() => openModal("masuk")}
            className="hidden rounded-full px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100 sm:inline-flex"
          >
            Masuk
          </button>
          <button
            type="button"
            onClick={() => openModal("daftar")}
            className="rounded-full bg-ctp-accent px-4 py-2 text-sm font-medium text-ctp-on-lavender hover:bg-ctp-mantle hover:text-ctp-text"
          >
            Daftar
          </button>
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
          <div className="mt-3 flex flex-col gap-2 border-t border-zinc-100 pt-3">
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                openModal("masuk");
              }}
              className="w-full rounded-xl border border-zinc-200 py-3 text-center text-sm font-medium text-zinc-900 transition hover:bg-zinc-50"
            >
              Masuk
            </button>
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                openModal("daftar");
              }}
              className="w-full rounded-xl bg-zinc-950 py-3 text-center text-sm font-medium text-white transition hover:bg-zinc-800"
            >
              Daftar
            </button>
          </div>
        </nav>
      )}
    </header>
  );
}
