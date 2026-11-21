"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { KeyRound, MapPin } from "lucide-react";
import ListingImage from "@/components/ListingImage";
import StatusBadge from "@/components/StatusBadge";
import EmptyState from "@/components/ui/EmptyState";
import Notice from "@/components/ui/Notice";
import { DefinitionList } from "@/components/ui/DefinitionList";
import { formatDate, formatRupiah } from "@/lib/format";
import { errorMessage, postJson } from "@/lib/client/http";
import type { UserDashboardData } from "@/lib/data";

type Props = {
  data: UserDashboardData;
  pendingKosId: string | null;
};

const pesanStatus: Record<string, string> = {
  belum_bayar: "Tagihan bulan ini belum dibayar. Transfer sebelum jatuh tempo ya.",
  menunggu_konfirmasi: "Pembayaranmu sedang dikonfirmasi oleh pemilik kos.",
  lunas: "Pembayaran sudah lunas. Tidak ada tagihan yang perlu diselesaikan.",
  terlambat: "Tagihan sudah melewati jatuh tempo. Segera lakukan pembayaran.",
};

export default function KosAnda({ data, pendingKosId }: Props) {
  const router = useRouter();
  const { account, kos, status, dueAt } = data;
  const [busy, setBusy] = useState<boolean>(Boolean(pendingKosId));
  const [error, setError] = useState("");
  const started = useRef(false);

  // Jika penghuni datang dari "Pilih & daftar", buat tagihan sekali saja,
  // lalu arahkan ke halaman Pembayaran supaya langsung bisa membayar.
  useEffect(() => {
    if (!pendingKosId || started.current) return;
    started.current = true;
    (async () => {
      let tujuan = "/dashboard/pembayaran";
      try {
        await postJson("/api/payments", { kosId: pendingKosId });
      } catch (err) {
        setError(errorMessage(err, "Gagal membuat tagihan."));
        tujuan = "/dashboard";
      } finally {
        setBusy(false);
        router.replace(tujuan);
        router.refresh();
      }
    })();
  }, [pendingKosId, router]);

  const fasilitas = kos?.facilities ?? [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-section">
          Halo, <span className="capitalize">{account.name}</span>
        </h1>
        <p className="mt-1.5 text-sm text-ink-11">Semua informasi tentang kos dan pembayaranmu ada di sini.</p>
      </div>

      {busy && <Notice>Membuat tagihan untuk kos pilihanmu…</Notice>}
      {error && <Notice tone="red">{error}</Notice>}

      {kos ? (
        <>
          <section className="surface-raised flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-title">Status pembayaran</h2>
                <StatusBadge status={status} />
              </div>
              <p className="mt-1 max-w-md text-sm text-ink-11">
                {pesanStatus[status] ?? "Lihat detail tagihanmu di halaman pembayaran."}
              </p>
            </div>
            <Link
              href="/dashboard/pembayaran"
              className={`btn shrink-0 max-sm:w-full ${
                status === "belum_bayar" || status === "terlambat" ? "btn-primary" : "btn-secondary"
              }`}
            >
              Lihat pembayaran
            </Link>
          </section>

          <section className="surface-raised overflow-hidden">
            <div className="relative h-44 sm:h-60">
              <ListingImage src={kos.photos?.[0] ?? ""} alt={kos.name} />
            </div>
            <div className="p-5">
              <h2 className="text-title">{kos.name}</h2>
              {kos.area && (
                <p className="mt-0.5 flex items-center gap-1 text-sm text-ink-11">
                  <MapPin size={14} className="shrink-0 text-ink-10" aria-hidden="true" /> {kos.area}
                </p>
              )}

              <DefinitionList
                size="lead"
                className="mt-5 grid grid-cols-2 gap-x-4 gap-y-5 lg:grid-cols-4"
                items={[
                  { label: "Nomor kamar", value: account.roomNumber ?? "Belum ditentukan" },
                  { label: "Harga / bulan", value: formatRupiah(kos.price) },
                  { label: "Ukuran kamar", value: kos.roomSize || "–" },
                  { label: "Jatuh tempo", value: formatDate(dueAt) },
                ]}
              />

              {(kos.gender || kos.bathroom || fasilitas.length > 0) && (
                <ul aria-label="Fasilitas" className="hairline-t mt-5 flex flex-wrap gap-1.5 pt-5">
                  {kos.gender && <li className="chip">{kos.gender}</li>}
                  {kos.bathroom && <li className="chip">KM {kos.bathroom}</li>}
                  {fasilitas.map((item) => (
                    <li key={item} className="chip">
                      {item}
                    </li>
                  ))}
                </ul>
              )}

              {(kos.address || kos.description) && (
                <div className="hairline-t mt-5 pt-5">
                  {kos.address && (
                    <>
                      <p className="text-sm text-ink-10">Alamat</p>
                      <p className="mt-0.5 text-sm text-ink-12">{kos.address}</p>
                    </>
                  )}
                  {kos.description && <p className="mt-3 text-sm text-ink-11">{kos.description}</p>}
                </div>
              )}
            </div>
          </section>
        </>
      ) : (
        <EmptyState
          icon={KeyRound}
          headingLevel="h2"
          title="Kamu belum memilih kos"
          description="Pilih kamar yang sesuai, lalu daftar dan bayar langsung dari akunmu."
          action={
            <Link href="/#product" className="btn btn-primary">
              Lihat kos yang tersedia
            </Link>
          }
        />
      )}
    </div>
  );
}
