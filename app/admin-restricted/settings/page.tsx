"use client";

import { ViewSettings } from "@/components/settings/view-settings";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export default function SettingsPage() {
  return (
    <div className="container mx-auto py-8 px-4 max-w-5xl space-y-8 font-outfit">
       <div className="flex items-center gap-4">
        <Button variant="ghost" asChild className="rounded-xl pl-0 hover:bg-transparent hover:text-indigo-600 transition-colors">
          <Link href="/admin-restricted">
            <ArrowLeft className="w-5 h-5 mr-2" />
            <span className="font-semibold text-lg">Back to Admin Dashboard</span>
          </Link>
        </Button>
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
