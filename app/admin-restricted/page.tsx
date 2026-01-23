import { getSheetData, SheetRow } from "@/lib/google-sheets";
import { Navbar } from "@/components/navbar";
import { AdminDashboardClient } from "@/components/admin-dashboard-client";
import { getJenjangKelas, calculateAge, formatDate } from "@/lib/helper";
import { Suspense } from "react";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  let data: SheetRow[] = [];
  let error: string | null = null;
  let headers: string[] = [];

  try {
    const rawData = await getSheetData();

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

        return updatedRow;
      });

      if (data.length > 0) {
        headers = Object.keys(data[0]).filter(
          (k) => k !== "_index" && k !== "Timestamp" && k !== "Umur",
        );
      }
    }
  } catch (err) {
    error = err instanceof Error ? err.message : "Failed to fetch data";
  }

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950/50 font-outfit selection:bg-indigo-100 selection:text-indigo-900">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <Suspense fallback={<div>Loading...</div>}>
          <AdminDashboardClient initialData={data} headers={headers} error={error} />
        </Suspense>
      </main>
    </div>
  );
}
