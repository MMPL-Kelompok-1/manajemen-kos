import { Suspense } from "react";
import { redirect } from "next/navigation";
import UserDashboard from "@/components/dashboard/UserDashboard";
import { getSession } from "@/lib/auth";
import { getUserDashboard } from "@/lib/data";

type Props = { searchParams: Promise<{ kos?: string }> };

export default function DashboardPage(props: Props) {
  return (
    <Suspense fallback={<div className="min-h-svh bg-zinc-50" />}>
      <DashboardContent {...props} />
    </Suspense>
  );
}

async function DashboardContent({ searchParams }: Props) {
  const { kos } = await searchParams;
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role !== "client") redirect("/admin");
  const data = await getUserDashboard(session.id);
  if (!data) redirect("/login");

  return <UserDashboard data={data} pendingKosId={kos ?? null} />;
}
