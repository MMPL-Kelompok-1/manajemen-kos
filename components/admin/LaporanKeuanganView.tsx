"use client";

import { usePathname, useRouter } from "next/navigation";
import { ChartColumn, Download } from "lucide-react";
import EmptyState from "@/components/ui/EmptyState";
import Section from "@/components/ui/Section";
import StatCard from "@/components/ui/StatCard";
import Notice from "@/components/ui/Notice";
import { currentJakartaMonthKey, formatMonthKey, formatRupiah, formatRupiahCompact } from "@/lib/format";
import type { FinancialReport } from "@/lib/data";

export default function LaporanKeuanganView({ report }: { report: FinancialReport }) {
  const router = useRouter();
  const pathname = usePathname();
  const currentMonth = currentJakartaMonthKey();
  const maxRevenue = Math.max(1, ...report.monthly.map((month) => month.revenue));
  const bestMonth = report.monthly.reduce(
    (best, month) => (month.revenue > best.revenue ? month : best),
    report.monthly[0],
  );

  function changeYear(year: string) {
    router.push(`${pathname}?tahun=${year}`);
  }

  return (
    <div className="mx-auto max-w-[1200px] space-y-8 px-5 py-6 pb-12 md:px-6 md:py-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-section">Laporan keuangan</h1>
          <p className="mt-1.5 text-sm text-ink-11">
            Pendapatan dari pembayaran lunas beserta piutang yang masih berjalan.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div>
            <label htmlFor="tahun-laporan" className="sr-only">
              Tahun laporan
            </label>
            <select
              id="tahun-laporan"
              value={report.year}
              onChange={(event) => changeYear(event.target.value)}
              className="field w-full sm:w-auto"
            >
              {report.years.map((year) => (
                <option key={year} value={year}>
                  Tahun {year}
                </option>
              ))}
            </select>
          </div>
          <a
            href={`/api/admin/laporan/export?tahun=${report.year}`}
            className="btn btn-secondary max-sm:w-full"
          >
            <Download size={16} aria-hidden="true" />
            Unduh CSV
          </a>
        </div>
      </div>

      <section
        aria-label="Ringkasan keuangan"
        className="stat-list grid grid-cols-2 gap-3 md:grid-cols-5 md:gap-4"
      >
        <StatCard
          value={formatRupiahCompact(report.totalRevenue)}
          title={formatRupiah(report.totalRevenue)}
          label={`Pendapatan ${report.year}`}
          tone="green"
          className="col-span-2 md:col-span-1"
        />
        <StatCard
          value={formatRupiahCompact(report.thisMonthRevenue)}
          title={formatRupiah(report.thisMonthRevenue)}
          label="Pendapatan bulan ini"
        />
        <StatCard
          value={formatRupiahCompact(report.averageMonthly)}
          title={formatRupiah(report.averageMonthly)}
          label="Rata-rata per bulan"
        />
        <StatCard value={report.paidTransactions} label="Transaksi lunas" />
        <StatCard
          value={formatRupiahCompact(report.receivableAmount)}
          title={formatRupiah(report.receivableAmount)}
          label={`Piutang (${report.receivableCount})`}
          tone={report.receivableCount > 0 ? "amber" : undefined}
          className="col-span-2 md:col-span-1"
        />
      </section>

      {report.totalRevenue === 0 ? (
        <Notice tone="neutral" icon={ChartColumn} title="Belum ada pendapatan pada tahun ini">
          Pendapatan tercatat setelah pembayaran dikonfirmasi oleh pemilik kos.
        </Notice>
      ) : null}

      <Section
        id="grafik-bulanan"
        title="Pendapatan bulanan"
        description={
          report.totalRevenue > 0
            ? `Bulan terbaik: ${bestMonth.label} dengan ${formatRupiah(bestMonth.revenue)}.`
            : "Grafik akan terisi saat ada pembayaran lunas."
        }
      >
        <div className="surface-raised p-4 sm:p-5">
          <div className="flex h-44 items-end gap-1.5 sm:gap-2" aria-hidden="true">
            {report.monthly.map((month) => {
              const percent = maxRevenue > 0 ? (month.revenue / maxRevenue) * 100 : 0;
              const isCurrent = month.month === currentMonth;
              return (
                <div key={month.month} className="flex h-full flex-1 flex-col justify-end">
                  <div
                    className={`w-full rounded-t-[3px] ${isCurrent ? "bg-blue-9" : "bg-ink-5"}`}
                    style={{
                      height: `${percent}%`,
                      minHeight: month.revenue > 0 ? 4 : 0,
                    }}
                    title={`${month.label}: ${formatRupiah(month.revenue)}`}
                  />
                </div>
              );
            })}
          </div>
          <div className="mt-2 flex gap-1.5 sm:gap-2" aria-hidden="true">
            {report.monthly.map((month, index) => (
              <span
                key={month.month}
                className={`flex-1 text-center text-xs ${
                  month.month === currentMonth ? "text-ink-12" : "text-ink-10"
                } ${index % 2 === 1 ? "max-sm:invisible" : ""}`}
              >
                {month.label.slice(0, 3)}
              </span>
            ))}
          </div>
          <ul className="sr-only">
            {report.monthly.map((month) => (
              <li key={month.month}>
                {month.label}: {formatRupiah(month.revenue)} dari {month.transactions} transaksi.
              </li>
            ))}
          </ul>
        </div>
      </Section>

      <Section
        id="rekap-bulanan"
        title="Rekap per bulan"
        description="Jumlah transaksi lunas dan penghuni yang membayar."
      >
        <div className="overflow-x-auto p-0.5">
          <table className="table-tactile">
            <thead>
              <tr>
                <th scope="col">Bulan</th>
                <th scope="col">Transaksi</th>
                <th scope="col">Penghuni</th>
                <th scope="col">Pendapatan</th>
              </tr>
            </thead>
            <tbody>
              {report.monthly.map((month) => (
                <tr key={month.month}>
                  <td className="whitespace-nowrap">{formatMonthKey(month.month)}</td>
                  <td className="whitespace-nowrap">{month.transactions}</td>
                  <td className="whitespace-nowrap">{month.tenants}</td>
                  <td className="whitespace-nowrap">{formatRupiah(month.revenue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section
        id="rincian-kamar"
        title="Pendapatan per kamar"
        description={`${report.roomBreakdown.length} kamar menyumbang pendapatan pada tahun ${report.year}.`}
      >
        {report.roomBreakdown.length === 0 ? (
          <EmptyState
            icon={ChartColumn}
            title="Belum ada rincian per kamar"
            description="Rincian muncul setelah ada pembayaran lunas pada tahun ini."
          />
        ) : (
          <div className="overflow-x-auto p-0.5">
            <table className="table-tactile">
              <thead>
                <tr>
                  <th scope="col">Kamar</th>
                  <th scope="col">Nomor</th>
                  <th scope="col">Transaksi</th>
                  <th scope="col">Pendapatan</th>
                </tr>
              </thead>
              <tbody>
                {report.roomBreakdown.map((room) => (
                  <tr key={room.roomId}>
                    <td>{room.name}</td>
                    <td className="whitespace-nowrap">{room.roomNumber}</td>
                    <td className="whitespace-nowrap">{room.transactions}</td>
                    <td className="whitespace-nowrap">{formatRupiah(room.revenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Section>
    </div>
  );
}
