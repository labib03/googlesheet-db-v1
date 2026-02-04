import { SheetRow } from "@/lib/google-sheets";
import { COLUMNS } from "@/lib/constants";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Search, LayoutGrid } from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { DashboardPagination } from "@/components/dashboard/dashboard-pagination";

interface TalentDashboardProps {
    categorizedData: Record<string, SheetRow[]>;
    activeContentType: "hobi" | "skill";
}

export function TalentDashboard({ categorizedData, activeContentType }: TalentDashboardProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    const categories = Object.keys(categorizedData).sort((a, b) => {
        if (a === "Lainnya") return 1;
        if (b === "Lainnya") return -1;
        return (categorizedData[b]?.length || 0) - (categorizedData[a]?.length || 0);
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

    // Pagination logic
    const totalPages = Math.ceil(filteredList.length / pageSize);
    const paginatedList = useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        return filteredList.slice(start, start + pageSize);
    }, [filteredList, currentPage, pageSize]);

    // Reset to page 1 when category or search changes
    useEffect(() => {
        setCurrentPage(1);
    }, [selectedCategory, searchQuery]);

    return (
        <div className="space-y-8 pb-10">
            {/* Stats Summary Section */}
            <div className="space-y-4">
                <div className="flex items-center gap-2 px-1">
                    <LayoutGrid className={`w-5 h-5 ${activeContentType === 'hobi' ? 'text-indigo-600' : 'text-emerald-600'}`} />
                    <h2 className="text-sm font-black uppercase tracking-widest text-slate-500">Ringkasan Kategori</h2>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {categories.map((cat) => (
                        <motion.div
                            key={cat}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setSelectedCategory(cat === selectedCategory ? null : cat)}
                            className={`cursor-pointer p-4 rounded-4xl border-2 transition-all duration-300 relative overflow-hidden group ${selectedCategory === cat
                                ? (activeContentType === 'hobi'
                                    ? "bg-indigo-600 border-indigo-500 text-white shadow-xl shadow-indigo-200 dark:shadow-none"
                                    : "bg-emerald-600 border-emerald-500 text-white shadow-xl shadow-emerald-200 dark:shadow-none")
                                : (activeContentType === 'hobi'
                                    ? "bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-900 dark:text-white hover:border-indigo-200 dark:hover:border-indigo-800"
                                    : "bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-900 dark:text-white hover:border-emerald-200 dark:hover:border-emerald-800")
                                }`}
                        >
                            {selectedCategory === cat && (
                                <motion.div
                                    layoutId="active-bg"
                                    className={`absolute inset-0 bg-linear-to-br opacity-50 ${activeContentType === 'hobi' ? 'from-indigo-500 to-indigo-700' : 'from-emerald-500 to-emerald-700'}`}
                                />
                            )}
                            <div className="relative z-10 flex flex-col gap-1">
                                <span className={`text-[10px] font-black uppercase tracking-widest ${selectedCategory === cat
                                    ? (activeContentType === 'hobi' ? "text-indigo-100" : "text-emerald-100")
                                    : (activeContentType === 'hobi' ? "text-slate-400 group-hover:text-indigo-400" : "text-slate-400 group-hover:text-emerald-400")}`}>
                                    {cat === "Lainnya" ? "Sistem" : "Kategori"}
                                </span>
                                <div className="flex items-center justify-between">
                                    <h3 className="font-bold text-base leading-tight truncate mr-2">{cat}</h3>
                                    <span className={`text-xl font-black ${selectedCategory === cat
                                        ? "text-white"
                                        : (activeContentType === 'hobi' ? "text-indigo-600" : "text-emerald-600")}`}>
                                        {categorizedData[cat]?.length || 0}
                                    </span>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Detail List */}
            <div className="scroll-mt-24">
                <Card className="rounded-[2.5rem] border-slate-200/60 dark:border-slate-800/60 bg-white/50 dark:bg-slate-950/50 backdrop-blur-xl shadow-2xl shadow-slate-100 dark:shadow-none overflow-hidden border">
                    <CardHeader className="p-6 md:p-8 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="space-y-1">
                            <CardTitle className="text-2xl font-black font-syne flex items-center gap-3 tracking-tighter">
                                <Users className={`w-7 h-7 ${activeContentType === 'hobi' ? 'text-indigo-600' : 'text-emerald-600'}`} />
                                {selectedCategory ? `Daftar: ${selectedCategory}` : "Detail Generus"}
                            </CardTitle>
                            <CardDescription className="text-slate-500 dark:text-slate-400 font-medium">
                                {selectedCategory
                                    ? `Ditemukan ${filteredList.length} orang dalam rumpun ini.`
                                    : "Klik salah satu card kategori di atas untuk memfilter data."}
                            </CardDescription>
                        </div>
                        {selectedCategory && (
                            <div className="relative w-full md:w-80 group">
                                <Search className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 transition-colors ${activeContentType === 'hobi' ? 'group-focus-within:text-indigo-600' : 'group-focus-within:text-emerald-600'}`} />
                                <Input
                                    placeholder="Cari nama, hobi, atau skill..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className={`pl-12 h-12 rounded-2xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 transition-all shadow-sm focus:ring-2 ${activeContentType === 'hobi' ? 'focus:ring-indigo-600/20' : 'focus:ring-emerald-600/20'}`}
                                />
                            </div>
                        )}
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-separate border-spacing-0">
                                <thead className="sticky top-0 z-10">
                                    <tr className="bg-slate-50/80 dark:bg-slate-900/80 backdrop-blur-md border-y border-slate-100 dark:border-slate-800">
                                        <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100 dark:border-slate-800">Nama Lengkap</th>
                                        <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100 dark:border-slate-800">Wilayah</th>
                                        <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100 dark:border-slate-800">Hobi</th>
                                        <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100 dark:border-slate-800">Skill / Cita-cita</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                                    {selectedCategory ? (
                                        paginatedList.length > 0 ? (
                                            paginatedList.map((row, idx) => (
                                                <motion.tr
                                                    key={`${selectedCategory}-${idx}`}
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    exit={{ opacity: 0 }}
                                                    transition={{ duration: 0.2, delay: idx * 0.05 }}
                                                    className={`transition-colors group ${activeContentType === 'hobi' ? 'hover:bg-indigo-50/50 dark:hover:bg-indigo-950/20' : 'hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20'}`}
                                                >
                                                    <td className="px-8 py-5">
                                                        <div className="flex flex-col">
                                                            <span className={`font-bold text-slate-900 dark:text-white transition-colors ${activeContentType === 'hobi' ? 'group-hover:text-indigo-600 dark:group-hover:text-indigo-400' : 'group-hover:text-emerald-600 dark:group-hover:text-emerald-400'}`}>
                                                                {String(row[COLUMNS.NAMA] || "-")}
                                                            </span>
                                                            <span className="text-[10px] font-medium text-slate-400 md:hidden">
                                                                {String(row[COLUMNS.DESA] || "-")} • {String(row[COLUMNS.KELOMPOK] || "-")}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-5 hidden md:table-cell">
                                                        <div className="flex flex-col">
                                                            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">{String(row[COLUMNS.DESA] || "-")}</span>
                                                            <span className="text-[10px] font-medium text-slate-400">{String(row[COLUMNS.KELOMPOK] || "-")}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-5">
                                                        <p className="text-xs text-slate-600 dark:text-slate-300 max-w-xs line-clamp-2">{String(row[COLUMNS.HOBI] || "-")}</p>
                                                    </td>
                                                    <td className="px-8 py-5">
                                                        <p className="text-xs text-slate-600 dark:text-slate-300 max-w-xs line-clamp-2">{String(row[COLUMNS.SKILL] || "-")}</p>
                                                    </td>
                                                </motion.tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={4} className="px-8 py-24 text-center">
                                                    <p className="text-slate-500 font-medium">Tidak ada data yang cocok dengan pencarian.</p>
                                                </td>
                                            </tr>
                                        )
                                    ) : (
                                        <tr>
                                            <td colSpan={4} className="px-8 py-32 text-center">
                                                <div className="flex flex-col items-center gap-6">
                                                    <div className="p-6 bg-slate-50 dark:bg-slate-900 rounded-4xl border-2 border-dashed border-slate-200 dark:border-slate-800">
                                                        <Users className="w-16 h-16 text-slate-300 dark:text-slate-700" />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <h4 className="text-lg font-bold text-slate-900 dark:text-white">Pilih Kategori</h4>
                                                        <p className="text-slate-400 font-medium max-w-xs mx-auto text-sm">
                                                            Silakan pilih rumpun kategori di atas untuk memetakan data personil yang sesuai.
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {selectedCategory && totalPages > 1 && (
                            <div className="px-8 border-t border-slate-100 dark:border-slate-800">
                                <DashboardPagination
                                    currentPage={currentPage}
                                    totalPages={totalPages}
                                    pageSize={pageSize}
                                    onPageChange={setCurrentPage}
                                    onPageSizeChange={(size) => {
                                        setPageSize(size);
                                        setCurrentPage(1);
                                    }}
                                />
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
