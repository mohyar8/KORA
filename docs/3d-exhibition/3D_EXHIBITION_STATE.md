# KORA 3D Exhibition — State

_Resume here. Read the spec, then the roadmap, then this file. Keep this file short; update after every milestone._

**Last updated:** 2026-10-12 · **Branch:** `newV` · **Committed:** M1 (`f7aabfa`), M2 (`264fa21`); M3 changes uncommitted

## Milestones
| ID | Name | Status |
|---|---|---|
| M0 | Discovery & planning | ✅ Done |
| M1 | Foundation + museum quality prototype (GATE 1) | ✅ Approved |
| M2 | Spatial layout + interaction system | ✅ Approved |
| M3 | Stage + booth kit + first corner (GATE 2) | ✅ Implemented — **stopped for visual review / GATE 2 decisions** |
| M4 | Remaining areas + world completion | ⏸ Waiting for GATE 2 (D-20, D-22; also D-17 for corners 6–7) |
| M5 | Homepage integration & fallback | Not started |
| M6 | Perf / a11y / device QA → release | Not started |

**Next:** owner reviews `/lab/exhibition` (stage, Media corner = slot 2, overview spacing) and answers the GATE 2 questions in roadmap §6 (M3). Then M4.

## M3 — what exists
- **Layout tweak:**
  - Slots 3–5 moved south to z 34.15–34.4.
  - South palms moved to z 37.4 and south lanterns to z 38.7.
  - Slots 2 and 7 now have clear fronts.
  - Side-corner cameras face them almost head-on (skew 0.12–0.2).
- **Model slots:**
  - Every area has a local `frame`.
  - `AreaModels` renders the kit model or an optional `modelUrl` GLB, loaded lazily with a kit fallback on error.
  - Modelled so far: museum, stage, corner-2 (Media). Placeholders now ghost only the unmodelled areas.
- **Stage & amphitheatre:** follows the "Stage & Theater" renders within the 12 × 5 m plan footprint (details in the roadmap, M3). It shows the official lockup only, with no tagline and no background building.
- **Media corner:** follows its render, adapted to the 3 × 3 m slot (F-3). No third-party marks or garbled text, and screens use our own pitch graphics.
- **Booth kit + primitives:** reusable for M4.
- **Static batching:** a `Batched` wrapper around kit models and the buildings merges same-material opaque meshes. It changes nothing visually.
- **Museum anchor:** steeper again (`atan2(-16,-8)`, 19.5 m) so the stage's east tower stays out of frame. The strip palm at z ≈ 5.7 is omitted (F-10).

## Verified results (2026-10-12)
| Check | Result |
|---|---|
| `npx tsc --noEmit` | ✅ clean |
| `npx eslint` (repo) | ✅ no new problems (only pre-existing `Departments.tsx:19`) |
| `npm run build` | ✅ |
| Homepage initial JS | 824 KB raw / 265 KB gz — unchanged; no 3D code in homepage chunks |
| Exhibition JS | ≈ 192 + 99 KB gz loaded with the section (≈ 291 KB, budget ≤ 300); GLTFLoader 12 KB gz only when a GLB is used; GLTFExporter/dev hook absent from production |
| Flight clearance | ✅ 0 collisions, all pairs, aspects 2.4 / 16:9 / 0.8 / 0.46 (obstacles updated for towers 7.7 m and tiers 1.9 m) |
| GLB swap | ✅ Media kit → GLB (610 KB, exported in-browser) renders identically; bad URL → kit fallback; clear → kit |
| Draw calls (desktop tier) | overview ≈151, stage anchor ≈105, Media anchor ≈77, museum anchor ≈98; ≈313 k tris overview |
| Draw calls (mobile tier) | overview ≈151 (over the proposed ≤ 100), anchored ≈77; ≈200 k tris |
| Visual checks | stage, Media corner (incl. look-around), museum (unchanged design), overview, mobile card |
| Hero / page.tsx / layout.tsx / globals.css / public | ✅ unchanged |

**Bug found and fixed:** the stage-beam alpha used `pow()` of a slightly negative number, producing NaN pixels that bloom spread into a black frame. It's clamped now; if the frame ever goes black again, check for NaN in emissive or vertex-colour maths first.

**Not yet verified:** real-time flights (the browser pane was hidden, so rAF was paused), real devices, and screen readers. These are M6.

## Open questions (GATE 2 — roadmap §6, M3)
- **D-20 booth scale:** renders read about 8–12 m wide against 3–4 m plan slots. Recommended: confirm real dimensions and keep plan sizes meanwhile.
- **D-22 production split:** code kit for shells and scenery; designer or CC0 for complex props (stadium miniature, arcade games).
- **D-21:** seating follows the design render (stone tiers + lounge row) rather than the masterplan's loose chairs. Confirm.
- Still open: **D-17** (identity of corners 6–7), **D-19** (entertainment zone location), **R-4** (which Economy variant).

## Decisions taken (not inferable from code)
- 2026-10-12 (M3 instructions): all previously recommended decisions approved:
  - D-7: no people.
  - D-11: Media corner first.
  - D-14: neutral replacements for third-party marks.
  - D-17: provisional slot mapping.
  - D-18: control booth omitted.
  - D-19: entertainment zone stays provisional.
  - R-8: stage built without the render's building.
- South row set back by owner request.
- Kit models are authored in the area frame: +Z = open front / audience side. Corner frame rotation: north π, east π/2, west −π/2.
- Signage text that is garbled in the renders is not reproduced (F-13). The stage tagline is not used (F-14).
- Canvas `shadows="percentage"` (PCF): `soft` was removed in three r186.
- Dev hook additions: `swapModel(id, url?)`, `clearModels()`.

## Assumptions log
- Plan px → m: `x = (px − 80)/16.4`, `z = (py − 185)/14`; positions from the drawing, sizes from the dimension strings.
- Heights inferred:
  - stage deck 1.0 m
  - LED wall 4.3 m, starting 1.2 m above ground
  - truss roof 7.3 m, towers at ±7.8 m
  - amphitheatre tier rise 0.42 m
  - Media booth walls 2.5 m, canopy 3.0 m, title top ≈ 3.7 m
- Amphitheatre: 5 bands of 1.9 m on the seating sectors (lounge + 4 tiers).
- Museum: 28 × 10 × 5.6 m (inferred).
- Buildings 70/57: 15 m and 17 m tall.

## Hero protection check
- Files outside the exhibition touched in M3: none (besides docs). Hero, homepage, layout, global CSS and public assets are unchanged.
