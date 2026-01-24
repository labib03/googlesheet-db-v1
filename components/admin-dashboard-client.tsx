"use client";

import { useRef, useEffect, useState, useMemo } from "react";
import { AddDataDialog } from "@/components/add-data-dialog";
import { useViewConfig } from "@/context/view-config-context";
import { Checkbox } from "@/components/ui/checkbox";
import { SheetRow } from "@/lib/google-sheets";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { DashboardFilters } from "./dashboard/dashboard-filters";
import { DashboardTable } from "./dashboard/dashboard-table";
import { DashboardCards } from "./dashboard/dashboard-cards";
import { DashboardPagination } from "./dashboard/dashboard-pagination";
import { useDashboardData } from "@/hooks/use-dashboard-data";
import { Button } from "@/components/ui/button";
import { TableSkeleton, CardSkeleton } from "@/components/skeletons";
import { ShieldCheck, AlertCircle, History, Settings } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ExportButton } from "./dashboard/export-button";
import { COLUMNS } from "@/lib/constants";
import { BulkDeleteDialog } from "./bulk-delete-dialog";
import { Check, Trash } from "lucide-react";

interface AdminDashboardClientProps {
  initialData: SheetRow[];
  trashData: SheetRow[];
  headers: string[];
  error: string | null;
}

const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const fadeVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.3 } },
  exit: { opacity: 0, transition: { duration: 0.2 } }
};

export function AdminDashboardClient({
  initialData,
  trashData,
  headers,
  error,
}: AdminDashboardClientProps) {
  const {
    filters,
    pagination,
    status,
    data,
    options,
    actions,
  } = useDashboardData({ initialData });

  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);

  const toggleSelection = (sheetIndex: number) => {
    setSelectedIndices(prev => 
      prev.includes(sheetIndex) 
        ? prev.filter(i => i !== sheetIndex) 
        : [...prev, sheetIndex]
    );
  };

  const selectedNames = useMemo(() => {
    return initialData
      .filter(row => selectedIndices.includes(Number(row._index) + 2))
      .map(row => String(row[COLUMNS.NAMA] || "Tanpa Nama"));
  }, [selectedIndices, initialData]);

  const dataTopRef = useRef<HTMLDivElement | null>(null);
  const isFirstMount = useRef(true);

  const isEnableAdd = process.env.NEXT_PUBLIC_ENABLE_ADD === "true";
  const isEnableDelete = process.env.NEXT_PUBLIC_ENABLE_DELETE === "true";
  const isEnableEdit = process.env.NEXT_PUBLIC_ENABLE_EDIT === "true";

  const scrollToTop = () => {
    if (dataTopRef.current) {
      setTimeout(() => {
        dataTopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }
    scrollToTop();
  }, [pagination.currentPage, status.isFiltered, pagination.pageSize]);

  if (error) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="mx-auto max-w-2xl px-4"
      >
        <Card className="border-none shadow-sm bg-white dark:bg-slate-900 overflow-hidden ring-1 ring-slate-200 dark:ring-slate-800 font-outfit">
          <div className="h-2 bg-red-500" />
          <CardHeader className="pt-6">
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              Admin Access Error
            </CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial="hidden"
      animate="show"
      variants={staggerContainer}
      className="space-y-8 relative font-outfit"
    >
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-1">
        <div className="flex flex-col space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-600 rounded-xl text-white shadow-lg shadow-indigo-200 dark:shadow-none transition-transform hover:scale-110">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight font-syne">
              Admin Management
            </h1>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xl">
            Authorized personnel only. Data manipulation and deletion here will directly affect the Google Sheets database.
          </p>
        </div>
        
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap justify-end shrink-0 max-w-full">
          <Button
            asChild
            variant="outline"
            className="gap-2 rounded-xl h-10 w-10 p-0 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all shadow-sm shrink-0"
            title="Settings"
          >
            <Link href="/admin-restricted/settings">
              <Settings className="h-4 w-4 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 transition-colors" />
            </Link>
          </Button>

          <div className="shrink-0">
            <ExportButton data={data.filteredData} headers={headers} />
          </div>

          <Link href="/admin-restricted/trash" className="shrink-0">
            <Button 
                variant="outline" 
                className="gap-2 rounded-xl h-10 px-3 sm:px-5 border-slate-200 dark:border-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/20 hover:text-rose-600 hover:border-rose-100 transition-all font-semibold shadow-sm w-full sm:w-auto"
            >
                <History className="h-4 w-4" />
                <span className="text-xs sm:text-sm">Trash</span>
                {trashData.length > 0 && (
                    <span className="ml-1 bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full ring-2 ring-white dark:ring-slate-900 animate-pulse">
                        {trashData.length}
                    </span>
                )}
            </Button>
          </Link>

          {isEnableAdd && (
            <div className="shrink-0">
              <AddDataDialog headers={headers} />
            </div>
          )}
        </div>
      </motion.div>

      <motion.div variants={itemVariants}>
        <DashboardFilters
          filters={filters}
          options={options}
          status={status}
          pagination={pagination}
          totalCount={initialData.length}
          filteredCount={data.filteredData.length}
          actions={{
            ...actions,
            setCurrentPage: pagination.setCurrentPage,
          }}
        />
      </motion.div>

      <div ref={dataTopRef} className="scroll-mt-16" />

      <motion.div variants={itemVariants}>
        <Card className="border-none shadow-none bg-transparent">
          <CardContent className="p-0 relative">
            <AnimatePresence mode="wait">
              {status.isVisualPending ? (
                <motion.div 
                  key="skeleton-view"
                  variants={fadeVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className="p-8"
                >
                  <div className="hidden md:block">
                    <TableSkeleton />
                  </div>
                  <div className="md:hidden">
                    <CardSkeleton />
                  </div>
                </motion.div>
              ) : data.filteredData.length === 0 ? (
                <motion.div 
                  key="empty-view"
                  variants={fadeVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className="p-20 text-center bg-white dark:bg-slate-900 rounded-3xl ring-1 ring-slate-100 dark:ring-slate-800 shadow-sm mx-1"
                >
                   <p className="text-slate-500 font-medium">No records found matching your selection.</p>
                </motion.div>
              ) : (
                <motion.div 
                  key="data-view"
                  variants={fadeVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className="space-y-6"
                >
                  <DashboardTable
                    data={data.paginatedData}
                    headers={headers}
                    currentPage={pagination.currentPage}
                    pageSize={pagination.pageSize}
                    isEnableEdit={isEnableEdit}
                    isEnableDelete={isEnableDelete}
                    ignoreViewConfig={true}
                    selectedIndices={selectedIndices}
                    onToggleSelection={toggleSelection}
                  />

                  <DashboardCards
                    data={data.paginatedData}
                    headers={headers}
                    currentPage={pagination.currentPage}
                    pageSize={pagination.pageSize}
                    isEnableEdit={isEnableEdit}
                    isEnableDelete={isEnableDelete}
                    selectedIndices={selectedIndices}
                    onToggleSelection={toggleSelection}
                  />

                  <div className="pt-2">
                      <DashboardPagination
                        currentPage={pagination.currentPage}
                        totalPages={pagination.totalPages}
                        pageSize={pagination.pageSize}
                        onPageChange={(p) => actions.handleStartTransition(() => pagination.setCurrentPage(p))}
                        onPageSizeChange={(s) => actions.handleStartTransition(() => {
                          pagination.setPageSize(s);
                          pagination.setCurrentPage(1);
                        })}
                      />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </motion.div>

      {/* Premium Floating Action Bar */}
      <AnimatePresence>
        {selectedIndices.length > 0 && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-1.5rem)] sm:w-auto sm:min-w-[400px]"
          >
            <div className="bg-slate-900/90 dark:bg-slate-800/90 backdrop-blur-xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.3)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)] rounded-[2rem] p-2.5 flex items-center gap-4 group">
              {/* Left Side: Count & Icon */}
              <div className="flex items-center gap-3 pl-4 pr-2">
                <div className="relative">
                  <div className="h-10 w-10 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
                    <Check className="w-5 h-5" strokeWidth={3} />
                  </div>
                  <span className="absolute -top-1.5 -right-1.5 h-5 w-5 bg-white text-indigo-700 text-[10px] font-black rounded-full flex items-center justify-center border-2 border-indigo-600 shadow-sm animate-bounce">
                    {selectedIndices.length}
                  </span>
                </div>
                <div className="hidden sm:block whitespace-nowrap">
                   <p className="text-white font-bold text-sm tracking-tight leading-none">Data Terpilih</p>
                   <p className="text-slate-400 text-[10px] font-medium mt-1">Siap untuk aksi massal</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1.5 ml-auto">
                <Button
                  variant="ghost"
                  className="text-slate-300 hover:text-white hover:bg-white/5 rounded-2xl px-4 text-xs h-10 font-bold transition-all"
                  onClick={() => setSelectedIndices([])}
                >
                  BATAL
                </Button>
                
                {isEnableDelete && (
                  <BulkDeleteDialog 
                    selectedIndices={selectedIndices}
                    selectedNames={selectedNames}
                    onSuccess={() => setSelectedIndices([])}
                    trigger={
                       <Button 
                         variant="destructive"
                         className="rounded-2xl gap-2 h-10 px-6 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-900/20 border-t border-white/10 transition-all hover:scale-[1.02] active:scale-95 whitespace-nowrap"
                       >
                         <Trash className="w-4 h-4" />
                         <span>HAPUS MASSAL</span>
                       </Button>
                    }
                  />
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
