"use server";

import {
  appendSheetData,
  updateSheetData,
  deleteSheetData,
  appendSheetDataBulk,
  deleteSheetRowsBulk,
  getSheetData,
  getRowData,
  SheetRow,
} from "@/lib/google-sheets";
import { calculateAge, formatDate, getJenjangKelas } from "@/lib/helper";
import { revalidatePath, revalidateTag } from "next/cache";
import { CONFIG_SHEET_NAME, CONFIG_KEYS } from "@/lib/constants";

export type ActionState = {
  success: boolean;
  message: string;
} | null;

export async function addData(prevState: ActionState, formData: FormData) {
  try {
    const rawData: SheetRow = {};

    // Convert FormData to SheetRow object
    // Exclude special fields if any
    for (const [key, value] of formData.entries()) {
      if (!key.startsWith("$")) {
        rawData[key] = value.toString();
      }
    }

    // Auto-add Timestamp with current date and time (WIB - Jakarta)
    const timestamp = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Asia/Jakarta",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    }).format(new Date()).replace(",", "");
    
    rawData["Timestamp"] = timestamp;

    await appendSheetData(rawData);
    revalidateTag("google-sheets", "default");
    revalidatePath("/");
    revalidatePath("/admin-restricted");

    return { success: true, message: "Data berhasil ditambahkan!" };
  } catch (error) {
    console.error("Failed to add data:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Gagal menambahkan data",
    };
  }
}

export async function updateData(
  rowIndex: number,
  prevState: ActionState,
  formData: FormData,
) {
  try {
    const rawData: SheetRow = {};

    for (const [key, value] of formData.entries()) {
      if (!key.startsWith("$")) {
        rawData[key] = value.toString();
      }
    }

    // Auto-update Timestamp with current date and time (WIB - Jakarta)
    const timestamp = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Asia/Jakarta",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    }).format(new Date()).replace(",", "");

    rawData["Timestamp"] = timestamp;

    await updateSheetData(rowIndex, rawData);
    revalidateTag("google-sheets", "default");
    revalidatePath("/");
    revalidatePath("/admin-restricted");

    return { success: true, message: "Data berhasil diperbarui!" };
  } catch (error) {
    console.error("Failed to update data:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Gagal memperbarui data",
    };
  }
}

export async function deleteData(
  rowIndex: number, 
  metadata?: { isMarried?: boolean; isPindahSambung?: boolean; keterangan?: string }
) {
  try {
    // 1. Ambil data asli sebelum dihapus
    const rowToDelete = await getRowData(rowIndex);
    
    // 2. Salin data ke sheet "Trash"
    // Update timestamp to deletion time
    const timestamp = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Asia/Jakarta",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    }).format(new Date()).replace(",", "");
    
    rowToDelete["Timestamp"] = timestamp;

    // Add metadata for Trash
    rowToDelete["IsMarried"] = metadata?.isMarried ? 1 : 0;
    rowToDelete["IsPindahSambung"] = metadata?.isPindahSambung ? 1 : 0;
    rowToDelete["Keterangan"] = metadata?.keterangan || "";

    // Pastikan sheet ini ada di Google Sheet Anda
    await appendSheetData(rowToDelete, "Trash");

    // 3. Jika berhasil disalin, baru hapus dari sheet utama
    await deleteSheetData(rowIndex);

    revalidateTag("google-sheets", "default");
    revalidatePath("/");
    revalidatePath("/admin-restricted");
    return { success: true, message: "Data berhasil dipindahkan ke Trash!" };
  } catch (error) {
    console.error("Failed to delete data:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Gagal menghapus data",
    };
  }
}

export async function bulkDeleteData(rowIndices: number[], keterangan?: string) {
  try {
    const timestamp = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Asia/Jakarta",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    }).format(new Date()).replace(",", "");

    const allData = await getSheetData();
    const rowsToDelete: SheetRow[] = [];

    rowIndices.forEach((idx) => {
      // Row 2 is allData[0]
      const dataIdx = idx - 2;
      if (allData[dataIdx]) {
        const row = { ...allData[dataIdx] };
        row["Timestamp"] = timestamp;
        
        // Add default/provided metadata for Trash in bulk
        row["IsMarried"] = 0;
        row["IsPindahSambung"] = 0;
        row["Keterangan"] = keterangan || "";

        rowsToDelete.push(row);
      }
    });

    if (rowsToDelete.length > 0) {
      await appendSheetDataBulk(rowsToDelete, "Trash");
      await deleteSheetRowsBulk(rowIndices);
    }

    revalidateTag("google-sheets", "default");
    revalidatePath("/");
    revalidatePath("/admin-restricted");
    return {
      success: true,
      message: `${rowsToDelete.length} data berhasil dipindahkan ke Trash!`,
    };
  } catch (error) {
    console.error("Failed to bulk delete data:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Gagal menghapus data massal",
    };
  }
}

export async function getSheetDataAction() {
  try {
    const rawData = await getSheetData();
    const processedData = rawData.map((row, index) => {
      const tanggalLahirRaw = String(row["TANGGAL LAHIR"] || "");
      const updatedRow: SheetRow & { _index: number } = {
        ...row,
        _index: index,
      };

      if (tanggalLahirRaw.trim()) {
        updatedRow["Umur"] = calculateAge(tanggalLahirRaw);
        updatedRow["TANGGAL LAHIR"] = formatDate(tanggalLahirRaw);
      }

      if (updatedRow["Umur"] != undefined) {
        updatedRow["Jenjang Kelas"] = getJenjangKelas(
          updatedRow["Umur"] as string,
        );
      }

      return updatedRow;
    });

    return { success: true, data: processedData };
  } catch {
    return { success: false, message: "Failed to fetch data" };
  }
}

export async function getGlobalConfig() {
  try {
    const rawData = await getSheetData(CONFIG_SHEET_NAME);
    const config: Record<string, unknown> = {};

    rawData.forEach(row => {
      const key = String(row["KEY"] || "");
      const value = String(row["VALUE"] || "");
      const type = String(row["TYPE"] || "string");

      if (key) {
        if (type === "json") {
          try {
            config[key] = JSON.parse(value);
          } catch {
            config[key] = [];
          }
        } else if (type === "boolean") {
          config[key] = value.toLowerCase() === "true";
        } else if (type === "number") {
          config[key] = Number(value);
        } else {
          config[key] = value;
        }
      }
    });

    return { success: true, data: config };
  } catch (error) {
    console.error("Failed to fetch global config:", error);
    return { success: false, data: {} };
  }
}

export async function saveGlobalConfig(key: string, value: unknown) {
  try {
    const rawData = await getSheetData(CONFIG_SHEET_NAME);
    const rowIndex = rawData.findIndex(row => row["KEY"] === key);
    
    let stringValue = String(value);
    let type = "string";

    if (Array.isArray(value) || (typeof value === 'object' && value !== null)) {
      stringValue = JSON.stringify(value);
      type = "json";
    } else if (typeof value === 'boolean') {
      stringValue = String(value);
      type = "boolean";
    } else if (typeof value === 'number') {
      stringValue = String(value);
      type = "number";
    }

    const rowData: SheetRow = {
      KEY: key,
      VALUE: stringValue,
      TYPE: type,
      LAST_UPDATED: new Date().toISOString()
    };

    if (rowIndex >= 0) {
      // Row indices are 1-based in updateSheetData, and we have headers.
      // rawData index 0 is actually Row 2 in sheet (because Row 1 is header).
      // So update index = dataIndex + 2.
      await updateSheetData(rowIndex + 2, rowData, CONFIG_SHEET_NAME);
    } else {
      await appendSheetData(rowData, CONFIG_SHEET_NAME);
    }
    
    revalidateTag("google-sheets", "default");
    revalidatePath("/admin-restricted/settings");
    return { success: true, message: "Configuration saved" };
  } catch (error) {
    console.error("Failed to save config:", error);
    return { success: false, message: "Failed to save configuration" };
  }
}
