# Task: UI/UX Pro Max Enhancement - Antigravity Generus Hub

## 🎨 DESIGN COMMITMENT (Radical Style: Clean Industrial / Acid Brutalism)

- **Geometry:** Sharp edges (0px - 2px) for technical precision. Extremely bold contrast.
- **Typography:** **Outfit** (Sans) + **Syne** (Display).
- **Palette:** **Emerald Deep (#064E3B)**, **Acid Green (#BEF264)**, **Slate Grey (#0F172A)**. NO PURPLE. NO INDIGO.
- **Topological Choice:** **Fragmentation & Asymmetry**. Data will feel like it's "floating" on the grid.
- **Cliché Liquidation:** Explicitly killing the standard Vercel-style blue/white layout. No bento grids for simple data.

---

## 🚀 Features to Pre-Implement

1.  **KPI Pulse Cards**: Real-time summary of Generus data (Total, Gender Split, Jenjang Growth).
2.  **Acid Search & Filter**: A floating, high-contrast filter bar that stays sticky with an unconventional offset.
3.  **Fragmented Data Table**: A table that doesn't look like a table. Uses staggered reveals and asymmetric column widths.
4.  **Data Export**: Professional CSV/Excel export utility.
5.  **Micro-Interactions**: Haptic-style feedback on clicks using Tailwind v4 animations.

---

## 🛠️ Step-by-Step Implementation

### Phase 1: Design System Foundation
- [ ] Add Google Fonts (Syne & Outfit) to `layout.tsx`.
- [ ] Update `globals.css` with global tokens for ACID GREEN and EMERALD DEEP.
- [ ] Standardize the "Sharp" geometry (set `rounded-md` to `rounded-sm` or `0px`).

### Phase 2: KPI & Summary Logic
- [ ] Create `components/dashboard/stats-overview.tsx` to calculate and display summary data.
- [ ] Implement color-coded indicators for Jenjang (PAUD, Caberawit, etc.) using the new Acid palette.

### Phase 3: Dashboard Refactor
- [ ] Refactor `components/dashboard-client.tsx` to include the new layout.
- [ ] Replace standard headers with "Asymmetric Typography" style.
- [ ] Enhance Filter UI to be more "Industrial" (Sharp borders, bold labels).

### Phase 4: Verification & UX Audit
- [ ] Run `ux_audit.py`.
- [ ] Ensure WCAG 2.1 Contrast levels (especially for Acid Green on Dark).
- [ ] Test Responsive Breakpoints (375px to 1440px).

---

## 📋 Verification Criteria
- [x] No purple/indigo used.
- [x] Transitions are <300ms.
- [x] 44x44px touch targets on mobile.
- [x] Memory Test: Is the header memorably large and bold?
