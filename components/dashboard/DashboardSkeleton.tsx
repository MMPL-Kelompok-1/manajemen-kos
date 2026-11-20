export default function DashboardSkeleton() {
  return (
    <div role="status" aria-label="Memuat" className="space-y-8">
      <div className="space-y-2">
        <span className="skeleton h-7 w-48" />
        <span className="skeleton h-5 w-72 max-w-full" />
      </div>
      <div className="surface-raised space-y-3 p-5">
        <span className="skeleton h-6 w-40" />
        <span className="skeleton h-5 w-full max-w-md" />
      </div>
      <div className="surface-raised overflow-hidden">
        <span className="skeleton h-44 rounded-none sm:h-60" />
        <div className="grid grid-cols-2 gap-4 p-5 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <span key={i} className="skeleton h-11" />
          ))}
        </div>
      </div>
      <span className="sr-only">Memuat…</span>
    </div>
  );
}
