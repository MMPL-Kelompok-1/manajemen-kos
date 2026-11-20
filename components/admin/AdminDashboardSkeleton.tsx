export default function AdminDashboardSkeleton() {
  return (
    <div role="status" className="mx-auto max-w-[1200px] space-y-8 px-5 py-6 pb-12 md:px-6 md:py-8">
      <span className="sr-only">Memuat…</span>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-5 md:gap-4">
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className={`surface-raised flex flex-col gap-2 p-4 ${i === 4 ? "col-span-2 md:col-span-1" : ""}`}>
            <span className="skeleton h-8 w-12" />
            <span className="skeleton h-5 w-28" />
          </div>
        ))}
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <span className="skeleton h-7 w-40" />
          <span className="skeleton h-5 w-56" />
        </div>
        <div className="surface-raised space-y-3 p-5">
          {[0, 1, 2].map((i) => (
            <span key={i} className="skeleton h-14 w-full" />
          ))}
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2">
            <span className="skeleton h-7 w-44" />
            <span className="skeleton h-5 w-32" />
          </div>
          <span className="skeleton h-9 w-full sm:w-64" />
        </div>
        <div className="surface-raised space-y-3 p-5">
          {[0, 1, 2, 3, 4].map((i) => (
            <span key={i} className="skeleton h-10 w-full" />
          ))}
        </div>
      </div>
    </div>
  );
}
