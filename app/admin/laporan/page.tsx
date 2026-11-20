import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getFinancialReport } from "@/lib/data";
import { currentJakartaMonthKey } from "@/lib/format";
import LaporanKeuanganView from "@/components/admin/LaporanKeuanganView";

type SearchParams = Promise<{ tahun?: string | string[] }>;

export default function LaporanPage({ searchParams }: { searchParams: SearchParams }) {
  return (
    <Suspense fallback={<LaporanSkeleton />}>
      <LaporanContent searchParams={searchParams} />
    </Suspense>
  );
}

function parseYear(value: string | string[] | undefined): number | null {
  const raw = Array.isArray(value) ? value[0] : value;
  const year = Number(raw);
  return Number.isInteger(year) && year >= 2000 && year <= 2100 ? year : null;
}

async function LaporanContent({ searchParams }: { searchParams: SearchParams }) {
  const session = await getSession();

  if (!session) redirect("/login");
  if (session.role !== "owner") redirect("/dashboard");

  const params = await searchParams;
  const currentYear = Number(currentJakartaMonthKey().slice(0, 4));
  const report = await getFinancialReport(parseYear(params.tahun) ?? currentYear);

  return <LaporanKeuanganView report={report} />;
}

function LaporanSkeleton() {
  return (
    <div role="status" className="mx-auto max-w-[1200px] space-y-8 px-5 py-6 pb-12 md:px-6 md:py-8">
      <span className="sr-only">Memuat…</span>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <span className="skeleton h-7 w-56 max-w-full" />
          <span className="skeleton h-5 w-80 max-w-full" />
        </div>
        <span className="skeleton h-9 w-full sm:w-32" />
      </div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-5 md:gap-4">
        {[0, 1, 2, 3, 4].map((index) => (
          <div
            key={index}
            className={`surface-raised flex flex-col gap-2 p-4 ${index === 0 || index === 4 ? "col-span-2 md:col-span-1" : ""}`}
          >
            <span className="skeleton h-8 w-24" />
            <span className="skeleton h-5 w-28" />
          </div>
        ))}
      </div>
      <div className="space-y-6">
        <div className="space-y-2">
          <span className="skeleton h-7 w-48" />
          <span className="skeleton h-5 w-64" />
        </div>
        <div className="surface-raised p-5">
          <span className="skeleton h-44 w-full" />
        </div>
      </div>
      <div className="space-y-6">
        <span className="skeleton h-7 w-40" />
        <div className="surface-raised space-y-3 p-5">
          {[0, 1, 2, 3, 4, 5].map((index) => (
            <span key={index} className="skeleton h-10 w-full" />
          ))}
        </div>
      </div>
    </div>
  );
}
