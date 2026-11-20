import { Suspense } from "react";
import DashboardSkeleton from "@/components/dashboard/DashboardSkeleton";
import HistoriPesanan from "@/components/dashboard/HistoriPesanan";
import { requireUserDashboard } from "@/lib/user-dashboard";

export default function HistoriPage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <Content />
    </Suspense>
  );
}

async function Content() {
  const data = await requireUserDashboard();
  return <HistoriPesanan orders={data.orderHistory} />;
}
