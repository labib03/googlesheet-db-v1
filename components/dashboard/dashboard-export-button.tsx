"use client";

import { useViewConfig } from "@/context/view-config-context";
import { ExportButton } from "./export-button";
import { SheetRow } from "@/lib/google-sheets";
import { COLUMNS } from "@/lib/constants";

interface DashboardExportButtonProps {
  data: SheetRow[];
  headers: string[];
}

export function DashboardExportButton({ data, headers }: DashboardExportButtonProps) {
  const { config, isCustomized } = useViewConfig();
  
  // Calculate which headers to export based on table view settings
  // If use has customized table columns, use only those.
  // Otherwise, use all headers + Umur (default view behavior).
  
  const hasCustomTableCols = isCustomized("tableColumns");
  
  const exportHeaders = hasCustomTableCols 
    ? [...headers, COLUMNS.UMUR].filter(h => config.tableColumns.includes(h))
    : [...headers, COLUMNS.UMUR];

  return (
    <ExportButton 
      data={data} 
      headers={exportHeaders} 
      filename={`export-generus-${new Date().toISOString().split('T')[0]}.csv`}
      includeNo={false}
    />
  );
}
