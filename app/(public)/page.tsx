import { Suspense } from "react";
import Hero from "@/components/Hero";
import WhyChooseUs from "@/components/WhyChooseUs";
import KosSection from "@/components/KosSection";

// Satu halaman yang di-scroll: Hero -> Keunggulan -> Daftar kos
export default function HomePage() {
  return (
    <>
      <Hero />
      <WhyChooseUs />
      <Suspense fallback={<p className="px-6 py-20 text-center text-muted-foreground md:py-24">Memuat daftar kos…</p>}>
        <KosSection />
      </Suspense>
    </>
  );
}
