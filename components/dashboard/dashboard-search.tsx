"use client";

import { memo } from "react";
import { Search, X } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface DashboardSearchProps {
  filterNama: string;
  setFilterNama: (v: string) => void;
  showDuplicates: boolean;
  actions: {
    handleStartTransition: (fn: () => void) => void;
    setCurrentPage: (p: number) => void;
  };
}

export const DashboardSearch = memo(function DashboardSearch({
  filterNama,
  setFilterNama,
  showDuplicates,
  actions,
}: DashboardSearchProps) {
  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 dark:bg-indigo-900/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />

      <TooltipProvider>
        <div className="w-full relative">
          <h2 className="text-sm font-extrabold text-slate-800 dark:text-slate-100 uppercase tracking-tight mb-4 flex items-center gap-2">
            <Search className="w-4 h-4 text-indigo-500" />
            Pencarian Utama
          </h2>

          <Tooltip delayDuration={300}>
            <TooltipTrigger asChild>
              <div className="relative group">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                  <Search className="h-6 w-6 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                </div>
                <input
                  type="text"
                  disabled={showDuplicates}
                  placeholder="Masukkan nama generus..."
                  className={`w-full h-16 pl-14 pr-14 border-2 rounded-xl text-lg focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none placeholder:text-slate-400 disabled:opacity-50 disabled:cursor-not-allowed ${
                    filterNama
                      ? "bg-indigo-50/20 dark:bg-indigo-950/20 border-indigo-300 dark:border-indigo-700 text-indigo-900 dark:text-indigo-100 font-bold shadow-md"
                      : "bg-slate-50/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 hover:border-slate-300 dark:hover:border-slate-700"
                  }`}
                  value={filterNama}
                  onChange={(e) => {
                    actions.handleStartTransition(() => {
                      setFilterNama(e.target.value);
                      actions.setCurrentPage(1);
                    });
                  }}
                />
                {filterNama && !showDuplicates && (
                  <button
                    onClick={() => {
                      actions.handleStartTransition(() => {
                        setFilterNama("");
                        actions.setCurrentPage(1);
                      });
                    }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                )}
              </div>
            </TooltipTrigger>
            {showDuplicates && (
              <TooltipContent side="bottom" className="max-w-[200px] text-xs">
                Pencarian nama dikunci ketika mode duplikasi aktif
              </TooltipContent>
            )}
          </Tooltip>
        </div>
      </TooltipProvider>
    </div>
  );
});
