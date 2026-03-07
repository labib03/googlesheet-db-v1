import { getSheetData, SheetRow } from "@/lib/google-sheets";
import { Navbar } from "@/components/navbar";
import { AdminDashboardClient } from "@/components/admin-dashboard-client";
import { getJenjangKelas, calculateAge, formatDate } from "@/lib/helper";
import { ADDITIONAL_INFO_SHEET_NAME } from "@/lib/constants";
import { Suspense } from "react";
import { AdminDashboardSkeleton } from "@/components/admin-dashboard-skeleton";

export const dynamic = "force-dynamic";

async function AdminDashboardContent() {
  let data: SheetRow[] = [];
  let trashData: SheetRow[] = [];
  let error: string | null = null;
  let headers: string[] = [];

  try {
    const [rawData, rawTrashData, additionalInfoRaw] = await Promise.all([
      getSheetData(),
      getSheetData("Trash").catch(() => []),
      getSheetData(ADDITIONAL_INFO_SHEET_NAME).catch(() => [] as SheetRow[]),
    ]);

    // Build AdditionalInfo lookup by UserId
    const additionalInfoMap = new Map<string, SheetRow>();
    for (const aiRow of additionalInfoRaw) {
      const userId = String(aiRow["UserId"] || "").trim();
      if (userId) additionalInfoMap.set(userId, aiRow);
    }

    if (rawData.length > 0) {
      data = rawData.map((row, index) => {
        const tanggalLahirRaw = String(row["TANGGAL LAHIR"] || "");
        const updatedRow: SheetRow & { _index: number } = {
          ...row,
          _index: index,
        };

        if (tanggalLahirRaw.trim()) {
          updatedRow["Umur"] = calculateAge(tanggalLahirRaw);
          updatedRow["TANGGAL LAHIR"] = formatDate(tanggalLahirRaw);
        }

        if (updatedRow["Umur"] != undefined) {
          updatedRow["Jenjang Kelas"] = getJenjangKelas(
            updatedRow["Umur"] as string,
          );
        }

        // Merge AdditionalInfo if linked
        const idGenerus = String(row["ID GENERUS"] || "").trim();
        if (idGenerus && additionalInfoMap.has(idGenerus)) {
          const aiRow = additionalInfoMap.get(idGenerus)!;
          for (const [key, value] of Object.entries(aiRow)) {
            if (key !== "Timestamp" && key !== "UserId" && key !== "_index") {
              updatedRow[`_ai_${key}`] = value;
            }
          }
          updatedRow["_hasAdditionalInfo"] = "true";
        }

        return updatedRow;
      });

      if (data.length > 0) {
        headers = Object.keys(data[0]).filter(
          (k) => k !== "_index" && k !== "Timestamp" && k !== "Umur" && !k.startsWith("_"),
        );
      }
    }

    if (rawTrashData.length > 0) {
      trashData = rawTrashData.map((row, index) => ({
        ...row,
        _index: index,
      }));
    }
  } catch (err) {
    error = err instanceof Error ? err.message : "Failed to fetch data";
  }

  return (
    <AdminDashboardClient
      initialData={data}
      trashData={trashData}
      headers={headers}
      error={error}
    />
  );
}

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950/50 font-outfit selection:bg-indigo-100 selection:text-indigo-900">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <Suspense fallback={<AdminDashboardSkeleton />}>
          <AdminDashboardContent />
        </Suspense>
      </main>
    </div>
  );
}
