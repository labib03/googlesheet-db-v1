import type ExcelJS from "exceljs";
import { SheetRow } from "@/lib/google-sheets";
import { getCellValue } from "@/lib/helper";
import { COLUMNS } from "@/lib/constants";

export type ExportMode = "single" | "by-desa" | "by-kelompok" | "by-jenjang";

export interface ActiveFilters {
  desa: string[];
  kelompok: string[];
  jenjang: string[];
}

export interface ExcelExportConfig {
  mode: ExportMode;
  data: SheetRow[];
  headers: string[];
  aiColumns: string[];
  activeFilters: ActiveFilters;
  includeNo?: boolean;
}

interface RowRecord {
  [key: string]: string | number;
}

const HEADER_FILL: ExcelJS.FillPattern = {
  type: "pattern",
  pattern: "solid",
  fgColor: { argb: "FFF1F5F9" },
};

const HEADER_FONT: Partial<ExcelJS.Font> = {
  bold: true,
  size: 11,
  name: "Calibri",
};

const DATA_FONT: Partial<ExcelJS.Font> = {
  size: 10,
  name: "Calibri",
};

const THIN_BORDER: Partial<ExcelJS.Borders> = {
  top: { style: "thin", color: { argb: "FFD1D5DB" } },
  left: { style: "thin", color: { argb: "FFD1D5DB" } },
  bottom: { style: "thin", color: { argb: "FFD1D5DB" } },
  right: { style: "thin", color: { argb: "FFD1D5DB" } },
};

const DESA_COLORS: Record<string, string> = {
  "BUDI AGUNG": "FF3B82F6", // Modern Blue
  "CIPARIGI": "FF10B981",   // Emerald Green
  "CIPAYUNG": "FFF59E0B",   // Amber Gold
  "GUNUNG GEDE": "FFF97316", // Modern Orange
  "GUNUNG SINDUR": "FF06B6D4", // Cyan
  "MARGAJAYA": "FF84CC16",   // Lime Green
  "SALABENDA": "FFEC4899",   // Rose Pink
  "SAWANGAN": "FF14B8A6",    // Teal
};

/**
 * Gets premium tab color associated with a Desa name.
 */
function getDesaColor(desaName: string): string | undefined {
  if (!desaName) return undefined;
  const key = desaName.toUpperCase().trim();
  return DESA_COLORS[key];
}

/**
 * Formats filter value by prepending the prefix if it's not already present.
 */
function formatFilterValue(value: string, prefix: string): string {
  const trimmed = value.trim();
  if (trimmed.toLowerCase().startsWith(prefix.toLowerCase())) {
    return trimmed;
  }
  return `${prefix} ${trimmed}`;
}

/**
 * Builds dynamic filename based on active filters.
 * Only appends filter label if exactly 1 item is selected.
 */
export function buildFilename(activeFilters: ActiveFilters): string {
  const parts: string[] = ["Data Generus"];

  if (activeFilters.desa.length === 1) {
    parts.push(formatFilterValue(activeFilters.desa[0], "Desa"));
  }
  if (activeFilters.kelompok.length === 1) {
    parts.push(formatFilterValue(activeFilters.kelompok[0], "Kelompok"));
  }
  if (activeFilters.jenjang.length === 1) {
    parts.push(formatFilterValue(activeFilters.jenjang[0], "Kelas"));
  }

  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  parts.push(`${yyyy} ${mm} ${dd}`);

  return parts.join(" - ") + ".xlsx";
}

/**
 * Sanitize sheet name for Excel (max 31 chars, no special chars).
 */
function sanitizeSheetName(name: string): string {
  return name
    .replace(/[\\/*?:\[\]]/g, "")
    .substring(0, 31)
    .trim() || "Sheet";
}

/**
 * Converts SheetRow data to plain record objects for export.
 */
function prepareRows(
  data: SheetRow[],
  headers: string[],
  aiColumns: string[],
  includeNo: boolean,
  startIndex: number = 0,
): RowRecord[] {
  return data.map((row, index) => {
    const obj: RowRecord = {};
    const allHeaders = includeNo ? ["No", ...headers, ...aiColumns] : [...headers, ...aiColumns];

    allHeaders.forEach((header) => {
      if (header === "No" && includeNo) {
        obj[header] = startIndex + index + 1;
      } else if (aiColumns.includes(header)) {
        obj[header] = String(row[`_ai_${header}`] || "-");
      } else {
        obj[header] = getCellValue(row, header) || "-";
      }
    });

    return obj;
  });
}

/**
 * Multi-level sort: Desa (A-Z) → Kelompok (A-Z) → Jenjang Kelas (A-Z).
 */
function sortDataMultiLevel(data: SheetRow[]): SheetRow[] {
  return [...data].sort((a, b) => {
    const desaA = getCellValue(a, COLUMNS.DESA).toLowerCase();
    const desaB = getCellValue(b, COLUMNS.DESA).toLowerCase();
    if (desaA !== desaB) return desaA.localeCompare(desaB, "id");

    const kelA = getCellValue(a, COLUMNS.KELOMPOK).toLowerCase();
    const kelB = getCellValue(b, COLUMNS.KELOMPOK).toLowerCase();
    if (kelA !== kelB) return kelA.localeCompare(kelB, "id");

    const jenA = getCellValue(a, COLUMNS.JENJANG).toLowerCase();
    const jenB = getCellValue(b, COLUMNS.JENJANG).toLowerCase();
    return jenA.localeCompare(jenB, "id");
  });
}

/**
 * Groups data by a specific column value (case-insensitive).
 * Uses normalized key for grouping but preserves first-seen casing as display name.
 */
function groupDataBy(
  data: SheetRow[],
  columnName: string,
): Map<string, SheetRow[]> {
  const groups = new Map<string, SheetRow[]>();
  const normalizedKeyToDisplay = new Map<string, string>();

  data.forEach((row) => {
    const raw = getCellValue(row, columnName) || "Lainnya";
    const normalizedKey = raw.toLowerCase().trim();

    if (!normalizedKeyToDisplay.has(normalizedKey)) {
      normalizedKeyToDisplay.set(normalizedKey, raw.trim());
    }

    if (!groups.has(normalizedKey)) {
      groups.set(normalizedKey, []);
    }
    groups.get(normalizedKey)!.push(row);
  });

  // Re-map using display names, sorted alphabetically
  const sorted = new Map(
    [...groups.entries()]
      .sort(([a], [b]) => a.localeCompare(b, "id"))
      .map(([normKey, rows]) => [normalizedKeyToDisplay.get(normKey)!, rows]),
  );

  return sorted;
}

/**
 * Creates a styled worksheet with formatted headers and auto-fit columns.
 */
function createStyledWorksheet(
  workbook: ExcelJS.Workbook,
  sheetName: string,
  allHeaders: string[],
  rows: RowRecord[],
  tabColor?: string,
): ExcelJS.Worksheet {
  const ws = workbook.addWorksheet(sanitizeSheetName(sheetName));

  if (tabColor) {
    ws.properties.tabColor = { argb: tabColor };
  }

  // Add header row
  const headerRow = ws.addRow(allHeaders);
  headerRow.eachCell((cell) => {
    cell.fill = HEADER_FILL;
    cell.font = HEADER_FONT;
    cell.alignment = { horizontal: "center", vertical: "middle" };
    cell.border = THIN_BORDER;
  });
  headerRow.height = 24;

  // Add data rows
  rows.forEach((row) => {
    const values = allHeaders.map((h) => row[h] ?? "-");
    const dataRow = ws.addRow(values);
    dataRow.eachCell((cell) => {
      cell.font = DATA_FONT;
      cell.alignment = { vertical: "middle", wrapText: false };
      cell.border = THIN_BORDER;
    });
  });

  // Auto-fit column widths
  allHeaders.forEach((header, colIndex) => {
    let maxLen = header.length;
    rows.forEach((row) => {
      const val = String(row[header] ?? "");
      maxLen = Math.max(maxLen, val.length);
    });
    const col = ws.getColumn(colIndex + 1);
    col.width = Math.min(maxLen + 3, 45);
  });

  // Auto-filter on header row
  if (rows.length > 0) {
    ws.autoFilter = {
      from: { row: 1, column: 1 },
      to: { row: 1, column: allHeaders.length },
    };
  }

  // Freeze header row
  ws.views = [{ state: "frozen", ySplit: 1 }];

  return ws;
}

/**
 * Main export function — generates the Excel file as a Blob.
 */
export async function generateExcelFile(
  config: ExcelExportConfig,
): Promise<{ blob: Blob; filename: string }> {
  const { mode, data, headers, aiColumns, activeFilters, includeNo = false } = config;

  const exceljs = await import("exceljs");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const WorkbookClass = exceljs.Workbook || (exceljs as any).default?.Workbook;
  if (!WorkbookClass) {
    throw new Error("Failed to load ExcelJS Workbook class");
  }
  const workbook = new WorkbookClass();
  workbook.creator = "Antigravity";
  workbook.created = new Date();

  const allHeaders = includeNo ? ["No", ...headers, ...aiColumns] : [...headers, ...aiColumns];

  if (mode === "single") {
    const sorted = sortDataMultiLevel(data);
    const rows = prepareRows(sorted, headers, aiColumns, includeNo);
    createStyledWorksheet(workbook, "Data Generus", allHeaders, rows);
  } else {
    const columnMap: Record<string, string> = {
      "by-desa": COLUMNS.DESA,
      "by-kelompok": COLUMNS.KELOMPOK,
      "by-jenjang": COLUMNS.JENJANG,
    };

    const groupColumn = columnMap[mode];
    const groups = groupDataBy(data, groupColumn);

    const isDesaColoringApplicable =
      mode === "by-kelompok" &&
      (activeFilters.desa.length === 0 || activeFilters.desa.length > 1);

    const sortedGroupsList = [...groups.entries()];
    if (mode === "by-kelompok") {
      sortedGroupsList.sort(([keyA, rowsA], [keyB, rowsB]) => {
        const firstA = rowsA[0];
        const desaA = firstA ? (getCellValue(firstA, COLUMNS.DESA) || "Lainnya").toLowerCase().trim() : "lainnya";

        const firstB = rowsB[0];
        const desaB = firstB ? (getCellValue(firstB, COLUMNS.DESA) || "Lainnya").toLowerCase().trim() : "lainnya";

        if (desaA !== desaB) {
          return desaA.localeCompare(desaB, "id");
        }

        const kelA = keyA.toLowerCase().trim();
        const kelB = keyB.toLowerCase().trim();
        return kelA.localeCompare(kelB, "id");
      });
    }

    sortedGroupsList.forEach(([groupName, groupData]) => {
      if (groupData.length === 0) return;
      const sorted = sortDataMultiLevel(groupData);
      const rows = prepareRows(sorted, headers, aiColumns, includeNo);

      let tabColor: string | undefined = undefined;
      if (isDesaColoringApplicable) {
        const firstRow = groupData[0];
        const desaName = firstRow ? (getCellValue(firstRow, COLUMNS.DESA) || "") : "";
        tabColor = getDesaColor(desaName);
      }

      createStyledWorksheet(workbook, groupName, allHeaders, rows, tabColor);
    });

    // Fallback: if no groups created, add empty sheet
    if (workbook.worksheets.length === 0) {
      createStyledWorksheet(workbook, "Data Generus", allHeaders, []);
    }
  }

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  const filename = buildFilename(activeFilters);

  return { blob, filename };
}
