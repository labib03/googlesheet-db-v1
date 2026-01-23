"use client";

import { useDashboard } from "@/context/dashboard-context";
import { GenerusDetail } from "@/components/details/generus-detail";
import { useParams } from "next/navigation";
import { useMemo } from "react";
import { motion } from "framer-motion";
import { PageTransitionWrapper } from "@/components/page-transition-wrapper";

export default function DetailGenerusPage() {
  const { data, isLoading } = useDashboard();
  const params = useParams();
  const index = Number(params.index);

  const row = useMemo(() => {
    return data.find(r => Number(r._index) === index);
  }, [data, index]);

  if (isLoading || !row) {
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
        <GenerusDetail 
          row={row}
          onBack={onClose}
        />
      )}
    </PageTransitionWrapper>
  );
}
