"use client";

import Link from "next/link";
import { MapPin, ArrowRight } from "lucide-react";
import ListingImage from "@/components/ListingImage";
import { formatRupiah } from "@/lib/format";
import type { Kos } from "@/lib/data";

export default function ProductExplorer({ items = [] }: { items?: Kos[] }) {
  return (
    <section id="product" className="mx-auto max-w-7xl scroll-mt-20 px-5 py-16 md:px-6 md:py-24">
      {/* Header Section terpusat */}
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-sm font-bold uppercase tracking-wider text-primary">
          Pilihan Kamar
        </p>
        <h2 className="mt-3 text-3xl font-bold leading-tight tracking-tight sm:text-4xl md:text-5xl">
          Temukan Kamar Impian Anda
        </h2>
        <p className="mt-4 text-base text-muted-foreground md:text-lg">
          Pilih kamar nyaman dengan fasilitas terbaik, harga transparan, dan lokasi strategis.
        </p>
      </div>

      {/* Grid Kamar yang rapi & simetris */}
      {items.length === 0 ? (
        <div className="mt-12 rounded-3xl border border-dashed border-border py-16 text-center">
          <p className="text-muted-foreground">Belum ada kamar yang tersedia saat ini.</p>
        </div>
      ) : (
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <article
              key={item.id}
              className="group flex flex-col overflow-hidden rounded-3xl border border-border bg-card transition duration-300 hover:-translate-y-1 hover:border-primary/50 hover:shadow-lg"
            >
              {/* Gambar & Label */}
              <div className="relative aspect-[16/10] w-full overflow-hidden bg-muted">
                <ListingImage
                  src={item.photos[0] ?? ""}
                  alt={item.name}
                  className="transition duration-500 group-hover:scale-105"
                />
                <span className="absolute left-4 top-4 rounded-full bg-primary/95 px-3 py-1 text-xs font-semibold text-primary-foreground backdrop-blur-sm shadow-sm">
                  {item.gender}
                </span>
                <span className="absolute right-4 top-4 rounded-full bg-background/90 px-3 py-1 text-xs font-semibold text-foreground backdrop-blur-sm shadow-sm">
                  {item.roomsLeft > 0 ? `Sisa ${item.roomsLeft} kamar` : "Kamar Penuh"}
                </span>
              </div>

              {/* Konten Kartu */}
              <div className="flex flex-1 flex-col p-6">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-lg font-bold text-card-foreground group-hover:text-primary transition-colors">
                    {item.name}
                  </h3>
                </div>

                <p className="mt-1.5 flex items-center gap-1.5 text-sm text-muted-foreground">
                  <MapPin size={14} className="shrink-0 text-primary" />
                  <span className="truncate">{item.area}</span>
                </p>

                {/* Fasilitas */}
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {item.facilities.slice(0, 3).map((f) => (
                    <span
                      key={f}
                      className="rounded-lg bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground"
                    >
                      {f}
                    </span>
                  ))}
                  {item.facilities.length > 3 && (
                    <span className="rounded-lg bg-muted px-2 py-1 text-xs font-medium text-muted-foreground">
                      +{item.facilities.length - 3} lainnya
                    </span>
                  )}
                </div>

                {/* Footer Kartu: Harga & Tombol */}
                <div className="mt-6 flex flex-col gap-4 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <span className="text-xs text-muted-foreground block">Mulai dari</span>
                    <p className="text-xl font-bold text-foreground">
                      {formatRupiah(item.price)}
                      <span className="text-xs font-normal text-muted-foreground"> / bulan</span>
                    </p>
                  </div>
                  <Link
                    href={`/kos/${encodeURIComponent(item.id)}`}
                    className="inline-flex items-center justify-center gap-1.5 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                  >
                    Lihat detail
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
