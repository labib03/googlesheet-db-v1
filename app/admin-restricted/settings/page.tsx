"use client";

import { ViewSettings } from "@/components/settings/view-settings";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { BackButton } from "@/components/ui/back-button";

export default function SettingsPage() {
  return (
    <div className="container mx-auto py-8 px-4 max-w-5xl space-y-8 font-outfit">
      <div className="flex items-center -ml-2 sm:-ml-4 mb-2">
        <BackButton href="/admin-restricted" label="Kembali ke Admin Dashboard" className="w-fit hover:bg-transparent" />
      </div>

      <div className="bg-white dark:bg-slate-950 rounded-3xl p-6 sm:p-10 border border-slate-200 dark:border-slate-800 shadow-sm">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <ViewSettings />
        </motion.div>
      </div>
    </div>
  );
}
