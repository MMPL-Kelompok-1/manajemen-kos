import { Suspense } from "react";
import { redirect } from "next/navigation";
import AdminLoginForm from "@/components/admin/AdminLoginForm";
import { getSession } from "@/lib/auth";

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<div className="min-h-[100svh]" />}>
      <AdminLoginContent />
    </Suspense>
  );
}

async function AdminLoginContent() {
  const session = await getSession();
  if (session?.role === "owner") redirect("/admin");
  return <AdminLoginForm />;
}
