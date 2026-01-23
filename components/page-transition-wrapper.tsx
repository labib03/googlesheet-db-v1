"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";

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
          className="fixed inset-0 z-[100] h-screen bg-white dark:bg-slate-900 overflow-hidden"
        >
          {children(handleClose)}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
