"use client";

import { useMemo, useTransition } from "react";
import { parse } from "date-fns";
import { SheetRow } from "@/lib/google-sheets";
import { Users, MapPin, BarChart2, Venus, Mars, Check, AlertCircle, Info } from "lucide-react";
import { getCellValue } from "@/lib/helper";
import { COLUMNS, kelas } from "@/lib/constants";
import { AnimatedNumber } from "@/components/animated-number";
import { cn } from "@/lib/utils";
import { useRouter, useSearchParams } from "next/navigation";

interface StatsOverviewProps {
  data: SheetRow[];                  // Fully filtered data (for KPIs)
  distributionData?: SheetRow[];     // Data filtered only by location (for Jenjang cards)
  selectedJenjang?: string;          // Currently selected filter
}

function getStatsInfo(stats: {
  total: number;
  lakiLaki: number;
  perempuan: number;
  topJenjang: string;
  activeDesa: number;
  activeKelompok: number;
  jenjangCounts: Record<string, number>;
}) {
  let label, value, description;

  if (stats.activeDesa === 0 && stats.activeKelompok === 0) {
    label = "Belum ada yang input data";
    value = "0 Records";
    description = "";
  } else if (stats.activeDesa === 1 && stats.activeKelompok === 1) {
    label = "Kelompok yang input data";
    value = "1 Kelompok";
    description = "";
  } else if (stats.activeDesa === 1) {
    label = "Jumlah kelompok yang input data";
    value = `${stats.activeKelompok} Kelompok`;
    description = "";
  } else {
    label = "Jumlah desa yang input data";
    value = `${stats.activeDesa} Desa`;
    description = "";
  }

  return { label, value, description };
}

export function StatsOverview({ data, distributionData, selectedJenjang }: StatsOverviewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // 1. Calculate KPI Stats (based on FULLY filtered data)
  const stats = useMemo(() => {
    const total = data.length;

    let lakiLaki = 0;
    let perempuan = 0;
    const desaSet = new Set<string>();
    const kelompokSet = new Set<string>();

    data.forEach((row) => {
      // Gender
      const gender = getCellValue(row, COLUMNS.GENDER).toLowerCase();
      if (gender === "laki-laki") lakiLaki++;
      else if (gender === "perempuan") perempuan++;

      // Desa
      const desa = getCellValue(row, COLUMNS.DESA);
      if (desa) desaSet.add(desa.toLowerCase());

      // Kelompok
      const kelompok = getCellValue(row, COLUMNS.KELOMPOK);
      if (kelompok) kelompokSet.add(kelompok.toLowerCase());
    });

    return {
      total,
      lakiLaki,
      perempuan,
      activeDesa: desaSet.size,
      activeKelompok: kelompokSet.size,
    };
  }, [data]);

  // 2. Calculate Distribution Stats (based on LOCATION filtered data only)
  const distributionStats = useMemo<{
    jenjangCounts: Record<string, number>;
    noDobCount: number;
  }>(() => {
    const targetData = distributionData || data;
    const jenjangCounts: Record<string, number> = {};
    
    // Additional counts for Out of Category Info
    let noDobCount = 0;

    targetData.forEach((row) => {
      const jenjang = getCellValue(row, COLUMNS.JENJANG);
      const dob = getCellValue(row, COLUMNS.TANGGAL_LAHIR);
      
      let isNoDob = false;
      if (!dob) {
        isNoDob = true;
      } else {
        const parsed = parse(dob, "dd/MM/yyyy", new Date());
        if (isNaN(parsed.getTime())) {
          isNoDob = true;
        }
      }

      const isOutOfCategory = jenjang === "-";

      if (isNoDob) {
        noDobCount++;
      }

      const key = jenjang || "Lainnya";
      jenjangCounts[key] = (jenjangCounts[key] || 0) + 1;
    });

    return { jenjangCounts, noDobCount };
  }, [data, distributionData]);


  const handleJenjangClick = (jenjang: string) => {
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());
      
      // Toggle logic
      if (selectedJenjang?.toLowerCase() === jenjang.toLowerCase()) {
        params.delete("jenjang");
      } else {
        params.set("jenjang", jenjang);
      }
      
      router.push(`/summary?${params.toString()}`);
    });
  };

  const mainCards = [
    {
      label: "Total Generus",
      value: stats.total,
      icon: Users,
      color: "bg-indigo-300",
      textColor: "text-indigo-900",
      description: "Total data terdaftar",
      isShow: true,
    },
    {
      label: "Laki-laki",
      value: stats.lakiLaki,
      icon: Mars,
      color: "bg-sky-300",
      textColor: "text-sky-900",
      description: `${Math.round((stats.lakiLaki / (stats.total || 1)) * 100) || 0}% dari total`,
      isShow: true,
    },
    {
      label: "Perempuan",
      value: stats.perempuan,
      icon: Venus,
      color: "bg-rose-300",
      textColor: "text-rose-900",
      description: `${Math.round((stats.perempuan / (stats.total || 1)) * 100) || 0}% dari total`,
      isShow: true,
    },
    {
      ...getStatsInfo({ ...stats, topJenjang: "-", jenjangCounts: {} }), // Partial mock since we separated logic
      icon: MapPin,
      color: "bg-emerald-300",
      textColor: "text-emerald-900",
      isShow: stats.activeDesa == 1 && stats.activeKelompok == 1 ? false : true,
    },
  ];

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Main KPI Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {mainCards.map((card) => (
          card.isShow && (
            <div
              key={card.label}
              className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all hover:-translate-y-1 group"
            >
              <div className="flex items-center justify-between mb-4">
                <div
                  className={`${card.color} p-2 rounded-xl transition-colors`}
                >
                  <card.icon className={`w-5 h-5 ${card.textColor}`} />
                </div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Live Sync
                </span>
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  {card.label}
                </h3>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                    {typeof card.value === "number" ? (
                      <AnimatedNumber value={card.value} />
                    ) : (
                      card.value
                    )}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 dark:text-slate-500">
                  {card.description}
                </p>
              </div>
            </div>
          )
        ))}
      </div>

      {/* Jenjang Kelas Distribution */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-300 rounded-lg p-1.5 shadow-lg shadow-indigo-200 dark:shadow-none">
              <BarChart2 className="w-4 h-4 text-indigo-900" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800 dark:text-white">
                Distribusi Jenjang Kelas
              </h2>
              <p className="text-sm text-slate-500">
                Klik kartu untuk memfilter data berdasarkan jenjang.
              </p>
            </div>
          </div>
          
          {selectedJenjang && (
             <button 
               onClick={() => handleJenjangClick(selectedJenjang)}
               className="text-xs font-semibold text-red-500 hover:text-red-600 transition-colors px-3 py-1 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-900/50"
             >
               Reset Filter
             </button>
          )}
        </div>
        
        {/* Out of Category Info Banner (Option B Style) */}
        {distributionStats.noDobCount > 0 && (
          <div className="animate-in fade-in slide-in-from-top-2 duration-500">
            <div className="flex items-start gap-4 p-4 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/50 group transition-all hover:bg-amber-50 dark:hover:bg-amber-950/30 max-w-2xl">
              <div className="bg-amber-100 dark:bg-amber-900/50 p-2 rounded-xl text-amber-600 dark:text-amber-400">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-amber-900 dark:text-amber-100">
                    Butuh Perhatian
                  </h4>
                  <span className="bg-amber-200/50 dark:bg-amber-800/50 text-amber-700 dark:text-amber-300 text-[10px] px-2 py-0.5 rounded-full font-bold">
                    {distributionStats.noDobCount} Data
                  </span>
                </div>
                <p className="text-xs text-amber-600/80 dark:text-amber-400/80 leading-relaxed">
                  Data ini tidak menginput tanggal lahir sehingga jenjang tidak dapat ditentukan.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {kelas.map((j) => {
            const count = distributionStats.jenjangCounts[j] || 0;
            const isSelected = selectedJenjang?.toLowerCase() === j.toLowerCase();

            return (
              <button
                key={j}
                disabled={isPending}
                onClick={() => handleJenjangClick(j)}
                className={cn(
                  "relative p-4 rounded-xl border shadow-sm flex flex-col items-center justify-center text-center space-y-1 transition-all",
                  "hover:scale-105 active:scale-95 disabled:opacity-50 disabled:pointer-events-none",
                  isSelected 
                    ? "bg-indigo-600 border-indigo-500 ring-2 ring-indigo-200 dark:ring-indigo-900 shadow-indigo-200 dark:shadow-indigo-900/50" 
                    : "bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-800"
                )}
              >
                <div className="absolute top-2 right-2">
                  {isSelected ? (
                    <div className="bg-white/20 p-0.5 rounded-full ring-1 ring-white/40">
                      <Check className="w-2.5 h-2.5 text-white" />
                    </div>
                  ) : (
                    <div className="w-2 h-2 rounded-full bg-slate-200 dark:bg-slate-800" />
                  )}
                </div>

                <span className={cn("text-[10px] font-bold uppercase tracking-wider transition-colors", isSelected ? "text-indigo-100" : "text-slate-400")}>
                  {j}
                </span>
                <span className={cn("text-2xl font-bold transition-colors", isSelected ? "text-white" : "text-slate-900 dark:text-white")}>
                  <AnimatedNumber value={count} />
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
