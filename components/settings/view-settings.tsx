"use client";

import { useDashboard } from "@/context/dashboard-context";
import { useViewConfig, ViewConfig } from "@/context/view-config-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { RotateCcw, LayoutTemplate, Smartphone, FileText } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export function ViewSettings() {
  const { headers } = useDashboard();
  const { config, updateConfig, resetConfig } = useViewConfig();
  const [activeTab, setActiveTab] = useState<keyof ViewConfig>("tableColumns");

  const handleToggle = (key: keyof ViewConfig, field: string) => {
    const currentVisible = config[key].length > 0 ? config[key] : headers;
    const isVisible = currentVisible.includes(field);
    
    let newVisible;
    if (isVisible) {
      newVisible = currentVisible.filter(f => f !== field);
    } else {
      newVisible = [...currentVisible, field];
    }
    
    updateConfig(key, newVisible);
  };

  const isFieldVisible = (key: keyof ViewConfig, field: string) => {
    if (config[key].length === 0) return true;
    return config[key].includes(field);
  };

  const renderToggleList = (sectionKey: keyof ViewConfig) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-in fade-in duration-500">
      {headers.map((header) => (
        <div key={header} className="flex items-center justify-between p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900/50 hover:border-indigo-100 dark:hover:border-indigo-900/50 transition-colors shadow-sm">
          <label htmlFor={`${sectionKey}-${header}`} className="text-sm font-medium cursor-pointer flex-1 mr-4 select-none text-slate-700 dark:text-slate-300">
            {header}
          </label>
          <Switch 
            id={`${sectionKey}-${header}`}
            checked={isFieldVisible(sectionKey, header)}
            onChange={() => handleToggle(sectionKey, header)}
          />
        </div>
      ))}
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">View Configuration</h2>
          <p className="text-sm text-slate-500">Customize what data is displayed across different views.</p>
        </div>
        <Button variant="outline" onClick={() => { resetConfig(); toast.success("Configuration reset to default"); }} className="gap-2 rounded-xl border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900">
          <RotateCcw className="w-4 h-4" />
          Reset All
        </Button>
      </div>

      <div className="w-full">
        {/* Custom Tabs List */}
        <div className="grid w-full grid-cols-3 mb-8 p-1 bg-slate-100 dark:bg-slate-900 rounded-2xl">
          <button
            onClick={() => setActiveTab("tableColumns")}
            className={cn(
              "flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-xl transition-all",
              activeTab === "tableColumns" 
                ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm ring-1 ring-slate-200 dark:ring-slate-700" 
                : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-300"
            )}
          >
            <LayoutTemplate className="w-4 h-4" />
            <span className="hidden sm:inline">Table View</span>
          </button>
          <button
            onClick={() => setActiveTab("cardFields")}
            className={cn(
              "flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-xl transition-all",
              activeTab === "cardFields" 
                ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm ring-1 ring-slate-200 dark:ring-slate-700" 
                : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-300"
            )}
          >
            <Smartphone className="w-4 h-4" />
            <span className="hidden sm:inline">Card View</span>
          </button>
          <button
            onClick={() => setActiveTab("detailFields")}
            className={cn(
              "flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-xl transition-all",
              activeTab === "detailFields" 
                ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm ring-1 ring-slate-200 dark:ring-slate-700" 
                : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-300"
            )}
          >
            <FileText className="w-4 h-4" />
            <span className="hidden sm:inline">Detail View</span>
          </button>
        </div>

        {/* Tab Content */}
        <Card className="border-none shadow-none bg-transparent">
           <CardHeader className="px-0 pt-0 pb-6">
             <CardTitle className="text-lg">
                {activeTab === "tableColumns" && "Table Visibility"}
                {activeTab === "cardFields" && "Card Visibility"}
                {activeTab === "detailFields" && "Detail Modal Visibility"}
             </CardTitle>
             <CardDescription>
                {activeTab === "tableColumns" && "Select columns to display in the main data table (Desktop)."}
                {activeTab === "cardFields" && "Select fields to show on mobile card cards."}
                {activeTab === "detailFields" && "Select properties to show in the detailed view modal."}
             </CardDescription>
           </CardHeader>
           <CardContent className="px-0 overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.2 }}
                >
                  {renderToggleList(activeTab)}
                </motion.div>
              </AnimatePresence>
           </CardContent>
        </Card>
      </div>
    </div>
  );
}
