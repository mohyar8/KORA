# KORA 3D Exhibition — Implementation Roadmap

**Status:** v0.4 — M1 and M2 approved; M3 implemented, awaiting GATE 2 review before M4 (2026-10-12)  
**Authoritative spec:** [`3D_EXHIBITION_SPEC.md`](./3D_EXHIBITION_SPEC.md) (v1.0, 2026-10-12). This roadmap never overrides it; where they conflict, the spec wins and the conflict is logged in §9.  
**Progress tracker:** [`3D_EXHIBITION_STATE.md`](./3D_EXHIBITION_STATE.md)  
**Owner of this file:** Claude Code (update on every material plan change; log it in §10).

---

## 1. Scope

### In scope (summary of spec §2)
A non-blocking, full-width 3D exhibition section placed **directly after the existing Hero** on the homepage: elevated overview → select area (3D click, side panel / bottom sheet, or back-to-overview) → cinematic camera move to an authored anchor → constrained look-around → centered, persistent teaser card. Evening architectural lighting, KORA-inspired surroundings, replaceable per-area models, accessible non-3D fallback, responsive desktop/mobile with optional mobile fullscreen.

### Final product-owner decisions (2026-10-12)
- **Selectable areas (10):** the **seven experience corners**, the **museum**, the **main stage** and the **entertainment zone**. Everything else (entrance arch, gate, press wall, coffee kiosk, photo booth, corridor/tunnel, control booth, Buildings 57/70, planters, lighting) is **environmental scenery**: rendered, never selectable, not in the menu.
- **Fidelity:** follow the preliminary architectural designs closely, prioritising visual realism and quality.
- **Hero:** preserved without modification (unchanged requirement).
- **M3 instructions (2026-10-12):** all previously recommended decisions approved (D-7 no people for now, D-11 Media corner first, D-14 neutral replacement for third-party marks, D-17 provisional slot mapping, D-18 control booth omitted, D-19 entertainment zone provisional, R-8 stage placed per masterplan without the render's background building). South row (slots 3–5) and its palms set back so slots 2 and 7 have clear fronts.
- **M2 instructions (2026-10-12):** keep the M1 museum entrance orientation; place areas from the masterplan and references; never invent missing corner designs or treat ambiguous references as confirmed (clearly marked placeholders instead); the full PDF is not required while the available references suffice.

### Explicit exclusions
- Any change to the Hero (`src/components/sections/Hero.tsx`, its `.hero-*` / `.field-*` CSS, its assets, the topbar entrance timing).
- Redesign of other sections, navbar, footer; free-roam/first-person/orbit controls; museum interiors; scroll-jacking, mandatory tours, forced fullscreen; spoilers; backend/CMS/APIs; claims of surveyed dimensions or final designs.
- Removing the unused `@splinetool/react-spline` dependency (noted as cleanup candidate only, §9 D-9).

---

## 2. Repository findings (verified 2026-10-12)

| Area | Finding | Consequence |
|---|---|---|
| Framework | Next.js **16.3.5** (App Router, Turbopack root pinned in `next.config.ts`), React **19.2.8**, TypeScript strict, Tailwind v4 (`@theme` tokens in `src/app/globals.css`). Bundled docs at `node_modules/next/dist/docs/` (must be consulted before writing code per `AGENTS.md`). | R3F must be a React-19-compatible major (v9). `next/dynamic` with `ssr:false` is only allowed inside a Client Component (`lazy-loading.md`), so a small client loader component is required. |
| Homepage | `src/app/page.tsx` (Server Component) renders `Hero → Manifesto → About → Tracks → EventFacts → WhyJoin → FinalCta`. | Single insertion point: one line between `<Hero />` and `<Manifesto />`. |
| Hero | `Hero.tsx` is a client component using `motion/react`; `.hero-field` is `100svh` with a sticky `.hero-stage`; window-level `pointermove` listener for ball parallax; entrance animations delayed ~4 s (crest, ball, topbar via `body:has(.hero-field)`). | Exhibition must not attach global pointer/wheel listeners that alter Hero behavior, must not load heavy JS/assets during the first ~4 s Hero intro, and must not change `.hero-field` height or stacking. |
| Scroll logic | GSAP `ScrollTrigger` used in `AboutArt.tsx` (scrubbed, calls `ScrollTrigger.refresh()` on mount). `html` deliberately has no smooth scrolling. | The exhibition section must reserve its final height from SSR (zero layout shift) so ScrollTrigger start/end positions downstream stay correct; call `ScrollTrigger.refresh()` only if height ever changes. |
| Layout | `<html lang="ar" dir="rtl">`, fixed `.topbar` (70 px, z-index 60), noise overlay `body::before` (z-index 90, pointer-events none), `body { overflow-x: clip }`. | Panel/card z-index must sit below topbar; fullscreen mode must account for topbar; RTL is the default direction. |
| Brand | Colors in `src/lib/constants.ts` / `@theme`: navy `#2D3B70`, fuchsia `#944399`, coral `#F26557`, green `#4EA649`, ink `#0E1435`, paper `#ECEFF5`. Logos in `public/assets/brand/` (`kora-main.svg`, `kora-english.svg`, lockups PNG, ball marks), patterns in `public/assets/patterns/`. Font: **Alexandria** (Ghroob's license excludes web use — see `src/lib/fonts.ts`). | Signage textures use official SVG/PNG files, never redrawn. Any text baked into textures uses Alexandria (Ghroob not permitted). |
| 3D stack | **No** `three` / R3F / drei installed. `@splinetool/react-spline` + `@splinetool/runtime` are installed but **unused** in `src/`. `gsap` and `motion` are installed. | Requires dependency approval (§9 D-1). GSAP can drive camera tweens — no extra animation library needed. |
| Tests / QA | No test runner, no Playwright, no Lighthouse CI. Baseline: `npx tsc --noEmit` **clean**; `npx eslint` **1 pre-existing error** (`react-hooks/set-state-in-effect`, `src/components/sections/Departments.tsx:19`). Baseline homepage initial JS: 824 KB raw / 263 KB gz (8 scripts). | Per-milestone checks: `tsc`, `eslint` (no *new* errors), `next build`, manual browser verification (built-in browser pane + real devices), Chrome DevTools performance/Lighthouse runs recorded by hand. |
| SEO routes | `src/app/robots.ts` allows `/`; `src/app/sitemap.ts` lists `/` and `/teams` explicitly. | A lab route is not auto-added to the sitemap; it will still get `robots: noindex` metadata and is removed or gated before release. |
| Deploy | Vercel (`vercel.json` framework: nextjs), `@vercel/analytics`. | Static assets under `public/` are CDN-served; keep individual GLB/KTX2 files cacheable and moderate in size. |
| Git | Branch `newV`; `docs/` and `.serena/` untracked. | Planning docs are not committed until the owner asks. |

---

## 3. Reference inventory and gaps

### 3.1 What actually exists — `docs/3d-exhibition/references/` (18 WhatsApp JPEGs, 42–301 KB each)
The spec names `layout_koora.pdf` and `IMG_5690–5695.jpeg`; **none of those files exist in the repo**. The supplied images map as follows (proposed descriptive names in brackets — rename pending approval, D-8):

| File (`WhatsApp Image 2026-10-12 at …`) | Content | Likely spec source |
|---|---|---|
| `12.05.47 PM` | Museum exterior design (page header "تصميم المتحف من الخارج") [`museum-exterior.jpeg`] | `IMG_5695` / PDF |
| `12.05.50 PM` | **Event masterplan** — dimensioned plan + aerial render [`masterplan.jpeg`] | PDF p.4 |
| `12.05.49 PM (6)` | Stage & theater — two renders [`stage-theater.jpeg`] | PDF p.8–10 |
| `12.05.49 PM (5)` | Entertainment corner (ركن الترفيه) — arcade/games zone layout render [`entertainment-zone.jpeg`] | PDF p.6 (likely) |
| `12.05.48 PM` | Technology corner booth [`booth-technology.jpeg`] | PDF chapter |
| `12.05.48 PM (1)` | Media corner booth (من الملعب إلى العالم) [`booth-media.jpeg`] | PDF chapter |
| `12.05.48 PM (2)` | Entrepreneurship corner booth (من الفكرة إلى الملعب) [`booth-entrepreneurship.jpeg`] | PDF chapter |
| `12.05.48 PM (3)` | Economy & Investment booth [`booth-economy-a.jpeg`] | PDF chapter |
| `12.05.49 PM (1)` | "Futuristic Sports, Tech & Economy" booth — variant of the above, contains literal placeholder text "[INSERT CORNER PLAN / SKETCH / 3D VIEW]" [`booth-economy-b-draft.jpeg`] | PDF chapter (draft) |
| `12.05.49 PM` | Health corner booth (Bupa-branded) [`booth-health.jpeg`] | PDF chapter |
| `12.05.49 PM (2)` | Press/interview wall + Coffee Partner kiosk + walkway with stanchions [`press-wall-coffee.jpeg`] | PDF |
| `12.05.49 PM (3)` | Entrance arch "كورة — الصناعة خلف اللعبة" [`entrance-arch.jpeg`] | PDF |
| `12.05.49 PM (4)` | Banner corridor "Entertainment + Food", photo booth, octagonal light-tunnel corridor [`corridor-photobooth.jpeg`] | PDF |
| `12.05.50 PM (1)`, `(2)`, `(4)`, `12.05.51 PM` | Site photos: paved plaza (red/beige/gray diamond-pattern pavers), benches, light poles, tree line, Building 57 concrete grid facade, rails [`site-01…04.jpeg`] | `IMG_5690–5693` |
| `12.05.50 PM (3)` | Google Maps satellite screenshot of the plaza beside Building 57 (Preparatory Year) [`site-satellite.jpeg`] | `IMG_5694` |

> **2026-10-12:** the owner stated the references are now available; `references/` still contains exactly these 18 images (no PDF, no new files). M1 proceeded with them; R-1/R-2 remain open.

### 3.2 Missing or insufficient references (request before the relevant milestone)
| ID | Missing item | Needed by | Impact if absent |
|---|---|---|---|
| R-1 | `layout_koora.pdf` (full 96 pages), especially **p.14 museum plan** (footprint/dimensions) and any page giving the area list | M1 (museum footprint), M2 (area list) | Museum footprint, length/height and the side/rear must be inferred and marked provisional. |
| R-2 | Museum side, rear and roof views; height; exit-side detail | M1 | Unseen faces authored as restrained continuation of the front language, labeled provisional (spec §4.2 item 4). |
| R-3 | **Identity of the seven corners.** Images exist for five: Technology, Media, Entrepreneurship, Economy & Investment, Health. Candidates for the other two: Engineering (spec chapter, no image) and the "Futuristic Sports, Tech & Economy" render (separate corner, or a draft of Economy?). Need the list of 7 plus designs for any without an image. | M2 (list), M4 (models) | Unknown corners are placed as labelled provisional volumes and cannot be modelled faithfully. |
| R-4 | Confirmation of which Economy booth is current (`economy-a` vs the "Futuristic… " draft with placeholder text) | M4 | Risk of presenting a superseded draft. |
| R-5 | Mapping of the masterplan's corner slots (≈8 rectangles in "الأركان / Corners") to specific corners | M2 | Corner placement is a guess. |
| R-6 | Location and footprint of the Entertainment zone, Food area, press wall, coffee kiosk, photo booth, entrance arch (the masterplan only shows "To Entertainment Area" arrow north between Buildings 70 and 57) | M2 | These are placed "beyond the plaza" provisionally or shown as off-site teasers. |
| R-7 | Building 70 photos (only 57 is photographed) and its approximate height | M2/M4 | Building 70 authored generically from the 57 language. |
| R-8 | Stage render background (colonnade + palms) does not match the masterplan site (Buildings 57/70) | M3 | We place the stage per masterplan and do **not** reproduce the colonnade building. Needs confirmation. |
| R-9 | Orientation conflict: masterplan puts Buildings 70 and 57 along the **top (north?)** edge; satellite shows Building 57 along the **west** edge of the plaza, a curved road east. No north arrow on the masterplan. | M2 | Either honor the masterplan's schematic or rotate to satellite truth — decision D-5. |
| R-10 | Teaser copy (Arabic, optionally English) per area | M2 (provisional), M5 (final) | Provisional text clearly marked `[مؤقت]`. |
| R-11 | Evening HDRI / PBR textures (paving, concrete, metal, fabric) — none in repo | M1 | Proposal: CC0 sources (Poly Haven / ambientCG), downloaded only with approval (D-3). |
| R-12 | Rights to show third-party marks in renders (Bupa, adidas, EA FC/"FC 27", broadcaster logos) | M3/M4 | Default: replace with neutral sponsor placeholders. |
| R-13 | Any native 3D sources (SketchUp/Blender/FBX) behind the renders | M1/M3 | Without them all geometry is re-authored from 2D images. |

### 3.3 Dimensions available (from masterplan, preliminary, not surveyed)
Stage 12.0 m × 5.0 m; aisle between seating wedges 2.0 m; entrance-to-museum path 30.0 m; corner booths 4.0 m wide × 2.5 m deep with 1.5 m gap; 6.0 m path segment along the museum south end; 5.4 m / 2.4 m / 3.4 m / 1.7 m offsets near the control booth and museum. **No museum dimensions, no heights anywhere.** Booth renders visually read as ~6–8 m wide, inconsistent with the 4.0 m slot (flag F-3).

### 3.4 Reference observations / inconsistencies to flag
- **F-1** All renders are preliminary AI-style concepts; several booths sit in an *indoor* exhibition hall (tech, economy, futuristic) while the event is outdoors; the entertainment render has an invented city skyline. We use them for **booth design**, not for their backgrounds.
- **F-2** Visual languages differ: Media + Entrepreneurship share an octagonal truss frame (consistent family); Tech + Economy share a rectangular navy shell with KORA lockups and red mark; Health is a distinct cyan-neon style (spec warns against exaggerated neon → will be restrained, flag for approval).
- **F-3** Booth footprint mismatch (4.0 × 2.5 m slot vs. larger-looking renders).
- **F-4** Masterplan aerial render shows the museum **with interior exhibits visible through the roof** (cutaway). We model the closed exterior only.
- **F-5** Museum render's floor is mirror-reflective; spec forbids wet-looking ground → matte-to-satin pavers.
- **F-6** "KORA" wordmark in booth renders (with red corner mark) differs from the repo's official lockups; we use repo files.
- **F-8** The plan's **control booth** (≈ x 41–43, z 10–13 m) stands directly in front of the museum portal as composed in M1 (a knock-on of F-7). Its design is unknown and it is scenery, so it is **omitted** for now; revisit if the museum orientation changes.
- **F-9** **Seven corner slots** are drawn in the "Corners / Experience Zones" block (2 squares west, 3 rectangles south, 2 squares east). Only the bottom-centre slot is dimensioned (4.0 × 2.5 m, 1.5 m gap); others are scaled from the drawing. **Which corner occupies which slot is not stated.**
- **F-10** The masterplan's palms at ≈ z 5.7 and 17.5 m on the museum-path planter strip stood in the museum viewpoint's sightline; they are placed at the strip ends (z 3.5 and 22 m) instead.
- **F-11** The **entertainment zone** is only an arrow on the plan ("To Entertainment Area", through the passage between Buildings 70 and 57). It is placed provisionally just north of the passage (x 11–43, z −54…−32 m), with that caveat shown in its card.
- **F-12** Seating: the masterplan aerial shows rows of loose chairs; the dedicated "Stage & Theater" render shows stepped stone tiers with navy cushions plus a front lounge row of armchairs. M3 follows the **design render** inside the **plan footprint** (lounge row = first band, four stone tiers behind).
- **F-13** Media render content: some lettering is garbled AI text ("KOXA X", "TANK", the 01 caption) and some marks are third-party (VISA, partners). These are omitted; plate 01 shows its number only, and "هل تعرف هذا الصوتي؟" is corrected to «هل تعرف هذا الصوت؟». Screens show our own pitch graphics, not footage.
- **F-14** Stage-screen tagline in the render («الرياضة السعودية.. إنجاز وحكاية») is not approved copy, so the screens carry the official lockup only.
- **F-7** Museum circulation conflict: the masterplan routes visitors **into the museum's south end** and out on the west side near the north end, while the exterior render shows **entrance and exit on the same long facade, entrance at the left (north) end**. M1 follows the exterior render (the architectural design); the masterplan arrows are treated as schematic. Needs owner confirmation before M2 (D-15).

---

## 4. Technical approach

### 4.1 Stack recommendation (requires approval D-1)
| Need | Choice | Rationale |
|---|---|---|
| Renderer | `three` (r17x, latest stable at install time) | Industry standard, glTF/KTX2/Draco/meshopt support, best Next/React ecosystem. |
| React binding | `@react-three/fiber` **v9** | Only R3F major supporting React 19; declarative scene composition keeps data/scene/UI separated. |
| Helpers | ~~`@react-three/drei`~~ **installed then removed in M1** (unused): the environment map, instancing and texture work were simpler as small local code. Re-add only if M3/M4 GLB loading (`useGLTF`/KTX2) justifies it. | Smaller chunk, fewer transitive deps. |
| Camera animation | **Existing `gsap`** tweening a custom camera rig (position + target + yaw/pitch offsets) | No new animation dependency; GSAP handles interruption (`overwrite`, `kill`). No `camera-controls`/OrbitControls (spec forbids orbit). |
| Post-processing | **`postprocessing` + `@react-three/postprocessing` (installed in M1)**: restrained mip-map bloom (threshold 1.0, so only HDR emissives glow), light vignette, AgX tone mapping. Without bloom the facade lines read flat. | The composer forces renderer tone mapping off; tone mapping is the last effect. |
| Types | `@types/three` (dev) | — |
| Asset pipeline (dev-time only, not a runtime dep) | `npx @gltf-transform/cli` for Draco/meshopt + KTX2 compression; Blender for authored models | Approval D-4. Decoder WASM files hosted under `public/exhibition/decoders/`. |
| Spline | **Not used** | Spline scenes are a closed runtime (~large), poor fit for glTF replaceability/perf control. |

Fallback if dependencies are declined: vanilla `three` only (imperative scene in one client component) — feasible but loses declarative separation.

### 4.2 Architecture (as built in M1; new files unless noted)
```
src/app/page.tsx                 (M5 only, MODIFIED: +1 import, +1 line after <Hero />). Untouched so far.
src/app/lab/exhibition/page.tsx  Temporary isolated route (noindex, not in sitemap); filler above/below.
src/components/exhibition/
  ExhibitionSection.tsx      Server shell: SectionHeading, fixed-height stage (no CLS), SSR area list.
  ExhibitionLoader.tsx       Client gate: WebGL2 check, Save-Data / prefers-reduced-data opt-in, near-viewport
                             IntersectionObserver + deferMs (homepage default 4500 ms, after the Hero intro),
                             error boundary, next/dynamic(ssr:false) -> ExhibitionExperience.
  ExhibitionExperience.tsx   <Canvas> (frameloop "demand", "never" when off-screen), drag look-around with touch
                             axis-lock, keyboard (arrows / Escape), overlays, aria-live; dev-only window.__exh hook.
  exhibition.css             Scoped .exh-* styles (no global CSS edits).
  camera/rig.ts              Pure pose math: anchor/overview poses, aspect-aware fit, lifted Bezier flight path.
  camera/CameraRig.tsx       Overview <-> anchored state machine; interruptible GSAP flights; damped, clamped look.
  scene/quality.ts           Tiers: high (DPR<=1.5, MSAA 4, shadows, 4K facade wash) / mobile (DPR<=1.25, MSAA 2, no shadows).
  scene/textures.ts          Procedural canvas textures (plaza pavers, forecourt stone, concrete, windows, facade wash,
                             palm fronds, light pools); signage composed from official brand PNGs + Alexandria text.
  scene/Atmosphere.tsx       Dusk sky shader, fog, PMREM environment generated in-browser (no HDRI download).
  scene/Lighting.tsx         Hemisphere fill, moonlit key with a one-shot shadow map; Effects (bloom/vignette/AgX).
  scene/Ground.tsx           Site paving, museum forecourt, in-ground linear lights.
  scene/Museum.tsx           Museum exterior model (see section 5).
  scene/Surroundings.tsx     Buildings 70/57, tree belts, palms + planters, disc lamps, bollards, benches, road lights.
  scene/HitTargets.tsx       Invisible, model-independent click/hover volumes per selectable area.
  ui/AreaCard.tsx            Centred teaser card (no hide control) with provisional-copy label.
src/lib/exhibition/
  types.ts, areas.ts         Area config: content, camera anchor, look bounds, hit box; overview pose.
  layout.ts                  Masterplan-derived site coordinates with measured/inferred tags.
  museumFacade.ts            Facade linework per face (traced and perspective-rectified from the render).
.claude/launch.json          Dev-server config for the built-in browser preview (tooling only).
```
Added in M2:
```
  camera/obstacles.ts        Solid volumes (buildings+podiums, museum, stage, seating, booths, gate) used by flight planning.
  camera/rig.ts              + planLift(): smallest arc height whose path clears every obstacle (sampled, 40 steps).
  scene/Placeholders.tsx     Ghost massings (stage, seating, 7 booth shells, gate, entertainment perimeter), merged
                             into 3 draw calls (fill, outline, dashed footprints).
  scene/useAsyncTexture.ts   Shared async texture hook (moved out of Museum.tsx).
  ui/AreaPanel.tsx           AreaPanelTrigger + AreaPanel: RTL right drawer (desktop) / bottom sheet (<768 px),
                             closed by default, grouped list, "أنت هنا", focus management, Escape.
  ui/AreaPins.tsx            DOM pin buttons projected each frame (PinProjector in-canvas); hidden when occluded by
                             buildings/museum, off-screen, under the card, or colliding with a higher-priority pin.
```
Planned later: `public/exhibition/models/*.glb` (M3/M4).

**Coordinate convention:** meters; origin at the plaza's masterplan bottom-left corner; +X right (toward museum), −Z up the plan (toward Buildings 70/57), Y up. Scale derived from the dimensioned 30.0 m path and 12.0 m stage. Each value in `layout.ts` tagged `measured | inferred`.

### 4.3 Key behaviors (engineering design)
- **Scroll safety:** no `wheel` listener with `preventDefault`; R3F canvas gets `touch-action: pan-y` in embedded mode so vertical swipes scroll the page; horizontal drags drive yaw with an axis-lock (first 8–10 px decides). Fullscreen mode switches to `touch-action: none`.
- **Click vs drag:** a pointer gesture counts as a click only if movement < ~6 px and duration < ~350 ms; hit targets are invisible simplified proxy meshes per area (stable across model swaps), raycast with BVH.
- **Camera state machine:** `overview → transitioning(to X) → anchored(X)`; a new selection during a transition kills the tween and starts from the current pose; path via a raised midpoint to avoid clipping through models; resize recomputes the framing (FOV/distance by aspect) without a jump. Reduced motion → short crossfade/cut instead of flight.
- **Look-around:** yaw/pitch offsets relative to the anchor's authored forward direction, clamped per area (e.g. yaw ±55°, pitch −8°…+12°), eased springs; never translates the camera.
- **Card:** DOM overlay (not in-canvas) for crisp Arabic text and accessibility; `aria-live="polite"`; focus moves to the card heading after arrival; no close/hide control; mobile layout keeps the top ~40 % of the scene visible.
- **Loading budget:** nothing 3D is requested until the section is within ~1 viewport **and** after the Hero intro has finished (≥ 4.5 s after load or user scroll). Poster image (static render of overview, captured in M4) shown until the first frame.
- **Fallback:** SSR list of areas with teaser text is always in the DOM (visually replaced by the 3D stage when it works; still reachable by screen readers via the panel). No-WebGL / `prefers-reduced-data` / error / context-loss → poster + list.

### 4.4 Proposed performance budgets (to be confirmed after M1 baseline, D-6)
| Metric | Desktop (mid-range laptop, integrated GPU) | Mobile (mid-range Android / iPhone 12-class) |
|---|---|---|
| Hero impact | 0 KB added to initial route JS; LCP / CLS / TBT within noise of baseline | same |
| Exhibition JS chunk | ≤ 300 KB gz | same |
| 3D assets to first frame | ≤ 8 MB | ≤ 5 MB (lower texture tier) |
| Draw calls (overview) | ≤ 150 | ≤ 100 |
| Triangles in view | ≤ 600 k | ≤ 300 k |
| DPR cap | 1.5 | 1.25 (adaptive down to 1) |
| Frame rate | 60 fps target, ≥ 45 floor | ≥ 30 fps sustained |
| Shadows | Baked/AO-baked; at most one dynamic shadow light, off on mobile | none dynamic |

---

## 5. Modeling feasibility assessment

| Element | Complexity | Procedural / code-authored (in repo) | Needs Blender / 3D designer for target fidelity |
|---|---|---|---|
| Museum exterior | Medium-low: long box volume, recessed entrance portal, exit portal, polygonal light-line facade, signage | **Yes** — extruded volume, beveled panel seams, polygon edge network traced from the reference as 2D polylines → emissive ribbon geometry with per-segment colors, warm LED strips in portals, official logo texture. | Optional: baked AO/lightmap pass in Blender would raise realism notably. |
| Plaza ground | Low-medium | Yes — tiled PBR material with diamond/border pattern in a generated texture atlas (red/beige/gray pavers from site photos). | No |
| Buildings 57 / 70 | Medium (repetitive) | Yes — instanced facade module (concrete grid + recessed windows), dimmed interior emissive. | No |
| Trees, palms, planters, light poles, benches, rails | Medium | Poles/benches/rails/planters yes; trees/palms via low-poly instanced meshes or alpha cards. | CC0 tree/palm models recommended (D-3). |
| Stage + truss + LED wall + seating wedges + lounge chairs | Medium-high | Partially — truss is parametric; seating wedges are instanced; LED screen uses official logo texture. | Recommended for chairs/speakers detail, or accept simplified. |
| Booth shells (Tech/Economy family; Media/Entrepreneurship octagonal family) | Medium per booth, high in aggregate | A shared **booth kit** (panels, octagonal frame, header, LED strips, screens, counters, tables) assembled per booth from config — reproduces silhouettes and layout well. Graphics/screens as textures **re-made** from official assets, not cropped from AI renders. | Fine furniture, stadium model miniature, broadcast desk, stretchers etc. → designer or simplified stand-ins. |
| Entrance arch, photo booth, coffee kiosk, press wall, octagonal tunnel | Medium | Yes (arch = torus segment with printed texture; tunnel = repeated octagon frames). | No |
| People | High | Not planned. | Decision D-7 (empty but lit vs. stylized silhouettes). |

**M1 result:** the museum exterior was built entirely in code: facade lines as proud HDR bars, an emissive "wash" texture for the coloured light on the panels, and a mirrored diffuse spill on the forecourt. At the anchor view it closely follows the render's composition, linework, signage and portal. See STATE for the gate report.

**Conclusion:** A convincing, web-optimized evening scene of the museum exterior and plaza is achievable in code with care to materials, lighting and composition — the M1 gate will prove or disprove that. Matching the *richness* of the booth renders (dense props, screens, people) is not realistic from code alone; plan for either (a) designer-produced GLBs dropped into the stable config, or (b) an approved simplification level. The architecture keeps that choice open.

---

## 6. Milestones

Each milestone ends with: checks run, results recorded in the STATE file, roadmap updated, and a stop for owner review. Milestones marked **GATE** require explicit approval before the next starts.

### M0 — Discovery & planning ✅ (this document)
Outputs: ROADMAP + STATE. No code, no installs.

### M1 — Foundation + Museum visual-quality prototype — **GATE 1 (quality)** — implemented, awaiting review
- **Objective:** Prove that the target architectural quality (spec §5 "early quality gate") is reachable, in an isolated route, before any homepage work.
- **Dependencies:** Approval of this roadmap, D-1 (deps), D-3 (CC0 HDRI/textures), D-2 (lab route). Best effort with R-1/R-2 (otherwise provisional geometry, documented).
- **Scope / approach:**
  1. Install approved deps; scaffold `src/components/exhibition/*`, `src/lib/exhibition/{types,areas,layout}.ts`, lab route `src/app/lab/exhibition/page.tsx` (noindex) with filler content above/below to emulate page flow.
  2. Museum exterior: volume, portals, facade light-line network traced from the reference, signage from official `public/assets/brand/` files, warm portal lighting; unseen sides authored minimal + flagged in `layout.ts`/assumptions log.
  3. Local environment: plaza paving material, segment of Building 57 facade, poles, benches, planters with palms, tree line silhouette, evening sky/HDRI; tone mapping (ACES/AgX), restrained bloom decision.
  4. Interaction slice: overview of museum surroundings → one anchor in front of the museum (cinematic tween with GSAP) → constrained look-around (mouse drag + horizontal touch) → centered provisional card (Arabic, marked مؤقت) → back to overview.
  5. Measure: JS chunk size, asset weight, draw calls/triangles (`renderer.info`), fps on desktop + one phone.
- **Deliverables:** working lab route; side-by-side screenshots vs. museum reference (front, 3/4 view, evening overview); a short gate report in STATE (similarity, atmosphere, perf numbers, production-cost estimate for remaining areas, procedural vs Blender recommendation).
- **Acceptance:** museum reads unmistakably as the reference design; believable depth from 3/4 angles; evening lighting not neon/over-bloomed; ground not wet; card legible over the moving scene; no scroll trapping on wheel or vertical swipe in the lab page; Hero untouched (`git diff` shows no changes to Hero/page/globals); `tsc` clean, `eslint` no new errors, `next build` succeeds.
- **Verification:** built-in browser pane at 1440×900 and 375×812; real phone via LAN dev server; DevTools Performance capture; `git diff --stat` audit.
- **Risks:** facade-line glow looking cheap without bloom (mitigation: emissive + thin geometry + optional selective bloom); HDRI weight (use 1k–2k tone-mapped, KTX2); time sink in tracing polygons (author once as JSON).

### M2 — Spatial layout + complete interaction system (lab route) — implemented, awaiting review
- **Objective:** Full site layout from the masterplan and every interaction rule in spec §3, independent of final booth art.
- **Dependencies:** GATE 1 approved; D-5 (orientation), D-15 (museum circulation), R-3 (identity of the 7 corners); R-5/R-6 ideally.
- **Selectable set:** 7 corners + museum + stage + entertainment zone (10 hit targets / menu entries). All other structures are non-interactive scenery.
- **Scope:** `layout.ts` with all areas at masterplan coordinates (measured vs inferred tagged); Buildings 57/70 massing; paths, gate, control booth, planters per plan; provisional area volumes for non-museum areas — **clearly marked temporary blockouts** (labelled in UI as "تصميم مبدئي" in lab only); full camera state machine (overview ↔ any anchor, neighbor clicks, interruption, resize); look-around bounds per anchor; click-vs-drag; RTL right-side panel (desktop) & bottom sheet (mobile) closed by default with persistent trigger; keyboard navigation (Tab/Enter/Escape/arrow keys for look-around), visible focus, hover/focus/selected feedback that is not color-only (outline + label chip); reduced-motion path; mobile optional fullscreen with scroll-position restore; card behaviors.
- **Deliverables:** fully navigable lab exhibition; interaction test checklist with results in STATE.
- **Acceptance:** spec §8 items 3, 4, 5 (in lab) pass; no camera clipping on any of the N×N transitions; rapid re-selection never leaves the rig in a broken state; card never hideable; panel and sheet operable by keyboard and screen reader.
- **Verification:** scripted manual matrix (all transitions, interrupt mid-flight, resize mid-flight, rotate phone, reduced-motion on/off, keyboard-only pass, NVDA/VoiceOver spot-check), real iOS + Android touch tests.
- **Risks:** iOS Safari gesture conflicts (`touch-action` + passive listeners); camera paths through stage truss (midpoint lift + per-pair overrides); masterplan orientation dispute.

**M3 as built (summary):** see the M3 section below and STATE.

**M2 as built (summary):** all 10 selectable areas at masterplan positions with anchors, look bounds, hit volumes and pins; museum (modelled) + translucent placeholders for everything else; three navigation paths (3D click incl. visible neighbours, panel/bottom sheet, overview); obstacle-aware interruptible flights; keyboard, reduced motion, optional fullscreen with scroll restore; "skip the exhibition" link; dev-only flight clearance check (`__exh.checkFlights`). The M1 museum standpoint now lies behind the stage, so the museum anchor moved north-east of it (similar three-quarter view, slightly more oblique). Details and results: STATE.

### M3 — Stage & theater + booth kit + first corner — **GATE 2 (booth fidelity & production plan)**
- **Objective:** Validate the second visual-quality class (event structures) and settle who produces the remaining models.
- **Dependencies:** M2 review; R-8 confirmation; D-11 (which booth first — proposal: Media corner, cleanest design family); R-12 sponsor-mark policy; ideally R-5 (slot ↔ corner mapping).
- **Carry-over from M2:** mobile draw calls ≈104–134 vs proposed ≤100 — merge static museum/building meshes per material while touching these files (or in M6).

**M3 — implemented (2026-10-12), awaiting GATE 2:**
- *Layout:* slots 3–5 moved 2.2–2.5 m south (z 34.15–34.4), south palms to z 37.4, south lanterns to z 38.7. No overlaps; ≥ 0.7 m clearance between slot 2/7 and the south row, open fronts for 2 and 7. Side-corner cameras now face 2 and 7 almost head-on.
- *Model-slot architecture:* `AreaConfig.frame` (local model frame) + optional `modelUrl`; `scene/AreaModels.tsx` renders the code kit or a GLB in that frame (lazy GLTFLoader, error → kit fallback). Proven with `__exh.swapModel('corner-2')`: the kit was exported to GLB in-browser (610 KB) and loaded back with an identical render; a missing URL falls back to the kit.
- *Stage & amphitheatre* (`scene/models/Stage.tsx`): curved-apron deck with warm under-lip light, side stairs with lit nosings, LED wall with the official lockup, angled ray screens, portrait logo panels, gold light bars, line arrays, box-truss towers + roof grid (instanced), roof/deck fixtures, restrained blue beams and floor gobos, KORA lectern, one stage spot (desktop). Lounge band of armchairs + tables, four stone tiers with cushions and warm nosing strips.
- *Booth kit* (`scene/kit/booth.tsx`, `kit/primitives.tsx`): walls between plan points, on-wall placement, chamfered portals, beam loops / octagon canopies, plates, screens, tripod camera, truss generator, instanced struts/parts, tube LEDs.
- *Media corner* (`scene/models/MediaCorner.tsx`, slot 2): faceted plum walls, chamfered broadcast portal with pink LED edge, twin screens over a control desk, TV + broadcast camera, listening stations, player-info screen, octagonal canopy with LED + spots, header «من الملعب إلى العالم», section plates 01–03, glowing «ركن الإعلام». Adapted to the 3 × 3 m slot (F-3).
- *Static batching* (`scene/Batched.tsx`): opaque meshes with identical materials merged per subtree, so overview draw calls are back to ≈151 (from 201) with no visual change.

**GATE 2 — production recommendation per remaining area**
| Area | Design source | Recommendation | Rough effort |
|---|---|---|---|
| Entrepreneurship (slot 3) | Render (same octagon-frame family as Media) | Code kit (reuse Media pieces) | ≈ 0.5 day |
| Technology (slot 1) / Economy & Investment (slot 4) | Renders (navy shell + KORA header family); Economy has two variants (R-4) | Code kit for shell, screens, kiosks; the **stadium miniature** is better as a designer GLB (or a simplified kit version) | ≈ 1 day each + stadium asset |
| Health (slot 5) | Render (cyan neon frame) | Code kit, neon toned down (spec); medical chair/stretcher props simplified or designer GLB; no third-party marks | ≈ 1 day |
| Corners 6–7 | none | Blocked on identity/design (D-17) | — |
| Entertainment zone | Render (games layout, LED arch, big screen); location provisional (D-19) | Kit for arch, screen, cages, lanes and tables; arcade cabinets and foosball/air-hockey tables from a designer or CC0 library (D-3) | ≈ 2 days kit + assets |
| Scenery (entrance arch, press wall, coffee kiosk, photo booth, light tunnel) | Renders | Code kit | ≈ 1.5 days total |

**Decision needed at GATE 2 — booth scale (F-3):** the renders read roughly 8–12 m wide, while the masterplan slots are 3–4 m (only slot 4 is dimensioned: 4.0 × 2.5 m). The Media corner was built faithfully to its *design* but compressed into the 3 × 3 m slot, so it reads as a compact kiosk. Options:
- **(a)** keep the plan sizes (compact booths);
- **(b)** use render-scale booths, which needs a reflowed corners zone and probably more plaza;
- **(c)** confirm real booth dimensions with the event designer.

**Recommended: (c), keeping (a) meanwhile.** The kit is parametric, so a slot size change re-flows the booth.
- **Scope:** stage (12 × 5 m, truss, LED wall with official logo, steps, under-stage strip lights), seating wedges + front lounge row, control booth; parametric booth kit; first corner booth to final-candidate fidelity; replaceable GLB slot wiring (load a GLB per area if present, else kit model) proving model swap without code changes elsewhere.
- **Acceptance:** stage and first booth match their references' design language; swapping a GLB for one area requires only config change; perf still within budget.
- **Gate output:** recommendation per remaining area — code kit vs designer GLB — with effort estimates.
- **Risks:** prop density cost; reference size mismatch F-3.

### M4 — Remaining areas + world completion (lab route)
- **Objective:** All approved areas at agreed fidelity; coherent, non-empty world.
- **Dependencies:** GATE 2 decisions; R-3, R-4, R-6, R-7; any designer GLBs delivered.
- **Scope:** remaining corners (Tech, Entrepreneurship, Economy, Health, Engineering if supplied), entrance arch, press wall + coffee kiosk, photo booth, corridor/tunnel and entertainment-zone teaser (as provisioned in D-10); Building 70; perimeter trees/road; final lighting pass; asset compression (Draco/meshopt + KTX2), texture tiers (desktop/mobile); poster image capture for loading/fallback.
- **Acceptance:** spec §8 items 6, 7, 8 pass in lab; budgets in §4.4 met or deviations documented and approved.
- **Risks:** asset weight creep; designer delivery timing (blocks only the affected area — kit model stays as stand-in).

### M5 — Homepage integration & fallback
- **Objective:** Ship the section after the Hero with zero Hero regression.
- **Dependencies:** M4 (or an approved subset), final/approved copy (R-10) or explicit approval to ship provisional.
- **Touchpoints:** `src/app/page.tsx` (+2 lines). No edits to `Hero.tsx`, `layout.tsx`, `globals.css` Hero rules, `Navbar.tsx`.
- **Scope:** `ExhibitionSection` SSR shell with reserved height (`aspect-ratio`/`min-height`, no CLS); deferred load (near-viewport + post-intro); error boundary, WebGL-unavailable and context-loss fallback; `ScrollTrigger.refresh()` sanity for `AboutArt`; z-index coexistence with topbar and noise overlay; `prefers-reduced-motion`, `prefers-reduced-data` handling.
- **Hero safeguards (verification):** (1) `git diff` proves Hero files untouched; (2) network panel: no exhibition chunk/asset requested before scroll-near; (3) Lighthouse mobile+desktop for `/` before/after — LCP/TBT/CLS within noise, recorded in STATE; (4) visual compare of Hero intro at 0 s/2 s/5 s on desktop and mobile; (5) Hero pointer parallax still responsive while exhibition is mounted.
- **Acceptance:** spec §8 items 1, 2, 9.
- **Risks:** ScrollTrigger position drift (reserved height mitigates); GPU contention when both Hero motion and canvas run (pause render loop when section is off-screen — `frameloop` control via IntersectionObserver).

### M6 — Performance, accessibility & device QA hardening → release
- **Scope:** device matrix (Windows/Chrome, macOS/Safari, iPhone Safari, Android Chrome mid-range, low-end Android), throttled network (Fast 3G/4G) runs, memory check (mobile tab not reloading), WCAG 2.2 AA checks (contrast, focus order, target size ≥ 44 px mobile, screen-reader list), RTL review, remove/gate lab route, final docs; optional removal of unused Spline deps (D-9).
- **Acceptance:** spec §8 item 10 with a documented results table and explicit trade-offs.

### Asset production / acquisition track (parallel)
| Step | When | Owner |
|---|---|---|
| A-1 Rename/organize references (D-8), add the full PDF and museum plan (R-1, R-2) | before M1 | Product owner |
| A-2 CC0 HDRI + PBR textures + tree/palm models selection (list + licenses recorded in `docs/3d-exhibition/ASSET_LICENSES.md`) | M1 | Claude Code (with approval to download) |
| A-3 Decide designer/Blender involvement (D-12) | GATE 1 / GATE 2 | Product owner |
| A-4 Area list, corner-slot mapping, orientation (R-5, R-6, D-5) | before M2 | Product owner |
| A-5 Teaser copy (R-10) | before M5 | Product owner |
| A-6 Sponsor/third-party mark policy (R-12) | before M3 | Product owner |

---

## 7. Hero protection rules (apply to every milestone)
1. Never edit `src/components/sections/Hero.tsx`, Hero CSS selectors (`.hero-*`, `.field-*`, `body:has(.hero-field) .topbar`), `src/app/layout.tsx`, or `public/assets/brand/*` (read-only use).
2. Until M5, `src/app/page.tsx` is not modified; all work lives in the lab route.
3. No global listeners (`window` wheel/pointer/keydown) that call `preventDefault` or alter scroll; keyboard handlers scoped to the section.
4. Exhibition JS must be a separate dynamic chunk; verified in `next build` output and network panel.
5. Each milestone records `git diff --stat` against Hero files (must be empty).

## 8. Testing & verification toolkit
Available now: `npx tsc --noEmit`, `npx eslint` (baseline: 1 pre-existing error in `Departments.tsx`), `npm run build`, `npm run dev` + built-in browser pane, manual DevTools/Lighthouse. Optional (approval required): Playwright for scripted scroll/interaction smoke tests and screenshot comparisons of the Hero; Vitest for pure logic (camera clamping, gesture classifier, state machine).

## 9. Open decisions (need product-owner answers)
| ID | Decision | Recommendation |
|---|---|---|
| D-1 | **Done in M1:** `three@0.186.1`, `@react-three/fiber@9.8.1`, `@react-three/postprocessing@3.2.0`, `postprocessing@6.39.5`, `@types/three` (dev). drei installed then removed (unused). | Closed |
| D-2 | **Done:** `/lab/exhibition` (noindex, not in sitemap). Remove or gate before release (M6). | Closed |
| D-3 | CC0 asset downloads: **not needed for M1** (sky, environment and all textures are procedural). Revisit only if GATE 1 asks for photographic materials or vegetation. | Deferred |
| D-4 | Use `gltf-transform` CLI (via npx, no package.json change) + host Draco/Basis decoders in `public/` | Approve at M4 |
| D-5 | Masterplan schematic orientation vs satellite orientation (R-9) | Follow masterplan (it is the approved event plan); keep satellite for surroundings only |
| D-6 | Performance budgets §4.4 | Approve provisionally; finalize after M1 measurements |
| D-7 | People in the scene: none / stylized silhouettes | None for M1–M4; revisit after GATE 2 |
| D-8 | Rename reference images to descriptive names (§3.1) | Approve |
| D-9 | Remove unused `@splinetool/*` deps (bundle hygiene, out of exhibition scope) | Defer to M6, separate approval |
| D-10 | **Decided 2026-10-12:** selectable = 7 corners + museum + stage + entertainment zone; everything else is scenery. Open sub-question: R-3 (which 7 corners). | Closed |
| D-11 | First booth for GATE 2 | Media corner |
| D-12 | Blender / 3D designer involvement | Decide after GATE 1 with evidence |
| D-13 | Provisional unseen museum sides (R-2): restrained continuation of the front polygon language, dark volume, no invented signage. **Implemented this way in M1** (north face partly from the render; south/east dimmer, authored). | Confirm at GATE 1 |
| D-15 | Museum circulation conflict F-7 (which end is the entrance) | **Decided 2026-10-12:** keep the M1 orientation for now | Closed (for now) |
| D-17 | Slot ↔ corner mapping (F-9 / R-5). M2 provisional: 1 Technology, 2 Media, 3 Entrepreneurship, 4 Economy & Investment, 5 Health, 6–7 "to be confirmed" | Owner to supply the mapping and the two missing corners |
| D-18 | Control booth omitted (F-8) | Confirm, or provide its intended position relative to the M1 museum |
| D-19 | Entertainment zone location (F-11) | Owner to confirm location/footprint; keep provisional until then |
| D-20 | Booth scale (F-3, see GATE 2 above) | (c) confirm real dimensions; keep plan sizes meanwhile |
| D-21 | Seating type (F-12): stone tiers + lounge row (design render) vs loose chairs (masterplan aerial) | Keep the design render's tiers |
| D-22 | Producing the remaining models: code kit vs designer GLBs (GATE 2 table) | Code kit for shells and scenery; designer/CC0 for complex props (stadium miniature, arcade games) |
| D-14 | Third-party logos (Bupa, adidas, EA FC, broadcasters) | Replace with neutral placeholders unless rights confirmed |

## 10. Update log
| Date | Change |
|---|---|
| 2026-10-12 | v0.1 created after read-only discovery (M0). |
| 2026-10-12 | v0.4: M2 approved. Layout tweak (south row set back). M3 implemented: model-slot frames + GLB swap, stage & amphitheatre, booth kit, Media corner, static batching. Findings F-12…F-14, decisions D-20…D-22, GATE 2 table added. |
| 2026-10-12 | v0.3: M1 approved. M2 implemented: full masterplan layout, 10 selectable areas, placeholders, panel/bottom sheet, pins, fullscreen, obstacle-aware flights. Findings F-8…F-11 and decisions D-15 (closed), D-17…D-19 added; museum anchor relocated (stage occupies the M1 standpoint). |
| 2026-10-12 | v0.2: owner decisions recorded (10 selectable areas; close fidelity; Hero untouched). M1 implemented; stack finalised (drei dropped, postprocessing added); section 4.2 now as-built; F-7, D-15 and the corner-identity question (R-3) added; D-1/D-2/D-10 closed; D-3 deferred. |
