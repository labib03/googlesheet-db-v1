"use client";

import { SheetRow } from "@/lib/google-sheets";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Eye, ChevronDown } from "lucide-react";
import { useState, useRef, useEffect, useCallback } from "react";
import { getCellValue } from "@/lib/helper";
import { COLUMNS } from "@/lib/constants";
import { useModalState } from "@/hooks/use-modal-state";

interface DataDetailDialogProps {
  row: SheetRow;
  title?: string;
  children?: React.ReactNode;
}

export function DataDetailDialog({
  row,
  title = "Profil Lengkap",
  children,
}: DataDetailDialogProps) {
  const { isOpen, onOpenChange, close } = useModalState("detail", row._index as string);
  const [showScrollIndicator, setShowScrollIndicator] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const checkScroll = useCallback(() => {
    if (scrollRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
      const canScrollDown = scrollHeight > clientHeight + scrollTop + 10;
      setShowScrollIndicator(canScrollDown);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(checkScroll, 100);
      return () => clearTimeout(timer);
    }
  }, [isOpen, checkScroll]);

  const nama = getCellValue(row, COLUMNS.NAMA);
  const initials = (nama || "?")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const kelompok = getCellValue(row, COLUMNS.KELOMPOK);
  const desa = getCellValue(row, COLUMNS.DESA);

  const ignoredKeys = ["_index", "timestamp", COLUMNS.NAMA.toLowerCase()];

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        {children ? (
          children
        ) : (
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 text-indigo-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/40 rounded-xl transition-all active:scale-90"
          >
            <Eye className="h-4 w-4" />
            <span className="sr-only">Lihat Detail</span>
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[480px] p-0 overflow-hidden border-none rounded-3xl shadow-2xl h-[92vh] max-h-[92vh] flex flex-col font-outfit">
        {/* Header - Fixed */}
        <div className="bg-slate-50 dark:bg-slate-950 p-5 md:p-6 flex items-center gap-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div className="h-14 w-14 md:h-16 md:w-16 rounded-2xl bg-indigo-600 flex items-center justify-center text-white text-lg md:text-xl font-bold shadow-lg shadow-indigo-200 dark:shadow-none shrink-0 font-syne">
            {initials}
          </div>
          <div className="min-w-0 pr-5">
            <DialogTitle className="text-lg md:text-xl font-bold text-slate-900 dark:text-white leading-tight font-syne whitespace-normal wrap-break-word">
              {nama || title}
            </DialogTitle>
            <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 font-medium truncate">
              {kelompok || "Kelompok"} • {desa || "Desa"}
            </p>
          </div>
        </div>

        {/* Content - Scrollable */}
        <div className="relative flex-1 min-h-0 bg-white dark:bg-slate-900">
          <div
            ref={scrollRef}
            onScroll={checkScroll}
            className="h-full overflow-y-auto px-5 md:px-8 py-4 scrollbar-hide"
          >
            <div className="grid gap-1 pb-4">
              {Object.entries(row)
                .filter(([key]) => !ignoredKeys.includes(key.toLowerCase()))
                .map(([key, value]) => (
                  <div
                    key={key}
                    className="flex flex-col py-2.5 border-b border-slate-50 dark:border-slate-800 last:border-0 group"
                  >
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1 group-hover:text-indigo-500 transition-colors">
                      {key}
                    </span>
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 break-words">
                      {String(value) || "-"}
                    </span>
                  </div>
                ))}
            </div>
          </div>

          {/* Scroll Indicator Icon */}
          <div
            className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center shadow-lg transition-all duration-300 pointer-events-none md:hidden ${
              showScrollIndicator
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-4"
            }`}
          >
            <ChevronDown className="w-5 h-5 animate-bounce" />
          </div>
        </div>

        {/* Footer - Fixed */}
        <div className="mt-auto p-5 md:p-6 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 shrink-0">
          <Button
            variant="ghost"
            className="w-full rounded-xl h-11 transition-all font-semibold outline-none"
            onClick={() => close()}
          >
            Tutup Profil
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
