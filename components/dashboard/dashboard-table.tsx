"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SheetRow } from "@/lib/google-sheets";
import { DataDetailDialog } from "@/components/data-detail-dialog";
import { EditDataDialog } from "@/components/edit-data-dialog";
import { DeleteDataDialog } from "@/components/delete-data-dialog";
import { getCellValue, capitalizeWords, formatDate } from "@/lib/helper";
import { COLUMNS, ADDITIONAL_INFO_COLUMNS, ADDITIONAL_INFO_SHORT_LABELS } from "@/lib/constants";
import { useViewConfig } from "@/context/view-config-context";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Eye, Pencil, Trash2 } from "lucide-react";

interface DashboardTableProps {
  data: SheetRow[];
  headers: string[];
  currentPage: number;
  pageSize: number;
  isEnableEdit: boolean;
  isEnableDelete: boolean;
  ignoreViewConfig?: boolean;
  selectedIndices?: number[];
  onToggleSelection?: (sheetIndex: number) => void;
}

import { memo, useState, useRef } from "react";

interface ActionCellProps {
  row: SheetRow;
  rowNama: string;
  originalIndex: number;
  ignoreViewConfig?: boolean;
  isEnableEdit: boolean;
  isEnableDelete: boolean;
}

function ActionCell({
  row,
  rowNama,
  originalIndex,
  ignoreViewConfig,
  isEnableEdit,
  isEnableDelete,
}: ActionCellProps) {
  const [popoverOpen, setPopoverOpen] = useState(false);
  
  const detailTriggerRef = useRef<HTMLDivElement>(null);
  const deleteTriggerRef = useRef<HTMLButtonElement>(null);

  const handleDetailClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPopoverOpen(false);
    setTimeout(() => {
      detailTriggerRef.current?.click();
    }, 50);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPopoverOpen(false);
    setTimeout(() => {
      deleteTriggerRef.current?.click();
    }, 50);
  };

  return (
    <TableCell className="py-2 px-2 text-center">
      {/* Hidden Dialogs at row level so they never unmount when popover closes! */}
      <div className="hidden" aria-hidden="true">
        <DataDetailDialog
          row={row}
          title={`Detail ${rowNama || "Data"}`}
          ignoreViewConfig={ignoreViewConfig}
        >
          <div ref={detailTriggerRef} />
        </DataDetailDialog>

        {isEnableDelete && (
          <DeleteDataDialog
            rowIndex={originalIndex + 2}
            dataName={capitalizeWords(rowNama || "Data")}
          >
            <button ref={deleteTriggerRef} />
          </DeleteDataDialog>
        )}
      </div>

      <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all cursor-pointer active:scale-95"
          >
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">Aksi</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent 
          align="start" 
          className="w-40 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-xl font-outfit"
        >
          <div className="flex flex-col gap-0.5">
            <button 
              type="button"
              onClick={handleDetailClick}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-xl transition-colors text-left cursor-pointer"
            >
              <Eye className="h-3.5 w-3.5 text-indigo-500" />
              <span>Lihat Detail</span>
            </button>

            {isEnableEdit && (
              <EditDataDialog row={row} rowIndex={originalIndex}>
                <button 
                  type="button"
                  onClick={() => setPopoverOpen(false)}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-sky-50 dark:hover:bg-sky-900/30 hover:text-sky-600 dark:hover:text-sky-400 rounded-xl transition-colors text-left cursor-pointer"
                >
                  <Pencil className="h-3.5 w-3.5 text-sky-500" />
                  <span>Edit Data</span>
                </button>
              </EditDataDialog>
            )}

            {isEnableDelete && (
              <button 
                type="button"
                onClick={handleDeleteClick}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl transition-colors text-left cursor-pointer"
              >
                <Trash2 className="h-3.5 w-3.5 text-rose-500" />
                <span>Hapus Data</span>
              </button>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </TableCell>
  );
}

export const DashboardTable = memo(function DashboardTable({
  data,
  headers,
  currentPage,
  pageSize,
  isEnableEdit,
  isEnableDelete,
  ignoreViewConfig,
  selectedIndices = [],
  onToggleSelection,
}: DashboardTableProps) {
  const { config } = useViewConfig();
  const visibleHeaders = ignoreViewConfig
    ? headers
    : headers.filter((h) => config.tableColumns.includes(h));
  const isUmurVisible =
    ignoreViewConfig || config.tableColumns.includes(COLUMNS.UMUR);

  // AdditionalInfo columns: admin sees all, public sees only those toggled in tableColumns
  const visibleAiColumns = ignoreViewConfig
    ? [...ADDITIONAL_INFO_COLUMNS]
    : ADDITIONAL_INFO_COLUMNS.filter((col) => config.tableColumns.includes(`_ai_${col}`));

  const getValue = (header: string, value: string) => {
    if (
      header === COLUMNS.NAMA ||
      header === COLUMNS.AYAH ||
      header === COLUMNS.IBU
    ) {
      return capitalizeWords(String(value));
    }

    if (header === COLUMNS.TANGGAL_LAHIR) {
      return formatDate(String(value), "dd MMMM yyyy");
    }

    return value;
  };

  return (
    <div className="hidden md:block overflow-x-auto bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative">
      <Table className="w-full table-fixed">
        <TableHeader className="bg-slate-50 dark:bg-slate-950/50">
          <TableRow className="border-slate-200 dark:border-slate-800 min-h-9 bg-indigo-500">
            {onToggleSelection && (
              <TableHead className="w-10 h-14 text-center px-2 sticky top-0 z-10 bg-indigo-500">
                {/* Select All could go here, but user asked for one-by-one */}
              </TableHead>
            )}
            <TableHead className="w-24 font-semibold text-white text-xs tracking-wider text-center px-2 sticky top-0 z-10 bg-indigo-500">
              ACTIONS
            </TableHead>
            <TableHead className="w-10 h-14 text-center font-semibold text-white text-xs tracking-wider px-1 sticky top-0 z-10 bg-indigo-500">
              #
            </TableHead>
            {visibleHeaders.map((header) => {
              const hLower = header.toLowerCase();
              let widthClass = "w-32"; // Default
              if (hLower.includes("tanggal")) widthClass = "w-42";
              if (hLower.includes("nama")) widthClass = "w-50";
              if (hLower.includes("hobi")) widthClass = "w-64";
              if (hLower.includes("skill") || hLower.includes("cita"))
                widthClass = "w-72";
              if (hLower.includes("gender") || hLower.includes("desa"))
                widthClass = "w-32";

              return (
                <TableHead
                  key={header}
                  className={`${widthClass} font-semibold text-white text-xs tracking-wider whitespace-nowrap px-4 sticky top-0 z-10 bg-indigo-500`}
                >
                  {header.toUpperCase()}
                </TableHead>
              );
            })}
            {isUmurVisible && (
              <TableHead className="w-16 font-semibold text-white text-xs tracking-wider whitespace-nowrap text-center px-2 sticky top-0 z-10 bg-indigo-500">
                UMUR
              </TableHead>
            )}
            {visibleAiColumns.map((col) => (
              <TableHead
                key={`ai-${col}`}
                className="w-40 font-semibold text-white text-xs tracking-wider whitespace-normal px-4 bg-teal-600 sticky top-0 z-10"
                title={col}
              >
                {(ADDITIONAL_INFO_SHORT_LABELS[col] || col).toUpperCase()}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row, index) => {
            const originalIndex = Number(row["_index"]);
            const rowAge = getCellValue(row, COLUMNS.UMUR) || "-";
            const rowNama = getCellValue(row, COLUMNS.NAMA);
            const isSelected = onToggleSelection && selectedIndices.includes(originalIndex + 2);

            return (
              <TableRow
                key={originalIndex}
                className={`group hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors border-slate-100 dark:border-slate-800/50 ${onToggleSelection && selectedIndices.includes(originalIndex + 2) ? "bg-indigo-50/50 dark:bg-indigo-900/10" : ""
                  }`}
              >
                {onToggleSelection && (
                  <TableCell className="text-center px-2">
                    <Checkbox
                      checked={selectedIndices.includes(originalIndex + 2)}
                      onCheckedChange={() => onToggleSelection?.(originalIndex + 2)}
                      className={selectedIndices.includes(originalIndex + 2) ? "border-indigo-500" : ""}
                    />
                  </TableCell>
                )}
                <ActionCell
                  row={row}
                  rowNama={rowNama || ""}
                  originalIndex={originalIndex}
                  ignoreViewConfig={ignoreViewConfig}
                  isEnableEdit={isEnableEdit}
                  isEnableDelete={isEnableDelete}
                />
                <TableCell className="text-center font-medium text-[10px] text-slate-400 px-1">
                  {(currentPage - 1) * pageSize + index + 1}
                </TableCell>
                {visibleHeaders.map((header) => (
                  <TableCell
                    key={`${originalIndex}-${header}`}
                    className="text-sm text-slate-600 dark:text-slate-300 py-3 px-4 whitespace-normal break-words leading-relaxed"
                  >
                    {getValue(header, String(row[header] || ""))}
                  </TableCell>
                ))}
                {isUmurVisible && (
                  <TableCell className="text-center text-sm font-medium text-slate-600 dark:text-slate-300 px-2">
                    {rowAge}
                  </TableCell>
                )}
                {visibleAiColumns.map((col) => (
                  <TableCell
                    key={`${originalIndex}-ai-${col}`}
                    className="text-sm text-teal-700 dark:text-teal-300 py-3 px-4 whitespace-normal break-words leading-relaxed bg-teal-50/30 dark:bg-teal-950/10"
                  >
                    {String(row[`_ai_${col}`] || "-")}
                  </TableCell>
                ))}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
});
