import { differenceInYears, parse, format } from "date-fns";
import { id } from "date-fns/locale";
import { jenjangClassMap, desaData } from "./constants";

export function calculateAge(dateString: string): string {
  if (!dateString) return "-";

  try {
    const birthDate = parse(dateString, "dd/MM/yyyy", new Date());

    if (isNaN(birthDate.getTime())) {
      console.error("Invalid date:", dateString);
      return "-";
    }

    const today = new Date();
    const age = differenceInYears(today, birthDate);

    return age.toString();
  } catch (error) {
    console.error("Error parsing date:", error);
    return "-";
  }
}

export function formatDate(dateString: string, formatOutputDate: string = "dd/MM/yyyy"): string {
  if (!dateString) return "-";

  try {
    const date = parse(dateString, "dd/MM/yyyy", new Date());

    if (isNaN(date.getTime())) {
      console.error("Invalid date:", dateString);
      return "-";
    }

    return format(date, formatOutputDate, { locale: id });
  } catch (error) {
    console.error("Error parsing date:", error);
    return "-";
  }
}

export function capitalizeWords(input: string): string {
  return input
    .split(" ") // pisahkan berdasarkan spasi
    .map((word) => {
      if (word.length === 0) return word; // kalau kosong, biarkan
      return word[0].toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(" "); // gabungkan kembali dengan spasi
}

export function getJenjangKelas(age: string) {
  const ageNum = Number(age);
  if (isNaN(ageNum)) return "-";

  if (ageNum >= jenjangClassMap["pra nikah"]) {
    return "Pra Nikah";
  } else if (ageNum >= jenjangClassMap["remaja"]) {
    return "Remaja";
  } else if (ageNum >= jenjangClassMap["pra remaja"]) {
    return "Pra Remaja";
  } else if (ageNum >= jenjangClassMap["caberawit c"]) {
    return "Caberawit C";
  } else if (ageNum >= jenjangClassMap["caberawit b"]) {
    return "Caberawit B";
  } else if (ageNum >= jenjangClassMap["caberawit a"]) {
    return "Caberawit A";
  }

  // Age valid but < caberawit a minimum age (including < 5)
  return "PAUD";
}

/**
 * Safety helper to get cell value from a row case-insensitively.
 * Prevents logic breaking if Google Sheet column names change case.
 */
export function getCellValue(row: Record<string, unknown>, columnName: string): string {
  if (!row) return "";
  const keys = Object.keys(row);
  const targetKey = keys.find((k) => k.toLowerCase() === columnName.toLowerCase());
  return targetKey ? String(row[targetKey] as string || "").trim() : "";
}

/**
 * Safety helper to find the actual header key from a list of headers.
 */
export function findColumnKey(headers: string[], columnName: string): string {
  if (!headers) return columnName;
  return headers.find((h) => h.toLowerCase() === columnName.toLowerCase()) || columnName;
}

/**
 * Validates if the given Kelompok belongs to the given Desa.
 */
export function isMappingCorrect(desa: string, kelompok: string): boolean {
  if (!desa || !kelompok) return true;
  const validKelompoks = desaData[desa.toUpperCase()];
  if (!validKelompoks) return false;
  
  // Normalize strings for comparison (trim and lowercase)
  const normalizedKelompok = kelompok.trim().toLowerCase();
  return validKelompoks.some(k => k.trim().toLowerCase() === normalizedKelompok);
}
