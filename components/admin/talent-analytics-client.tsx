"use client";

import { useState, useMemo } from "react";
import { SheetRow } from "@/lib/google-sheets";
import { COLUMNS, CONFIG_KEYS } from "@/lib/constants";
import { categorizeByKeywords } from "@/lib/helper";
import { ShieldCheck, LayoutDashboard, Settings2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { TalentDashboard } from "@/components/admin/talent-dashboard";
import { TalentConfigCard } from "@/components/admin/talent-config-card";

interface TalentAnalyticsClientProps {
    initialData: SheetRow[];
    config: Record<string, unknown>;
    error: string | null;
    mode?: "full" | "dashboard-only" | "config-only";
}

export function TalentAnalyticsClient({
    initialData,
    config,
    error,
    mode = "full",
}: TalentAnalyticsClientProps) {
    const [activeTab, setActiveTab] = useState<"dashboard" | "config">(
        mode === "config-only" ? "config" : "dashboard"
    );
    const [contentType, setContentType] = useState<"hobi" | "skill">("hobi");

    // Unified State for Talent Configuration (Lifted from TalentConfigCard)
    const initialHobiMapping = useMemo(() => (config[CONFIG_KEYS.MAP_KATEGORI_HOBI] || {}) as Record<string, string[]>, [config]);
    const initialSkillMapping = useMemo(() => (config[CONFIG_KEYS.MAP_KATEGORI_SKILL] || {}) as Record<string, string[]>, [config]);
    const initialHobiCategories = useMemo(() => (config[CONFIG_KEYS.LIST_KATEGORI_HOBI_ALL] || []) as string[], [config]);
    const initialSkillCategories = useMemo(() => (config[CONFIG_KEYS.LIST_KATEGORI_SKILL_ALL] || []) as string[], [config]);

    const [hobiMapping, setHobiMapping] = useState(initialHobiMapping);
    const [skillMapping, setSkillMapping] = useState(initialSkillMapping);
    const [hobiCategories, setHobiCategories] = useState(initialHobiCategories);
    const [skillCategories, setSkillCategories] = useState(initialSkillCategories);

    // Group data based on mapping and contentType
    const categorizedData = useMemo(() => {
        const results: Record<string, SheetRow[]> = {
            "Lainnya": []
        };

        const activeMapping = contentType === "hobi" ? hobiMapping : skillMapping;
        const activeCategories = contentType === "hobi" ? hobiCategories : skillCategories;

        const relevantCategories = Array.from(new Set([...activeCategories, "Lainnya"]));

        // Initialize categories
        relevantCategories.forEach((cat: string) => {
            results[cat] = [];
        });

        initialData.forEach(row => {
            const textToAnalyze = String(row[contentType === "hobi" ? COLUMNS.HOBI : COLUMNS.SKILL] || "");
            const matches = categorizeByKeywords(textToAnalyze, activeMapping);

            if (matches.length === 0) {
                results["Lainnya"].push(row);
            } else {
                matches.forEach(cat => {
                    if (!results[cat]) results[cat] = [];
                    results[cat].push(row);
                });
            }
        });

        return results;
    }, [initialData, hobiMapping, skillMapping, hobiCategories, skillCategories, contentType]);

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center p-12">
                <div className="bg-red-50 text-red-600 p-6 rounded-2xl border border-red-100 max-w-md text-center">
                    <h2 className="text-lg font-bold mb-2">Error Pengambilan Data</h2>
                    <p>{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="w-full flex flex-col lg:flex-row items-center justify-between gap-6 pb-2 border-b border-slate-200/60 dark:border-slate-800/60">
                    <div className="space-y-2">

                        <div className="flex items-center gap-3 px-1">
                            <div className="p-2 bg-indigo-600 rounded-xl text-white shadow-lg shadow-indigo-200 dark:shadow-none transition-transform hover:scale-110">
                                {mode === "config-only" ? <Settings2 className="w-6 h-6" /> : <ShieldCheck className="w-6 h-6" />}
                            </div>
                            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white tracking-tight font-syne">
                                {mode === "config-only" ? "Talent Configuration" : "Talent Analytics"}
                            </h1>
                        </div>

                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            Detail Analisis Terkait Hobi dan Skill Generus
                        </p>
                    </div>

                    <div className="flex gap-3 items-center">
                        <Button
                            asChild
                            variant="ghost"
                            className="rounded-xl px-4 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 transition-colors"
                        >
                            <Link href="/">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Kembali ke Dashboard
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Custom Tabs Navigation (Main) - Only show in full mode */}
                {mode === "full" && (
                    <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-2xl self-start md:self-center border border-slate-200/50 dark:border-slate-800/50 shadow-sm">
                        <button
                            onClick={() => setActiveTab("dashboard")}
                            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black tracking-widest transition-all ${activeTab === "dashboard"
                                ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm"
                                : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                                }`}
                        >
                            <LayoutDashboard className="w-4 h-4" />
                            DASHBOARD
                        </button>
                        <button
                            onClick={() => setActiveTab("config")}
                            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black tracking-widest transition-all ${activeTab === "config"
                                ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm"
                                : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                                }`}
                        >
                            <Settings2 className="w-4 h-4" />
                            CONFIG
                        </button>
                    </div>
                )}
            </div>

            {/* Sub-Tabs (Content Type) */}
            <div className="flex items-center gap-2 p-1.5 bg-slate-200/50 dark:bg-slate-900/50 rounded-2xl w-fit border border-slate-200/60 dark:border-slate-800/60">
                <button
                    onClick={() => setContentType("hobi")}
                    className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${contentType === "hobi"
                        ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-none"
                        : "text-slate-500 hover:bg-white/50 dark:hover:bg-white/5"
                        }`}
                >
                    🎨 HOBI
                </button>
                <button
                    onClick={() => setContentType("skill")}
                    className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${contentType === "skill"
                        ? "bg-emerald-600 text-white shadow-lg shadow-emerald-200 dark:shadow-none"
                        : "text-slate-500 hover:bg-white/50 dark:hover:bg-white/5"
                        }`}
                >
                    🚀 SKILL & CITA-CITA
                </button>
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={`${activeTab}-${contentType}`}
                    initial={{ opacity: 0, scale: 0.98, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.98, y: -10 }}
                    transition={{ duration: 0.3 }}
                >
                    {activeTab === "dashboard" ? (
                        <TalentDashboard
                            categorizedData={categorizedData}
                            activeContentType={contentType}
                        />
                    ) : (
                        <TalentConfigCard
                            hobiMapping={hobiMapping}
                            skillMapping={skillMapping}
                            hobiCategories={hobiCategories}
                            skillCategories={skillCategories}
                            initialHobiMapping={initialHobiMapping}
                            initialSkillMapping={initialSkillMapping}
                            initialHobiCategories={initialHobiCategories}
                            initialSkillCategories={initialSkillCategories}
                            setHobiMapping={setHobiMapping}
                            setSkillMapping={setSkillMapping}
                            setHobiCategories={setHobiCategories}
                            setSkillCategories={setSkillCategories}
                            activeContentType={contentType}
                        />
                    )}
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
