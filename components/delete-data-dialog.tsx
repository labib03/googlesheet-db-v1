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
import { Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useDashboard } from "@/context/dashboard-context";

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

  const handleDelete = async () => {
    startTransition(async () => {
      const result = await deleteData(rowIndex);
      if (result.success) {
        toast.success(result.message);
        await refreshData(true);
        setOpen(false);
      } else {
        toast.error(result.message);
      }
    });
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
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
      <AlertDialogContent className="rounded-3xl border-none shadow-2xl p-0 overflow-hidden sm:max-w-[400px]">
        <div className="bg-rose-500 p-6 text-white text-center">
          <div className="mx-auto w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-4 animate-pulse">
            <Trash2 className="w-8 h-8" />
          </div>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold text-center text-white">
              Konfirmasi Hapus
            </AlertDialogTitle>
            <AlertDialogDescription className="text-rose-100 text-center font-medium">
              Apakah Anda yakin ingin menghapus <strong>{dataName}</strong>? Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
        </div>
        
        <div className="p-6 bg-white dark:bg-slate-900">
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
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
