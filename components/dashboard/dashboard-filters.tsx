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
    filterNoDob: boolean;
    setFilterDesa: (v: string[]) => void;
    setFilterKelompok: (v: string[]) => void;
    setFilterGender: (v: string) => void;
    setFilterJenjangKelas: (v: string[]) => void;
    setFilterNama: (v: string) => void;
    setShowDuplicates: (v: boolean) => void;
    setFilterNoDob: (v: boolean) => void;
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
  hideDuplicates?: boolean;
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
  hideDuplicates = false,
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
    filterNoDob,
    setFilterNoDob,
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

        {/* Action Sections */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-slate-100 dark:border-slate-800">
          
          {/* Section 1: System Controls */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 px-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">System Kontrol</span>
              <div className="h-px flex-1 bg-slate-100 dark:bg-slate-800" />
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={actions.resetFilters}
                variant="outline"
                size="sm"
                className="text-slate-700 dark:text-slate-300 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 font-semibold text-xs rounded-xl h-9 border-slate-200 dark:border-slate-800 flex items-center gap-2 transition-all"
              >
                <Eraser className="w-4 h-4" />
                Reset Filters
              </Button>
              <RefreshButton />
            </div>
          </div>

          {/* Section 2: Audit Data */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 px-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Audit Data</span>
              <div className="h-px flex-1 bg-slate-100 dark:bg-slate-800" />
            </div>
            <div className="flex flex-wrap gap-2">
              <Tooltip delayDuration={300}>
                <TooltipTrigger asChild>
                  <Button
                    onClick={() => {
                      actions.handleStartTransition(() => {
                        setFilterNoDob(!filterNoDob);
                        actions.setCurrentPage(1);
                      });
                    }}
                    variant={filterNoDob ? "default" : "outline"}
                    size="sm"
                    className={`font-semibold text-xs rounded-xl h-9 flex items-center gap-2 transition-all duration-300 ${
                      filterNoDob
                        ? "bg-amber-600 hover:bg-amber-700 text-white border-transparent shadow-lg shadow-amber-200 dark:shadow-none translate-y+[-1px]"
                        : "text-slate-700 dark:text-slate-300 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/30 border-slate-200 dark:border-slate-800"
                    }`}
                  >
                    <div className={`w-1.5 h-1.5 rounded-full ${filterNoDob ? "bg-white animate-pulse" : "bg-slate-300"}`} />
                    Tgl Lahir Kosong / Invalid
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-[200px] text-xs">
                  Filter data yang tidak ada tanggal lahirnya atau format penulisannya salah (invalid)
                </TooltipContent>
              </Tooltip>
            </div>
          </div>

          {/* Section 3: Cek Duplikasi */}
          {!hideDuplicates && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 px-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Cek Duplikasi</span>
                <div className="h-px flex-1 bg-slate-100 dark:bg-slate-800" />
              </div>
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
                      className={`font-semibold text-xs rounded-xl h-9 flex items-center gap-2 transition-all duration-300 ${
                        showDuplicates
                          ? "bg-rose-600 hover:bg-rose-700 text-white border-transparent shadow-lg shadow-rose-200 dark:shadow-none translate-y+[-1px]"
                          : "text-slate-700 dark:text-slate-300 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 border-slate-200 dark:border-slate-800"
                      } disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed`}
                    >
                      <Copy className="w-4 h-4" />
                      {showDuplicates ? "Mode Duplikasi Aktif" : "Cek Data Duplikat"}
                    </Button>
                  </div>
                </TooltipTrigger>
                {status.isFiltered && (
                  <TooltipContent side="top" className="max-w-[220px] text-xs">
                    Nonaktifkan filter lainnya untuk mengecek duplikat
                  </TooltipContent>
                )}
              </Tooltip>
            </div>
          )}
        </div>

        {/* Info Area */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800/50 text-[11px] sm:text-xs text-slate-500 font-medium mt-4">
          <div className="flex items-center gap-3">
            <span className="bg-white dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 shadow-sm flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
              Total: <span className="font-bold text-slate-900 dark:text-white">{filteredCount.toLocaleString("id-ID")}</span> / {totalCount.toLocaleString("id-ID")}
            </span>
            <span className="bg-white dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 shadow-sm flex items-center gap-2">
              Data <span className="font-bold text-slate-900 dark:text-white">{startRange}-{endRange}</span>
            </span>
          </div>
          
          <div className="flex items-center gap-3">
            {(status.isFiltered || showDuplicates) && (
              <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/30 px-3 py-1.5 rounded-lg border border-indigo-100/50 dark:border-indigo-800/50 inline-flex items-center gap-2 animate-in fade-in zoom-in duration-300">
                <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse" />
                {showDuplicates ? "DUPLICATE VIEW" : "FILTERED VIEW"}
              </span>
            )}
            <div className="bg-white dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 shadow-sm">
              Hal <span className="font-bold text-indigo-600 dark:text-indigo-400">{pagination.currentPage}</span> dari {pagination.totalPages}
            </div>
          </div>
        </div>
      </TooltipProvider>
    </div>
  );
});

