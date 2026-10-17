import { Suspense } from "react";
import Hero from "@/components/Hero";
import WhyChooseUs from "@/components/WhyChooseUs";
import KosSection from "@/components/KosSection";

// Satu halaman yang di-scroll: Hero -> Keunggulan -> Kos -> Pendaftaran & pembayaran
export default function HomePage() {
  return (
    <>
      <Hero />
      <WhyChooseUs />
      <Suspense fallback={<p className="px-6 py-24 text-center text-zinc-400">Memuat daftar kos…</p>}>
        <KosSection />
      </Suspense>
    </>
  );
}
