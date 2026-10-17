"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Bath, MapPin, Ruler, Users, X } from "lucide-react";
import ListingImage from "./ListingImage";
import { formatRupiah } from "@/lib/format";
import type { Kos } from "@/lib/data";

// Daftar kos + spesifikasi. Pendaftaran & pembayaran dilakukan dari akun penghuni.
export default function KosExplorer({ kos }: { kos: Kos[] }) {
  const router = useRouter();
  const [detail, setDetail] = useState<Kos | null>(null);

  function chooseKos(item: Kos) {
    setDetail(null);
    router.push(`/login?tab=daftar&kos=${encodeURIComponent(item.id)}`);
  }

  return (
    <section id="kos" className="mx-auto max-w-7xl scroll-mt-20 px-5 py-16 md:px-6 md:py-24">
      <p className="text-sm font-bold uppercase tracking-wider">Pilihan kos</p>
      <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">Kos yang tersedia</h2>
      <p className="mt-2 text-zinc-500">Lihat spesifikasi dan foto sebelum memilih.</p>

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

                <div className="mt-5 grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setDetail(item)}
                    className="rounded-full border border-zinc-200 py-2.5 text-sm font-medium hover:bg-zinc-50"
                  >
                    Spesifikasi
                  </button>
                  <button
                    type="button"
                    disabled={full}
                    onClick={() => chooseKos(item)}
                    className="rounded-full bg-zinc-950 py-2.5 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-40"
                  >
                    Pilih & daftar
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {detail && (
        <KosDetail
          kos={detail}
          onClose={() => setDetail(null)}
          onChoose={() => chooseKos(detail)}
        />
      )}
    </section>
  );
}

function KosDetail({
  kos,
  onClose,
  onChoose,
}: {
  kos: Kos;
  onClose: () => void;
  onChoose: () => void;
}) {
  const [active, setActive] = useState(0);
  const photos = kos.photos.length > 0 ? kos.photos : [""];
  const full = kos.roomsLeft <= 0;

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    // Kunci scroll halaman saat modal terbuka.
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [onClose]);

  const specs = [
    ["Jenis kos", kos.gender],
    ["Ukuran kamar", kos.roomSize],
    ["Kamar mandi", `KM ${kos.bathroom}`],
    ["Area", kos.area],
    ["Ketersediaan", full ? "Penuh" : `Sisa ${kos.roomsLeft} kamar`],
    ["Alamat", kos.address],
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Spesifikasi ${kos.name}`}
      onClick={onClose}
      className="fixed inset-0 z-[60] flex items-end justify-center bg-black/60 sm:items-center sm:p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-t-3xl bg-white sm:max-w-3xl sm:rounded-3xl"
      >
        <div className="flex items-start justify-between gap-4 border-b border-zinc-200 p-5 sm:p-6">
          <div className="min-w-0">
            <h3 className="truncate text-xl font-bold sm:text-2xl">{kos.name}</h3>
            <p className="text-sm text-zinc-500">{kos.area}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup"
            className="shrink-0 rounded-full p-2 hover:bg-zinc-100"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 sm:p-6">
          <div className="aspect-[16/10] overflow-hidden rounded-2xl">
            <ListingImage src={photos[active]} alt={`${kos.name} - foto ${active + 1}`} />
          </div>

          {photos.length > 1 && (
            <div className="mt-3 grid grid-cols-4 gap-2">
              {photos.map((photo, index) => (
                <button
                  key={`${photo}-${index}`}
                  type="button"
                  onClick={() => setActive(index)}
                  aria-label={`Lihat foto ${index + 1}`}
                  className={`aspect-[4/3] overflow-hidden rounded-lg border-2 ${
                    index === active ? "border-zinc-950" : "border-transparent"
                  }`}
                >
                  <ListingImage src={photo} alt={`Foto ${index + 1}`} />
                </button>
              ))}
            </div>
          )}

          <dl className="mt-8 grid gap-4 sm:grid-cols-2">
            {specs.map(([label, value]) => (
              <div key={label} className="border-b border-zinc-100 pb-3">
                <dt className="text-sm text-zinc-500">{label}</dt>
                <dd className="font-semibold">{value}</dd>
              </div>
            ))}
          </dl>

          <h4 className="mt-8 font-bold">Fasilitas</h4>
          <ul className="mt-3 flex flex-wrap gap-2">
            {kos.facilities.map((item) => (
              <li key={item} className="rounded-full border border-zinc-200 px-4 py-1.5 text-sm">
                {item}
              </li>
            ))}
          </ul>

          <h4 className="mt-8 font-bold">Deskripsi</h4>
          <p className="mt-3 leading-relaxed text-zinc-600">{kos.description}</p>
        </div>

        <div className="flex items-center justify-between gap-4 border-t border-zinc-200 p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] sm:p-6">
          <p className="text-lg font-bold sm:text-xl">
            {formatRupiah(kos.price)}
            <span className="text-sm font-normal text-zinc-500"> / bulan</span>
          </p>
          <button
            type="button"
            disabled={full}
            onClick={onChoose}
            className="rounded-full bg-zinc-950 px-5 py-3 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-40 sm:px-6"
          >
            Pilih & daftar
          </button>
        </div>
      </div>
    </div>
  );
}
