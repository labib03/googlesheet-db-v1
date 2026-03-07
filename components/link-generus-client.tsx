"use client";

import { useState, useMemo, useTransition } from "react";
import { SheetRow } from "@/lib/google-sheets";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogCancel,
    AlertDialogAction,
} from "@/components/ui/alert-dialog";
import {
    Link2,
    Search,
    CheckCircle2,
    Loader2,
    Filter,
    Users,
    UserCheck,
    UserX,
    ArrowLeft,
    Wand2,
    ArrowRightCircle,
    Copy,
    AlertCircle,
    MapPin
} from "lucide-react";
import { linkGenerusAction } from "@/app/actions";
import { toast } from "sonner";
import { GenerusPickerDialog } from "./generus-picker-dialog";
import Link from "next/link";

interface LinkGenerusClientProps {
    additionalInfoData: SheetRow[];
    unlinkedGenerus: SheetRow[];
    error: string | null;
}



type FilterMode = "unlinked" | "linked" | "all";

export function LinkGenerusClient({
    additionalInfoData,
    unlinkedGenerus,
    error,
}: LinkGenerusClientProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [filterMode, setFilterMode] = useState<FilterMode>("unlinked");
    const [isPending, startTransition] = useTransition();
    const [linkingRow, setLinkingRow] = useState<number | null>(null);
    const [pickerOpen, setPickerOpen] = useState(false);
    const [pickerTargetRow, setPickerTargetRow] = useState<number | null>(null);
    const [linkedRows, setLinkedRows] = useState<Set<number>>(new Set());
    const [linkedGenerusIndices, setLinkedGenerusIndices] = useState<Set<number>>(new Set());
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [matchCategory, setMatchCategory] = useState<"all" | "matchable" | "unmatchable">("all");
    const [pendingLink, setPendingLink] = useState<{
        additionalInfoIdx: number;
        generusRow: SheetRow;
        isAutoMatch?: boolean;
    } | null>(null);

    const filteredData = useMemo(() => {
        let filtered = additionalInfoData;

        if (filterMode === "unlinked") {
            filtered = filtered.filter(
                (row) =>
                    !String(row["UserId"] || "").trim() &&
                    !linkedRows.has(row._index as number),
            );

            // Sub-filter by matching status
            if (matchCategory !== "all") {
                filtered = filtered.filter((row) => {
                    const aiName = String(row["Nama Lengkap"] || "").trim().toLowerCase();
                    const hasMatch = aiName && unlinkedGenerus.some(g =>
                        !linkedGenerusIndices.has(g._index as number) &&
                        String(g["NAMA LENGKAP"] || "").trim().toLowerCase() === aiName
                    );
                    return matchCategory === "matchable" ? hasMatch : !hasMatch;
                });
            }
        } else if (filterMode === "linked") {
            filtered = filtered.filter(
                (row) =>
                    !!String(row["UserId"] || "").trim() ||
                    linkedRows.has(row._index as number),
            );
        }

        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            filtered = filtered.filter((row) => {
                const namaPanggilan = String(row["Nama Panggilan"] || "").toLowerCase();
                const namaLengkap = String(row["Nama Lengkap"] || "").toLowerCase();
                const kelompok = String(row["Kelompok"] || "").toLowerCase();
                const gender = String(row["Jenis Kelamin"] || "").toLowerCase();
                return namaPanggilan.includes(q) || namaLengkap.includes(q) || kelompok.includes(q) || gender.includes(q);
            });
        }

        return filtered;
    }, [
        additionalInfoData,
        filterMode,
        searchQuery,
        linkedRows,
        matchCategory,
        unlinkedGenerus,
        linkedGenerusIndices
    ]);

    const counts = useMemo(() => {
        const unlinked = additionalInfoData.filter(
            (row) => !String(row["UserId"] || "").trim() && !linkedRows.has(row._index as number)
        );
        const linkedCount = additionalInfoData.length - unlinked.length;

        let matchable = 0;
        let unmatchable = 0;

        unlinked.forEach(row => {
            const aiName = String(row["Nama Lengkap"] || "").trim().toLowerCase();
            const hasMatch = aiName && unlinkedGenerus.some(g =>
                !linkedGenerusIndices.has(g._index as number) &&
                String(g["NAMA LENGKAP"] || "").trim().toLowerCase() === aiName
            );
            if (hasMatch) matchable++;
            else unmatchable++;
        });

        return {
            unlinked: unlinked.length,
            linked: linkedCount,
            total: additionalInfoData.length,
            matchable,
            unmatchable
        };
    }, [additionalInfoData, linkedRows, unlinkedGenerus, linkedGenerusIndices]);

    function handleOpenPicker(additionalInfoIndex: number) {
        setPickerTargetRow(additionalInfoIndex);
        setPickerOpen(true);
    }

    function handlePickerSelect(generusRow: SheetRow) {
        if (pickerTargetRow === null) return;
        setPickerOpen(false);

        // Store pending link and show confirmation
        setPendingLink({
            additionalInfoIdx: pickerTargetRow,
            generusRow,
        });
        setPickerTargetRow(null);
        setConfirmOpen(true);
    }

    function handleRowAutoMatch(idx: number) {
        const aiRow = additionalInfoData.find(r => (r._index as number) === idx);
        if (!aiRow) return;

        const aiNameRaw = String(aiRow["Nama Lengkap"] || "").trim();
        if (!aiNameRaw) {
            toast.error("Nama Lengkap kosong, tidak bisa auto-match.");
            return;
        }

        const aiName = aiNameRaw.toLowerCase();
        const availableGenerus = unlinkedGenerus.filter(g => !linkedGenerusIndices.has(g._index as number));

        const match = availableGenerus.find(g => {
            const gName = String(g["NAMA LENGKAP"] || "").trim().toLowerCase();
            return gName === aiName;
        });

        if (match) {
            setPendingLink({
                additionalInfoIdx: idx,
                generusRow: match,
                isAutoMatch: true,
            });
            setConfirmOpen(true);
        } else {
            toast.info(`Tidak ditemukan kecocokan untuk "${aiNameRaw}"`);
        }
    }

    function handleAutoMatch() {
        const unlinkedAI = additionalInfoData.filter(
            (row) => !String(row["UserId"] || "").trim() && !linkedRows.has(row._index as number)
        );

        if (unlinkedAI.length === 0) {
            toast.info("Tidak ada data AdditionalInfo yang perlu di-link.");
            return;
        }

        // Available master generus
        const availableGenerus = unlinkedGenerus.filter(g => !linkedGenerusIndices.has(g._index as number));

        if (availableGenerus.length === 0) {
            toast.info("Tidak ada data Generus master yang tersedia.");
            return;
        }

        for (const aiRow of unlinkedAI) {
            const aiNameRaw = String(aiRow["Nama Lengkap"] || "").trim();
            if (!aiNameRaw) continue;

            const aiName = aiNameRaw.toLowerCase();

            // Try to find exact match in unlinked generus
            const match = availableGenerus.find(g => {
                const gName = String(g["NAMA LENGKAP"] || "").trim().toLowerCase();
                return gName === aiName;
            });

            if (match) {
                setPendingLink({
                    additionalInfoIdx: aiRow._index as number,
                    generusRow: match,
                    isAutoMatch: true,
                });
                setConfirmOpen(true);
                return;
            }
        }

        toast.info("Tidak ditemukan kecocokan otomatis berdasarkan Nama Lengkap.");
    }

    function handleConfirmLink() {
        if (!pendingLink) return;
        setConfirmOpen(false);

        const { additionalInfoIdx, generusRow } = pendingLink;
        setLinkingRow(additionalInfoIdx);
        setPendingLink(null);

        startTransition(async () => {
            const result = await linkGenerusAction(
                additionalInfoIdx,
                generusRow._index as number,
            );
            if (result.success) {
                toast.success(result.message);
                setLinkedRows((prev) => new Set(prev).add(additionalInfoIdx));
                setLinkedGenerusIndices((prev) => new Set(prev).add(generusRow._index as number));

                // If it was an auto match, maybe try to find the next one?
                // For now, let user trigger again manually or we could add a "Match Next" button
            } else {
                toast.error(result.message);
            }
            setLinkingRow(null);
        });
    }

    function handleCancelLink() {
        setConfirmOpen(false);
        setPendingLink(null);
    }

    if (error) {
        return (
            <Card className="mx-auto max-w-2xl border-none shadow-sm bg-white dark:bg-slate-900 overflow-hidden ring-1 ring-red-200 dark:ring-red-800">
                <div className="h-2 bg-red-500" />
                <div className="p-6">
                    <h2 className="text-xl font-bold text-red-600 mb-2">Error</h2>
                    <p className="text-slate-600 dark:text-slate-400">{error}</p>
                </div>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-in fade-in slide-in-from-top-2 duration-500"
            >
                <div className="flex items-center gap-3">
                    <Button
                        asChild
                        variant="ghost"
                        size="icon"
                        className="rounded-xl h-9 w-9 shrink-0 hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                        <Link href="/admin-restricted">
                            <ArrowLeft className="h-4 w-4 text-slate-500" />
                        </Link>
                    </Button>
                    <div className="min-w-0">
                        <h1 className="text-xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2 sm:gap-3 truncate">
                            <div className="p-1.5 sm:p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg sm:rounded-xl shrink-0">
                                <Link2 className="h-5 w-5 sm:h-6 sm:w-6 text-indigo-600 dark:text-indigo-400" />
                            </div>
                            <span className="truncate">Link Generus</span>
                        </h1>
                        <p className="mt-0.5 sm:mt-1 text-[10px] sm:text-sm text-slate-500 dark:text-slate-400">
                            Pilih data AdditionalInfo, lalu hubungkan ke data Generus
                        </p>
                    </div>
                </div>

                <div className="flex gap-1.5 sm:gap-3 flex-wrap">
                    <div className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 sm:py-2 bg-white dark:bg-slate-900 rounded-lg sm:rounded-xl ring-1 ring-slate-200 dark:ring-slate-800 shadow-sm">
                        <UserX className="h-3.5 sm:h-4 w-3.5 sm:w-4 text-amber-500" />
                        <span className="text-[10px] sm:text-sm font-medium text-slate-700 dark:text-slate-300">
                            {counts.unlinked} <span className="hidden xs:inline">Belum</span>
                        </span>
                    </div>
                    <div className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 sm:py-2 bg-white dark:bg-slate-900 rounded-lg sm:rounded-xl ring-1 ring-slate-200 dark:ring-slate-800 shadow-sm">
                        <UserCheck className="h-3.5 sm:h-4 w-3.5 sm:w-4 text-emerald-500" />
                        <span className="text-[10px] sm:text-sm font-medium text-slate-700 dark:text-slate-300">
                            {counts.linked} <span className="hidden xs:inline">Sudah</span>
                        </span>
                    </div>
                    <div className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 sm:py-2 bg-white dark:bg-slate-900 rounded-lg sm:rounded-xl ring-1 ring-slate-200 dark:ring-slate-800 shadow-sm">
                        <Users className="h-3.5 sm:h-4 w-3.5 sm:w-4 text-indigo-500" />
                        <span className="text-[10px] sm:text-sm font-medium text-slate-700 dark:text-slate-300">
                            {counts.total} <span className="hidden xs:inline">Total</span>
                        </span>
                    </div>
                </div>
            </div>

            {/* Match Status Sub-Tabs (Only for Unlinked) */}
            {filterMode === "unlinked" && (
                <div className="flex flex-wrap items-center gap-2 p-1 bg-slate-100/50 dark:bg-slate-950/50 rounded-xl border border-slate-200/50 dark:border-slate-800/50 animate-in fade-in slide-in-from-left-2 duration-300">
                    <span className="hidden sm:inline text-[10px] uppercase font-bold text-slate-400 px-3 tracking-wider">Quick Filter:</span>
                    {(
                        [
                            { id: "all", label: "Semua", icon: UserX, count: counts.unlinked },
                            { id: "matchable", label: "Siap ✨", icon: Wand2, count: counts.matchable },
                            { id: "unmatchable", label: "Cek", icon: AlertCircle, count: counts.unmatchable },
                        ] as const
                    ).map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => setMatchCategory(cat.id)}
                            className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg text-[11px] sm:text-xs font-semibold transition-all ${matchCategory === cat.id
                                ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm ring-1 ring-slate-200 dark:ring-slate-700"
                                : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                                }`}
                        >
                            <cat.icon className={`h-3 sm:h-3.5 w-3 sm:w-3.5 ${matchCategory === cat.id ? "text-indigo-500" : ""}`} />
                            <span className="whitespace-nowrap">{cat.label}</span>
                            <span className={`px-1.5 py-0.5 rounded-full text-[9px] sm:text-[10px] ${matchCategory === cat.id
                                ? "bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400"
                                : "bg-slate-200 dark:bg-slate-800 text-slate-500"
                                }`}>
                                {cat.count}
                            </span>
                        </button>
                    ))}
                </div>
            )}

            {/* Search + Filter + AutoMatch */}
            <div
                className="flex flex-col sm:flex-row gap-3 animate-in fade-in slide-in-from-bottom-2 duration-500 delay-100"
            >
                <div className="flex-1 w-full order-1 sm:order-0">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                            placeholder="Cari data..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 h-10 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-xl"
                        />
                    </div>
                </div>

                <div className="flex gap-2 w-full sm:w-auto items-center">
                    <Button
                        onClick={handleAutoMatch}
                        variant="ghost"
                        className="flex-1 sm:flex-none h-10 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 px-3 sm:px-4 group"
                    >
                        <Wand2 className="w-4 h-4 mr-2 group-hover:rotate-12 transition-transform" />
                        <span className="text-xs sm:text-sm">Auto Match</span>
                    </Button>

                    <div className="flex-1 sm:flex-none flex gap-0.5 p-1 bg-white dark:bg-slate-900 rounded-xl ring-1 ring-slate-200 dark:ring-slate-800 h-10">
                        {(
                            [
                                { key: "unlinked", label: "Belum", icon: UserX, count: counts.unlinked },
                                { key: "linked", label: "Sudah", icon: UserCheck, count: counts.linked },
                            ] as const
                        ).map(({ key, label, icon: Icon, count }) => (
                            <button
                                key={key}
                                onClick={() => setFilterMode(key)}
                                className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-2 sm:px-3 rounded-lg text-[11px] sm:text-sm font-medium transition-all ${filterMode === key
                                    ? "bg-indigo-600 text-white shadow-sm"
                                    : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                                    }`}
                            >
                                <Icon className="h-3 sm:h-3.5 w-3 sm:w-3.5" />
                                <span className="hidden xs:inline">{label}</span>
                                <span className={`ml-1 text-[9px] sm:text-[10px] opacity-70`}>
                                    ({count})
                                </span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Table */}
            <Card className="border-none shadow-sm bg-white dark:bg-slate-900 overflow-hidden ring-1 ring-slate-200 dark:ring-slate-800">
                <CardContent className="p-0">
                    {filteredData.length === 0 ? (
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
                    ) : (
                        <>
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
                        </>
                    )}
                </CardContent>
            </Card>

            {/* Picker Dialog */}
            <GenerusPickerDialog
                open={pickerOpen}
                onOpenChange={setPickerOpen}
                generusList={unlinkedGenerus.filter(
                    (g) => !linkedRows.has(g._index as number) && !linkedGenerusIndices.has(g._index as number)
                )}
                onSelect={handlePickerSelect}
                initialSearch={(() => {
                    const row = additionalInfoData.find(r => (r._index as number) === pickerTargetRow);
                    return row ? String(row["Nama Lengkap"] || "").trim() : "";
                })()}
            />

            {/* Confirmation Dialog */}
            <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
                <AlertDialogContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 max-w-3xl">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2 sm:gap-3">
                            <div className="p-1.5 sm:p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg sm:rounded-xl">
                                <Link2 className="h-5 w-5 sm:h-6 sm:w-6 text-indigo-600 dark:text-indigo-400" />
                            </div>
                            Konfirmasi Link
                        </AlertDialogTitle>
                        <AlertDialogDescription asChild>
                            <div className="space-y-6 pt-2">
                                <div className="flex items-center gap-3 p-4 bg-indigo-50 dark:bg-indigo-950/30 rounded-2xl border border-indigo-100 dark:border-indigo-900/50">
                                    <AlertCircle className="w-5 h-5 text-indigo-500 shrink-0" />
                                    <p className="text-sm text-indigo-700 dark:text-indigo-300 font-medium">
                                        {pendingLink?.isAutoMatch
                                            ? "Sistem menemukan kecocokan otomatis berdasarkan Nama Lengkap. Mohon verifikasi perbandingan data untuk memastikan data sudah benar."
                                            : "Pastikan data Generus yang dipilih sudah benar sebelum melakukan linking."}
                                    </p>
                                </div>

                                {pendingLink && (
                                    <div className="flex flex-col md:grid md:grid-cols-[1fr_auto_1fr] items-center md:items-stretch gap-3 md:gap-4 max-h-[50vh] overflow-y-auto px-1">
                                        {/* Additional Info Side */}
                                        <div className="w-full group space-y-3 p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:border-indigo-300 dark:hover:border-indigo-700 relative overflow-hidden">
                                            <div className="flex items-center gap-2 mb-1 relative z-10">
                                                <div className="p-1 px-2 bg-amber-100 dark:bg-amber-900/30 rounded text-[9px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider">
                                                    New Entry
                                                </div>
                                            </div>

                                            {(() => {
                                                const row = additionalInfoData.find(r => (r._index as number) === pendingLink?.additionalInfoIdx);
                                                if (!row) return null;
                                                return (
                                                    <div className="space-y-3 relative z-10">
                                                        <div className="space-y-0.5">
                                                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">Nama Lengkap</p>
                                                            <p className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                                                                {String(row["Nama Lengkap"] || "-")}
                                                            </p>
                                                        </div>
                                                        <div className="grid grid-cols-2 gap-3 pt-1 border-t border-slate-200/50 dark:border-slate-800/50">
                                                            <div className="space-y-0.5">
                                                                <p className="text-[9px] font-bold text-slate-400 uppercase">Kelompok</p>
                                                                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                                                    {String(row["Kelompok"] || "-")}
                                                                </p>
                                                            </div>
                                                            <div className="space-y-0.5">
                                                                <p className="text-[9px] font-bold text-slate-400 uppercase">Gender</p>
                                                                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                                                    {String(row["Jenis Kelamin"] || "-")}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })()}
                                        </div>

                                        {/* Simplified Connector */}
                                        <div className="flex md:flex-col items-center justify-center gap-2 py-1 md:py-4 w-full md:w-auto">
                                            <div className="hidden md:block h-20 w-px bg-slate-200 dark:bg-slate-800" />
                                            <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-full shadow-md">
                                                <ArrowRightCircle className="w-5 h-5 text-indigo-500 rotate-90 md:rotate-0" />
                                            </div>
                                            <div className="hidden md:block h-20 w-px bg-slate-200 dark:bg-slate-800" />
                                            <div className="md:hidden h-px grow bg-slate-200 dark:bg-slate-800" />
                                        </div>

                                        {/* Generus Side */}
                                        <div className="w-full group space-y-3 p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:border-emerald-300 dark:hover:border-emerald-700 relative overflow-hidden">
                                            <div className="flex items-center gap-2 mb-1 relative z-10">
                                                <div className="p-1 px-2 bg-emerald-100 dark:bg-emerald-900/30 rounded text-[9px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
                                                    Master Data
                                                </div>
                                            </div>

                                            <div className="space-y-3 relative z-10">
                                                <div className="space-y-0.5">
                                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">Nama Lengkap</p>
                                                    <p className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                                                        {String(pendingLink.generusRow["NAMA LENGKAP"] || "-")}
                                                    </p>
                                                </div>
                                                <div className="grid grid-cols-2 gap-3 pt-1 border-t border-slate-200/50 dark:border-slate-800/50">
                                                    <div className="space-y-0.5">
                                                        <p className="text-[9px] font-bold text-slate-400 uppercase">Kelompok</p>
                                                        <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                                            {String(pendingLink.generusRow["KELOMPOK"] || "-")}
                                                        </p>
                                                    </div>
                                                    <div className="space-y-0.5">
                                                        <p className="text-[9px] font-bold text-slate-400 uppercase">Gender</p>
                                                        <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                                            {String(pendingLink.generusRow["JENIS KELAMIN"] || "-")}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <p className="text-[11px] text-center text-slate-400 italic">
                                    Setelah konfirmasi, UserId baru akan dihasilkan dan ditulis ke kedua sheet untuk sinkronisasi data.
                                </p>
                            </div>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="mt-4 gap-3">
                        <AlertDialogCancel onClick={handleCancelLink} className="rounded-xl border-slate-200 dark:border-slate-800">
                            Batal
                        </AlertDialogCancel>
                        <AlertDialogAction onClick={handleConfirmLink} className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-xl shadow-indigo-200 dark:shadow-none px-6">
                            Ya, Hubungkan Sekarang
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Mobile Auto Match FAB */}
            {filterMode === "unlinked" && (
                <Button
                    onClick={handleAutoMatch}
                    className="sm:hidden fixed bottom-6 right-6 h-14 w-14 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-xl shadow-indigo-200 dark:shadow-indigo-900/20 z-40 p-0"
                    title="Auto Match Semua"
                >
                    <Wand2 className="h-6 w-6" />
                </Button>
            )}
        </div >
    );
}
