"use client";

import { SheetRow } from '@/lib/google-sheets';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface DataDetailDialogProps {
  row: SheetRow;
  title?: string;
}

export function DataDetailDialog({ row, title = "Detail Data" }: DataDetailDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/50">
          <Eye className="h-4 w-4" />
          <span className="sr-only">Lihat Detail</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-slate-900 dark:text-slate-100">{title}</DialogTitle>
          <DialogDescription>
            Informasi lengkap dari baris data yang dipilih.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="grid gap-4 py-4">
            {Object.entries(row).map(([key, value]) => (
              <div key={key} className="grid grid-cols-3 gap-4 border-b border-slate-100 pb-3 last:border-0 dark:border-slate-800">
                <div className="text-sm font-medium text-slate-500 dark:text-slate-400 capitalize">
                  {key}
                </div>
                <div className="col-span-2 text-sm font-semibold text-slate-900 dark:text-slate-100 break-words">
                  {String(value)}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
