import Link from "next/link";

export default function Hero() {
  return (
    <section
      id="top"
      className="relative flex min-h-[88svh] scroll-mt-20 items-center justify-center overflow-hidden bg-zinc-800 px-5 py-20 text-center text-white sm:min-h-[calc(100svh-4rem)] md:px-6 md:py-24"
      style={{
        backgroundImage:
          "linear-gradient(rgba(9,9,11,0.45), rgba(9,9,11,0.7)), url('/images/hero.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="mx-auto max-w-4xl">
        <h1 className="text-4xl font-bold leading-tight tracking-tight sm:text-5xl md:text-7xl">
          Find Your Perfect Sanctuary
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-base text-zinc-200 md:mt-6 md:text-lg">
          Discover handpicked rentals for your next unforgettable stay.
          Comfort, style, and convenience in one place.
        </p>
        <div className="mx-auto mt-8 flex max-w-xs flex-col items-stretch gap-3 sm:max-w-none sm:flex-row sm:justify-center md:mt-10">
          <Link
            href="/#kos"
            className="rounded-full bg-white px-8 py-3 text-center font-medium text-zinc-950 hover:bg-zinc-100"
          >
            Lihat kos
          </Link>
          <Link
            href="/login?tab=daftar"
            className="rounded-full border border-white/40 px-8 py-3 text-center font-medium text-white hover:bg-white/10"
          >
            Daftar sekarang
          </Link>
        </div>
      </div>
    </section>
  );
}
