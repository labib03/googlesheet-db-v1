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
import { getCellValue, capitalizeWords } from "@/lib/helper";
import { COLUMNS } from "@/lib/constants";

interface DashboardTableProps {
  data: SheetRow[];
  headers: string[];
  currentPage: number;
  pageSize: number;
  isEnableEdit: boolean;
  isEnableDelete: boolean;
}

export function DashboardTable({
  data,
  headers,
  currentPage,
  pageSize,
  isEnableEdit,
  isEnableDelete,
}: DashboardTableProps) {
  const isAnyActionEnabled = isEnableEdit || isEnableDelete;
  
  const getValue = (header: string, value: string) => {
    if (header === COLUMNS.NAMA || header === COLUMNS.DESA)
      return capitalizeWords(String(value));
    return value;
  };

  return (
    <div className="hidden md:block overflow-hidden bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative">
      <Table>
        <TableHeader className="bg-slate-50 dark:bg-slate-950/50">
          <TableRow className="hover:bg-transparent border-slate-200 dark:border-slate-800">
            <TableHead className="w-16 text-center font-semibold text-slate-500 text-xs tracking-wider">
              ID
            </TableHead>
            {headers.map((header) => (
              <TableHead
                key={header}
                className="font-semibold text-slate-500 text-xs tracking-wider whitespace-nowrap"
              >
                {header}
              </TableHead>
            ))}
            <TableHead className="font-semibold text-slate-500 text-xs tracking-wider whitespace-nowrap text-center">
              AGE
            </TableHead>
            {isAnyActionEnabled && (
              <TableHead className="font-semibold text-indigo-500 text-xs tracking-wider text-center">
                ACTIONS
              </TableHead>
            )}
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
                <TableCell className="text-center font-medium text-xs text-slate-400">
                  {(currentPage - 1) * pageSize + index + 1}
                </TableCell>
                {headers.map((header) => (
                  <TableCell
                    key={`${originalIndex}-${header}`}
                    className="text-sm text-slate-600 dark:text-slate-300 py-3 px-4"
                  >
                    {getValue(header, String(row[header] || ""))}
                  </TableCell>
                ))}
                <TableCell className="text-center text-sm font-medium text-slate-600 dark:text-slate-300">
                  {rowAge}
                </TableCell>
                {isAnyActionEnabled && (
                  <TableCell className="py-2">
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
                )}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
