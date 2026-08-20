export type KeteranganAction = "NONE" | "HAPUS_DATA" | "DATA_BARU" | "SUDAH_MENIKAH" | "UNKNOWN";

/**
 * Checks whether the KETERANGAN text indicates an inactive / trash action.
 */
export function isKeteranganInactive(keteranganValue: string | undefined | null): boolean {
  if (!keteranganValue) return false;
  const str = String(keteranganValue).trim().toLowerCase();
  return (
    str.includes("tidak") ||
    str.includes("non") ||
    str.includes("pindah") ||
    str.includes("menikah") ||
    str.includes("nikah") ||
    str.includes("hapus") ||
    str.includes("keluar") ||
    str.includes("alumni") ||
    str.includes("off")
  );
}

/**
 * Infers default IsMarried and IsPindahSambung flags from the KETERANGAN string.
 */
export function inferTrashMetadata(keteranganValue: string | undefined | null): {
  isMarried: boolean;
  isPindahSambung: boolean;
} {
  if (!keteranganValue) {
    return { isMarried: false, isPindahSambung: false };
  }
  const str = String(keteranganValue).trim().toLowerCase();
  const isMarried = str.includes("menikah") || str.includes("nikah");
  const isPindahSambung =
    str.includes("pindah") ||
    str.includes("sambung") ||
    (!isMarried &&
      (str.includes("tidak") ||
        str.includes("non") ||
        str.includes("keluar") ||
        str.includes("hapus") ||
        str.includes("off")));

  return { isMarried, isPindahSambung };
}

/**
 * Process the "KETERANGAN" value to determine the appropriate action.
 */
export function processKeteranganAction(
  keteranganValue: string | undefined | null,
  _rowData?: unknown
): KeteranganAction {
  if (!keteranganValue) {
    return "NONE";
  }

  const normalized = keteranganValue.trim().toLowerCase();

  if (normalized.includes("menikah") || normalized.includes("nikah")) {
    return "SUDAH_MENIKAH";
  }

  if (
    normalized.includes("hapus") ||
    normalized.includes("tidak aktif") ||
    normalized.includes("non aktif") ||
    normalized.includes("pindah") ||
    normalized.includes("keluar") ||
    normalized.includes("alumni") ||
    normalized.includes("off")
  ) {
    return "HAPUS_DATA";
  }

  if (normalized.includes("data baru") || normalized.includes("baru")) {
    return "DATA_BARU";
  }

  return "UNKNOWN";
}

