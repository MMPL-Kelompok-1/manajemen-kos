import { Suspense } from "react";
import { redirect } from "next/navigation";
import UserDashboard from "@/components/dashboard/UserDashboard";
import { getSession } from "@/lib/auth";
import { getUserDashboard } from "@/lib/data";

type Props = { searchParams: Promise<{ kos?: string }> };

export default function DashboardPage(props: Props) {
  return (
    <Suspense fallback={<div className="min-h-[100svh] bg-background" />}>
      <DashboardContent {...props} />
    </Suspense>
  );
}

async function DashboardContent({ searchParams }: Props) {
  const { kos } = await searchParams;
  const session = await getSession();
  if (!session) redirect("/");
  if (session.role !== "client") redirect("/admin");
  const data = await getUserDashboard(session.id);
  if (!data) redirect("/");

  return <UserDashboard data={data} pendingKosId={kos ?? null} />;
}
