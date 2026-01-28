"use client";

import { useState, useTransition } from "react";
import { deleteData } from "@/app/actions";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Trash2, Loader2, Info } from "lucide-react";
import { toast } from "sonner";
import { useDashboard } from "@/context/dashboard-context";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface DeleteDataDialogProps {
  rowIndex: number;
  dataName?: string;
  children?: React.ReactNode;
}

export function DeleteDataDialog({
  rowIndex,
  dataName = "data ini",
  children,
}: DeleteDataDialogProps) {
  const { refreshData } = useDashboard();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  // New metadata fields
  const [isMarried, setIsMarried] = useState(false);
  const [isPindahSambung, setIsPindahSambung] = useState(false);
  const [keterangan, setKeterangan] = useState("");

  const handleDelete = async () => {
    startTransition(async () => {
      const result = await deleteData(rowIndex, {
        isMarried,
        isPindahSambung,
        keterangan,
      });
      if (result.success) {
        toast.success(result.message);
        await refreshData(true);
        setOpen(false);
        // Reset state
        setIsMarried(false);
        setIsPindahSambung(false);
        setKeterangan("");
      } else {
        toast.error(result.message);
      }
    });
  };

  return (
    <AlertDialog open={open} onOpenChange={(val) => {
      setOpen(val);
      if (!val) {
        // Optional: Reset state when closing without submitting
        // setIsMarried(false);
        // setIsPindahSambung(false);
        // setKeterangan("");
      }
    }}>
      <AlertDialogTrigger asChild>
        {children ? (
          children
        ) : (
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl transition-all active:scale-90"
          >
            <Trash2 className="h-4 w-4" />
            <span className="sr-only">Hapus Data</span>
          </Button>
        )}
      </AlertDialogTrigger>
      <AlertDialogContent className="rounded-3xl border-none shadow-2xl p-0 overflow-hidden sm:max-w-[450px]">
        <div className="bg-rose-500 p-6 text-white text-center">
          <div className="mx-auto w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-4 animate-pulse">
            <Trash2 className="w-8 h-8" />
          </div>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold text-center text-white">
              Konfirmasi Hapus
            </AlertDialogTitle>
            <AlertDialogDescription className="text-rose-100 text-center font-medium">
              Apakah Anda yakin ingin menghapus <strong>{dataName}</strong>? Data akan dipindahkan ke Trash.
            </AlertDialogDescription>
          </AlertDialogHeader>
        </div>
        
        <div className="p-6 bg-white dark:bg-slate-900 space-y-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 mb-2">
              <Info className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider">Informasi Tambahan (Opsional)</span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-3 p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" onClick={() => setIsMarried(!isMarried)}>
                <Checkbox 
                  id="isMarried" 
                  checked={isMarried} 
                  onCheckedChange={(checked) => setIsMarried(!!checked)} 
                  onClick={(e) => e.stopPropagation()}
                />
                <Label className="text-sm font-semibold cursor-pointer select-none">Sudah Menikah</Label>
              </div>

              <div className="flex items-center space-x-3 p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" onClick={() => setIsPindahSambung(!isPindahSambung)}>
                <Checkbox 
                  id="isPindah" 
                  checked={isPindahSambung} 
                  onCheckedChange={(checked) => setIsPindahSambung(!!checked)}
                  onClick={(e) => e.stopPropagation()}
                />
                <Label className="text-sm font-semibold cursor-pointer select-none">Pindah Sambung</Label>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="keterangan" className="text-sm font-bold text-slate-700 dark:text-slate-300">Keterangan</Label>
              <Textarea
                id="keterangan"
                placeholder="Alasan penghapusan atau info lainnya..."
                className="rounded-xl border-slate-200 dark:border-slate-800 min-h-[80px] focus:ring-indigo-500"
                value={keterangan}
                onChange={(e) => setKeterangan(e.target.value)}
              />
            </div>
          </div>

          <AlertDialogFooter className="flex-col sm:flex-row gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 pt-6">
            <AlertDialogCancel className="sm:flex-1 rounded-xl border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 font-semibold h-11">
              Batal
            </AlertDialogCancel>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isPending}
              className="sm:flex-1 rounded-xl bg-rose-600 hover:bg-rose-700 font-bold h-11 shadow-lg shadow-rose-100 dark:shadow-none transition-all active:scale-95"
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Menghapus...
                </>
              ) : (
                "Ya, Hapus"
              )}
            </Button>
          </AlertDialogFooter>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
