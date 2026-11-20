"use client";

import { useAuthModal } from "@/components/auth/AuthModalContext";

export default function Hero() {
  const { openModal } = useAuthModal();

  return (
    <section id="home" className="mx-auto w-full max-w-7xl px-5 pt-6 md:px-6 md:pt-8">
      <div
        className="relative flex min-h-[calc(100svh-7rem)] items-end overflow-hidden rounded-feature bg-well bg-cover bg-center md:min-h-[560px] md:items-center"
        style={{ backgroundImage: "url('/images/hero.jpg')" }}
      >
        <div className="relative w-full p-3 md:p-12">
          <div className="surface-overlay max-w-xl p-5 md:p-8">
            <h1 className="font-headline text-display md:text-[44px] md:leading-[52px]">
              <span className="text-ink-11">Temukan kos</span> yang pas untukmu
            </h1>
            <p className="mt-4 max-w-md text-sm text-ink-11 max-md:text-[15px]">
              Lihat harga dan fasilitas tiap kamar, daftar, lalu bayar lewat transfer dengan konfirmasi pemilik.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a href="#product" className="btn btn-primary max-md:h-11 max-md:w-full">
                Lihat kos
              </a>
              <button
                type="button"
                onClick={() => openModal("daftar")}
                className="btn btn-secondary max-md:h-11 max-md:w-full"
              >
                Daftar sekarang
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
