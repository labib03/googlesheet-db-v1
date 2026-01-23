"use client";

import { Button } from "@/components/ui/button";
import { RefreshButton } from "@/components/refresh-button";
import { Eraser, X, Copy } from "lucide-react";
import { Gender, kelas } from "@/lib/constants";
import { MultiSelectCustom } from "./components/multi-select-custom";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Info } from "lucide-react";

interface DashboardFiltersProps {
  filters: {
    filterDesa: string[];
    filterKelompok: string[];
    filterGender: string;
    filterJenjangKelas: string[];
    filterNama: string;
    showDuplicates: boolean;
    setFilterDesa: (v: string[]) => void;
    setFilterKelompok: (v: string[]) => void;
    setFilterGender: (v: string) => void;
    setFilterJenjangKelas: (v: string[]) => void;
    setFilterNama: (v: string) => void;
    setShowDuplicates: (v: boolean) => void;
  };
  options: {
    desaOptions: string[];
    kelompokOptions: string[];
  };
  status: {
    isFiltered: boolean;
  };
  actions: {
    handleStartTransition: (fn: () => void) => void;
    resetFilters: () => void;
    setCurrentPage: (p: number) => void;
  };
  pagination: {
    currentPage: number;
    totalPages: number;
    pageSize: number;
  };
  totalCount: number;
  filteredCount: number;
}

import { memo } from "react";

export const DashboardFilters = memo(function DashboardFilters({
  filters,
  options,
  status,
  actions,
  pagination,
  totalCount,
  filteredCount,
}: DashboardFiltersProps) {
  const {
    filterDesa,
    filterKelompok,
    filterGender,
    filterJenjangKelas,
    filterNama,
    showDuplicates,
    setFilterDesa,
    setFilterKelompok,
    setFilterGender,
    setFilterJenjangKelas,
    setFilterNama,
    setShowDuplicates,
  } = filters;

  const startRange = (pagination.currentPage - 1) * pagination.pageSize + 1;
  const endRange = Math.min(
    pagination.currentPage * pagination.pageSize,
    filteredCount
  );

  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
      <div className="flex items-center gap-3">
        <div className="h-5 w-1 bg-indigo-600 rounded-full" />
        <h2 className="text-sm font-extrabold text-slate-800 dark:text-slate-100 uppercase tracking-tight">
          Filter Data
        </h2>
      </div>

      <TooltipProvider>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Desa */}
          <div className="space-y-1.5 flex flex-col">
            <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-1 inline-flex items-center gap-1">
              Desa
              {showDuplicates && <Info className="w-3 h-3 text-indigo-400" />}
            </label>
            <Tooltip delayDuration={300}>
              <TooltipTrigger asChild>
                <div className="w-full">
                  <MultiSelectCustom
                    disabled={showDuplicates}
                    options={options.desaOptions}
                    value={filterDesa}
                    placeholder="Semua Desa"
                    onChange={(nextDesa) => {
                      actions.handleStartTransition(() => {
                        setFilterDesa(nextDesa);
                        actions.setCurrentPage(1);
                      });
                    }}
                  />
                </div>
              </TooltipTrigger>
              {showDuplicates && (
                <TooltipContent side="bottom" className="max-w-[200px] text-xs">
                  Field bisa diklik ketika tombol show duplicate tidak aktif
                </TooltipContent>
              )}
            </Tooltip>
          </div>

          {/* Kelompok */}
          <div className="space-y-1.5 flex flex-col">
            <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-1 inline-flex items-center gap-1">
              Kelompok
              {showDuplicates && <Info className="w-3 h-3 text-indigo-400" />}
            </label>
            <Tooltip delayDuration={300}>
              <TooltipTrigger asChild>
                <div className="w-full">
                  <MultiSelectCustom
                    disabled={showDuplicates}
                    options={options.kelompokOptions}
                    value={filterKelompok}
                    placeholder="Semua Kelompok"
                    onChange={(nextKelompok) => {
                      actions.handleStartTransition(() => {
                        setFilterKelompok(nextKelompok);
                        actions.setCurrentPage(1);
                      });
                    }}
                  />
                </div>
              </TooltipTrigger>
              {showDuplicates && (
                <TooltipContent side="bottom" className="max-w-[200px] text-xs">
                  Field bisa diklik ketika tombol show duplicate tidak aktif
                </TooltipContent>
              )}
            </Tooltip>
          </div>

          {/* Gender */}
          <div className="space-y-1.5 flex flex-col">
            <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-1 inline-flex items-center gap-1">
              Jenis Kelamin
              {showDuplicates && <Info className="w-3 h-3 text-indigo-400" />}
            </label>
            <Tooltip delayDuration={300}>
              <TooltipTrigger asChild>
                <div className="w-full">
                  <select
                    disabled={showDuplicates}
                    className={`w-full h-11 border rounded-xl text-sm px-3 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                      filterGender
                        ? "bg-indigo-50/30 dark:bg-indigo-950/20 border-indigo-200/60 dark:border-indigo-800/60 text-indigo-700 dark:text-indigo-300 font-semibold shadow-sm shadow-indigo-100/10"
                        : "bg-white dark:bg-slate-900/50 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-400 dark:hover:border-slate-600"
                    }`}
                    value={filterGender}
                    onChange={(e) => {
                      const nextGender = e.target.value;
                      actions.handleStartTransition(() => {
                        setFilterGender(nextGender);
                        actions.setCurrentPage(1);
                      });
                    }}
                  >
                    <option value="" className="text-slate-500 font-medium">Semua Gender</option>
                    {Gender.map((g) => (
                      <option key={g} value={g} className="text-slate-900 dark:text-slate-200">
                        {g}
                      </option>
                    ))}
                  </select>
                </div>
              </TooltipTrigger>
              {showDuplicates && (
                <TooltipContent side="bottom" className="max-w-[200px] text-xs">
                  Field bisa diklik ketika tombol show duplicate tidak aktif
                </TooltipContent>
              )}
            </Tooltip>
          </div>

          {/* Jenjang */}
          <div className="space-y-1.5 flex flex-col">
            <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-1 inline-flex items-center gap-1">
              Jenjang
              {showDuplicates && <Info className="w-3 h-3 text-indigo-400" />}
            </label>
            <Tooltip delayDuration={300}>
              <TooltipTrigger asChild>
                <div className="w-full">
                  <MultiSelectCustom
                    disabled={showDuplicates}
                    options={kelas}
                    value={filterJenjangKelas}
                    placeholder="Semua Jenjang"
                    onChange={(nextJenjang) => {
                      actions.handleStartTransition(() => {
                        setFilterJenjangKelas(nextJenjang);
                        actions.setCurrentPage(1);
                      });
                    }}
                  />
                </div>
              </TooltipTrigger>
              {showDuplicates && (
                <TooltipContent side="bottom" className="max-w-[200px] text-xs">
                  Field bisa diklik ketika tombol show duplicate tidak aktif
                </TooltipContent>
              )}
            </Tooltip>
          </div>

          {/* Nama */}
          <div className="space-y-1.5 flex flex-col">
            <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-1 inline-flex items-center gap-1">
              Cari Nama
              {showDuplicates && <Info className="w-3 h-3 text-indigo-400" />}
            </label>
            <Tooltip delayDuration={300}>
              <TooltipTrigger asChild>
                <div className="relative w-full">
                  <input
                    type="text"
                    disabled={showDuplicates}
                    placeholder="Ex: Fulan..."
                    className={`w-full h-11 border rounded-xl text-sm px-3 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none placeholder:text-slate-500 dark:placeholder:text-slate-400 disabled:opacity-50 disabled:cursor-not-allowed ${
                      filterNama
                        ? "bg-indigo-50/30 dark:bg-indigo-950/20 border-indigo-200/60 dark:border-indigo-800/60 text-indigo-700 dark:text-indigo-300 font-semibold shadow-sm shadow-indigo-100/10"
                        : "bg-white dark:bg-slate-900/50 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-400 dark:hover:border-slate-600"
                    }`}
                    value={filterNama}
                    onChange={(e) => {
                      setFilterNama(e.target.value);
                      actions.setCurrentPage(1);
                    }}
                  />
                  {filterNama && !showDuplicates && (
                    <button
                      onClick={() => setFilterNama("")}
                      className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </TooltipTrigger>
              {showDuplicates && (
                <TooltipContent side="bottom" className="max-w-[200px] text-xs">
                  Field bisa diklik ketika tombol show duplicate tidak aktif
                </TooltipContent>
              )}
            </Tooltip>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={actions.resetFilters}
              variant="outline"
              size="sm"
              className="text-slate-800 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 font-medium text-sm rounded-lg border-slate-200 flex items-center gap-2"
            >
              <Eraser className="w-4 h-4" />
              Reset Filters
            </Button>

            <Tooltip delayDuration={300}>
              <TooltipTrigger asChild>
                <div className="inline-block">
                  <Button
                    onClick={() => {
                      actions.handleStartTransition(() => {
                        setShowDuplicates(!showDuplicates);
                        actions.setCurrentPage(1);
                      });
                    }}
                    disabled={status.isFiltered}
                    variant={showDuplicates ? "default" : "outline"}
                    size="sm"
                    className={`font-medium text-sm rounded-lg flex items-center gap-2 transition-all duration-200 ${
                      showDuplicates
                        ? "bg-indigo-600 hover:bg-indigo-700 text-white border-transparent shadow-md shadow-indigo-200 dark:shadow-none"
                        : "text-slate-800 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 border-slate-200"
                    } disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed`}
                  >
                    <Copy className="w-4 h-4" />
                    {showDuplicates ? "Showing Duplicates" : "Check Duplicate Data"}
                  </Button>
                </div>
              </TooltipTrigger>
              {status.isFiltered && (
                <TooltipContent side="top" className="max-w-[220px] text-xs">
                  Bisa di klik ketika tidak ada filter yang aktif
                </TooltipContent>
              )}
            </Tooltip>

            <RefreshButton />
          </div>
          {(status.isFiltered || showDuplicates) && (
            <span className="text-[11px] font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/30 px-2 py-0.5 rounded-full inline-flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse" />
              {showDuplicates ? "Duplicate View" : "Filtered View"}
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-800/50 text-[11px] sm:text-xs text-slate-500 font-medium">
          <div className="flex items-center gap-2">
            <span className="bg-white dark:bg-slate-800 px-2 py-1 rounded-md border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 shadow-sm">
              Total: <span className="font-bold text-indigo-600 dark:text-indigo-400">{filteredCount.toLocaleString("id-ID")}</span> dari <span className="font-semibold">{totalCount.toLocaleString("id-ID")}</span> data
            </span>
            <span className="hidden sm:inline text-slate-300 dark:text-slate-700">|</span>
            <span className="bg-white dark:bg-slate-800 px-2 py-1 rounded-md border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 shadow-sm">
              Menampilkan data <span className="font-bold">{startRange}-{endRange}</span>
            </span>
          </div>
          
          <div className="bg-indigo-50 dark:bg-indigo-950/20 px-2 py-1 rounded-md border border-indigo-100/50 dark:border-indigo-800/50 text-indigo-700 dark:text-indigo-300 shadow-sm">
            Halaman <span className="font-bold">{pagination.currentPage}</span> dari <span className="font-bold">{pagination.totalPages}</span>
          </div>
        </div>
      </TooltipProvider>
    </div>
  );
});

