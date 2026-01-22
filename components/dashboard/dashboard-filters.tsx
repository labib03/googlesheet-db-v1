"use client";

import { Button } from "@/components/ui/button";
import { RefreshButton } from "@/components/refresh-button";
import { Eraser, X } from "lucide-react";
import { Gender, kelas } from "@/lib/constants";

interface DashboardFiltersProps {
  filters: {
    filterDesa: string;
    filterKelompok: string;
    filterGender: string;
    filterJenjangKelas: string;
    filterNama: string;
    setFilterDesa: (v: string) => void;
    setFilterKelompok: (v: string) => void;
    setFilterGender: (v: string) => void;
    setFilterJenjangKelas: (v: string) => void;
    setFilterNama: (v: string) => void;
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
}

export function DashboardFilters({
  filters,
  options,
  status,
  actions,
}: DashboardFiltersProps) {
  const {
    filterDesa,
    filterKelompok,
    filterGender,
    filterJenjangKelas,
    filterNama,
    setFilterDesa,
    setFilterKelompok,
    setFilterGender,
    setFilterJenjangKelas,
    setFilterNama,
  } = filters;

  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
      <div className="flex items-center gap-3">
        <div className="h-5 w-1 bg-indigo-600 rounded-full" />
        <h2 className="text-sm font-extrabold text-slate-800 dark:text-slate-100 uppercase tracking-tight">
          Filter Data
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Desa */}
        <div className="space-y-1.5 flex flex-col">
          <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-1">
            Desa
          </label>
          <select
            className={`w-full h-11 border rounded-xl text-sm px-3 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none appearance-none cursor-pointer ${
              filterDesa
                ? "bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800/50 text-indigo-700 dark:text-indigo-300 font-semibold"
                : "bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300"
            }`}
            value={filterDesa}
            onChange={(e) => {
              const nextDesa = e.target.value;
              actions.handleStartTransition(() => {
                setFilterDesa(nextDesa);
                actions.setCurrentPage(1);
              });
            }}
          >
            <option value="">Semua Desa</option>
            {options.desaOptions.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>

        {/* Kelompok */}
        <div className="space-y-1.5 flex flex-col">
          <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-1">
            Kelompok
          </label>
          <select
            className={`w-full h-11 border rounded-xl text-sm px-3 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none appearance-none cursor-pointer ${
              filterKelompok
                ? "bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800/50 text-indigo-700 dark:text-indigo-300 font-semibold"
                : "bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300"
            }`}
            value={filterKelompok}
            onChange={(e) => {
              const nextKelompok = e.target.value;
              actions.handleStartTransition(() => {
                setFilterKelompok(nextKelompok);
                actions.setCurrentPage(1);
              });
            }}
          >
            <option value="">Semua Kelompok</option>
            {options.kelompokOptions.map((k) => (
              <option key={k} value={k}>
                {k}
              </option>
            ))}
          </select>
        </div>

        {/* Gender */}
        <div className="space-y-1.5 flex flex-col">
          <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-1">
            Jenis Kelamin
          </label>
          <select
            className={`w-full h-11 border rounded-xl text-sm px-3 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none appearance-none cursor-pointer ${
              filterGender
                ? "bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800/50 text-indigo-700 dark:text-indigo-300 font-semibold"
                : "bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300"
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
            <option value="">Semua Gender</option>
            {Gender.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </div>

        {/* Jenjang */}
        <div className="space-y-1.5 flex flex-col">
          <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-1">
            Jenjang
          </label>
          <select
            className={`w-full h-11 border rounded-xl text-sm px-3 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none appearance-none cursor-pointer ${
              filterJenjangKelas
                ? "bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800/50 text-indigo-700 dark:text-indigo-300 font-semibold"
                : "bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300"
            }`}
            value={filterJenjangKelas}
            onChange={(e) => {
              const nextJenjang = e.target.value;
              actions.handleStartTransition(() => {
                setFilterJenjangKelas(nextJenjang);
                actions.setCurrentPage(1);
              });
            }}
          >
            <option value="">Semua Jenjang</option>
            {kelas.map((k) => (
              <option key={k} value={k}>
                {k}
              </option>
            ))}
          </select>
        </div>

        {/* Nama */}
        <div className="space-y-1.5 flex flex-col">
          <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-1">
            Cari Nama
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder="Ex: Fulan..."
              className={`w-full h-11 border rounded-xl text-sm px-3 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none ${
                filterNama
                  ? "bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800/50 text-indigo-700 dark:text-indigo-300 font-semibold"
                  : "bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300"
              }`}
              value={filterNama}
              onChange={(e) => setFilterNama(e.target.value)}
            />
            {filterNama && (
              <button
                onClick={() => setFilterNama("")}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
        <div className="flex gap-2">
          <Button
            onClick={actions.resetFilters}
            variant="outline"
            size="sm"
            className="text-slate-800 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 font-medium text-sm rounded-lg border-slate-200 flex items-center gap-2"
          >
            <Eraser className="w-4 h-4" />
            Reset Filters
          </Button>
          <RefreshButton />
        </div>
        {status.isFiltered && (
          <span className="text-[11px] font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/30 px-2 py-0.5 rounded-full inline-flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse" />
            Filtered View
          </span>
        )}
      </div>
    </div>
  );
}
