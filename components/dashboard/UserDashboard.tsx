"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertTriangle, CalendarDays, Check, Clock, KeyRound } from "lucide-react";
import LogoutButton from "@/components/auth/LogoutButton";
import StatusBadge from "@/components/StatusBadge";
import { formatDate, formatRupiah } from "@/lib/format";
import type { UserDashboardData } from "@/lib/data";

type Props = {
  data: UserDashboardData;
  pendingKosId: string | null;
};

async function postJson(url: string, body?: unknown) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error ?? "Terjadi kesalahan. Coba lagi.");
  return json;
}

export default function UserDashboard({ data, pendingKosId }: Props) {
  const router = useRouter();
  const { account, kos, payment, status, lastPaidAt, dueAt, bank } = data;
  const [busy, setBusy] = useState<boolean>(Boolean(pendingKosId));
  const [error, setError] = useState("");
  const started = useRef(false);

  // Jika penghuni datang dari "Pilih & daftar", buat tagihan sekali saja.
  useEffect(() => {
    if (!pendingKosId || started.current) return;
    started.current = true;
    (async () => {
      try {
        await postJson("/api/payments", { kosId: pendingKosId });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Gagal membuat tagihan.");
      } finally {
        setBusy(false);
        router.replace("/dashboard");
        router.refresh();
      }
    })();
  }, [pendingKosId, router]);

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

  const canRenew = (status === "lunas" || status === "terlambat") && kos !== null;

  return (
    <div className="min-h-[100svh] bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-3xl items-center justify-between gap-3 px-4">
          <Link href="/" className="text-lg font-bold">KosanKu</Link>
          <LogoutButton />
        </div>
      </header>

      <main className="mx-auto max-w-3xl space-y-5 px-4 py-6 pb-12 md:py-10">
        <div>
          <p className="text-sm text-muted-foreground">Dashboard penghuni</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">Halo, {account.name}</h1>
        </div>

        {error && (
          <p role="alert" className="rounded-2xl bg-red-3 p-4 text-sm text-red-11">
            {error}
          </p>
        )}

        {/* Kos */}
        <section className="rounded-3xl bg-card p-5 shadow-sm sm:p-6">
          <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
            <KeyRound size={16} /> Kos Anda
          </div>
          {kos ? (
            <div className="mt-3">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xl font-bold">{kos.name}</p>
                  <p className="text-sm text-muted-foreground">{kos.area}</p>
                </div>
                <p className="rounded-full bg-muted px-3 py-1 text-sm font-semibold">
                  Kamar {account.roomNumber ?? "belum ditentukan"}
                </p>
              </div>
              <dl className="mt-5 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <dt className="text-muted-foreground">Harga / bulan</dt>
                  <dd className="font-semibold">{formatRupiah(kos.price)}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Ukuran kamar</dt>
                  <dd className="font-semibold">{kos.roomSize}</dd>
                </div>
                <div className="col-span-2">
                  <dt className="text-muted-foreground">Alamat</dt>
                  <dd className="font-semibold">{kos.address}</dd>
                </div>
              </dl>
            </div>
          ) : (
            <div className="mt-3">
              <p className="font-semibold">Anda belum memilih kos.</p>
              <p className="mt-1 text-sm text-muted-foreground">Pilih kos yang sesuai untuk mulai pembayaran.</p>
              <Link
                href="/#kos"
                className="mt-4 inline-flex rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-muted hover:text-foreground"
              >
                Lihat kos yang tersedia
              </Link>
            </div>
          )}
        </section>

        <section className="rounded-3xl bg-card p-5 shadow-sm sm:p-6">
          <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
            <CalendarDays size={16} /> Histori pesanan
          </div>
          {data.orderHistory.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">Belum ada histori pesanan.</p>
          ) : (
            <ul className="mt-4 divide-y divide-border">
              {data.orderHistory.map((order) => (
                <li key={order.orderId} className="space-y-3 py-4 first:pt-0 last:pb-0">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold">{order.kosName}</p>
                      <p className="text-sm text-muted-foreground">Kamar {order.roomNumber}</p>
                    </div>
                    <span className="rounded-full bg-muted px-3 py-1 text-xs font-semibold capitalize text-muted-foreground">
                      {order.status === "pending" ? "Menunggu pembayaran" : order.status === "confirmed" ? "Terkonfirmasi" : "Dibatalkan"}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(order.startDate)} - {formatDate(order.endDate)}
                  </p>
                  {order.payments.length > 0 ? (
                    <ul className="space-y-2">
                      {order.payments.map((orderPayment) => (
                        <li key={orderPayment.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-card px-3 py-2.5">
                          <div>
                            <p className="break-all font-mono text-xs font-semibold">{orderPayment.id}</p>
                            <p className="text-sm text-muted-foreground">{formatRupiah(orderPayment.amount)}</p>
                          </div>
                          <StatusBadge status={orderPayment.status === "menunggu_pembayaran" ? "belum_bayar" : orderPayment.status} />
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-muted-foreground">Belum ada tagihan untuk pesanan ini.</p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Pembayaran */}
        {payment && kos && (
          <section className="rounded-3xl bg-card p-5 shadow-sm sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                <CalendarDays size={16} /> Pembayaran
              </div>
              <StatusBadge status={status} />
            </div>

            <dl className="mt-5 grid grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="text-muted-foreground">Kode pembayaran</dt>
                <dd className="break-all font-mono font-semibold">{payment.id}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Total</dt>
                <dd className="font-semibold">{formatRupiah(payment.amount)}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Tanggal bayar terakhir</dt>
                <dd className="font-semibold">{formatDate(lastPaidAt)}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Jatuh tempo berikutnya</dt>
                <dd className="font-semibold">{formatDate(dueAt)}</dd>
              </div>
            </dl>

            {status === "belum_bayar" && (
              <div className="mt-6 space-y-4">
                <div className="rounded-2xl border border-border p-4 text-sm">
                  <p className="font-semibold">Transfer ke rekening berikut:</p>
                  <p className="mt-3">Bank: {bank.bank}</p>
                  <p>
                    No. rekening: <span className="font-mono font-bold">{bank.accountNumber}</span>
                  </p>
                  <p>Atas nama: {bank.accountName}</p>
                  <p className="mt-3 text-muted-foreground">
                    Transfer tepat {formatRupiah(payment.amount)} agar pembayaran mudah dikonfirmasi.
                  </p>
                </div>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => run(() => postJson(`/api/payments/${payment.id}/paid`))}
                  className="w-full rounded-full bg-primary py-3.5 font-medium text-primary-foreground hover:bg-muted hover:text-foreground disabled:opacity-50"
                >
                  {busy ? "Memproses..." : "Saya sudah membayar"}
                </button>
              </div>
            )}

            {status === "menunggu_konfirmasi" && (
              <div className="mt-6 flex items-start gap-3 rounded-2xl bg-blue-3 p-4 text-sm text-blue-11">
                <Clock size={18} className="mt-0.5 shrink-0" />
                <p>Pembayaran Anda sedang dikonfirmasi oleh pemilik kos. Status akan berubah otomatis setelah dikonfirmasi.</p>
              </div>
            )}

            {status === "lunas" && (
              <div className="mt-6 flex items-start gap-3 rounded-2xl bg-green-3 p-4 text-sm text-green-11">
                <Check size={18} className="mt-0.5 shrink-0" />
                <p>Pembayaran Anda sudah lunas. Terima kasih!</p>
              </div>
            )}

            {status === "terlambat" && (
              <div className="mt-6 flex items-start gap-3 rounded-2xl bg-red-3 p-4 text-sm text-red-11">
                <AlertTriangle size={18} className="mt-0.5 shrink-0" />
                <p>Tagihan Anda sudah melewati jatuh tempo. Silakan lakukan pembayaran perpanjangan.</p>
              </div>
            )}

            {canRenew && (
              <div className="mt-6">
                {status === "lunas" && (
                  <p className="mb-3 text-sm text-muted-foreground">Ingin membayar untuk bulan berikutnya lebih awal?</p>
                )}
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => run(() => postJson("/api/payments", { kosId: kos.id }))}
                  className="w-full rounded-full border border-border py-3 font-medium hover:bg-muted disabled:opacity-50"
                >
                  Bayar perpanjangan {formatRupiah(kos.price)}
                </button>
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
}
