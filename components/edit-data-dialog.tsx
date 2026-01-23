"use client";

import { useState, useRef, useEffect, useCallback, useTransition } from "react";
import { updateData } from "@/app/actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Pencil, Loader2, ChevronDown, Save, RefreshCw } from "lucide-react";
import { SheetRow } from "@/lib/google-sheets";
import { desaData, Gender, COLUMNS } from "@/lib/constants";
import { format, parseISO } from "date-fns";
import { getCellValue } from "@/lib/helper";
import { toast } from "sonner";
import { useModalState } from "@/hooks/use-modal-state";

interface EditDataDialogProps {
  row: SheetRow;
  rowIndex: number;
  children?: React.ReactNode;
}

function SubmitButton({ formId, isPending }: { formId: string; isPending: boolean }) {
  return (
    <Button
      type="submit"
      form={formId}
      disabled={isPending}
      className="w-full bg-sky-600 hover:bg-sky-700 text-white rounded-xl h-11 transition-all active:scale-95 shadow-lg shadow-sky-100 dark:shadow-none font-semibold"
    >
      {isPending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Memproses...
        </>
      ) : (
        <div className="flex items-center gap-2">
          <Save className="w-4 h-4" />
          <span>Simpan Perubahan</span>
        </div>
      )}
    </Button>
  );
}

export function EditDataDialog({
  row,
  rowIndex,
  children,
}: EditDataDialogProps) {
  const formId = "edit-data-form";
  const { isOpen, onOpenChange, close } = useModalState("edit", rowIndex);
  const [selectedDesa, setSelectedDesa] = useState<string>("");
  const [isPending, startTransition] = useTransition();

  // Initialize/Reset state when dialog opens
  useEffect(() => {
    if (isOpen) {
      const initialDesa = getCellValue(row, COLUMNS.DESA).toUpperCase();
      setSelectedDesa(initialDesa);
    }
  }, [isOpen, row]);
  const [showScrollIndicator, setShowScrollIndicator] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const checkScroll = useCallback(() => {
    if (scrollRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
      const canScrollDown = scrollHeight > clientHeight + scrollTop + 10;
      setShowScrollIndicator(canScrollDown);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(checkScroll, 100);
      return () => clearTimeout(timer);
    }
  }, [isOpen, checkScroll]);

  const sheetRowIndex = rowIndex + 2;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const keys = Array.from(formData.keys());
      const tanggalLahirKey = keys.find(k => k.toLowerCase() === COLUMNS.TANGGAL_LAHIR.toLowerCase()) || COLUMNS.TANGGAL_LAHIR;
      
      const rawDate = formData.get(tanggalLahirKey) as string;

      if (rawDate) {
        try {
          const parsed = parseISO(rawDate);
          const formatted = format(parsed, "dd/MM/yyyy");
          formData.set(tanggalLahirKey, formatted);
        } catch (e) {
          // Fallback or ignore
        }
      }

      const result = await updateData(sheetRowIndex, null, formData);
      if (result.success) {
        close();
        toast.success(result.message);
      } else {
        toast.error(`Gagal: ${result.message}`);
      }
    });
  };

  const getFormattedDateForInput = (dateString: string) => {
    if (!dateString) return "";
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) return dateString;

    const monthMap: { [key: string]: string } = {
      Januari: "01", Februari: "02", Maret: "03", April: "04", Mei: "05", Juni: "06",
      Juli: "07", Agustus: "08", September: "09", Oktober: "10", November: "11", Desember: "12",
    };

    let processedString = dateString;
    Object.keys(monthMap).forEach((monthName) => {
      if (dateString.includes(monthName)) {
        const parts = dateString.split(" ");
        if (parts.length === 3) {
          const day = parts[0].padStart(2, "0");
          const month = monthMap[parts[1]] || "01";
          const year = parts[2];
          processedString = `${year}-${month}-${day}`;
        }
      }
    });

    if (!/^\d{4}-\d{2}-\d{2}$/.test(processedString)) {
      const date = new Date(dateString);
      if (!isNaN(date.getTime())) {
        return date.toISOString().split("T")[0];
      }
    }

    return processedString;
  };

  const renderInput = (header: string, isRequired: boolean) => {
    const currentValue = String(row[header] || "");
    const selectBaseClass = "flex h-11 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-sm ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/20 focus-visible:border-sky-500 appearance-none";
    const inputBaseClass = "h-11 w-full rounded-xl border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus-visible:ring-sky-500/20 focus-visible:border-sky-500 transition-all";

    const headerLower = header.toLowerCase();

    if (headerLower === COLUMNS.TANGGAL_LAHIR.toLowerCase()) {
      return (
        <Input
          id={header}
          name={header}
          type="date"
          defaultValue={getFormattedDateForInput(currentValue)}
          className={inputBaseClass}
          required={isRequired}
        />
      );
    }

    if (headerLower.toUpperCase() === COLUMNS.DESA.toUpperCase()) {
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
          <div className="absolute right-3 top-3.5 pointer-events-none opacity-40">
             <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
          </div>
        </div>
      );
    }

    if (headerLower === COLUMNS.KELOMPOK.toLowerCase()) {
      const normalizedSelectedDesa = selectedDesa.toUpperCase();
      const kelompokList = desaData[normalizedSelectedDesa] || [];
      const valueIsValid = kelompokList.some(k => k.toLowerCase() === currentValue.toLowerCase());
      
      const matchedValue = valueIsValid 
        ? kelompokList.find(k => k.toLowerCase() === currentValue.toLowerCase()) 
        : "";

      return (
        <div className="relative w-full">
          <select
            id={header}
            name={header}
            className={selectBaseClass}
            required={isRequired}
            disabled={!normalizedSelectedDesa}
            defaultValue={matchedValue}
          >
            <option value="">Pilih Kelompok</option>
            {kelompokList.map((kelompok) => (
              <option key={kelompok} value={kelompok}>
                {kelompok}
              </option>
            ))}
          </select>
          <div className="absolute right-3 top-3.5 pointer-events-none opacity-40">
             <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
          </div>
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
            defaultValue={currentValue}
          >
            <option value="">Pilih Jenis Kelamin</option>
            {Gender?.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
          <div className="absolute right-3 top-3.5 pointer-events-none opacity-40">
             <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
          </div>
        </div>
      );
    }

    return (
      <Input
        id={header}
        name={header}
        defaultValue={currentValue}
        className={inputBaseClass}
        required={isRequired}
      />
    );
  };

  const ignoredKeys = ["_index", "timestamp", "umur", "jenjang kelas"];

  return (
    <Dialog 
      open={isOpen} 
      onOpenChange={(newOpen) => {
        if (isPending) return;
        onOpenChange(newOpen);
      }}
    >
      <DialogTrigger asChild>
        {children ? (
          children
        ) : (
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 text-sky-600 hover:text-sky-700 hover:bg-sky-50 rounded-xl transition-all active:scale-90"
          >
            <Pencil className="h-4 w-4" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px] p-0 overflow-hidden border-none rounded-3xl shadow-2xl h-[92vh] max-h-[92vh] flex flex-col font-outfit">
        {/* Header - Fixed */}
        <div className="bg-gradient-to-br from-sky-600 to-sky-700 p-6 md:p-8 text-white relative shrink-0">
           <div className="absolute top-0 right-0 p-8 opacity-10">
              <Pencil className="w-24 h-24" />
           </div>
           <DialogHeader>
             <DialogTitle className="text-xl md:text-2xl font-bold tracking-tight font-syne">Edit Data Generus</DialogTitle>
             <DialogDescription className="text-sky-100 font-medium text-xs md:text-sm">
               Perbarui informasi detail untuk entitas generus ini. Pastikan data tetap akurat.
             </DialogDescription>
           </DialogHeader>
        </div>

        {/* Content - Scrollable */}
        <div className="relative flex-1 min-h-0 bg-white dark:bg-slate-900">
          {/* Stunning Animation Overlay */}
          {isPending && (
            <div className="absolute inset-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm flex flex-col items-center justify-center p-8 animate-in fade-in duration-300">
               <div className="relative mb-6">
                  <div className="absolute inset-0 bg-sky-500 blur-2xl opacity-20 animate-pulse rounded-full"></div>
                  <div className="relative h-20 w-20 rounded-2xl bg-sky-600 flex items-center justify-center text-white shadow-xl">
                    <RefreshCw className="w-10 h-10 animate-spin" />
                  </div>
                  <div className="absolute -bottom-2 -right-2">
                    <div className="h-8 w-8 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center shadow-lg">
                       <Loader2 className="w-5 h-5 text-sky-600 animate-spin" />
                    </div>
                  </div>
               </div>
               <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Memperbarui Data...</h3>
               <p className="text-slate-500 dark:text-slate-400 text-center text-sm max-w-[240px]">
                 Sinkronisasi perubahan sedang berlangsung. Harap tunggu sebentar.
               </p>
            </div>
          )}

          <div 
            ref={scrollRef}
            onScroll={checkScroll}
            className="h-full overflow-y-auto px-5 md:px-8 py-6 space-y-5 md:space-y-6 scrollbar-hide"
          >
            <form id={formId} onSubmit={handleSubmit} className="pb-4">
              <div className="grid gap-5 md:gap-6">
                {Object.keys(row)
                  .filter((h) => !ignoredKeys.includes(h.toLowerCase()))
                  .map((header) => {
                    const optionalFields = ["HOBI", "SKILL / CITA-CITA"];
                    const isRequired = !optionalFields.includes(header.toUpperCase());

                    return (
                      <div
                        key={header}
                        className="grid grid-cols-1 md:grid-cols-4 md:items-center gap-1.5 md:gap-4 group"
                      >
                        <Label
                          htmlFor={header}
                          className="font-semibold text-slate-600 dark:text-slate-400 group-focus-within:text-sky-600 transition-colors text-xs md:text-sm"
                        >
                          {header}
                          {isRequired && <span className="text-rose-500 ml-1 font-bold">*</span>}
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

          {/* Scroll Indicator Icon */}
          <div 
            className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-8 bg-sky-600 text-white rounded-full flex items-center justify-center shadow-lg transition-all duration-300 pointer-events-none md:hidden ${
              showScrollIndicator ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            <ChevronDown className="w-5 h-5 animate-bounce" />
          </div>
        </div>

        {/* Footer - Fixed */}
        <div className="p-5 md:p-8 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 shrink-0">
          <div className="flex gap-3">
            <Button 
              variant="ghost" 
              className="flex-1 rounded-xl h-11 transition-all font-semibold outline-none" 
              onClick={() => close()}
              disabled={isPending}
            >
              Batal
            </Button>
            <div className="flex-1">
               <SubmitButton formId={formId} isPending={isPending} />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
