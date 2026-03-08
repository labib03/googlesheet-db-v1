"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { SheetRow } from "@/lib/google-sheets";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, User, MapPin, UserCheck, Loader2 } from "lucide-react";

const ITEMS_PER_PAGE = 30;

interface GenerusPickerDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    generusList: SheetRow[];
    onSelect: (row: SheetRow) => void;
    initialSearch?: string;
}

export function GenerusPickerDialog({
    open,
    onOpenChange,
    generusList,
    onSelect,
    initialSearch = "",
}: GenerusPickerDialogProps) {
    const [search, setSearch] = useState("");
    const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
    const [selectingId, setSelectingId] = useState<number | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleSelect = (row: SheetRow) => {
        setSelectingId(row._index as number);
        setTimeout(() => {
            onSelect(row);
            setSelectingId(null);
        }, 50);
    };

    useEffect(() => {
        if (open) {
            setSearch(initialSearch);
            setVisibleCount(ITEMS_PER_PAGE);
            // Defer focus to after animation settles
            const timer = setTimeout(() => inputRef.current?.focus(), 100);
            return () => clearTimeout(timer);
        } else {
            // setSearch("");
        }
    }, [open, initialSearch]);

    // Reset visible count when search changes 
    useEffect(() => {
        setVisibleCount(ITEMS_PER_PAGE);
    }, [search]);

    const filtered = useMemo(() => {
        if (!search.trim()) return generusList;
        const q = search.toLowerCase();
        return generusList.filter((row) => {
            const nama = String(row["NAMA LENGKAP"] || "").toLowerCase();
            const kelompok = String(row["KELOMPOK"] || "").toLowerCase();
            const gender = String(row["JENIS KELAMIN"] || "").toLowerCase();
            return nama.includes(q) || kelompok.includes(q) || gender.includes(q);
        });
    }, [generusList, search]);

    const visibleItems = useMemo(() => filtered.slice(0, visibleCount), [filtered, visibleCount]);
    const hasMore = visibleCount < filtered.length;

    const handleLoadMore = useCallback(() => {
        setVisibleCount(prev => prev + ITEMS_PER_PAGE);
    }, []);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg max-h-[80vh] grid-rows-none! flex! flex-col! p-0 gap-0 overflow-hidden bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                <DialogHeader className="px-6 pt-6 pb-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
                    <DialogTitle className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <UserCheck className="h-5 w-5 text-indigo-500" />
                        Pilih Generus
                    </DialogTitle>
                    <div className="relative mt-3">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                            ref={inputRef}
                            placeholder="Cari nama, kelompok, atau jenis kelamin..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-10 bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800"
                        />
                    </div>
                </DialogHeader>

                <div className="flex-1 min-h-0 overflow-y-auto">
                    <div className="px-2 py-2 space-y-1">
                        {filtered.length === 0 ? (
                            <div className="text-center py-8">
                                <p className="text-sm text-slate-400">Tidak ditemukan</p>
                            </div>
                        ) : (
                            <>
                                {visibleItems.map((row) => (
                                    <Button
                                        key={row._index as number}
                                        variant="ghost"
                                        className="w-full justify-start h-auto py-3 px-4 hover:bg-indigo-50 dark:hover:bg-indigo-950/20 group transition-colors"
                                        onClick={() => handleSelect(row)}
                                        disabled={selectingId === (row._index as number)}
                                    >
                                        <div className="flex items-start gap-3 w-full">
                                            <div className="p-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/30 transition-colors shrink-0 mt-0.5">
                                                {selectingId === (row._index as number) ? (
                                                    <Loader2 className="h-4 w-4 text-indigo-600 dark:text-indigo-400 animate-spin" />
                                                ) : (
                                                    <User className="h-4 w-4 text-slate-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400" />
                                                )}
                                            </div>
                                            <div className="flex flex-col items-start text-left flex-1 min-w-0">
                                                <span className="text-sm font-medium text-slate-900 dark:text-white truncate w-full">
                                                    {String(row["NAMA LENGKAP"] || "-")}
                                                </span>
                                                <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                                                    <span className="flex items-center gap-1">
                                                        <MapPin className="h-3 w-3" />
                                                        {String(row["KELOMPOK"] || "-")}
                                                    </span>
                                                    <span>·</span>
                                                    <span>{String(row["JENIS KELAMIN"] || "-")}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </Button>
                                ))}
                                {hasMore && (
                                    <div className="py-3 text-center">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={handleLoadMore}
                                            className="text-xs text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/20 rounded-xl"
                                        >
                                            Tampilkan lainnya ({filtered.length - visibleCount} sisa)
                                        </Button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>

                <div className="px-6 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 shrink-0">
                    <p className="text-xs text-slate-400 text-center">
                        {filtered.length === generusList.length
                            ? `${generusList.length} generus`
                            : `${filtered.length} dari ${generusList.length} generus`}
                    </p>
                </div>
            </DialogContent>
        </Dialog>
    );
}

