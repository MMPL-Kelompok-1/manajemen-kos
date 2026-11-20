import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getRoomManagementData } from "@/lib/data";
import ManajemenKosView from "@/components/admin/ManajemenKosView";

export default function ManajemenKosPage() {
  return (
    <Suspense fallback={<ManajemenKosSkeleton />}>
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

function ManajemenKosSkeleton() {
  return (
    <div role="status" className="mx-auto max-w-[1200px] space-y-8 px-5 py-6 pb-12 md:px-6 md:py-8">
      <span className="sr-only">Memuat…</span>
      <div className="space-y-2">
        <span className="skeleton h-7 w-64 max-w-full" />
        <span className="skeleton h-5 w-80 max-w-full" />
      </div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="surface-raised flex flex-col gap-2 p-4">
            <span className="skeleton h-8 w-16" />
            <span className="skeleton h-5 w-28" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="surface-raised overflow-hidden">
            <span className="skeleton h-40 rounded-none" />
            <div className="space-y-2 p-4">
              <span className="skeleton h-6 w-32" />
              <span className="skeleton h-5 w-24" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
