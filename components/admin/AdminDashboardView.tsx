"use client";

import { useMemo, useState } from "react";
import { ClipboardList, Search, Users } from "lucide-react";
import { ConfirmPaymentButton, RoomEditor } from "@/components/admin/TenantActions";
import StatusBadge, { StatusDot } from "@/components/StatusBadge";
import CopyButton from "@/components/ui/CopyButton";
import EmptyState from "@/components/ui/EmptyState";
import Section from "@/components/ui/Section";
import StatCard from "@/components/ui/StatCard";
import { DefinitionList } from "@/components/ui/DefinitionList";
import { kosStatus } from "@/components/ui/status";
import { formatDate, formatRupiah } from "@/lib/format";
import type { AdminOverview, KosStatus, TenantRow } from "@/lib/data";

type Filter = "semua" | KosStatus;

const EMPTY_STATS: AdminOverview["stats"] = {
  lunas: 0,
  menungguKonfirmasi: 0,
  terlambat: 0,
  belumBayar: 0,
  totalKamarTersisa: 0,
};
// Konstanta di luar komponen supaya referensinya stabil untuk useMemo.
const EMPTY_ROWS: TenantRow[] = [];
const BATAS_PESANAN = 6;
const KOSONG = "–";

const filterOptions: { value: Filter; label: string }[] = [
  { value: "semua", label: "Semua status" },
  ...(Object.keys(kosStatus) as KosStatus[]).map((value) => ({ value, label: kosStatus[value].label })),
];

export default function AdminDashboardView({ overview }: { overview?: AdminOverview }) {
  const rows = overview?.rows ?? EMPTY_ROWS;
  const stats = overview?.stats ?? EMPTY_STATS;
  const kosSummary = overview?.kosSummary ?? [];
  const orders = overview?.orders ?? [];

  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("semua");
  const [semuaPesanan, setSemuaPesanan] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((row) => {
      if (filter !== "semua" && row.status !== filter) return false;
      if (!q) return true;
      return [row.name, row.email, row.phone, row.kosName ?? "", row.roomNumber ?? ""].some((value) =>
        value.toLowerCase().includes(q),
      );
    });
  }, [rows, query, filter]);

  const pesananTampil = semuaPesanan ? orders : orders.slice(0, BATAS_PESANAN);
  const adaFilter = query.trim() !== "" || filter !== "semua";

  return (
    <div className="mx-auto max-w-[1200px] space-y-8 px-5 py-6 pb-12 md:px-6 md:py-8">
      <div>
        <h1 className="text-section">Dashboard</h1>
        <p className="mt-1.5 text-sm text-ink-11">
          Pembayaran yang menunggu konfirmasi dan kondisi penghuni.
        </p>
      </div>

      <section
        aria-label="Ringkasan"
        className="stat-list grid grid-cols-2 gap-3 md:grid-cols-5 md:gap-4"
      >
        <StatCard value={stats.lunas} label="Penghuni lunas" tone="green" />
        <StatCard value={stats.menungguKonfirmasi} label="Menunggu konfirmasi" tone="blue" />
        <StatCard value={stats.terlambat} label="Terlambat" tone="red" />
        <StatCard value={stats.belumBayar} label="Belum bayar" tone="amber" />
        <StatCard value={stats.totalKamarTersisa} label="Kamar tersisa" className="col-span-2 md:col-span-1" />
      </section>

      <Section
        id="pesanan"
        title="Pesanan masuk"
        description={`${orders.length} pesanan di kos Anda`}
      >
        {orders.length === 0 ? (
          <EmptyState
            icon={ClipboardList}
            title="Belum ada pesanan"
            description="Pesanan baru dari calon penghuni akan muncul di sini."
          />
        ) : (
          <div>
            <ul className="surface-raised divide-y-[0.5px] divide-line overflow-hidden">
              {pesananTampil.map((order) => (
                <li key={order.orderId} className="space-y-3 p-4 sm:p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm text-ink-12">
                        {order.kosName} · Kamar {order.roomNumber}
                      </p>
                      <p className="text-sm text-ink-11">{order.clientName}</p>
                      <p className="truncate text-xs text-ink-10">{order.clientEmail}</p>
                    </div>
                    <StatusBadge kind="order" status={order.status} />
                  </div>
                  <p className="text-sm text-ink-11">
                    {formatDate(order.startDate)} – {formatDate(order.endDate)}
                  </p>
                  {order.payments.length > 0 ? (
                    <ul className="space-y-2">
                      {order.payments.map((payment) => (
                        <li
                          key={payment.id}
                          className="flex flex-wrap items-center justify-between gap-3 rounded-container inset-fill p-3"
                        >
                          <div className="min-w-0">
                            <p className="text-sm text-ink-12 tabular-nums">{formatRupiah(payment.amount)}</p>
                            <p className="text-xs text-ink-10">Batas pembayaran {formatDate(payment.expiredAt)}</p>
                          </div>
                          <div className="flex flex-wrap items-center gap-2">
                            <StatusBadge kind="payment" status={payment.status} />
                            <CopyButton value={payment.id} label="kode pembayaran" />
                            {order.status === "pending" && payment.status === "menunggu_konfirmasi" && (
                              <ConfirmPaymentButton paymentId={payment.id} label="Setujui pembayaran" />
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-ink-11">Pesanan ini belum memiliki tagihan.</p>
                  )}
                </li>
              ))}
            </ul>
            {orders.length > BATAS_PESANAN && (
              <button
                type="button"
                onClick={() => setSemuaPesanan((v) => !v)}
                aria-expanded={semuaPesanan}
                className="btn btn-secondary mt-3 max-sm:w-full"
              >
                {semuaPesanan ? "Tampilkan lebih sedikit" : `Tampilkan semua (${orders.length})`}
              </button>
            )}
          </div>
        )}
      </Section>

      {kosSummary.length > 0 && (
        <section aria-label="Kos" className="-mx-0.5 flex gap-3 overflow-x-auto p-0.5 pb-1">
          {kosSummary.map((kos) => (
            <div key={kos.id} className="surface-raised min-w-[200px] shrink-0 px-4 py-3">
              <p className="text-sm text-ink-12">{kos.name}</p>
              <p className="text-sm text-ink-11">
                {formatRupiah(kos.price)} · sisa {kos.roomsLeft} kamar
              </p>
            </div>
          ))}
        </section>
      )}

      <Section
        id="penghuni"
        title="Daftar penghuni"
        description={`${filtered.length} dari ${rows.length} akun`}
        actions={
          rows.length > 0 && (
            <>
              <div className="relative w-full sm:w-64">
                <label htmlFor="cari-penghuni" className="sr-only">
                  Cari penghuni
                </label>
                <Search
                  size={16}
                  aria-hidden="true"
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-10"
                />
                <input
                  id="cari-penghuni"
                  type="search"
                  placeholder="Cari nama, kos, kamar…"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="field pl-9"
                />
              </div>
              <label htmlFor="filter-status" className="sr-only">
                Filter status
              </label>
              <select
                id="filter-status"
                value={filter}
                onChange={(e) => setFilter(e.target.value as Filter)}
                className="field w-full sm:w-auto"
              >
                {filterOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </>
          )
        }
      >
        {rows.length === 0 ? (
          <EmptyState
            icon={Users}
            title="Belum ada penghuni"
            description="Akun penghuni muncul di sini setelah mereka mendaftar."
          />
        ) : filtered.length === 0 ? (
          <EmptyState
            title="Tidak ada penghuni yang cocok"
            description="Ubah kata kunci atau pilih status lain."
            action={
              adaFilter && (
                <button
                  type="button"
                  onClick={() => {
                    setQuery("");
                    setFilter("semua");
                  }}
                  className="btn btn-secondary"
                >
                  Hapus filter
                </button>
              )
            }
          />
        ) : (
          <>
            {/* Tabel untuk layar lebar */}
            <div className="hidden overflow-x-auto p-0.5 lg:block">
              <table className="table-tactile">
                <thead>
                  <tr>
                    <th scope="col">Penghuni</th>
                    <th scope="col">Kontak</th>
                    <th scope="col">Kos</th>
                    <th scope="col">Kamar</th>
                    <th scope="col">Status</th>
                    <th scope="col">Tanggal bayar</th>
                    <th scope="col">Jatuh tempo</th>
                    <th scope="col">
                      <span className="sr-only">Aksi</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((row) => (
                    <tr key={row.registrationId}>
                      <td>
                        <p className="text-ink-12">{row.name}</p>
                        <p className="text-xs text-ink-11">{row.email}</p>
                      </td>
                      <td className="whitespace-nowrap">{row.phone}</td>
                      <td>
                        {row.kosName ?? KOSONG}
                        {row.amount !== null && <p className="text-xs">{formatRupiah(row.amount)}</p>}
                      </td>
                      <td>
                        {row.kosName ? (
                          <RoomEditor registrationId={row.registrationId} initial={row.roomNumber} compact />
                        ) : (
                          KOSONG
                        )}
                      </td>
                      <td>
                        <StatusDot status={row.status} />
                      </td>
                      <td className="whitespace-nowrap">{formatDate(row.lastPaidAt)}</td>
                      <td className="whitespace-nowrap">{formatDate(row.dueAt)}</td>
                      <td>
                        {row.paymentId && row.paymentStatus !== "lunas" && (
                          <ConfirmPaymentButton paymentId={row.paymentId} label="Konfirmasi lunas" />
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Kartu untuk tablet dan HP */}
            <ul className="surface-raised divide-y-[0.5px] divide-line overflow-hidden lg:hidden">
              {filtered.map((row) => (
                <li key={row.registrationId} className="space-y-3 p-4 sm:p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm text-ink-12">{row.name}</p>
                      <p className="truncate text-xs text-ink-10">{row.email}</p>
                      <p className="text-xs text-ink-10">{row.phone}</p>
                    </div>
                    <StatusBadge status={row.status} />
                  </div>

                  <DefinitionList
                    className="grid grid-cols-2 gap-3 rounded-container inset-fill p-3"
                    items={[
                      { label: "Kos", value: row.kosName ?? KOSONG },
                      { label: "Tagihan", value: row.amount !== null ? formatRupiah(row.amount) : KOSONG },
                      { label: "Tanggal bayar", value: formatDate(row.lastPaidAt) },
                      { label: "Jatuh tempo", value: formatDate(row.dueAt) },
                    ]}
                  />

                  {(row.kosName || (row.paymentId && row.paymentStatus !== "lunas")) && (
                    <div className="flex flex-col gap-3">
                      {row.kosName && <RoomEditor registrationId={row.registrationId} initial={row.roomNumber} />}
                      {row.paymentId && row.paymentStatus !== "lunas" && (
                        <ConfirmPaymentButton paymentId={row.paymentId} label="Konfirmasi lunas" fullWidth />
                      )}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </>
        )}
      </Section>
    </div>
  );
}

