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

export function formatDate(
  dateString: string,
  formatOutputDate: string = "dd/MM/yyyy",
): string {
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
export function getCellValue(
  row: Record<string, unknown>,
  columnName: string,
): string {
  if (!row) return "";
  const keys = Object.keys(row);
  const targetKey = keys.find(
    (k) => k.toLowerCase() === columnName.toLowerCase(),
  );
  return targetKey ? String((row[targetKey] as string) || "").trim() : "";
}

/**
 * Safety helper to find the actual header key from a list of headers.
 */
export function findColumnKey(headers: string[], columnName: string): string {
  if (!headers) return columnName;
  return (
    headers.find((h) => h.toLowerCase() === columnName.toLowerCase()) ||
    columnName
  );
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
  return validKelompoks.some(
    (k) => k.trim().toLowerCase() === normalizedKelompok,
  );
}

/**
 * Categorizes a string based on a mapping of categories to keywords using Regex.
 * Returns an array of matched categories.
 */
export function categorizeByKeywords(
  text: string,
  mapping: Record<string, string[]>,
): string[] {
  if (!text) return [];
  const categories: string[] = [];

  Object.entries(mapping).forEach(([category, keywords]) => {
    const isMatched = keywords.some((keyword) => {
      const trimmedKeyword = keyword.trim();
      if (!trimmedKeyword) return false;
      try {
        // Use word boundaries \b to ensure exact word match
        // Escape special characters to treat the keyword as a literal string
        const escapedKeyword = trimmedKeyword.replace(
          /[.*+?^${}()|[\]\\]/g,
          "\\$&",
        );
        const regex = new RegExp(`\\b${escapedKeyword}\\b`, "gi");
        return regex.test(text);
      } catch (e) {
        console.error(`Invalid regex for keyword: ${trimmedKeyword}`, e);
        return false;
      }
    });

    if (isMatched) {
      categories.push(category);
    }
  });

  return categories;
}
const INDONESIAN_STOP_WORDS = new Set([
  "dan",
  "di",
  "ke",
  "dari",
  "untuk",
  "pada",
  "dalam",
  "dengan",
  "yang",
  "itu",
  "ini",
  "ia",
  "dia",
  "mereka",
  "kita",
  "kami",
  "anda",
  "kamu",
  "saya",
  "tapi",
  "namun",
  "juga",
  "atau",
  "adalah",
  "sebagai",
  "oleh",
  "bahwa",
  "serta",
  "ada",
  "bisa",
  "dapat",
  "sudah",
  "belum",
  "sedang",
  "akan",
  "telah",
  "ingin",
  "mau",
  "ingin",
  "punya",
  "memiliki",
  "sangat",
  "lagi",
  "masih",
  "saja",
  "hanya",
  "tidak",
  "bukan",
  "mungkin",
  "pasti",
  "harus",
  "seperti",
  "sama",
  "lain",
  "lainnya",
  "tersebut",
  "secara",
  "karena",
  "sehingga",
  "bagi",
  "dari",
  "melalui",
  "tanpa",
  "terhadap",
  "seperti",
  "antara",
  "hampir",
  "sering",
  "terlalu",
  "paling",
  "kurang",
  "lebih",
  "cukup",
  "begitu",
  "jadi",
  "dulu",
  "pernah",
  "dapat",
  "ingin",
  "sesuai",
  "bidang",
  "maupun",
  "mampu",
  "aktif",
  "mengikuti",
  "menjadi",
  "serta",
  "seseorang",
  "seorang",
  "sebuah",
  "masuk",
  "keluar",
  "dalam",
  "luar",
  "satu",
  "dua",
  "tiga",
  "empat",
  "lima",
  "menggunakan",
  "melakukan",
  "memberikan",
  "membuat",
  "mendapatkan",
  "penerbangan",
  "sebenarnya",
  "sekitar",
  "selama",
  "seluruh",
  "semua",
  "seolah",
  "seperti",
  "sering",
  "setiap",
  "siapa",
  "sudah",
  "tahu",
  "tak",
  "tambah",
  "tapi",
  "tanpa",
  "telah",
  "tentang",
  "tentu",
  "terhadap",
  "terjadi",
  "terlalu",
  "terlebih",
  "termasuk",
  "ternyata",
  "tersebut",
  "tersedia",
  "tertentu",
  "tetapi",
  "tiada",
  "tidak",
  "tidakkah",
  "tidaklah",
  "tiga",
  "toh",
  "tuju",
  "tunjuk",
  "turut",
  "tutur",
  "dua",
  "tiga",
  "waduh",
  "wah",
  "wahai",
  "waktu",
  "walau",
  "walaupun",
  "wong",
  "yaitu",
  "yakni",
  "yang",
  "beberapa",
  "ingin",
  "mau",
  "hobi",
  "skill",
  "cita",
  "cita-cita",
  "ingin",
  "jadi",
  "menjadi",
]);

/**
 * Extracts most frequent meaningful words from an array of strings.
 * Filters out Indonesian stop words and words that are too short.
 */
export function getTopTerms(
  texts: string[],
  limit: number = 10,
): Record<string, number> {
  const counts: Record<string, number> = {};

  texts.forEach((text) => {
    if (!text) return;
    // Lowercase, remove symbols, split by non-word chars
    const words = text
      .toLowerCase()
      .replace(/[^\w\s,]/g, "")
      .split(/[\s,]+/);

    words.forEach((word) => {
      const trimmed = word.trim();
      if (trimmed.length < 3) return; // Ignore very short words
      if (INDONESIAN_STOP_WORDS.has(trimmed)) return;

      counts[trimmed] = (counts[trimmed] || 0) + 1;
    });
  });

  // Sort and limit
  return Object.entries(counts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, limit)
    .reduce(
      (obj, [key, val]) => {
        obj[key] = val;
        return obj;
      },
      {} as Record<string, number>,
    );
}
