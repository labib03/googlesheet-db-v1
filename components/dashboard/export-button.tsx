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
import { useState } from "react";
import * as XLSX from "xlsx";

interface ExportButtonProps {
  data: SheetRow[];
  headers: string[];
  filename?: string;
  includeNo?: boolean;
}

type ExportFormat = "csv" | "xlsx";

export function ExportButton({
  data,
  headers,
  filename = "generus-data",
  includeNo = true,
}: ExportButtonProps) {
  const [open, setOpen] = useState(false);

  const getExportData = () => {
    const finalHeaders = includeNo ? ["No", ...headers] : headers;

    const rows = data.map((row, index) => {
      const obj: Record<string, string | number> = {};
      finalHeaders.forEach((header) => {
        if (header === "No" && includeNo) {
          obj[header] = index + 1;
        } else {
          obj[header] = getCellValue(row, header) || "-";
        }
      });
      return obj;
    });

    return { finalHeaders, rows };
  };

  const handleExport = (format: ExportFormat) => {
    const { finalHeaders, rows } = getExportData();
    const dateStr = new Date().toISOString().split("T")[0];
    const baseFilename = filename.replace(/\.(csv|xlsx?)$/i, "");
    const fullFilename = `${baseFilename}-${dateStr}`;

    if (format === "csv") {
      exportCSV(finalHeaders, rows, `${fullFilename}.csv`);
    } else {
      exportExcel(finalHeaders, rows, `${fullFilename}.xlsx`);
    }

    setOpen(false);
  };

  const exportCSV = (
    headers: string[],
    rows: Record<string, string | number>[],
    filename: string,
  ) => {
    const csvHeaders = headers.map((h) => `"${h}"`).join(",");
    const csvRows = rows.map((row) =>
      headers.map((h) => `"${String(row[h] ?? "")}"`).join(","),
    );

    const csvContent = [csvHeaders, ...csvRows].join("\n");
    // Add BOM for UTF-8 compatibility in Excel
    const bom = "\uFEFF";
    const blob = new Blob([bom + csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    triggerDownload(blob, filename);
  };

  const exportExcel = (
    headers: string[],
    rows: Record<string, string | number>[],
    filename: string,
  ) => {
    const ws = XLSX.utils.json_to_sheet(rows, { header: headers });

    // Auto-size columns based on content
    const colWidths = headers.map((header) => {
      const maxDataLength = rows.reduce((max, row) => {
        const val = String(row[header] ?? "");
        return Math.max(max, val.length);
      }, header.length);
      return { wch: Math.min(maxDataLength + 2, 40) };
    });
    ws["!cols"] = colWidths;

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Data Generus");

    const excelBuffer = XLSX.write(wb, {
      bookType: "xlsx",
      type: "array",
    });

    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    triggerDownload(blob, filename);
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
    <Popover open={open} onOpenChange={setOpen}>
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
            onClick={() => handleExport("csv")}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left group"
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
            onClick={() => handleExport("xlsx")}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left group"
          >
            <div className="p-1.5 bg-blue-50 dark:bg-blue-950/30 rounded-lg group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 transition-colors">
              <FileSpreadsheet className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="font-medium">Export Excel</p>
              <p className="text-[11px] text-slate-400 dark:text-slate-500">
                Format .xlsx, auto-width
              </p>
            </div>
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
