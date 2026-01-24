"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Eye, Loader2 } from "lucide-react";
import { SheetRow } from "@/lib/google-sheets";
import { useModalState } from "@/hooks/use-modal-state";
import { LoadingOverlay } from "./ui/loading-overlay";
import { useIsMobile } from "@/hooks/use-is-mobile";
import { useRouter } from "next/navigation";
import { GenerusDetail } from "./details/generus-detail";

interface DataDetailDialogProps {
  row: SheetRow;
  title?: string;
  children?: React.ReactNode;
  ignoreViewConfig?: boolean;
}

export function DataDetailDialog({ row, children, ignoreViewConfig }: DataDetailDialogProps) {
  const { isOpen, open, close, onOpenChange } = useModalState();
  const isMobile = useIsMobile();
  const router = useRouter();

  const handleOpenClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isMobile) {
      router.push(`/generus/detail/${row._index}`);
    } else {
      open();
    }
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
            className="h-9 w-9 text-indigo-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/40 rounded-xl transition-all active:scale-90 relative"
          >
            <Eye className="h-4 w-4" />
            <span className="sr-only">Lihat Detail</span>
          </Button>
        )}
      </div>

      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[480px] p-0 overflow-hidden border-none rounded-3xl shadow-2xl flex flex-col font-outfit">
          <LoadingOverlay isPending={false} />
          <div className="flex-1 min-h-0">
            <GenerusDetail 
              row={row}
              onBack={close}
              ignoreViewConfig={ignoreViewConfig}
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
