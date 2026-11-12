export default function AdminDashboardSkeleton() {
  return (
    <div className="min-h-full">
      <main className="mx-auto max-w-7xl space-y-6 px-4 py-6 pb-12 sm:px-6 md:py-8">
        {/* Ringkasan Cards Skeleton */}
        <section className="grid grid-cols-2 gap-3 md:grid-cols-5 md:gap-4">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="rounded-2xl bg-card p-4 shadow-sm sm:p-5 flex flex-col gap-3"
            >
              <div className="skeleton h-4 w-24"></div>
              <div className="skeleton h-8 w-16"></div>
            </div>
          ))}
        </section>

        {/* Status Kamar Skeleton */}
        <section className="rounded-2xl bg-card p-5 shadow-sm sm:p-6 space-y-4">
          <div className="skeleton h-5 w-36"></div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="skeleton h-5 w-full rounded-xl"></div>
            ))}
          </div>
        </section>

        {/* Tabel Penghuni Skeleton */}
        <section className="rounded-2xl bg-card p-5 shadow-sm sm:p-6 space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="skeleton h-6 w-48"></div>
            <div className="skeleton h-10 w-full sm:w-64 rounded-xl"></div>
          </div>
          <div className="space-y-3 pt-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="skeleton h-12 w-full rounded-lg"></div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

