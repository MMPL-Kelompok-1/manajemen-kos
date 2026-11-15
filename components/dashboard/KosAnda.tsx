"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Bath,
  CalendarClock,
  DoorOpen,
  KeyRound,
  MapPin,
  Ruler,
  Sparkles,
  Wallet,
} from "lucide-react";
import ListingImage from "@/components/ListingImage";
import StatusBadge from "@/components/StatusBadge";
import { formatDate, formatRupiah } from "@/lib/format";
import type { UserDashboardData } from "@/lib/data";
import { postJson } from "./postJson";

type Props = {
  data: UserDashboardData;
  pendingKosId: string | null;
};

// Data tambahan kos (ada di data kos, dibaca dengan aman jika sebagian kosong).
type KosExtra = {
  photos?: string[];
  facilities?: string[];
  gender?: string;
  bathroom?: string;
  description?: string;
};

const pesanStatus: Record<string, string> = {
  belum_bayar: "Tagihan bulan ini belum dibayar. Transfer sebelum jatuh tempo ya.",
  menunggu_konfirmasi: "Pembayaranmu sedang dikonfirmasi oleh pemilik kos.",
  lunas: "Pembayaran sudah lunas. Terima kasih, tidak ada tagihan yang perlu diselesaikan.",
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
        setError(err instanceof Error ? err.message : "Gagal membuat tagihan.");
        tujuan = "/dashboard";
      } finally {
        setBusy(false);
        router.replace(tujuan);
        router.refresh();
      }
    })();
  }, [pendingKosId, router]);

  const extra = (kos ?? {}) as unknown as KosExtra;
  const fasilitas = extra.facilities ?? [];
  const nomorKamar = account.roomNumber ?? "Belum ditentukan";

  return (
    <div className="space-y-5">
      {/* Sapaan */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm text-muted-foreground">Dashboard penghuni</p>
          <h2 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
            Halo, <span className="capitalize">{account.name}</span>
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Semua informasi tentang kos dan pembayaranmu ada di sini.
          </p>
        </div>
        {kos && <StatusBadge status={status} />}
      </div>

      {busy && (
        <p role="status" className="rounded-2xl bg-muted p-4 text-sm text-muted-foreground">
          Membuat tagihan untuk kos pilihanmu...
        </p>
      )}

      {error && (
        <p role="alert" className="rounded-2xl bg-red-3 p-4 text-sm text-red-11">
          {error}
        </p>
      )}

      {kos ? (
        <>
          {/* Foto dan nama kos */}
          <section className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
            <div className="relative h-52 sm:h-72">
              <ListingImage src={extra.photos?.[0] ?? ""} alt={kos.name} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 flex flex-wrap items-end justify-between gap-3 p-5 text-white sm:p-6">
                <div>
                  <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-white/70">
                    <KeyRound size={13} /> Kos Anda
                  </p>
                  <h3 className="mt-1 text-2xl font-bold sm:text-3xl">{kos.name}</h3>
                  <p className="mt-1 flex items-center gap-1 text-sm text-white/80">
                    <MapPin size={14} /> {kos.area}
                  </p>
                </div>
                <span className="rounded-full bg-white px-4 py-1.5 text-sm font-semibold text-zinc-950">
                  Kamar {nomorKamar}
                </span>
              </div>
            </div>
          </section>

          {/* Ringkasan singkat */}
          <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {[
              { icon: DoorOpen, label: "Nomor kamar", value: String(nomorKamar) },
              { icon: Wallet, label: "Harga / bulan", value: formatRupiah(kos.price) },
              { icon: Ruler, label: "Ukuran kamar", value: kos.roomSize },
              { icon: CalendarClock, label: "Jatuh tempo", value: formatDate(dueAt) },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="rounded-2xl border border-border bg-card p-4">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                  <Icon size={18} />
                </span>
                <p className="mt-3 text-xs text-muted-foreground">{label}</p>
                <p className="mt-0.5 font-bold">{value}</p>
              </div>
            ))}
          </section>

          {/* Status pembayaran */}
          <section className="flex flex-col gap-4 rounded-3xl border border-border bg-card p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
            <div>
              <p className="text-sm font-semibold text-muted-foreground">Status pembayaran</p>
              <div className="mt-2">
                <StatusBadge status={status} />
              </div>
              <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
                {pesanStatus[status] ?? "Lihat detail tagihanmu di halaman pembayaran."}
              </p>
            </div>
            <Link
              href="/dashboard/pembayaran"
              className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-full bg-primary px-5 text-sm font-medium text-primary-foreground hover:bg-muted hover:text-foreground"
            >
              Lihat pembayaran <ArrowRight size={16} />
            </Link>
          </section>

          {/* Tentang kamar */}
          <section className="rounded-3xl border border-border bg-card p-5 sm:p-6">
            <p className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
              <Sparkles size={16} /> Tentang kamarmu
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              {extra.gender && (
                <span className="rounded-full bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground">
                  {extra.gender}
                </span>
              )}
              {extra.bathroom && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-sm">
                  <Bath size={14} /> KM {extra.bathroom}
                </span>
              )}
              {fasilitas.map((item) => (
                <span key={item} className="rounded-full border border-border px-3 py-1.5 text-sm">
                  {item}
                </span>
              ))}
            </div>

            <div className="mt-5 flex items-start gap-3 rounded-2xl bg-muted/50 p-4">
              <MapPin size={18} className="mt-0.5 shrink-0 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Alamat</p>
                <p className="font-semibold">{kos.address}</p>
              </div>
            </div>

            {extra.description && (
              <p className="mt-5 leading-relaxed text-muted-foreground">{extra.description}</p>
            )}
          </section>
        </>
      ) : (
        <section className="rounded-3xl border border-dashed border-border bg-card p-8 text-center sm:p-12">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
            <KeyRound size={26} />
          </span>
          <h3 className="mt-5 text-xl font-bold">Kamu belum memilih kos</h3>
          <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
            Pilih kamar yang sesuai, lalu daftar dan bayar langsung dari akunmu. Informasi
            kamar akan tampil di halaman ini.
          </p>
          <Link
            href="/#product"
            className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-full bg-primary px-6 text-sm font-medium text-primary-foreground hover:bg-muted hover:text-foreground"
          >
            Lihat kos yang tersedia <ArrowRight size={16} />
          </Link>
        </section>
      )}
    </div>
  );
}
