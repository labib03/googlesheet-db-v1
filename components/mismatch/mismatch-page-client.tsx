"use client";

import { SheetRow } from "@/lib/google-sheets";
import { DataDetailDialog } from "@/components/data-detail-dialog";
import { capitalizeWords, getCellValue, isMappingCorrect } from "@/lib/helper";
import { COLUMNS } from "@/lib/constants";
import { ArrowLeft, UserX, MapPin, AlertTriangle, ShieldCheck, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useDashboardData } from "@/hooks/use-dashboard-data";
import { DashboardFilters } from "../dashboard/dashboard-filters";
import { DashboardPagination } from "../dashboard/dashboard-pagination";
import { ListSkeleton } from "../skeletons";
import { motion, AnimatePresence } from "framer-motion";

interface MismatchPageClientProps {
  initialData: SheetRow[];
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

export function MismatchPageClient({ initialData, error }: MismatchPageClientProps) {
  const router = useRouter();
  const {
    filters,
    pagination,
    status,
    data,
    options,
    actions,
  } = useDashboardData({ initialData });

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
              Mismatch Audit Error
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
    <motion.div 
      initial="hidden"
      animate="show"
      variants={staggerContainer}
      className="space-y-8 font-outfit px-1"
    >
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
            <div className="p-2 bg-amber-500 rounded-xl text-white shadow-lg shadow-amber-200 dark:shadow-none transition-transform hover:scale-110">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight font-syne">
              Data Mismatch
            </h1>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xl pl-0">
            Menampilkan data generus yang mapping Desa dan Kelompok-nya tidak sesuai dengan database konfigurasi.
          </p>
        </div>

        <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 rounded-2xl border border-amber-100 dark:border-amber-900/50 text-xs font-bold uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4" />
            Total Mismatch: {initialData.length} Data
        </div>
      </motion.div>

      {/* Filters Section */}
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

      {/* Data Section */}
      <motion.div variants={itemVariants}>
        <Card className="border-none shadow-sm bg-white dark:bg-slate-900 overflow-hidden ring-1 ring-slate-200 dark:ring-slate-800 py-0 gap-0">
          <CardHeader className="border-b border-slate-50 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/30 p-5 md:p-6">
              <div className="flex items-center justify-between">
                  <div className="flex flex-col gap-0.5">
                      <CardTitle className="text-lg font-bold text-slate-800 dark:text-white">Mismatch Records</CardTitle>
                      <CardDescription className="text-xs">
                          {status.isFiltered ? `Found ${data.filteredData.length} records matching filters` : "Displaying records with inconsistent location mapping"}
                      </CardDescription>
                  </div>
                  <div className="text-[10px] hidden sm:block font-black uppercase tracking-widest text-amber-600 bg-amber-50 dark:bg-amber-900/30 px-3 py-1 rounded-full border border-amber-100 dark:border-amber-800">
                      Audit Mode
                  </div>
              </div>
          </CardHeader>
          <CardContent className="p-0">
            <AnimatePresence mode="wait">
              {status.isVisualPending ? (
                <motion.div 
                  key="skeleton"
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
                  key="empty"
                  variants={fadeVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className="p-20 text-center space-y-4"
                >
                   <div className="mx-auto w-16 h-16 bg-slate-50 dark:bg-slate-800/50 rounded-full flex items-center justify-center">
                      <ShieldCheck className="w-8 h-8 text-emerald-500" />
                   </div>
                   <p className="text-slate-400 font-medium">{status.isFiltered ? "No records found matching your current filters." : "All data looks correctly mapped! Great job."}</p>
                </motion.div>
              ) : (
                <motion.div 
                  key="data"
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
                      const gender = getCellValue(row, COLUMNS.GENDER);
                      const umur = getCellValue(row, COLUMNS.UMUR);
                      const jenjang = getCellValue(row, COLUMNS.JENJANG);

                      return (
                        <DataDetailDialog key={idx} row={row} ignoreViewConfig={true}>
                          <div className="p-6 hover:bg-slate-50 dark:hover:bg-slate-800/30 cursor-pointer transition-all flex items-center gap-5 group">
                            <div className="h-14 w-14 rounded-2xl bg-slate-100 dark:bg-slate-800/50 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform border border-slate-200 dark:border-slate-700 shadow-sm">
                              <UserX className="w-7 h-7 text-slate-400 group-hover:text-amber-500 transition-colors" />
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
                                <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-500 bg-rose-50 dark:bg-rose-950/30 px-2 py-0.5 rounded-md border border-rose-100 dark:border-rose-900/50">
                                  <MapPin className="w-3.5 h-3.5" />
                                  {kelompok} • {desa}
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
                                 EDIT & FIX
                               </span>
                            </div>
                          </div>
                        </DataDetailDialog>
                      );
                    })}
                  </div>

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
