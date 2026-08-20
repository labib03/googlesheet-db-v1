import ExcelJS from "exceljs";

export const MASS_UPLOAD_COLUMNS = [
  "NAMA LENGKAP",
  "JENIS KELAMIN",
  "TEMPAT LAHIR",
  "TANGGAL LAHIR",
  "NOMOR HP",
  "DESA",
  "KELOMPOK",
  "NAMA AYAH",
  "NAMA IBU",
  "HOBI",
  "SKILL / CITA-CITA",
  "KETERANGAN",
];

export async function generateMassUploadTemplate(): Promise<ArrayBuffer> {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Mass Upload Data");

  // Add headers, modifying TANGGAL LAHIR to include the format instruction
  const templateHeaders = MASS_UPLOAD_COLUMNS.map(col => {
    if (col === "TANGGAL LAHIR") return "TANGGAL LAHIR (DD/MM/YYYY)";
    if (col === "JENIS KELAMIN") return "JENIS KELAMIN (L/P)";
    return col;
  });
  worksheet.addRow(templateHeaders);

  // Style headers
  const headerRow = worksheet.getRow(1);
  headerRow.font = { bold: true };
  headerRow.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFD3D3D3" }, // Light gray
  };

  // Adjust column widths and formats
  worksheet.columns.forEach((column) => {
    column.width = 25;
  });

  // Set "NOMOR HP" column to text format so leading zeros aren't dropped
  const hpColIndex = MASS_UPLOAD_COLUMNS.indexOf("NOMOR HP") + 1;
  if (hpColIndex > 0) {
    const hpColumn = worksheet.getColumn(hpColIndex);
    hpColumn.numFmt = "@";
  }

  const buffer = await workbook.xlsx.writeBuffer();
  return buffer as ArrayBuffer;
}

export function normalizeHeaderName(rawHeader: string): string {
  const cleaned = rawHeader.trim();
  const lower = cleaned.toLowerCase();

  if (lower.startsWith("nama lengkap") || lower === "nama") return "NAMA LENGKAP";
  if (lower.startsWith("jenis kelamin")) return "JENIS KELAMIN";
  if (lower.startsWith("tempat lahir")) return "TEMPAT LAHIR";
  if (lower.startsWith("tanggal lahir")) return "TANGGAL LAHIR";
  if (
    lower.startsWith("nomor hp") ||
    lower === "no hp" ||
    lower === "no. hp" ||
    lower === "nohp"
  )
    return "NOMOR HP";
  if (lower === "desa") return "DESA";
  if (lower === "kelompok") return "KELOMPOK";
  if (lower.startsWith("nama ayah") || lower === "ayah") return "NAMA AYAH";
  if (lower.startsWith("nama ibu") || lower === "ibu") return "NAMA IBU";
  if (lower === "hobi") return "HOBI";
  if (lower.includes("skill") || lower.includes("cita"))
    return "SKILL / CITA-CITA";
  if (lower === "keterangan") return "KETERANGAN";
  if (lower.startsWith("jenjang")) return "Jenjang Kelas";

  return cleaned;
}

export async function parseMassUploadFile(
  buffer: ArrayBuffer
): Promise<Record<string, string>[]> {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer);

  const worksheet = workbook.worksheets[0];
  if (!worksheet) {
    throw new Error("No worksheet found in the Excel file");
  }

  const rows: Record<string, string>[] = [];
  const headers: string[] = [];

  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) {
      // Header row
      row.eachCell((cell, colNumber) => {
        const rawHeaderText = cell.value?.toString() || "";
        headers[colNumber] = normalizeHeaderName(rawHeaderText);
      });
    } else {
      // Data row
      const rowData: Record<string, string> = {};
      let hasData = false;

      row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
        const header = headers[colNumber];
        if (header) {
          // Format date cells correctly if they are dates
          let cellValue = "";
          if (cell.type === ExcelJS.ValueType.Date) {
             const date = cell.value as Date;
             // Extract DD/MM/YYYY
             const d = date.getDate().toString().padStart(2, '0');
             const m = (date.getMonth() + 1).toString().padStart(2, '0');
             const y = date.getFullYear();
             cellValue = `${d}/${m}/${y}`;
          } else {
             cellValue = cell.value?.toString().trim() || "";
          }

          // Normalize gender values
          if (header === "JENIS KELAMIN") {
             const lowerVal = cellValue.toLowerCase();
             if (lowerVal === "l" || lowerVal === "laki-laki") {
               cellValue = "Laki-laki";
             } else if (lowerVal === "p" || lowerVal === "perempuan") {
               cellValue = "Perempuan";
             }
          }

          rowData[header] = cellValue;
          if (cellValue) {
            hasData = true;
          }
        }
      });

      if (hasData) {
        // Only push rows that are not entirely empty
        rows.push(rowData);
      }
    }
  });

  return rows;
}
