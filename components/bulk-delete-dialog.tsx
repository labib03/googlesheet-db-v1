"use client";

import { useState, useTransition } from "react";
import { bulkDeleteData } from "@/app/actions";
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
import { Trash2, Loader2, X, Info } from "lucide-react";
import { toast } from "sonner";
import { useDashboard } from "@/context/dashboard-context";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface BulkDeleteDialogProps {
  selectedIndices: number[];
  selectedNames: string[];
  onSuccess: () => void;
  trigger?: React.ReactNode;
}

export function BulkDeleteDialog({
  selectedIndices,
  selectedNames,
  onSuccess,
  trigger,
}: BulkDeleteDialogProps) {
  const { refreshData } = useDashboard();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [keterangan, setKeterangan] = useState("");

  const handleBulkDelete = async () => {
    // Map sheet indices (they are already originalIndex + 2 from the client)
    startTransition(async () => {
      const result = await bulkDeleteData(selectedIndices, keterangan);
      if (result.success) {
        toast.success(result.message);
        await refreshData(true);
        onSuccess();
        setOpen(false);
        setKeterangan("");
      } else {
        toast.error(result.message);
      }
    });
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        {trigger || (
          <Button
            variant="destructive"
            className="rounded-xl gap-2 shadow-lg shadow-rose-100 dark:shadow-none animate-in fade-in slide-in-from-bottom-2 duration-300"
          >
            <Trash2 className="w-4 h-4" />
            <span>Hapus {selectedIndices.length} Data</span>
          </Button>
        )}
      </AlertDialogTrigger>
      <AlertDialogContent className="rounded-3xl border-none shadow-2xl p-0 overflow-hidden sm:max-w-[500px]">
        <div className="bg-rose-500 p-6 text-white text-center relative">
          <button 
            onClick={() => setOpen(false)}
            className="absolute right-4 top-4 p-1 hover:bg-white/20 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="mx-auto w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-4 animate-pulse">
            <Trash2 className="w-8 h-8" />
          </div>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl font-bold text-center text-white">
              Hapus Massal
            </AlertDialogTitle>
            <AlertDialogDescription className="text-rose-100 text-center font-medium">
              Anda akan menghapus <strong>{selectedIndices.length} data</strong>. 
              Data ini akan dipindahkan ke Trash.
            </AlertDialogDescription>
          </AlertDialogHeader>
        </div>
        
        <div className="p-6 bg-white dark:bg-slate-900 space-y-6">
          <div className="space-y-2">
            <p className="text-xs font-black uppercase tracking-widest text-slate-400">Daftar nama yang dipilih:</p>
            <ScrollArea className="h-[100px] w-full rounded-2xl border border-slate-100 dark:border-slate-800 p-3 bg-slate-50/50 dark:bg-slate-950/50">
              <div className="flex flex-wrap gap-2">
                {selectedNames.map((name, i) => (
                  <Badge 
                    key={i} 
                    variant="secondary" 
                    className="bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 font-medium py-1 px-2"
                  >
                    {name}
                  </Badge>
                ))}
              </div>
            </ScrollArea>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
               <Info className="w-4 h-4" />
               <span className="text-[10px] font-black uppercase tracking-widest">Informasi Opsional</span>
            </div>
            <div className="space-y-2">
              <Label htmlFor="bulk-keterangan" className="text-sm font-bold text-slate-700 dark:text-slate-300">Keterangan Massal</Label>
              <Textarea
                id="bulk-keterangan"
                placeholder="Berikan alasan untuk semua data yang dihapus ini..."
                className="rounded-2xl border-slate-200 dark:border-slate-800 min-h-[100px] focus:ring-indigo-500 text-sm"
                value={keterangan}
                onChange={(e) => setKeterangan(e.target.value)}
              />
              <p className="text-[10px] text-slate-400 font-medium italic">*IsMarried dan IsPindahSambung akan diatur ke 0/False secara otomatis.</p>
            </div>
          </div>

          <AlertDialogFooter className="flex-col sm:flex-row gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 pt-6">
            <AlertDialogCancel className="sm:flex-1 rounded-xl border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 font-semibold h-12">
              Batal
            </AlertDialogCancel>
            <Button
              variant="destructive"
              onClick={handleBulkDelete}
              disabled={isPending}
              className="sm:flex-1 rounded-xl bg-rose-600 hover:bg-rose-700 font-bold h-12 shadow-lg shadow-rose-100 dark:shadow-none transition-all active:scale-95"
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Menghapus...
                </>
              ) : (
                "Ya, Hapus Semua"
              )}
            </Button>
          </AlertDialogFooter>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
