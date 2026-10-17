import { Suspense } from "react";
import AdminDashboard from "@/components/admin/AdminDashboard";
import { requireAdmin } from "@/lib/auth";
import { getAdminOverview } from "@/lib/data";

export default function AdminPage() {
  return (
    <Suspense fallback={<div className="min-h-[100svh] bg-zinc-50" />}>
      <AdminContent />
    </Suspense>
  );
}

async function AdminContent() {
  await requireAdmin();
  const overview = await getAdminOverview();
  return <AdminDashboard overview={overview} />;
}
