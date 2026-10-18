import Link from "next/link";
import { Bath, MapPin, Ruler, Users } from "lucide-react";
import ListingImage from "./ListingImage";
import { formatRupiah } from "@/lib/format";
import type { Kos } from "@/lib/data";

// Daftar kos di landing page. Detail, foto, dan pendaftaran ada di halaman /kos/[id].
export default function KosExplorer({ kos }: { kos: Kos[] }) {
  return (
    <section id="kos" className="mx-auto max-w-7xl scroll-mt-20 px-5 py-16 md:px-6 md:py-24">
      <p className="text-sm font-bold uppercase tracking-wider">Pilihan kos</p>
      <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">Kamar yang tersedia</h2>
      <p className="mt-2 text-zinc-500">Pilih kamar untuk melihat spesifikasi dan foto lengkap.</p>

      <div className="mt-10 grid gap-6 sm:grid-cols-2 md:mt-12 lg:grid-cols-3 lg:gap-8">
        {kos.map((item) => {
          const full = item.roomsLeft <= 0;
          return (
            <article key={item.id} className="overflow-hidden rounded-3xl border border-zinc-200">
              <div className="relative aspect-[4/3]">
                <ListingImage src={item.photos[0] ?? ""} alt={item.name} />
                {full && (
                  <span className="absolute left-4 top-4 rounded-full bg-zinc-950 px-3 py-1 text-xs font-semibold text-white">
                    Penuh
                  </span>
                )}
              </div>

              <div className="p-5 sm:p-6">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-xl font-bold">{item.name}</h3>
                  <span className="shrink-0 rounded-full bg-zinc-100 px-3 py-1 text-xs font-semibold">
                    {item.gender}
                  </span>
                </div>
                <p className="mt-1 flex items-center gap-1 text-sm text-zinc-500">
                  <MapPin size={14} /> {item.area}
                </p>

                <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-sm text-zinc-600">
                  <span className="flex items-center gap-1"><Ruler size={15} /> {item.roomSize}</span>
                  <span className="flex items-center gap-1"><Bath size={15} /> KM {item.bathroom}</span>
                  <span className="flex items-center gap-1">
                    <Users size={15} /> {full ? "Penuh" : `Sisa ${item.roomsLeft} kamar`}
                  </span>
                </div>

                <p className="mt-5 text-2xl font-bold">
                  {formatRupiah(item.price)}
                  <span className="text-sm font-normal text-zinc-500"> / bulan</span>
                </p>

                <Link
                  href={`/kos/${encodeURIComponent(item.id)}`}
                  className="mt-5 block w-full rounded-full bg-zinc-950 py-3 text-center text-sm font-medium text-white hover:bg-zinc-800"
                >
                  Lihat detail
                </Link>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
