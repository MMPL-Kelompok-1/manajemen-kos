// app/admin/dashboard/page.tsx
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getAdminOverview } from "@/lib/data";
import AdminDashboardView from "@/components/admin/AdminDashboardView";

export default function AdminDashboardPage() {
  return (
    <Suspense fallback={<div className="min-h-[100svh] bg-background" />}>
      <AdminDashboardContent />
    </Suspense>
  );
}

async function AdminDashboardContent() {
  const session = await getSession();

  if (!session) redirect("/login");
  if (session.role !== "owner") redirect("/dashboard");

  const overview = await getAdminOverview(session.id);

  return <AdminDashboardView overview={overview} />;
}