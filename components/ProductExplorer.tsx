"use client";

import Link from "next/link";
import { MapPin } from "lucide-react";
import ListingImage from "@/components/ListingImage";
import EmptyState from "@/components/ui/EmptyState";
import { formatRupiah } from "@/lib/format";
import type { Kos } from "@/lib/data";

export default function ProductExplorer({ items = [] }: { items?: Kos[] }) {
  return (
    <section id="product" className="mx-auto max-w-7xl scroll-mt-20 px-5 py-16 md:px-6 md:py-24">
      <div className="max-w-2xl">
        <h2 className="font-headline text-section">Pilihan kamar</h2>
        <p className="mt-1.5 text-sm text-ink-11 max-md:text-[15px]">
          Harga per bulan, fasilitas, dan sisa kamar untuk setiap kos.
        </p>
      </div>

      {items.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            title="Belum ada kamar yang tersedia"
            description="Kamar baru akan tampil di sini setelah ditambahkan pemilik kos."
          />
        </div>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => {
            const href = `/kos/${encodeURIComponent(item.id)}`;
            const full = item.roomsLeft <= 0;
            return (
              <article
                key={item.id}
                className="surface-raised press-card relative flex flex-col overflow-hidden rounded-container"
              >
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-well">
                  <ListingImage src={item.photos[0] ?? ""} alt={item.name} />
                  <div className="absolute left-3 top-3 flex gap-1.5">
                    <span className="badge badge-neutral">{item.gender}</span>
                    <span className={`badge ${full ? "badge-red" : "badge-neutral"}`}>
                      {full ? "Penuh" : `Sisa ${item.roomsLeft} kamar`}
                    </span>
                  </div>
                </div>

                <div className="flex flex-1 flex-col p-4">
                  <h3 className="text-title">
                    {/* Seluruh kartu bisa diklik lewat tautan ini */}
                    <Link href={href} className="after:absolute after:inset-0 hover:text-ink-11 transition-colors duration-150">
                      {item.name}
                    </Link>
                  </h3>
                  <p className="mt-0.5 flex items-center gap-1.5 text-sm text-ink-11">
                    <MapPin size={14} className="shrink-0 text-ink-10" aria-hidden="true" />
                    <span className="truncate">{item.area}</span>
                  </p>

                  <ul className="mt-3 flex flex-wrap gap-1.5">
                    {item.facilities.slice(0, 3).map((f) => (
                      <li key={f} className="rounded-control bg-ink-3 px-2 py-0.5 text-xs text-ink-11">
                        {f}
                      </li>
                    ))}
                    {item.facilities.length > 3 && (
                      <li className="px-1 py-0.5 text-xs text-ink-10">+{item.facilities.length - 3} lainnya</li>
                    )}
                  </ul>

                  <div className="hairline-t mt-4 flex items-end justify-between gap-3 pt-3">
                    <p>
                      <span className="text-figure">{formatRupiah(item.price)}</span>
                      <span className="text-meta"> / bulan</span>
                    </p>
                    <span className="text-sm text-ink-11">Lihat detail</span>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
