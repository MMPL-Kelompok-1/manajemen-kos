import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { MapPin } from "lucide-react";
import ProductGallery from "@/components/ProductGallery";
import { formatRupiah } from "@/lib/format";
import { getKos } from "@/lib/data";

export default function DetailKosPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<DetailSkeleton />}>
      <DetailProduct params={params} />
    </Suspense>
  );
}

async function DetailProduct({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  // getKos membaca waktu sekarang (pesanan tertunda yang masih aktif), jadi halaman ini dinamis.
  await connection();
  const kos = await getKos(decodeURIComponent(id));

  if (!kos) notFound();

  const full = kos.roomsLeft <= 0;
  const specs = (
    [
      ["Jenis kos", kos.gender],
      ["Ukuran kamar", kos.roomSize],
      ["Kamar mandi", kos.bathroom ? `KM ${kos.bathroom}` : ""],
      ["Area", kos.area],
      ["Ketersediaan", full ? "Penuh" : `Sisa ${kos.roomsLeft} kamar`],
      ["Alamat", kos.address],
    ] as const
  ).filter(([, value]) => Boolean(value));

  return (
    <main className="mx-auto max-w-7xl px-5 py-8 md:px-6 md:py-12">
      <Link href="/#product" className="btn btn-pill max-md:h-11">
        Kembali ke daftar kos
      </Link>

      <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_380px] lg:gap-10">
        <div>
          <ProductGallery photos={kos.photos} name={kos.name} />

          <h2 className="text-section mt-8">Spesifikasi</h2>
          <dl className="mt-4 grid gap-x-6 sm:grid-cols-2">
            {specs.map(([label, value]) => (
              <div key={label} className="hairline-b py-3">
                <dt className="text-meta">{label}</dt>
                <dd className="mt-0.5 text-sm text-ink-12 max-md:text-[15px]">{value}</dd>
              </div>
            ))}
          </dl>

          {kos.facilities.length > 0 && (
            <>
              <h2 className="text-section mt-8">Fasilitas</h2>
              <ul className="mt-4 flex flex-wrap gap-1.5">
                {kos.facilities.map((item) => (
                  <li key={item} className="rounded-control bg-ink-3 px-2.5 py-1 text-sm text-ink-11">
                    {item}
                  </li>
                ))}
              </ul>
            </>
          )}

          {kos.description && (
            <>
              <h2 className="text-section mt-8">Deskripsi</h2>
              <p className="mt-2 max-w-[65ch] text-sm text-ink-11 max-md:text-[15px]">{kos.description}</p>
            </>
          )}
        </div>

        <aside className="surface-raised h-fit rounded-container p-5 lg:sticky lg:top-24">
          <div className="flex items-start justify-between gap-3">
            <h1 className="text-section">{kos.name}</h1>
            {kos.gender && <span className="badge badge-neutral shrink-0">{kos.gender}</span>}
          </div>
          {kos.area && (
            <p className="mt-1 flex items-center gap-1 text-sm text-ink-11">
              <MapPin size={14} aria-hidden="true" /> {kos.area}
            </p>
          )}

          <p className="mt-6">
            <span className="text-figure">{formatRupiah(kos.price)}</span>
            <span className="text-meta"> / bulan</span>
          </p>
          <p className="mt-0.5 text-sm text-ink-11">{full ? "Kamar penuh" : `Sisa ${kos.roomsLeft} kamar`}</p>

          {full ? (
            <p className="mt-5 rounded-control bg-ink-3 p-3 text-sm text-ink-11">
              Kamar ini sedang penuh. Pilih kamar lain di daftar kos.
            </p>
          ) : (
            <Link
              href={`/login?tab=daftar&kos=${encodeURIComponent(kos.id)}`}
              className="btn btn-primary mt-5 w-full max-md:h-11"
            >
              Pilih & daftar
            </Link>
          )}
        </aside>
      </div>
    </main>
  );
}

function DetailSkeleton() {
  return (
    <div role="status" className="mx-auto max-w-7xl px-5 py-8 md:px-6 md:py-12">
      <span className="sr-only">Memuat…</span>
      <span className="skeleton h-7 w-40 rounded-full" />
      <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_380px] lg:gap-10">
        <span className="skeleton aspect-[16/10] w-full rounded-feature" />
        <div className="surface-raised h-fit space-y-3 p-5">
          <span className="skeleton h-7 w-48" />
          <span className="skeleton h-5 w-32" />
          <span className="skeleton mt-6 h-8 w-40" />
          <span className="skeleton h-9 w-full" />
        </div>
      </div>
    </div>
  );
}
