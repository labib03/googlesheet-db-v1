"use client";

import { SheetRow } from "@/lib/google-sheets";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ExportButtonProps {
  data: SheetRow[];
  headers: string[];
  filename?: string;
}

export function ExportButton({ data, headers, filename = "generus-data.csv" }: ExportButtonProps) {
  const handleExport = () => {
    // Prepare headers and data
    const csvHeaders = ["No", ...headers, "Umur"].join(",");
    const csvRows = data.map((row, index) => {
      const values = headers.map((header) => {
        const val = row[header] ? String(row[header]).replace(/,/g, " ") : "-";
        return `"${val}"`;
      });
      return [index + 1, ...values, row["Umur"] || "-"].join(",");
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
      className="gap-2 rounded-xl h-10 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
    >
      <Download className="w-4 h-4 text-emerald-500" />
      Export Dataset
    </Button>
  );
}
