"use client";

import { SheetRow } from "@/lib/google-sheets";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { COLUMNS } from "@/lib/constants";
import { getCellValue } from "@/lib/helper";

interface ExportButtonProps {
  data: SheetRow[];
  headers: string[];
  filename?: string;
  includeNo?: boolean;
}

export function ExportButton({ 
  data, 
  headers, 
  filename = "generus-data.csv",
  includeNo = true 
}: ExportButtonProps) {
  const handleExport = () => {
    // Generate final headers
    // We don't automatically add Umur here anymore, it should be in 'headers' if desired
    const finalHeaders = includeNo ? ["No", ...headers] : headers;
    
    const csvHeaders = finalHeaders.map(h => `"${h}"`).join(",");
    const csvRows = data.map((row, index) => {
      const rowValues = finalHeaders.map((header) => {
        if (header === "No" && includeNo) {
          return index + 1;
        }
        
        // Use getCellValue for safety and case-insensitivity
        const val = getCellValue(row, header) || "-";
        return `"${val}"`;
      });
      return rowValues.join(",");
    });

    const csvContent = [csvHeaders, ...csvRows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Button
      variant="outline"
      onClick={handleExport}
      className="gap-2 rounded-xl h-10 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors shadow-sm"
    >
      <Download className="w-4 h-4 text-emerald-500" />
      Export Dataset
    </Button>
  );
}
