import Link from "next/link";

export default function Hero() {
  return (
    <section
      id="top"
      className="relative w-full min-h-[calc(100vh-4rem)] bg-ctp-mantle text-ctp-text flex items-center overflow-hidden"
      style={{
        backgroundImage: "url('/images/hero.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Overlay gelap agar teks terbaca jelas di atas gambar */}
      <div className="absolute inset-0 bg-ctp-crust/70"></div>

      {/* Container utama agar teks sejajar dengan section lain di bawahnya */}
      <div className="relative max-w-7xl mx-auto w-full px-6 py-24 md:px-12 lg:px-8 z-10">
        <div className="max-w-xl">
          <h1 className="text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl leading-[1.1] text-ctp-text">
            Find Your <br />
            <span className="text-ctp-subtext0">Perfect Sanctuary</span>
          </h1>
          <p className="mt-6 max-w-lg text-lg text-ctp-subtext0">
            Discover handpicked rentals for your next unforgettable stay.
            Comfort, style, and convenience in one place.
          </p>
          <div className="mt-10 flex flex-col items-start justify-start gap-3 sm:flex-row">
            <a
              href="#kos"
              className="rounded-full bg-ctp-base text-ctp-text px-8 py-3 font-medium hover:bg-ctp-mantle transition-colors"
            >
              Lihat kos
            </a>
            <a
              href="#daftar"
              className="rounded-full border border-ctp-text/40 px-8 py-3 font-medium text-ctp-text hover:bg-ctp-base/10 transition-colors"
            >
              Daftar sekarang
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
