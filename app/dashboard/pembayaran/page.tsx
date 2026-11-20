import { Suspense } from "react";
import DashboardSkeleton from "@/components/dashboard/DashboardSkeleton";
import PembayaranUser from "@/components/dashboard/PembayaranUser";
import { requireUserDashboard } from "@/lib/user-dashboard";

export default function PembayaranPage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <Content />
    </Suspense>
  );
}

async function Content() {
  const data = await requireUserDashboard();
  return <PembayaranUser data={data} />;
}
