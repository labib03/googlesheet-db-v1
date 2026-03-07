import { SheetRow } from "@/lib/google-sheets";
import { Navbar } from "@/components/navbar";
import { AdminDashboardClient } from "@/components/admin-dashboard-client";
import { Suspense } from "react";
import { AdminDashboardSkeleton } from "@/components/admin-dashboard-skeleton";
import { fetchAndProcessData } from "@/lib/process-sheet-data";

export const dynamic = "force-dynamic";

async function AdminDashboardContent() {
  let data: SheetRow[] = [];
  let trashData: SheetRow[] = [];
  let error: string | null = null;
  let headers: string[] = [];

  try {
    const result = await fetchAndProcessData({
      includeAdditionalInfo: true,
      includeTrash: true,
    });
    data = result.data;
    headers = result.headers;
    trashData = result.trashData || [];
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
