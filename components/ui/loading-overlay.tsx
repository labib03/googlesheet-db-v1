"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function LoadingOverlay({ isPending }: { isPending: boolean }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPending) {
      // Small delay before showing full overlay to avoid flickering for super fast loads
      timer = setTimeout(() => setShow(true), 50);
    } else {
      setTimeout(() => setShow(false), 0);
    }
    return () => clearTimeout(timer);
  }, [isPending]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-white/60 dark:bg-slate-950/60 backdrop-blur-[4px]"
        >
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="relative"
          >
            <div className="absolute inset-0 bg-indigo-500 blur-2xl opacity-20 animate-pulse rounded-full"></div>
            <div className="relative h-16 w-16 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-xl">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
          </motion.div>
          <motion.p 
            initial={{ y: 5, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="mt-4 text-sm font-bold text-slate-800 dark:text-slate-100 tracking-tight font-syne"
          >
            Menyiapkan Data...
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
