export function TableSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="hidden border rounded-xl overflow-hidden md:block">
        <div className="bg-slate-50 dark:bg-slate-900 border-b p-4 grid grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-24"></div>
          ))}
        </div>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="p-4 grid grid-cols-6 gap-4 border-b last:border-0 items-center">
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
      <div className="md:hidden grid gap-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 border rounded-2xl p-5 space-y-4">
            <div className="flex gap-4">
              <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-xl"></div>
              <div className="space-y-2">
                <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-48"></div>
                <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded w-32"></div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
               <div className="space-y-1"><div className="h-2 bg-slate-50 dark:bg-slate-800 w-12 rounded"></div><div className="h-3 bg-slate-100 dark:bg-slate-800 w-24 rounded"></div></div>
               <div className="space-y-1"><div className="h-2 bg-slate-50 dark:bg-slate-800 w-12 rounded"></div><div className="h-3 bg-slate-100 dark:bg-slate-800 w-24 rounded"></div></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function StatsSkeleton() {
  return (
    <div className="space-y-10 animate-pulse">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border aspect-[16/9] flex flex-col justify-between">
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
