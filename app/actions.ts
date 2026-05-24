"use server";

import {
  appendSheetData,
  updateSheetData,
  updateSheetCell,
  deleteSheetData,
  appendSheetDataBulk,
  deleteSheetRowsBulk,
  getSheetData,
  getRowData,
  SheetRow,
} from "@/lib/google-sheets";
import { calculateAge, formatDate, getJenjangKelas } from "@/lib/helper";
import { fetchAndProcessData } from "@/lib/process-sheet-data";
import { revalidatePath, revalidateTag } from "next/cache";
import {
  CONFIG_SHEET_NAME,
  CONFIG_KEYS,
  ADDITIONAL_INFO_SHEET_NAME,
} from "@/lib/constants";
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

function capitalizeWords(str: string): string {
  return str.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
}

const UI_TO_ADDITIONAL_INFO_MAP: Record<string, string> = {
  namaPanggilan: "Nama Panggilan",
  asalSekolah: "Asal Sekolah",
  kelas: "Kelas",
  jurusan: "Jurusan",
  kesibukanSaatIni: "Kesibukan Saat ini",
  mencariPekerjaan: "Jika belum bekerja, apakah anda sedang mencari pekerjaan?",
  keahlianImpianPekerjaan: "Jika sedang mencari kerja, pekerjaan apa yang ingin anda inginkan? atau kamu bisa jelaskan keahlian kamu?",
  asalUniversitas: "Asal Universitas",
  tahunMasukUniversitas: "Tahun Masuk Universitas",
  pendidikan: "Pendidikan",
  fakultasJurusanKuliah: "Fakultas/Jurusan",
  kuliahSambilBekerja: "Apakah kamu kuliah sambil bekerja/usaha/MT",
  tempatBekerja: "Tempat Bekerja/Usaha/MT",
  posisiBekerja: "Sebagai apa anda Bekerja/Usaha/MT",
  kesiapanMenikah: "Dari 1 - 10, seberapa siapkah kamu untuk menikah",
};

export async function checkAdditionalInfoByName(name: string) {
  try {
    const rawData = await getSheetData(ADDITIONAL_INFO_SHEET_NAME);
    const trimmedName = name.trim().toLowerCase();
    
    // Find unlinked row where Nama Lengkap matches exactly
    const matchedIndex = rawData.findIndex((row) => {
      const rowName = String(row["Nama Lengkap"] || "").trim().toLowerCase();
      const rowUserId = String(row["UserId"] || "").trim();
      return rowName === trimmedName && !rowUserId;
    });

    if (matchedIndex >= 0) {
      const matchedRow = rawData[matchedIndex];
      return { 
        success: true, 
        found: true, 
        data: matchedRow, 
        rowIndex: matchedIndex // index in data array (0-based)
      };
    }

    return { success: true, found: false };
  } catch (error) {
    console.error("Failed to check additional info by name:", error);
    return { success: false, found: false, message: "Gagal memeriksa pencocokan nama" };
  }
}

export async function addData(prevState: ActionState, formData: FormData) {
  try {
    const rawData: SheetRow = {};
    const additionalInfoData: SheetRow = {};

    // Generate strict new guid relationship
    const idGenerus = crypto.randomUUID();

    // Map fields
    for (const [key, value] of formData.entries()) {
      if (key.startsWith("$") || key === "linkAdditionalInfoRowIndex") continue;

      const mappedKey = UI_TO_ADDITIONAL_INFO_MAP[key];
      if (mappedKey) {
        additionalInfoData[mappedKey] = value.toString();
      } else {
        rawData[key] = value.toString();
      }
    }

    // Capitalize NAMA LENGKAP
    if (rawData["NAMA LENGKAP"]) {
      rawData["NAMA LENGKAP"] = capitalizeWords(rawData["NAMA LENGKAP"].toString());
    }

    // Check for duplicate data (Name, Desa, Kelompok)
    const newName = String(rawData["NAMA LENGKAP"] || "").trim().toLowerCase();
    const newDesa = String(rawData["DESA"] || "").trim().toLowerCase();
    const newKelompok = String(rawData["KELOMPOK"] || "").trim().toLowerCase();

    if (newName && newDesa && newKelompok) {
      const existingData = await getSheetData();
      const isDuplicate = existingData.some((row) => {
        const rowName = String(row["NAMA LENGKAP"] || "").trim().toLowerCase();
        const rowDesa = String(row["DESA"] || "").trim().toLowerCase();
        const rowKelompok = String(row["KELOMPOK"] || "").trim().toLowerCase();
        return rowName === newName && rowDesa === newDesa && rowKelompok === newKelompok;
      });

      if (isDuplicate) {
        return {
          success: false,
          message: `Data Generus dengan nama "${rawData["NAMA LENGKAP"]}" di Desa "${rawData["DESA"]}" Kelompok "${rawData["KELOMPOK"]}" sudah terdaftar.`,
        };
      }
    }

    // Format DOB dd/MM/yyyy
    let dobVal = String(rawData["TANGGAL LAHIR"] || "").trim();
    if (dobVal && dobVal.includes("-")) {
      const parts = dobVal.split("-");
      if (parts.length === 3) {
        dobVal = `${parts[2]}/${parts[1]}/${parts[0]}`;
        rawData["TANGGAL LAHIR"] = dobVal;
      }
    }

    // Generate WIB Timestamp
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
    rawData["ID GENERUS"] = idGenerus;

    // Save main data
    await appendSheetData(rawData);

    // Save/link AdditionalInfo
    additionalInfoData["UserId"] = idGenerus;
    additionalInfoData["Nama Lengkap"] = rawData["NAMA LENGKAP"] || "";
    additionalInfoData["Jenis Kelamin"] = rawData["JENIS KELAMIN"] || "";
    additionalInfoData["Kelompok"] = rawData["KELOMPOK"] || "";
    additionalInfoData["Tanggal Lahir"] = dobVal;
    additionalInfoData["Nomor Whatsapp"] = rawData["NOMOR HP"] || "";
    additionalInfoData["Timestamp"] = timestamp;

    if (dobVal) {
      additionalInfoData["Usia"] = calculateAge(dobVal);
    } else {
      additionalInfoData["Usia"] = "";
    }

    // Check if the user opted to link an existing unlinked AdditionalInfo record by name
    const linkIndexStr = formData.get("linkAdditionalInfoRowIndex") as string;
    if (linkIndexStr) {
      const linkIndex = Number(linkIndexStr);
      // Overwrite the existing row (linkIndex + 2) in AdditionalInfo
      await updateSheetData(linkIndex + 2, additionalInfoData, ADDITIONAL_INFO_SHEET_NAME);
    } else {
      // Append a brand new row in AdditionalInfo
      await appendSheetData(additionalInfoData, ADDITIONAL_INFO_SHEET_NAME);
    }

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
    const additionalInfoData: SheetRow = {};

    // Get existing data to fetch/maintain ID GENERUS
    const existingRow = await getRowData(rowIndex);
    let idGenerus = String(existingRow["ID GENERUS"] || "").trim();
    if (!idGenerus) {
      idGenerus = crypto.randomUUID();
    }

    // Map fields
    for (const [key, value] of formData.entries()) {
      if (key.startsWith("$") || key === "linkAdditionalInfoRowIndex") continue;

      const mappedKey = UI_TO_ADDITIONAL_INFO_MAP[key];
      if (mappedKey) {
        additionalInfoData[mappedKey] = value.toString();
      } else {
        rawData[key] = value.toString();
      }
    }

    // Capitalize NAMA LENGKAP
    if (rawData["NAMA LENGKAP"]) {
      rawData["NAMA LENGKAP"] = capitalizeWords(rawData["NAMA LENGKAP"].toString());
    }

    // Check for duplicate data (Name, Desa, Kelompok)
    const newName = String(rawData["NAMA LENGKAP"] || "").trim().toLowerCase();
    const newDesa = String(rawData["DESA"] || "").trim().toLowerCase();
    const newKelompok = String(rawData["KELOMPOK"] || "").trim().toLowerCase();

    if (newName && newDesa && newKelompok) {
      const existingData = await getSheetData();
      const isDuplicate = existingData.some((row, idx) => {
        const currentRowIndex = idx + 2; // 1-based sheet row index
        if (currentRowIndex === rowIndex) return false;

        const rowName = String(row["NAMA LENGKAP"] || "").trim().toLowerCase();
        const rowDesa = String(row["DESA"] || "").trim().toLowerCase();
        const rowKelompok = String(row["KELOMPOK"] || "").trim().toLowerCase();
        return rowName === newName && rowDesa === newDesa && rowKelompok === newKelompok;
      });

      if (isDuplicate) {
        return {
          success: false,
          message: `Data Generus dengan nama "${rawData["NAMA LENGKAP"]}" di Desa "${rawData["DESA"]}" Kelompok "${rawData["KELOMPOK"]}" sudah terdaftar.`,
        };
      }
    }

    // Format DOB dd/MM/yyyy
    let dobVal = String(rawData["TANGGAL LAHIR"] || "").trim();
    if (dobVal && dobVal.includes("-")) {
      const parts = dobVal.split("-");
      if (parts.length === 3) {
        dobVal = `${parts[2]}/${parts[1]}/${parts[0]}`;
        rawData["TANGGAL LAHIR"] = dobVal;
      }
    }

    // Generate WIB Timestamp
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
    rawData["ID GENERUS"] = idGenerus;

    // Update main row
    await updateSheetData(rowIndex, rawData);

    // Sync AdditionalInfo row
    additionalInfoData["UserId"] = idGenerus;
    additionalInfoData["Nama Lengkap"] = rawData["NAMA LENGKAP"] || "";
    additionalInfoData["Jenis Kelamin"] = rawData["JENIS KELAMIN"] || "";
    additionalInfoData["Kelompok"] = rawData["KELOMPOK"] || "";
    additionalInfoData["Tanggal Lahir"] = dobVal;
    additionalInfoData["Nomor Whatsapp"] = rawData["NOMOR HP"] || "";
    additionalInfoData["Timestamp"] = timestamp;

    if (dobVal) {
      additionalInfoData["Usia"] = calculateAge(dobVal);
    } else {
      additionalInfoData["Usia"] = "";
    }

    // Check if there is an existing linked AdditionalInfo row
    const additionalInfoRaw = await getSheetData(ADDITIONAL_INFO_SHEET_NAME);
    const aiIndex = additionalInfoRaw.findIndex(
      (row) => String(row["UserId"] || "").trim().toLowerCase() === idGenerus.toLowerCase()
    );

    const linkIndexStr = formData.get("linkAdditionalInfoRowIndex") as string;

    if (aiIndex >= 0) {
      // Overwrite existing linked row
      await updateSheetData(aiIndex + 2, additionalInfoData, ADDITIONAL_INFO_SHEET_NAME);
    } else if (linkIndexStr) {
      // Overwrite name-matched unlinked row
      const linkIndex = Number(linkIndexStr);
      await updateSheetData(linkIndex + 2, additionalInfoData, ADDITIONAL_INFO_SHEET_NAME);
    } else {
      // Append a brand new AdditionalInfo record
      await appendSheetData(additionalInfoData, ADDITIONAL_INFO_SHEET_NAME);
    }

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
    const result = await fetchAndProcessData({ includeAdditionalInfo: true });
    return { success: true, data: result.data };
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

export async function getAdditionalInfoData() {
  try {
    const rawData = await getSheetData(ADDITIONAL_INFO_SHEET_NAME);
    const data = rawData.map((row, index) => ({
      ...row,
      _index: index,
    }));
    return { success: true, data };
  } catch {
    return {
      success: false,
      data: [],
      message: "Failed to fetch AdditionalInfo data",
    };
  }
}

export async function getUnlinkedGenerus() {
  try {
    const rawData = await getSheetData();
    const data = rawData
      .map((row, index) => ({
        ...row,
        _index: index,
      }))
      .filter((row) => !String((row as SheetRow)["ID GENERUS"] || "").trim());
    return { success: true, data };
  } catch {
    return {
      success: false,
      data: [],
      message: "Failed to fetch generus data",
    };
  }
}

export async function linkGenerusAction(
  additionalInfoRowIndex: number,
  generusRowIndex: number,
) {
  try {
    const guid = crypto.randomUUID();

    // Update UserId in AdditionalInfo (rowIndex is 0-based data index, sheet row = index + 2)
    await updateSheetCell(
      additionalInfoRowIndex + 2,
      "UserId",
      guid,
      ADDITIONAL_INFO_SHEET_NAME,
    );

    // Update ID GENERUS in Form Responses 1 (same logic)
    await updateSheetCell(generusRowIndex + 2, "ID GENERUS", guid);

    revalidateTag("google-sheets", "default");
    revalidatePath("/admin-restricted/link-generus");

    return { success: true, message: "Generus berhasil di-link!", guid };
  } catch (error) {
    console.error("Failed to link generus:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Gagal melinking generus",
    };
  }
}
