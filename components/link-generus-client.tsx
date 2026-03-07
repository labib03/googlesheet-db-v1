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
    AlertCircle
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
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
                            <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl">
                                <Link2 className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                            </div>
                            Link Generus
                        </h1>
                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                            Pilih data AdditionalInfo, lalu hubungkan ke data Generus
                        </p>
                    </div>
                </div>

                <div className="flex gap-2 sm:gap-3 flex-wrap">
                    <div className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-slate-900 rounded-xl ring-1 ring-slate-200 dark:ring-slate-800 shadow-sm">
                        <UserX className="h-4 w-4 text-amber-500" />
                        <span className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300">
                            {counts.unlinked} Belum
                        </span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-slate-900 rounded-xl ring-1 ring-slate-200 dark:ring-slate-800 shadow-sm">
                        <UserCheck className="h-4 w-4 text-emerald-500" />
                        <span className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300">
                            {counts.linked} Sudah
                        </span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-slate-900 rounded-xl ring-1 ring-slate-200 dark:ring-slate-800 shadow-sm">
                        <Users className="h-4 w-4 text-indigo-500" />
                        <span className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300">
                            {counts.total} Total
                        </span>
                    </div>
                </div>
            </div>

            {/* Match Status Sub-Tabs (Only for Unlinked) */}
            {filterMode === "unlinked" && (
                <div className="flex flex-wrap items-center gap-2 p-1.5 bg-slate-50 dark:bg-slate-950/50 rounded-2xl border border-slate-100 dark:border-slate-800/50 animate-in fade-in slide-in-from-left-2 duration-300">
                    <span className="text-[10px] uppercase font-bold text-slate-400 px-3 tracking-wider">Quick Filter:</span>
                    {(
                        [
                            { id: "all", label: "Semua Belum", icon: UserX, count: counts.unlinked },
                            { id: "matchable", label: "Siap Match ✨", icon: Wand2, count: counts.matchable },
                            { id: "unmatchable", label: "Perlu Cek", icon: AlertCircle, count: counts.unmatchable },
                        ] as const
                    ).map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => setMatchCategory(cat.id)}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${matchCategory === cat.id
                                ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm ring-1 ring-slate-200 dark:ring-slate-700"
                                : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                                }`}
                        >
                            <cat.icon className={`h-3.5 w-3.5 ${matchCategory === cat.id ? "text-indigo-500" : ""}`} />
                            {cat.label}
                            <span className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] ${matchCategory === cat.id
                                ? "bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400"
                                : "bg-slate-100 dark:bg-slate-800 text-slate-500"
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
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                        placeholder="Cari nama, kelompok, atau jenis kelamin..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
                    />
                </div>

                <div className="flex gap-3 items-center">
                    <Button
                        onClick={handleAutoMatch}
                        variant="ghost"
                        className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 px-4 group"
                    >
                        <Wand2 className="w-4 h-4 mr-2 group-hover:rotate-12 transition-transform" />
                        Auto Match
                    </Button>

                    <div className="flex gap-1 p-1 bg-white dark:bg-slate-900 rounded-lg ring-1 ring-slate-200 dark:ring-slate-800 h-[40px]">
                        {(
                            [
                                { key: "unlinked", label: "Belum", icon: UserX, count: counts.unlinked },
                                { key: "linked", label: "Sudah", icon: UserCheck, count: counts.linked },
                                { key: "all", label: "Semua", icon: Users, count: counts.total },
                            ] as const
                        ).map(({ key, label, icon: Icon, count }) => (
                            <button
                                key={key}
                                onClick={() => setFilterMode(key)}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${filterMode === key
                                    ? "bg-indigo-600 text-white shadow-sm"
                                    : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                                    }`}
                            >
                                <Icon className="h-3.5 w-3.5" />
                                {label}
                                <span className={`ml-1 text-[10px] opacity-70`}>
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
                        <div className="overflow-x-auto">
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

                                        // Check if auto-match exists for this specific row
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
                                                    <span className="block sm:hidden text-xs text-slate-400 mt-0.5">
                                                        {String(row["Kelompok"] || "")}
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
                                                                className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs h-8"
                                                            >
                                                                {isLinking ? (
                                                                    <Loader2 className="h-3 w-3 animate-spin" />
                                                                ) : (
                                                                    <>
                                                                        <Link2 className="h-3 w-3 mr-1" />
                                                                        Link Generus
                                                                    </>
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
                        <AlertDialogTitle className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                            <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl">
                                <Link2 className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                            </div>
                            Konfirmasi Link Generus
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
                                    <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] items-stretch gap-4">
                                        {/* Additional Info Side */}
                                        <div className="group space-y-4 p-5 bg-white dark:bg-slate-950 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:border-indigo-300 dark:hover:border-indigo-700 relative overflow-hidden">
                                            <div className="absolute top-0 right-0 p-3 opacity-5">
                                                <Copy className="w-12 h-12 text-slate-400" />
                                            </div>

                                            <div className="flex items-center gap-2 mb-2 relative z-10">
                                                <div className="p-1.5 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                                                    <UserX className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                                                </div>
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">AdditionalInfo</span>
                                            </div>

                                            {(() => {
                                                const row = additionalInfoData.find(r => (r._index as number) === pendingLink?.additionalInfoIdx);
                                                if (!row) return null;
                                                return (
                                                    <div className="space-y-4 relative z-10">
                                                        <div className="space-y-1">
                                                            <p className="text-[10px] font-bold text-slate-400 uppercase">Nama Lengkap</p>
                                                            <p className="text-base font-bold text-slate-900 dark:text-white leading-tight">
                                                                {String(row["Nama Lengkap"] || "-")}
                                                            </p>
                                                        </div>
                                                        <div className="grid grid-cols-1 gap-4 pt-2">
                                                            <div className="space-y-1">
                                                                <p className="text-[10px] font-bold text-slate-400 uppercase">Nama Panggilan</p>
                                                                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                                                                    {String(row["Nama Panggilan"] || "-")}
                                                                </p>
                                                            </div>
                                                            <div className="grid grid-cols-2 gap-3">
                                                                <div className="space-y-1">
                                                                    <p className="text-[10px] font-bold text-slate-400 uppercase">Kelompok</p>
                                                                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                                                                        {String(row["Kelompok"] || "-")}
                                                                    </p>
                                                                </div>
                                                                <div className="space-y-1">
                                                                    <p className="text-[10px] font-bold text-slate-400 uppercase">Gender</p>
                                                                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                                                                        {String(row["Jenis Kelamin"] || "-")}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })()}
                                        </div>

                                        {/* Connector */}
                                        <div className="flex md:flex-col items-center justify-center gap-2 py-4">
                                            <div className="h-px md:h-20 w-full md:w-px bg-slate-200 dark:bg-slate-800" />
                                            <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-full animate-pulse shadow-lg shadow-indigo-200 dark:shadow-none">
                                                <ArrowRightCircle className="w-6 h-6 text-indigo-500 rotate-90 md:rotate-0" />
                                            </div>
                                            <div className="h-px md:h-20 w-full md:w-px bg-slate-200 dark:bg-slate-800" />
                                        </div>

                                        {/* Generus Side */}
                                        <div className="group space-y-4 p-5 bg-white dark:bg-slate-950 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:border-emerald-300 dark:hover:border-emerald-700 relative overflow-hidden">
                                            <div className="absolute top-0 right-0 p-3 opacity-5">
                                                <UserCheck className="w-12 h-12 text-slate-400" />
                                            </div>

                                            <div className="flex items-center gap-2 mb-2 relative z-10">
                                                <div className="p-1.5 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                                                    <UserCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                                                </div>
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Generus Master</span>
                                            </div>

                                            <div className="space-y-4 relative z-10">
                                                <div className="space-y-1">
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase">Nama Lengkap</p>
                                                    <p className="text-base font-bold text-slate-900 dark:text-white leading-tight">
                                                        {String(pendingLink.generusRow["NAMA LENGKAP"] || "-")}
                                                    </p>
                                                </div>
                                                <div className="grid grid-cols-1 gap-4 pt-2">
                                                    <div className="space-y-1">
                                                        <p className="text-[10px] font-bold text-slate-400 uppercase">Nama Panggilan</p>
                                                        <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                                                            {String(pendingLink.generusRow["NAMA PANGGILAN"] || "-")}
                                                        </p>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-3">
                                                        <div className="space-y-1">
                                                            <p className="text-[10px] font-bold text-slate-400 uppercase">Kelompok</p>
                                                            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                                                                {String(pendingLink.generusRow["KELOMPOK"] || "-")}
                                                            </p>
                                                        </div>
                                                        <div className="space-y-1">
                                                            <p className="text-[10px] font-bold text-slate-400 uppercase">Gender</p>
                                                            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                                                                {String(pendingLink.generusRow["JENIS KELAMIN"] || "-")}
                                                            </p>
                                                        </div>
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
        </div >
    );
}
