import { TableSkeleton } from "./skeletons";

export function DashboardSkeleton() {
    return (
        <div className="space-y-8 animate-pulse font-outfit">
            {/* Header Skeleton */}
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                <div className="space-y-2">
                    <div className="h-9 bg-slate-200 dark:bg-slate-800 rounded-lg w-48" />
                    <div className="h-4 bg-slate-100 dark:bg-slate-800/50 rounded w-32" />
                </div>
                <div className="w-full lg:w-auto flex flex-wrap gap-3">
                    <div className="h-10 w-32 bg-slate-200 dark:bg-slate-800 rounded-xl" />
                    <div className="h-10 w-24 bg-slate-200 dark:bg-slate-800 rounded-xl" />
                    <div className="h-10 w-24 bg-slate-200 dark:bg-slate-800 rounded-xl" />
                </div>
            </div>

            {/* Filters Skeleton */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
                <div className="flex items-center gap-3">
                    <div className="h-5 w-1 bg-slate-200 dark:bg-slate-800 rounded-full" />
                    <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-24" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="space-y-2">
                            <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded w-16 px-1" />
                            <div className="h-11 bg-slate-50 dark:bg-slate-800/50 rounded-xl w-full" />
                        </div>
                    ))}
                </div>
            </div>

            {/* Table Skeleton */}
            <TableSkeleton />
        </div>
    );
}
