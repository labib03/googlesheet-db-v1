"use client";

import { useTransition } from "react";
import { addData } from "@/app/actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { PlusCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { format, parseISO } from "date-fns";
import { useModalState } from "@/hooks/use-modal-state";
import { LoadingOverlay } from "./ui/loading-overlay";
import { useIsMobile } from "@/hooks/use-is-mobile";
import { useRouter } from "next/navigation";
import { GenerusForm } from "./forms/generus-form";

interface AddDataDialogProps {
  headers: string[];
}

export function AddDataDialog({ headers }: AddDataDialogProps) {
  const { isOpen, open, close, onOpenChange } = useModalState();
  const [isPending, startTransition] = useTransition();
  const isMobile = useIsMobile();
  const router = useRouter();

  const isEnableAdd = process.env.NEXT_PUBLIC_ENABLE_ADD === "true";
  if (!isEnableAdd) return null;

  const handleOpenClick = () => {
    if (isMobile) {
      router.push("/generus/add");
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
        } catch {}
      }

      const result = await addData(null, formData);
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
      <Button 
        onClick={handleOpenClick}
        disabled={isPending}
        className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2 rounded-xl px-5 h-10 transition-all active:scale-95 shadow-lg shadow-indigo-100 dark:shadow-none font-syne relative overflow-hidden"
      >
        {isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <PlusCircle className="h-4 w-4" />
        )}
        <span className="font-semibold tracking-tight">
          {isPending ? "Preparing..." : "Tambah Generus"}
        </span>
      </Button>

      <Dialog 
        open={isOpen} 
        onOpenChange={(newOpen) => {
          if (isPending) return;
          onOpenChange(newOpen);
        }}
      >
        <DialogContent className="sm:max-w-[550px] p-0 overflow-hidden border-none rounded-3xl shadow-2xl flex flex-col font-outfit">
          <LoadingOverlay isPending={isPending} />
          
          <div className="min-h-0">
            <GenerusForm 
              title="Tambah Data Baru"
              headers={headers}
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
