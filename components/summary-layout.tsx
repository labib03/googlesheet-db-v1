"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

interface SummaryLayoutProps {
  children: ReactNode;
}

export function SummaryLayout({ children }: SummaryLayoutProps) {
  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={staggerContainer}
      className="space-y-10"
    >
      {children}
    </motion.div>
  );
}

export function SummarySection({ children }: { children: ReactNode }) {
  return (
    <motion.div variants={itemVariants}>
      {children}
    </motion.div>
  );
}
