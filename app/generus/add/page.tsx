"use client";

import { useDashboard } from "@/context/dashboard-context";
import { GenerusForm } from "@/components/forms/generus-form";
import { addData } from "@/app/actions";
import { toast } from "sonner";
import { useTransition } from "react";
import { parseISO, format } from "date-fns";
import { motion } from "framer-motion";
import { PageTransitionWrapper } from "@/components/page-transition-wrapper";

export default function AddGenerusPage() {
  const { headers, refreshData, isLoading } = useDashboard();
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (formData: FormData, onClose: () => void) => {
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

      const result = await addData(null, formData);
      if (result.success) {
        toast.success(result.message);
        await refreshData();
        onClose();
      } else {
        toast.error(`Gagal: ${result.message}`);
      }
    });
  };

  if (isLoading || !headers || headers.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen bg-white dark:bg-slate-950">
        <motion.div 
          animate={{ rotate: 360 }} 
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <div className="h-10 w-10 border-4 border-indigo-600 border-t-transparent rounded-full" />
        </motion.div>
      </div>
    );
  }

  return (
    <PageTransitionWrapper>
      {(onClose) => (
        <GenerusForm 
          title="Tambah Generus"
          headers={headers}
          isPending={isPending}
          onSubmit={(fd) => handleSubmit(fd, onClose)}
          onCancel={onClose}
        />
      )}
    </PageTransitionWrapper>
  );
}
