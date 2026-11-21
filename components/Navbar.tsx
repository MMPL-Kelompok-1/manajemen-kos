"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useEffect, useState, type MouseEvent } from "react";
import ThemeToggle from "@/components/ThemeToggle";
import { useAuthModal } from "@/components/auth/AuthModalContext";

// Hanya bagian yang benar-benar ada di landing page.
const NAV_ITEMS = [
  { id: "home", label: "Beranda" },
  { id: "about", label: "Tentang" },
  { id: "product", label: "Daftar kos" },
  { id: "contact", label: "Kontak" },
] as const;

// Navbar publik selalu menampilkan Masuk dan Daftar. Pengguna yang sudah login
// diarahkan ke dashboard oleh halaman /login.
export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { openModal } = useAuthModal();
  const router = useRouter();

  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mobileOpen]);

  // Pathname dibaca saat klik (bukan lewat usePathname) agar layout publik tetap bisa di-prerender.
  const handleNavClick = (e: MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    setMobileOpen(false);
    if (window.location.pathname === "/") {
      document.getElementById(targetId)?.scrollIntoView({ block: "start" });
      window.history.pushState(null, "", `/#${targetId}`);
    } else {
      router.push(`/#${targetId}`);
    }
  };

  return (
    <header className="hairline-b sticky top-0 z-50 bg-ground/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-6 px-5 md:px-6">
        <Link href="/" className="font-headline text-[17px] text-ink-12">
          KosanKu
        </Link>

        <nav aria-label="Navigasi utama" className="hidden items-center gap-6 text-sm text-ink-11 md:flex">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.id}
              href={`/#${item.id}`}
              onClick={(e) => handleNavClick(e, item.id)}
              className="transition-colors duration-150 hover:text-ink-12"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button
            type="button"
            onClick={() => openModal("masuk")}
            className="btn btn-ghost btn-sm hidden sm:inline-flex"
          >
            Masuk
          </button>
          <button
            type="button"
            onClick={() => openModal("daftar")}
            className="btn btn-secondary btn-sm max-md:h-11"
          >
            Daftar
          </button>
          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label={mobileOpen ? "Tutup menu" : "Buka menu"}
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav"
            className="btn btn-ghost btn-icon h-11! w-11! md:hidden"
          >
            {mobileOpen ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <nav id="mobile-nav" aria-label="Navigasi utama" className="hairline-t animate-fade-in bg-panel px-5 py-3 md:hidden">
          <ul className="flex flex-col gap-1">
            {NAV_ITEMS.map((item) => (
              <li key={item.id}>
                <Link
                  href={`/#${item.id}`}
                  onClick={(e) => handleNavClick(e, item.id)}
                  className="flex min-h-11 items-center rounded-control px-3 text-[15px] text-ink-12 transition-colors duration-150 hover:bg-ink-3"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="hairline-t mt-3 flex flex-col gap-3 pt-3">
            <button
              type="button"
              onClick={() => {
                openModal("masuk");
                setMobileOpen(false);
              }}
              className="btn btn-secondary h-11 w-full"
            >
              Masuk
            </button>
          </div>
        </nav>
      )}
    </header>
  );
}
