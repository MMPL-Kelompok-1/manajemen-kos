import { Search } from "lucide-react";

// Navigasi memakai anchor karena semua konten ada di satu halaman.
const navLinks = [
  { href: "#top", label: "Beranda" },
  { href: "#why", label: "Keunggulan" },
  { href: "#kos", label: "Kos" },
];

export default function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-zinc-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <a href="#top" className="flex items-center gap-2 text-lg font-bold">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-950 text-white">
            <Search size={16} />
          </span>
          StayEase
        </a>

        <nav className="hidden items-center gap-8 text-sm text-zinc-600 md:flex">
          {navLinks.map((link) => (
            <a key={link.href} href={link.href} className="hover:text-zinc-950">
              {link.label}
            </a>
          ))}
        </nav>

        <a
          href="#daftar"
          className="rounded-full bg-zinc-950 px-5 py-2 text-sm font-medium text-white hover:bg-zinc-800"
        >
          Daftar
        </a>
      </div>
    </header>
  );
}
