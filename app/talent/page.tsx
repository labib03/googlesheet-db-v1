import { getSheetData, SheetRow } from "@/lib/google-sheets";
import { getGlobalConfig } from "@/app/actions";
import { Navbar } from "@/components/navbar";
import { TalentAnalyticsClient } from "@/components/admin/talent-analytics-client";
import { Suspense } from "react";
import Loading from "@/app/loading";
import { calculateAge, formatDate, getJenjangKelas } from "@/lib/helper";

export const dynamic = "force-dynamic";

async function TalentAnalyticsContent() {
    let data: SheetRow[] = [];
    let config: Record<string, unknown> = {};
    let error: string | null = null;

    try {
        const [rawData, configResult] = await Promise.all([
            getSheetData(),
            getGlobalConfig()
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
        }

        if (configResult.success) {
            config = configResult.data || {};
        }
    } catch (err) {
        error = err instanceof Error ? err.message : "Failed to fetch data";
    }

    return (
        <TalentAnalyticsClient
            initialData={data}
            config={config}
            error={error}
            mode="dashboard-only"
        />
    );
}

export default function TalentDashboardPage() {
    return (
        <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950/50 font-outfit">
            <Navbar />
            <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
                <Suspense fallback={<Loading />}>
                    <TalentAnalyticsContent />
                </Suspense>
            </main>
        </div>
    );
}
