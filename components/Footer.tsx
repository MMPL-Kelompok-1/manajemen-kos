import Link from "next/link";

export default function Footer() {
  return (
    <footer id="kontak" className="scroll-mt-20 bg-zinc-950 text-zinc-400">
      <div className="mx-auto grid max-w-7xl gap-8 px-5 py-12 sm:grid-cols-2 md:grid-cols-3 md:gap-10 md:px-6 md:py-14">
        <div>
          <p className="text-lg font-bold text-white">KosanKu</p>
          <p className="mt-3 max-w-xs text-sm">
            Kos nyaman dengan harga yang jelas dan pembayaran yang mudah.
          </p>
        </div>
        <div className="flex flex-col gap-2 text-sm">
          <p className="mb-1 font-semibold text-white">Menu</p>
          <Link href="/#kos" className="hover:text-white">Kos</Link>
          <Link href="/#why" className="hover:text-white">Keunggulan</Link>
          <Link href="/login?tab=daftar" className="hover:text-white">Daftar</Link>
          <Link href="/admin/login" className="hover:text-white">Login pemilik kos</Link>
        </div>
        <div className="flex flex-col gap-2 text-sm">
          <p className="mb-1 font-semibold text-white">Kontak</p>
          {/* Ganti dengan data kontak asli */}
          <p className="break-all">hello@KosanKu.example</p>
          <p>+62 000 0000 0000</p>
        </div>
      </div>
      <div className="border-t border-zinc-800 py-6 text-center text-xs">
        © KosanKu. All rights reserved.
      </div>
    </footer>
  );
}
