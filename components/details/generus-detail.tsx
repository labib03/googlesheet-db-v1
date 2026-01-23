"use client";

import { SheetRow } from "@/lib/google-sheets";
import { capitalizeWords, formatDate, getCellValue } from "@/lib/helper";
import { COLUMNS } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import { useState, useRef, useEffect, useCallback } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface GenerusDetailProps {
  row: SheetRow;
  onBack: () => void;
  showBackButton?: boolean;
}

export function GenerusDetail({ row, onBack }: GenerusDetailProps) {
  const [showScrollIndicator, setShowScrollIndicator] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const checkScroll = useCallback(() => {
    if (scrollRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
      const canScrollDown = scrollHeight > clientHeight + scrollTop + 40;
      setShowScrollIndicator(canScrollDown);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(checkScroll, 500);
    return () => clearTimeout(timer);
  }, [checkScroll]);

  const rowNama = getCellValue(row, COLUMNS.NAMA);
  const rowDesa = getCellValue(row, COLUMNS.DESA);
  const rowKelompok = getCellValue(row, COLUMNS.KELOMPOK);

  const initials = (rowNama || "?")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const ignoredKeys = ["_index", "timestamp", COLUMNS.NAMA.toLowerCase(), "_rawbirthdate"];

  return (
    <div className="flex flex-col h-auto max-h-dvh bg-white dark:bg-slate-900 overflow-hidden relative font-outfit">
      {/* Header - Fixed */}
      <div className="bg-slate-50 dark:bg-slate-950 p-4 md:p-5 flex items-center gap-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
        <div className="h-14 w-14 md:h-16 md:w-16 rounded-2xl bg-indigo-600 flex items-center justify-center text-white text-lg md:text-xl font-bold shadow-lg shadow-indigo-200 dark:shadow-none shrink-0 font-syne">
          {initials}
        </div>
        <div className="flex-1 min-w-0 pr-5">
          <h2 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white leading-tight font-syne whitespace-normal wrap-break-word">
            {capitalizeWords(rowNama)}
          </h2>
          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 font-medium truncate">
            {rowKelompok || "Kelompok"} • {rowDesa || "Desa"}
          </p>
        </div>
      </div>

      {/* Content - Scrollable */}
      <ScrollArea 
        className="flex-1 h-auto overflow-y-auto"
        onScrollCapture={checkScroll}
        ref={scrollRef}
      >
        <div className="px-5 md:px-8 py-6">
          <div className="grid gap-1">
            {Object.entries(row)
              .filter(([key]) => !ignoredKeys.includes(key.toLowerCase()))
              .map(([key, value]) => (
                <div
                  key={key}
                  className="flex flex-col py-3 border-b border-slate-50 dark:border-slate-800/50 last:border-0 group"
                >
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1 group-hover:text-indigo-500 transition-colors">
                    {key}
                  </span>
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 break-words leading-relaxed">
                    {key === "TANGGAL LAHIR" ? formatDate(value as string, "dd MMMM yyyy") : String(value) || "-"}
                  </span>
                </div>
              ))}
          </div>
        </div>
      </ScrollArea>

      {/* Scroll Indicator Icon */}
      <div
        className={`absolute bottom-[100px] left-1/2 -translate-x-1/2 w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center shadow-lg transition-all duration-300 pointer-events-none z-[9999] ${
          showScrollIndicator
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-4"
        }`}
      >
        <ChevronDown className="w-5 h-5 animate-bounce" />
      </div>

      {/* Footer - Fixed */}
      <div className="shrink-0 p-2 border-t border-slate-100 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm">
        <Button
          variant="ghost"
          className="w-full rounded-xl h-12 transition-all font-bold hover:bg-slate-50 dark:hover:bg-slate-800"
          onClick={onBack}
        >
          Tutup Profil
        </Button>
      </div>
    </div>
  );
}
