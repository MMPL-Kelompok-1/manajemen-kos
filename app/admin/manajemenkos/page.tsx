import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getRoomManagementData } from "@/lib/data";
import ManajemenKosView from "@/components/admin/ManajemenKosView";

export default function ManajemenKosPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full bg-surface px-space-lg min-h-screen text-on-surface p-8 space-y-6">
          <div className="skeleton h-8 w-64 rounded-lg"></div>
          <div className="skeleton h-4 w-96 rounded-lg"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 pt-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="skeleton h-32 rounded-xl"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 pt-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="skeleton h-64 rounded-xl"></div>
            ))}
          </div>
        </div>
      }
    >
      <ManajemenKosContent />
    </Suspense>
  );
}

async function ManajemenKosContent() {
  const session = await getSession();

  if (!session) redirect("/login");
  if (session.role !== "owner") redirect("/dashboard");

  const data = await getRoomManagementData();

  return <ManajemenKosView initialData={data} />;
}
