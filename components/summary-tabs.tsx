"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, Users2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface SummaryTabsProps {
    activeView: string;
}

export function SummaryTabs({ activeView }: SummaryTabsProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const setView = (view: "overview" | "details") => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("view", view);
        router.push(`/summary?${params.toString()}`);
    };

    return (
        <div className="flex items-center p-1.5 bg-slate-100 dark:bg-slate-800/50 rounded-2xl border border-slate-200/50 dark:border-slate-800/50">
            <Button
                variant="ghost"
                size="sm"
                onClick={() => setView("overview")}
                className={cn(
                    "rounded-xl h-9 px-4 transition-all duration-300",
                    activeView === "overview"
                        ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm font-semibold"
                        : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                )}
            >
                <LayoutDashboard className="h-4 w-4 mr-2" />
                Overview
            </Button>
            <Button
                variant="ghost"
                size="sm"
                onClick={() => setView("details")}
                className={cn(
                    "rounded-xl h-9 px-4 transition-all duration-300",
                    activeView === "details"
                        ? "bg-white dark:bg-slate-900 text-teal-600 dark:text-teal-400 shadow-sm font-semibold"
                        : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                )}
            >
                <Users2 className="h-4 w-4 mr-2" />
                Detail Profil
            </Button>
        </div>
    );
}
