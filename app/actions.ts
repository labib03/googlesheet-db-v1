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
import {
  comparePassword,
  createSession,
  deleteSession,
  getSession,
  hashPassword,
} from "@/lib/auth-service";

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
    })
      .format(new Date())
      .replace(",", "");

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
    })
      .format(new Date())
      .replace(",", "");

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
  metadata?: {
    isMarried?: boolean;
    isPindahSambung?: boolean;
    keterangan?: string;
  },
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
    })
      .format(new Date())
      .replace(",", "");

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

export async function bulkDeleteData(
  rowIndices: number[],
  keterangan?: string,
) {
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
    })
      .format(new Date())
      .replace(",", "");

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

/**
 * Internal core function to fetch all configuration without filtering.
 */
async function getInternalConfig() {
  try {
    const rawData = await getSheetData(CONFIG_SHEET_NAME);
    const config: Record<string, unknown> = {};

    rawData.forEach((row) => {
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
    console.error("Internal config error:", error);
    return { success: false, data: {} };
  }
}

/**
 * Publicly accessible version that filters out sensitive keys
 */
export async function getGlobalConfig() {
  const result = await getInternalConfig();
  if (!result.success) return result;

  const SENSITIVE_KEYS: string[] = [
    CONFIG_KEYS.ADMIN_PASSWORD,
    CONFIG_KEYS.ADMIN_USERS,
  ];
  const sanitizedData: Record<string, unknown> = {};

  Object.keys(result.data).forEach((key) => {
    if (!SENSITIVE_KEYS.includes(key)) {
      sanitizedData[key] = result.data[key];
    }
  });

  return { success: true, data: sanitizedData };
}

export async function saveGlobalConfig(key: string, value: unknown) {
  try {
    const rawData = await getSheetData(CONFIG_SHEET_NAME);
    const rowIndex = rawData.findIndex((row) => row["KEY"] === key);

    let stringValue = String(value);
    let type = "string";

    if (Array.isArray(value) || (typeof value === "object" && value !== null)) {
      stringValue = JSON.stringify(value);
      type = "json";
    } else if (typeof value === "boolean") {
      stringValue = String(value);
      type = "boolean";
    } else if (typeof value === "number") {
      stringValue = String(value);
      type = "number";
    }

    const rowData: SheetRow = {
      KEY: key,
      VALUE: stringValue,
      TYPE: type,
      LAST_UPDATED: new Date().toISOString(),
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

interface AdminUser {
  username: string;
  passwordHash: string;
  plainPassword?: string; // Added to help owner view original password via Google Sheets
  role: string;
}

export async function loginAdminAction(
  password: string,
  username: string = "admin",
) {
  try {
    const configResult = await getInternalConfig();
    if (!configResult.success) {
      return {
        success: false,
        message: "Server error: Failed to fetch configuration",
      };
    }

    const config = configResult.data;
    let users = (config[CONFIG_KEYS.ADMIN_USERS] as AdminUser[]) || [];

    // Migration: If no users exist, but ADMIN_PASSWORD exists, migrate it
    if (users.length === 0 && config[CONFIG_KEYS.ADMIN_PASSWORD]) {
      const oldPass = String(config[CONFIG_KEYS.ADMIN_PASSWORD]);
      const hashed = await hashPassword(oldPass);
      const newUser: AdminUser = {
        username: "admin",
        passwordHash: hashed,
        plainPassword: oldPass, // Store plain text for convenience
        role: "superadmin",
      };
      users = [newUser];
      await saveGlobalConfig(CONFIG_KEYS.ADMIN_USERS, users);
    }

    // Fallback: Default admin if everything is empty
    if (users.length === 0) {
      const defaultPass = "admin123";
      const hashed = await hashPassword(defaultPass);
      const newUser: AdminUser = {
        username: "admin",
        passwordHash: hashed,
        plainPassword: defaultPass, // Store plain text for convenience
        role: "superadmin",
      };
      users = [newUser];
      await saveGlobalConfig(CONFIG_KEYS.ADMIN_USERS, users);
    }

    const user = users.find((u) => u.username === username);

    if (!user) {
      return { success: false, message: "User not found" };
    }

    const isValid = await comparePassword(password, user.passwordHash);

    if (isValid) {
      await createSession({ username: user.username, role: user.role });
      return { success: true, message: "Login successful" };
    } else {
      return { success: false, message: "Invalid password" };
    }
  } catch (error) {
    console.error("Login Error:", error);
    return { success: false, message: "An unexpected error occurred" };
  }
}

export async function logoutAdminAction() {
  await deleteSession();
  revalidatePath("/");
  return { success: true };
}

export async function verifySessionAction() {
  const session = await getSession();
  return { isAuthenticated: !!session, user: session };
}
