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
import { COLUMNS } from "@/lib/constants";
import { useViewConfig } from "@/context/view-config-context";

interface DashboardTableProps {
  data: SheetRow[];
  headers: string[];
  currentPage: number;
  pageSize: number;
  isEnableEdit: boolean;
  isEnableDelete: boolean;
}

import { memo } from "react";

export const DashboardTable = memo(function DashboardTable({
  data,
  headers,
  currentPage,
  pageSize,
  isEnableEdit,
  isEnableDelete,
}: DashboardTableProps) {
  const { config } = useViewConfig();
  const visibleHeaders = headers.filter(h => config.tableColumns.includes(h));

  const getValue = (header: string, value: string) => {
    if (header === COLUMNS.NAMA || header === COLUMNS.DESA) {
      return capitalizeWords(String(value))
    };

    if (header === COLUMNS.TANGGAL_LAHIR) {
      return formatDate(String(value), "dd MMMM yyyy")
    }

    return value;
  };

  return (
    <div className="hidden md:block overflow-x-auto bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative">
      <Table className="w-full table-fixed">
        <TableHeader className="bg-slate-50 dark:bg-slate-950/50">
          <TableRow className="border-slate-200 dark:border-slate-800 min-h-9 bg-indigo-500">
            <TableHead className="w-12 h-14 text-center font-semibold text-white text-xs tracking-wider px-2">
              ID
            </TableHead>
            {visibleHeaders.map((header) => {
              const hLower = header.toLowerCase();
              let widthClass = "w-32"; // Default
              if (hLower.includes("tanggal")) widthClass = "w-42";
              if (hLower.includes("nama")) widthClass = "w-50";
              if (hLower.includes("hobi")) widthClass = "w-64";
              if (hLower.includes("skill") || hLower.includes("cita")) widthClass = "w-72";
              if (hLower.includes("gender") || hLower.includes("desa")) widthClass = "w-32";
              
              return (
                <TableHead
                  key={header}
                  className={`${widthClass} font-semibold text-white text-xs tracking-wider whitespace-nowrap px-4`}
                >
                  {header.toUpperCase()}
                </TableHead>
              );
            })}
            <TableHead className="w-16 font-semibold text-white text-xs tracking-wider whitespace-nowrap text-center px-2">
              UMUR
            </TableHead>
            <TableHead className="w-24 font-semibold text-white text-xs tracking-wider text-center px-2">
              ACTIONS
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row, index) => {
            const originalIndex = Number(row["_index"]);
            const rowAge = getCellValue(row, COLUMNS.UMUR) || "-";
            const rowNama = getCellValue(row, COLUMNS.NAMA);

            return (
              <TableRow
                key={originalIndex}
                className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors border-slate-100 dark:border-slate-800/50"
              >
                <TableCell className="text-center font-medium text-xs text-slate-400 px-2">
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
                <TableCell className="text-center text-sm font-medium text-slate-600 dark:text-slate-300 px-2">
                  {rowAge}
                </TableCell>
                <TableCell className="py-2 px-2">
                  <div className="flex justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <DataDetailDialog
                      row={row}
                      title={`Detail ${rowNama || "Data"}`}
                    />
                    {isEnableEdit && (
                      <EditDataDialog row={row} rowIndex={originalIndex} />
                    )}
                    {isEnableDelete && (
                      <DeleteDataDialog
                        rowIndex={originalIndex + 2}
                        dataName={capitalizeWords(rowNama || "Data")}
                      />
                    )}
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
});
