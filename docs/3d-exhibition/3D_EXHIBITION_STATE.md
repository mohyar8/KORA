# KORA 3D Exhibition — State

_Resume here. Read the spec, then the roadmap, then this file. Keep this file short; update after every milestone._

**Last updated:** 2026-10-12 · **Branch:** `newV` · **Committed:** no (all exhibition work is uncommitted)

## Milestones
| ID | Name | Status |
|---|---|---|
| M0 | Discovery & planning | ✅ Done |
| M1 | Foundation + museum quality prototype (GATE 1) | ✅ Implemented — **stopped for visual-quality review** |
| M2 | Spatial layout + interaction system | ⏸ Blocked on GATE 1 approval + R-3 / D-15 |
| M3 | Stage + booth kit + first corner (GATE 2) | Not started |
| M4 | Remaining areas + world completion | Not started |
| M5 | Homepage integration & fallback | Not started |
| M6 | Perf / a11y / device QA → release | Not started |

**Next:** owner reviews `/lab/exhibition` (run `npm run dev`, open `http://localhost:3000/lab/exhibition`). After approval → M2.

## M1 — what exists
- Isolated route `/lab/exhibition` (noindex), filler above/below to emulate the homepage flow. Homepage untouched.
- Museum exterior (west facade traced from the render, portal with KORA sign from official PNGs, bilingual wayfinding, exit, coloured polygon linework, warm base strip, lobby behind glass, forecourt light spill), plaza paving, Buildings 70/57, palms/planters, disc lamps, bollards, benches, tree belts, dusk sky + procedural environment lighting, restrained bloom.
- Interaction slice: overview → (3D click on the museum **or** "استكشف المتحف" button) → cinematic flight → constrained look-around (mouse drag / horizontal touch drag / arrow keys) → centred provisional card → "المنظر العام" (or Escape) back. Reduced motion → instant cuts.
- Loader: WebGL2 check, Save-Data opt-in, near-viewport + `deferMs`, error boundary, context-loss → text fallback.

## Verified results (2026-10-12)
| Check | Result |
|---|---|
| `npx tsc --noEmit` | ✅ clean |
| `npx eslint` (repo) | ✅ no new problems; only the pre-existing `Departments.tsx:19` error |
| `npm run build` | ✅ succeeds; `/lab/exhibition` static |
| Homepage initial JS | 824 KB raw / 265 KB gz (baseline 824 / 263; chunk-split noise). **No three/R3F code in any homepage chunk** (grepped). |
| Exhibition lazy chunk | 1,042 KB raw / **275 KB gz** (budget ≤ 300) |
| Desktop tier, 1581×815 px canvas | ≈123 draw calls, ≈244 k triangles, ≈20–26 ms/frame incl. sync readback (this machine) |
| Mobile tier, 375×812 emulated | ≈125 calls, ≈140 k triangles, ≈8 ms/frame |
| `git diff` Hero / page.tsx / layout.tsx / globals.css / public | ✅ empty |
| Views captured | Overview (desktop + mobile), museum anchor (desktop + mobile, with card), max look-around yaw |

**Not yet verified (needs a visible browser / real devices, planned for M2 + M6):** real mouse click on the 3D hit target and live drag feel (logic exercised via the same code path as the button), animated flight timing (the built-in pane was hidden, so `requestAnimationFrame` was paused; frames were rendered synchronously for inspection), iOS/Android touch scrolling, Lighthouse.

## GATE 1 — review points for the owner
1. **Similarity:** anchor view reproduces the render's 3/4 composition, polygon linework and colours, KORA portal, entrance/exit signage, warm base and in-ground strips. Lobby interior is simpler than the render.
2. **Atmosphere:** periwinkle dusk sky, satin (not wet) forecourt, warm lamp pools, restrained bloom.
3. **Provisional:** museum 28 × 10 × 5.6 m (inferred); north face partly from the render, south/east faces authored (D-13); entrance at the north end per the render (conflicts with masterplan arrows, F-7 / D-15).
4. **Known weaknesses:** trees are stylised low-poly clusters; the south plaza is empty until M2 (corners, stage); no people (D-7).
5. **Production cost outlook:** the museum needed no external 3D assets. Booths (M3) will be harder; decide on designer/Blender involvement at GATE 2.

## Open blockers / questions
- **R-3:** which are the 7 corners? Images exist for Technology, Media, Entrepreneurship, Economy & Investment and Health. Engineering has no image, and it's unclear whether "Futuristic Sports, Tech & Economy" is a separate corner.
- **D-15 / F-7:** museum entrance end.
- R-1/R-2: full PDF / museum plan and unseen sides (the folder still holds only the 18 images).

## Decisions taken (not inferable from code)
- 2026-10-12: Selectable = 7 corners + museum + stage + entertainment zone; all else scenery. Close fidelity to preliminary designs. Hero untouched.
- Deps: three 0.186.1, @react-three/fiber 9.8.1, @react-three/postprocessing 3.2.0, postprocessing 6.39.5, @types/three. drei removed (unused). Spline deps left untouched.
- No downloaded assets: all textures, sky and environment are procedural; signage uses `public/assets/brand/kora-lockup-ball.png` + `kora-lockup-en.png`; text uses Alexandria (Ghroob is not web-licensed).
- Buildings 70/57 set back to z = −7 so their podiums do not overlap the plaza edge.
- Dev-only `window.__exh` hook (`select`, `instant`, `look`, `info`, `bench`, `snap`, `state`) exists only when `NODE_ENV=development`. Use it for inspection when the browser pane is hidden.

## Assumptions log
- Reference images → spec names: see roadmap §3.1.
- Site frame: origin = masterplan NW plaza corner; +X east, +Z south; scale averaged (dimension strings disagree).
- Museum: length/depth scaled from the plan, height from the render's door proportions.
- Facade linework: traced from the render, perspective-rectified (`museumFacade.ts`), approximate.
- Buildings 70/57: 15 m / 17 m tall, 4 floors, generic precast grid from the Building 57 photos (no photos of 70).

## Hero protection check
- Files touched outside the exhibition: `package.json`, `package-lock.json` only. Hero, homepage, layout, global CSS and public assets are unchanged.
