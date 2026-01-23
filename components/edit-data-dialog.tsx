"use client";

import { useTransition } from "react";
import { updateData } from "@/app/actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Pencil, Loader2 } from "lucide-react";
import { SheetRow } from "@/lib/google-sheets";
import { format, parseISO } from "date-fns";
import { toast } from "sonner";
import { useModalState } from "@/hooks/use-modal-state";
import { LoadingOverlay } from "./ui/loading-overlay";
import { useIsMobile } from "@/hooks/use-is-mobile";
import { useRouter } from "next/navigation";
import { GenerusForm } from "./forms/generus-form";

interface EditDataDialogProps {
  row: SheetRow;
  rowIndex: number;
  children?: React.ReactNode;
}

export function EditDataDialog({ row, rowIndex, children }: EditDataDialogProps) {
  const { isOpen, open, close, onOpenChange } = useModalState();
  const [isPending, startTransition] = useTransition();
  const isMobile = useIsMobile();
  const router = useRouter();

  const handleOpenClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isMobile) {
      router.push(`/generus/edit/${row._index}`);
    } else {
      open();
    }
  };

  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
      const keys = Array.from(formData.keys());
      const tanggalLahirKey = keys.find(k => k.toLowerCase() === "tanggal lahir") || "TANGGAL LAHIR";
      const rawDate = formData.get(tanggalLahirKey) as string;

      if (rawDate) {
        try {
          const parsed = parseISO(rawDate);
          formData.set(tanggalLahirKey, format(parsed, "dd/MM/yyyy"));
        } catch (e) {}
      }

      const result = await updateData(rowIndex + 2, null, formData);
      if (result.success) {
        close();
        toast.success(result.message);
      } else {
        toast.error(`Gagal: ${result.message}`);
      }
    });
  };

  return (
    <>
      <div onClick={handleOpenClick}>
        {children ? (
          children
        ) : (
          <Button
            variant="ghost"
            size="icon"
            disabled={isPending}
            className="h-9 w-9 text-sky-600 hover:text-sky-700 hover:bg-sky-50 rounded-xl transition-all active:scale-90 relative"
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Pencil className="h-4 w-4" />
            )}
          </Button>
        )}
      </div>

      <Dialog 
        open={isOpen} 
        onOpenChange={(newOpen) => {
          if (isPending) return;
          onOpenChange(newOpen);
        }}
      >
        <DialogContent className="sm:max-w-[550px] p-0 overflow-hidden border-none rounded-3xl shadow-2xl h-[92vh] max-h-[92vh] flex flex-col font-outfit">
          <LoadingOverlay isPending={isPending} />
          <div className="flex-1 min-h-0">
            <GenerusForm 
              title="Edit Data Generus"
              headers={Object.keys(row)}
              initialData={row}
              isPending={isPending}
              onSubmit={handleSubmit}
              onCancel={close}
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
