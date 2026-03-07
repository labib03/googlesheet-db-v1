"use client";

import { SheetRow } from "@/lib/google-sheets";
import { AnalyticsService } from "@/services/analytics-service";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import {
    GraduationCap,
    Briefcase,
    Heart,
    UserCheck,
    Search,
    BookOpen,
    Smile
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AnalyticsDetailDashboardProps {
    rows: SheetRow[];
}

const container = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
};

export function AnalyticsDetailDashboard({ rows }: AnalyticsDetailDashboardProps) {
    const aiRows = rows.filter(r => r._hasAdditionalInfo === "true");

    // Stats
    const eduDist = AnalyticsService.getFieldDistribution(aiRows, "_ai_Pendidikan");
    const busyDist = AnalyticsService.getFieldDistribution(aiRows, "_ai_Kesibukan Saat ini");
    const marriageStats = AnalyticsService.getMarriageReadinessAverage(aiRows);
    const marriageDist = AnalyticsService.getFieldDistribution(aiRows, "_ai_Dari 1 - 10, seberapa siapkah kamu untuk menikah");

    return (
        <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="space-y-8"
        >
            {/* Top Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <motion.div variants={item}>
                    <Card className="bg-white dark:bg-slate-900 border-none shadow-sm ring-1 ring-slate-200 dark:ring-slate-800 rounded-3xl overflow-hidden relative group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                            <UserCheck className="w-16 h-16 text-indigo-500" />
                        </div>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-slate-500 flex items-center gap-2">
                                <UserCheck className="w-4 h-4 text-indigo-500" />
                                Linked Data
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-slate-900 dark:text-white">
                                {aiRows.length}
                            </div>
                            <p className="text-xs text-slate-400 mt-1">
                                {((aiRows.length / rows.length) * 100).toFixed(1)}% dari total generus
                            </p>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div variants={item}>
                    <Card className="bg-white dark:bg-slate-900 border-none shadow-sm ring-1 ring-slate-200 dark:ring-slate-800 rounded-3xl overflow-hidden relative group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                            <Heart className="w-16 h-16 text-rose-500" />
                        </div>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-slate-500 flex items-center gap-2">
                                <Heart className="w-4 h-4 text-rose-500" />
                                Readiness Score
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-slate-900 dark:text-white">
                                {marriageStats.average || "0"}/10
                            </div>
                            <p className="text-xs text-slate-400 mt-1">
                                Rata-rata kesiapan menikah ({marriageStats.total} responden)
                            </p>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div variants={item}>
                    <Card className="bg-white dark:bg-slate-900 border-none shadow-sm ring-1 ring-slate-200 dark:ring-slate-800 rounded-3xl overflow-hidden relative group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                            <Smile className="w-16 h-16 text-teal-500" />
                        </div>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-slate-500 flex items-center gap-2">
                                <Smile className="w-4 h-4 text-teal-500" />
                                Most Busy
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-slate-900 dark:text-white truncate">
                                {busyDist[0]?.label || "-"}
                            </div>
                            <p className="text-xs text-slate-400 mt-1">
                                Status kesibukan terbanyak saat ini
                            </p>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Education Distribution */}
                <motion.div variants={item}>
                    <Card className="bg-white dark:bg-slate-900 border-none shadow-sm ring-1 ring-slate-200 dark:ring-slate-800 rounded-3xl">
                        <CardHeader>
                            <CardTitle className="text-lg font-bold flex items-center gap-2">
                                <GraduationCap className="w-5 h-5 text-indigo-500" />
                                Education Background
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {eduDist.map((edu, idx) => (
                                <div key={idx} className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-600 dark:text-slate-400 font-medium">{edu.label}</span>
                                        <span className="font-bold text-indigo-600 dark:text-indigo-400">{edu.count}</span>
                                    </div>
                                    <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            whileInView={{ width: `${(edu.count / aiRows.length) * 100}%` }}
                                            viewport={{ once: true, amount: 0.3 }}
                                            transition={{ duration: 0.8, delay: 0.2 + (idx * 0.08), ease: "easeOut" }}
                                            className="h-full bg-indigo-500 rounded-full"
                                        />
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Busy Status Distribution */}
                <motion.div variants={item}>
                    <Card className="bg-white dark:bg-slate-900 border-none shadow-sm ring-1 ring-slate-200 dark:ring-slate-800 rounded-3xl">
                        <CardHeader>
                            <CardTitle className="text-lg font-bold flex items-center gap-2">
                                <Briefcase className="w-5 h-5 text-teal-500" />
                                Kesibukan Saat Ini
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {busyDist.map((item, idx) => (
                                <div key={idx} className="group cursor-default">
                                    <div className="flex items-center justify-between p-3 rounded-2xl border border-transparent hover:border-teal-100 dark:hover:border-teal-900/30 hover:bg-teal-50/50 dark:hover:bg-teal-950/20 transition-all">
                                        <div className="flex items-center gap-3">
                                            <div className="w-2 h-2 rounded-full bg-teal-500" />
                                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{item.label}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs text-slate-400">{item.count} orang</span>
                                            <div className="text-xs font-bold text-teal-600 bg-teal-100 dark:bg-teal-900/30 px-2 py-0.5 rounded-full">
                                                {((item.count / aiRows.length) * 100).toFixed(0)}%
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Marriage Readiness Distribution */}
                <motion.div variants={item} className="lg:col-span-2">
                    <Card className="bg-white dark:bg-slate-900 border-none shadow-sm ring-1 ring-slate-200 dark:ring-slate-800 rounded-3xl">
                        <CardHeader>
                            <CardTitle className="text-lg font-bold flex items-center gap-2">
                                <Smile className="w-5 h-5 text-rose-500" />
                                Marriage Readiness Distribution
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="relative h-64 mt-8 px-4">
                                {/* Grid Lines */}
                                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                                    {[...Array(5)].map((_, i) => (
                                        <div key={i} className="w-full flex items-center gap-4">
                                            <div className="h-px flex-1 bg-slate-100 dark:bg-slate-800/50" />
                                        </div>
                                    ))}
                                </div>

                                {/* Bars Container */}
                                <div className="relative h-full flex items-end justify-between gap-1 sm:gap-2">
                                    {[...Array(10)].map((_, i) => {
                                        const score = i + 1;
                                        const data = marriageDist.find(d => Number(d.label) === score);
                                        const maxCount = Math.max(...marriageDist.map(d => d.count), 1);
                                        const height = data ? (data.count / maxCount) * 100 : 0;

                                        return (
                                            <div key={score} className="flex-1 flex flex-col items-center h-full group">
                                                <div className="relative w-full h-full flex items-end justify-center pb-8">
                                                    {/* Persistent Count Label */}
                                                    {data && data.count > 0 && (
                                                        <motion.div
                                                            initial={{ opacity: 0, y: 10 }}
                                                            whileInView={{ opacity: 1, y: 0 }}
                                                            viewport={{ once: true, amount: 0.5 }}
                                                            transition={{ delay: 0.6 + (i * 0.04), ease: "easeOut" }}
                                                            className="absolute -top-6 text-[11px] font-black text-slate-400 dark:text-slate-500"
                                                        >
                                                            {data.count}
                                                        </motion.div>
                                                    )}

                                                    {/* The Bar */}
                                                    <motion.div
                                                        initial={{ height: 0 }}
                                                        whileInView={{ height: `${height}%` }}
                                                        viewport={{ once: true, amount: 0.3 }}
                                                        transition={{
                                                            duration: 0.6,
                                                            delay: 0.3 + (i * 0.04),
                                                            ease: [0.25, 0.46, 0.45, 0.94]
                                                        }}
                                                        className={cn(
                                                            "w-4 sm:w-6 lg:w-8 rounded-t-lg relative",
                                                            "shadow-[0_-4px_12px_-4px_rgba(16,185,129,0.2)]",
                                                            "bg-linear-to-t from-emerald-600 to-emerald-400"
                                                        )}
                                                    >
                                                        {/* Shine effect on bar */}
                                                        <div className="absolute inset-x-0 top-0 h-1 bg-white/20 rounded-t-lg" />
                                                    </motion.div>
                                                </div>
                                                <span className="text-xs font-bold mt-2 text-slate-500">
                                                    {score}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                            <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-slate-100 dark:border-slate-800">
                                <div className="text-center">
                                    <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Total Responden</p>
                                    <p className="text-xl font-bold text-slate-900 dark:text-white">{marriageStats.total}</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Average Score</p>
                                    <p className="text-xl font-bold text-rose-500">{marriageStats.average}/10</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Ready (8+)</p>
                                    <p className="text-xl font-bold text-slate-900 dark:text-white">
                                        {marriageDist.filter(d => Number(d.label) >= 8).reduce((acc, curr) => acc + curr.count, 0)}
                                    </p>
                                </div>
                                <div className="text-center">
                                    <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Undecided (5-7)</p>
                                    <p className="text-xl font-bold text-slate-900 dark:text-white">
                                        {marriageDist.filter(d => Number(d.label) >= 5 && Number(d.label) < 8).reduce((acc, curr) => acc + curr.count, 0)}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </motion.div>
    );
}
