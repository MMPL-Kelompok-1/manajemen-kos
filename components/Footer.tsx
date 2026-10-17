export default function Footer() {
  return (
    <footer id="kontak" className="scroll-mt-20 bg-zinc-950 text-zinc-400">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-14 md:grid-cols-3">
        <div>
          <p className="text-lg font-bold text-white">StayEase</p>
          <p className="mt-3 max-w-xs text-sm">
            Kos nyaman dengan harga yang jelas dan pembayaran yang mudah.
          </p>
        </div>
        <div className="flex flex-col gap-2 text-sm">
          <p className="mb-1 font-semibold text-white">Menu</p>
          <a href="#kos" className="hover:text-white">Kos</a>
          <a href="#why" className="hover:text-white">Keunggulan</a>
          <a href="#daftar" className="hover:text-white">Daftar</a>
        </div>
        <div className="flex flex-col gap-2 text-sm">
          <p className="mb-1 font-semibold text-white">Kontak</p>
          {/* Ganti dengan data kontak asli */}
          <p>hello@stayease.example</p>
          <p>+62 000 0000 0000</p>
        </div>
      </div>
      <div className="border-t border-zinc-800 py-6 text-center text-xs">
        © StayEase. All rights reserved.
      </div>
    </footer>
  );
}
