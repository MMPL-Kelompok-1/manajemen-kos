import { Suspense } from "react";
import KosAnda from "@/components/dashboard/KosAnda";
import { requireUserDashboard } from "@/lib/user-dashboard";

type Props = { searchParams: Promise<{ kos?: string }> };

export default function DashboardPage(props: Props) {
  return (
    <Suspense fallback={<p className="text-sm text-muted-foreground">Memuat...</p>}>
      <Content {...props} />
    </Suspense>
  );
}

async function Content({ searchParams }: Props) {
  const { kos } = await searchParams;
  const data = await requireUserDashboard();
  return <KosAnda data={data} pendingKosId={kos ?? null} />;
}