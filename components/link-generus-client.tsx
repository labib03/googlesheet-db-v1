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
} from "lucide-react";
import { linkGenerusAction } from "@/app/actions";
import { toast } from "sonner";
import { GenerusPickerDialog } from "@/components/generus-picker-dialog";
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
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [pendingLink, setPendingLink] = useState<{
        additionalInfoIdx: number;
        generusRow: SheetRow;
    } | null>(null);

    const filteredData = useMemo(() => {
        let filtered = additionalInfoData;

        if (filterMode === "unlinked") {
            filtered = filtered.filter(
                (row) =>
                    !String(row["UserId"] || "").trim() &&
                    !linkedRows.has(row._index as number),
            );
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
                const nama = String(row["Nama Panggilan"] || "").toLowerCase();
                const kelompok = String(row["Kelompok"] || "").toLowerCase();
                const gender = String(row["Jenis Kelamin"] || "").toLowerCase();
                return nama.includes(q) || kelompok.includes(q) || gender.includes(q);
            });
        }

        return filtered;
    }, [additionalInfoData, filterMode, searchQuery, linkedRows]);

    const unlinkedCount = additionalInfoData.filter(
        (row) =>
            !String(row["UserId"] || "").trim() &&
            !linkedRows.has(row._index as number),
    ).length;
    const linkedCount = additionalInfoData.length - unlinkedCount;

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

                <div className="flex gap-3">
                    <div className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-slate-900 rounded-xl ring-1 ring-slate-200 dark:ring-slate-800">
                        <UserX className="h-4 w-4 text-amber-500" />
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                            {unlinkedCount} Belum
                        </span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-slate-900 rounded-xl ring-1 ring-slate-200 dark:ring-slate-800">
                        <UserCheck className="h-4 w-4 text-emerald-500" />
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                            {linkedCount} Sudah
                        </span>
                    </div>
                </div>
            </div>

            {/* Search + Filter */}
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
                <div className="flex gap-1 p-1 bg-white dark:bg-slate-900 rounded-lg ring-1 ring-slate-200 dark:ring-slate-800">
                    {(
                        [
                            { key: "unlinked", label: "Belum", icon: UserX },
                            { key: "linked", label: "Sudah", icon: UserCheck },
                            { key: "all", label: "Semua", icon: Users },
                        ] as const
                    ).map(({ key, label, icon: Icon }) => (
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
                        </button>
                    ))}
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

                                        return (
                                            <tr
                                                key={idx}
                                                className="border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors animate-in fade-in duration-300"
                                            >
                                                <td className="px-4 py-3">
                                                    <span className="font-medium text-slate-900 dark:text-white text-sm">
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
                    (g) => !linkedRows.has(g._index as number),
                )}
                onSelect={handlePickerSelect}
            />

            {/* Confirmation Dialog */}
            <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
                <AlertDialogContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-slate-900 dark:text-white flex items-center gap-2">
                            <Link2 className="h-5 w-5 text-indigo-500" />
                            Konfirmasi Link Generus
                        </AlertDialogTitle>
                        <AlertDialogDescription asChild>
                            <div className="space-y-3 text-sm text-slate-500 dark:text-slate-400">
                                <p>Apakah kamu yakin ingin menghubungkan data ini? Aksi ini tidak bisa dibatalkan.</p>
                                {pendingLink && (
                                    <div className="bg-slate-50 dark:bg-slate-950/50 rounded-lg p-4 space-y-3 ring-1 ring-slate-200 dark:ring-slate-800">
                                        <div className="flex items-center gap-3">
                                            <div className="p-1.5 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                                                <UserX className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                                            </div>
                                            <div>
                                                <p className="text-xs text-slate-400">AdditionalInfo</p>
                                                <p className="font-medium text-slate-900 dark:text-white">
                                                    {String(additionalInfoData.find(r => (r._index as number) === pendingLink.additionalInfoIdx)?.["Nama Panggilan"] || "-")}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex justify-center">
                                            <div className="p-1 bg-indigo-100 dark:bg-indigo-900/30 rounded-full">
                                                <Link2 className="h-3 w-3 text-indigo-500" />
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="p-1.5 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                                                <UserCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                                            </div>
                                            <div>
                                                <p className="text-xs text-slate-400">Generus</p>
                                                <p className="font-medium text-slate-900 dark:text-white">
                                                    {String(pendingLink.generusRow["NAMA LENGKAP"] || "-")}
                                                </p>
                                                <p className="text-xs text-slate-400">
                                                    {String(pendingLink.generusRow["KELOMPOK"] || "")} · {String(pendingLink.generusRow["JENIS KELAMIN"] || "")}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={handleCancelLink} className="dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300">
                            Batal
                        </AlertDialogCancel>
                        <AlertDialogAction onClick={handleConfirmLink} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                            Ya, Hubungkan
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div >
    );
}
