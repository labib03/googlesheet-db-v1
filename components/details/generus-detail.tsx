"use client";

import { SheetRow } from "@/lib/google-sheets";
import { capitalizeWords, getCellValue } from "@/lib/helper";
import { COLUMNS } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import { useState, useRef, useEffect, useCallback } from "react";

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
      const canScrollDown = scrollHeight > clientHeight + scrollTop + 10;
      setShowScrollIndicator(canScrollDown);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(checkScroll, 100);
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

  const ignoredKeys = ["_index", "timestamp", COLUMNS.NAMA.toLowerCase()];

  return (
    <div className="flex flex-col h-screen max-h-screen bg-white dark:bg-slate-900 overflow-hidden font-outfit">
      {/* Header - Fixed */}
      <div className="bg-slate-50 dark:bg-slate-950 p-5 md:p-6 flex items-center gap-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
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
      <div className="relative flex-1 min-h-0">
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
                  className="flex flex-col py-3 border-b border-slate-50 dark:border-slate-800/50 last:border-0 group"
                >
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1 group-hover:text-indigo-500 transition-colors">
                    {key}
                  </span>
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 break-words leading-relaxed">
                    {String(value) || "-"}
                  </span>
                </div>
              ))}
          </div>
        </div>

        {/* Scroll Indicator Icon */}
        <div
          className={`absolute bottom-4 left-1/2 -translate-x-1/2 w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center shadow-lg transition-all duration-300 pointer-events-none ${
            showScrollIndicator
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-4"
          }`}
        >
          <ChevronDown className="w-5 h-5 animate-bounce" />
        </div>
      </div>

      {/* Footer - Fixed */}
      <div className="p-5 md:p-6 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 shrink-0 pb-12 md:pb-6">
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
