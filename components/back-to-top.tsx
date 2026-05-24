"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

export function BackToTop() {
  const [isVisible, setIsVisible] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      // Calculate scroll progress percentage
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        const progress = (window.scrollY / totalHeight) * 100;
        setScrollProgress(progress);
      } else {
        setScrollProgress(0);
      }

      // Show button only when scrolled down more than 300px
      setIsVisible(window.scrollY > 300);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    // Run once on mount to capture initial scroll state
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // SVG circle progress configurations
  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (scrollProgress / 100) * circumference;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.5, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.5, y: 20 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          onClick={scrollToTop}
          type="button"
          aria-label="Back to top"
          className="fixed bottom-6 right-6 z-50 flex h-12 w-12 items-center justify-center rounded-full border border-slate-200/80 bg-white/90 text-indigo-600 shadow-xl shadow-slate-200/50 backdrop-blur-md transition-colors hover:bg-slate-50 hover:text-indigo-700 active:scale-95 dark:border-slate-800/80 dark:bg-slate-900/90 dark:text-indigo-400 dark:shadow-none dark:hover:bg-slate-800 dark:hover:text-indigo-300 cursor-pointer"
        >
          {/* Circular Progress Ring */}
          <svg className="absolute -rotate-90 h-full w-full pointer-events-none">
            <circle
              cx="24"
              cy="24"
              r={radius}
              className="stroke-slate-200/30 dark:stroke-slate-800/30"
              strokeWidth="2"
              fill="transparent"
            />
            <motion.circle
              cx="24"
              cy="24"
              r={radius}
              className="stroke-indigo-500 dark:stroke-indigo-400"
              strokeWidth="2.5"
              fill="transparent"
              strokeDasharray={circumference}
              animate={{ strokeDashoffset }}
              transition={{ ease: "easeOut", duration: 0.1 }}
              strokeLinecap="round"
            />
          </svg>

          {/* Up Arrow Icon */}
          <ArrowUp className="h-5 w-5 z-10 transition-transform group-hover:-translate-y-0.5" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
