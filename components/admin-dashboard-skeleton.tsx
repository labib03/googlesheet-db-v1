import { ShieldCheck } from "lucide-react";
import { TableSkeleton } from "./skeletons";

export function AdminDashboardSkeleton() {
    return (
        <div className="space-y-8 animate-pulse font-outfit">
            {/* Section 1: Header Introduction Skeleton */}
            <div className="px-1 border-b border-slate-200 dark:border-slate-800 pb-8">
                <div className="flex flex-col space-y-3">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-slate-200 dark:bg-slate-800 rounded-2xl text-transparent">
                            <ShieldCheck className="w-7 h-7" />
                        </div>
                        <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded-lg w-64" />
                    </div>
                    <div className="space-y-2 max-w-2xl">
                        <div className="h-4 bg-slate-100 dark:bg-slate-800/50 rounded w-full" />
                        <div className="h-4 bg-slate-100 dark:bg-slate-800/50 rounded w-3/4" />
                    </div>
                </div>
            </div>

            {/* Section 2: Action Toolbar Skeleton */}
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 bg-slate-100/40 dark:bg-slate-900/40 p-4 rounded-3xl border border-slate-200/60 dark:border-slate-800/60 mx-1">
                <div className="flex items-center gap-2 flex-wrap">
                    <div className="h-10 w-48 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
                    <div className="h-10 w-32 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
                    <div className="h-10 w-32 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
                </div>
                <div className="flex items-center gap-3 w-full lg:w-auto justify-end">
                    <div className="h-10 w-32 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
                    <div className="h-10 w-32 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
                </div>
            </div>

            {/* Section 3: Filters Skeleton */}
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

            {/* Section 4: Table Skeleton */}
            <div className="mx-1">
                <TableSkeleton />
            </div>
        </div>
    );
}
