import { NextResponse } from "next/server";
import {
  getSheetData,
  appendSheetDataBulk,
  updateSheetData,
  deleteSheetRowsBulk,
  SheetRow,
} from "@/lib/google-sheets";
import { COLUMNS } from "@/lib/constants";
import { processKeteranganAction } from "@/lib/keterangan-actions";
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
    const updatePromises: Promise<void>[] = [];
    const indicesToDelete: number[] = [];

    // Map existing data by composite key (NAMA LENGKAP + KELOMPOK) for quick lookup
    // Include the original row index (1-based, assuming row 1 is header, data starts at 2)
    const existingMap = new Map<string, { rowIndex: number; rowData: SheetRow }>();
    currentData.forEach((row, index) => {
      const nama = String(row[COLUMNS.NAMA] || "").trim().toLowerCase();
      const kelompok = String(row[COLUMNS.KELOMPOK] || "").trim().toLowerCase();
      if (nama && kelompok) {
        existingMap.set(`${nama}_${kelompok}`, { rowIndex: index + 2, rowData: row });
      }
    });

    for (const row of rows) {
      const nama = String(row["NAMA LENGKAP"] || "").trim().toLowerCase();
      const kelompok = String(row["KELOMPOK"] || "").trim().toLowerCase();
      const keterangan = row["KETERANGAN"];

      const action = processKeteranganAction(keterangan, row);
      const compositeKey = `${nama}_${kelompok}`;
      const existing = existingMap.get(compositeKey);

      if (action === "HAPUS_DATA") {
        if (existing) {
          indicesToDelete.push(existing.rowIndex);
        }
        continue;
      }

      // Convert our generic row to the SheetRow object mapping
      const mappedRow: SheetRow = {};
      Object.keys(COLUMNS).forEach((key) => {
        const header = COLUMNS[key as keyof typeof COLUMNS];
        if (row[header] !== undefined) {
          mappedRow[header] = row[header];
        }
      });
      // Also map KETERANGAN explicitly if it's in COLUMNS
      if (row["KETERANGAN"] !== undefined) {
          mappedRow["KETERANGAN"] = row["KETERANGAN"];
      }

      if (existing) {
        // Prepare to update
        // We merge with existing data so we don't lose unmapped columns (if any)
        const updatedRowData = { ...existing.rowData, ...mappedRow };
        updatePromises.push(updateSheetData(existing.rowIndex, updatedRowData));
      } else {
        // Prepare to insert
        const timestamp = new Intl.DateTimeFormat("en-GB", {
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
        mappedRow[COLUMNS.TIMESTAMP] = timestamp;
        newRows.push(mappedRow);
      }
    }

    // Execute deletions
    if (indicesToDelete.length > 0) {
      await deleteSheetRowsBulk(indicesToDelete);
    }

    // Execute updates
    if (updatePromises.length > 0) {
      // Execute serially or in small batches to avoid rate limits
      for (const updatePromise of updatePromises) {
        await updatePromise;
      }
    }

    // Execute inserts
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
        updated: updatePromises.length,
        deleted: indicesToDelete.length,
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
