"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/navbar";

interface PageTransitionWrapperProps {
  children: (onClose: () => void) => React.ReactNode;
}

export function PageTransitionWrapper({ children }: PageTransitionWrapperProps) {
  const [isOpen, setIsOpen] = useState(true);
  const router = useRouter();

  const handleClose = useCallback(() => {
    setIsOpen(false);
    // Wait for animation to complete before navigating back
    setTimeout(() => {
      router.back();
    }, 300); // Matching a standard spring-like duration
  }, [router]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", damping: 30, stiffness: 300 }}
          className="fixed inset-0 z-[100] min-h-screen bg-slate-50 dark:bg-slate-950 overflow-y-auto flex flex-col pb-12"
        >
          <Navbar />
          <main className="flex-1 w-full">
            {children(handleClose)}
          </main>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
