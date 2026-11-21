"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search, Users } from "lucide-react";
import { ConfirmPaymentButton } from "@/components/admin/TenantActions";
import StatusBadge, { StatusDot } from "@/components/StatusBadge";
import EmptyState from "@/components/ui/EmptyState";
import Section from "@/components/ui/Section";
import StatCard from "@/components/ui/StatCard";
import { DefinitionList } from "@/components/ui/DefinitionList";
import { kosStatus } from "@/components/ui/status";
import { formatDate, formatRupiah } from "@/lib/format";
import type { KosStatus, TenantManagementData } from "@/lib/data";

type Filter = "semua" | KosStatus;

const KOSONG = "–";
const filterOptions: { value: Filter; label: string }[] = [
  { value: "semua", label: "Semua status" },
  ...(Object.keys(kosStatus) as KosStatus[]).map((value) => ({
    value,
    label: kosStatus[value].label,
  })),
];

export default function PenghuniView({ data }: { data: TenantManagementData }) {
  const { rows, stats } = data;
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("semua");

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

  const adaFilter = query.trim() !== "" || filter !== "semua";

  return (
    <div className="mx-auto max-w-[1200px] space-y-8 px-5 py-6 pb-12 md:px-6 md:py-8">
      <div>
        <h1 className="text-section">Manajemen penghuni</h1>
        <p className="mt-1.5 text-sm text-ink-11">
          Data penghuni, kamar, status tagihan, dan riwayat pembayaran.
        </p>
      </div>

      <section aria-label="Ringkasan penghuni" className="stat-list grid grid-cols-2 gap-3 md:grid-cols-5 md:gap-4">
        <StatCard value={stats.total} label="Total penghuni" />
        <StatCard value={stats.lunas} label="Lunas" tone="green" />
        <StatCard value={stats.menungguKonfirmasi} label="Menunggu konfirmasi" tone="blue" />
        <StatCard value={stats.terlambat} label="Terlambat" tone="red" />
        <StatCard
          value={stats.belumBayar}
          label="Belum bayar"
          tone="amber"
          className="col-span-2 md:col-span-1"
        />
      </section>

      <Section
        id="daftar-penghuni"
        title="Daftar penghuni"
        description={`${filtered.length} dari ${rows.length} penghuni`}
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
                  onChange={(event) => setQuery(event.target.value)}
                  className="field pl-9"
                />
              </div>
              <label htmlFor="filter-status-penghuni" className="sr-only">
                Filter status
              </label>
              <select
                id="filter-status-penghuni"
                value={filter}
                onChange={(event) => setFilter(event.target.value as Filter)}
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
            <div className="hidden overflow-x-auto p-0.5 lg:block">
              <table className="table-tactile">
                <thead>
                  <tr>
                    <th scope="col">Penghuni</th>
                    <th scope="col">Kontak</th>
                    <th scope="col">Kos / kamar</th>
                    <th scope="col">Status</th>
                    <th scope="col">Tagihan</th>
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
                        {row.roomNumber && <p className="text-xs">Kamar {row.roomNumber}</p>}
                      </td>
                      <td>
                        <StatusDot status={row.status} />
                      </td>
                      <td className="whitespace-nowrap">
                        {row.amount !== null ? formatRupiah(row.amount) : KOSONG}
                        <p className="text-xs">Dibayar {formatDate(row.lastPaidAt)}</p>
                      </td>
                      <td className="whitespace-nowrap">{formatDate(row.dueAt)}</td>
                      <td>
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/admin/penghuni/${row.registrationId}`}
                            className="btn btn-secondary btn-sm"
                          >
                            Detail
                          </Link>
                          {row.paymentId && row.paymentStatus === "menunggu_konfirmasi" && (
                            <ConfirmPaymentButton paymentId={row.paymentId} label="Konfirmasi" />
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

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
                      { label: "Kamar", value: row.roomNumber ?? KOSONG },
                      { label: "Tagihan", value: row.amount !== null ? formatRupiah(row.amount) : KOSONG },
                      { label: "Jatuh tempo", value: formatDate(row.dueAt) },
                    ]}
                  />

                  <div className="flex flex-col gap-2">
                    <Link
                      href={`/admin/penghuni/${row.registrationId}`}
                      className="btn btn-secondary w-full"
                    >
                      Lihat detail
                    </Link>
                    {row.paymentId && row.paymentStatus === "menunggu_konfirmasi" && (
                      <ConfirmPaymentButton
                        paymentId={row.paymentId}
                        label="Konfirmasi pembayaran"
                        fullWidth
                      />
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}
      </Section>
    </div>
  );
}
