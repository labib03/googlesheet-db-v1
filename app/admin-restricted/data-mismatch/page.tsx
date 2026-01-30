import { getSheetData, SheetRow } from "@/lib/google-sheets";
import { Navbar } from "@/components/navbar";
import { MismatchPageClient } from "@/components/mismatch/mismatch-page-client";
import { getJenjangKelas, calculateAge, formatDate, isMappingCorrect } from "@/lib/helper";
import { Suspense } from "react";
import Loading from "@/app/loading";
import { COLUMNS } from "@/lib/constants";

export const dynamic = "force-dynamic";

async function MismatchContent() {
  let mismatchData: SheetRow[] = [];
  let error: string | null = null;

  try {
    const rawData = await getSheetData();
    
    if (rawData.length > 0) {
      mismatchData = rawData
        .map((row, index) => {
          const tanggalLahirRaw = String(row[COLUMNS.TANGGAL_LAHIR] || "");
          const updatedRow: SheetRow & { _index: number } = {
            ...row,
            _index: index,
          };

          if (tanggalLahirRaw.trim()) {
            updatedRow["Umur"] = calculateAge(tanggalLahirRaw);
            updatedRow[COLUMNS.TANGGAL_LAHIR] = formatDate(tanggalLahirRaw);
          }

          if (updatedRow["Umur"] != undefined) {
            updatedRow[COLUMNS.JENJANG] = getJenjangKelas(
              updatedRow["Umur"] as string,
            );
          }

          return updatedRow;
        })
        .filter((row) => {
          const desa = String(row[COLUMNS.DESA] || "");
          const kelompok = String(row[COLUMNS.KELOMPOK] || "");
          return !isMappingCorrect(desa, kelompok);
        });
    }
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
