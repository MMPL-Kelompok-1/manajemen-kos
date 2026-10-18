"use client";

import { useAuthModal } from "@/components/auth/AuthModalContext";

export default function Hero() {
  const { openModal } = useAuthModal();

  return (
    <section
      id="top"
      className="relative flex min-h-[calc(100vh-4rem)] w-full items-center overflow-hidden bg-zinc-900 text-white"
      style={{
        backgroundImage: "url('/images/hero.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Overlay gelap agar teks terbaca jelas di atas gambar */}
      <div className="absolute inset-0 bg-black/70"></div>

      {/* Container utama agar teks sejajar dengan section lain di bawahnya */}
      <div className="relative z-10 mx-auto w-full max-w-7xl px-6 py-24 md:px-12 lg:px-8">
        <div className="max-w-xl">
          <h1 className="text-4xl font-bold leading-[1.1] tracking-tight text-white md:text-5xl lg:text-6xl">
            Find Your <br />
            <span className="text-zinc-200">Perfect Sanctuary</span>
          </h1>
          <p className="mt-6 max-w-lg text-lg text-zinc-200">
            Discover handpicked rentals for your next unforgettable stay.
            Comfort, style, and convenience in one place.
          </p>
          <div className="mt-10 flex flex-col items-start justify-start gap-3 sm:flex-row">
            <a
              href="#kos"
              className="rounded-full bg-white px-8 py-3 font-medium text-zinc-900 transition-colors hover:bg-zinc-100"
            >
              Lihat kos
            </a>
            <button
              type="button"
              onClick={() => openModal("daftar")}
              className="rounded-full border border-white/40 px-8 py-3 font-medium text-white transition-colors hover:bg-white/10"
            >
              Daftar sekarang
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
