# Task: Enhance Dashboard UI/UX

## Objective
Enhance the dashboard's filtering and pagination experience by implementing multi-select custom components, informative popovers for disabled states, data summary information, and advanced pagination controls.

## Scope
1.  **Multi-select Component**: Standardize all multi-select fields to use `MultiSelectCustom`.
2.  **Informative Popovers**: Show context information when interaction is blocked due to conflicting states (Duplicate View vs Filtering).
3.  **Data Summary**: Display "Total records" and "Current page range" below the filters.
4.  **Pagination Enhancements**: Add "First Page" and "Last Page" buttons.
5.  **Filter Reset Logic**: Ensure page resets to 1 whenever any filter changes, including name search.

## Implementation Plan

### Phase 1: Filter Enhancements (`dashboard-filters.tsx`)
1.  **Replace Components**: Replace `MultiSelectShadcn` with `MultiSelectCustom` for the "Desa" field.
2.  **Info Popovers**:
    *   Wrap filter fields (Desa, Kelompok, Gender, Jenjang, Nama) in a container that shows a Tooltip/Popover when `showDuplicates` is true.
    *   Wrap "Check Duplicate Data" button in a container that shows a Tooltip/Popover when `status.isFiltered` is true.
    *   *Note: Since standard HTML `disabled` prevents mouse events, I will wrap them in a `Tooltip` component that can handle the trigger.*
3.  **Data Summary UI**:
    *   Add a new component/section below the filter actions.
    *   Display: `Total: {count} data | Menampilkan data {start}-{end} | Halaman {current} dari {total}`.

### Phase 2: Pagination Enhancements (`dashboard-pagination.tsx`)
1.  **Add First/Last Buttons**:
    *   Add "First Page" (`ChevronsLeft`) and "Last Page" (`ChevronsRight`) buttons.
    *   Disable "First" if `currentPage === 1`.
    *   Disable "Last" if `currentPage === totalPages`.

### Phase 3: Logic Updates (`use-dashboard-data.ts`)
1.  **Filter Debounce Reset**:
    *   Add a `useEffect` that listens to `debouncedValue`.
    *   If `debouncedValue` changes and is not empty, call `setCurrentPage(1)`.
2.  **General Filter Reset**:
    *   Add another `useEffect` or consolidate logic to reset `currentPage` whenever `filterDesa`, `filterKelompok`, `filterGender`, or `filterJenjangKelas` changes. *Actually, these are already handled in `dashboard-filters.tsx` inline, but consolidation here is safer.*

## Verification Plan
1.  **UI Check**:
    *   Verify "Desa" uses the custom multi-select.
    *   Verify "First/Last" buttons appear in pagination.
    *   Verify summary info appears and updates correctly.
2.  **Interaction Check**:
    *   Activate "Show Duplicates": verify filters are disabled and show info on hover/click.
    *   Activate a Filter: verify "Show Duplicates" is disabled and shows info on hover/click.
    *   Search by name: wait 1s, verify search works and page resets to 1.
    *   Select any filter: verify page resets to 1.
    *   Test "First" and "Last" buttons.
