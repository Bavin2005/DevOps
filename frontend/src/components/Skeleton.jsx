function Skeleton({ className = '', variant = 'text' }) {
  const base = 'rounded animate-shimmer'
  const variants = {
    text: 'h-4 w-full',
    title: 'h-7 w-3/4',
    avatar: 'h-12 w-12 rounded-full',
    card: 'h-32 w-full',
    table: 'h-12 w-full',
    button: 'h-10 w-24',
  }
  return <div className={`${base} ${variants[variant] || variants.text} bg-slate-200 dark:bg-slate-700 ${className}`} />
}

export function SkeletonCard() {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800">
      <Skeleton variant="title" className="mb-3" />
      <Skeleton className="mb-2" />
      <Skeleton className="mb-2 w-4/5" />
      <Skeleton className="w-2/5" />
    </div>
  )
}

export function SkeletonTable({ rows = 5 }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white overflow-hidden dark:border-slate-700 dark:bg-slate-800">
      <div className="border-b border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-800/50">
        <div className="flex gap-4">
          <Skeleton variant="text" className="flex-1" />
          <Skeleton variant="text" className="flex-1" />
          <Skeleton variant="text" className="flex-1" />
        </div>
      </div>
      <div className="divide-y divide-slate-200 dark:divide-slate-700">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex gap-4 px-4 py-3">
            <Skeleton variant="text" className="flex-1" />
            <Skeleton variant="text" className="flex-1" />
            <Skeleton variant="text" className="flex-1" />
          </div>
        ))}
      </div>
    </div>
  )
}

export default Skeleton
