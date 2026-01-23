import { getSheetData, SheetRow } from "@/lib/google-sheets";
import { Navbar } from "@/components/navbar";
import { TrashPageClient } from "@/components/trash/trash-page-client";
import { getJenjangKelas, calculateAge, formatDate } from "@/lib/helper";
import { Suspense } from "react";

export const dynamic = "force-dynamic";

export default async function TrashPage() {
  let trashData: SheetRow[] = [];
  let error: string | null = null;

  try {
    const rawTrashData = await getSheetData("Trash").catch(() => []);
    
    if (rawTrashData.length > 0) {
      trashData = rawTrashData.map((row, index) => {
        const tanggalLahirRaw = String(row["TANGGAL LAHIR"] || "");
        const updatedRow: SheetRow & { _index: number } = {
          ...row,
          _index: index,
        };

        if (tanggalLahirRaw.trim()) {
          updatedRow["Umur"] = calculateAge(tanggalLahirRaw);
          // Keep raw for internal use if needed, but display-wise we often format it.
          // In the main page we format it to dd/MM/yyyy.
          updatedRow["TANGGAL LAHIR"] = formatDate(tanggalLahirRaw);
        }

        if (updatedRow["Umur"] != undefined) {
          updatedRow["Jenjang Kelas"] = getJenjangKelas(
            updatedRow["Umur"] as string,
          );
        }

        return updatedRow;
      });
    }
  } catch (err) {
    error = err instanceof Error ? err.message : "Failed to fetch trash data";
  }

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950/50 font-outfit selection:bg-indigo-100 selection:text-indigo-900">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <Suspense fallback={<div>Loading Trash...</div>}>
          <TrashPageClient initialTrashData={trashData} error={error} />
        </Suspense>
      </main>
    </div>
  );
}
