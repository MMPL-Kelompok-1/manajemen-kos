"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  ArrowRight,
  CalendarCheck,
  CalendarClock,
  Check,
  Clock,
  Copy,
  CreditCard,
  Landmark,
} from "lucide-react";
import StatusBadge from "@/components/StatusBadge";
import { formatDate, formatRupiah } from "@/lib/format";
import type { UserDashboardData } from "@/lib/data";
import { postJson } from "./postJson";

const langkah = ["Tagihan dibuat", "Pembayaran dikirim", "Dikonfirmasi pemilik"];

export default function PembayaranUser({ data }: { data: UserDashboardData }) {
  const router = useRouter();
  const { kos, payment, status, lastPaidAt, dueAt, bank } = data;
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [tersalin, setTersalin] = useState("");

  async function run(action: () => Promise<unknown>) {
    setBusy(true);
    setError("");
    try {
      await action();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan. Coba lagi.");
    } finally {
      setBusy(false);
    }
  }

  async function salin(teks: string, kunci: string) {
    try {
      await navigator.clipboard.writeText(teks);
      setTersalin(kunci);
      setTimeout(() => setTersalin(""), 1500);
    } catch {
      // Abaikan jika browser menolak akses clipboard.
    }
  }

  // Belum ada kos atau tagihan.
  if (!payment || !kos) {
    return (
      <section className="rounded-3xl border border-dashed border-border bg-card p-8 text-center sm:p-12">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
          <CreditCard size={26} />
        </span>
        <h2 className="mt-5 text-xl font-bold">Belum ada tagihan</h2>
        <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
          Pilih kamar terlebih dahulu. Tagihan dan cara pembayarannya akan muncul di sini.
        </p>
        <Link
          href="/#product"
          className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-full bg-primary px-6 text-sm font-medium text-primary-foreground hover:bg-muted hover:text-foreground"
        >
          Lihat kos yang tersedia <ArrowRight size={16} />
        </Link>
      </section>
    );
  }

  // Jumlah langkah yang sudah selesai pada garis kemajuan.
  const selesai = status === "lunas" ? 3 : status === "menunggu_konfirmasi" ? 2 : 1;
  const canRenew = status === "lunas" || status === "terlambat";

  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm text-muted-foreground">Tagihan dan pembayaran</p>
        <h2 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">Pembayaran</h2>
      </div>

      {error && (
        <p role="alert" className="rounded-2xl bg-red-3 p-4 text-sm text-red-11">
          {error}
        </p>
      )}

      {/* Ringkasan tagihan + garis kemajuan */}
      <section className="rounded-3xl border border-border bg-card p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-sm text-muted-foreground">Total tagihan</p>
            <p className="mt-1 text-4xl font-bold tracking-tight">{formatRupiah(payment.amount)}</p>
            <p className="mt-2 break-all font-mono text-xs text-muted-foreground">
              Kode: {payment.id}
            </p>
          </div>
          <StatusBadge status={status} />
        </div>

        <ol className="mt-8 grid grid-cols-3">
          {langkah.map((nama, i) => {
            const done = i < selesai;
            const current = i === selesai;
            return (
              <li key={nama} className="relative flex flex-col items-center text-center">
                {i < langkah.length - 1 && (
                  <span
                    aria-hidden="true"
                    className={`absolute left-1/2 top-4 h-0.5 w-full ${
                      i + 1 < selesai ? "bg-primary" : "bg-border"
                    }`}
                  />
                )}
                <span
                  className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${
                    done
                      ? "bg-primary text-primary-foreground"
                      : current
                        ? "border-2 border-primary bg-card text-foreground"
                        : "border border-border bg-card text-muted-foreground"
                  }`}
                >
                  {done ? <Check size={16} /> : i + 1}
                </span>
                <span
                  className={`mt-2 px-1 text-xs leading-tight ${
                    done || current ? "font-semibold text-foreground" : "text-muted-foreground"
                  }`}
                >
                  {nama}
                </span>
              </li>
            );
          })}
        </ol>
      </section>

      {/* Tanggal penting */}
      <section className="grid gap-3 sm:grid-cols-2">
        {[
          { icon: CalendarCheck, label: "Tanggal bayar terakhir", value: formatDate(lastPaidAt) },
          { icon: CalendarClock, label: "Jatuh tempo berikutnya", value: formatDate(dueAt) },
        ].map(({ icon: Icon, label, value }) => (
          <div
            key={label}
            className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground">
              <Icon size={18} />
            </span>
            <div>
              <p className="text-xs text-muted-foreground">{label}</p>
              <p className="font-bold">{value}</p>
            </div>
          </div>
        ))}
      </section>

      {/* Cara membayar */}
      {status === "belum_bayar" && (
        <section className="rounded-3xl border border-border bg-card p-5 sm:p-6">
          <p className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
            <Landmark size={16} /> Transfer ke rekening berikut
          </p>

          <div className="mt-4 rounded-2xl bg-muted/50 p-4">
            <p className="text-sm text-muted-foreground">{bank.bank}</p>
            <div className="mt-1 flex flex-wrap items-center justify-between gap-3">
              <p className="font-mono text-2xl font-bold tracking-wider">{bank.accountNumber}</p>
              <button
                type="button"
                onClick={() => salin(bank.accountNumber, "rekening")}
                className="inline-flex h-9 items-center gap-2 rounded-full border border-border bg-card px-4 text-sm font-medium hover:bg-muted"
              >
                {tersalin === "rekening" ? <Check size={14} /> : <Copy size={14} />}
                {tersalin === "rekening" ? "Tersalin" : "Salin"}
              </button>
            </div>
            <p className="mt-2 text-sm">
              <span className="text-muted-foreground">Atas nama </span>
              <span className="font-semibold">{bank.accountName}</span>
            </p>
          </div>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-muted/50 p-4">
            <div>
              <p className="text-sm text-muted-foreground">Nominal transfer</p>
              <p className="text-xl font-bold">{formatRupiah(payment.amount)}</p>
            </div>
            <button
              type="button"
              onClick={() => salin(String(payment.amount), "nominal")}
              className="inline-flex h-9 items-center gap-2 rounded-full border border-border bg-card px-4 text-sm font-medium hover:bg-muted"
            >
              {tersalin === "nominal" ? <Check size={14} /> : <Copy size={14} />}
              {tersalin === "nominal" ? "Tersalin" : "Salin"}
            </button>
          </div>

          <p className="mt-3 text-sm text-muted-foreground">
            Transfer tepat sesuai nominal agar pembayaran mudah dikonfirmasi.
          </p>

          <button
            type="button"
            disabled={busy}
            onClick={() => run(() => postJson(`/api/payments/${payment.id}/paid`))}
            className="mt-5 flex h-12 w-full items-center justify-center rounded-full bg-primary font-medium text-primary-foreground hover:bg-muted hover:text-foreground disabled:opacity-50"
          >
            {busy ? "Memproses..." : "Saya sudah membayar"}
          </button>
        </section>
      )}

      {status === "menunggu_konfirmasi" && (
        <div className="flex items-start gap-3 rounded-3xl bg-blue-3 p-5 text-sm text-blue-11">
          <Clock size={20} className="mt-0.5 shrink-0" />
          <div>
            <p className="font-semibold">Menunggu konfirmasi pemilik kos</p>
            <p className="mt-1">
              Pembayaranmu sudah tercatat. Status akan berubah otomatis setelah pemilik kos
              mengonfirmasi.
            </p>
          </div>
        </div>
      )}

      {status === "lunas" && (
        <div className="flex items-start gap-3 rounded-3xl bg-green-3 p-5 text-sm text-green-11">
          <Check size={20} className="mt-0.5 shrink-0" />
          <div>
            <p className="font-semibold">Pembayaran lunas</p>
            <p className="mt-1">Terima kasih! Tidak ada tagihan yang perlu diselesaikan saat ini.</p>
          </div>
        </div>
      )}

      {status === "terlambat" && (
        <div className="flex items-start gap-3 rounded-3xl bg-red-3 p-5 text-sm text-red-11">
          <AlertTriangle size={20} className="mt-0.5 shrink-0" />
          <div>
            <p className="font-semibold">Tagihan melewati jatuh tempo</p>
            <p className="mt-1">Silakan lakukan pembayaran perpanjangan di bawah ini.</p>
          </div>
        </div>
      )}

      {/* Perpanjangan */}
      {canRenew && (
        <section className="flex flex-col gap-4 rounded-3xl border border-border bg-card p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div>
            <p className="font-bold">
              {status === "lunas" ? "Bayar bulan berikutnya lebih awal" : "Perpanjang sewa"}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Tagihan baru sebesar {formatRupiah(kos.price)} akan dibuat untuk {kos.name}.
            </p>
          </div>
          <button
            type="button"
            disabled={busy}
            onClick={() => run(() => postJson("/api/payments", { kosId: kos.id }))}
            className="inline-flex h-11 shrink-0 items-center justify-center rounded-full border border-border px-5 text-sm font-medium hover:bg-muted disabled:opacity-50"
          >
            {busy ? "Memproses..." : "Bayar perpanjangan"}
          </button>
        </section>
      )}
    </div>
  );
}
