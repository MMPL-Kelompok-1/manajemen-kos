import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, ClipboardList } from "lucide-react";
import { ConfirmPaymentButton, RoomEditor } from "@/components/admin/TenantActions";
import StatusBadge from "@/components/StatusBadge";
import EmptyState from "@/components/ui/EmptyState";
import Section from "@/components/ui/Section";
import { DefinitionList } from "@/components/ui/DefinitionList";
import { getSession } from "@/lib/auth";
import { getTenantDetail } from "@/lib/data";
import { formatDate, formatRupiah } from "@/lib/format";

const KOSONG = "–";

export default async function TenantDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();

  if (!session) redirect("/login");
  if (session.role !== "owner") redirect("/dashboard");

  const { id } = await params;
  const tenant = await getTenantDetail(id);
  if (!tenant) notFound();

  return (
    <div className="mx-auto max-w-[1000px] space-y-8 px-5 py-6 pb-12 md:px-6 md:py-8">
      <div>
        <Link href="/admin/penghuni" className="btn btn-ghost btn-sm -ml-2">
          <ArrowLeft size={16} aria-hidden="true" />
          Kembali ke daftar penghuni
        </Link>
        <div className="mt-3 flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-section">{tenant.name}</h1>
            <p className="mt-1.5 text-sm text-ink-11">{tenant.email}</p>
          </div>
          <StatusBadge status={tenant.status} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <section aria-labelledby="data-penghuni" className="surface-raised p-5">
          <h2 id="data-penghuni" className="text-title">
            Data penghuni
          </h2>
          <DefinitionList
            className="mt-4 grid grid-cols-2 gap-4"
            items={[
              { label: "Nomor telepon", value: tenant.phone },
              { label: "Email", value: tenant.email },
              { label: "Kos", value: tenant.kosName ?? KOSONG },
              { label: "Kamar", value: tenant.roomNumber ?? KOSONG },
            ]}
          />
        </section>

        <section aria-labelledby="tagihan-penghuni" className="surface-raised space-y-4 p-5">
          <h2 id="tagihan-penghuni" className="text-title">
            Tagihan terakhir
          </h2>
          <DefinitionList
            className="grid grid-cols-2 gap-4"
            items={[
              { label: "Nominal", value: tenant.amount !== null ? formatRupiah(tenant.amount) : KOSONG },
              { label: "Status", value: tenant.paymentStatus ? <StatusBadge kind="payment" status={tenant.paymentStatus} /> : KOSONG },
              { label: "Dibayar terakhir", value: formatDate(tenant.lastPaidAt) },
              { label: "Jatuh tempo", value: formatDate(tenant.dueAt) },
            ]}
          />
          <div className="space-y-3">
            {tenant.kosName ? (
              <RoomEditor registrationId={tenant.id} initial={tenant.roomNumber} />
            ) : (
              <p className="text-sm text-ink-11">Penghuni belum memilih kamar.</p>
            )}
            {tenant.paymentId && tenant.paymentStatus === "menunggu_konfirmasi" && (
              <ConfirmPaymentButton
                paymentId={tenant.paymentId}
                label="Konfirmasi pembayaran"
                fullWidth
              />
            )}
          </div>
        </section>
      </div>

      <Section
        id="riwayat"
        title="Riwayat pesanan"
        description={`${tenant.orders.length} pesanan tercatat.`}
      >
        {tenant.orders.length === 0 ? (
          <EmptyState
            icon={ClipboardList}
            title="Belum ada pesanan"
            description="Penghuni ini belum pernah memesan kamar."
          />
        ) : (
          <ul className="space-y-4">
            {tenant.orders
              .slice()
              .reverse()
              .map((order) => (
                <li key={order.orderId} className="surface-raised p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="text-title">{order.kosName}</h3>
                      <p className="mt-0.5 text-sm text-ink-11">
                        Kamar {order.roomNumber} · {formatDate(order.startDate)} –{" "}
                        {formatDate(order.endDate)}
                      </p>
                    </div>
                    <StatusBadge kind="order" status={order.status} />
                  </div>

                  {order.payments.length === 0 ? (
                    <p className="hairline-t mt-4 pt-3 text-sm text-ink-11">
                      Belum ada tagihan untuk pesanan ini.
                    </p>
                  ) : (
                    <ul aria-label="Tagihan" className="hairline-t mt-4 divide-y divide-line">
                      {order.payments.map((payment) => (
                        <li
                          key={payment.id}
                          className="flex flex-wrap items-center justify-between gap-3 py-2.5"
                        >
                          <div className="min-w-0">
                            <p className="text-sm text-ink-12 tabular-nums">
                              {formatRupiah(payment.amount)}
                            </p>
                            <p className="text-meta">
                              {payment.paidAt
                                ? `Dibayar ${formatDate(payment.paidAt)}`
                                : `Batas bayar ${formatDate(payment.expiredAt)}`}
                            </p>
                          </div>
                          <StatusBadge kind="payment" status={payment.status} />
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
          </ul>
        )}
      </Section>
    </div>
  );
}
