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
import { ArrowLeft, Users, Home } from "lucide-react";
import { desaData } from "@/lib/constants";

export const dynamic = "force-dynamic";

function normalize(value: unknown): string {
  return String(value ?? "")
    .trim()
    .toLowerCase();
}

function displayOrFallback(value: string, fallback: string) {
  return value.trim().length > 0 ? value : fallback;
}

interface SummaryPageProps {
  searchParams?: Promise<{ desa?: string }>;
}

export default async function SummaryPage({ searchParams }: SummaryPageProps) {
  let rows: SheetRow[] = [];
  let error: string | null = null;

  try {
    rows = await getSheetData();
  } catch (err) {
    error = err instanceof Error ? err.message : "Gagal memuat data";
  }

  let selectedDesaParam = "";
  if (searchParams) {
    const resolved = await searchParams;
    selectedDesaParam = resolved?.desa ?? "";
  }
  const selectedDesaKey = normalize(selectedDesaParam);

  const desaCanonical = Object.keys(desaData);

  const desaCount = new Map<string, { label: string; count: number }>();

  // Seed canonical values so they always show (even 0)
  for (const d of desaCanonical) {
    desaCount.set(normalize(d), { label: d, count: 0 });
  }

  // Count per-desa
  for (const row of rows) {
    const desaRaw = String(row["DESA"] ?? "");
    const desaKey = normalize(desaRaw);
    const desaLabel = displayOrFallback(desaRaw, "Tidak terisi");

    if (!desaCount.has(desaKey)) {
      desaCount.set(desaKey, { label: desaLabel, count: 0 });
    }

    desaCount.get(desaKey)!.count += 1;
  }

  const desaList = Array.from(desaCount.entries())
    .map(([key, value]) => ({ key, ...value }))
    .sort((a, b) => a.label.localeCompare(b.label, "id-ID"));

  // Determine canonical desa label for selected key (if any)
  let selectedDesaLabel: string | null = null;
  if (selectedDesaKey) {
    // First try to find in desaList
    const match = desaList.find((d) => d.key === selectedDesaKey);
    if (match) {
      selectedDesaLabel = match.label;
    } else {
      // If not found, try to match with canonical desa names
      const canonicalMatch = desaCanonical.find(
        (d) => normalize(d) === selectedDesaKey
      );
      selectedDesaLabel = canonicalMatch || selectedDesaParam || null;
    }
  }

  // Build kelompok counts only for selected desa (if any)
  const kelompokCountForSelected = new Map<
    string,
    { label: string; count: number; key: string }
  >();

  if (selectedDesaKey && selectedDesaLabel) {
    // Try to seed from canonical desaData mapping if we can match
    const canonicalMatch = desaCanonical.find(
      (d) => normalize(d) === selectedDesaKey
    );
    if (canonicalMatch && desaData[canonicalMatch]) {
      for (const k of desaData[canonicalMatch]) {
        kelompokCountForSelected.set(normalize(k), {
          label: k,
          count: 0,
          key: normalize(k),
        });
      }
    }

    // Count actual data for selected desa
    for (const row of rows) {
      const desaRaw = String(row["DESA"] ?? "");
      if (normalize(desaRaw) !== selectedDesaKey) continue;

      const kelompokRaw = String(row["KELOMPOK"] ?? "");
      const kelompokKey = normalize(kelompokRaw);
      const kelompokLabel = displayOrFallback(kelompokRaw, "Tidak terisi");

      if (!kelompokCountForSelected.has(kelompokKey)) {
        kelompokCountForSelected.set(kelompokKey, {
          label: kelompokLabel,
          count: 0,
          key: kelompokKey,
        });
      }

      kelompokCountForSelected.get(kelompokKey)!.count += 1;
    }
  }

  const kelompokList =
    selectedDesaKey && selectedDesaLabel
      ? Array.from(kelompokCountForSelected.values()).sort((a, b) =>
          a.label.localeCompare(b.label, "id-ID")
        )
      : [];

  const totalRows = rows.length;
  const showKelompok = selectedDesaKey && selectedDesaLabel;
  const breadcrumbCurrent = selectedDesaLabel || "DESA";

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-indigo-50/50 to-blue-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 font-sans">
      <Navbar />

      <main className="container mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              Summary Data
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Rekap total data per Desa dan per Kelompok •{" "}
              <span className="font-semibold text-slate-700 dark:text-slate-200">
                {totalRows.toLocaleString("id-ID")} data
              </span>
            </p>
          </div>

          <div className="w-full md:w-auto flex justify-end">
            <Button asChild variant="outline" className="gap-2">
              <Link href="/">
                <ArrowLeft className="h-4 w-4" />
                Kembali ke Data
              </Link>
            </Button>
          </div>
        </div>

        {/* Breadcrumb (selalu tampil) */}
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/summary" className="flex items-center gap-1">
                  <Home className="h-4 w-4" />
                  Summary
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{breadcrumbCurrent}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {error && (
          <Card className="border-l-4 border-l-red-500 border-y-0 border-r-0 bg-white dark:bg-slate-950">
            <CardHeader>
              <CardTitle className="text-red-600 dark:text-red-400">
                Terjadi Kesalahan
              </CardTitle>
              <CardDescription className="text-red-700 dark:text-red-500">
                {error}
              </CardDescription>
            </CardHeader>
          </Card>
        )}

        {!error && (
          <div className="grid grid-cols-1 gap-3">
            {showKelompok ? (
              // Show Kelompok when Desa is selected
              <div className="space-y-1 relative">
                <SummaryList
                  title="Total per Kelompok"
                  description={`Jumlah data berdasarkan kolom KELOMPOK untuk Desa ${selectedDesaLabel}`}
                  icon={
                    <Users className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                  }
                  items={kelompokList}
                  showAsLink={false}
                  isKelompok={true}
                  isClickable={false}
                />
              </div>
            ) : (
              // Show Desa list by default
              <SummaryDesaList items={desaList} selectedKey={selectedDesaKey} />
            )}
          </div>
        )}
      </main>
    </div>
  );
}
