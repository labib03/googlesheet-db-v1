"use client";

import { SheetRow } from "@/lib/google-sheets";
import { DataDetailDialog } from "@/components/data-detail-dialog";
import { EditDataDialog } from "@/components/edit-data-dialog";
import { DeleteDataDialog } from "@/components/delete-data-dialog";
import { getCellValue, capitalizeWords } from "@/lib/helper";
import { COLUMNS } from "@/lib/constants";
import { Pencil, Trash2 } from "lucide-react";
import { motion } from "framer-motion";

interface DashboardCardsProps {
  data: SheetRow[];
  headers: string[];
  currentPage: number;
  pageSize: number;
  isEnableEdit: boolean;
  isEnableDelete: boolean;
}

const cardVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { 
    opacity: 1, 
    y: 0, 
    transition: { 
        duration: 0.4, 
        ease: "easeOut" 
    } 
  },
};

export function DashboardCards({
  data,
  headers,
  currentPage,
  pageSize,
  isEnableEdit,
  isEnableDelete,
}: DashboardCardsProps) {
  const isAnyActionEnabled = isEnableEdit || isEnableDelete;

  const getKeyLabel = (label: string) => {
    const map: Record<string, string> = {
      [COLUMNS.NAMA]: "Nama Lengkap",
      [COLUMNS.DESA]: "Desa",
      [COLUMNS.KELOMPOK]: "Kelompok",
      [COLUMNS.GENDER]: "Jenis Kelamin",
      [COLUMNS.HOBI]: "Hobi",
      [COLUMNS.SKILL]: "Skill / Cita-cita",
      [COLUMNS.TANGGAL_LAHIR]: "Tanggal Lahir",
    };
    return map[label] || label;
  };

  const getValueDisplay = (header: string, value: string) => {
    if (header === COLUMNS.NAMA || header === COLUMNS.DESA)
      return capitalizeWords(String(value));
    return value;
  };

  const generateBgChipJenjang = (jenjang: string) => {
    switch (jenjang.toLowerCase()) {
      case "paud":
        return "bg-emerald-300 text-emerald-900";
      case "caberawit a":
        return "bg-stone-300 text-stone-900";
      case "caberawit b":
        return "bg-sky-300 text-sky-900";
      case "caberawit c":
        return "bg-amber-300 text-amber-900";
      case "pra remaja":
        return "bg-cyan-300 text-cyan-900";
      case "remaja":
        return "bg-teal-300 text-teal-900";
      case "pra nikah":
        return "bg-rose-300 text-rose-900";
      default:
        return "bg-gray-300 text-gray-900";
    }
  };

  return (
    <div className="md:hidden grid gap-6">
      {data.map((row, index) => {
        const originalIndex = Number(row["_index"]);
        const rowNamaRaw = getCellValue(row, COLUMNS.NAMA);
        const rowJenjang = getCellValue(row, COLUMNS.JENJANG);
        const rowUmur = getCellValue(row, COLUMNS.UMUR);

        return (
          <motion.div
            key={originalIndex}
            variants={cardVariants}
            initial="hidden"
            animate="show"
            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col"
          >
            <DataDetailDialog
              row={row}
              title={`Detail ${capitalizeWords(rowNamaRaw) || "Data"}`}
            >
              <div className="p-5 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors grow">
                {/* Header */}
                <div className="flex items-start gap-4 mb-5 border-b border-slate-100 dark:border-slate-800 pb-5">
                  <div className="flex items-center justify-center w-12 h-12 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl text-indigo-600 font-bold text-lg shrink-0">
                    {(currentPage - 1) * pageSize + index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-lg text-slate-900 dark:text-white tracking-tight leading-tight whitespace-normal wrap-break-word">
                      {capitalizeWords(rowNamaRaw || "Data Generus")}
                    </h3>
                    <div className="flex flex-wrap gap-2 items-center mt-1.5">
                      {rowJenjang && (
                        <p
                          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${generateBgChipJenjang(
                            rowJenjang,
                          )}`}
                        >
                          {rowJenjang}
                        </p>
                      )}
                      <p className="text-[10px] font-medium text-slate-500 uppercase tracking-widest">
                        {rowUmur} Tahun
                      </p>
                    </div>
                  </div>
                </div>
                {/* Body */}
                <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                  {headers.slice(0, 7).map((header) => {
                    if (header === COLUMNS.NAMA) return null;
                    if (header === COLUMNS.TANGGAL_LAHIR) return null;

                    return (
                      <div key={header} className="flex flex-col">
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-0.5">
                          {getKeyLabel(header)}
                        </span>
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-200 leading-snug">
                          {getValueDisplay(header, String(row[header] || ""))}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </DataDetailDialog>
            {/* Actions */}
            {isAnyActionEnabled && (
              <div
                className={`grid ${isEnableEdit && isEnableDelete ? "grid-cols-2" : "grid-cols-1"} border-t border-slate-100 dark:border-slate-800`}
              >
                {isEnableEdit && (
                  <EditDataDialog row={row} rowIndex={originalIndex}>
                    <button
                      className={`w-full flex items-center justify-center gap-2 py-3.5 bg-indigo-50/50 dark:bg-indigo-950/10 text-indigo-600 dark:text-indigo-400 font-bold text-xs transition-colors hover:bg-indigo-100 dark:hover:bg-indigo-950/20 ${isEnableDelete ? "border-r border-slate-100 dark:border-slate-800" : ""}`}
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      Edit Data
                    </button>
                  </EditDataDialog>
                )}

                {isEnableDelete && (
                  <DeleteDataDialog
                    rowIndex={originalIndex + 2}
                    dataName={capitalizeWords(rowNamaRaw || "Data")}
                  >
                    <button className="w-full flex items-center justify-center gap-2 py-3.5 bg-rose-50/50 dark:bg-rose-950/10 text-rose-600 dark:text-rose-400 font-bold text-xs transition-colors hover:bg-rose-100 dark:hover:bg-rose-950/20">
                      <Trash2 className="w-3.5 h-3.5" />
                      Hapus
                    </button>
                  </DeleteDataDialog>
                )}
              </div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}
