"use client";

import { SheetRow } from "@/lib/google-sheets";
import { COLUMNS } from "@/lib/constants";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Search } from "lucide-react";
import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";

interface TalentDashboardProps {
    categorizedData: Record<string, SheetRow[]>;
}

export function TalentDashboard({ categorizedData }: TalentDashboardProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

    const categories = Object.keys(categorizedData).sort((a, b) => {
        if (a === "Lainnya") return 1;
        if (b === "Lainnya") return -1;
        return b.length - a.length;
    });

    const filteredList = useMemo(() => {
        if (!selectedCategory) return [];
        const data = categorizedData[selectedCategory] || [];
        if (!searchQuery) return data;

        return data.filter(row => {
            const name = String(row[COLUMNS.NAMA] || "").toLowerCase();
            const hobi = String(row[COLUMNS.HOBI] || "").toLowerCase();
            const skill = String(row[COLUMNS.SKILL] || "").toLowerCase();
            const search = searchQuery.toLowerCase();

            return name.includes(search) || hobi.includes(search) || skill.includes(search);
        });
    }, [selectedCategory, categorizedData, searchQuery]);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Stats Table / Summary Grid */}
            <div className="lg:col-span-12 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {categories.map((cat) => (
                    <motion.div
                        key={cat}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setSelectedCategory(cat === selectedCategory ? null : cat)}
                        className={`cursor-pointer p-4 rounded-3xl border transition-all ${selectedCategory === cat
                            ? "bg-indigo-600 border-indigo-600 dark:bg-indigo-500 dark:border-indigo-500 text-white shadow-lg shadow-indigo-200 dark:shadow-none"
                            : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white hover:border-indigo-300 dark:hover:border-indigo-700"
                            }`}
                    >
                        <div className="flex flex-col gap-1">
                            <span className={`text-[10px] font-black uppercase tracking-widest ${selectedCategory === cat ? "text-indigo-100" : "text-slate-400"}`}>
                                KATEGORI
                            </span>
                            <div className="flex items-center justify-between">
                                <h3 className="font-bold text-lg leading-tight truncate mr-2">{cat}</h3>
                                <span className={`text-2xl font-black ${selectedCategory === cat ? "text-white" : "text-indigo-600"}`}>
                                    {categorizedData[cat]?.length || 0}
                                </span>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Detail List */}
            <div className="lg:col-span-12">
                <Card className="rounded-[2.5rem] border-slate-200/60 dark:border-slate-800/60 bg-white/50 dark:bg-slate-950/50 backdrop-blur-xl shadow-2xl shadow-slate-100 dark:shadow-none overflow-hidden border">
                    <CardHeader className="p-8 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <CardTitle className="text-2xl font-bold font-syne flex items-center gap-3">
                                <Users className="w-6 h-6 text-indigo-600" />
                                {selectedCategory ? `Daftar Generus: ${selectedCategory}` : "Pilih Kategori untuk Melihat Detail"}
                            </CardTitle>
                            <CardDescription className="text-slate-500 dark:text-slate-400 font-medium">
                                {selectedCategory
                                    ? `Ditemukan ${filteredList.length} orang dalam rumpun ini.`
                                    : "Klik salah satu card kategori di atas untuk memfilter data."}
                            </CardDescription>
                        </div>
                        {selectedCategory && (
                            <div className="relative w-full md:w-72 group">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                                <Input
                                    placeholder="Cari nama, hobi, atau skill..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-12 h-12 rounded-2xl bg-white/80 dark:bg-slate-900/80 border-slate-200 dark:border-slate-800 focus:ring-indigo-600 transition-all shadow-sm"
                                />
                            </div>
                        )}
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50/50 dark:bg-slate-900/50 border-y border-slate-100 dark:border-slate-800">
                                        <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Nama Lengkap</th>
                                        <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Desa / Kelompok</th>
                                        <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Hobi</th>
                                        <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Skill / Cita-cita</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                                    {selectedCategory ? (
                                        filteredList.length > 0 ? (
                                            filteredList.map((row, idx) => (
                                                <tr key={idx} className="hover:bg-indigo-50/30 dark:hover:bg-indigo-950/10 transition-colors group">
                                                    <td className="px-8 py-5">
                                                        <span className="font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                                            {String(row[COLUMNS.NAMA] || "-")}
                                                        </span>
                                                    </td>
                                                    <td className="px-8 py-5">
                                                        <div className="flex flex-col">
                                                            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">{String(row[COLUMNS.DESA] || "-")}</span>
                                                            <span className="text-[10px] font-medium text-slate-400">{String(row[COLUMNS.KELOMPOK] || "-")}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-5">
                                                        <p className="text-xs text-slate-600 dark:text-slate-300 max-w-xs">{String(row[COLUMNS.HOBI] || "-")}</p>
                                                    </td>
                                                    <td className="px-8 py-5">
                                                        <p className="text-xs text-slate-600 dark:text-slate-300 max-w-xs">{String(row[COLUMNS.SKILL] || "-")}</p>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={4} className="px-8 py-20 text-center">
                                                    <p className="text-slate-500 font-medium">Tidak ada data yang cocok dengan pencarian.</p>
                                                </td>
                                            </tr>
                                        )
                                    ) : (
                                        <tr>
                                            <td colSpan={4} className="px-8 py-32 text-center">
                                                <div className="flex flex-col items-center gap-4">
                                                    <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-full">
                                                        <Users className="w-12 h-12 text-slate-300 dark:text-slate-700" />
                                                    </div>
                                                    <p className="text-slate-400 font-medium max-w-xs mx-auto">
                                                        Silakan pilih rumpun kategori di atas untuk melihat siapa saja generus yang memilikinya.
                                                    </p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
