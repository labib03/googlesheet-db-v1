"use client";

import { useState, useMemo, useTransition } from "react";
import { SheetRow } from "@/lib/google-sheets";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wand2 } from "lucide-react";
import { linkGenerusAction } from "@/app/actions";
import { toast } from "sonner";
import { GenerusPickerDialog } from "@/components/link-generus/generus-picker-dialog";
import { LinkGenerusHeader } from "@/components/link-generus/link-generus-header";
import { LinkGenerusTable } from "@/components/link-generus/link-generus-table";
import { LinkConfirmationDialog, PendingLinkType } from "@/components/link-generus/link-confirmation-dialog";

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
    const [pendingLink, setPendingLink] = useState<PendingLinkType>(null);
    const [isLinkingInDialog, setIsLinkingInDialog] = useState(false);

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
        setIsLinkingInDialog(true);
        startTransition(() => {
            setPickerTargetRow(additionalInfoIndex);
            setPickerOpen(true);
            setIsLinkingInDialog(false);
        });
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
        setIsLinkingInDialog(true);
        startTransition(() => {
            const aiRow = additionalInfoData.find(r => (r._index as number) === idx);
            if (!aiRow) {
                setIsLinkingInDialog(false);
                return;
            }

            const aiNameRaw = String(aiRow["Nama Lengkap"] || "").trim();
            if (!aiNameRaw) {
                toast.error("Nama Lengkap kosong, tidak bisa auto-match.");
                setIsLinkingInDialog(false);
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
            setIsLinkingInDialog(false);
        });
    }

    function handleAutoMatch() {
        setIsLinkingInDialog(true);
        startTransition(() => {
            const unlinkedAI = additionalInfoData.filter(
                (row) => !String(row["UserId"] || "").trim() && !linkedRows.has(row._index as number)
            );

            if (unlinkedAI.length === 0) {
                toast.info("Tidak ada data AdditionalInfo yang perlu di-link.");
                setIsLinkingInDialog(false);
                return;
            }

            const availableGenerus = unlinkedGenerus.filter(g => !linkedGenerusIndices.has(g._index as number));

            if (availableGenerus.length === 0) {
                toast.info("Tidak ada data Generus master yang tersedia.");
                setIsLinkingInDialog(false);
                return;
            }

            for (const aiRow of unlinkedAI) {
                const aiNameRaw = String(aiRow["Nama Lengkap"] || "").trim();
                if (!aiNameRaw) continue;

                const aiName = aiNameRaw.toLowerCase();

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
                    setIsLinkingInDialog(false);
                    return;
                }
            }

            toast.info("Tidak ditemukan kecocokan otomatis berdasarkan Nama Lengkap.");
            setIsLinkingInDialog(false);
        });
    }

    function handleConfirmLink() {
        if (!pendingLink) return;

        const { additionalInfoIdx, generusRow } = pendingLink;
        setIsLinkingInDialog(true);
        setLinkingRow(additionalInfoIdx);

        startTransition(async () => {
            const result = await linkGenerusAction(
                additionalInfoIdx,
                generusRow._index as number,
            );
            if (result.success) {
                toast.success(result.message);
                setLinkedRows((prev) => new Set(prev).add(additionalInfoIdx));
                setLinkedGenerusIndices((prev) => new Set(prev).add(generusRow._index as number));
            } else {
                toast.error(result.message);
            }
            setLinkingRow(null);
            setIsLinkingInDialog(false);
            setConfirmOpen(false);
            setPendingLink(null);
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
            <LinkGenerusHeader
                counts={counts}
                filterMode={filterMode}
                setFilterMode={setFilterMode}
                matchCategory={matchCategory}
                setMatchCategory={setMatchCategory}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                handleAutoMatch={handleAutoMatch}
            />

            <LinkGenerusTable
                filteredData={filteredData}
                unlinkedGenerus={unlinkedGenerus}
                linkedRows={linkedRows}
                linkedGenerusIndices={linkedGenerusIndices}
                filterMode={filterMode}
                linkingRow={linkingRow}
                isPending={isPending}
                handleOpenPicker={handleOpenPicker}
                handleRowAutoMatch={handleRowAutoMatch}
            />

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

            <LinkConfirmationDialog
                open={confirmOpen}
                onOpenChange={setConfirmOpen}
                pendingLink={pendingLink}
                additionalInfoData={additionalInfoData}
                isLinkingInDialog={isLinkingInDialog}
                handleCancelLink={handleCancelLink}
                handleConfirmLink={handleConfirmLink}
            />

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
        </div>
    );
}
