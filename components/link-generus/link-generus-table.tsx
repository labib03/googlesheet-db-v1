import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SheetRow } from "@/lib/google-sheets";
import { AlertCircle, CheckCircle2, Filter, Link2, Loader2, MapPin, Wand2, UserX } from "lucide-react";

interface LinkGenerusTableProps {
    filteredData: SheetRow[];
    unlinkedGenerus: SheetRow[];
    linkedRows: Set<number>;
    linkedGenerusIndices: Set<number>;
    filterMode: "unlinked" | "linked" | "all";
    linkingRow: number | null;
    isPending: boolean;
    handleOpenPicker: (idx: number) => void;
    handleRowAutoMatch: (idx: number) => void;
}

export function LinkGenerusTable({
    filteredData,
    unlinkedGenerus,
    linkedRows,
    linkedGenerusIndices,
    filterMode,
    linkingRow,
    isPending,
    handleOpenPicker,
    handleRowAutoMatch
}: LinkGenerusTableProps) {
    if (filteredData.length === 0) {
        return (
            <Card className="border-none shadow-sm bg-white dark:bg-slate-900 overflow-hidden ring-1 ring-slate-200 dark:ring-slate-800">
                <CardContent className="p-0">
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                        <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-full mb-4">
                            <Filter className="h-8 w-8 text-slate-400" />
                        </div>
                        <p className="text-lg font-medium text-slate-900 dark:text-white">
                            Tidak ada data
                        </p>
                        <p className="text-sm text-slate-500 mt-1">
                            {filterMode === "unlinked"
                                ? "Semua data sudah terhubung!"
                                : "Tidak ada data yang sesuai filter"}
                        </p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="border-none shadow-sm bg-white dark:bg-slate-900 overflow-hidden ring-1 ring-slate-200 dark:ring-slate-800">
            <CardContent className="p-0">
                {/* Desktop Table View */}
                <div className="overflow-x-auto hidden sm:block">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50">
                                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">
                                    Nama Lengkap
                                </th>
                                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">
                                    Nama Panggilan
                                </th>
                                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3 hidden sm:table-cell">
                                    Kelompok
                                </th>
                                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3 hidden md:table-cell">
                                    Jenis Kelamin
                                </th>
                                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3 hidden lg:table-cell">
                                    Usia
                                </th>
                                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">
                                    Status
                                </th>
                                <th className="text-right text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">
                                    Aksi
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredData.map((row) => {
                                const idx = row._index as number;
                                const isLinked =
                                    !!String(row["UserId"] || "").trim() ||
                                    linkedRows.has(idx);
                                const isLinking = linkingRow === idx;

                                const aiName = String(row["Nama Lengkap"] || "").trim().toLowerCase();
                                const hasAutoMatch = aiName && unlinkedGenerus.some(g =>
                                    !linkedGenerusIndices.has(g._index as number) &&
                                    String(g["NAMA LENGKAP"] || "").trim().toLowerCase() === aiName
                                );

                                return (
                                    <tr
                                        key={idx}
                                        className="border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors animate-in fade-in duration-300"
                                    >
                                        <td className="px-4 py-3">
                                            <span className="font-medium text-slate-900 dark:text-white text-sm">
                                                {String(row["Nama Lengkap"] || "-")}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="text-sm text-slate-600 dark:text-slate-400">
                                                {String(row["Nama Panggilan"] || "-")}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 hidden sm:table-cell">
                                            <span className="text-sm text-slate-600 dark:text-slate-400">
                                                {String(row["Kelompok"] || "-")}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 hidden md:table-cell">
                                            <span className="text-sm text-slate-600 dark:text-slate-400">
                                                {String(row["Jenis Kelamin"] || "-")}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 hidden lg:table-cell">
                                            <span className="text-sm text-slate-600 dark:text-slate-400">
                                                {String(row["Usia"] || "-")}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            {isLinked ? (
                                                <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded-full">
                                                    <CheckCircle2 className="h-3 w-3" />
                                                    Terhubung
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-2 py-1 rounded-full">
                                                    <UserX className="h-3 w-3" />
                                                    Belum
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            {!isLinked && (
                                                <div className="flex items-center justify-end gap-2">
                                                    {hasAutoMatch && (
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            onClick={() => handleRowAutoMatch(idx)}
                                                            disabled={isPending}
                                                            className="h-8 w-8 p-0 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 animate-in zoom-in duration-300"
                                                            title="Auto Match Baris Ini"
                                                        >
                                                            <Wand2 className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                    <Button
                                                        size="sm"
                                                        onClick={() => handleOpenPicker(idx)}
                                                        disabled={isPending}
                                                        className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs h-8 rounded-lg"
                                                    >
                                                        {isLinking ? (
                                                            <Loader2 className="h-3 w-3 animate-spin" />
                                                        ) : (
                                                            <div className="flex items-center gap-1.5 px-1">
                                                                <Link2 className="h-3 w-3" />
                                                                <span>Link</span>
                                                            </div>
                                                        )}
                                                    </Button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Mobile Grid View */}
                <div className="sm:hidden divide-y divide-slate-100 dark:divide-slate-800">
                    {filteredData.map((row) => {
                        const idx = row._index as number;
                        const isLinked =
                            !!String(row["UserId"] || "").trim() ||
                            linkedRows.has(idx);
                        const isLinking = linkingRow === idx;

                        const aiName = String(row["Nama Lengkap"] || "").trim().toLowerCase();
                        const hasAutoMatch = aiName && unlinkedGenerus.some(g =>
                            !linkedGenerusIndices.has(g._index as number) &&
                            String(g["NAMA LENGKAP"] || "").trim().toLowerCase() === aiName
                        );

                        return (
                            <div key={idx} className="p-4 space-y-4 animate-in fade-in duration-300">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="space-y-1 min-w-0">
                                        <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                                            {String(row["Nama Lengkap"] || "-")}
                                        </h3>
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className="text-[11px] text-slate-500 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                                                {String(row["Nama Panggilan"] || "-")}
                                            </span>
                                            <span className="text-[11px] text-slate-500 flex items-center gap-1">
                                                <MapPin className="h-3 w-3" />
                                                {String(row["Kelompok"] || "-")}
                                            </span>
                                        </div>
                                    </div>
                                    {isLinked ? (
                                        <span className="shrink-0 inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded-full uppercase tracking-tight">
                                            <CheckCircle2 className="h-3 w-3" />
                                            Linked
                                        </span>
                                    ) : (
                                        <span className="shrink-0 inline-flex items-center gap-1 text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-2 py-1 rounded-full uppercase tracking-tight">
                                            <AlertCircle className="h-3 w-3" />
                                            Unlinked
                                        </span>
                                    )}
                                </div>

                                <div className="grid grid-cols-2 gap-2 text-[11px]">
                                    <div className="p-2 bg-slate-50 dark:bg-slate-950 rounded-lg">
                                        <p className="text-slate-400 font-bold uppercase text-[9px]">Gender</p>
                                        <p className="text-slate-700 dark:text-slate-300 font-medium">{String(row["Jenis Kelamin"] || "-")}</p>
                                    </div>
                                    <div className="p-2 bg-slate-50 dark:bg-slate-950 rounded-lg">
                                        <p className="text-slate-400 font-bold uppercase text-[9px]">Usia</p>
                                        <p className="text-slate-700 dark:text-slate-300 font-medium">{String(row["Usia"] || "-")} th</p>
                                    </div>
                                </div>

                                {!isLinked && (
                                    <div className="flex gap-2 pt-1">
                                        <Button
                                            onClick={() => handleOpenPicker(idx)}
                                            disabled={isPending}
                                            variant="default"
                                            className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white h-9 text-xs rounded-xl shadow-sm"
                                        >
                                            {isLinking ? (
                                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                            ) : (
                                                <>
                                                    <Link2 className="h-3.5 w-3.5 mr-2" />
                                                    Link Generus
                                                </>
                                            )}
                                        </Button>
                                        {hasAutoMatch && (
                                            <Button
                                                onClick={() => handleRowAutoMatch(idx)}
                                                disabled={isPending}
                                                variant="outline"
                                                className="w-12 h-9 border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 rounded-xl"
                                            >
                                                <Wand2 className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
}
