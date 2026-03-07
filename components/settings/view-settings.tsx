"use client";

import { useDashboard } from "@/context/dashboard-context";
import { useViewConfig, ViewConfig } from "@/context/view-config-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { RotateCcw, LayoutTemplate, Smartphone, FileText, Save, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useState, useEffect, useTransition } from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { saveGlobalConfig } from "@/app/actions";
import { CONFIG_KEYS, COLUMNS, ADDITIONAL_INFO_COLUMNS } from "@/lib/constants";

export function ViewSettings() {
  const { headers } = useDashboard();
  const { config, updateConfig, resetConfig } = useViewConfig();
  const [activeTab, setActiveTab] = useState<keyof ViewConfig>("tableColumns");
  const [localConfig, setLocalConfig] = useState<ViewConfig>(config);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setLocalConfig(config);
  }, [config]);

  const handleToggle = (key: keyof ViewConfig, field: string) => {
    const currentList = localConfig[key];
    const newList = currentList.includes(field)
      ? currentList.filter((f) => f !== field)
      : [...currentList, field];

    setLocalConfig((prev) => ({ ...prev, [key]: newList }));
  };

  const isFieldVisible = (key: keyof ViewConfig, field: string) => {
    return localConfig[key].includes(field);
  };

  const handleSave = (key: keyof ViewConfig) => {
    startTransition(async () => {
      updateConfig(key, localConfig[key]);

      const dbKeyMap: Record<keyof ViewConfig, string> = {
        tableColumns: CONFIG_KEYS.VIEW_TABLE_COLS,
        cardFields: CONFIG_KEYS.VIEW_CARD_FIELDS,
        detailFields: CONFIG_KEYS.VIEW_DETAIL_FIELDS,
        additionalInfoFields: CONFIG_KEYS.VIEW_ADDITIONAL_INFO_FIELDS,
      };

      const dbKey = dbKeyMap[key];
      if (dbKey) {
        const result = await saveGlobalConfig(dbKey, localConfig[key]);
        if (result.success) {
          toast.success("Settings saved to configuration sheet");
        } else {
          toast.error("Failed to save settings");
        }
      }
    });
  };

  const mainHeaders = [...headers.filter(h => !h.startsWith("_")), COLUMNS.UMUR];
  const aiHeaders = [...ADDITIONAL_INFO_COLUMNS];

  const renderToggleList = (sectionKey: keyof ViewConfig) => (
    <div className="space-y-8">
      {/* Main Columns */}
      <div>
        <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">
          Data Utama (Form Responses)
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-in fade-in duration-500">
          {mainHeaders.map((header) => (
            <div
              key={header}
              className="flex items-center justify-between p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900/50 hover:border-indigo-100 dark:hover:border-indigo-900/50 transition-colors shadow-sm"
            >
              <label
                htmlFor={`${sectionKey}-${header}`}
                className="text-sm font-medium cursor-pointer flex-1 mr-4 select-none text-slate-700 dark:text-slate-300"
              >
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
      </div>

      {/* AdditionalInfo Columns */}
      <div>
        <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
          <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
          Additional Info
          <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-in fade-in duration-500">
          {aiHeaders.map((header) => (
            <div
              key={`ai-${header}`}
              className="flex items-center justify-between p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900/50 hover:border-indigo-100 dark:hover:border-indigo-900/50 transition-colors shadow-sm"
            >
              <label
                htmlFor={`${sectionKey}-ai-${header}`}
                className="text-sm font-medium cursor-pointer flex-1 mr-4 select-none text-slate-700 dark:text-slate-300"
              >
                {header}
              </label>
              <Switch
                id={`${sectionKey}-ai-${header}`}
                checked={isFieldVisible(sectionKey, `_ai_${header}`)}
                onChange={() => handleToggle(sectionKey, `_ai_${header}`)}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const tabConfig = [
    { key: "tableColumns" as keyof ViewConfig, label: "Table View", icon: LayoutTemplate, description: "Select columns to display in the main data table (Desktop).", title: "Table Visibility" },
    { key: "cardFields" as keyof ViewConfig, label: "Card View", icon: Smartphone, description: "Select fields to show on mobile card cards.", title: "Card Visibility" },
    { key: "detailFields" as keyof ViewConfig, label: "Detail View", icon: FileText, description: "Select properties to show in the detailed view modal.", title: "Detail Modal Visibility" },
  ];

  const activeTabConfig = tabConfig.find(t => t.key === activeTab) || tabConfig[0];

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            View Configuration
          </h2>
          <p className="text-sm text-slate-500">
            Customize what data is displayed across different views.
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => {
            resetConfig();
            toast.success("Configuration reset to default");
          }}
          className="gap-2 rounded-xl border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900"
        >
          <RotateCcw className="w-4 h-4" />
          Reset All
        </Button>
      </div>

      <div className="w-full">
        <div className="grid w-full grid-cols-3 mb-8 p-1 bg-slate-100 dark:bg-slate-900 rounded-2xl">
          {tabConfig.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={cn(
                "flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-xl transition-all",
                activeTab === key
                  ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm ring-1 ring-slate-200 dark:ring-slate-700"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-300"
              )}
            >
              <Icon className="w-4 h-4" />
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>

        <Card className="border-none shadow-none bg-transparent">
          <CardHeader className="px-0 pt-0 pb-6 flex flex-row items-center justify-between space-y-0">
            <div className="space-y-1.5">
              <CardTitle className="text-lg">{activeTabConfig.title}</CardTitle>
              <CardDescription>{activeTabConfig.description}</CardDescription>
            </div>
            <Button
              onClick={() => handleSave(activeTab)}
              disabled={isPending}
              className="rounded-xl px-6 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition-all active:scale-95 shadow-lg shadow-indigo-200 dark:shadow-none"
            >
              {isPending ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Save Changes
            </Button>
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
