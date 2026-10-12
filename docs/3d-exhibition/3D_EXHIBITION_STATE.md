# KORA 3D Exhibition — State

_Resume here. Read the spec, then the roadmap, then this file. Keep this file short; update after every milestone._

**Last updated:** 2026-10-12 · **Branch:** `newV` · **Committed:** M1 (`f7aabfa "M 1"`); M2 changes uncommitted

## Milestones
| ID | Name | Status |
|---|---|---|
| M0 | Discovery & planning | ✅ Done |
| M1 | Foundation + museum quality prototype (GATE 1) | ✅ Approved by owner 2026-10-12 |
| M2 | Spatial layout + interaction system | ✅ Implemented — **stopped for review** |
| M3 | Stage + booth kit + first corner (GATE 2) | ⏸ Waiting for M2 review |
| M4 | Remaining areas + world completion | Not started |
| M5 | Homepage integration & fallback | Not started |
| M6 | Perf / a11y / device QA → release | Not started |

**Next:** owner reviews `/lab/exhibition` (`npm run dev`, open `http://localhost:3000/lab/exhibition`). After approval → M3.

## M2 — what exists
- **Layout from the masterplan** (`layout.ts`, measured/inferred tags): stage 12×5 m, two seating blocks around a 2 m aisle, 7 corner slots, gate, planter strips with palms and lanterns, passage sign "إلى الساحة الترفيهية", entertainment zone (provisional location, north of the passage).
- **10 selectable areas** (`areas.ts`): museum (modelled), stage, entertainment and corners 1–7 (all **translucent placeholders**: pale fill, outline, dashed footprint; one shared legend «الكتل الشفافة تصاميم قيد الإعداد»). Slot ↔ corner mapping is provisional; slots 6–7 are "ركن قيد التأكيد". Cards say "التصميم قيد الإعداد" and, where relevant, "توزيع الأركان على المواقع مبدئي" or "الموقع تقريبي".
- **Three navigation paths:**
  - 3D click on hit volumes (buildings block picks through walls). Neighbours are clickable while anchored.
  - "مناطق المعرض" panel: an RTL right drawer on desktop, a bottom sheet under 768 px. Closed by default; picking a location closes it and flies there.
  - "المنظر العام" button, the panel entry, or Escape.
- **Pins:** DOM buttons that are focusable and named. In the overview, corners show as numbered markers that reveal their names on hover or focus. Pins hide when occluded, under the card, or colliding with another pin.
- **Camera:**
  - Flights choose the lowest arc that clears every obstacle; interrupting mid-flight starts from the current view.
  - Look-around stays clamped per area.
  - Corner cameras for the side slots are angled diagonally so they stand clear of the neighbouring booths.
- **Input & accessibility:**
  - Click vs drag: anything over 6 px of movement is a look-drag, not a click.
  - Touch: embedded mode decides the axis first (vertical = page scroll); fullscreen allows free drag.
  - Keyboard: arrow keys only when the stage itself has focus.
  - Escape order: panel → fullscreen → selection.
- **Optional fullscreen** (mobile only): fixed overlay, page scroll locked, scroll position restored on exit.
- **Skip link:** "تخطَّ المعرض ↓" jumps to `#exhibition-after`.
- **Museum anchor moved:** the M1 standpoint is now behind the stage, so the camera stands in the open strip north-east of it with a similar three-quarter view (portal + linework). The museum's design is unchanged.

## Verified results (2026-10-12)
| Check | Result |
|---|---|
| `npx tsc --noEmit` | ✅ clean |
| `npx eslint` (repo) | ✅ no new problems (only pre-existing `Departments.tsx:19`) |
| `npm run build` | ✅ |
| Homepage initial JS | 824 KB raw / 265 KB gz — unchanged; no three/R3F in homepage chunks |
| Exhibition lazy chunk | 1,060 KB raw / **281 KB gz** (budget ≤ 300); dev hook absent from production chunk |
| Flight clearance (`__exh.checkFlights`) | ✅ 0 collisions for all 110 area pairs at aspects 2.4, 16:9, 0.8, 0.46 |
| 3D click (synthetic pointer events) | ✅ hover chip names the area; click selects; a 40 px drag rotates the view and does **not** select; a still click on a visible neighbour selects it |
| Pins / panel / keyboard | ✅ pin click selects; panel opens with focus on the first item, marks «أنت هنا», closes on choice; Escape order verified |
| Fullscreen | ✅ covers the viewport, `overflow:hidden` on html, `touch-action:none`; exit restores scroll Y exactly |
| Mobile tier (375×812) | overview ≈134 draw calls / 171 k tris; anchored ≈104 calls; ≈9 ms/frame |
| Desktop tier | ≈ M1 + 3 ghost draws; triangles ≈ 280 k |
| Hero / page.tsx / layout.tsx / globals.css / public | ✅ unchanged (`git diff` empty) |
| Views captured | overview (desktop, tablet, mobile), museum, stage, entertainment, corners 1 & 4, panel (tablet + mobile sheet) |

**Not yet verified:** live animated flights and interrupting a flight at real speed. The browser pane was hidden, so `requestAnimationFrame`/GSAP were paused and views were checked with instant poses. Real touch gestures on iOS/Android and a VoiceOver/NVDA pass are also outstanding (M6).

**Known deviations:**
- **Mobile draw calls:** 104–134 against a proposed ≤ 100. Carried to M3/M6: merge static museum/building meshes per material.
- **Hidden pins:** the overview may hide 1–2 colliding corner pins at some sizes. Those areas are still reachable through 3D click and the panel.

## Open questions (need owner input)
- **D-17 / R-3 / R-5:** which corner goes in which slot, and which are corners 6–7 (Engineering? the "Futuristic Sports, Tech & Economy" render?).
- **D-18:** the control booth is omitted because it would stand in front of the M1 portal (F-8).
- **D-19:** where the entertainment zone actually is, and its footprint (F-11).
- R-8 (stage background mismatch) and R-12 (third-party logos) are needed before M3.

## Decisions taken (not inferable from code)
- 2026-10-12:
  - Selectable = 7 corners + museum + stage + entertainment zone; all else is scenery.
  - Close fidelity to the preliminary designs; the Hero stays untouched.
  - The M1 museum orientation is kept for now.
  - No invented corner designs.
- Placeholder language: translucent massing with outline and dashed footprint, merged into 3 draw calls. Booth shells are neutral (back + side walls + header), not a design proposal.
- Corner slots 1–7 numbered west-top, west-bottom, south-left, south-centre, south-right, east-top, east-bottom.
- Masterplan palms at z ≈ 5.7 / 17.5 on the museum-path strip moved to the strip ends (F-10).
- Deps unchanged since M1 (three 0.186.1, R3F 9.8.1, @react-three/postprocessing 3.2.0, postprocessing 6.39.5).
- Dev-only `window.__exh`:
  - `select`, `instant`, `look`, `panel`, `fullscreen`: drive the scene directly.
  - `info`, `bench`: frame statistics and timing.
  - `snap`, `state`: capture a frame; read the R3F state.
  - `checkFlights`: flight clearance check.

  Exists only with `NODE_ENV=development`.
- Browser-pane quirk: at 1.25 device pixel ratio, screenshots capture about 640 CSS px of width. Use the tablet preset (768) or narrower for full-width UI captures.

## Assumptions log
- Plan px → m: `x = (px − 80)/16.4`, `z = (py − 185)/14` on the 1056×1516 masterplan image; positions from the drawing, sizes from dimension strings.
- Heights inferred: stage deck 1.0 m, screen 5.5 m, booths 3 m, gate 2.6 m, seating tiers 0.35–1.1 m.
- Seating modelled as annular sectors (centre z = −4, r 16–25.5 m) to match the plan's row extents.
- Museum: 28 × 10 × 5.6 m (inferred); facade linework traced from the render.
- Buildings 70/57: 15 m / 17 m tall, generic precast grid.

## Hero protection check
- Files outside the exhibition touched since M1: none. Hero, homepage, layout, global CSS and public assets are unchanged.
