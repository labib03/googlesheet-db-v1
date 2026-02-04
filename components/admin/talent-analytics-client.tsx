"use client";

import { useState, useMemo } from "react";
import { SheetRow } from "@/lib/google-sheets";
import { COLUMNS, CONFIG_KEYS } from "@/lib/constants";
import { categorizeByKeywords } from "@/lib/helper";
import { ShieldCheck, LayoutDashboard, Settings2, ArrowLeft, Sparkles, Plus, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { TalentDashboard } from "@/components/admin/talent-dashboard";
import { TalentConfigCard } from "@/components/admin/talent-config-card";
import { getTopTerms } from "@/lib/helper";
import { toast } from "sonner";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

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
    const [isDiscoveryMode, setIsDiscoveryMode] = useState(false);

    // Unified State for Talent Configuration
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

    // Discovery logic: find frequent terms in the "Lainnya" category
    const topDiscoveryTerms = useMemo(() => {
        const otherData = categorizedData["Lainnya"] || [];
        const texts = otherData.map(row => String(row[contentType === "hobi" ? COLUMNS.HOBI : COLUMNS.SKILL] || ""));
        return getTopTerms(texts, 30);
    }, [categorizedData, contentType]);

    const handleQuickAdd = (term: string, category: string) => {
        const isHobi = contentType === "hobi";
        const currentMapping = isHobi ? { ...hobiMapping } : { ...skillMapping };
        const setter = isHobi ? setHobiMapping : setSkillMapping;

        // Add term to selected category
        const existingKeywords = currentMapping[category] || [];
        if (existingKeywords.includes(term)) {
            toast.error(`Keyword '${term}' sudah ada di kategori ${category}`);
            return;
        }

        const newMapping = {
            ...currentMapping,
            [category]: [...existingKeywords, term]
        };

        setter(newMapping);
        toast.success(`Keyword '${term}' berhasil ditambahkan ke ${category}. Jangan lupa menekan tombol SAVE di CONFIG.`);
    };

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

            {/* Discovery Section & Sub-Tabs */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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

                {mode !== "dashboard-only" && (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsDiscoveryMode(!isDiscoveryMode)}
                        className={`rounded-xl border-2 font-bold text-[10px] tracking-widest transition-all h-11 px-6 ${isDiscoveryMode
                            ? (contentType === 'hobi' ? 'bg-indigo-600 text-white border-indigo-500' : 'bg-emerald-600 text-white border-emerald-500')
                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500'
                            }`}
                    >
                        <Sparkles className={`w-3 h-3 mr-2 ${isDiscoveryMode ? 'animate-pulse' : ''}`} />
                        SMART DISCOVERY
                    </Button>
                )}
            </div>

            {mode !== "dashboard-only" && (
                <AnimatePresence mode="sync">
                    {isDiscoveryMode && (
                        <motion.div
                            initial={{ height: 0, opacity: 0, filter: "blur(10px)" }}
                            animate={{
                                height: "200px",
                                opacity: 1,
                                filter: "blur(0px)",
                                transition: {
                                    height: {
                                        duration: 0.4,
                                        ease: [0.4, 0, 0.2, 1]
                                    },
                                    opacity: { duration: 0.3 },
                                    filter: { duration: 0.3 }
                                }
                            }}
                            exit={{
                                height: 0,
                                opacity: 0,
                                filter: "blur(10px)",
                                transition: {
                                    height: { duration: 0.3 },
                                    opacity: { duration: 0.2 },
                                    filter: { duration: 0.2 }
                                }
                            }}
                            className="bg-slate-100/50 dark:bg-slate-900/50 backdrop-blur-sm border border-slate-200/50 dark:border-slate-800/50 rounded-3xl p-6 overflow-hidden relative"
                        >
                            <div className="flex flex-col gap-4">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div className="flex flex-col gap-1">
                                        <h3 className="text-xs font-black uppercase tracking-widest text-slate-700 dark:text-slate-300">Potential Keywords Found</h3>
                                        <p className="text-[10px] text-slate-500 font-medium">Banyak data di kategori 'Lainnya' mengandung kata-kata di bawah ini. Klik kata untuk memasukkannya ke kategori yang sesuai.</p>
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                            const text = Object.entries(topDiscoveryTerms)
                                                .map(([term, count]) => `- ${term} (${count}x)`)
                                                .join("\n");
                                            const promptHeader = `Berikut adalah daftar kata kunci yang sering muncul di hobi/skill personil namun belum terpetakan ke kategori mana pun:\n\n${text}\n\nBisakah Anda merekomendasikan nama kategori baru yang cocok untuk kelompok kata kunci di atas?`;
                                            navigator.clipboard.writeText(promptHeader);
                                            toast.success("Prompt Discovery disalin ke clipboard!");
                                        }}
                                        className="rounded-xl border-dashed border-slate-300 dark:border-slate-700 h-9 px-4 text-[10px] font-bold text-slate-500 hover:text-indigo-600 transition-all bg-white dark:bg-slate-900"
                                    >
                                        <Plus className="w-3 h-3 mr-2 rotate-45" />
                                        COPY DISCOVERY
                                    </Button>
                                </div>
                                <motion.div
                                    layout
                                    className="flex flex-wrap gap-2"
                                >
                                    <AnimatePresence mode="popLayout">
                                        {Object.entries(topDiscoveryTerms).length > 0 ? (
                                            Object.entries(topDiscoveryTerms).map(([term, count], index) => (
                                                <motion.div
                                                    key={term}
                                                    layout
                                                    initial={{ opacity: 0, scale: 0.8, y: 10 }}
                                                    animate={{
                                                        opacity: 1,
                                                        scale: 1,
                                                        y: 0,
                                                        transition: { delay: index * 0.03 }
                                                    }}
                                                    exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
                                                >
                                                    <Popover>
                                                        <PopoverTrigger asChild>
                                                            <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:border-indigo-400 dark:hover:border-indigo-600 hover:shadow-lg hover:shadow-indigo-100 dark:hover:shadow-none transition-all group">
                                                                <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{term}</span>
                                                                <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black ${contentType === 'hobi' ? 'bg-indigo-50 text-indigo-600' : 'bg-emerald-50 text-emerald-600'}`}>
                                                                    {count}x
                                                                </span>
                                                                <Plus className="w-3 h-3 text-slate-400 group-hover:text-indigo-600 transition-colors" />
                                                            </button>
                                                        </PopoverTrigger>
                                                        <PopoverContent className="w-64 p-2 rounded-2xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-2xl" align="start">
                                                            <div className="flex flex-col gap-1">
                                                                <p className="px-3 py-2 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100 dark:border-slate-800">Assign to Category</p>
                                                                <div className="max-h-48 overflow-y-auto custom-scrollbar pt-1">
                                                                    {(contentType === "hobi" ? hobiCategories : skillCategories).map(cat => (
                                                                        <button
                                                                            key={cat}
                                                                            onClick={() => handleQuickAdd(term, cat)}
                                                                            className="w-full text-left px-3 py-2 text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg flex items-center justify-between group transition-colors"
                                                                        >
                                                                            {cat}
                                                                            <Check className="w-3 h-3 opacity-0 group-hover:opacity-100 text-emerald-600" />
                                                                        </button>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        </PopoverContent>
                                                    </Popover>
                                                </motion.div>
                                            ))
                                        ) : (
                                            <motion.p
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                className="text-xs font-bold text-slate-400 italic"
                                            >
                                                No significant terms found in 'Lainnya'.
                                            </motion.p>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            )}

            <AnimatePresence mode="sync">
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
