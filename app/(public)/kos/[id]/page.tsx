import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, MapPin } from "lucide-react";
import KosGallery from "@/components/KosGallery";
import { formatRupiah } from "@/lib/format";
// TODO: ganti getKosList dengan fungsi yang dipakai app/(public)/page.tsx
// untuk mengambil daftar kos dari "@/lib/data".
import { getKosList } from "@/lib/data";

export default function DetailKosPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<div className="mx-auto max-w-7xl px-5 py-16 md:px-6">Memuat...</div>}>
      <DetailKos params={params} />
    </Suspense>
  );
}

async function DetailKos({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const kosList = await getKosList();
  const kos = kosList.find((item) => item.id === decodeURIComponent(id));

  if (!kos) notFound();

  const full = kos.roomsLeft <= 0;
  const specs = [
    ["Jenis kos", kos.gender],
    ["Ukuran kamar", kos.roomSize],
    ["Kamar mandi", `KM ${kos.bathroom}`],
    ["Area", kos.area],
    ["Ketersediaan", full ? "Penuh" : `Sisa ${kos.roomsLeft} kamar`],
    ["Alamat", kos.address],
  ];

  return (
    <main className="mx-auto max-w-7xl px-5 py-8 md:px-6 md:py-12">
      <Link
        href="/#kos"
        className="inline-flex items-center gap-2 text-sm font-medium text-zinc-600 hover:text-zinc-950"
      >
        <ArrowLeft size={16} /> Kembali ke daftar kos
      </Link>

      <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_380px] lg:gap-12">
        {/* Kolom kiri: foto, spesifikasi, fasilitas, deskripsi */}
        <div>
          <KosGallery photos={kos.photos} name={kos.name} />

          <h2 className="mt-10 text-xl font-bold">Spesifikasi</h2>
          <dl className="mt-4 grid gap-4 sm:grid-cols-2">
            {specs.map(([label, value]) => (
              <div key={label} className="border-b border-zinc-100 pb-3">
                <dt className="text-sm text-zinc-500">{label}</dt>
                <dd className="font-semibold">{value}</dd>
              </div>
            ))}
          </dl>

          <h2 className="mt-10 text-xl font-bold">Fasilitas</h2>
          <ul className="mt-4 flex flex-wrap gap-2">
            {kos.facilities.map((item) => (
              <li key={item} className="rounded-full border border-zinc-200 px-4 py-1.5 text-sm">
                {item}
              </li>
            ))}
          </ul>

          <h2 className="mt-10 text-xl font-bold">Deskripsi</h2>
          <p className="mt-4 leading-relaxed text-zinc-600">{kos.description}</p>
        </div>

        {/* Kolom kanan: ringkasan harga dan tombol daftar */}
        <aside className="h-fit rounded-3xl border border-zinc-200 p-6 lg:sticky lg:top-24">
          <div className="flex items-start justify-between gap-3">
            <h1 className="text-2xl font-bold tracking-tight">{kos.name}</h1>
            <span className="shrink-0 rounded-full bg-zinc-100 px-3 py-1 text-xs font-semibold">
              {kos.gender}
            </span>
          </div>
          <p className="mt-1 flex items-center gap-1 text-sm text-zinc-500">
            <MapPin size={14} /> {kos.area}
          </p>

          <p className="mt-6 text-3xl font-bold">
            {formatRupiah(kos.price)}
            <span className="text-sm font-normal text-zinc-500"> / bulan</span>
          </p>
          <p className="mt-1 text-sm text-zinc-500">
            {full ? "Kamar penuh" : `Sisa ${kos.roomsLeft} kamar`}
          </p>

          {full ? (
            <span className="mt-6 block rounded-full bg-zinc-200 py-3 text-center text-sm font-medium text-zinc-500">
              Kamar penuh
            </span>
          ) : (
            <Link
              href={`/login?tab=daftar&kos=${encodeURIComponent(kos.id)}`}
              className="mt-6 block rounded-full bg-zinc-950 py-3 text-center text-sm font-medium text-white hover:bg-zinc-800"
            >
              Pilih & daftar
            </Link>
          )}
        </aside>
      </div>
    </main>
  );
}
