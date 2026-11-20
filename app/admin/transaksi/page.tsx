import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getTransactionManagementData } from "@/lib/data";
import TransaksiView from "@/components/admin/TransaksiView";

export default function TransaksiPage() {
  return (
    <Suspense fallback={<TransaksiSkeleton />}>
      <TransaksiContent />
    </Suspense>
  );
}

async function TransaksiContent() {
  const session = await getSession();

  if (!session) redirect("/login");
  if (session.role !== "owner") redirect("/dashboard");

  const data = await getTransactionManagementData();

  return <TransaksiView data={data} />;
}

function TransaksiSkeleton() {
  return (
    <div role="status" className="mx-auto max-w-[1200px] space-y-8 px-5 py-6 pb-12 md:px-6 md:py-8">
      <span className="sr-only">Memuat…</span>
      <div className="space-y-2">
        <span className="skeleton h-7 w-64 max-w-full" />
        <span className="skeleton h-5 w-80 max-w-full" />
      </div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
        {[0, 1, 2, 3].map((index) => (
          <div key={index} className="surface-raised flex flex-col gap-2 p-4">
            <span className="skeleton h-8 w-24" />
            <span className="skeleton h-5 w-28" />
          </div>
        ))}
      </div>
      <div className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2">
            <span className="skeleton h-7 w-44" />
            <span className="skeleton h-5 w-36" />
          </div>
          <span className="skeleton h-9 w-full sm:w-64" />
        </div>
        <div className="surface-raised space-y-3 p-5">
          {[0, 1, 2, 3, 4, 5, 6].map((index) => (
            <span key={index} className="skeleton h-10 w-full" />
          ))}
        </div>
      </div>
    </div>
  );
}
