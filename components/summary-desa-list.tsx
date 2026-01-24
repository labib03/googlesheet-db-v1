"use client";

import { SummaryList } from "./summary-list";

type SummaryItem = {
  label: string;
  count: number;
  key?: string;
};

interface SummaryDesaListProps {
  items: SummaryItem[];
  selectedKey?: string;
  baseParams?: Record<string, string>;
}

export function SummaryDesaList({ items, selectedKey, baseParams }: SummaryDesaListProps) {
  return (
    <div className="relative">
      <SummaryList
        title="Total per Desa"
        description="Statistik distribusi generus berdasarkan wilayah desa di Kabupaten/Kota Bogor. Klik desa untuk melihat detail kelompok."
        items={items}
        selectedKey={selectedKey}
        isClickable={true}
        baseParams={baseParams}
      />
    </div>
  );
}
