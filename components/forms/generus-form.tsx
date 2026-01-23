"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2, Save, ChevronDown } from "lucide-react";
import { desaData, Gender, COLUMNS } from "@/lib/constants";
import { getCellValue } from "@/lib/helper";
import { SheetRow } from "@/lib/google-sheets";
import { useRef, useEffect, useCallback } from "react";

interface GenerusFormProps {
  headers: string[];
  initialData?: SheetRow;
  onSubmit: (formData: FormData) => void;
  isPending: boolean;
  onCancel: () => void;
  title?: string;
}

export function GenerusForm({
  headers,
  initialData,
  onSubmit,
  isPending,
  onCancel,
  title,
}: GenerusFormProps) {
  const [selectedDesa, setSelectedDesa] = useState<string>(
    initialData ? String(getCellValue(initialData, COLUMNS.DESA)).toUpperCase() : ""
  );
  const [showScrollIndicator, setShowScrollIndicator] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const checkScroll = useCallback(() => {
    if (scrollRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
      const canScrollDown = scrollHeight > clientHeight + scrollTop + 40;
      setShowScrollIndicator(canScrollDown);
    }
  
  }, []);

  useEffect(() => {
    // Initial check after a short delay
    const timer = setTimeout(checkScroll, 500);
    return () => clearTimeout(timer);
  }, [checkScroll, headers]);

  const ignoredKeys = ["_index", "timestamp", "umur", "jenjang kelas"];

  const renderInput = (header: string, isRequired: boolean) => {
    const selectBaseClass = "flex h-11 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-sm ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/20 focus-visible:border-indigo-500 disabled:cursor-not-allowed disabled:opacity-50 appearance-none";
    const inputBaseClass = "h-11 w-full rounded-xl border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus-visible:ring-indigo-500/20 focus-visible:border-indigo-500 transition-all";

    const headerLower = header.toLowerCase();
    const defaultValue = initialData ? String(initialData[header] || "") : "";

    let finalDefaultValue = "";
    const rawDate = (initialData as any)?._rawBirthDate as string || defaultValue;

    if (headerLower === COLUMNS.TANGGAL_LAHIR.toLowerCase() && rawDate && rawDate.includes("/")) {
      const parts = rawDate.split("/");
      if (parts.length === 3) {
        const [d, m, y] = parts;
        finalDefaultValue = `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
      }
    } else if (headerLower === COLUMNS.TANGGAL_LAHIR.toLowerCase()) {
      finalDefaultValue = defaultValue;
    } else {
      finalDefaultValue = defaultValue;
    }

    if (headerLower === COLUMNS.TANGGAL_LAHIR.toLowerCase()) {
      return (
        <Input
          id={header}
          name={header}
          type="date"
          className={inputBaseClass}
          required={isRequired}
          defaultValue={finalDefaultValue}
        />
      );
    }

    if (headerLower === COLUMNS.DESA.toLowerCase()) {
      return (
        <div className="relative w-full">
          <select
            id={header}
            name={header}
            className={selectBaseClass}
            required={isRequired}
            value={selectedDesa}
            onChange={(e) => setSelectedDesa(e.target.value)}
          >
            <option value="">Pilih Desa</option>
            {Object.keys(desaData).map((desa) => (
              <option key={desa} value={desa}>
                {desa}
              </option>
            ))}
          </select>
        </div>
      );
    }

    if (headerLower === COLUMNS.KELOMPOK.toLowerCase()) {
      return (
        <div className="relative w-full">
          <select
            id={header}
            name={header}
            className={selectBaseClass}
            required={isRequired}
            disabled={!selectedDesa}
            defaultValue={defaultValue}
          >
            <option value="">Pilih Kelompok</option>
            {selectedDesa &&
              desaData[selectedDesa]?.map((kelompok) => (
                <option key={kelompok} value={kelompok}>
                  {kelompok}
                </option>
              ))}
          </select>
        </div>
      );
    }

    if (headerLower === COLUMNS.GENDER.toLowerCase()) {
      return (
        <div className="relative w-full">
          <select
            id={header}
            name={header}
            className={selectBaseClass}
            required={isRequired}
            defaultValue={defaultValue}
          >
            <option value="">Pilih Jenis Kelamin</option>
            {Gender?.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </div>
      );
    }

    if (headerLower === COLUMNS.HOBI.toLowerCase() || headerLower === COLUMNS.SKILL.toLowerCase()) {
      return (
        <Textarea
          id={header}
          name={header}
          placeholder={`Isi ${header}...`}
          className="min-h-[100px] rounded-xl border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus-visible:ring-indigo-500/20 focus-visible:border-indigo-500 transition-all"
          required={isRequired}
          defaultValue={defaultValue}
        />
      );
    }

    return (
      <Input
        id={header}
        name={header}
        placeholder={`Isi ${header}...`}
        className={inputBaseClass}
        required={isRequired}
        defaultValue={defaultValue}
      />
    );
  };

  return (
    <div className="flex flex-col h-auto max-h-dvh bg-white dark:bg-slate-900 overflow-hidden relative font-outfit">
      {title && (
        <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 p-5 md:p-6 text-white relative shrink-0">
          <h2 className="text-xl md:text-2xl font-bold tracking-tight font-syne">{title}</h2>
        </div>
      )}

      <ScrollArea 
        className="flex-1 h-auto overflow-y-auto"
        onScrollCapture={checkScroll}
        ref={scrollRef}
      >
        <div 
          className="px-5 md:px-8 py-6 space-y-6" 
        >
          <form id="generus-form" onSubmit={(e) => { e.preventDefault(); onSubmit(new FormData(e.currentTarget)); }}>
            <div className="grid gap-5 md:gap-6">
              {headers
                .filter((h) => !ignoredKeys.includes(h.toLowerCase()))
                .map((header) => {
                  const optionalFields = ["HOBI", "SKILL / CITA-CITA"];
                  const isRequired = !optionalFields.includes(header.toUpperCase());

                  return (
                    <div key={header} className="grid grid-cols-1 md:grid-cols-4 md:items-center gap-1.5 md:gap-2">
                      <Label htmlFor={header} className="font-semibold text-slate-600 dark:text-slate-400 text-xs md:text-sm">
                        {header}{isRequired && <span className="text-rose-500 font-bold">*</span>}
                      </Label>
                      <div className="md:col-span-3">
                        {renderInput(header, isRequired)}
                      </div>
                    </div>
                  );
                })}
            </div>
          </form>
        </div>
      </ScrollArea>

      {/* Scroll Indicator Icon */}
      <div
        className={`absolute bottom-[100px] left-1/2 -translate-x-1/2 w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center shadow-lg transition-all duration-300 pointer-events-none z-[9999] ${
          showScrollIndicator
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-4"
        }`}
      >
        <ChevronDown className="w-5 h-5 animate-bounce" />
      </div>

      <div className="shrink-0 p-4 md:p-6 border-t border-slate-100 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm z-20">
        <div className="flex gap-3">
          <Button variant="ghost" className="flex-1 rounded-xl h-11 font-semibold" onClick={onCancel} disabled={isPending}>
            Batal
          </Button>
          <Button
            type="submit"
            form="generus-form"
            disabled={isPending}
            className="bg-indigo-600 hover:bg-indigo-700 text-white flex-1 rounded-xl h-11 transition-all active:scale-95 shadow-lg shadow-indigo-100 dark:shadow-none font-semibold"
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Menyimpan...
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Save className="w-4 h-4" />
                <span>Simpan</span>
              </div>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
