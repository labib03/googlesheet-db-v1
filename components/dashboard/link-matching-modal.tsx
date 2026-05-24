"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertCircle, Link2, ArrowRight, UserCheck, ShieldAlert } from "lucide-react";
import { motion } from "framer-motion";

interface LinkMatchingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  nama: string;
  matchedData: {
    "Nama Lengkap": string;
    "Nama Panggilan"?: string;
    "Kelompok"?: string;
    "Pendidikan"?: string;
    "Kesibukan Saat ini"?: string;
    "Nomor Whatsapp"?: string;
  } | null;
  onConfirmLink: () => void;
  onDeclineLink: () => void;
}

export function LinkMatchingModal({
  open,
  onOpenChange,
  nama,
  matchedData,
  onConfirmLink,
  onDeclineLink,
}: LinkMatchingModalProps) {
  if (!matchedData) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="sm:max-w-md bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl p-0 overflow-hidden"
        showCloseButton={false}
      >
        {/* Banner accent */}
        <div className="h-1.5 bg-gradient-to-r from-indigo-500 via-indigo-600 to-indigo-700" />

        <div className="p-6 text-center">
          <div className="mx-auto w-14 h-14 bg-indigo-50 dark:bg-indigo-950/30 rounded-2xl flex items-center justify-center mb-4 text-indigo-600 dark:text-indigo-400">
            <Link2 className="w-7 h-7" />
          </div>

          <DialogHeader className="space-y-2">
            <DialogTitle className="text-xl font-bold font-syne text-slate-900 dark:text-white text-center">
              Tautkan Data Tambahan?
            </DialogTitle>
            <DialogDescription className="text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
              Sistem menemukan data di sheet <span className="font-bold text-slate-700 dark:text-slate-200">AdditionalInfo</span> yang belum terhubung dengan nama lengkap yang cocok:
            </DialogDescription>
          </DialogHeader>

          {/* Matched Data Summary */}
          <div className="mt-5 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 text-left space-y-3">
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
              <div>
                <p className="font-bold text-slate-400 uppercase tracking-wider text-[9px]">Nama Lengkap</p>
                <p className="font-bold text-slate-800 dark:text-slate-200 truncate mt-0.5">{matchedData["Nama Lengkap"]}</p>
              </div>
              {matchedData["Nama Panggilan"] && (
                <div>
                  <p className="font-bold text-slate-400 uppercase tracking-wider text-[9px]">Nama Panggilan</p>
                  <p className="font-semibold text-slate-800 dark:text-slate-200 truncate mt-0.5">{matchedData["Nama Panggilan"]}</p>
                </div>
              )}
              {matchedData["Kelompok"] && (
                <div>
                  <p className="font-bold text-slate-400 uppercase tracking-wider text-[9px]">Kelompok</p>
                  <p className="font-semibold text-slate-700 dark:text-slate-300 mt-0.5">{matchedData["Kelompok"]}</p>
                </div>
              )}
              {matchedData["Pendidikan"] && (
                <div>
                  <p className="font-bold text-slate-400 uppercase tracking-wider text-[9px]">Pendidikan</p>
                  <p className="font-semibold text-slate-700 dark:text-slate-300 mt-0.5">{matchedData["Pendidikan"]}</p>
                </div>
              )}
              {matchedData["Kesibukan Saat ini"] && (
                <div className="col-span-2 border-t border-slate-100 dark:border-slate-800/50 pt-2 mt-1">
                  <p className="font-bold text-slate-400 uppercase tracking-wider text-[9px]">Kesibukan Saat Ini</p>
                  <p className="font-semibold text-slate-700 dark:text-slate-300 mt-0.5">{matchedData["Kesibukan Saat ini"]}</p>
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 p-3 bg-amber-50/50 dark:bg-amber-950/10 border border-amber-100 dark:border-amber-900/40 rounded-xl flex items-start gap-2.5 text-left">
            <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <p className="text-[11px] text-amber-800 dark:text-amber-300 font-medium leading-normal">
              Jika Anda menyetujui, data di atas akan digabungkan ke Step 2 form ini untuk melengkapi data generus master.
            </p>
          </div>
        </div>

        <DialogFooter className="px-6 py-4 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800/50 flex flex-col sm:flex-row gap-2">
          <Button
            variant="ghost"
            onClick={onDeclineLink}
            className="w-full sm:flex-1 rounded-xl h-11 text-slate-500 font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 m-0 order-2 sm:order-1"
          >
            Tidak, Buat Baru
          </Button>
          <Button
            onClick={onConfirmLink}
            className="w-full sm:flex-1 rounded-xl h-11 bg-indigo-600 hover:bg-indigo-700 text-white font-bold m-0 order-1 sm:order-2 shadow-lg shadow-indigo-100 dark:shadow-none gap-2 hover:scale-[1.02] active:scale-95 transition-all"
          >
            <UserCheck className="w-4 h-4" />
            <span>Ya, Tautkan Data</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
