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
   * Gets a list of Desa with their counts, optionally filtered by Jenjang.
   */
  static getDesaSummary(rows: SheetRow[], jenjang?: string): SummaryItem[] {
    const desaCountMap = new Map<string, { label: string; count: number }>();
    const jenjangLower = jenjang?.toLowerCase();

    // Seed from constants to ensure all Desa are shown
    Object.keys(desaData).forEach((desa) => {
      desaCountMap.set(desa.toLowerCase(), { label: desa, count: 0 });
    });

    for (const row of rows) {
      const desaRaw = getCellValue(row, COLUMNS.DESA);
      const desaKey = desaRaw.toLowerCase();
      const desaLabel = desaRaw || "Tidak terisi";
      const rowJenjang = getCellValue(row, COLUMNS.JENJANG).toLowerCase();

      // Apply Jenjang Filter
      if (jenjangLower && rowJenjang !== jenjangLower) {
        continue;
      }

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
   * Gets a list of Kelompok for a specific Desa with their counts, optionally filtered by Jenjang.
   */
  static getKelompokSummary(
    rows: SheetRow[],
    selectedDesa: string,
    jenjang?: string,
  ): SummaryItem[] {
    const kelompokCountMap = new Map<
      string,
      { label: string; count: number }
    >();
    const selectedDesaLower = selectedDesa.toLowerCase();
    const jenjangLower = jenjang?.toLowerCase();

    // Seed from constants for the selected Desa
    const desaMatch = Object.keys(desaData).find(
      (d) => d.toLowerCase() === selectedDesaLower,
    );
    if (desaMatch) {
      desaData[desaMatch].forEach((kelompok) => {
        kelompokCountMap.set(kelompok.toLowerCase(), {
          label: kelompok,
          count: 0,
        });
      });
    }

    for (const row of rows) {
      const rowDesaNormalized = getCellValue(row, COLUMNS.DESA).toLowerCase();
      if (rowDesaNormalized !== selectedDesaLower) continue;

      const rowJenjang = getCellValue(row, COLUMNS.JENJANG).toLowerCase();
      // Apply Jenjang Filter
      if (jenjangLower && rowJenjang !== jenjangLower) {
        continue;
      }

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
   * Fires the merge of AdditionalInfo rows with main data.
   */
  static mergeAdditionalInfo(
    rows: SheetRow[],
    additionalInfoRaw: SheetRow[],
  ): SheetRow[] {
    const additionalInfoMap = new Map<string, SheetRow>();
    for (const aiRow of additionalInfoRaw) {
      const userId = String(aiRow["UserId"] || "").trim();
      if (userId) {
        additionalInfoMap.set(userId, aiRow);
      }
    }

    return rows.map((row) => {
      const idGenerus = String(row[COLUMNS.ID_GENERUS] || "").trim();
      if (idGenerus && additionalInfoMap.has(idGenerus)) {
        const aiRow = additionalInfoMap.get(idGenerus)!;
        const updatedRow = { ...row };
        for (const [key, value] of Object.entries(aiRow)) {
          if (key !== "Timestamp" && key !== "UserId" && key !== "_index") {
            updatedRow[`_ai_${key}`] = value;
          }
        }
        updatedRow["_hasAdditionalInfo"] = "true";
        return updatedRow;
      }
      return row;
    });
  }

  /**
   * Gets distribution for a specific field, optionally filtering only rows that have AdditionalInfo.
   */
  static getFieldDistribution(rows: SheetRow[], field: string): SummaryItem[] {
    const distribution = new Map<string, number>();

    for (const row of rows) {
      const val = String(row[field] || "").trim() || "Tidak terisi";
      if (val === "Tidak terisi" && field.startsWith("_ai_")) continue; // Skip unlinked ones for clearer AI analytics
      distribution.set(val, (distribution.get(val) || 0) + 1);
    }

    return Array.from(distribution.entries())
      .map(([key, count]) => ({ key: key.toLowerCase(), label: key, count }))
      .sort((a, b) => b.count - a.count);
  }

  /**
   * Calculates the average marriage readiness score.
   */
  static getMarriageReadinessAverage(rows: SheetRow[]): {
    average: number;
    total: number;
  } {
    let sum = 0;
    let count = 0;
    const field = "_ai_Dari 1 - 10, seberapa siapkah kamu untuk menikah";

    for (const row of rows) {
      const val = parseInt(String(row[field] || ""), 10);
      if (!isNaN(val)) {
        sum += val;
        count++;
      }
    }

    return {
      average: count > 0 ? parseFloat((sum / count).toFixed(1)) : 0,
      total: count,
    };
  }

  /**
   * Gets the distribution of Jenjang for the current set of rows.
   */
  static getJenjangDistribution(
    rows: SheetRow[],
  ): { name: string; value: number }[] {
    const distribution = new Map<string, number>();

    for (const row of rows) {
      const jenjang = getCellValue(row, COLUMNS.JENJANG) || "Tidak terisi";
      const count = distribution.get(jenjang) || 0;
      distribution.set(jenjang, count + 1);
    }

    return Array.from(distribution.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value); // Sort by count desc
  }

  /**
   * Filters rows based on Desa, Kelompok, and Jenjang.
   */
  static filterRows(
    rows: SheetRow[],
    desa?: string,
    kelompok?: string,
    jenjang?: string,
  ): SheetRow[] {
    return rows.filter((row) => {
      const rowDesa = getCellValue(row, COLUMNS.DESA).toLowerCase();
      const rowKelompok = getCellValue(row, COLUMNS.KELOMPOK).toLowerCase();
      const rowJenjang = getCellValue(row, COLUMNS.JENJANG).toLowerCase();

      const matchDesa = desa ? rowDesa === desa.toLowerCase() : true;
      const matchKelompok = kelompok
        ? rowKelompok === kelompok.toLowerCase()
        : true;
      const matchJenjang = jenjang
        ? rowJenjang === jenjang.toLowerCase()
        : true;

      return matchDesa && matchKelompok && matchJenjang;
    });
  }
}
