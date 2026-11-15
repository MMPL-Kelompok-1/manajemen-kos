import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  ClipboardList,
  DoorOpen,
  Hourglass,
  Receipt,
  Wallet,
} from "lucide-react";
import StatusBadge from "@/components/StatusBadge";
import { formatDate, formatRupiah } from "@/lib/format";
import type { UserDashboardData } from "@/lib/data";

type Orders = UserDashboardData["orderHistory"];
type StatusPesanan = Orders[number]["status"];

const labelPesanan: Record<StatusPesanan, string> = {
  pending: "Menunggu pembayaran",
  confirmed: "Terkonfirmasi",
  cancelled: "Dibatalkan",
};

const gayaPesanan: Record<StatusPesanan, string> = {
  pending: "bg-muted text-muted-foreground",
  confirmed: "bg-green-3 text-green-11",
  cancelled: "bg-red-3 text-red-11",
};

export default function HistoriPesanan({ orders }: { orders: Orders }) {
  // Pesanan terbaru di atas.
  const urut = [...orders].sort(
    (a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
  );

  const semuaTagihan = orders.flatMap((o) => o.payments);
  const totalDibayar = semuaTagihan
    .filter((p) => p.status === "lunas")
    .reduce((jumlah, p) => jumlah + p.amount, 0);
  const belumSelesai = semuaTagihan.filter((p) => p.status !== "lunas").length;

  if (orders.length === 0) {
    return (
      <section className="rounded-3xl border border-dashed border-border bg-card p-8 text-center sm:p-12">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
          <ClipboardList size={26} />
        </span>
        <h2 className="mt-5 text-xl font-bold">Belum ada histori pesanan</h2>
        <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
          Setelah kamu memesan kamar, semua pesanan dan tagihannya akan tercatat di sini.
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

  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm text-muted-foreground">Riwayat sewa</p>
        <h2 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">Histori pesanan</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Semua pesanan kamar dan tagihannya, dari yang terbaru.
        </p>
      </div>

      {/* Ringkasan */}
      <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {[
          { icon: ClipboardList, label: "Total pesanan", value: `${orders.length} pesanan` },
          { icon: Wallet, label: "Total sudah dibayar", value: formatRupiah(totalDibayar) },
          { icon: Hourglass, label: "Tagihan belum selesai", value: `${belumSelesai} tagihan` },
        ].map(({ icon: Icon, label, value }) => (
          <div
            key={label}
            className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground">
              <Icon size={18} />
            </span>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">{label}</p>
              <p className="truncate font-bold">{value}</p>
            </div>
          </div>
        ))}
      </section>

      {/* Daftar pesanan */}
      <ul className="space-y-4">
        {urut.map((order) => (
          <li key={order.orderId}>
            <article className="overflow-hidden rounded-3xl border border-border bg-card">
              <div className="flex flex-wrap items-start justify-between gap-3 p-5 sm:p-6">
                <div className="flex items-start gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                    <DoorOpen size={20} />
                  </span>
                  <div>
                    <h3 className="text-lg font-bold leading-tight">{order.kosName}</h3>
                    <p className="text-sm text-muted-foreground">Kamar {order.roomNumber}</p>
                  </div>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${gayaPesanan[order.status]}`}
                >
                  {labelPesanan[order.status]}
                </span>
              </div>

              <div className="mx-5 flex flex-wrap items-center gap-x-6 gap-y-2 rounded-2xl bg-muted/50 px-4 py-3 text-sm sm:mx-6">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <CalendarDays size={16} /> Periode sewa
                </span>
                <span className="font-semibold">
                  {formatDate(order.startDate)} - {formatDate(order.endDate)}
                </span>
              </div>

              <div className="p-5 pt-4 sm:p-6 sm:pt-4">
                <p className="mb-3 text-sm font-semibold text-muted-foreground">Tagihan</p>
                {order.payments.length > 0 ? (
                  <ul className="space-y-2">
                    {order.payments.map((p) => (
                      <li
                        key={p.id}
                        className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border px-4 py-3"
                      >
                        <div className="flex items-center gap-3">
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                            <Receipt size={16} />
                          </span>
                          <div>
                            <p className="font-bold">{formatRupiah(p.amount)}</p>
                            <p className="break-all font-mono text-xs text-muted-foreground">
                              {p.id}
                            </p>
                          </div>
                        </div>
                        <StatusBadge
                          status={p.status === "menunggu_pembayaran" ? "belum_bayar" : p.status}
                        />
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Belum ada tagihan untuk pesanan ini.
                  </p>
                )}
              </div>
            </article>
          </li>
        ))}
      </ul>
    </div>
  );
}
