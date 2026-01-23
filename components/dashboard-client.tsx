"use client";

import { useState, useEffect, useRef } from "react";
import { SheetRow } from "@/lib/google-sheets";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExportButton } from "./dashboard/export-button";
import { TableSkeleton } from "@/components/skeletons";
import { DashboardFilters } from "./dashboard/dashboard-filters";
import { DashboardTable } from "./dashboard/dashboard-table";
import { DashboardCards } from "./dashboard/dashboard-cards";
import { DashboardPagination } from "./dashboard/dashboard-pagination";
import { useDashboardData } from "@/hooks/use-dashboard-data";
import { useDashboard } from "@/context/dashboard-context";
import Link from "next/link";
import { ArrowUp, BarChart3 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface DashboardClientProps {
  initialData: SheetRow[];
  headers: string[];
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

export function DashboardClient({
  initialData,
  headers,
}: DashboardClientProps) {
  const { scrollPosition, setScrollPosition } = useDashboard();
  const { filters, pagination, status, data, options, actions } =
    useDashboardData({ initialData });

  const [showBackToTop, setShowBackToTop] = useState(false);
  const dataTopRef = useRef<HTMLDivElement | null>(null);
  // Handle Scroll to Top Button Visibility
  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY >= window.innerHeight * 2);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Restore scroll position on mount
  useEffect(() => {
    if (scrollPosition > 0) {
      // Small delay to ensure content is rendered
      const timer = setTimeout(() => {
        window.scrollTo({ top: scrollPosition, behavior: "instant" });
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [scrollPosition]);

  // Record scroll position before unmounting (moving to sub-pages)
  useEffect(() => {
    return () => {
      setScrollPosition(window.scrollY);
    };
  }, [setScrollPosition]);

  const scrollToTop = () => {
    if (dataTopRef.current) {
      setTimeout(() => {
        dataTopRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 100);
    }
  };

  return (
    <motion.div 
      initial="hidden"
      animate="show"
      variants={staggerContainer}
      className="space-y-8 relative font-outfit"
    >
      <motion.div variants={itemVariants} className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight font-syne">
            Data Generus
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Monitoring{" "}
            <span className="text-slate-900 dark:text-slate-200 font-semibold">
              {data.filteredData.length.toLocaleString("id-ID")}
            </span>{" "}
            records.
          </p>
        </div>
        <div className="w-full lg:w-auto flex flex-wrap gap-3">
          <Button
            asChild
            variant="outline"
            className="gap-2 rounded-xl h-10 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors shadow-sm"
          >
            <Link href="/summary">
              <BarChart3 className="h-4 w-4 text-indigo-500" />
              Summary
            </Link>
          </Button>
          <ExportButton data={data.filteredData} headers={headers} />
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
                  key="skeleton-dashboard"
                  variants={fadeVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className="p-8"
                >
                  <TableSkeleton />
                </motion.div>
              ) : data.filteredData.length === 0 ? (
                <motion.div 
                  key="empty-dashboard"
                  variants={fadeVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-sm p-8 text-center space-y-3"
                >
                  <div className="text-lg font-semibold text-slate-800 dark:text-slate-100">
                    Tidak ada data
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {status.isFiltered
                      ? "Tidak ada data yang sesuai filter. Coba ubah atau reset filter."
                      : "Belum ada data yang tersedia."}
                  </p>
                  {status.isFiltered && (
                    <div className="flex justify-center">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={actions.resetFilters}
                      >
                        Reset Filter
                      </Button>
                    </div>
                  )}
                </motion.div>
              ) : (
                <motion.div 
                  key="data-dashboard"
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
                    isEnableEdit={false}
                    isEnableDelete={false}
                  />

                  <DashboardCards
                    data={data.paginatedData}
                    headers={headers}
                    currentPage={pagination.currentPage}
                    pageSize={pagination.pageSize}
                    isEnableEdit={false}
                    isEnableDelete={false}
                  />

                  {data.filteredData.length > 0 && (
                    <DashboardPagination
                      currentPage={pagination.currentPage}
                      totalPages={pagination.totalPages}
                      pageSize={pagination.pageSize}
                      onPageChange={(p) =>
                        actions.handleStartTransition(() => {
                          pagination.setCurrentPage(p);
                          scrollToTop();
                        })
                      }
                      onPageSizeChange={(s) =>
                        actions.handleStartTransition(() => {
                          pagination.setPageSize(s);
                          pagination.setCurrentPage(1);
                          scrollToTop();
                        })
                      }
                    />
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </motion.div>

      {/* Back to Top */}
      <AnimatePresence>
        {showBackToTop && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
          >
            <Button
              onClick={scrollToTop}
              size="icon"
              className="fixed bottom-8 right-8 h-12 w-12 rounded-full shadow-2xl bg-indigo-600 hover:bg-indigo-700 text-white z-50"
              aria-label="Kembali ke atas"
            >
              <ArrowUp className="h-5 w-5" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
