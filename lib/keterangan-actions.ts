export type KeteranganAction = "NONE" | "HAPUS_DATA" | "DATA_BARU" | "SUDAH_MENIKAH" | "UNKNOWN";

/**
 * Placeholder function to process the "KETERANGAN" value.
 * In the future, this will determine what specific action to take based on the row's KETERANGAN field.
 *
 * @param keteranganValue - The string value from the "KETERANGAN" column
 * @param rowData - The full parsed row data (if needed for context)
 * @returns The determined KeteranganAction
 */
export function processKeteranganAction(
  keteranganValue: string | undefined | null,
  rowData: any
): KeteranganAction {
  if (!keteranganValue) {
    return "NONE";
  }

  const normalized = keteranganValue.trim().toLowerCase();

  switch (normalized) {
    case "hapus data":
      return "HAPUS_DATA";
    case "data baru":
      return "DATA_BARU";
    case "sudah menikah":
      return "SUDAH_MENIKAH";
    default:
      // Default fallback if we don't recognize the action, or could just be "NONE" if it's general notes.
      return "UNKNOWN";
  }
}
