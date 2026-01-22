import { SheetRow } from "@/lib/google-sheets";
import { COLUMNS, desaData } from "@/lib/constants";
import { getCellValue, calculateAge, getJenjangKelas } from "@/lib/helper";

export interface SummaryItem {
  key: string;
  label: string;
  count: number;
}

export class AnalyticsService {
  /**
   * Processes raw sheet rows to include Age and Jenjang Class.
   */
  static processRows(rawData: SheetRow[]): SheetRow[] {
    return rawData.map((row) => {
      const tanggalLahir = getCellValue(row, COLUMNS.TANGGAL_LAHIR);
      const updatedRow = { ...row };

      if (tanggalLahir) {
        const age = calculateAge(tanggalLahir);
        updatedRow[COLUMNS.UMUR] = age;
        updatedRow[COLUMNS.JENJANG] = getJenjangKelas(age);
      }
      return updatedRow;
    });
  }

  /**
   * Gets a list of Desa with their counts.
   */
  static getDesaSummary(rows: SheetRow[]): SummaryItem[] {
    const desaCountMap = new Map<string, { label: string; count: number }>();
    
    // Seed from constants to ensure all Desa are shown
    Object.keys(desaData).forEach((desa) => {
      desaCountMap.set(desa.toLowerCase(), { label: desa, count: 0 });
    });

    for (const row of rows) {
      const desaRaw = getCellValue(row, COLUMNS.DESA);
      const desaKey = desaRaw.toLowerCase();
      const desaLabel = desaRaw || "Tidak terisi";

      if (!desaCountMap.has(desaKey)) {
        desaCountMap.set(desaKey, { label: desaLabel, count: 0 });
      }
      desaCountMap.get(desaKey)!.count += 1;
    }

    return Array.from(desaCountMap.entries())
      .map(([key, value]) => ({ key, ...value }))
      .sort((a, b) => a.label.localeCompare(b.label, "id-ID"));
  }

  /**
   * Gets a list of Kelompok for a specific Desa with their counts.
   */
  static getKelompokSummary(rows: SheetRow[], selectedDesa: string): SummaryItem[] {
    const kelompokCountMap = new Map<string, { label: string; count: number }>();
    const selectedDesaLower = selectedDesa.toLowerCase();

    // Seed from constants for the selected Desa
    const desaMatch = Object.keys(desaData).find(d => d.toLowerCase() === selectedDesaLower);
    if (desaMatch) {
      desaData[desaMatch].forEach((kelompok) => {
        kelompokCountMap.set(kelompok.toLowerCase(), { label: kelompok, count: 0 });
      });
    }

    for (const row of rows) {
      const rowDesaNormalized = getCellValue(row, COLUMNS.DESA).toLowerCase();
      if (rowDesaNormalized !== selectedDesaLower) continue;

      const kelompokRaw = getCellValue(row, COLUMNS.KELOMPOK);
      const kelompokKey = kelompokRaw.toLowerCase();
      const kelompokLabel = kelompokRaw || "Tidak terisi";

      if (!kelompokCountMap.has(kelompokKey)) {
        kelompokCountMap.set(kelompokKey, { label: kelompokLabel, count: 0 });
      }
      kelompokCountMap.get(kelompokKey)!.count += 1;
    }

    return Array.from(kelompokCountMap.entries())
      .map(([key, value]) => ({ key, ...value }))
      .sort((a, b) => a.label.localeCompare(b.label, "id-ID"));
  }

  /**
   * Filters rows based on Desa and/or Kelompok.
   */
  static filterRows(rows: SheetRow[], desa?: string, kelompok?: string): SheetRow[] {
    return rows.filter((row) => {
      const rowDesa = getCellValue(row, COLUMNS.DESA).toLowerCase();
      const rowKelompok = getCellValue(row, COLUMNS.KELOMPOK).toLowerCase();

      const matchDesa = desa ? rowDesa === desa.toLowerCase() : true;
      const matchKelompok = kelompok ? rowKelompok === kelompok.toLowerCase() : true;

      return matchDesa && matchKelompok;
    });
  }
}
