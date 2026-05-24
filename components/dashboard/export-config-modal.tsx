"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  FileSpreadsheet,
  Layers,
  MapPin,
  Users,
  GraduationCap,
  Check,
  Loader2,
} from "lucide-react";
import { ExportMode } from "@/lib/excel-generator";
import { motion } from "framer-motion";

interface ExportConfigModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onExport: (mode: ExportMode) => Promise<void>;
  dataCount: number;
  groupCounts: {
    desa: number;
    kelompok: number;
    jenjang: number;
  };
}

interface ExportOption {
  mode: ExportMode;
  icon: React.ReactNode;
  title: string;
  description: string;
  sheetPreview: string;
}

export function ExportConfigModal({
  open,
  onOpenChange,
  onExport,
  dataCount,
  groupCounts,
}: ExportConfigModalProps) {
  const [selectedMode, setSelectedMode] = useState<ExportMode>("single");
  const [isExporting, setIsExporting] = useState(false);

  const options: ExportOption[] = [
    {
      mode: "single",
      icon: <FileSpreadsheet className="w-5 h-5" />,
      title: "Gabung Semua Data",
      description: "Satu sheet utama, di-sort berdasarkan Desa → Kelompok → Jenjang",
      sheetPreview: "1 sheet",
    },
    {
      mode: "by-desa",
      icon: <MapPin className="w-5 h-5" />,
      title: "Pisah per Desa",
      description: "Beda sheet untuk tiap Desa",
      sheetPreview: `${groupCounts.desa} sheet`,
    },
    {
      mode: "by-kelompok",
      icon: <Users className="w-5 h-5" />,
      title: "Pisah per Kelompok",
      description: "Beda sheet untuk tiap Kelompok",
      sheetPreview: `${groupCounts.kelompok} sheet`,
    },
    {
      mode: "by-jenjang",
      icon: <GraduationCap className="w-5 h-5" />,
      title: "Pisah per Jenjang Kelas",
      description: "Beda sheet untuk tiap Jenjang Kelas",
      sheetPreview: `${groupCounts.jenjang} sheet`,
    },
  ];

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await onExport(selectedMode);
      onOpenChange(false);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-md bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-0 overflow-hidden"
        showCloseButton={!isExporting}
      >
        {/* Accent bar */}
        <div className="h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500" />

        <div className="px-6 pt-5 pb-2">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900 dark:text-white font-syne tracking-tight flex items-center gap-2.5">
              <div className="p-2 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl">
                <Layers className="w-4.5 h-4.5 text-emerald-600 dark:text-emerald-400" />
              </div>
              Konfigurasi Unduh Data
            </DialogTitle>
            <DialogDescription className="text-slate-500 dark:text-slate-400 text-sm mt-1">
              Pilih format susunan file Excel yang Anda butuhkan.
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* Options */}
        <div className="px-6 py-3 space-y-2">
          {options.map((option, index) => {
            const isSelected = selectedMode === option.mode;
            return (
              <motion.button
                key={option.mode}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05, duration: 0.25 }}
                onClick={() => setSelectedMode(option.mode)}
                disabled={isExporting}
                className={`
                  w-full flex items-center gap-3.5 p-3.5 rounded-xl text-left transition-all duration-200 cursor-pointer group
                  ${isSelected
                    ? "bg-emerald-50 dark:bg-emerald-950/20 border-2 border-emerald-500 dark:border-emerald-600 shadow-sm shadow-emerald-100 dark:shadow-none"
                    : "bg-slate-50 dark:bg-slate-900 border-2 border-transparent hover:border-slate-200 dark:hover:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800/50"
                  }
                  ${isExporting ? "opacity-60 pointer-events-none" : ""}
                `}
              >
                {/* Icon */}
                <div
                  className={`
                    p-2.5 rounded-xl shrink-0 transition-colors duration-200
                    ${isSelected
                      ? "bg-emerald-500 text-white shadow-md shadow-emerald-200 dark:shadow-none"
                      : "bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-300 border border-slate-200 dark:border-slate-700"
                    }
                  `}
                >
                  {option.icon}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p
                    className={`font-semibold text-sm leading-tight ${
                      isSelected
                        ? "text-emerald-800 dark:text-emerald-300"
                        : "text-slate-700 dark:text-slate-200"
                    }`}
                  >
                    {option.title}
                  </p>
                  <p
                    className={`text-xs mt-0.5 leading-snug ${
                      isSelected
                        ? "text-emerald-600/80 dark:text-emerald-400/70"
                        : "text-slate-400 dark:text-slate-500"
                    }`}
                  >
                    {option.description}
                  </p>
                </div>

                {/* Sheet count badge */}
                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                      isSelected
                        ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                        : "bg-slate-200/60 dark:bg-slate-700/60 text-slate-500 dark:text-slate-400"
                    }`}
                  >
                    {option.sheetPreview}
                  </span>

                  {/* Check indicator */}
                  <div
                    className={`
                      w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-all duration-200
                      ${isSelected
                        ? "bg-emerald-500 text-white scale-100"
                        : "border-2 border-slate-300 dark:border-slate-600 scale-90 opacity-40"
                      }
                    `}
                  >
                    {isSelected && <Check className="w-3 h-3" strokeWidth={3} />}
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* Footer */}
        <DialogFooter className="px-6 py-4 bg-slate-50/50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800/50">
          <div className="flex items-center justify-between w-full gap-3">
            <p className="text-xs text-slate-400 dark:text-slate-500 hidden sm:block">
              <span className="font-semibold text-slate-600 dark:text-slate-300">
                {dataCount.toLocaleString("id-ID")}
              </span>{" "}
              data akan di-export
            </p>
            <div className="flex gap-2 ml-auto">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isExporting}
                className="rounded-xl border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-sm h-10 px-5"
              >
                Batal
              </Button>
              <Button
                onClick={handleExport}
                disabled={isExporting || dataCount === 0}
                className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm h-10 px-6 gap-2 shadow-lg shadow-emerald-200/50 dark:shadow-none transition-all hover:scale-[1.02] active:scale-95"
              >
                {isExporting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Memproses...
                  </>
                ) : (
                  <>
                    <FileSpreadsheet className="w-4 h-4" />
                    Unduh Sekarang
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
