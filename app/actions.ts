"use server";

import {
  appendSheetData,
  updateSheetData,
  deleteSheetData,
  getSheetData,
  SheetRow,
} from "@/lib/google-sheets";
import { calculateAge, formatDate, getJenjangKelas } from "@/lib/helper";
import { revalidatePath } from "next/cache";

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

export async function deleteData(rowIndex: number) {
  try {
    await deleteSheetData(rowIndex);
    revalidatePath("/");
    revalidatePath("/admin-restricted");
    return { success: true, message: "Data berhasil dihapus!" };
  } catch (error) {
    console.error("Failed to delete data:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Gagal menghapus data",
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
  } catch (error) {
    return { success: false, message: "Failed to fetch data" };
  }
}
