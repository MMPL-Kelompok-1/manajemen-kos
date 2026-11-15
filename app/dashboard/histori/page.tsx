import { Suspense } from "react";
import HistoriPesanan from "@/components/dashboard/HistoriPesanan";
import { requireUserDashboard } from "@/lib/user-dashboard";

export default function HistoriPage() {
  return (
    <Suspense fallback={<p className="text-sm text-muted-foreground">Memuat...</p>}>
      <Content />
    </Suspense>
  );
}

async function Content() {
  const data = await requireUserDashboard();
  return <HistoriPesanan orders={data.orderHistory} />;
}
