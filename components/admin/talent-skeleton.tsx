import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { LayoutGrid, Users } from "lucide-react";

export function TalentSkeleton() {
    return (
        <div className="space-y-8 pb-10 animate-pulse">
            {/* Stats Summary Section Skeleton */}
            <div className="space-y-4">
                <div className="flex items-center gap-2 px-1">
                    <LayoutGrid className="w-5 h-5 text-slate-200 dark:text-slate-800" />
                    <div className="h-4 w-32 bg-slate-200 dark:bg-slate-800 rounded-full" />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="p-4 rounded-4xl border-2 border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 h-24 flex flex-col justify-between">
                            <div className="h-2 w-12 bg-slate-100 dark:bg-slate-800 rounded-full" />
                            <div className="flex items-center justify-between">
                                <div className="h-5 w-20 bg-slate-200 dark:bg-slate-800 rounded-lg" />
                                <div className="h-6 w-8 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Detail List Skeleton */}
            <div className="scroll-mt-24">
                <Card className="rounded-[2.5rem] border-slate-200/60 dark:border-slate-800/60 bg-white/50 dark:bg-slate-950/50 backdrop-blur-xl shadow-2xl shadow-slate-100 dark:shadow-none overflow-hidden border">
                    <CardHeader className="p-6 md:p-8 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="space-y-3">
                            <div className="flex items-center gap-3">
                                <Users className="w-7 h-7 text-slate-200 dark:text-slate-800" />
                                <div className="h-8 w-48 bg-slate-200 dark:bg-slate-800 rounded-xl" />
                            </div>
                            <div className="h-4 w-64 bg-slate-100 dark:bg-slate-800 rounded-full" />
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-separate border-spacing-0">
                                <thead>
                                    <tr className="bg-slate-50/80 dark:bg-slate-900/80">
                                        {[...Array(4)].map((_, i) => (
                                            <th key={i} className="px-8 py-4 border-b border-slate-100 dark:border-slate-800">
                                                <div className="h-3 w-20 bg-slate-200 dark:bg-slate-800 rounded-full" />
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                                    {[...Array(5)].map((_, i) => (
                                        <tr key={i}>
                                            <td className="px-8 py-6">
                                                <div className="space-y-2">
                                                    <div className="h-4 w-32 bg-slate-200 dark:bg-slate-800 rounded-lg" />
                                                    <div className="h-3 w-24 bg-slate-100 dark:bg-slate-800 rounded-full" />
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 hidden md:table-cell">
                                                <div className="space-y-2">
                                                    <div className="h-3 w-20 bg-slate-200 dark:bg-slate-800 rounded-full" />
                                                    <div className="h-2 w-16 bg-slate-100 dark:bg-slate-800 rounded-full" />
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="h-3 w-40 bg-slate-100 dark:bg-slate-800 rounded-full" />
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="h-3 w-40 bg-slate-100 dark:bg-slate-800 rounded-full" />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
