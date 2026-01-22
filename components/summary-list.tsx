"use client";

import { Loader2, BarChart } from "lucide-react";
import { useTransition } from "react";
import { useRouter } from "next/navigation";

interface SummaryItem {
  label: string;
  count: number;
  key?: string;
  href?: { pathname: string; query?: Record<string, string> };
}

interface SummaryListProps {
  title: string;
  description: string;
  items: SummaryItem[];
  selectedKey?: string;
  isClickable?: boolean;
  selectionType?: "desa" | "kelompok";
  baseParams?: Record<string, string>;
}

export function SummaryList({
  title,
  description,
  items,
  selectedKey,
  isClickable = false,
  selectionType = "desa",
  baseParams = {},
}: SummaryListProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleSelect = (item: SummaryItem) => {
    startTransition(() => {
      const params = new URLSearchParams();
      
      // Keep base params
      Object.entries(baseParams).forEach(([k, v]) => {
        params.set(k, v);
      });

      if (selectionType === "desa") {
        if (item.key && item.key === selectedKey) {
          router.push("/summary");
        } else {
          router.push(`/summary?desa=${encodeURIComponent(item.label)}`);
        }
      } else {
        // selectionType === "kelompok"
        if (item.key && item.key === selectedKey) {
          // Deselect kelompok, but keep desa
          params.delete("kelompok");
        } else {
          params.set("kelompok", item.label);
        }
        router.push(`/summary?${params.toString()}`);
      }
    });
  };

  return (
    <div className="relative">
      {isPending && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/60 dark:bg-slate-950/60 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            <span className="text-xs font-semibold text-slate-500">Syncing...</span>
          </div>
        </div>
      )}

      <div className="space-y-6">
        <div className="flex flex-col gap-1.5">
           <h3 className="text-xl font-bold text-slate-800 dark:text-white">
             {title}
           </h3>
          <p className="text-sm text-slate-500 max-w-xl">
            {description}
          </p>
        </div>

        {items.length === 0 ? (
          <div className="border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-2xl p-12 text-center">
            <p className="text-sm font-medium text-slate-400">No data available in this cluster</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {items.map((item) => {
              const isActive = item.key === selectedKey;
              
              return (
                <div
                  key={`${title}-${item.label}`}
                  onClick={isClickable ? () => handleSelect(item) : undefined}
                  className={`
                    group relative p-6 rounded-2xl border transition-all duration-200 cursor-pointer
                    ${isActive 
                      ? "border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/20 shadow-sm" 
                      : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-indigo-300 dark:hover:border-indigo-800 hover:shadow-md"
                    }
                  `}
                >
                  <div className="flex flex-col gap-4 h-full">
                    <div className="flex justify-between items-start">
                       <div className={`p-2 rounded-xl transition-colors ${isActive ? "bg-indigo-600 text-white" : "bg-slate-50 dark:bg-slate-950 text-slate-400 group-hover:text-indigo-500"}`}>
                          <BarChart className="h-4 w-4" />
                       </div>
                    </div>

                    <div className="space-y-1">
                      <h4 className="text-lg font-bold text-slate-800 dark:text-white leading-tight">
                        {item.label}
                      </h4>
                      <div className="flex items-center gap-2">
                        <span className={`text-2xl font-bold ${isActive ? "text-indigo-600 dark:text-indigo-400" : "text-slate-900 dark:text-white"}`}>
                          {item.count.toLocaleString("id-ID")}
                        </span>
                        <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                          Records
                        </span>
                      </div>
                    </div>

                    <div className={`h-1 w-full rounded-full transition-colors ${isActive ? "bg-indigo-500" : "bg-slate-100 dark:bg-slate-800 group-hover:bg-indigo-200 dark:group-hover:bg-indigo-900/30"}`} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
