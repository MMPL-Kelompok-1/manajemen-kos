import { Suspense } from "react";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Product from "@/components/Product";

// Satu halaman yang di-scroll: Hero -> Keunggulan -> Daftar kos
export default function HomePage() {
  return (
    <>
      <Hero />
      <About />
      <Suspense fallback={<p className="px-6 py-20 text-center text-muted-foreground md:py-24">Memuat daftar kos…</p>}>
        <Product />
      </Suspense>
    </>
  );
}
