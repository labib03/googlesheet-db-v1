import { getSheetData, SheetRow } from "@/lib/google-sheets";
import { Navbar } from "@/components/navbar";
import { AdminDashboardClient } from "@/components/admin-dashboard-client";
import { getJenjangKelas, calculateAge, formatDate } from "@/lib/helper";
import { Suspense } from "react";
import Loading from "@/app/loading";

export const dynamic = "force-dynamic";

async function AdminDashboardContent() {
  let data: SheetRow[] = [];
  let trashData: SheetRow[] = [];
  let error: string | null = null;
  let headers: string[] = [];

  try {
    const [rawData, rawTrashData] = await Promise.all([
      getSheetData(),
      getSheetData("Trash").catch(() => [])
    ]);

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
        <Suspense fallback={<Loading />}>
          <AdminDashboardContent />
        </Suspense>
      </main>
    </div>
  );
}
