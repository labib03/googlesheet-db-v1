import { Trash2, ArrowLeft, History } from "lucide-react";
import { ListSkeleton } from "./skeletons";

export function TrashSkeleton() {
    return (
        <div className="space-y-8 animate-pulse font-outfit px-1">
            {/* Header Skeleton */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-1">
                <div className="flex flex-col space-y-2">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-slate-100 dark:bg-slate-800 rounded-xl" />
                        <div className="p-2 bg-slate-200 dark:bg-slate-800 rounded-xl text-transparent">
                            <Trash2 className="w-6 h-6" />
                        </div>
                        <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded w-48" />
                    </div>
                    <div className="h-4 bg-slate-100 dark:bg-slate-800/50 rounded w-full max-w-xl" />
                </div>
                <div className="hidden md:block h-8 w-40 bg-slate-100 dark:bg-slate-800 rounded-2xl" />
            </div>

            {/* Filters Skeleton */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="space-y-2">
                            <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded w-16 px-1" />
                            <div className="h-11 bg-slate-50 dark:bg-slate-800/50 rounded-xl w-full" />
                        </div>
                    ))}
                </div>
            </div>

            {/* Data Section Skeleton */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden">
                <div className="p-6 border-b border-slate-100 dark:border-slate-800">
                    <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-32" />
                </div>
                <div className="p-6">
                    <ListSkeleton />
                </div>
            </div>
        </div>
    );
}
