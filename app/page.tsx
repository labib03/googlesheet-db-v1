import { getSheetData, SheetRow } from "@/lib/google-sheets";
import { Navbar } from "@/components/navbar";
import { DashboardClient } from "@/components/dashboard-client";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { getJenjangKelas, calculateAge, formatDate } from "@/lib/helper";
import { ADDITIONAL_INFO_SHEET_NAME } from "@/lib/constants";
import { Suspense } from "react";
import { DashboardSkeleton } from "@/components/dashboard-skeleton";

export const dynamic = "force-dynamic";



export default async function Home() {
  let data: SheetRow[] = [];
  let error: string | null = null;
  let headers: string[] = [];

  try {
    const [rawData, additionalInfoRaw] = await Promise.all([
      getSheetData(),
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
          updatedRow["_rawBirthDate"] = tanggalLahirRaw;
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
  } catch (err) {
    error =
      err instanceof Error
        ? err.message
        : "Failed to fetch data from Google Sheets";
    console.error("Error:", err);
  }

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950/50 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Error State */}
        {error && (
          <Card className="mx-auto mb-8 max-w-2xl border-none shadow-sm bg-white dark:bg-slate-900 overflow-hidden ring-1 ring-slate-200 dark:ring-slate-800">
            <div className="h-2 bg-red-500" />
            <CardHeader className="pt-6">
              <CardTitle className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span className="p-1 bg-red-100 dark:bg-red-950/20 rounded-md">
                  <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                </span>
                Connection Failure
              </CardTitle>
              <CardDescription className="text-slate-500 dark:text-slate-400 mt-1">
                {error}
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-8">
              <div className="bg-slate-50 dark:bg-slate-950/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                  Recommended troubleshooting steps:
                </p>
                <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                  <li className="flex items-start gap-2">
                    <span className="text-indigo-500 font-bold">•</span>
                    Check Google Cloud Service Account credentials.
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-indigo-500 font-bold">•</span>
                    Verify environment variables in <code className="bg-white dark:bg-slate-900 px-1 py-0.5 rounded border border-slate-200 dark:border-slate-800">.env.local</code>.
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-indigo-500 font-bold">•</span>
                    Ensure the Sheet is shared with the Service Account email as <span className="underline underline-offset-2">Editor</span>.
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Dashboard Content */}
        {!error && (
          <Suspense fallback={<DashboardSkeleton />}>
            <DashboardClient initialData={data} headers={headers} />
          </Suspense>
        )}
      </main>
    </div>
  );
}
