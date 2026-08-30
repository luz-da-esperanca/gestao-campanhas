export function PageSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-8 w-48 rounded-lg bg-blue-100/80" />
      <div className="h-4 w-72 max-w-full rounded bg-slate-200/80" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="glass-card h-28 rounded-2xl" />
        ))}
      </div>
      <div className="glass-card h-48 rounded-2xl" />
    </div>
  );
}
