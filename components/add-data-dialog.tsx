"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

interface AddDataDialogProps {
  headers?: string[]; // Kept for prop-compatibility
}

export function AddDataDialog({ headers }: AddDataDialogProps) {
  const isEnableAdd = process.env.NEXT_PUBLIC_ENABLE_ADD === "true";
  if (!isEnableAdd) return null;

  return (
    <Button 
      asChild
      className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2 rounded-full px-5 h-10 transition-all active:scale-95 shadow-lg shadow-indigo-100 dark:shadow-none font-syne cursor-pointer"
    >
      <Link href="/generus/add">
        <PlusCircle className="h-4 w-4" />
        <span className="font-semibold tracking-tight">Tambah Generus</span>
      </Link>
    </Button>
  );
}
