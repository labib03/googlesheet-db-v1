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
import { Button } from "@/components/ui/button";
import { TableSkeleton } from "@/components/skeletons";
import { ShieldCheck, AlertCircle, History } from "lucide-react";
import Link from "next/link";

interface AdminDashboardClientProps {
  initialData: SheetRow[];
  trashData: SheetRow[];
  headers: string[];
  error: string | null;
}

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
    <div className="space-y-8 relative">
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
        
        <div className="flex items-center gap-3 shrink-0">
          <Link href="/admin-restricted/trash">
            <Button 
                variant="outline" 
                className="gap-2 rounded-xl h-10 px-5 border-slate-200 dark:border-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/20 hover:text-rose-600 hover:border-rose-100 transition-all font-semibold"
            >
                <History className="h-4 w-4" />
                <span>Lihat Trash</span>
                {trashData.length > 0 && (
                    <span className="ml-1 bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full ring-2 ring-white dark:ring-slate-900">
                        {trashData.length}
                    </span>
                )}
            </Button>
          </Link>

          {isEnableAdd && (
            <AddDataDialog headers={headers} />
          )}
        </div>
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
            <div className="p-20 text-center">
               <p className="text-slate-500 font-medium">No records found matching your selection.</p>
            </div>
          ) : (
            <>
              <DashboardTable
                data={data.paginatedData}
                headers={headers}
                currentPage={pagination.currentPage}
                pageSize={pagination.pageSize}
                isEnableEdit={isEnableEdit}
                isEnableDelete={isEnableDelete}
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
