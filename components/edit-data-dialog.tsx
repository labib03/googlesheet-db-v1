"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import { SheetRow } from "@/lib/google-sheets";

interface EditDataDialogProps {
  row: SheetRow;
  rowIndex?: number; // Kept for prop-compatibility
  children?: React.ReactNode;
}

export function EditDataDialog({ row, children }: EditDataDialogProps) {
  return (
    <Link href={`/generus/edit/${row._index}`} className="cursor-pointer">
      {children ? (
        children
      ) : (
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 text-sky-600 hover:text-sky-700 hover:bg-sky-50 rounded-xl transition-all active:scale-90 relative"
          asChild
        >
          <span>
            <Pencil className="h-4 w-4" />
          </span>
        </Button>
      )}
    </Link>
  );
}
