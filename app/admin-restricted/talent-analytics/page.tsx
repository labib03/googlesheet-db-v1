import { SheetRow } from "@/lib/google-sheets";
import { getGlobalConfig } from "@/app/actions";
import { Navbar } from "@/components/navbar";
import { TalentAnalyticsClient } from "@/components/admin/talent-analytics-client";
import { Suspense } from "react";
import Loading from "@/app/loading";
import { fetchAndProcessData } from "@/lib/process-sheet-data";

export const dynamic = "force-dynamic";

async function TalentAnalyticsContent() {
    let data: SheetRow[] = [];
    let config: Record<string, unknown> = {};
    let error: string | null = null;

    try {
        const [result, configResult] = await Promise.all([
            fetchAndProcessData({ includeAdditionalInfo: false }),
            getGlobalConfig()
        ]);

        data = result.data;

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
            mode="config-only"
        />
    );
}

export default function TalentAnalyticsPage() {
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
