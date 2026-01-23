"use client";

import { useMemo } from "react";
import { SheetRow } from "@/lib/google-sheets";
import { Users, MapPin, BarChart2, Venus, Mars } from "lucide-react";
import { getCellValue } from "@/lib/helper";
import { COLUMNS, kelas } from "@/lib/constants";
import { AnimatedNumber } from "@/components/animated-number";

interface StatsOverviewProps {
  data: SheetRow[];
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

export function StatsOverview({ data }: StatsOverviewProps) {
  const stats = useMemo(() => {
    const total = data.length;

    let lakiLaki = 0;
    let perempuan = 0;
    const jenjangCounts: Record<string, number> = {};
    const desaSet = new Set<string>();
    const kelompokSet = new Set<string>();

    data.forEach((row) => {
      // Gender
      const gender = getCellValue(row, COLUMNS.GENDER).toLowerCase();
      if (gender === "laki-laki") lakiLaki++;
      else if (gender === "perempuan") perempuan++;

      // Jenjang
      const jenjang = getCellValue(row, COLUMNS.JENJANG) || "Lainnya";
      jenjangCounts[jenjang] = (jenjangCounts[jenjang] || 0) + 1;

      // Desa
      const desa = getCellValue(row, COLUMNS.DESA);
      if (desa) desaSet.add(desa.toLowerCase());

      // Kelompok
      const kelompok = getCellValue(row, COLUMNS.KELOMPOK);
      if (kelompok) kelompokSet.add(kelompok.toLowerCase());
    });

    const topJenjangEntry = Object.entries(jenjangCounts).sort(
      (a, b) => b[1] - a[1],
    )[0];

    return {
      total,
      lakiLaki,
      perempuan,
      topJenjang: topJenjangEntry ? topJenjangEntry[0] : "-",
      activeDesa: desaSet.size,
      activeKelompok: kelompokSet.size,
      jenjangCounts,
    };
  }, [data]);

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
      ...getStatsInfo(stats),
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
          <>
            {card.isShow && (
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
            )}
          </>
        ))}
      </div>

      {/* Jenjang Kelas Distribution */}
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-300 rounded-lg p-1.5 shadow-lg shadow-indigo-200 dark:shadow-none">
            <BarChart2 className="w-4 h-4 text-indigo-900" />
          </div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-white">
            Distribusi Jenjang Kelas
          </h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {kelas.map((j) => {
            const count = stats.jenjangCounts[j] || 0;

            return (
              <div
                key={j}
                className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col items-center justify-center text-center space-y-1 hover:border-indigo-300 dark:hover:border-indigo-800 transition-all hover:scale-105"
              >
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  {j}
                </span>
                <span className="text-2xl font-bold text-slate-900 dark:text-white">
                  <AnimatedNumber value={count} />
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
