"use client";

import { useDashboard } from "@/context/dashboard-context";
import { GenerusForm } from "@/components/forms/generus-form";
import { updateData, checkAdditionalInfoByName } from "@/app/actions";
import { LinkMatchingModal } from "@/components/dashboard/link-matching-modal";
import { toast } from "sonner";
import { useParams } from "next/navigation";
import { useTransition, useMemo, useState, useEffect } from "react";
import { parseISO, format } from "date-fns";
import { motion } from "framer-motion";
import { PageTransitionWrapper } from "@/components/page-transition-wrapper";

export default function EditGenerusPage() {
  const { data, headers, refreshData, isLoading } = useDashboard();
  const [isPending, startTransition] = useTransition();
  const params = useParams();
  const index = Number(params.index);

  const row = useMemo(() => {
    return data.find(r => Number(r._index) === index);
  }, [data, index]);

  const [matchedInfo, setMatchedInfo] = useState<any>(null);
  const [linkIndex, setLinkIndex] = useState<number | null>(null);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkedInitialData, setLinkedInitialData] = useState<any>(null);

  useEffect(() => {
    if (row) {
      setLinkedInitialData(row);
      // If it has no linked AdditionalInfo row yet, check by name
      if (row._hasAdditionalInfo !== "true") {
        checkAdditionalInfoByName(String(row["NAMA LENGKAP"]))
          .then((res) => {
            if (res.success && res.found && res.data) {
              setMatchedInfo(res.data);
              setLinkIndex(res.rowIndex ?? null);
              setShowLinkModal(true);
            }
          })
          .catch(console.error);
      }
    }
  }, [row]);

  const handleConfirmLink = () => {
    if (!matchedInfo || !row) return;

    // Inject matched fields as _ai_[Field Name] into initial data
    const updatedInitialData = { ...row };
    for (const [key, value] of Object.entries(matchedInfo)) {
      if (key !== "Timestamp" && key !== "UserId" && key !== "_index") {
        updatedInitialData[`_ai_${key}`] = value as any;
      }
    }
    updatedInitialData["_hasAdditionalInfo"] = "true";

    setLinkedInitialData(updatedInitialData);
    setShowLinkModal(false);
    toast.success("Data tambahan berhasil ditautkan ke form!");
  };

  const handleDeclineLink = () => {
    setShowLinkModal(false);
    setLinkIndex(null);
  };

  const handleSubmit = (formData: FormData, onClose: () => void) => {
    if (linkIndex !== null) {
      formData.append("linkAdditionalInfoRowIndex", linkIndex.toString());
    }

    startTransition(async () => {
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

  if (isLoading || !row || !headers || headers.length === 0 || !linkedInitialData) {
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
    <>
      <PageTransitionWrapper>
        {(onClose) => (
          <GenerusForm 
            title="Edit Data"
            mode="edit"
            initialData={linkedInitialData}
            isPending={isPending}
            onSubmit={(fd) => handleSubmit(fd, onClose)}
            onCancel={onClose}
            linkAdditionalInfoRowIndex={linkIndex}
          />
        )}
      </PageTransitionWrapper>

      <LinkMatchingModal
        open={showLinkModal}
        onOpenChange={setShowLinkModal}
        nama={String(row["NAMA LENGKAP"])}
        matchedData={matchedInfo}
        onConfirmLink={handleConfirmLink}
        onDeclineLink={handleDeclineLink}
      />
    </>
  );
}
