export default function Hero() {
  return (
    <section
      id="top"
      className="relative flex min-h-[calc(100vh-4rem)] scroll-mt-20 items-center justify-center overflow-hidden bg-zinc-800 px-6 py-24 text-center text-white"
      style={{
        backgroundImage:
          "linear-gradient(rgba(9,9,11,0.45), rgba(9,9,11,0.65)), url('/images/hero.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="mx-auto max-w-4xl">
        <h1 className="text-5xl font-bold tracking-tight md:text-7xl">Find Your Perfect Sanctuary</h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-zinc-200">
          Discover handpicked rentals for your next unforgettable stay.
          Comfort, style, and convenience in one place.
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <a href="#kos" className="rounded-full bg-white px-8 py-3 font-medium text-zinc-950 hover:bg-zinc-100">
            Lihat kos
          </a>
          <a href="#daftar" className="rounded-full border border-white/40 px-8 py-3 font-medium text-white hover:bg-white/10">
            Daftar sekarang
          </a>
        </div>
      </div>
    </section>
  );
}
