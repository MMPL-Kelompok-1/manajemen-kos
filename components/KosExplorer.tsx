"use client";

import Link from "next/link";
import { MapPin } from "lucide-react";
import ListingImage from "@/components/ListingImage";
import { formatRupiah } from "@/lib/format";
import type { Kos } from "@/lib/data";

export default function KosExplorer({ items = [] }: { items?: Kos[] }) {
  return (
    <div>
      <p className="mt-2 text-muted-foreground">Pilih kamar untuk melihat spesifikasi dan foto lengkap.</p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items?.map((item) => (
          <article key={item.id} className="overflow-hidden rounded-3xl border border-border">
            <div className="relative aspect-video">
              <ListingImage src={item.photos[0] ?? ""} alt={item.name} />
              <span className="absolute left-4 top-4 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                {item.gender}
              </span>
            </div>
            <div className="p-4">
              <div className="flex items-start justify-between gap-2">
                <p className="font-semibold">{item.name}</p>
                <span className="shrink-0 rounded-full bg-muted px-3 py-1 text-xs font-semibold">
                  {item.roomsLeft > 0 ? `Sisa ${item.roomsLeft}` : "Penuh"}
                </span>
              </div>
              <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                <MapPin size={12} /> {item.area}
              </p>
              <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted-foreground">
                {item.facilities.slice(0, 3).map((f) => (
                  <span key={f}>{f}</span>
                ))}
              </div>
              <p className="mt-4 text-xl font-bold">
                {formatRupiah(item.price)}
                <span className="text-sm font-normal text-muted-foreground"> / bulan</span>
              </p>
              <Link
                href={`/kos/${encodeURIComponent(item.id)}`}
                className="mt-5 block w-full rounded-full bg-primary py-3 text-center text-sm font-medium text-primary-foreground hover:bg-muted hover:text-foreground"
              >
                Lihat detail
              </Link>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
