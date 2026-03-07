# Mobile Responsive Link Generus

## Goal

Update `link-generus-client.tsx` to be fully responsive, switching from a table to a card-based list on mobile, and optimizing UI controls for smaller screens.

## Tasks

- [ ] **Task 1: Optimize Layout Header & Controls** → Verify: Title, counts, search, and buttons stack neatly on narrow screens (375px).
- [ ] **Task 2: Implement Mobile Card View** → Verify: A new card-based list appears for `sm` screens and below, while the table is hidden.
- [ ] **Task 3: Responsive Table Visibility** → Verify: The original table is only visible on `sm:block` (desktop) and hidden on mobile.
- [ ] **Task 4: Optimize Confirmation Dialog** → Verify: Comparison side-by-side grid stacks vertically on mobile with proper arrow direction.
- [ ] **Task 5: Refine Picker Dialog** → Verify: "Pilih Generus" list items are touch-friendly and fit on mobile screens.

## Done When

- [ ] No horizontal scroll on mobile (375px+).
- [ ] All "Link Generus" and "Auto Match" actions are accessible on mobile.
- [ ] The desktop table remains efficient and unchanged for large screens.
- [ ] `ux_audit.py` (if available) or manual visual check passes for responsiveness.

## Notes

- Use Tailwind's `hidden sm:block` for table and `block sm:hidden` for cards.
- Ensure `z-index` and `sticky` headers work correctly with the floating navbar.
