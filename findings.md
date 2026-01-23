# Findings & Research

## 🔍 Discoveries
- **Google Sheets Type Sensitivity:** Column names in Google Sheets should be handled case-insensitively to prevent breaks if a user renames a header slightly (e.g., "Nama" vs "NAMA").
- **Next.js Scroll Restoration:** Default scroll restoration can conflict with manual state-based scroll. Solution: Disable manual on-mount scroll and use `window.scrollTo` via `useEffect` tracking the global context's `scrollPosition`.
- **Input Type="date" Format:** HTML date inputs *strictly* require `yyyy-MM-dd` format. Raw data from Google Sheets is often `dd/MM/yyyy`. Conversion is required in the front-end for pre-filling.
- **Dialog Height:** On mobile, `h-screen` in a Dialog can push content under the virtual keyboard or notch. Using `max-h-[92vh]` and `flex-col` structure with `h-auto` root ensures better fit and scrollability.

## 💡 Code Snippets / Insights
- **Global View State:** Lifting `filter` and `pagination` into `layout.tsx` level Context prevents state loss when navigating between `Dashboard` at `/` and `Forms` at `/generus/[action]`.
- **Soft Delete Pattern:**
    ```typescript
    const rowToDelete = await getRowData(index);
    await appendSheetData(rowToDelete, "Trash");
    await deleteSheetData(index);
    ```
