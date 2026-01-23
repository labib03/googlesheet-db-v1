"use client";

import { useRef, useEffect } from "react";
import { AddDataDialog } from "@/components/add-data-dialog";
import { SheetRow } from "@/lib/google-sheets";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { DashboardFilters } from "./dashboard/dashboard-filters";
import { DashboardTable } from "./dashboard/dashboard-table";
import { DashboardCards } from "./dashboard/dashboard-cards";
import { DashboardPagination } from "./dashboard/dashboard-pagination";
import { useDashboardData } from "@/hooks/use-dashboard-data";
import { TableSkeleton } from "@/components/skeletons";
import { ShieldCheck, AlertCircle } from "lucide-react";

interface AdminDashboardClientProps {
  initialData: SheetRow[];
  headers: string[];
  error: string | null;
}

export function AdminDashboardClient({
  initialData,
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

  const dataTopRef = useRef<HTMLDivElement | null>(null);
  const isFirstMount = useRef(true);

  const isEnableAdd = process.env.NEXT_PUBLIC_ENABLE_ADD === "true";
  // Force delete feature to true on Admin page, but respect ENV for visibility flag
  const isEnableDelete = process.env.NEXT_PUBLIC_ENABLE_DELETE === "true";
  // On Admin page, we allow Edit as well if needed, but the primary request was to move Delete here.
  const isEnableEdit = process.env.NEXT_PUBLIC_ENABLE_EDIT === "true";

  const scrollToTop = () => {
    if (dataTopRef.current) {
      // Small timeout ensures the DOM has updated its height before scrolling
      setTimeout(() => {
        dataTopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    }
  };

  // Force scroll to absolute top on initial load
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Auto scroll to top when data changes (paging, filtering, or page size)
  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }
    scrollToTop();
  }, [pagination.currentPage, status.isFiltered, pagination.pageSize]);

  if (error) {
    return (
      <Card className="mx-auto max-w-2xl border-none shadow-sm bg-white dark:bg-slate-900 overflow-hidden ring-1 ring-slate-200 dark:ring-slate-800">
        <div className="h-2 bg-red-500" />
        <CardHeader className="pt-6">
          <CardTitle className="text-xl font-bold flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            Admin Access Error
          </CardTitle>
          <CardDescription>{error}</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-8 relative pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex flex-col space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-600 rounded-xl text-white shadow-lg shadow-indigo-200 dark:shadow-none">
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
        
        {isEnableAdd && (
          <div className="shrink-0">
            <AddDataDialog headers={headers} />
          </div>
        )}
      </div>

      <DashboardFilters
        filters={filters}
        options={options}
        status={status}
        pagination={pagination}
        totalCount={data.filteredData.length}
        filteredCount={data.filteredData.length}
        actions={{
          ...actions,
          setCurrentPage: pagination.setCurrentPage,
        }}
      />

      <div ref={dataTopRef} className="scroll-mt-16" />

      <Card className="border-none shadow-none bg-transparent">
        <CardContent className="p-0 relative">
          {status.isVisualPending ? (
            <div className="p-8">
              <TableSkeleton />
            </div>
          ) : data.filteredData.length === 0 ? (
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-12 text-center">
               <p className="text-slate-500">No records found matching your selection.</p>
            </div>
          ) : (
            <>
              <DashboardTable
                data={data.paginatedData}
                headers={headers}
                currentPage={pagination.currentPage}
                pageSize={pagination.pageSize}
                isEnableEdit={isEnableEdit}
                isEnableDelete={isEnableDelete} // Primary focus
              />

              <DashboardCards
                data={data.paginatedData}
                headers={headers}
                currentPage={pagination.currentPage}
                pageSize={pagination.pageSize}
                isEnableEdit={isEnableEdit}
                isEnableDelete={isEnableDelete}
              />

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
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
