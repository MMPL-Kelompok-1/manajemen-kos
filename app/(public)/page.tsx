import { Suspense } from "react";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Product from "@/components/Product";

export default function HomePage() {
  return (
    <>
      <Hero />
      <About />
      <Suspense fallback={<ProductSkeleton />}>
        <Product />
      </Suspense>
    </>
  );
}

// id="product" ikut ada saat memuat supaya tautan #product dari menu tetap mendarat.
function ProductSkeleton() {
  return (
    <section id="product" role="status" className="mx-auto max-w-7xl scroll-mt-20 px-5 py-16 md:px-6 md:py-24">
      <span className="sr-only">Memuat daftar kos…</span>
      <span className="skeleton h-7 w-48" />
      <span className="skeleton mt-2 h-5 w-80 max-w-full" />
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="surface-raised overflow-hidden">
            <span className="skeleton aspect-[16/10] w-full rounded-none" />
            <div className="space-y-2 p-4">
              <span className="skeleton h-6 w-40" />
              <span className="skeleton h-5 w-28" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
