"use client";

import { Button } from "@/components/ui/button";
import { 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft, 
  ChevronsRight,
  MoreHorizontal
} from "lucide-react";
import { memo, useMemo } from "react";
import { cn } from "@/lib/utils";

interface DashboardPaginationProps {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

export const DashboardPagination = memo(function DashboardPagination({
  currentPage,
  totalPages,
  pageSize,
  onPageChange,
  onPageSizeChange,
}: DashboardPaginationProps) {
  
  // Logic to generate page numbers to display
  const pages = useMemo(() => {
    const items: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) items.push(i);
    } else {
      items.push(1);
      
      if (currentPage > 3) {
        items.push("ellipsis-1");
      }

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        if (!items.includes(i)) items.push(i);
      }

      if (currentPage < totalPages - 2) {
        items.push("ellipsis-2");
      }

      if (!items.includes(totalPages)) {
        items.push(totalPages);
      }
    }
    return items;
  }, [currentPage, totalPages]);

  if (totalPages <= 0) return null;

  return (
    <div className="flex flex-col gap-4 py-6 px-2 sm:px-0">
      {/* Desktop & Tablet Pagination */}
      <div className="hidden sm:flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-100/50 dark:bg-slate-900/50 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
            <select
              className="bg-transparent text-sm font-semibold outline-none px-2 cursor-pointer h-8"
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
            >
              {[10, 20, 50, 100].map(size => (
                <option key={size} value={size} className="bg-white dark:bg-slate-950">
                  {size} Baris
                </option>
              ))}
            </select>
          </div>
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
            Per Halaman
          </span>
        </div>

        <div className="flex items-center gap-2">
          <nav className="flex items-center gap-1 bg-white dark:bg-slate-950 p-1 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm" aria-label="Pagination">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onPageChange(1)}
              disabled={currentPage === 1}
              className="h-9 w-9 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-900 transition-all disabled:opacity-30"
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="h-9 w-9 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-900 transition-all disabled:opacity-30"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <div className="flex items-center px-1">
              {pages.map((page, idx) => (
                typeof page === "number" ? (
                  <Button
                    key={idx}
                    variant={currentPage === page ? "default" : "ghost"}
                    size="icon"
                    onClick={() => onPageChange(page)}
                    className={cn(
                      "h-9 w-9 rounded-xl text-sm font-semibold transition-all duration-200",
                      currentPage === page 
                        ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-100 dark:shadow-none scale-105" 
                        : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900"
                    )}
                  >
                    {page}
                  </Button>
                ) : (
                  <div key={idx} className="flex h-9 w-7 items-center justify-center text-slate-400">
                    <MoreHorizontal className="h-4 w-4" />
                  </div>
                )
              ))}
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="h-9 w-9 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-900 transition-all disabled:opacity-30"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onPageChange(totalPages)}
              disabled={currentPage === totalPages}
              className="h-9 w-9 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-900 transition-all disabled:opacity-30"
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </nav>
        </div>

        <div className="hidden lg:block">
           <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/30 px-3 py-1.5 rounded-full border border-indigo-100 dark:border-indigo-900/50">
            Halaman {currentPage} dari {totalPages}
          </span>
        </div>
      </div>

      {/* Mobile Pagination - More Touch Friendly & Compact Overlay Style */}
      <div className="flex sm:hidden flex-col gap-4">
        <div className="flex items-center justify-between bg-white dark:bg-slate-950 p-2 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <Button
            variant="outline"
            size="icon"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="h-12 w-12 rounded-xl border-slate-200 dark:border-slate-800 active:scale-95 transition-transform"
          >
            <ChevronLeft className="h-6 w-6 text-indigo-600" />
          </Button>

          <div className="flex flex-col items-center">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Halaman</span>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-black text-slate-900 dark:text-white leading-none">{currentPage}</span>
              <span className="text-xs font-medium text-slate-400">/ {totalPages}</span>
            </div>
          </div>

          <Button
            variant="outline"
            size="icon"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="h-12 w-12 rounded-xl border-slate-200 dark:border-slate-800 active:scale-95 transition-transform"
          >
            <ChevronRight className="h-6 w-6 text-indigo-600" />
          </Button>
        </div>

        <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-2">
                 <select
                    className="bg-slate-100 dark:bg-slate-900 text-xs font-bold text-slate-700 dark:text-slate-300 outline-none px-3 py-2 rounded-xl appearance-none border border-slate-200 dark:border-slate-800"
                    value={pageSize}
                    onChange={(e) => onPageSizeChange(Number(e.target.value))}
                >
                    {[10, 20, 50, 100].map(size => (
                        <option key={size} value={size}>
                        {size} / Hal
                        </option>
                    ))}
                </select>
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
            </div>

            <div className="flex gap-2">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onPageChange(1)}
                    disabled={currentPage === 1}
                    className="h-9 px-3 rounded-xl text-xs font-bold text-slate-500"
                >
                    Awal
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onPageChange(totalPages)}
                    disabled={currentPage === totalPages}
                    className="h-9 px-3 rounded-xl text-xs font-bold text-slate-500"
                >
                    Akhir
                </Button>
            </div>
        </div>
      </div>
    </div>
  );
});
