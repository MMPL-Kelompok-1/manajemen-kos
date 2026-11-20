"use client";

import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import { useAuthModal } from "@/components/auth/AuthModalContext";

// Ubah kontak di sini.
const EMAIL = "KosanKu@gmail.com";
const TELEPON = "+62 1234 5678 9012";

// Sama dengan menu di Navbar supaya tujuannya seragam.
const menu = [
  { label: "Beranda", href: "/#home" },
  { label: "Tentang", href: "/#about" },
  { label: "Daftar kos", href: "/#product" },
  { label: "Kontak", href: "/#contact" },
];

const labelClass = "text-sm text-ink-12";
const linkClass =
  "inline-flex min-h-8 items-center text-left text-sm text-ink-11 transition-colors duration-150 hover:text-ink-12 max-md:min-h-11 max-md:text-[15px]";
const kontakClass = "flex items-center gap-3 text-sm text-ink-11 max-md:text-[15px]";

export default function Footer() {
  const { openModal } = useAuthModal();

  return (
    <footer id="contact" className="hairline-t scroll-mt-20 bg-ground">
      <div className="mx-auto max-w-7xl px-5 pb-10 pt-12 md:px-6">
        <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-3">
          <div className="sm:col-span-2 md:col-span-1">
            <Link href="/" className="font-headline text-[17px] text-ink-12">
              KosanKu
            </Link>
            <p className="mt-3 max-w-xs text-sm text-ink-11 max-md:text-[15px]">
              Kos nyaman dengan harga yang jelas dan pembayaran yang mudah.
            </p>
          </div>

          <nav aria-label="Menu footer">
            <p className={labelClass}>Menu</p>
            <ul className="mt-3 flex flex-col">
              {menu.map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className={linkClass}>
                    {item.label}
                  </Link>
                </li>
              ))}
              <li>
                <button type="button" onClick={() => openModal("daftar")} className={linkClass}>
                  Daftar
                </button>
              </li>
              <li>
                <button type="button" onClick={() => openModal("masuk")} className={linkClass}>
                  Masuk
                </button>
              </li>
            </ul>
          </nav>

          <div>
            <p className={labelClass}>Kontak</p>
            <ul className="mt-3 flex flex-col gap-3">
              <li>
                <a href={`mailto:${EMAIL}`} className={`${kontakClass} transition-colors duration-150 hover:text-ink-12`}>
                  <Mail size={16} className="shrink-0 text-ink-10" aria-hidden="true" />
                  <span className="break-all">{EMAIL}</span>
                </a>
              </li>
              <li>
                <a
                  href={`tel:${TELEPON.replace(/\s/g, "")}`}
                  className={`${kontakClass} transition-colors duration-150 hover:text-ink-12`}
                >
                  <Phone size={16} className="shrink-0 text-ink-10" aria-hidden="true" />
                  {TELEPON}
                </a>
              </li>
              <li className={kontakClass}>
                <MapPin size={16} className="shrink-0 text-ink-10" aria-hidden="true" />
                Dekat kampus dan pusat kota
              </li>
            </ul>
          </div>
        </div>

        <div className="hairline-t mt-10 flex items-center justify-between gap-4 pt-6 pb-[env(safe-area-inset-bottom)]">
          <p className="text-meta">© KosanKu. Semua hak dilindungi.</p>
          <Link href="/#home" className="btn btn-ghost btn-sm max-md:h-11">
            Ke atas
          </Link>
        </div>
      </div>
    </footer>
  );
}
