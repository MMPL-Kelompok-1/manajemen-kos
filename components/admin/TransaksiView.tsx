"use client";

import { useMemo, useState } from "react";
import { ReceiptText, Search } from "lucide-react";
import { ConfirmPaymentButton } from "@/components/admin/TenantActions";
import StatusBadge from "@/components/StatusBadge";
import CopyButton from "@/components/ui/CopyButton";
import EmptyState from "@/components/ui/EmptyState";
import Section from "@/components/ui/Section";
import StatCard from "@/components/ui/StatCard";
import { DefinitionList } from "@/components/ui/DefinitionList";
import { formatDate, formatMonthKey, formatRupiah, jakartaMonthKey } from "@/lib/format";
import { paymentStatus } from "@/components/ui/status";
import type { PaymentStatus } from "@/lib/payment";
import type { TransactionManagementData } from "@/lib/data";

type StatusFilter = "semua" | PaymentStatus;

const statusOptions: { value: StatusFilter; label: string }[] = [
  { value: "semua", label: "Semua status" },
  ...(Object.keys(paymentStatus) as PaymentStatus[]).map((value) => ({
    value,
    label: paymentStatus[value].label,
  })),
];

function methodLabel(method: string | null): string {
  if (!method) return "–";
  return method === "manual_transfer" ? "Transfer manual" : method;
}

export default function TransaksiView({ data }: { data: TransactionManagementData }) {
  const { rows, stats } = data;
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<StatusFilter>("semua");
  const [month, setMonth] = useState("");

  const months = useMemo(
    () =>
      [...new Set(rows.map((row) => jakartaMonthKey(row.createdAt)))].sort((a, b) =>
        b.localeCompare(a),
      ),
    [rows],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((row) => {
      if (status !== "semua" && row.status !== status) return false;
      if (month && jakartaMonthKey(row.createdAt) !== month) return false;
      if (!q) return true;
      return [row.tenantName, row.tenantEmail, row.kosName, row.roomNumber, row.id].some((value) =>
        value.toLowerCase().includes(q),
      );
    });
  }, [rows, query, status, month]);

  const adaFilter = query.trim() !== "" || status !== "semua" || month !== "";

  return (
    <div className="mx-auto max-w-[1200px] space-y-8 px-5 py-6 pb-12 md:px-6 md:py-8">
      <div>
        <h1 className="text-section">Transaksi &amp; pembayaran</h1>
        <p className="mt-1.5 text-sm text-ink-11">
          Konfirmasi transfer manual dan pantau seluruh tagihan penghuni.
        </p>
      </div>

      <section aria-label="Ringkasan transaksi" className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
        <StatCard value={formatRupiah(stats.receivedThisMonth)} label="Pendapatan bulan ini" tone="green" />
        <StatCard
          value={formatRupiah(stats.pendingAmount)}
          label={`Menunggu konfirmasi (${stats.pendingCount})`}
          tone="blue"
        />
        <StatCard
          value={formatRupiah(stats.unpaidAmount)}
          label={`Belum bayar (${stats.unpaidCount})`}
          tone="amber"
        />
        <StatCard value={stats.totalCount} label="Total transaksi" />
      </section>

      <Section
        id="daftar-transaksi"
        title="Daftar transaksi"
        description={`${filtered.length} dari ${rows.length} transaksi terbaru`}
        actions={
          rows.length > 0 && (
            <>
              <div className="relative w-full sm:w-64">
                <label htmlFor="cari-transaksi" className="sr-only">
                  Cari transaksi
                </label>
                <Search
                  size={16}
                  aria-hidden="true"
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-10"
                />
                <input
                  id="cari-transaksi"
                  type="search"
                  placeholder="Cari nama, kamar, kode…"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  className="field pl-9"
                />
              </div>
              <label htmlFor="filter-status-transaksi" className="sr-only">
                Filter status pembayaran
              </label>
              <select
                id="filter-status-transaksi"
                value={status}
                onChange={(event) => setStatus(event.target.value as StatusFilter)}
                className="field w-full sm:w-auto"
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <label htmlFor="filter-bulan-transaksi" className="sr-only">
                Filter bulan tagihan
              </label>
              <select
                id="filter-bulan-transaksi"
                value={month}
                onChange={(event) => setMonth(event.target.value)}
                className="field w-full sm:w-auto"
              >
                <option value="">Semua bulan</option>
                {months.map((value) => (
                  <option key={value} value={value}>
                    {formatMonthKey(value)}
                  </option>
                ))}
              </select>
            </>
          )
        }
      >
        {rows.length === 0 ? (
          <EmptyState
            icon={ReceiptText}
            title="Belum ada transaksi"
            description="Tagihan akan muncul setelah penghuni memesan kamar."
          />
        ) : filtered.length === 0 ? (
          <EmptyState
            title="Tidak ada transaksi yang cocok"
            description="Ubah kata kunci, status, atau bulan tagihan."
            action={
              adaFilter && (
                <button
                  type="button"
                  onClick={() => {
                    setQuery("");
                    setStatus("semua");
                    setMonth("");
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
            <div className="hidden overflow-x-auto p-0.5 xl:block">
              <table className="table-tactile">
                <thead>
                  <tr>
                    <th scope="col">Tagihan</th>
                    <th scope="col">Penghuni</th>
                    <th scope="col">Kos / kamar</th>
                    <th scope="col">Nominal</th>
                    <th scope="col">Metode</th>
                    <th scope="col">Status</th>
                    <th scope="col">Batas bayar</th>
                    <th scope="col">
                      <span className="sr-only">Aksi</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((row) => (
                    <tr key={row.id}>
                      <td className="whitespace-nowrap">
                        {formatDate(row.createdAt)}
                        <p className="font-mono text-xs" title={row.id}>
                          {row.id.slice(-8)}
                        </p>
                      </td>
                      <td>
                        <p className="text-ink-12">{row.tenantName}</p>
                        <p className="text-xs">{row.tenantEmail}</p>
                      </td>
                      <td>
                        {row.kosName}
                        <p className="text-xs">Kamar {row.roomNumber}</p>
                      </td>
                      <td className="whitespace-nowrap">{formatRupiah(row.amount)}</td>
                      <td className="whitespace-nowrap">{methodLabel(row.method)}</td>
                      <td>
                        <StatusBadge kind="payment" status={row.status} />
                      </td>
                      <td className="whitespace-nowrap">{formatDate(row.expiredAt)}</td>
                      <td>
                        <div className="flex items-center gap-2">
                          <CopyButton value={row.id} label="kode pembayaran" />
                          {row.canConfirm && (
                            <ConfirmPaymentButton paymentId={row.id} label="Konfirmasi" />
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <ul className="space-y-3 xl:hidden">
              {filtered.map((row) => (
                <li key={row.id} className="surface-raised space-y-3 p-4 sm:p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm text-ink-12">{row.tenantName}</p>
                      <p className="truncate text-xs text-ink-10">{row.tenantEmail}</p>
                      <p className="mt-1 text-sm text-ink-11">
                        {row.kosName} · Kamar {row.roomNumber}
                      </p>
                    </div>
                    <StatusBadge kind="payment" status={row.status} />
                  </div>

                  <DefinitionList
                    className="grid grid-cols-2 gap-3 rounded-container inset-fill p-3"
                    items={[
                      { label: "Nominal", value: formatRupiah(row.amount) },
                      { label: "Metode", value: methodLabel(row.method) },
                      { label: "Tagihan dibuat", value: formatDate(row.createdAt) },
                      { label: "Batas bayar", value: formatDate(row.expiredAt) },
                    ]}
                  />

                  <div className="flex flex-wrap items-center gap-2">
                    <CopyButton value={row.id} label="kode pembayaran" />
                    {row.canConfirm && (
                      <ConfirmPaymentButton paymentId={row.id} label="Konfirmasi pembayaran" />
                    )}
                  </div>
                </li>
              ))}
            </ul>

            <p className="text-meta mt-3" aria-live="polite">
              Menampilkan {filtered.length} dari {rows.length} transaksi terbaru
              {stats.totalCount > rows.length ? ` (total ${stats.totalCount})` : ""}.
            </p>
          </>
        )}
      </Section>
    </div>
  );
}
