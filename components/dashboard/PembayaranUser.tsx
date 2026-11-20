"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertTriangle, Check, Clock, CreditCard } from "lucide-react";
import StatusBadge from "@/components/StatusBadge";
import CopyButton from "@/components/ui/CopyButton";
import EmptyState from "@/components/ui/EmptyState";
import Notice from "@/components/ui/Notice";
import { DefinitionList } from "@/components/ui/DefinitionList";
import type { Tone } from "@/components/ui/status";
import { formatDate, formatRupiah } from "@/lib/format";
import { errorMessage, postJson } from "@/lib/client/http";
import type { UserDashboardData } from "@/lib/data";

const langkah = ["Tagihan dibuat", "Pembayaran dikirim", "Dikonfirmasi pemilik"];

const pemberitahuan: Partial<
  Record<UserDashboardData["status"], { icon: typeof Clock; tone: Tone; judul: string; isi: string }>
> = {
  menunggu_konfirmasi: {
    icon: Clock,
    tone: "blue",
    judul: "Menunggu konfirmasi pemilik kos",
    isi: "Pembayaranmu sudah tercatat. Status akan berubah setelah dikonfirmasi.",
  },
  lunas: {
    icon: Check,
    tone: "green",
    judul: "Pembayaran lunas",
    isi: "Tidak ada tagihan yang perlu diselesaikan saat ini.",
  },
  terlambat: {
    icon: AlertTriangle,
    tone: "red",
    judul: "Tagihan melewati jatuh tempo",
    isi: "Silakan lakukan pembayaran perpanjangan di bawah ini.",
  },
};

type Action = "paid" | "renew";

export default function PembayaranUser({ data }: { data: UserDashboardData }) {
  const router = useRouter();
  const { kos, payment, status, lastPaidAt, dueAt, bank } = data;
  const [busy, setBusy] = useState<Action | null>(null);
  const [error, setError] = useState("");

  async function run(kind: Action, action: () => Promise<unknown>) {
    setBusy(kind);
    setError("");
    try {
      await action();
      router.refresh();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(null);
    }
  }

  if (!payment || !kos) {
    return (
      <EmptyState
        icon={CreditCard}
        headingLevel="h2"
        title="Belum ada tagihan"
        description="Pilih kamar terlebih dahulu. Tagihan dan cara pembayarannya akan muncul di sini."
        action={
          <Link href="/#product" className="btn btn-primary">
            Lihat kos yang tersedia
          </Link>
        }
      />
    );
  }

  const selesai = status === "lunas" ? 3 : status === "menunggu_konfirmasi" ? 2 : 1;
  const canRenew = status === "lunas" || status === "terlambat";
  const info = pemberitahuan[status];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-section">Pembayaran</h1>
        <p className="mt-1.5 text-sm text-ink-11">Tagihan dan cara membayar untuk {kos.name}.</p>
      </div>

      {error && <Notice tone="red">{error}</Notice>}

      {info && (
        <Notice tone={info.tone} icon={info.icon} title={info.judul}>
          {info.isi}
        </Notice>
      )}

      <section aria-label="Ringkasan tagihan" className="surface-raised p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-figure">{formatRupiah(payment.amount)}</p>
            <p className="text-sm text-ink-10">Total tagihan</p>
          </div>
          <StatusBadge status={status} />
        </div>

        <DefinitionList
          className="mt-5 grid grid-cols-2 gap-4"
          items={[
            { label: "Bayar terakhir", value: formatDate(lastPaidAt) },
            { label: "Jatuh tempo berikutnya", value: formatDate(dueAt) },
          ]}
        />

        <ol aria-label="Tahap pembayaran" className="hairline-t mt-5 grid grid-cols-3 pt-5">
          {langkah.map((nama, i) => {
            const done = i < selesai;
            const current = i === selesai;
            return (
              <li
                key={nama}
                aria-current={current ? "step" : undefined}
                className="relative flex flex-col items-center text-center"
              >
                {i < langkah.length - 1 && (
                  <span
                    aria-hidden="true"
                    className={`absolute left-1/2 top-3 h-px w-full ${i + 1 < selesai ? "bg-ink-12" : "bg-ink-6"}`}
                  />
                )}
                <span
                  aria-hidden="true"
                  className={`relative z-10 flex h-6 w-6 items-center justify-center rounded-full text-xs ${
                    done
                      ? "bg-ink-12 text-ink-1"
                      : current
                        ? "bg-raised text-ink-12 shadow-[var(--shadow-button)]"
                        : "bg-ink-3 text-ink-11"
                  }`}
                >
                  {done ? <Check size={12} /> : i + 1}
                </span>
                <span className={`mt-2 px-1 text-xs ${done || current ? "text-ink-12" : "text-ink-11"}`}>
                  {nama}
                  {done && <span className="sr-only"> (selesai)</span>}
                </span>
              </li>
            );
          })}
        </ol>

        <div className="hairline-t mt-5 flex items-center justify-between gap-3 pt-4">
          <div className="min-w-0">
            <p className="text-meta">Kode pembayaran</p>
            <p className="truncate font-mono text-xs text-ink-11" title={payment.id}>
              {payment.id}
            </p>
          </div>
          <CopyButton value={payment.id} label="kode pembayaran" />
        </div>
      </section>

      {status === "belum_bayar" && (
        <section aria-labelledby="cara-bayar" className="surface-raised p-5">
          <h2 id="cara-bayar" className="text-title">
            Transfer ke rekening berikut
          </h2>
          <p className="mt-0.5 text-sm text-ink-11">Transfer tepat sesuai nominal agar pembayaran mudah dikonfirmasi.</p>

          <div className="mt-4 divide-y divide-line">
            <div className="flex items-center justify-between gap-3 py-3">
              <div className="min-w-0">
                <p className="text-sm text-ink-10">
                  {bank.bank} · a.n. {bank.accountName}
                </p>
                <p className="mt-0.5 break-all font-mono text-lg text-ink-12 tabular-nums">{bank.accountNumber}</p>
              </div>
              <CopyButton value={bank.accountNumber} label="nomor rekening" />
            </div>
            <div className="flex items-center justify-between gap-3 py-3">
              <div>
                <p className="text-sm text-ink-10">Nominal transfer</p>
                <p className="mt-0.5 text-lg text-ink-12 tabular-nums">{formatRupiah(payment.amount)}</p>
              </div>
              <CopyButton value={String(payment.amount)} label="nominal transfer" />
            </div>
          </div>

          <button
            type="button"
            disabled={busy !== null}
            onClick={() => run("paid", () => postJson(`/api/payments/${payment.id}/paid`))}
            className="btn btn-primary mt-4 w-full"
          >
            {busy === "paid" ? "Memproses…" : "Saya sudah membayar"}
          </button>
        </section>
      )}

      {canRenew && (
        <section className="surface-raised flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-title">
              {status === "lunas" ? "Bayar bulan berikutnya lebih awal" : "Perpanjang sewa"}
            </h2>
            <p className="mt-0.5 text-sm text-ink-11">
              Tagihan baru sebesar {formatRupiah(kos.price)} akan dibuat untuk {kos.name}.
            </p>
          </div>
          <button
            type="button"
            disabled={busy !== null}
            onClick={() => run("renew", () => postJson("/api/payments", { kosId: kos.id }))}
            className={`btn shrink-0 max-sm:w-full ${status === "terlambat" ? "btn-primary" : "btn-secondary"}`}
          >
            {busy === "renew" ? "Memproses…" : "Bayar perpanjangan"}
          </button>
        </section>
      )}
    </div>
  );
}
