"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Search } from "lucide-react";
import LogoutButton from "@/components/auth/LogoutButton";
import StatusBadge from "@/components/StatusBadge";
import { formatDate, formatRupiah } from "@/lib/format";
import type { AdminOverview, TenantRow, TenantStatus } from "@/lib/data";

type Filter = "semua" | TenantStatus;

const filterOptions: { value: Filter; label: string }[] = [
  { value: "semua", label: "Semua status" },
  { value: "lunas", label: "Lunas" },
  { value: "menunggu_konfirmasi", label: "Menunggu konfirmasi" },
  { value: "terlambat", label: "Terlambat" },
  { value: "belum_bayar", label: "Belum bayar" },
  { value: "belum_pilih_kos", label: "Belum pilih kos" },
];

export default function AdminDashboard({ overview }: { overview: AdminOverview }) {
  const { rows, stats, kosSummary, orders } = overview;
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("semua");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((row) => {
      if (filter !== "semua" && row.status !== filter) return false;
      if (!q) return true;
      return [row.name, row.email, row.phone, row.kosName ?? "", row.roomNumber ?? ""]
        .some((value) => value.toLowerCase().includes(q));
    });
  }, [rows, query, filter]);

  const statCards = [
    { label: "Penghuni lunas", value: stats.lunas, tone: "text-ctp-green" },
    { label: "Menunggu konfirmasi", value: stats.menungguKonfirmasi, tone: "text-ctp-blue" },
    { label: "Terlambat", value: stats.terlambat, tone: "text-ctp-red" },
    { label: "Belum bayar", value: stats.belumBayar, tone: "text-ctp-yellow" },
  ];

  return (
    <div className="min-h-[100svh] bg-ctp-base">
      <header className="sticky top-0 z-40 border-b border-ctp-surface0 bg-ctp-base/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6">
          <div>
            <p className="text-xs text-ctp-subtext0">KosanKu</p>
            <p className="font-bold leading-tight">Dashboard Admin</p>
          </div>
          <LogoutButton redirectTo="/admin/login" />
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-6 px-4 py-6 pb-12 sm:px-6 md:py-8">
        {/* Ringkasan */}
        <section className="grid grid-cols-2 gap-3 md:grid-cols-5 md:gap-4">
          {statCards.map((card) => (
            <div key={card.label} className="rounded-2xl bg-ctp-base p-4 shadow-sm sm:p-5">
              <p className="text-xs text-ctp-subtext0 sm:text-sm">{card.label}</p>
              <p className={`mt-2 text-2xl font-bold sm:text-3xl ${card.tone}`}>{card.value}</p>
            </div>
          ))}
          <div className="col-span-2 rounded-2xl bg-ctp-accent p-4 text-ctp-on-lavender shadow-sm sm:p-5 md:col-span-1">
            <p className="text-xs text-ctp-on-lavender sm:text-sm">Kamar tersisa</p>
            <p className="mt-2 text-2xl font-bold sm:text-3xl">{stats.totalKamarTersisa}</p>
          </div>
        </section>

        {/* Kos */}
        <section className="flex gap-3 overflow-x-auto pb-1">
          {kosSummary.map((kos) => (
            <div key={kos.id} className="min-w-[200px] rounded-2xl border border-ctp-surface0 bg-ctp-base px-4 py-3">
              <p className="font-semibold">{kos.name}</p>
              <p className="text-sm text-ctp-subtext0">
                {formatRupiah(kos.price)} · sisa {kos.roomsLeft} kamar
              </p>
            </div>
          ))}
        </section>

        <section className="rounded-3xl bg-ctp-base shadow-sm">
          <div className="border-b border-ctp-surface0 p-4 sm:p-6">
            <h2 className="text-lg font-bold">Pesanan masuk</h2>
            <p className="text-sm text-ctp-subtext0">{orders.length} pesanan di Kos Anda</p>
          </div>
          {orders.length === 0 ? (
            <p className="p-10 text-center text-sm text-ctp-subtext0">Belum ada pesanan.</p>
          ) : (
            <ul className="divide-y divide-ctp-surface0">
              {orders.map((order) => (
                <li key={order.orderId} className="space-y-4 p-4 sm:p-6">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold">{order.kosName} · Kamar {order.roomNumber}</p>
                      <p className="text-sm text-ctp-subtext0">{order.clientName}</p>
                      <p className="text-xs text-ctp-subtext0">{order.clientEmail}</p>
                    </div>
                    <span className="rounded-full bg-ctp-mantle px-3 py-1 text-xs font-semibold capitalize text-ctp-subtext1">
                      {order.status === "pending" ? "Menunggu pembayaran" : order.status === "confirmed" ? "Terkonfirmasi" : "Dibatalkan"}
                    </span>
                  </div>
                  <p className="text-sm text-ctp-subtext0">
                    {formatDate(order.startDate)} - {formatDate(order.endDate)}
                  </p>
                  {order.payments.length > 0 ? (
                    <ul className="space-y-2">
                      {order.payments.map((payment) => (
                        <li key={payment.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-ctp-base p-4">
                          <div>
                            <p className="break-all font-mono text-xs font-semibold">{payment.id}</p>
                            <p className="mt-1 text-sm font-semibold">{formatRupiah(payment.amount)}</p>
                            <p className="text-xs text-ctp-subtext0">Batas pembayaran {formatDate(payment.expiredAt)}</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <StatusBadge status={payment.status === "menunggu_pembayaran" ? "belum_bayar" : payment.status} />
                            {order.status === "pending" && payment.status === "menunggu_konfirmasi" && (
                              <VerifyOrderPaymentButton paymentId={payment.id} />
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-ctp-subtext0">Pesanan ini belum memiliki tagihan.</p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Daftar penghuni */}
        <section className="rounded-3xl bg-ctp-base shadow-sm">
          <div className="flex flex-col gap-3 border-b border-ctp-surface0 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-6">
            <div>
              <h1 className="text-lg font-bold">Daftar penghuni</h1>
              <p className="text-sm text-ctp-subtext0">{filtered.length} dari {rows.length} akun</p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <label className="relative">
                <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ctp-overlay1" />
                <input
                  type="search"
                  placeholder="Cari nama, kos, kamar…"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full rounded-full border border-ctp-surface0 py-2.5 pl-9 pr-4 text-base outline-none focus:border-ctp-accent sm:w-64 sm:text-sm"
                />
              </label>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as Filter)}
                className="rounded-full border border-ctp-surface0 bg-ctp-base px-4 py-2.5 text-base outline-none focus:border-ctp-accent sm:text-sm"
              >
                {filterOptions.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
          </div>

          {filtered.length === 0 ? (
            <p className="p-10 text-center text-sm text-ctp-subtext0">Tidak ada data yang cocok.</p>
          ) : (
            <>
              {/* Tabel untuk layar lebar */}
              <div className="hidden overflow-x-auto lg:block">
                <table className="w-full text-left text-sm">
                  <thead className="bg-ctp-base text-xs uppercase tracking-wide text-ctp-subtext0">
                    <tr>
                      <th className="px-6 py-3 font-semibold">Penghuni</th>
                      <th className="px-4 py-3 font-semibold">Kontak</th>
                      <th className="px-4 py-3 font-semibold">Kos</th>
                      <th className="px-4 py-3 font-semibold">Kamar</th>
                      <th className="px-4 py-3 font-semibold">Status</th>
                      <th className="px-4 py-3 font-semibold">Tanggal bayar</th>
                      <th className="px-4 py-3 font-semibold">Jatuh tempo</th>
                      <th className="px-6 py-3 text-right font-semibold">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-ctp-surface0">
                    {filtered.map((row) => (
                      <tr key={row.registrationId} className="align-middle hover:bg-ctp-base/60">
                        <td className="px-6 py-4">
                          <p className="font-semibold">{row.name}</p>
                          <p className="text-xs text-ctp-subtext0">{row.email}</p>
                        </td>
                        <td className="px-4 py-4 text-ctp-subtext0">{row.phone}</td>
                        <td className="px-4 py-4">
                          {row.kosName ?? <span className="text-ctp-overlay1">-</span>}
                          {row.amount !== null && (
                            <p className="text-xs text-ctp-subtext0">{formatRupiah(row.amount)}</p>
                          )}
                        </td>
                        <td className="px-4 py-4">
                          <RoomEditor registrationId={row.registrationId} initial={row.roomNumber} />
                        </td>
                        <td className="px-4 py-4"><StatusBadge status={row.status} /></td>
                        <td className="px-4 py-4 whitespace-nowrap">{formatDate(row.lastPaidAt)}</td>
                        <td className="px-4 py-4 whitespace-nowrap">{formatDate(row.dueAt)}</td>
                        <td className="px-6 py-4 text-right">
                          <ConfirmButton row={row} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Kartu untuk tablet dan HP */}
              <ul className="divide-y divide-ctp-surface0 lg:hidden">
                {filtered.map((row) => (
                  <li key={row.registrationId} className="space-y-4 p-4 sm:p-6">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate font-semibold">{row.name}</p>
                        <p className="truncate text-xs text-ctp-subtext0">{row.email}</p>
                        <p className="text-xs text-ctp-subtext0">{row.phone}</p>
                      </div>
                      <StatusBadge status={row.status} />
                    </div>

                    <dl className="grid grid-cols-2 gap-3 rounded-2xl bg-ctp-base p-4 text-sm">
                      <div>
                        <dt className="text-xs text-ctp-subtext0">Kos</dt>
                        <dd className="font-semibold">{row.kosName ?? "-"}</dd>
                      </div>
                      <div>
                        <dt className="text-xs text-ctp-subtext0">Tagihan</dt>
                        <dd className="font-semibold">{row.amount !== null ? formatRupiah(row.amount) : "-"}</dd>
                      </div>
                      <div>
                        <dt className="text-xs text-ctp-subtext0">Tanggal bayar</dt>
                        <dd className="font-semibold">{formatDate(row.lastPaidAt)}</dd>
                      </div>
                      <div>
                        <dt className="text-xs text-ctp-subtext0">Jatuh tempo</dt>
                        <dd className="font-semibold">{formatDate(row.dueAt)}</dd>
                      </div>
                    </dl>

                    <div className="flex flex-col gap-3">
                      <RoomEditor registrationId={row.registrationId} initial={row.roomNumber} />
                      <ConfirmButton row={row} fullWidth />
                    </div>
                  </li>
                ))}
              </ul>
            </>
          )}
        </section>
      </main>
    </div>
  );
}

function VerifyOrderPaymentButton({ paymentId }: { paymentId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function verify() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/payments/${paymentId}/confirm`, { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Gagal memverifikasi pembayaran");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="text-right">
      <button
        type="button"
        onClick={verify}
        disabled={loading}
        className="inline-flex items-center justify-center gap-1.5 rounded-full bg-ctp-accent px-4 py-2.5 text-sm font-medium text-ctp-on-lavender hover:bg-ctp-mantle hover:text-ctp-text disabled:opacity-50"
      >
        <Check size={16} />
        {loading ? "Memproses..." : "Setujui pembayaran"}
      </button>
      {error && <p className="mt-1 text-xs text-ctp-red">{error}</p>}
    </div>
  );
}

// Konfirmasi pembayaran. Muncul bila tagihan terbaru belum lunas.
function ConfirmButton({ row, fullWidth = false }: { row: TenantRow; fullWidth?: boolean }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!row.paymentId || row.paymentStatus === "lunas") {
    return null;
  }

  async function confirm() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/payments/${row.paymentId}/confirm`, { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Gagal mengonfirmasi");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={fullWidth ? "w-full" : ""}>
      <button
        type="button"
        onClick={confirm}
        disabled={loading}
        className={`inline-flex items-center justify-center gap-1.5 rounded-full bg-ctp-accent px-4 py-2.5 text-sm font-medium text-ctp-on-lavender hover:bg-ctp-mantle hover:text-ctp-text disabled:opacity-50 ${
          fullWidth ? "w-full" : ""
        }`}
      >
        <Check size={16} />
        {loading ? "Memproses..." : "Konfirmasi lunas"}
      </button>
      {error && <p className="mt-1 text-xs text-ctp-red">{error}</p>}
    </div>
  );
}

// Pengaturan nomor kamar penghuni.
function RoomEditor({ registrationId, initial }: { registrationId: string; initial: string | null }) {
  const router = useRouter();
  const [value, setValue] = useState(initial ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const dirty = value.trim() !== (initial ?? "");

  async function save() {
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/registrations/${registrationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomNumber: value }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Gagal menyimpan");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="w-full min-w-[120px]">
      <div className="flex items-center gap-2">
        <input
          value={value}
          maxLength={20}
          placeholder="Belum ada"
          onChange={(e) => setValue(e.target.value)}
          aria-label="Nomor kamar"
          className="w-full min-w-0 rounded-lg border border-ctp-surface0 px-3 py-2 text-base outline-none focus:border-ctp-accent sm:text-sm lg:w-24"
        />
        {dirty && (
          <button
            type="button"
            onClick={save}
            disabled={saving}
            className="shrink-0 rounded-lg bg-ctp-mantle px-3 py-2 text-sm font-medium hover:bg-ctp-surface0 disabled:opacity-50"
          >
            {saving ? "…" : "Simpan"}
          </button>
        )}
      </div>
      {error && <p className="mt-1 text-xs text-ctp-red">{error}</p>}
    </div>
  );
}
