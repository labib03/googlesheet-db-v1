import { SheetRow } from "@/lib/google-sheets";
import { Navbar } from "@/components/navbar";
import { MismatchPageClient } from "@/components/mismatch/mismatch-page-client";
import { isMappingCorrect } from "@/lib/helper";
import { Suspense } from "react";
import Loading from "@/app/loading";
import { COLUMNS } from "@/lib/constants";
import { fetchAndProcessData } from "@/lib/process-sheet-data";

export const dynamic = "force-dynamic";

async function MismatchContent() {
  let mismatchData: SheetRow[] = [];
  let error: string | null = null;

  try {
    const result = await fetchAndProcessData({ includeAdditionalInfo: false });

    mismatchData = result.data.filter((row) => {
      const desa = String(row[COLUMNS.DESA] || "");
      const kelompok = String(row[COLUMNS.KELOMPOK] || "");
      return !isMappingCorrect(desa, kelompok);
    });
  } catch (err) {
    error = err instanceof Error ? err.message : "Failed to fetch data";
  }

  return <MismatchPageClient initialData={mismatchData} error={error} />;
}

export default function MismatchPage() {
  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950/50 font-outfit selection:bg-indigo-100 selection:text-indigo-900">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <Suspense fallback={<Loading />}>
          <MismatchContent />
        </Suspense>
      </main>
    </div>
  );
}
