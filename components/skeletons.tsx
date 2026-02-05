export function TableSkeleton() {
  return (
    <div className="border rounded-xl overflow-hidden animate-pulse bg-white dark:bg-slate-900 shadow-sm">
      <div className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800 p-4 grid grid-cols-6 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-24"></div>
        ))}
      </div>
      <div className="divide-y divide-slate-100 dark:divide-slate-800">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="p-4 grid grid-cols-6 gap-4 items-center bg-white dark:bg-slate-900">
            <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-32"></div>
            <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded w-20"></div>
            <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded w-24"></div>
            <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded w-16"></div>
            <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded w-28"></div>
            <div className="flex gap-2">
              <div className="h-8 w-8 bg-slate-100 dark:bg-slate-800 rounded-lg"></div>
              <div className="h-8 w-8 bg-slate-100 dark:bg-slate-800 rounded-lg"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="grid gap-4 animate-pulse">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4 shadow-sm">
          <div className="flex gap-4">
            <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-xl shrink-0"></div>
            <div className="space-y-2 flex-1 min-w-0">
              <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-3/4"></div>
              <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded w-1/2"></div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
            <div className="space-y-1.5">
              <div className="h-2 bg-slate-50 dark:bg-slate-800 w-12 rounded"></div>
              <div className="h-3.5 bg-slate-100 dark:bg-slate-800 w-24 rounded"></div>
            </div>
            <div className="space-y-1.5">
              <div className="h-2 bg-slate-50 dark:bg-slate-800 w-12 rounded"></div>
              <div className="h-3.5 bg-slate-100 dark:bg-slate-800 w-24 rounded"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function ListSkeleton() {
  return (
    <div className="flex flex-col divide-y divide-slate-100 dark:divide-slate-800 animate-pulse">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="p-6 flex items-center gap-5">
          <div className="h-14 w-14 rounded-2xl bg-slate-100 dark:bg-slate-800 shrink-0"></div>
          <div className="flex-1 space-y-2.5">
            <div className="h-5 bg-slate-100 dark:bg-slate-800 rounded w-1/3"></div>
            <div className="flex gap-3">
              <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded w-24"></div>
              <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded w-32"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function StatsSkeleton() {
  return (
    <div className="space-y-10 animate-pulse">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 aspect-video flex flex-col justify-between shadow-sm">
            <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-xl"></div>
            <div className="space-y-2">
              <div className="h-3 bg-slate-100 dark:bg-slate-800 w-24 rounded"></div>
              <div className="h-8 bg-slate-100 dark:bg-slate-800 w-16 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
