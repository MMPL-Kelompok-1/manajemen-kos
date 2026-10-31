"use client";

import { useAuthModal } from "@/components/auth/AuthModalContext";

export default function Hero() {
  const { openModal } = useAuthModal();

  return (
    <section
      id="home"
      className="relative w-full min-h-[calc(100vh-4rem)] bg-background text-foreground flex items-center overflow-hidden"
      style={{
        backgroundImage: "url('/images/hero.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Overlay gelap agar teks terbaca jelas di atas gambar */}
      <div className="absolute inset-0 bg-background/60"></div>

      {/* Container utama agar teks sejajar dengan section lain di bawahnya */}
      <div className="relative z-10 mx-auto w-full max-w-7xl px-6 py-24 md:px-12 lg:px-8">
        <div className="max-w-xl">
          <h1 className="text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl leading-[1.1] text-foreground">
            Find Your <br />
            <span className="text-muted-foreground">Perfect Sanctuary</span>
          </h1>
          <p className="mt-6 max-w-lg text-lg text-muted-foreground">
            Discover handpicked rentals for your next unforgettable stay.
            Comfort, style, and convenience in one place.
          </p>
          <div className="mt-10 flex flex-col items-start justify-start gap-3 sm:flex-row">
            <a
              href="#kos"
              className="rounded-full bg-primary px-8 py-3 font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Lihat kos
            </a>
            <button
              type="button"
              onClick={() => openModal("daftar")}
              className="rounded-full border border-border px-8 py-3 font-medium text-foreground transition-colors hover:bg-muted"
            >
              Daftar sekarang
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
