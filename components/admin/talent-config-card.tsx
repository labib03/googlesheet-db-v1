"use client";

import { useState } from "react";
import { CONFIG_KEYS } from "@/lib/constants";
import { saveGlobalConfig } from "@/app/actions";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Plus, Save, RotateCcw, Info, Settings, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";

interface TalentConfigCardProps {
    hobiMapping: Record<string, string[]>;
    skillMapping: Record<string, string[]>;
    hobiCategories: string[];
    skillCategories: string[];
    initialHobiMapping: Record<string, string[]>;
    initialSkillMapping: Record<string, string[]>;
    initialHobiCategories: string[];
    initialSkillCategories: string[];
    setHobiMapping: (val: Record<string, string[]>) => void;
    setSkillMapping: (val: Record<string, string[]>) => void;
    setHobiCategories: (val: string[]) => void;
    setSkillCategories: (val: string[]) => void;
    activeContentType: "hobi" | "skill";
}

export function TalentConfigCard({
    hobiMapping,
    skillMapping,
    hobiCategories,
    skillCategories,
    initialHobiMapping,
    initialSkillMapping,
    initialHobiCategories,
    initialSkillCategories,
    setHobiMapping,
    setSkillMapping,
    setHobiCategories,
    setSkillCategories,
    activeContentType: configTab, // rename to keep existing logic working with minimal changes
}: TalentConfigCardProps) {
    const [newCategory, setNewCategory] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);

    const handleSave = async () => {
        setIsSaving(true);
        const toastId = toast.loading("Menyimpan konfigurasi...");
        try {
            await Promise.all([
                saveGlobalConfig(CONFIG_KEYS.MAP_KATEGORI_HOBI, hobiMapping),
                saveGlobalConfig(CONFIG_KEYS.MAP_KATEGORI_SKILL, skillMapping),
                saveGlobalConfig(CONFIG_KEYS.LIST_KATEGORI_HOBI_ALL, hobiCategories),
                saveGlobalConfig(CONFIG_KEYS.LIST_KATEGORI_SKILL_ALL, skillCategories),
            ]);
            toast.success("Konfigurasi berhasil disimpan!", { id: toastId });
        } catch (error) {
            console.error(error);
            toast.error("Gagal menyimpan konfigurasi.", { id: toastId });
        } finally {
            setIsSaving(false);
        }
    };

    const addCategory = () => {
        const trimmed = newCategory.trim();
        if (!trimmed) return;

        const currentList = configTab === "hobi" ? hobiCategories : skillCategories;
        if (currentList.includes(trimmed)) {
            toast.warning(`Kategori "${trimmed}" sudah ada di list ini!`);
            return;
        }

        if (configTab === "hobi") {
            setHobiCategories([...hobiCategories, trimmed]);
        } else {
            setSkillCategories([...skillCategories, trimmed]);
        }
        setNewCategory("");
    };

    const removeCategory = (cat: string) => {
        if (cat === "Lainnya" || cat === "Keagamaan") {
            toast.error("Kategori sistem tidak bisa dihapus!");
            return;
        }
        setCategoryToDelete(cat);
    };

    const confirmDelete = () => {
        if (!categoryToDelete) return;
        const cat = categoryToDelete;

        if (configTab === "hobi") {
            setHobiCategories(hobiCategories.filter(c => c !== cat));
            const newHobi = { ...hobiMapping };
            delete newHobi[cat];
            setHobiMapping(newHobi);
        } else {
            setSkillCategories(skillCategories.filter(c => c !== cat));
            const newSkill = { ...skillMapping };
            delete newSkill[cat];
            setSkillMapping(newSkill);
        }

        setCategoryToDelete(null);
        toast.success(`Kategori "${cat}" berhasil dihapus.`);
    };

    const addKeyword = (category: string, keyword: string, type: 'hobi' | 'skill') => {
        const trimmed = keyword.trim().toLowerCase();
        if (!trimmed) return;

        if (type === 'hobi') {
            const current = hobiMapping[category] || [];
            if (!current.includes(trimmed)) {
                setHobiMapping({
                    ...hobiMapping,
                    [category]: [...current, trimmed]
                });
            }
        } else {
            const current = skillMapping[category] || [];
            if (!current.includes(trimmed)) {
                setSkillMapping({
                    ...skillMapping,
                    [category]: [...current, trimmed]
                });
            }
        }
    };

    const removeKeyword = (category: string, keyword: string, type: 'hobi' | 'skill') => {
        if (type === 'hobi') {
            setHobiMapping({
                ...hobiMapping,
                [category]: (hobiMapping[category] || []).filter(k => k !== keyword)
            });
        } else {
            setSkillMapping({
                ...skillMapping,
                [category]: (skillMapping[category] || []).filter(k => k !== keyword)
            });
        }
    };

    // Current active list
    const activeCategories = configTab === "hobi" ? hobiCategories : skillCategories;

    const hasHobiChanges = JSON.stringify(hobiMapping) !== JSON.stringify(initialHobiMapping) ||
        JSON.stringify(hobiCategories) !== JSON.stringify(initialHobiCategories);
    const hasSkillChanges = JSON.stringify(skillMapping) !== JSON.stringify(initialSkillMapping) ||
        JSON.stringify(skillCategories) !== JSON.stringify(initialSkillCategories);

    const hasAnyChanges = hasHobiChanges || hasSkillChanges;

    return (
        <div className="space-y-8 pb-20">
            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between sticky top-[63px] z-30 py-4 gap-4 bg-slate-50/80 dark:bg-slate-950/80 backdrop-blur-md -mx-4 px-4 border-b border-transparent sm:border-slate-200/20">
                <div className="flex flex-col">
                    <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                        <Settings className="w-5 h-5 text-indigo-600" strokeWidth={2.5} />
                        Konfigurasi {configTab.toUpperCase()}
                    </h2>
                    <p className="text-xs text-slate-500 font-medium">Sesuaikan mapping kata kunci untuk pengelompokan otomatis.</p>
                </div>

                <div className="grid grid-cols-2 sm:flex gap-2 w-full sm:w-auto">
                    <Button
                        variant="outline"
                        onClick={() => {
                            setHobiMapping(initialHobiMapping);
                            setSkillMapping(initialSkillMapping);
                            setHobiCategories(initialHobiCategories);
                            setSkillCategories(initialSkillCategories);
                        }}
                        disabled={isSaving || !hasAnyChanges}
                        className="rounded-2xl font-bold bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 disabled:opacity-50 h-11 text-xs"
                    >
                        <RotateCcw className="w-4 h-4 mr-2" />
                        RESET
                    </Button>
                    <Button
                        onClick={handleSave}
                        disabled={isSaving || !hasAnyChanges}
                        className={`rounded-2xl font-bold text-white shadow-lg dark:shadow-none sm:min-w-[160px] h-11 text-xs transition-all disabled:opacity-50 disabled:grayscale ${configTab === 'hobi' ? 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-200' : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-200'
                            }`}
                    >
                        {isSaving ? (
                            <>
                                <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                                SAVING...
                            </>
                        ) : (
                            <>
                                <Save className="w-4 h-4 mr-2" />
                                SAVE {configTab.toUpperCase()}
                            </>
                        )}
                    </Button>
                </div>
            </div>


            {/* Master Category Management */}
            <Card className={`rounded-[2.5rem] border-slate-200/60 dark:border-slate-800/60 border shadow-sm transition-colors duration-500 ${configTab === 'hobi' ? 'bg-indigo-50/30 dark:bg-indigo-950/10' : 'bg-emerald-50/30 dark:bg-emerald-950/10'
                }`}>
                <CardHeader className="p-5 sm:p-8 pb-4">
                    <CardTitle className={`text-xl font-bold font-syne flex items-center gap-3 ${configTab === 'hobi' ? 'text-indigo-900 dark:text-indigo-100' : 'text-emerald-900 dark:text-emerald-100'
                        }`}>
                        <Plus className={`w-6 h-6 p-1 text-white rounded-lg transition-colors ${configTab === 'hobi' ? 'bg-indigo-600' : 'bg-emerald-600'}`} />
                        Manajemen Master Kategori {configTab === 'hobi' ? 'Hobi' : 'Skill'}
                    </CardTitle>
                    <CardDescription className={configTab === 'hobi' ? 'text-indigo-700/60 dark:text-indigo-300/60' : 'text-emerald-700/60 dark:text-emerald-300/60'}>
                        Tambah atau hapus kelompok kategori utama untuk {configTab === 'hobi' ? 'hobi generus' : 'skill/keahlian generus'}.
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-5 sm:p-8 pt-2 space-y-6">
                    <div className="flex flex-wrap gap-2 min-h-[50px] p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-inner">
                        <AnimatePresence>
                            {/* Only show categories for current tab */}
                            {activeCategories.filter((cat: string) => cat !== "Lainnya").map((cat: string) => (
                                <motion.div
                                    key={cat}
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    exit={{ scale: 0.8, opacity: 0 }}
                                >
                                    <Badge
                                        className={`rounded-xl px-4 py-1.5 gap-2 text-sm font-bold shadow-sm transition-colors ${configTab === "hobi"
                                            ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800"
                                            : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
                                            }`}
                                    >
                                        {cat}
                                        <button
                                            onClick={() => removeCategory(cat)}
                                            className="hover:bg-black/5 dark:hover:bg-white/10 rounded-full p-0.5"
                                        >
                                            <X className="w-3.5 h-3.5" />
                                        </button>
                                    </Badge>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 max-w-md">
                        <Input
                            placeholder={`Nama kategori ${configTab} baru...`}
                            value={newCategory}
                            onChange={(e) => setNewCategory(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && addCategory()}
                            className={cn(
                                "rounded-2xl border-slate-200 dark:border-slate-800 h-12 bg-white dark:bg-slate-900 px-6 focus:ring-1 focus-visible:ring-1 w-full placeholder:tracking-wider focus:tracking-wider",
                                configTab === "hobi"
                                    ? "focus:ring-indigo-600 focus-visible:ring-indigo-600"
                                    : "focus:ring-emerald-600 focus-visible:ring-emerald-600"
                            )}
                        />
                        <Button
                            onClick={addCategory}
                            className={`h-12 px-8 rounded-2xl text-white font-bold shadow-lg dark:shadow-none transition-all w-full sm:w-auto ${configTab === 'hobi' ? 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200' : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200'
                                }`}
                        >
                            TAMBAH
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Keyword Mapping List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence mode="popLayout">
                    {activeCategories.filter((cat: string) => cat !== "Lainnya").map((cat: string) => (
                        <motion.div
                            key={`${configTab}-${cat}`}
                            layout
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                        >
                            <CategoryKeywordsInput
                                category={cat}
                                keywords={(configTab === "hobi" ? hobiMapping[cat] : skillMapping[cat]) || []}
                                onAdd={(kw) => addKeyword(cat, kw, configTab)}
                                onRemove={(kw) => removeKeyword(cat, kw, configTab)}
                                color={configTab === "hobi" ? "indigo" : "emerald"}
                            />
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={!!categoryToDelete} onOpenChange={(open) => !open && setCategoryToDelete(null)}>
                <AlertDialogContent className="rounded-[2.5rem] border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-8 shadow-2xl">
                    <AlertDialogHeader className="space-y-4">
                        <div className="mx-auto p-4 bg-red-50 dark:bg-red-950/30 rounded-full w-fit">
                            <AlertTriangle className="w-8 h-8 text-red-600 animate-pulse" />
                        </div>
                        <AlertDialogTitle className="text-2xl font-black font-syne text-center">Hapus Kategori?</AlertDialogTitle>
                        <AlertDialogDescription className="text-center text-slate-500 dark:text-slate-400 font-medium pb-2">
                            Apakah Anda yakin ingin menghapus kategori <span className="font-bold text-slate-900 dark:text-white">"{categoryToDelete}"</span>?
                            <br />
                            Semua mapping kata kunci untuk kategori ini di tab <span className="font-bold text-indigo-600">{configTab.toUpperCase()}</span> akan terhapus secara permanen.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="flex-col sm:flex-row gap-3 pt-4">
                        <AlertDialogCancel className="rounded-2xl border-slate-200 dark:border-slate-800 font-bold h-12 m-0 flex-1">
                            BATALKAN
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmDelete}
                            className="rounded-2xl bg-red-600 hover:bg-red-700 text-white font-bold h-12 m-0 flex-1 shadow-lg shadow-red-200 dark:shadow-none transition-all"
                        >
                            YA, HAPUS SEKARANG
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

function CategoryKeywordsInput({
    category,
    keywords,
    onAdd,
    onRemove,
    color = "indigo"
}: {
    category: string;
    keywords: string[];
    onAdd: (kw: string) => void;
    onRemove: (kw: string) => void;
    color?: "indigo" | "emerald";
}) {
    const [inputValue, setInputValue] = useState("");

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            onAdd(inputValue);
            setInputValue("");
        }
    };

    return (
        <Card className="rounded-3xl border-slate-200/60 dark:border-slate-800/60 bg-white dark:bg-slate-900 shadow-sm overflow-hidden group hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
            <CardHeader className="p-5 pb-2 bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                <CardTitle className="text-sm font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
                    Kategori: <span className={color === 'indigo' ? 'text-indigo-600 dark:text-indigo-400' : 'text-emerald-600 dark:text-emerald-400'}>{category}</span>
                </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
                {/* Tags Display */}
                <div className="flex flex-wrap gap-2 min-h-[40px] p-2 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-dashed border-slate-200 dark:border-slate-800">
                    <AnimatePresence>
                        {keywords.length > 0 ? (
                            keywords.map((kw) => (
                                <motion.div
                                    key={kw}
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    exit={{ scale: 0.8, opacity: 0 }}
                                >
                                    <Badge
                                        variant="secondary"
                                        className={cn(
                                            "rounded-lg px-3 py-1 gap-1 text-sm font-bold transition-all tracking-wider",
                                            color === 'indigo'
                                                ? "bg-indigo-50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300 border-indigo-100 dark:border-indigo-900"
                                                : "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 border-emerald-100 dark:border-emerald-900"
                                        )}
                                    >
                                        {kw}
                                        <button
                                            onClick={() => onRemove(kw)}
                                            className="hover:bg-slate-200 dark:hover:bg-white/10 rounded-full p-0.5 transition-colors"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </Badge>
                                </motion.div>
                            ))
                        ) : (
                            <p className="text-xs text-slate-400 p-1">Belum ada keyword...</p>
                        )}
                    </AnimatePresence>
                </div>

                {/* Input */}
                <div className="relative group">
                    <Input
                        placeholder="Ketik keyword lalu tekan Enter..."
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className={cn(
                            "rounded-xl bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 h-10 text-sm focus:ring-1 focus-visible:ring-1 placeholder:tracking-wider focus:tracking-wider",
                            color === "indigo"
                                ? "focus:ring-indigo-600 focus-visible:ring-indigo-600"
                                : "focus:ring-emerald-600 focus-visible:ring-emerald-600"
                        )}
                    />
                    <Plus className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-slate-500 transition-colors" />
                </div>
            </CardContent>
        </Card>
    );
}
