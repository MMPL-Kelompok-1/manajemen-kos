"use client";

import Link from "next/link";
import { ArrowUp, Mail, MapPin, Phone, Search } from "lucide-react";
import { useAuthModal } from "@/components/auth/AuthModalContext";

// Ubah kontak di sini.
const EMAIL = "KosanKu@gmail.com";
const TELEPON = "+62 1234 5678 9012";

const cardClass =
  "rounded-3xl border border-white/10 bg-white/[.04] p-6 sm:p-8";
const labelClass = "text-xs font-bold uppercase tracking-[0.18em] text-zinc-500";
const ikonClass =
  "flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/15 transition-colors";

export default function Footer() {
  const { openModal } = useAuthModal();

  return (
    <footer className="border-t border-white/10 bg-zinc-950 text-white">
      <div className="mx-auto max-w-7xl px-5 pb-10 pt-12 md:px-6 md:pt-16">
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 md:gap-6">
          {/* Card KosanKu */}
          <div className={`${cardClass} sm:col-span-2 md:col-span-1`}>
            <Link href="/" className="inline-flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-zinc-950">
                <Search size={20} />
              </span>
              <span className="text-2xl font-bold tracking-tight">KosanKu</span>
            </Link>
            <p className="mt-5 max-w-xs leading-relaxed text-zinc-400">
              Kos nyaman dengan harga yang jelas dan pembayaran yang mudah.
            </p>
          </div>

          {/* Card Menu */}
          <nav aria-label="Menu footer" className={cardClass}>
            <p className={labelClass}>Menu</p>
            <ul className="mt-5 flex flex-col gap-1">
              <li>
                <Link
                  href="/"
                  className="group inline-flex items-center gap-2 py-1.5 text-zinc-300 transition-colors hover:text-white"
                >
                  <span className="h-px w-3 bg-zinc-600 transition-all group-hover:w-5 group-hover:bg-white" />
                  Beranda
                </Link>
              </li>
              <li>
                <Link
                  href="/#keunggulan"
                  className="group inline-flex items-center gap-2 py-1.5 text-zinc-300 transition-colors hover:text-white"
                >
                  <span className="h-px w-3 bg-zinc-600 transition-all group-hover:w-5 group-hover:bg-white" />
                  Keunggulan
                </Link>
              </li>
              <li>
                <Link
                  href="/#kos"
                  className="group inline-flex items-center gap-2 py-1.5 text-zinc-300 transition-colors hover:text-white"
                >
                  <span className="h-px w-3 bg-zinc-600 transition-all group-hover:w-5 group-hover:bg-white" />
                  Kos
                </Link>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => openModal("daftar")}
                  className="group inline-flex items-center gap-2 py-1.5 text-zinc-300 transition-colors hover:text-white text-left"
                >
                  <span className="h-px w-3 bg-zinc-600 transition-all group-hover:w-5 group-hover:bg-white" />
                  Daftar
                </button>
              </li>
              <li>
                <Link
                  href="/admin/login"
                  className="group inline-flex items-center gap-2 py-1.5 text-zinc-300 transition-colors hover:text-white"
                >
                  <span className="h-px w-3 bg-zinc-600 transition-all group-hover:w-5 group-hover:bg-white" />
                  Login pemilik kos
                </Link>
              </li>
            </ul>
          </nav>

          {/* Card Kontak */}
          <div className={cardClass}>
            <p className={labelClass}>Kontak</p>
            <ul className="mt-5 flex flex-col gap-4">
              <li>
                <a
                  href={`mailto:${EMAIL}`}
                  className="group flex items-center gap-3 text-zinc-300 transition-colors hover:text-white"
                >
                  <span className={`${ikonClass} group-hover:border-white group-hover:bg-white group-hover:text-zinc-950`}>
                    <Mail size={17} />
                  </span>
                  <span className="break-all">{EMAIL}</span>
                </a>
              </li>
              <li>
                <a
                  href={`tel:${TELEPON.replace(/\s/g, "")}`}
                  className="group flex items-center gap-3 text-zinc-300 transition-colors hover:text-white"
                >
                  <span className={`${ikonClass} group-hover:border-white group-hover:bg-white group-hover:text-zinc-950`}>
                    <Phone size={17} />
                  </span>
                  {TELEPON}
                </a>
              </li>
              <li className="flex items-center gap-3 text-zinc-300">
                <span className={ikonClass}>
                  <MapPin size={17} />
                </span>
                Dekat kampus dan pusat kota
              </li>
            </ul>
          </div>
        </div>

        {/* Baris bawah */}
        <div className="mt-8 flex items-center justify-between gap-4 pb-[env(safe-area-inset-bottom)] text-sm text-zinc-500">
          <p>© KosanKu. All rights reserved.</p>
          <a
            href="#"
            className="inline-flex items-center gap-1.5 transition-colors hover:text-white"
          >
            Ke atas <ArrowUp size={14} />
          </a>
        </div>
      </div>
    </footer>
  );
}
