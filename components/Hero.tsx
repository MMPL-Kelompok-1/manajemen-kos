export default function Hero() {
  return (
    <section
      id="top"
      className="relative grid min-h-[calc(100vh-4rem)] scroll-mt-20 grid-cols-1 lg:grid-cols-2 overflow-hidden bg-[#FBF9F5] text-zinc-900 items-stretch min-w-0"
    >
      {/* Sisi Kiri: Teks & Tombol */}
      <div className="flex flex-col justify-center px-6 py-24 md:px-16 lg:pl-24 z-10">
        {/* Hapus mx-auto di bawah ini agar teks merapat ke kiri dengan rapi */}
        <div className="max-w-xl ml-auto">
          <h1 className="text-4xl font-bold tracking-tight md:text-6xl leading-[1.1]">
            Find Your <br />
            <span className="text-zinc-700">Perfect Sanctuary</span>
          </h1>
          <p className="mt-6 max-w-lg text-lg text-zinc-600">
            Discover handpicked rentals for your next unforgettable stay.
            Comfort, style, and convenience in one place.
          </p>
          <div className="mt-10 flex flex-col items-start justify-start gap-3 sm:flex-row">
            <a
              href="#kos"
              className="rounded-full bg-zinc-900 px-8 py-3 font-medium text-white hover:bg-zinc-800 transition-colors"
            >
              Lihat kos
            </a>
            <a
              href="#daftar"
              className="rounded-full border border-zinc-300 px-8 py-3 font-medium text-zinc-900 hover:bg-zinc-100 transition-colors"
            >
              Daftar sekarang
            </a>
          </div>
        </div>
      </div>

      {/* Sisi Kanan: Gambar dengan Efek Potongan Miring */}
      <div
        className="hidden lg:block relative min-h-full w-full"
        style={{
          backgroundImage: "url('/images/hero.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          clipPath: "polygon(20% 0%, 100% 0%, 100% 100%, 0% 100%)",
        }}
      >
        {/* Overlay tipis agar gambar tidak terlalu kontras */}
        <div className="absolute inset-0 bg-black/10"></div>
      </div>
    </section>
  );
}
