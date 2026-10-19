import { Suspense } from "react";
import { redirect } from "next/navigation";
import AdminDashboard from "@/components/admin/AdminDashboard";
import { getSession } from "@/lib/auth";
import { getAdminOverview } from "@/lib/data";

export default function AdminPage() {
  return (
    <Suspense fallback={<div className="min-h-[100svh] bg-background" />}>
      <AdminContent />
    </Suspense>
  );
}

async function AdminContent() {
  const session = await getSession();
  if (!session) redirect("/admin/login");
  if (session.role !== "owner") redirect("/dashboard");
  const overview = await getAdminOverview(session.id);
  return <AdminDashboard overview={overview} />;
}
