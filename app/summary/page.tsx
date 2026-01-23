import Link from "next/link";
import { getSheetData, SheetRow } from "@/lib/google-sheets";
import { Navbar } from "@/components/navbar";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { SummaryList } from "@/components/summary-list";
import { SummaryDesaList } from "@/components/summary-desa-list";
import { BarChart, ArrowLeft } from "lucide-react";
import { StatsOverview } from "@/components/dashboard/stats-overview";
import { AnalyticsService } from "@/services/analytics-service";

export const dynamic = "force-dynamic";

interface SummaryPageProps {
  searchParams?: Promise<{ desa?: string; kelompok?: string }>;
}

export default async function SummaryPage({ searchParams }: SummaryPageProps) {
  let rows: SheetRow[] = [];
  let error: string | null = null;

  // Resolve search params
  const resolvedParams = searchParams ? await searchParams : {};
  const selectedDesa = resolvedParams.desa || "";
  const selectedKelompok = resolvedParams.kelompok || "";

  try {
    const rawData = await getSheetData();
    rows = AnalyticsService.processRows(rawData);
  } catch (err) {
    error = err instanceof Error ? err.message : "Gagal memuat data";
  }

  // Get Desa Summary
  const desaList = AnalyticsService.getDesaSummary(rows);
  const selectedDesaNode = desaList.find(
    (d) => d.key === selectedDesa.toLowerCase(),
  );
  const selectedDesaLabel = selectedDesaNode
    ? selectedDesaNode.label
    : selectedDesa;

  // Get Kelompok Summary (only if desa is selected)
  const kelompokList = selectedDesa
    ? AnalyticsService.getKelompokSummary(rows, selectedDesa)
    : [];
  const selectedKelompokNode = kelompokList.find(
    (k) => k.key === selectedKelompok.toLowerCase(),
  );
  const selectedKelompokLabel = selectedKelompokNode
    ? selectedKelompokNode.label
    : selectedKelompok;

  // Filter for Stats
  const filteredRowsForStats = AnalyticsService.filterRows(
    rows,
    selectedDesa,
    selectedKelompok,
  );

  const totalRows = rows.length;
  const showKelompokView = !!selectedDesa;

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950/50 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-10">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6 pb-2 border-b border-slate-200/60 dark:border-slate-800/60">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
              Summary Analytics
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Distribution and distribution metrics for{" "}
              <span className="text-indigo-600 dark:text-indigo-400 font-semibold">
                {totalRows.toLocaleString("id-ID")}
              </span>{" "}
              records.
            </p>
          </div>

          <div className="flex gap-3">
            <Button
              asChild
              variant="ghost"
              className="rounded-xl px-4 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 transition-colors"
            >
              <Link href="/">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Link>
            </Button>
          </div>
        </div>

        {/* Global Statistics Overview */}
        <div
          key={`${selectedDesa}-${selectedKelompok}`}
          className="animate-in fade-in slide-in-from-bottom-4 duration-700"
        >
          <StatsOverview data={filteredRowsForStats} />
        </div>

        {/* Breadcrumb */}
        <div className="bg-white dark:bg-slate-900 px-5 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between animate-in fade-in slide-in-from-bottom-2 duration-500">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-100 dark:bg-indigo-950/40 p-1.5 rounded-lg">
              <BarChart className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            </div>
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link
                      href="/summary"
                      className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors font-medium"
                    >
                      Summary
                    </Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link
                      href={
                        selectedDesa
                          ? `/summary?desa=${encodeURIComponent(selectedDesaLabel)}`
                          : "/summary"
                      }
                      className="hover:text-indigo-600 transition-colors font-medium"
                    >
                      {selectedDesaLabel || "Desa Overview"}
                    </Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                {selectedKelompok && (
                  <>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                      <BreadcrumbPage className="font-semibold text-slate-900 dark:text-white">
                        {selectedKelompokLabel}
                      </BreadcrumbPage>
                    </BreadcrumbItem>
                  </>
                )}
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest hidden sm:inline">
            Analytics Node / Active
          </span>
        </div>

        {error && (
          <Card className="mx-auto max-w-2xl border-none shadow-sm bg-white dark:bg-slate-900 rounded-2xl ring-1 ring-red-100 dark:ring-red-900/30 overflow-hidden animate-in zoom-in-95 duration-500">
            <div className="h-1.5 bg-red-500" />
            <CardHeader>
              <CardTitle className="text-xl font-bold text-red-600 flex items-center gap-2">
                <span>⚠️</span> Sync Error
              </CardTitle>
              <CardDescription className="text-slate-500">
                {error}
              </CardDescription>
            </CardHeader>
          </Card>
        )}

        {!error && (
          <div className="grid grid-cols-1 gap-12 animate-in fade-in slide-in-from-bottom-6 duration-1000">
            {showKelompokView ? (
              <div className="space-y-6 relative">
                <div className="flex justify-start">
                  <Button
                    asChild
                    variant="ghost"
                    size="sm"
                    className="rounded-xl text-slate-500 hover:text-indigo-600 transition-colors"
                  >
                    <Link href="/summary">
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Kembali Pilih Desa
                    </Link>
                  </Button>
                </div>
                <SummaryList
                  title="Distribution [Kelompok]"
                  description={`Audit klaster data di desa: ${selectedDesaLabel}. Klik grup untuk menampilkan analitik yang terfilter.`}
                  items={kelompokList}
                  selectedKey={selectedKelompok.toLowerCase()}
                  isClickable={true}
                  selectionType="kelompok"
                  baseParams={{ desa: selectedDesaLabel }}
                />
              </div>
            ) : (
              <SummaryDesaList
                items={desaList}
                selectedKey={selectedDesa.toLowerCase()}
              />
            )}
          </div>
        )}
      </main>
    </div>
  );
}
