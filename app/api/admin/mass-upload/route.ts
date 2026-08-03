import { NextResponse } from "next/server";
import {
  getSheetData,
  appendSheetDataBulk,
  updateSheetDataBulk,
  deleteSheetRowsBulk,
  SheetRow,
} from "@/lib/google-sheets";
import { COLUMNS } from "@/lib/constants";
import { processKeteranganAction } from "@/lib/keterangan-actions";
import { getCellValue } from "@/lib/helper";
import { revalidateTag } from "next/cache";

export async function POST(request: Request) {
  try {
    const { rows } = await request.json();

    if (!rows || !Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json({ error: "No data provided" }, { status: 400 });
    }

    // 1. Fetch current data to determine which rows are new and which are updates
    const currentData = await getSheetData();

    const newRows: SheetRow[] = [];
    const updateRows: Array<{ rowIndex: number; rowData: SheetRow }> = [];
    const indicesToDelete: number[] = [];
    const rowsToTrash: SheetRow[] = [];

    const getJakartaTimestamp = () =>
      new Intl.DateTimeFormat("en-GB", {
        timeZone: "Asia/Jakarta",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      })
        .format(new Date())
        .replace(",", "");

    // Map existing data by composite key (NAMA LENGKAP + KELOMPOK) for quick lookup
    // Include the original row index (1-based, assuming row 1 is header, data starts at 2)
    const existingMap = new Map<string, { rowIndex: number; rowData: SheetRow }>();
    currentData.forEach((row, index) => {
      const nama = getCellValue(row, COLUMNS.NAMA).toLowerCase();
      const kelompok = getCellValue(row, COLUMNS.KELOMPOK).toLowerCase();
      if (nama && kelompok) {
        existingMap.set(`${nama}_${kelompok}`, { rowIndex: index + 2, rowData: row });
      }
    });

    for (const row of rows) {
      const nama = getCellValue(row, "NAMA LENGKAP").toLowerCase();
      const kelompok = getCellValue(row, "KELOMPOK").toLowerCase();
      const keterangan = getCellValue(row, "KETERANGAN");

      const action = processKeteranganAction(keterangan, row);
      const compositeKey = `${nama}_${kelompok}`;
      const existing = existingMap.get(compositeKey);

      if (action === "HAPUS_DATA") {
        if (existing) {
          const trashRow: SheetRow = { ...existing.rowData };
          trashRow[COLUMNS.TIMESTAMP] = getJakartaTimestamp();
          trashRow["IsMarried"] = 0;
          trashRow["IsPindahSambung"] = 1;
          if (keterangan) {
            trashRow[COLUMNS.KETERANGAN] = keterangan;
          }
          rowsToTrash.push(trashRow);
          indicesToDelete.push(existing.rowIndex);
        }
        continue;
      }

      // Convert our generic row to the SheetRow object mapping
      const mappedRow: SheetRow = {};
      Object.keys(COLUMNS).forEach((key) => {
        const header = COLUMNS[key as keyof typeof COLUMNS];
        const cellVal = getCellValue(row, header);
        if (cellVal !== "") {
          mappedRow[header] = cellVal;
        }
      });

      if (existing) {
        // Prepare to update
        // We merge with existing data so we don't lose unmapped columns (if any)
        const updatedRowData = { ...existing.rowData, ...mappedRow };
        updateRows.push({ rowIndex: existing.rowIndex, rowData: updatedRowData });
      } else {
        // Prepare to insert
        mappedRow[COLUMNS.TIMESTAMP] = getJakartaTimestamp();
        newRows.push(mappedRow);
      }
    }

    // 1. Move inactive records to Trash sheet
    if (rowsToTrash.length > 0) {
      await appendSheetDataBulk(rowsToTrash, "Trash");
    }

    // 2. Execute deletions from main sheet
    if (indicesToDelete.length > 0) {
      await deleteSheetRowsBulk(indicesToDelete);
    }

    // 3. Execute updates
    if (updateRows.length > 0) {
      await updateSheetDataBulk(updateRows);
    }

    // 4. Execute inserts
    if (newRows.length > 0) {
      await appendSheetDataBulk(newRows);
    }

    // Revalidate cache
    revalidateTag("google-sheets", "default" as any);

    return NextResponse.json({
      success: true,
      message: "Data processed successfully",
      stats: {
        inserted: newRows.length,
        updated: updateRows.length,
        deleted: indicesToDelete.length,
        trashed: rowsToTrash.length,
      },
    });
  } catch (error) {
    console.error("Error processing mass upload:", error);
    return NextResponse.json(
      { error: "Failed to process mass upload" },
      { status: 500 }
    );
  }
}
