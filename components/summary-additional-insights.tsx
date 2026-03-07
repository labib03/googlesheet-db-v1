"use client";

import { SheetRow } from "@/lib/google-sheets";
import { AnalyticsService } from "@/services/analytics-service";
import {
    Heart,
    Search,
    Briefcase,
    GraduationCap,
    Lightbulb,
    ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface SummaryAdditionalInsightsProps {
    rows: SheetRow[];
}

export function SummaryAdditionalInsights({ rows }: SummaryAdditionalInsightsProps) {
    const aiRows = rows.filter(r => r._hasAdditionalInfo === "true");
    if (aiRows.length === 0) return null;

    const marriageStats = AnalyticsService.getMarriageReadinessAverage(aiRows);
    const busyDist = AnalyticsService.getFieldDistribution(aiRows, "_ai_Kesibukan Saat ini");

    // Custom Insight: Searching for work
    const searchingForWork = aiRows.filter(r => {
        const val = String(r["_ai_Jika belum bekerja, apakah anda sedang mencari pekerjaan?"] || "").toLowerCase();
        return val.includes("ya") || val.includes("sedang mencari");
    }).length;

    const topEdu = AnalyticsService.getFieldDistribution(aiRows, "_ai_Pendidikan")[0];

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3 px-1">
                <div className="bg-amber-100 dark:bg-amber-950/40 p-1.5 rounded-lg border border-amber-200 dark:border-amber-800">
                    <Lightbulb className="w-4 h-4 text-amber-600" />
                </div>
                <h2 className="text-xl font-bold text-slate-800 dark:text-white font-syne uppercase tracking-tight">
                    Additional Insights
                </h2>
                <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800 ml-2" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                {/* Career Support Insight */}
                <motion.div
                    whileHover={{ y: -5 }}
                    className="p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 bg-blue-50 dark:bg-blue-900/10 rounded-full" />
                    <div className="relative space-y-3">
                        <div className="p-2 bg-blue-100 dark:bg-blue-950/40 w-fit rounded-xl">
                            <Search className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Job Seekers</p>
                            <div className="flex items-baseline gap-2">
                                <span className="text-2xl font-bold text-slate-900 dark:text-white">{searchingForWork}</span>
                                <span className="text-[10px] text-slate-400 font-medium">Orang</span>
                            </div>
                        </div>
                        <p className="text-[11px] text-slate-500 leading-relaxed">
                            Generus yang sedang aktif mencari pekerjaan atau peluang baru.
                        </p>
                    </div>
                </motion.div>

                {/* Readiness Gauge Insight */}
                <motion.div
                    whileHover={{ y: -5 }}
                    className="p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 bg-rose-50 dark:bg-rose-900/10 rounded-full" />
                    <div className="relative space-y-3">
                        <div className="p-2 bg-rose-100 dark:bg-rose-950/40 w-fit rounded-xl">
                            <Heart className="w-4 h-4 text-rose-600" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Marriage Readiness</p>
                            <div className="flex items-baseline gap-2">
                                <span className="text-2xl font-bold text-slate-900 dark:text-white">{marriageStats.average}</span>
                                <span className="text-[10px] text-slate-400 font-medium">AVG Score</span>
                            </div>
                        </div>
                        <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-rose-500 rounded-full transition-all duration-1000"
                                style={{ width: `${marriageStats.average * 10}%` }}
                            />
                        </div>
                    </div>
                </motion.div>

                {/* Top Education Insight */}
                <motion.div
                    whileHover={{ y: -5 }}
                    className="p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 bg-indigo-50 dark:bg-indigo-900/10 rounded-full" />
                    <div className="relative space-y-3">
                        <div className="p-2 bg-indigo-100 dark:bg-indigo-950/40 w-fit rounded-xl">
                            <GraduationCap className="w-4 h-4 text-indigo-600" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Dominant Education</p>
                            <div className="flex items-baseline gap-1 overflow-hidden">
                                <span className="text-xl font-bold text-slate-900 dark:text-white truncate block">
                                    {topEdu?.label || "-"}
                                </span>
                            </div>
                        </div>
                        <p className="text-[11px] text-slate-500 leading-relaxed">
                            Jenjang pendidikan terakhir yang paling banyak ditempuh.
                        </p>
                    </div>
                </motion.div>

                {/* Employment High Insight */}
                <motion.div
                    whileHover={{ y: -5 }}
                    className="p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 bg-teal-50 dark:bg-teal-900/10 rounded-full" />
                    <div className="relative space-y-3">
                        <div className="p-2 bg-teal-100 dark:bg-teal-950/40 w-fit rounded-xl">
                            <Briefcase className="w-4 h-4 text-teal-600" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Main Occupation</p>
                            <div className="flex items-baseline gap-1">
                                <span className="text-xl font-bold text-slate-900 dark:text-white truncate block">
                                    {busyDist[0]?.label || "-"}
                                </span>
                            </div>
                        </div>
                        <p className="text-[11px] text-slate-500 leading-relaxed">
                            Aktivitas utama mayoritas generus saat ini.
                        </p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
