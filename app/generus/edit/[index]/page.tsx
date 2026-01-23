"use client";

import { useDashboard } from "@/context/dashboard-context";
import { GenerusForm } from "@/components/forms/generus-form";
import { updateData } from "@/app/actions";
import { toast } from "sonner";
import { useParams } from "next/navigation";
import { useTransition, useMemo } from "react";
import { parseISO, format } from "date-fns";
import { motion } from "framer-motion";
import { PageTransitionWrapper } from "@/components/page-transition-wrapper";

export default function EditGenerusPage() {
  const { data, headers, refreshData, isLoading } = useDashboard();
  const [isPending, startTransition] = useTransition();
  const params = useParams();
  const index = Number(params.index);

  const row = useMemo(() => {
    const targetData = data.find(r => Number(r._index) === index)

    return targetData ;
  }, [data, index]);

  const handleSubmit = (formData: FormData, onClose: () => void) => {
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

      const result = await updateData(index + 2, null, formData);
      if (result.success) {
        toast.success(result.message);
        await refreshData(true);
        onClose();
      } else {
        toast.error(`Gagal: ${result.message}`);
      }
    });
  };

  if (isLoading || !row || !headers || headers.length === 0) {
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
          title="Edit Data"
          headers={headers}
          initialData={row}
          isPending={isPending}
          onSubmit={(fd) => handleSubmit(fd, onClose)}
          onCancel={onClose}
        />
      )}
    </PageTransitionWrapper>
  );
}
