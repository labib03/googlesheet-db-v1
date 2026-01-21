"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Loader2, MapPin } from "lucide-react";
import { SummaryList } from "./summary-list";

type SummaryItem = {
  label: string;
  count: number;
  key?: string;
};

interface SummaryDesaListProps {
  items: SummaryItem[];
  selectedKey?: string;
}

export function SummaryDesaList({ items, selectedKey }: SummaryDesaListProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleSelect = (item: SummaryItem) => {
    startTransition(() => {
      if (item.key && item.key === selectedKey) {
        router.push("/summary");
      } else {
        router.push(`/summary?desa=${encodeURIComponent(item.label)}`);
      }
    });
  };

  return (
    <div className="relative">
      {isPending && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/80 dark:bg-slate-950/80 backdrop-blur-sm">
          <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Memuat data…</span>
          </div>
        </div>
      )}

      <SummaryList
        title="Total per Desa"
        description="Jumlah data berdasarkan kolom Desa. Klik untuk melihat detail kelompok."
        icon={
          <MapPin className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
        }
        items={items}
        selectedKey={selectedKey}
        showAsLink={false}
        isClickable={true}
      />
    </div>
  );
}
