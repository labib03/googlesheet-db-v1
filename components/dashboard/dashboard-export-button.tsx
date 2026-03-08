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

  const hasCustomTableCols = isCustomized("tableColumns");

  // Master data headers: filter by config if customized
  const exportHeaders = hasCustomTableCols
    ? [...headers, COLUMNS.UMUR].filter(h => config.tableColumns.includes(h))
    : [...headers, COLUMNS.UMUR];

  // AdditionalInfo columns: extract _ai_ prefixed entries from config, strip prefix for export
  const exportAiColumns = hasCustomTableCols
    ? config.tableColumns
      .filter(col => col.startsWith("_ai_"))
      .map(col => col.replace("_ai_", ""))
    : [];

  return (
    <ExportButton
      data={data}
      headers={exportHeaders}
      aiColumns={exportAiColumns}
      filename={`export-generus`}
      includeNo={false}
    />
  );
}

