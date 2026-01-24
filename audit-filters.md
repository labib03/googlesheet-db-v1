# Audit Filters Implementation Plan

Implement "Audit" filters for "Di Luar Kategori" and "Tanpa Tanggal Lahir" with a dedicated UI section in the dashboard.

## Success Criteria
- [x] New state `filterOutOfCategory` and `filterNoDob` in DashboardContext.
- [x] Filtering logic in `useDashboardData` supports audit filters while keeping other filters functional.
- [x] UI updated in `DashboardFilters` with 3 distinct action sections:
    1. **Audit Section**: "Di Luar Kategori" & "Tanpa Tanggal Lahir" toggles.
    2. **Duplicate Section**: "Check Duplicate Data" toggle.
    3. **System Section**: "Reset Filters" & "Refresh" buttons.
- [x] "Tanpa Tanggal Lahir" logic includes empty and invalid date formats.
- [x] Filters are additive (e.g., can filter "No DOB" + "Desa A").

## Tech Stack
- React (Context, Hooks)
- Tailwind CSS
- Lucide Icons (Info, AlertCircle, Trash2, etc.)

## File Structure & Tasks

### 1. State & Logic
- [x] **Task 1: Update `context/dashboard-context.tsx`**
    - Add `filterOutOfCategory` (boolean) and `filterNoDob` (boolean) states.
    - Include them in the context provider value.
    - Verify: Type definitions update without errors.
- [x] **Task 2: Update `hooks/use-dashboard-data.ts`**
    - Modify the `filteredData` useMemo logic.
    - Add conditions for `filterOutOfCategory` (Jenjang === '-' || Age < 5).
    - Add conditions for `filterNoDob` (Empty || Invalid date parsing).
    - Ensure `resetFilters` clears these new states.
    - Verify: Filtering works correctly in dev mode.

### 2. UI Implementation
- [x] **Task 3: Update `components/dashboard/dashboard-filters.tsx`**
    - Refactor the button area into 3 distinct sections as requested.
    - Add the new Audit Toggles with count badges.
    - Style sections with clear visual separators or groupings.
    - Verify: UI layout matches the user's request for "separated logic" feel.

### 3. Polish & Integration
- [x] **Task 4: Optional UX Improvement in `components/dashboard/stats-overview.tsx`**
    - Make the info banners "clickable" to activate the corresponding filter.
    - Verify: Clicking banner triggers the filter in the dashboard.

## Phase X: Verification
- [ ] Run `yarn lint` to ensure no regressions.
- [ ] Manual check: Click "No DOB", data should filter correctly.
- [ ] Manual check: Activate "No DOB" then select a "Desa", results should narrow down.
- [ ] Manual check: Click "Reset Filters", everything clears.
