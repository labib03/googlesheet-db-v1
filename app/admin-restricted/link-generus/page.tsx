import { Navbar } from "@/components/navbar";
import { Suspense } from "react";
import { getAdditionalInfoData, getUnlinkedGenerus } from "@/app/actions";
import { LinkGenerusClient } from "@/components/link-generus-client";
import { AdminDashboardSkeleton } from "@/components/admin-dashboard-skeleton";

export const dynamic = "force-dynamic";

async function LinkGenerusContent() {
    const [additionalInfoResult, unlinkedResult] = await Promise.all([
        getAdditionalInfoData(),
        getUnlinkedGenerus(),
    ]);

    return (
        <LinkGenerusClient
            additionalInfoData={additionalInfoResult.data}
            unlinkedGenerus={unlinkedResult.data}
            error={
                !additionalInfoResult.success
                    ? additionalInfoResult.message || "Error"
                    : null
            }
        />
    );
}

export default function LinkGenerusPage() {
    return (
        <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950/50 font-outfit selection:bg-indigo-100 selection:text-indigo-900">
            <Navbar />
            <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
                <Suspense fallback={<AdminDashboardSkeleton />}>
                    <LinkGenerusContent />
                </Suspense>
            </main>
        </div>
    );
}
