"use client";

import { useState } from "react";
import Link from "next/link";
import { ClipboardList } from "lucide-react";
import StatusBadge from "@/components/StatusBadge";
import EmptyState from "@/components/ui/EmptyState";
import StatCard from "@/components/ui/StatCard";
import { formatDate, formatRupiah, formatRupiahCompact } from "@/lib/format";
import type { UserDashboardData } from "@/lib/data";

type Orders = UserDashboardData["orderHistory"];
const BATAS_TAGIHAN = 6;

export default function HistoriPesanan({ orders }: { orders: Orders }) {
  if (orders.length === 0) {
    return (
      <EmptyState
        icon={ClipboardList}
        headingLevel="h2"
        title="Belum ada histori pesanan"
        description="Setelah kamu memesan kamar, semua pesanan dan tagihannya akan tercatat di sini."
        action={
          <Link href="/#product" className="btn btn-primary">
            Lihat kos yang tersedia
          </Link>
        }
      />
    );
  }

  // Pesanan terbaru di atas.
  const urut = [...orders].sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
  const semuaTagihan = orders.flatMap((o) => o.payments);
  const totalDibayar = semuaTagihan.filter((p) => p.status === "lunas").reduce((jumlah, p) => jumlah + p.amount, 0);
  const belumSelesai = semuaTagihan.filter((p) => p.status !== "lunas").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-section">Histori pesanan</h1>
        <p className="mt-1.5 text-sm text-ink-11">Semua pesanan kamar dan tagihannya, dari yang terbaru.</p>
      </div>

      <section aria-label="Ringkasan" className="stat-list grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StatCard value={orders.length} label="Total pesanan" />
        <StatCard
          value={formatRupiahCompact(totalDibayar)}
          title={formatRupiah(totalDibayar)}
          label="Total sudah dibayar"
        />
        <StatCard value={belumSelesai} label="Tagihan belum selesai" tone={belumSelesai > 0 ? "amber" : undefined} />
      </section>

      <ul className="space-y-3">
        {urut.map((order) => (
          <li key={order.orderId}>
            <OrderCard order={order} />
          </li>
        ))}
      </ul>
    </div>
  );
}

function OrderCard({ order }: { order: Orders[number] }) {
  const [semua, setSemua] = useState(false);
  const tampil = semua ? order.payments : order.payments.slice(0, BATAS_TAGIHAN);

  return (
    <article className="surface-raised p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-title">{order.kosName}</h2>
          <p className="mt-0.5 text-sm text-ink-11">
            Kamar {order.roomNumber} · {formatDate(order.startDate)} – {formatDate(order.endDate)}
          </p>
        </div>
        <StatusBadge kind="order" status={order.status} />
      </div>

      {order.payments.length > 0 ? (
        <ul aria-label="Tagihan" className="hairline-t mt-4 divide-y divide-line">
          {tampil.map((p) => (
            <li key={p.id} className="flex items-center justify-between gap-3 py-2.5">
              <div className="min-w-0">
                <p className="text-sm text-ink-12 tabular-nums">{formatRupiah(p.amount)}</p>
                <p className="text-meta">
                  {p.paidAt ? `Dibayar ${formatDate(p.paidAt)}` : `Dibuat ${formatDate(p.createdAt)}`}
                </p>
              </div>
              <StatusBadge kind="payment" status={p.status} />
            </li>
          ))}
        </ul>
      ) : (
        <p className="hairline-t mt-4 pt-3 text-sm text-ink-11">Belum ada tagihan untuk pesanan ini.</p>
      )}

      {order.payments.length > BATAS_TAGIHAN && (
        <button
          type="button"
          onClick={() => setSemua((v) => !v)}
          aria-expanded={semua}
          className="btn btn-ghost btn-sm -ml-3 mt-1"
        >
          {semua ? "Tampilkan lebih sedikit" : `Tampilkan semua (${order.payments.length})`}
        </button>
      )}
    </article>
  );
}
