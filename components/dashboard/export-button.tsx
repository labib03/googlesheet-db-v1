"use client";

import { SheetRow } from "@/lib/google-sheets";
import { Download, FileSpreadsheet, FileText, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { getCellValue } from "@/lib/helper";
import { COLUMNS } from "@/lib/constants";
import { useState, useMemo } from "react";
import {
  generateExcelFile,
  ActiveFilters,
  ExportMode,
} from "@/lib/excel-generator";
import { ExportConfigModal } from "./export-config-modal";

export interface ExportButtonProps {
  data: SheetRow[];
  headers: string[];
  aiColumns?: string[];
  filename?: string;
  includeNo?: boolean;
  activeFilters?: ActiveFilters;
}

export function ExportButton({
  data,
  headers,
  aiColumns = [],
  filename = "generus-data",
  includeNo = true,
  activeFilters = { desa: [], kelompok: [], jenjang: [] },
}: ExportButtonProps) {
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  // Compute group counts for the modal preview
  const groupCounts = useMemo(() => {
    const desaSet = new Set<string>();
    const kelompokSet = new Set<string>();
    const jenjangSet = new Set<string>();

    data.forEach((row) => {
      const desa = getCellValue(row, COLUMNS.DESA);
      const kelompok = getCellValue(row, COLUMNS.KELOMPOK);
      const jenjang = getCellValue(row, COLUMNS.JENJANG);
      if (desa) desaSet.add(desa);
      if (kelompok) kelompokSet.add(kelompok);
      if (jenjang) jenjangSet.add(jenjang);
    });

    return {
      desa: desaSet.size,
      kelompok: kelompokSet.size,
      jenjang: jenjangSet.size,
    };
  }, [data]);

  // CSV export — direct download (no modal)
  const handleExportCSV = () => {
    const masterHeaders = includeNo ? ["No", ...headers] : [...headers];
    const finalHeaders = [...masterHeaders, ...aiColumns];

    const rows = data.map((row, index) => {
      const obj: Record<string, string | number> = {};
      finalHeaders.forEach((header) => {
        if (header === "No" && includeNo) {
          obj[header] = index + 1;
        } else if (aiColumns.includes(header)) {
          obj[header] = String(row[`_ai_${header}`] || "-");
        } else {
          obj[header] = getCellValue(row, header) || "-";
        }
      });
      return obj;
    });

    const csvHeaders = finalHeaders.map((h) => `"${h}"`).join(",");
    const csvRows = rows.map((row) =>
      finalHeaders.map((h) => `"${String(row[h] ?? "")}"`).join(","),
    );
    const csvContent = [csvHeaders, ...csvRows].join("\n");
    const bom = "\uFEFF";
    const blob = new Blob([bom + csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const dateStr = new Date().toISOString().split("T")[0];
    const baseFilename = filename.replace(/\.(csv|xlsx?)$/i, "");
    triggerDownload(blob, `${baseFilename}-${dateStr}.csv`);
    setPopoverOpen(false);
  };

  // Excel export — open modal first
  const handleExcelClick = () => {
    setPopoverOpen(false);
    // Small delay to let popover close smoothly
    setTimeout(() => setModalOpen(true), 150);
  };

  // Called from modal when user confirms export
  const handleExcelExport = async (mode: ExportMode) => {
    const { blob, filename: dynamicFilename } = await generateExcelFile({
      mode,
      data,
      headers,
      aiColumns,
      activeFilters,
      includeNo,
    });

    triggerDownload(blob, dynamicFilename);
  };

  const triggerDownload = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="gap-2 rounded-xl h-10 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors shadow-sm"
          >
            <Download className="w-4 h-4 text-emerald-500" />
            Export
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-0.5" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          align="end"
          className="w-52 p-1.5 rounded-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl"
        >
          <div className="space-y-0.5">
            <button
              onClick={handleExportCSV}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left group cursor-pointer"
            >
              <div className="p-1.5 bg-emerald-50 dark:bg-emerald-950/30 rounded-lg group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/30 transition-colors">
                <FileText className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="font-medium">Export CSV</p>
                <p className="text-[11px] text-slate-400 dark:text-slate-500">
                  Format teks, ringan
                </p>
              </div>
            </button>

            <button
              onClick={handleExcelClick}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left group cursor-pointer"
            >
              <div className="p-1.5 bg-blue-50 dark:bg-blue-950/30 rounded-lg group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 transition-colors">
                <FileSpreadsheet className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="font-medium">Export Excel</p>
                <p className="text-[11px] text-slate-400 dark:text-slate-500">
                  Format .xlsx, multi-sheet
                </p>
              </div>
            </button>
          </div>
        </PopoverContent>
      </Popover>

      <ExportConfigModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        onExport={handleExcelExport}
        dataCount={data.length}
        groupCounts={groupCounts}
      />
    </>
  );
}
