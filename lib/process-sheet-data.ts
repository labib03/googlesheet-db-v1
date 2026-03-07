import { getSheetData, SheetRow } from "@/lib/google-sheets";
import { calculateAge, formatDate, getJenjangKelas } from "@/lib/helper";
import { ADDITIONAL_INFO_SHEET_NAME } from "@/lib/constants";

export interface ProcessedResult {
  data: SheetRow[];
  headers: string[];
}

/**
 * Core processing function: calculates age, jenjang, formats dates, and merges AdditionalInfo.
 * Used by every page that displays generus data.
 */
export function processRows(
  rawData: SheetRow[],
  additionalInfoRaw?: SheetRow[],
): ProcessedResult {
  // Build AdditionalInfo lookup by UserId
  const additionalInfoMap = new Map<string, SheetRow>();
  if (additionalInfoRaw) {
    for (const aiRow of additionalInfoRaw) {
      const userId = String(aiRow["UserId"] || "").trim();
      if (userId) additionalInfoMap.set(userId, aiRow);
    }
  }

  const data: SheetRow[] = rawData.map((row, index) => {
    const tanggalLahirRaw = String(row["TANGGAL LAHIR"] || "");
    const updatedRow: SheetRow & { _index: number } = {
      ...row,
      _index: index,
    };

    if (tanggalLahirRaw.trim()) {
      updatedRow["Umur"] = calculateAge(tanggalLahirRaw);
      updatedRow["_rawBirthDate"] = tanggalLahirRaw;
      updatedRow["TANGGAL LAHIR"] = formatDate(tanggalLahirRaw);
    }

    if (updatedRow["Umur"] != undefined) {
      updatedRow["Jenjang Kelas"] = getJenjangKelas(
        updatedRow["Umur"] as string,
      );
    }

    // Merge AdditionalInfo if linked
    const idGenerus = String(row["ID GENERUS"] || "").trim();
    if (idGenerus && additionalInfoMap.has(idGenerus)) {
      const aiRow = additionalInfoMap.get(idGenerus)!;
      for (const [key, value] of Object.entries(aiRow)) {
        if (key !== "Timestamp" && key !== "UserId" && key !== "_index") {
          updatedRow[`_ai_${key}`] = value;
        }
      }
      updatedRow["_hasAdditionalInfo"] = "true";
    }

    return updatedRow;
  });

  const headers =
    data.length > 0
      ? Object.keys(data[0]).filter(
          (k) =>
            k !== "_index" &&
            k !== "Timestamp" &&
            k !== "Umur" &&
            !k.startsWith("_"),
        )
      : [];

  return { data, headers };
}

/**
 * Fetches and processes all generus data with optional AdditionalInfo merge.
 * Single entry point for pages that need full data.
 */
export async function fetchAndProcessData(opts?: {
  includeAdditionalInfo?: boolean;
  includeTrash?: boolean;
}): Promise<{
  data: SheetRow[];
  headers: string[];
  trashData?: SheetRow[];
}> {
  const includeAI = opts?.includeAdditionalInfo ?? true;
  const includeTrash = opts?.includeTrash ?? false;

  const promises: Promise<SheetRow[]>[] = [getSheetData()];

  if (includeAI) {
    promises.push(
      getSheetData(ADDITIONAL_INFO_SHEET_NAME).catch(() => [] as SheetRow[]),
    );
  }

  if (includeTrash) {
    promises.push(getSheetData("Trash").catch(() => [] as SheetRow[]));
  }

  const results = await Promise.all(promises);

  const rawData = results[0];
  const additionalInfoRaw = includeAI ? results[1] : undefined;
  const rawTrashData = includeTrash ? results[includeAI ? 2 : 1] : undefined;

  const { data, headers } = processRows(rawData, additionalInfoRaw);

  let trashData: SheetRow[] | undefined;
  if (rawTrashData && rawTrashData.length > 0) {
    trashData = rawTrashData.map((row, index) => ({
      ...row,
      _index: index,
    }));
  }

  return { data, headers, trashData };
}
