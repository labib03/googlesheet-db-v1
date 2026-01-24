# Task Plan: Bulk Soft Delete for Admin Restricted

Implement bulk soft delete functionality in the admin restricted dashboard, allowing administrators to select multiple records and move them to the "Trash" sheet in one action.

## 🛠 Proposed Changes

### 1. `lib/google-sheets.ts`
- Add `appendSheetDataBulk` to efficiently append multiple rows to a sheet (e.g., "Trash").
- Add `deleteSheetRowsBulk` to efficiently delete multiple rows from a sheet.
  - **Strategy**: Sort indices in descending order before deleting to avoid index shifting issues, OR use a single batch update with multiple `deleteDimension` requests properly mapped. actually, Google Sheets `batchUpdate` executes requests sequentially.

### 2. `app/actions.ts`
- Implement `bulkDeleteData(rowIndices: number[])` server action.
  - It will gather data for all requested indices.
  - Append them to "Trash".
  - Delete them from the main sheet.
  - Revalidate paths.

### 3. `components/admin-dashboard-client.tsx`
- Manage `selectedIndices: number[]` state.
- Implement selection logic (toggle, persistent across pages).
- Add UI to trigger bulk delete:
  - **Header-based**: A button in the action bar that appears when items are selected.
  - **Floating FAB**: A floating action bar that appears at the bottom.
- Pass selection state and handlers to `DashboardTable` and `DashboardCards`.

### 4. `components/dashboard/dashboard-table.tsx`
- Add a Checkbox column.
- Implement "Select All" logic (optional, user said one by one for now but might need it later - sticking to one by one as per request).

### 5. `components/dashboard/dashboard-cards.tsx` (Mobile)
- Add a Checkbox to each card for selection.

### 6. `components/bulk-delete-dialog.tsx` (New)
- A specialized confirmation dialog for bulk deletion.
- Efficiently display the names of selected records.

## 📅 Timeline & Steps

### Phase 1: Data Layer & Server Actions
- [ ] Modify `lib/google-sheets.ts` to support bulk operations.
- [ ] Create `bulkDeleteData` in `app/actions.ts`.

### Phase 2: Selection State & UI Components
- [ ] Update `AdminDashboardClient` with selection state.
- [ ] Create `BulkDeleteDialog`.
- [ ] Update `DashboardTable` to support checkboxes and selection.
- [ ] Update `DashboardCards` (mobile) to support checkboxes and selection.

### Phase 3: Integration & UX Polish
- [ ] Implement both "Header" and "Floating" UI triggers for comparison.
- [ ] Ensure persistence across pagination.
- [ ] Final testing of the deletion logic to ensure no rows are missed or incorrectly deleted.

## ⚠️ Risks & Mitigation
- **Google Sheets API Rate Limits**: Bulk operations should use as few API calls as possible (batch updates).
- **Index Shifting**: When deleting multiple rows, if done one by one, indices change. Descending order deletion or batching is critical.
- **Data Integrity**: Ensure data is successfully copied to "Trash" before deleting from the main sheet.
