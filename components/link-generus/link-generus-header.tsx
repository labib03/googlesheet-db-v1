import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Link2, Search, UserCheck, UserX, Users, Wand2, AlertCircle } from "lucide-react";
import Link from "next/link";
import { Dispatch, SetStateAction } from "react";
import { BackButton } from "@/components/ui/back-button";

type FilterMode = "unlinked" | "linked" | "all";

interface LinkGenerusHeaderProps {
    counts: {
        unlinked: number;
        linked: number;
        total: number;
        matchable: number;
        unmatchable: number;
    };
    filterMode: FilterMode;
    setFilterMode: Dispatch<SetStateAction<FilterMode>>;
    matchCategory: "all" | "matchable" | "unmatchable";
    setMatchCategory: Dispatch<SetStateAction<"all" | "matchable" | "unmatchable">>;
    searchQuery: string;
    setSearchQuery: Dispatch<SetStateAction<string>>;
    handleAutoMatch: () => void;
}

export function LinkGenerusHeader({
    counts,
    filterMode,
    setFilterMode,
    matchCategory,
    setMatchCategory,
    searchQuery,
    setSearchQuery,
    handleAutoMatch
}: LinkGenerusHeaderProps) {
    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-in fade-in slide-in-from-top-2 duration-500">
                <div className="flex items-center gap-3">
                    <BackButton href="/admin-restricted" label="Kembali" />
                    <div className="min-w-0">
                        <h1 className="text-xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2 sm:gap-3 truncate">
                            <div className="p-1.5 sm:p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg sm:rounded-xl shrink-0">
                                <Link2 className="h-5 w-5 sm:h-6 sm:w-6 text-indigo-600 dark:text-indigo-400" />
                            </div>
                            <span className="truncate">Link Generus</span>
                        </h1>
                        <p className="mt-0.5 sm:mt-1 text-[10px] sm:text-sm text-slate-500 dark:text-slate-400">
                            Pilih data AdditionalInfo, lalu hubungkan ke data Generus
                        </p>
                    </div>
                </div>

                <div className="flex gap-1.5 sm:gap-3 flex-wrap">
                    <div className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 sm:py-2 bg-white dark:bg-slate-900 rounded-lg sm:rounded-xl ring-1 ring-slate-200 dark:ring-slate-800 shadow-sm">
                        <UserX className="h-3.5 sm:h-4 w-3.5 sm:w-4 text-amber-500" />
                        <span className="text-[10px] sm:text-sm font-medium text-slate-700 dark:text-slate-300">
                            {counts.unlinked} <span className="hidden xs:inline">Belum</span>
                        </span>
                    </div>
                    <div className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 sm:py-2 bg-white dark:bg-slate-900 rounded-lg sm:rounded-xl ring-1 ring-slate-200 dark:ring-slate-800 shadow-sm">
                        <UserCheck className="h-3.5 sm:h-4 w-3.5 sm:w-4 text-emerald-500" />
                        <span className="text-[10px] sm:text-sm font-medium text-slate-700 dark:text-slate-300">
                            {counts.linked} <span className="hidden xs:inline">Sudah</span>
                        </span>
                    </div>
                    <div className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 sm:py-2 bg-white dark:bg-slate-900 rounded-lg sm:rounded-xl ring-1 ring-slate-200 dark:ring-slate-800 shadow-sm">
                        <Users className="h-3.5 sm:h-4 w-3.5 sm:w-4 text-indigo-500" />
                        <span className="text-[10px] sm:text-sm font-medium text-slate-700 dark:text-slate-300">
                            {counts.total} <span className="hidden xs:inline">Total</span>
                        </span>
                    </div>
                </div>
            </div>

            {/* Match Status Sub-Tabs */}
            {filterMode === "unlinked" && (
                <div className="flex flex-wrap items-center gap-2 p-1 bg-slate-100/50 dark:bg-slate-950/50 rounded-xl border border-slate-200/50 dark:border-slate-800/50 animate-in fade-in slide-in-from-left-2 duration-300">
                    <span className="hidden sm:inline text-[10px] uppercase font-bold text-slate-400 px-3 tracking-wider">Quick Filter:</span>
                    {(
                        [
                            { id: "all", label: "Semua", icon: UserX, count: counts.unlinked },
                            { id: "matchable", label: "Siap ✨", icon: Wand2, count: counts.matchable },
                            { id: "unmatchable", label: "Cek", icon: AlertCircle, count: counts.unmatchable },
                        ] as const
                    ).map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => setMatchCategory(cat.id)}
                            className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg text-[11px] sm:text-xs font-semibold transition-all ${matchCategory === cat.id
                                ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm ring-1 ring-slate-200 dark:ring-slate-700"
                                : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                                }`}
                        >
                            <cat.icon className={`h-3 sm:h-3.5 w-3 sm:w-3.5 ${matchCategory === cat.id ? "text-indigo-500" : ""}`} />
                            <span className="whitespace-nowrap">{cat.label}</span>
                            <span className={`px-1.5 py-0.5 rounded-full text-[9px] sm:text-[10px] ${matchCategory === cat.id
                                ? "bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400"
                                : "bg-slate-200 dark:bg-slate-800 text-slate-500"
                                }`}>
                                {cat.count}
                            </span>
                        </button>
                    ))}
                </div>
            )}

            {/* Search + Filter + AutoMatch */}
            <div className="flex flex-col sm:flex-row gap-3 animate-in fade-in slide-in-from-bottom-2 duration-500 delay-100">
                <div className="flex-1 w-full order-1 sm:order-0">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                            placeholder="Cari data..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 h-10 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-xl"
                        />
                    </div>
                </div>

                <div className="flex gap-2 w-full sm:w-auto items-center">
                    <Button
                        onClick={handleAutoMatch}
                        variant="ghost"
                        className="flex-1 sm:flex-none h-10 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 px-3 sm:px-4 group"
                    >
                        <Wand2 className="w-4 h-4 mr-2 group-hover:rotate-12 transition-transform" />
                        <span className="text-xs sm:text-sm">Auto Match</span>
                    </Button>

                    <div className="flex-1 sm:flex-none flex gap-0.5 p-1 bg-white dark:bg-slate-900 rounded-xl ring-1 ring-slate-200 dark:ring-slate-800 h-10">
                        {(
                            [
                                { key: "unlinked", label: "Belum", icon: UserX, count: counts.unlinked },
                                { key: "linked", label: "Sudah", icon: UserCheck, count: counts.linked },
                            ] as const
                        ).map(({ key, label, icon: Icon, count }) => (
                            <button
                                key={key}
                                onClick={() => setFilterMode(key)}
                                className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-2 sm:px-3 rounded-lg text-[11px] sm:text-sm font-medium transition-all ${filterMode === key
                                    ? "bg-indigo-600 text-white shadow-sm"
                                    : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                                    }`}
                            >
                                <Icon className="h-3 sm:h-3.5 w-3 sm:w-3.5" />
                                <span className="hidden xs:inline">{label}</span>
                                <span className={`ml-1 text-[9px] sm:text-[10px] opacity-70`}>
                                    ({count})
                                </span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
