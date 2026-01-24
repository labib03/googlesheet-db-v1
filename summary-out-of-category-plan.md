# Summary Update: Out of Category Data Info

## Goal
Add an alert banner/info section in the Summary page to inform users about data that doesn't fit into the "Jenjang Kelas" categories (age < 5 or missing Date of Birth).

## Tasks
- [ ] Task 1: Update `StatsOverview` component calculation → Verify: Check if under-age and missing-dob counts are correctly extracted from `distributionData`.
- [ ] Task 2: Implement the `OutOfCategoryAlert` UI section → Verify: UI should look like a premium info banner above the "Distribusi Jenjang Kelas" section.
- [ ] Task 3: Add dynamic messaging for the banner → Verify: "Data ini belum masuk kategori PAUD" for age < 5 and "Data ini tidak menginput tanggal lahir" for missing DOB.
- [ ] Task 4: Ensure the banner only shows if such data exists → Verify: Banner is hidden when all data is properly categorized.
- [ ] Task 5: Final aesthetic polish and responsiveness check → Verify: Test on mobile and desktop breakpoints.

## Done When
- [ ] The summary page shows a banner above the distribution grid if there is data with age < 5 or missing DOB.
- [ ] The banner correctly displays the counts and appropriate messages for each case.
- [ ] The UI matches the "Option B" premium aesthetic.
