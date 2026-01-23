"use client";

import { SheetRow } from "@/lib/google-sheets";
import { DataDetailDialog } from "@/components/data-detail-dialog";
import { capitalizeWords, getCellValue } from "@/lib/helper";
import { COLUMNS } from "@/lib/constants";
import { Trash2, ArrowLeft, UserX, MapPin, Calendar, AlertCircle, History } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useTrashPageData } from "@/hooks/use-trash-page-data";
import { DashboardFilters } from "../dashboard/dashboard-filters";
import { DashboardPagination } from "../dashboard/dashboard-pagination";
import { ListSkeleton } from "../skeletons";
import { motion, AnimatePresence } from "framer-motion";

interface TrashPageClientProps {
  initialTrashData: SheetRow[];
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
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const fadeVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.3 } },
  exit: { opacity: 0, transition: { duration: 0.2 } }
};

export function TrashPageClient({ initialTrashData, error }: TrashPageClientProps) {
  const router = useRouter();
  const {
    filters,
    pagination,
    status,
    data,
    options,
    actions,
  } = useTrashPageData({ initialTrashData });

  const navigateBack = () => router.push('/admin-restricted');

  if (error) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="mx-auto max-w-2xl"
      >
        <Card className="border-none shadow-sm bg-white dark:bg-slate-900 overflow-hidden ring-1 ring-slate-200 dark:ring-slate-800 font-outfit">
          <div className="h-2 bg-red-500" />
          <CardHeader className="pt-6">
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              Trash Access Error
            </CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent>
               <Button variant="outline" onClick={navigateBack} className="rounded-xl">
                  <ArrowLeft className="w-4 h-4 mr-2" /> Back to Admin
               </Button>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial="hidden"
      animate="show"
      variants={staggerContainer}
      className="space-y-8 font-outfit px-1"
    >
      {/* Header Section */}
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-1">
        <div className="flex flex-col space-y-2">
          <div className="flex items-center gap-3">
             <Button 
                variant="ghost" 
                size="icon" 
                onClick={navigateBack}
                className="h-10 w-10 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 shrink-0"
             >
                <ArrowLeft className="w-5 h-5" />
             </Button>
            <div className="p-2 bg-rose-500 rounded-xl text-white shadow-lg shadow-rose-200 dark:shadow-none transition-transform hover:scale-110">
              <Trash2 className="w-6 h-6" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight font-syne">
              Recently Deleted
            </h1>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xl pl-0">
            Viewing items that have been soft-deleted from the main database. These records are stored in the &ldquo;Trash&rdquo; sheet as a safety archive.
          </p>
        </div>

        <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 rounded-2xl border border-indigo-100 dark:border-indigo-900/50 text-xs font-bold uppercase tracking-wider">
            <History className="w-4 h-4" />
            Total Archive: {initialTrashData.length} Data
        </div>
      </motion.div>

      {/* Filters Section */}
      <motion.div variants={itemVariants}>
        <DashboardFilters
          filters={filters}
          options={options}
          status={status}
          pagination={pagination}
          totalCount={initialTrashData.length}
          filteredCount={data.filteredData.length}
          hideDuplicates={true}
          actions={{
            ...actions,
            setCurrentPage: pagination.setCurrentPage,
          }}
        />
      </motion.div>

      {/* Data Section */}
      <motion.div variants={itemVariants}>
        <Card className="border-none shadow-sm bg-white dark:bg-slate-900 overflow-hidden ring-1 ring-slate-200 dark:ring-slate-800 py-0 gap-0">
          <CardHeader className="border-b border-slate-50 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/30 p-5 md:p-6">
              <div className="flex items-center justify-between">
                  <div className="flex flex-col gap-0.5">
                      <CardTitle className="text-lg font-bold text-slate-800 dark:text-white">Archive Records</CardTitle>
                      <CardDescription className="text-xs">
                          {status.isFiltered ? `Found ${data.filteredData.length} records matching filters` : "Displaying chronological archive of deleted data"}
                      </CardDescription>
                  </div>
                  <div className="text-[10px] hidden sm:block font-black uppercase tracking-widest text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full border border-slate-200 dark:border-slate-700">
                      Trash Bin
                  </div>
              </div>
          </CardHeader>
          <CardContent className="p-0">
            <AnimatePresence mode="wait">
              {status.isVisualPending ? (
                <motion.div 
                  key="skeleton-trash"
                  variants={fadeVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className="p-8"
                >
                  <ListSkeleton />
                </motion.div>
              ) : data.filteredData.length === 0 ? (
                <motion.div 
                  key="empty-trash"
                  variants={fadeVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className="p-20 text-center space-y-4"
                >
                   <div className="mx-auto w-16 h-16 bg-slate-50 dark:bg-slate-800/50 rounded-full flex items-center justify-center">
                      <Trash2 className="w-8 h-8 text-slate-300" />
                   </div>
                   <p className="text-slate-400 font-medium">{status.isFiltered ? "No records found matching your current filters." : "Your trash bin is currently empty."}</p>
                   {status.isFiltered && (
                       <Button variant="outline" onClick={actions.resetFilters} className="rounded-xl h-10 px-6">
                          Clear Filters
                       </Button>
                   )}
                </motion.div>
              ) : (
                <motion.div 
                  key="data-trash"
                  variants={fadeVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className="flex flex-col"
                >
                  <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {data.paginatedData.map((row, idx) => {
                      const name = getCellValue(row, COLUMNS.NAMA);
                      const desa = getCellValue(row, COLUMNS.DESA);
                      const kelompok = getCellValue(row, COLUMNS.KELOMPOK);
                      const deletedDate = row["Timestamp"] || "Unknown date";
                      const gender = getCellValue(row, COLUMNS.GENDER);
                      const umur = getCellValue(row, COLUMNS.UMUR);
                      const jenjang = getCellValue(row, COLUMNS.JENJANG);

                      const getJenjangStyle = (j: string) => {
                        switch (j.toLowerCase()) {
                          case "paud": return "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800";
                          case "caberawit a": return "bg-stone-100 text-stone-700 border-stone-200 dark:bg-stone-900/30 dark:text-stone-400 dark:border-stone-800";
                          case "caberawit b": return "bg-sky-100 text-sky-700 border-sky-200 dark:bg-sky-900/30 dark:text-sky-400 dark:border-sky-800";
                          case "caberawit c": return "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800";
                          case "pra remaja": return "bg-cyan-100 text-cyan-700 border-cyan-200 dark:bg-cyan-900/30 dark:text-cyan-400 dark:border-cyan-800";
                          case "remaja": return "bg-teal-100 text-teal-700 border-teal-200 dark:bg-teal-900/30 dark:text-teal-400 dark:border-teal-800";
                          case "pra nikah": return "bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-900/30 dark:text-rose-400 dark:border-rose-800";
                          default: return "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700";
                        }
                      };

                      return (
                        <DataDetailDialog key={idx} row={row}>
                          <div className="p-6 hover:bg-slate-50 dark:hover:bg-slate-800/30 cursor-pointer transition-all flex items-center gap-5 group">
                            <div className="h-14 w-14 rounded-2xl bg-slate-100 dark:bg-slate-800/50 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform border border-slate-200 dark:border-slate-700 shadow-sm">
                              <UserX className="w-7 h-7 text-slate-400 group-hover:text-rose-500 transition-colors" />
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                 <h4 className="font-bold text-xl text-slate-900 dark:text-white truncate tracking-tight leading-tight">
                                    {capitalizeWords(name) || "Unnamed Record"}
                                 </h4>
                                 {jenjang && (
                                    <span className={`hidden sm:inline-block px-2 py-0.5 rounded-lg border text-[10px] font-black uppercase tracking-wider ${getJenjangStyle(jenjang)}`}>
                                        {jenjang}
                                    </span>
                                 )}
                              </div>
                              <div className="flex flex-wrap gap-x-5 gap-y-1.5">
                                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                                  <MapPin className="w-3.5 h-3.5 text-indigo-500" />
                                  {kelompok} • {desa}
                                </div>
                                <div className="flex items-center gap-1.5 text-xs font-medium text-slate-400 italic">
                                  <Calendar className="w-3.5 h-3.5 text-rose-400" />
                                  Dipindahkan: {String(deletedDate)}
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-500 uppercase tracking-tighter">
                                        {gender}
                                    </div>
                                    {umur && (
                                        <span className="text-[11px] font-bold text-slate-400">
                                            {umur} Tahun
                                        </span>
                                    )}
                                </div>
                              </div>
                            </div>

                            <div className="hidden sm:flex flex-col items-end gap-2 pr-2">
                               <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 px-4 py-2 bg-indigo-50 dark:bg-indigo-950/40 rounded-full border border-indigo-100 dark:border-indigo-900/50 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0 shadow-sm active:scale-95">
                                 VIEW DETAILS
                               </span>
                            </div>
                          </div>
                        </DataDetailDialog>
                      );
                    })}
                  </div>

                  {/* Pagination Section */}
                  <div className="bg-slate-50/50 dark:bg-slate-900/30 p-4 border-t border-slate-100 dark:border-slate-800">
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
    </motion.div>
  );
}
