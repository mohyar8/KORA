# KORA 3D Exhibition — Implementation Roadmap

**Status:** v1.0 (2026-10-14) — M0–M5 approved; M6 + R1–R4 committed by the owner (`1d9cb38`); LR-1 / LR-2 committed by the owner (`d95898b`); **PF-1, FR-1 and FR-2 implemented and verified, stopped for review** (§6). Not declared production-ready; nothing committed or deployed.
**Authoritative spec:** [`3D_EXHIBITION_SPEC.md`](./3D_EXHIBITION_SPEC.md) **v1.7**. This roadmap never overrides it; conflicts are logged in §9.
**Resume file:** [`3D_EXHIBITION_STATE.md`](./3D_EXHIBITION_STATE.md) (current state, verified results, how to verify).
**Owner of this file:** Claude Code — update on every material plan change and log it in §10.

---

## 1. Scope and approved product decisions

**In scope (spec §2).** A non-blocking, full-width 3D exhibition section placed directly after the existing Hero:
- elevated overview → select an area (3D click, side panel / bottom sheet, or back to overview);
- cinematic camera flight → constrained look-around;
- a **world-anchored information card** that expands and collapses (spec §3.4).

It also covers evening lighting, KORA-inspired surroundings, replaceable per-area models, an accessible non-3D fallback, responsive desktop/mobile layouts, and optional mobile fullscreen.

**Approved decisions (all 2026-10-12, product owner):**
- **Selectable areas (10):** the 7 corners, the museum, the main stage and the entertainment zone. Everything else is non-selectable scenery.
- **Fidelity:** follow the preliminary architectural designs closely, prioritising realism and quality. Never invent missing corner designs or treat ambiguous references as confirmed: use clearly marked placeholders.
- **Hero:** never modified.
- **Museum:** keep the M1 entrance orientation (D-15).
- **Placement:** superseded on 2026-10-13 by the owner-directed layout (spec §4.4); designs still from the references.
- **Earlier recommendations approved as a batch:**
  - D-7: no people for now.
  - D-11: Media corner first.
  - D-14: neutral replacements for third-party marks.
  - D-17: provisional slot mapping.
  - D-18: control booth omitted.
  - D-19: entertainment zone provisional.
  - R-8: stage without the render's background building.
  - GATE 2 recommendations: keep plan booth sizes; code kit for shells and scenery; simplified stand-ins for complex props.
- **Layout (2026-10-13):** museum left of the entrance, stage at the far end of the main path facing the entrance, passage beyond the museum, six corners in a U, expanded grounds, larger booths (spec §4.4).
- **Stage:** lounge chairs in a clean, regular layout, each facing the stage centre.
- **Cards:**
  - world-anchored, never camera-fixed;
  - expand automatically on arrival and on destination change;
  - **collapse to a compact bar** (area name + expand indicator) at the same world position, and the bar expands them again;
  - smooth subtle animation;
  - no separate "show info" button;
  - must not block neighbouring areas.

**Explicit exclusions:**
- Any change to the Hero (`Hero.tsx`, `.hero-*` / `.field-*` CSS, its assets, the topbar entrance timing).
- Redesign of other sections, the navbar or the footer.
- Free-roam, orbit controls, museum interiors, scroll-jacking, forced tours or forced fullscreen.
- Spoilers.
- Backend, CMS or APIs.
- Claims of surveyed dimensions or final designs.

---

## 2. Repository facts (verified)

| Area | Fact | Consequence |
|---|---|---|
| Framework | Next.js 16.3.5 (App Router, Turbopack), React 19.2.8, TypeScript strict, Tailwind v4. Read `node_modules/next/dist/docs/` before writing Next code (AGENTS.md). | `next/dynamic({ssr:false})` only inside a Client Component (→ `ExhibitionLoader`). |
| Homepage | `src/app/page.tsx`: `Hero → ExhibitionSection → Manifesto → About → Tracks → EventFacts → WhyJoin → FinalCta` (section inserted in M5). | — |
| Hero | Client component; `.hero-field` 100svh with sticky stage; window `pointermove` parallax; intro animations ≈4 s. | Load nothing 3D before the intro ends; no global listeners that alter scroll. |
| Scroll | GSAP ScrollTrigger in `AboutArt.tsx` (refresh on mount); no smooth scrolling. | The section must reserve its final height (no CLS). |
| Layout | `<html lang="ar" dir="rtl">`, fixed topbar 70 px (z 60), noise overlay `body::before` (z 90). | UI z-indices stay inside the stage; fullscreen sits at z 100. |
| Brand | Colours in `src/lib/constants.ts` / `@theme`; official logos in `public/assets/brand/` (read-only); font Alexandria (Ghroob is not web-licensed). | Signage textures are composed from the official PNGs; Arabic text uses Alexandria. |
| Deps added | `three 0.186.1`, `@react-three/fiber 9.8.1`, `@react-three/postprocessing 3.2.0`, `postprocessing 6.39.5`, `@types/three`. drei was removed (unused). `@splinetool/*` is still installed and unused (D-9). | — |
| QA tooling | No test runner, no Playwright, no Lighthouse CI. Baseline lint has 1 pre-existing error (`Departments.tsx:19`). | Checks: `tsc`, `eslint` (no new problems), `next build`, browser verification (see STATE "How to verify"). |
| Deploy | Vercel. | Assets under `public/` are CDN-cached. |

---

## 3. References, gaps and findings

### 3.1 Available references — `docs/3d-exhibition/references/` (18 JPEGs, WhatsApp names)
| File (`WhatsApp Image 2026-10-12 at …`) | Content |
|---|---|
| `12.05.47 PM` | Museum exterior design |
| `12.05.50 PM` | **Event masterplan** (dimensioned plan + aerial render) |
| `12.05.49 PM (6)` | Stage & theater (two renders) |
| `12.05.49 PM (5)` | Entertainment zone layout render |
| `12.05.48 PM` / `(1)` / `(2)` / `(3)` | Technology / Media / Entrepreneurship / Economy & Investment booths |
| `12.05.49 PM (1)` | "Futuristic Sports, Tech & Economy" booth: an Economy variant containing placeholder text (R-4) |
| `12.05.49 PM` | Health booth |
| `12.05.49 PM (2)` | Press wall, coffee kiosk, walkway |
| `12.05.49 PM (3)` | Entrance arch |
| `12.05.49 PM (4)` | Banner corridor, photo booth, octagonal light tunnel |
| `12.05.50 PM (1)`, `(2)`, `(4)`, `12.05.51 PM` | Site photos (plaza paving, Building 57, lamps, trees) |
| `12.05.50 PM (3)` | Satellite screenshot |

The PDF `layout_koora.pdf` and the `IMG_569x` files named in the spec were never added. The renames proposed in D-8 were never applied.

### 3.2 Still-missing information
| ID | Missing | Current handling |
|---|---|---|
| R-1 / R-2 | Museum plan, dimensions, unseen sides | Museum 28 × 10 × 5.6 m inferred; south/east faces authored provisionally (D-13) |
| R-3 / D-17 | Identity and designs of corners 6–7 | Translucent placeholders «ركن قيد التأكيد (الموقع ٦/٧)» |
| R-4 | Which Economy render is current | Variant A built |
| R-5 | Slot ↔ corner mapping | Provisional: 1 Tech, 2 Media, 3 Entrepreneurship, 4 Economy, 5 Health |
| R-6 / D-19 | Entertainment zone location and footprint | Provisional 32 × 22 m zone north of the passage, flagged in its card |
| R-7 | Building 70 photos and height | Generic precast grid, 15 m |
| R-10 | Approved teaser copy | Provisional Arabic copy, labelled in every card |
| R-12 / F-16 | Partner logos and artwork | Neutral placeholders |
| D-20 | Real booth dimensions (renders read ~8–12 m, plan slots are 3–4 m) | Plan sizes kept; the kit is parametric |

### 3.3 Dimensions used
Measured on the plan:
- stage 12.0 × 5.0 m;
- seating aisle 2.0 m;
- entrance path 30.0 m;
- centre booth slot 4.0 × 2.5 m, with a 1.5 m gap.

Everything else is inferred and tagged in `layout.ts`. Since LR-1 (2026-10-13) positions are owner-directed (origin = entrance arch, +X along the main path); the plan's px → m conversion no longer applies to positions. Measured sizes (stage, aisle) are kept; booths are their plan-slot design sizes × `BOOTH_SCALE` 1.7.

### 3.4 Findings (all still valid)
- **F-1** Renders are preliminary AI-style concepts with unrelated backgrounds. They are used for designs, not settings.
- **F-2** Three visual families:
  - octagon frame: Media, Entrepreneurship;
  - navy shell: Technology, Economy;
  - cyan frame: Health, with its neon toned down.
- **F-3** Booth renders are far larger than the plan slots (→ D-20).
- **F-4** The masterplan aerial shows the museum as a cutaway; only the closed exterior is modelled.
- **F-5** The museum render's floor is mirror-like; the forecourt is satin (spec: no wet look).
- **F-6** The render wordmarks differ from the official lockups; the repo files are used.
- **F-7** The plan routes visitors into the museum's south end, but the render puts the entrance at the north end of the west facade. The render is followed (D-15).
- **F-8** The control booth would stand in front of the portal, so it is omitted (D-18).
- **F-9** Seven slots exist; their mapping is not stated (R-5).
- **F-10** Plan palms at z ≈ 5.7 / 17.5 m on the museum-path strip blocked the museum view. They were moved to or omitted at the strip ends (strip palms now at z 22, 26.4, 33.6).
- **F-11** The entertainment zone appears on the plan only as an arrow; its location is provisional.
- **F-12** Seating follows the stage-design render (stone tiers + lounge row) inside the plan footprint, not the aerial's loose chairs (D-21).
- **F-13** Garbled AI lettering and third-party marks in the Media render are omitted. Screens show our own pitch graphics.
- **F-14** The stage-screen tagline is not approved copy, so the screens show the official lockup only.
- **F-15** Scenery positions are inferred (arch at the west entrance gap; tunnel and banners in the passage; photo booth at the passage mouth; coffee kiosk and press wall by the entrance path).
- **F-16** Not reproduced: Bupa, coffee-partner, press-wall partner and sponsor logos, "FC 27", and the stadium name. Neutral labels are used instead: «شريك صحي», «ركن القهوة», «راعٍ». The Health niche caption is kept in its original English.

---

## 4. Technical approach (as built)

### 4.1 Architecture
```
src/app/page.tsx                     Homepage: <ExhibitionSection /> between <Hero /> and <Manifesto /> (M5, default deferMs 4500).
src/app/lab/exhibition/page.tsx      QA route (filler above/below, deferMs 0), noindex. 404 in production builds unless EXHIBITION_LAB=1 (M6).
public/exhibition/poster.webp        Overview still, 1600×898 (16:9 overview pose), 77 KB.
public/exhibition/poster-mobile.webp Overview still, 720×1200 (portrait overview pose), 40 KB.
src/components/exhibition/
  ExhibitionSection.tsx    Server shell: heading, fixed-height stage (no CLS), SSR text list (fallback/SEO),
                           #exhibition-after skip target.
  ExhibitionLoader.tsx     Client gate: WebGL2, Save-Data opt-in, near-viewport (rootMargin 40%) + deferMs
                           (homepage 4500 ms), error boundary, next/dynamic(ssr:false). Poster (<picture>, art-directed)
                           mounted only once near; covers loading, cross-fades out on the experience's onReady,
                           returns dimmed behind the fallback message. ScrollTrigger.refresh() when the list is revealed.
  ExhibitionExperience.tsx Canvas + overlays; selection state; gestures (drag look, touch axis-lock), keyboard,
                           Escape order (panel → fullscreen → selection), fullscreen, card expand state,
                           adaptive DPR state, dev-only window.__exh hook (incl. step(ms) for GSAP time).
  exhibition.css           All styles, scoped .exh-*.
  camera/rig.ts            Poses (anchor/overview, aspect fit, portrait tilt), flightPoint + planLift.
  camera/CameraRig.tsx     Overview ⇄ anchored state machine, interruptible GSAP flights, damped clamped look.
  camera/obstacles.ts      Solid volumes for flight clearance (buildings, museum, stage, seating, booths, gate, scenery);
                           the light tunnel is a hollow shell (side frames + roof) and the passage sign is a volume.
  camera/route.ts          Spline routes: passage route to the entertainment zone; tunnel exit for flights
                           interrupted inside the tunnel. Collision-checked (1200 probes) with arc fallback.
  scene/quality.ts         Quality tiers (high / mobile).
  scene/textures.ts        Canvas textures, signage from official PNGs, lockups, plates, ray screens.
  scene/Atmosphere.tsx, Lighting.tsx, Ground.tsx, Surroundings.tsx   Sky/env, lights + bloom/AgX, paving, campus context.
  scene/AreaModels.tsx     Model slots: per-area frame; code kit or GLB (modelUrl / dev override), kit fallback.
                           All kit models share one static batch (rebuilt when a GLB takes a slot).
  scene/Museum.tsx         Museum exterior (M1).
  scene/models/Stage.tsx                Stage + amphitheatre + lounge row.
  scene/models/MediaCorner.tsx          Slot 2.
  scene/models/NavyShellCorners.tsx     Slots 1 (Technology) and 4 (Economy & Investment).
  scene/models/FrameCorners.tsx         Slots 3 (Entrepreneurship) and 5 (Health).
  scene/models/EntertainmentZone.tsx    Entertainment zone.
  scene/Scenery.tsx        Entrance arch, passage tunnel + banners, photo booth, coffee kiosk, press wall, stanchions.
  scene/Placeholders.tsx   Ghost massings for unmodelled areas (now slots 6–7 + gate), 3 draw calls.
  scene/HitTargets.tsx     Raycast-only volumes per area + building blockers.
  scene/Batched.tsx        Static batching: merges meshes whose materials match in all but base colour (colour
                           baked into vertex colours) and expands small static instanced sets; runs only after
                           every async texture has settled (M6).
  scene/AdaptiveResolution.tsx  Lowers/raises the pixel ratio (0.75 … tier cap) from frame times sampled while moving (M6).
  scene/kit/primitives.tsx Struts/truss, Instanced, tubes/arcs, Detail (distance LOD), useDispose.
  scene/kit/booth.tsx      Booth kit: walls, on-wall placement, chamfer/octagon frames, Plate, Screen, TripodCamera.
  scene/kit/panels.ts      Own panel graphics (dashboard, map, funnels, infographic, playfields, arch face, skins).
  scene/useAsyncTexture.ts Async texture hook + pending counter (asyncTexturesSettled) used by Batched.
  ui/AreaCard.tsx          World-anchored card; expand/collapse (accordion pattern); Previous / Overview / Next
                           controls (TOUR_ORDER in areas.ts), visible in both states.
  ui/AreaPins.tsx          DOM pins + PinProjector (also positions the card each frame).
  ui/AreaPanel.tsx         Trigger + RTL drawer / mobile bottom sheet.
src/lib/exhibition/
  types.ts                 AreaConfig (content, model, frame, modelUrl, anchor, look, hitBoxes, labelAt, cardAt).
  areas.ts                 10 areas, corner content (provisional mapping), overview pose, cardAnchor().
  layout.ts                Masterplan coordinates with provenance tags.
  museumFacade.ts          Museum linework per face.
```
**Coordinate frame:** metres; origin at the masterplan's NW plaza corner; +X east, +Z south, Y up. Kit models use the area frame, with **+Z = open front / audience side**. Corner frame rotations: north π, east π/2, west −π/2.

### 4.2 Key behaviours
- **Scroll safety:** no wheel `preventDefault`; `touch-action: pan-y` embedded (`none` in fullscreen); horizontal drag = look.
- **Selection:** a click within 6 px of movement selects; buildings block picks; pins are DOM buttons (keyboard and screen-reader friendly), hidden when occluded or colliding, drawn above the card.
- **Camera:** flights arc over obstacles (`planLift`); interruptions start from the current pose; resize re-fits; reduced motion → instant cuts.
- **Card (spec §3.4):**
  - Anchored to `cardAnchor(area)` (in front of and below the subject); it hangs below that point, is clamped to the viewport, and hides while the point is out of frame. It moves with the world on look-around.
  - It expands on every arrival.
  - **Content (FR-1, spec v1.6):** name (the toggle) + one short question (`content.question`) + Previous / المنظر العام / Next; 320 px wide (300 on phones). Long teasers and provisional notes live in the text area list.
  - **Collapse:** the whole title row is an `aria-expanded` toggle; the question folds away with a 0.32 s grid-rows animation, and the card narrows to a 300 px bar (name + navigation) at the same anchor. Reduced motion → no animation. The body is `inert` while collapsed.
- **«ابدأ الجولة» (FR-2):** flies to the first stop of `TOUR_ORDER`; no tour state or UI. Card Previous / Next walk `TOUR_ORDER` linearly (museum … entertainment, no wrap; ends hide the missing control).
  - Card title: wraps (never clipped).
- **Loading:** nothing (JS or poster) before near-viewport; 3D also not before `deferMs`; poster while loading; SSR text list always present; failure / context loss / no WebGL / Save-Data → dimmed poster + message + visible text list; `<noscript>` reveals the list.
- **Fullscreen stacking:** while fullscreen, `.exh-stage` is lifted to z 100 (via `:has`) so the fixed overlay covers the topbar (z 60) and noise overlay (z 90); before M5 the isolated stage kept it below the topbar.
- **Performance:** frameloop `never` until the scene is prepared, then `demand` (`never` off-screen); DPR caps per tier; starting ratio measured behind the loading screen; adaptive DPR (floor 0.75) decided while moving but applied only at rest; `Detail` LOD (booth interiors 22 m, entertainment 40 m; lights fade, never hide); cross-area static batching with colour baking; one-shot shadow map. Preparation before the reveal: textures + batches settle → `compileAsync` (composer variant) → chunked upload render → 8 measured frames → reveal.

### 4.3 Performance budgets (proposed, D-6) and current values
| Metric | Budget | Now | Status |
|---|---|---|---|
| Hero impact / homepage JS | ≈0 KB added | 832 KB raw / 269 KB gz (+8 / +4.3 KB for the client loader gate; no three/R3F) | ✅ (gate is unavoidable) |
| Poster | — | 77 KB desktop / 40 KB mobile, only when near | ✅ |
| Exhibition JS (compressed, loaded with section) | ≤ 300 KB | 313.2 KB gz (FR-1, production build) | ⚠ +4 % — structural, see D-27 |
| Draw calls, overview (desktop) | ≤ 150 | **161** after LR-1 (141 before; the venue is ≈2.5× larger with a sixth booth and branded elements) | ⚠ +7 % — D-34 |
| Draw calls, anchored | ≤ 150 | 68–109 | ✅ |
| Triangles (overview) | ≤ 600 k desktop / 300 k mobile | ≈342 k desktop | ✅ |
| DPR | 1.5 desktop / 1.25 mobile | as budgeted; starting ratio measured at load, adaptive down to 0.75 on slow GPUs, changed only at rest | ✅ |
| Frame time (integrated AMD Radeon Vega, 1600×898 buffer, dev build, adaptive off) | ~16.7 ms ideal | static 21–28 ms, flights mean 27–31 ms, worst cold frame ≤ 61 ms (was 4.3 s); auto-steps down when > 25 ms | ⚠ GPU-bound; real devices untested |
| Shader compiles / GPU uploads / buffer reallocations during flights | 0 | 0 / 0 / 0 (production build, FR-1) | ✅ |
| Frame time in flight (production, 1920 × 1080 cap, adaptive on) | ~16.7 ms ideal | means 17.5–24.9 ms, worst ≤ 45 ms, 0 frames > 50 ms (first flight before FR-1: 79 ms hitches) | ⚠ GPU-bound; real devices untested |
| Main-thread blocking while the 3D loads (homepage) | short tasks | 2.45 s total, longest 455 ms (was 5.34 s / 2.9 s) | ⚠ acceptable behind the loading screen; not zero |
| GPU resources after 2 full tours of all 10 areas | stable | 356 geometries / 91 textures, identical after the 2nd tour | ✅ |

---

## 5. Modelling status
| Area / element | Model | Notes |
|---|---|---|
| Museum | Code (M1) | Approved quality benchmark |
| Stage + amphitheatre | Code (M3) | Lounge row regularised (pre-M4) |
| Corners 1–5 | Code kit (M3/M4) | Plan-slot design sizes × 1.7 (LR-1); stadium miniature is a simplified stand-in |
| Corner 6 Engineering | Code kit, **provisional concept** (LR-1) | No supplied design; marked «تصور مبدئي» in scene and card |
| Corner 7 | removed (LR-1) | Six corners per owner |
| Venue wayfinding / identity | Code (LR-1) | Banners, totems, path-edge lines, pentagon canopy, lockup monolith, lawns |
| Entertainment zone | Code (M4) | Provisional location (D-19); arcade props simplified |
| Scenery | Code (M4) | Positions inferred (F-15) |
| Surroundings (Buildings 70/57, palms, lamps, trees, paving) | Code (M1/M2) | — |
| People | none | D-7 |

Designer GLBs can replace any area through `AreaConfig.modelUrl` without other code changes (proven in M3).

---

## 6. Milestones

| ID | Milestone | Status |
|---|---|---|
| M0 | Discovery & planning | ✅ |
| M1 | Museum quality prototype (GATE 1) | ✅ approved |
| M2 | Masterplan layout + full interaction system | ✅ approved |
| M3 | Stage + booth kit + Media corner, model slots (GATE 2) | ✅ approved |
| M4 | Remaining corners, entertainment zone, scenery; world-anchored cards; chairs | ✅ approved (card behaviour since revised to expand/collapse, done) |
| M5 | Homepage integration & fallback | ✅ approved |
| M6 | Performance, accessibility, device QA → release | ✅ implemented + verified; committed with R1–R4 (`1d9cb38`); release not declared |
| R1–R4 | Entrance swap, entrance-side overview, card Previous/Next, passage route | ✅ committed (`1d9cb38`) |
| **LR-1** | **Owner-directed layout revision (six corners, Engineering concept, expanded grounds, branded wayfinding)** | ✅ implemented + verified — **stopped for visual review** |

### M5 — Homepage integration & fallback (done, awaiting review)
- **Objective:** ship the section directly after the Hero with zero Hero regression.
- **Touchpoints:** `src/app/page.tsx` only: import `ExhibitionSection` and render it between `<Hero />` and `<Manifesto />`. The default `deferMs` is 4500. No edits to `Hero.tsx`, `layout.tsx`, `globals.css` or `Navbar.tsx`.
- **Scope:**
  - Reserved height (no CLS) and deferred load (near-viewport + after the Hero intro).
  - Error boundary, no-WebGL and context-loss fallback to the SSR list.
  - **Poster image:** capture a static frame of the final overview (dev `__exh.snap`), save it as an optimised image under `public/exhibition/`, and show it while loading and in the fallback.
  - Check `ScrollTrigger` positions in `AboutArt`.
  - Check z-index against the topbar and noise overlay.
  - Check reduced-motion and reduced-data behaviour.
  - Decide whether to keep the lab route until M6.
- **Hero safeguards:**
  - `git diff` shows the Hero files untouched;
  - no exhibition chunk or asset is requested before scroll-near (network panel);
  - Lighthouse `/` before/after (LCP/TBT/CLS within noise);
  - Hero intro compared at 0/2/5 s;
  - Hero pointer parallax still works.
- **Acceptance:** spec §8 items 1, 2, 9.
- **Needs from owner:** approved teaser copy (R-10) or explicit approval to ship provisional copy. (Shipped provisional, labelled as such, per the owner's M5 instruction.)
- **Result (2026-10-12):**
  - Inserted in `page.tsx` (only change outside the exhibition folders, plus `public/exhibition/` posters and a `kora-prod` entry in `.claude/launch.json`).
  - Posters captured from the live scene (16:9 and portrait overview poses, PNG → WebP q72 via sharp).
  - Lab route kept until M6 (still noindex, not in sitemap).
  - Found and fixed: fullscreen overlay was stacked under the fixed topbar.
  - Verification: see STATE §3. Not possible here: Lighthouse (not installed) and real-time LCP/TBT (hidden pane pauses painting) → M6.

### M6 — Hardening → release
- **Performance:**
  - Reduce overview draw calls: a texture atlas for fascias, titles and plates; merge the surroundings' instanced sets.
  - Bring JS within 300 KB: lazy-load the entertainment zone and scenery.
  - Merge static meshes for mobile.
- **QA:** device matrix (iOS Safari, Android Chrome, desktop browsers), real-time flight and interrupt checks, touch gestures, throttled network, memory.
- **Accessibility:** WCAG 2.2 AA checks (contrast, focus order, 44 px targets, NVDA/VoiceOver).
- **Release:**
  - Remove or gate the lab route.
  - Optionally remove the Spline deps (D-9).
  - Final docs.
- **Acceptance:** spec §8 item 10 with documented results.

### M6 — Result (2026-10-12)
**Changes made**
- **Draw calls:** static batching now merges meshes that differ only in base colour (colour baked into vertex colours, identical shading), expands small static instanced sets (≤ 40 k vertices), and batches all kit models in one cross-area batch; Surroundings is batched as a whole. Overview 188 → 144, anchored 84–126 → 72–119, triangles unchanged. Pixel diff of the 16:9 overview against the M5 poster frame: mean 0.002/255, 0.001 % of pixels > 24/255 (edge noise).
- **Bug found and fixed:** batching ran on a fixed delay; when an async texture (e.g. the coffee-kiosk skin) arrived later, the baked copy kept the fallback colour (seen as a navy face on the kiosk). Batching now waits for all async textures to settle (`asyncTexturesSettled`).
- **Adaptive resolution:** `AdaptiveResolution` samples frame times only while the scene moves; median > 25 ms → pixel ratio × 0.8 (floor 0.75); < 17.5 ms twice → × 1.15 up to the tier cap. Fed through the Canvas `dpr` prop (R3F re-applies that prop on every Canvas render — found while testing). Verified: 1920×1080 stage at 87 ms steps 1.25 → 0.75 (32 ms); a small stage recovers to 1.25; the value survives re-renders.
- **Accessibility:** skip link moved to directly after the scene in the focus order (was last, after every pin); contrast fixes — card «provisional» label 4.0 → 6.2:1; concept note, poster caption and skip link given a quiet navy backing (≥ 4.99:1 even over bright paving).
- **Release:** lab route returns 404 in production builds unless `EXHIBITION_LAB=1`.
- **Dev tooling:** `__exh.step(ms)` advances GSAP's root clock and renders a frame, so real flights can be verified with a hidden preview pane; `swapModel` exports with `onlyVisible: false` (batched originals are hidden).
- **Tried and reverted:** lazy-loading the entertainment zone and scenery saved only 5.4 KB (3.1 + 2.3 KB gz) and added load-order complexity; the exhibition JS is dominated by three.js + R3F + postprocessing (D-27).

**Remaining limitations (not verifiable here)**
- Real iOS Safari / Android Chrome devices, real touch, NVDA/VoiceOver, Lighthouse, throttled network, frame rate in a visible window.
- Emulated `prefers-reduced-motion` / Save-Data: the preview pane has no media emulation; code reviewed; the reduced-motion camera path is the same `instant` branch that was exercised.
- Exhibition JS 305 KB vs 300 KB budget (D-27).
- Product inputs still open: R-10 copy, D-17 corners 6–7 / slot mapping, D-19 entertainment zone, D-20 booth sizes, R-4, F-15/F-16.

### Post-M6 refinements (2026-10-12, owner request) — done, awaiting review
- **R1 Entrance placement:** `ENTRANCE_ARCH` (layout.ts) now stands on the plan's west "Gate" footprint (x 6.85, z 16.3, plane across Z as before, design unchanged); the gate ghost moved to the arch's former spot (x −2.6, z 24.2, same 1.5 × 9.8 m). Obstacles follow both. The planter gap, stanchions, coffee kiosk and press wall are unchanged.
- **R2 Overview:** camera from the entrance side, behind/above the arch, looking east: the museum's lit plaza facade faces the camera, the stage is seen three-quarter on, booths and the arch in the foreground. Checked at 2.4, 16:9 and portrait (0.6); posters re-captured (85 KB / 43 KB).
- **R3 Card navigation:** Previous / المنظر العام / Next below the card body, outside the collapsible part (so present and focusable when collapsed); `aria-label`s name the destination; focus stays on the same control in the next card, and moves to the scene on Back to overview. Order = `TOUR_ORDER` (D-31).
- **R4 Passage route (implemented):** flights to the entertainment zone from anywhere on the plaza drop into the backstage strip, pass over the passage sign beside the photo booth, run through the tunnel under the banners at ≈3 m (half speed), then rise to the viewpoint (≈6 s total; ordinary flights ≤ 3 s). The tunnel obstacle became a hollow shell so the corridor is checkable; every route is sampled against all obstacles and falls back to the ordinary arc if not clear. Interrupting inside the tunnel continues to the tunnel end being faced, climbs out, then arcs (never through the roof). Reduced motion: instant cut, as before. Cost: ≈0.5 ms planning per flight, no per-frame overhead beyond a spline lookup; JS +1 KB.
- **Also fixed:** denser collision sampling revealed hairline grazes on 2 museum ↔ corner arcs at landscape aspects (pre-existing, missed by the 40-probe `planLift`); `planLift` now probes 240 points and adds 10 % headroom.

### Layout revision LR-1 (2026-10-13, owner request) — done, stopped for visual review
- **Recovery point:** branch `backup/pre-layout-revision` at `1d9cb38` (working tree was clean; nothing else touched).
- **Layout:**
  - **Main path** (6 m) runs east from the entrance arch at x 0 to the amphitheatre at x ≈ 96.
  - **Museum** to the left (north) of the entrance, x 20–48, long facade facing the path; portal at the west end, nearest the entrance.
  - **Corners (6)** in a U to the right (south), open towards the path: west arm Technology / Media (facing east), base Entrepreneurship / Economy & Investment (facing north), east arm Health / Engineering (facing west). The U spans ≈47 m along the path (x 9.5–56.5), comparable to the entrance-to-museum side. A walkway loops along the booth fronts and joins the main path at both arms.
  - **Passage** to the entertainment zone between Buildings 70 and 57 at x 56–62, just beyond the museum (not behind it), reached by a branch path; buildings, passage, tunnel and entertainment zone moved together as one block (relative geometry unchanged).
  - **Stage** closes the east end of the main path, facing west towards arriving visitors; amphitheatre in front of it with the path running into the 2 m aisle.
  - Ground ≈ 144 × 89 m paved (≈2.5× the masterplan-based layout); lawns with palms in the open quarters; branded wayfinding (banners, totems at the junctions, warm path-edge lines, pentagon canopy in the corner courtyard, lockup monolith at the passage branch).
- **Frames:** museum and stage are placed by rotated frames (`MUSEUM_FRAME` π/2, `STAGE_FRAME` −π/2); the seating is defined in the stage frame (`SEATING.localCenter`); booth frames carry `scale: BOOTH_SCALE`. `toWorld` / `boxToWorld` keep collision volumes in sync with rotated/scaled frames.
- **Engineering corner (provisional concept):** navy shell + steel-truss portal in football-goal proportions, blueprint stadium-section back wall and blueprint pitch floor, X-braced open side, stadium miniature cut away, structures panel and analysis kiosk, fascia «ركن الهندسة / ENGINEERING CORNER» with the official lockup, and a «تصور مبدئي · PRELIMINARY CONCEPT» plate; the card note reads «تصور مبدئي مقترح — ليس تصميمًا معتمدًا».
- **Updated with the layout:** camera anchors (museum along its facade from the path, stage from the end of the path, corners ×1.7 with slightly more distance so glow titles fit), hit volumes and labels, collision volumes, tour order (museum → corners 1–6 → stage → entertainment), overview (from behind the arch, south-west, looking along the path to the stage), passage route (approach over the branch path; waypoints relative to the passage), tunnel-exit test points, light focus and shadow frustum (±80 × ±60 m, 4096 map), posters (65 / 33 KB).
- **Found while testing:** the pentagon canopy's first position put the Media/Health viewpoints inside its safety volume at narrow portrait aspects → moved to the courtyard band the viewpoints leave free (x 29–37, z 11–19). The passage route's gaze looked at the horizon from the high overview start → look-ahead now blends in over the first 40 %.
- **Dev note:** Fast Refresh after edits re-mounts instanced meshes without re-running static batching, so the same geometry draws twice (inflated draw calls, invisible in images). Always measure after a full reload.

### LR-2 refinements (2026-10-13, owner request) — done, stopped for review
- **Card controls in the collapsed state** stay inside the bar (collapsed width 300 px; buttons shrink without overflowing).
- **Overview from the entrance side:** camera behind the arch on the main-path axis (−42, 40, 14) → (30, 0, 4); the gate is the first thing seen, then the whole venue. Narrow screens pull back upwards (steeper) and aim 12 m further in, instead of backing into the tree belt.
- **Entering through the main gate:** every flight that starts at the overview comes down behind the arch, passes through its opening at eye height (slowed), then goes on to the destination (for the entertainment zone, on through the passage). The arch is a hollow collision shape (legs + top band); a flight interrupted under the arch continues through it. Gaze looks ≥ 10 m ahead horizontally and never more than ≈31° down (no roll on the steep descent).
- **Guided tour «ابدأ الجولة»:** button at the bottom of the overview. Plays TOUR_ORDER: fly to each stop, hold 9 s with the card expanded, move on; tour bar at the bottom (step n / 9, stop name, hold progress, pause/resume, end). Free navigation stays: any pin / scene / list choice or the overview ends the tour; the card's Previous / Next move the tour along; looking around or folding the card restarts the hold; it pauses while off-screen. The card keeps clear of the bar.
- **Branded loading screen:** until the 3D scene is ready, the official logo file (`kora-main-tight.svg`) assembles from its own pieces (ball panels, then the letters right to left) over the poster, with a coral progress line driven by real stages (code loaded 50 %, scene created 65 %, textures settled 90 %, ready 100 %, slow creep in between) and a status line. Reduced motion: the logo simply appears.
- **Banners:** each banner is two single-sided faces; the front faces arriving visitors (west on the main path), so «كورة» reads correctly from the gate (before: mirrored).
- **Verified:** collision sweep 0 collisions at six aspects (all 9 overview flights take the gate route, 8 area→entertainment flights the passage, 0 tunnel/gate exit problems); gate flight overview → museum 5.7 s, ≤ 0.67 m/frame, frames show the arch face, the pass through the opening and the path with correctly reading banners; tour: start → museum, auto-advance after 9 s → Technology, pause holds, card Next → Media (tour continues), area-list choice ends the tour; collapsed bar 300 px with all three controls inside; loading screen assembles (frames checked mid-animation) and reaches 100 %; posters re-captured (77 / 35 KB). Homepage JS 270.2 KB gz (+0.9 KB for the loading screen in the loader), no 3D code; exhibition JS ≈312 KB.

### Performance pass PF-1 (2026-10-14, owner request) — done, stopped for review

Bottleneck found: transitions froze because of **shader compiles and GPU uploads triggered mid-flight** (lights toggled by `Detail` changed every program key; interiors uploaded on first approach). Steady frames are **GPU-bound** (CPU ≤ 6 ms), half of it post-processing.

1. **Constant light set (`Detail`, `kit/primitives.tsx`).** Lights inside a `<Detail>` now fade to intensity 0 when far instead of being hidden. three.js keys every shader program on the number of lights, so hiding / showing a light forced a recompile of every visible material mid-flight (the multi-second freezes). Meshes in `Detail` are still hidden when far. No visual change (a 0-intensity light adds nothing; measured cost of keeping them: none).
2. **Everything compiled and uploaded behind the loading screen (`ExhibitionExperience.tsx` `onCreated`).** After textures and static batches settle (new `batchesSettled()` signal in `Batched.tsx`), `gl.compileAsync` compiles all programs with an off-screen HalfFloat target bound (the composer's variant — compiling for the canvas produced the wrong tone-mapping/colour-space variants), then one render into a 1×1 target with every object shown and culling off uploads all geometries and textures (booth interiors used to upload on first approach: 100–175 ms stalls). Visibility / culling are restored exactly; lights untouched. Loading-screen labels follow the new stages.
3. **MSAA 4 → 2 on the high tier (`quality.ts`).** Post-processing is about half of GPU time; MSAA 4 → 2 saved 10–15 % GPU per frame with no visible difference in side-by-side captures (MSAA 0 was visibly aliased and was rejected; half-resolution bloom gave no gain and was rejected).
4. **No forced layouts per frame (`ui/AreaPins.tsx`).** The pin / card projector read `offsetWidth` every frame and rewrote styles unconditionally; it now caches sizes via one `ResizeObserver` and only writes changed values.
5. Dev only: `__exh.adaptive(on)` toggles adaptive resolution for equal-condition measurements.

Conditions for every number: lab route, dev build, integrated AMD Radeon (Vega) in the hidden in-app browser, stage forced to 1280×720 CSS → 1600×898 buffer, adaptive resolution **off**, a GPU readback after every frame (so "frame" = real CPU + GPU time), same 7-flight route (overview → museum → corner-1 → corner-4 → corner-6 → stage → entertainment → overview), cold = first pass after a full reload. Flight durations and easing were **not** changed, so every gain below is frame cost, not shorter animations.

| Measure | Before | After |
|---|---|---|
| Shader programs compiled **during** flights (cold pass) | 53 (43 at ready → 96) | **0** (all compiled behind the loading screen) |
| GPU uploads during flights (cold pass) | up to 12 textures + 138 buffers in one frame | **0** |
| Worst frame, cold pass | 339–4258 ms (4.3 s freeze overview → museum, 3.1 s corner-1 → corner-4) | **≤ 61 ms** |
| Worst CPU frame, cold pass | 93–144 ms (lazy uploads) | ≤ 10 ms |
| Frames > 50 ms per flight, cold | many (shader stalls) | 0–2 |
| Mean frame in flight | 26–76 ms | 26.6–30.5 ms |
| Static overview / museum / corner-3 / stage / entertainment (p50) | 31.5 / 28.4 / 30.3 / 26.5 / 19.5 ms | 27.7 / 27.9 / 20.8 / 26.1 / 20.4 ms |
| CPU per frame (submit) | 2–6 ms | 1.5–3 ms |
| Draw calls overview | 161 | 161 (unchanged) |

Note: an earlier harness version reported a 120–260 ms "frame 1" at every flight start; that was a measurement artifact (8 un-synced setup frames drained by the first readback) — with a sync before the flight, frame 1 is 35–55 ms, like the rest.

Remaining bottlenecks:
- **GPU fill is the ceiling:** ≈26–30 ms per frame at 1.44 Mpx on the integrated GPU (≈35 fps) with adaptive resolution off; adaptive resolution (unchanged) lowers DPR while moving when frames exceed 25 ms. About half of that is post-processing (bloom mipmap chain, vignette, AGX tone mapping, HalfFloat buffers); the scene pass is ≈16 ms.
- Draw calls 161 on the overview (budget 150, D-34) — CPU is not the limit (≤ 3 ms submit), so batching further would not change fps here.
- Ready time grows slightly (all compiles/uploads before the reveal; ≈7 s in the hidden dev pane, unmeasured on a production build / visible window).
- Exhibition JS ≈312 KB gz (D-27), unchanged.
- **Real devices untested:** all numbers come from one integrated-GPU laptop in a hidden dev-build pane; phones / visible-window production numbers still need checking.

Verified: tsc ✅, eslint ✅ (only pre-existing `Departments.tsx:19`), build ✅; homepage JS 270.2 KB gz with no 3D code; Hero / layout / globals / brand unchanged vs `1d9cb38`; overview capture matches the approved look.

### Final refinements FR-1 (2026-10-14, owner request) — done, stopped for review

1. **Entrepreneurship signage** (`textures.ts`, `models/FrameCorners.tsx`): the upper glowing title «ركن ريادة الأعمال» was wider than its 1024 px canvas and was cut at both ends. `glowTitleTexture` now shrinks any title that does not fit; the Entrepreneurship title uses a wider canvas (1280 × 256) on a 3.0 × 0.6 m plane, so it stays large and complete. The header plate «من الفكرة إلى الملعب» sat exactly on the canopy front (z-fighting, garbled) and was moved 6 cm forward. No other booth changed (the Media title fits and is unaffected).
2. **Compact cards** (`ui/AreaCard.tsx`, `exhibition.css`, `areas.ts`, `types.ts`): the card now shows only the area name (the expand/collapse toggle), **one short Arabic teaser question** (new `content.question`, provisional, one per area) and Previous / المنظر العام / Next. Eyebrow, long teaser, tags and the provisional note left the card; it is 320 px wide (300 px on phones) and ≈170 px tall instead of 380 × ≈330. Still world-anchored, expanded on every arrival, collapses to the 300 px name bar with the navigation (≈107 px tall) and expands on tap. The longer descriptions stay in `content.teaser`, used by the text area list under the stage (screen readers, no-3D fallback) and the homepage sections that follow; the provisional / concept / placement notes moved into that list (`ExhibitionSection.tsx`). The live region announces "name: question".
3. **Manual guided tour** (`ExhibitionExperience.tsx`): «ابدأ الجولة» flies to the first stop (museum) and shows a small bar (step n / 9, stop name, «تابِع بزر «التالي» في البطاقة», «إنهاء الجولة»). No timers, countdowns, hold progress, pause or automatic moves remain (`TOUR_DWELL_MS`, the progress bar and its CSS were removed). The visitor advances only with the card's Next / Previous; free selection (scene, labels, area list) stays unrestricted and keeps the tour, whose step follows the current stop; returning to the overview or «إنهاء الجولة» ends it.
4. **First-flight stutter — cause and fix** (`scene/AdaptiveResolution.tsx`, `ExhibitionExperience.tsx`): profiled in a production build (`next start`). At laptop size (1536 × 864 CSS stage, 1920 × 1080 buffer) adaptive resolution stepped the pixel ratio down **twice during the very first flight** (1.25 → 1.0 → 0.8). Each step resizes the canvas and reallocates every post-processing buffer (17 textures + the MSAA renderbuffers): 79 ms hitches plus a visible jump in sharpness mid-flight. Small stages (≈1 Mpx) never adapted and showed no stutter. Fix, without touching the animation: (a) the starting pixel ratio is measured behind the loading screen from 8 real frames (median of the last 5) and set before the reveal (`startingScale`: √(22 ms / measured) × cap, floor 0.75); (b) adaptive resolution never resizes mid-motion — a decision waits until no frame has rendered for 180 ms (camera at rest), is one decisive step based on the measured frame time, and never steps back up to a ratio already found too slow (no see-saw between arrivals).
5. **Main-thread freeze while the 3D loads** (found by the production validation, `ExhibitionExperience.tsx`): the R3F render loop now stays off (`frameloop="never"`) until the scene is prepared. Before, the first automatic frame compiled every visible shader synchronously (3.4 s in one task) before the async pre-compile could run. The upload render is split into 6 chunks and every preparation step yields to the page (MessageChannel), so scrolling continues while the 3D prepares behind the loading screen.
6. **Profiling build** (`next.config.ts`): `EXH_PROFILE=1` (with `EXHIBITION_LAB=1`) keeps the `window.__exh` hook in a production build for measurements; `next.config` always inlines the flag, so a normal build contains no hook code (verified: 0 chunks).

Conditions: production build (`next start`), integrated AMD Radeon (Vega), built-in browser pane (hidden; frames driven by `__exh.step` with a GPU readback after every frame, so a frame = real CPU + GPU time), adaptive resolution **on** as visitors get it. Flight durations and easing unchanged (overview → museum: 323–326 frames before and after), so gains are frame cost, not shorter animations.

| Measure (production build) | Before | After |
|---|---|---|
| First flight overview → museum, 1536 × 864 stage: pixel-ratio changes mid-flight | 2 (1.25 → 1.0 → 0.8) | **0** (starts at the measured 0.87–0.97) |
| — buffer reallocations / shader compiles / uploads during the flight | 2 × (17 textures + MSAA buffers) / 0 / 0 | **0 / 0 / 0** |
| — worst frame · frames > 50 ms · mean | 79.1 ms · 3 · 25.8 ms | **40.8–45.1 ms · 0** · 22.3–24.9 ms |
| Same flight, small stage 1009 × 660 (no adaptation needed) | max 38.8 ms, mean 22.2 ms, 0 changes | unchanged path (≈ same) |
| Full route (7 flights incl. return to overview), 1536 × 864 | — | 0 frames > 50 ms; worst 27.9–45.1 ms; means 17.5–24.9 ms; 0 reallocations / compiles / uploads in flight; ratio settles at 0.75–0.86, changed only at rest |
| Homepage, 3D loading after scrolling in (1009 × 660 stage): main-thread long tasks | 5.34 s total, longest **2.9 s** | 2.45 s total, longest **455 ms** |
| — ready after the stage enters the viewport (localhost) | 7.3 s | 6.0 s |
| Homepage JS before the 3D (gz) | 270.2 KB, no 3D code | 270.2 KB, no 3D code |
| Exhibition JS (lazy, gz) | ≈312 KB | 313.2 KB (3 files; questions + tour/adaptive code) |

Still views after the route (production, ratio 0.83, 1536 × 864): overview 13.9 · museum 20.8 · corner-3 19.1 · stage 20.9 · entertainment 14.2 ms (p50).

Remaining limitations:
- **Not measured on real devices or in a visible window.** All numbers come from one integrated-GPU laptop in a hidden browser pane (rAF paused; frames driven by `__exh.step`). Phones, other GPUs, Safari and a real visible-window frame rate remain owner-side checks.
- **GPU-bound:** ≈18–25 ms per frame while flying at 1536 × 864 on this GPU, so adaptive resolution settles at 0.75–0.86 there; about half of GPU time is post-processing (bloom chain, vignette, AGX, HalfFloat). Lighter post-processing would change the approved look — not done.
- **A resolution change can still happen once at rest** after the first flight (e.g. 0.87 → 0.79) — no hitch, but a slight sharpness change on a still view.
- **Load still costs ≈2.4 s of main-thread work** in ≤ 455 ms tasks (scene construction ≈0.35 s, program finalisation and uploads per chunk 0.2–0.45 s). Scrolling continues between tasks but can stutter briefly while the loading screen is up.
- Lighthouse is not installed here; LCP/TBT not measured with it (homepage JS and long tasks measured directly instead).
- Overview draw calls: 161 in dev at 16 : 9 (D-34); the production still-view sample read 85 at 1536 × 864 — not investigated, treat 161 as the reference.
- Exhibition JS 313.2 KB gz vs the 300 KB budget (D-27).

Verified: tsc ✅; eslint ✅ (only pre-existing `Departments.tsx:19`); `npm run build` ✅; homepage 270.2 KB gz / 11 chunks, no three/R3F; no `__exh` code in a normal build; Hero / page / layout / globals / brand unchanged vs `1d9cb38`. Browser (dev + prod): Entrepreneurship title complete and plate clean (render before/after); card 320 × 170 expanded / 301 × 107 collapsed with all three controls inside, re-expands, phone 288 × 135 inside the stage and clear of the tour bar; tour: start → museum (1 / 9), no change after 12 s, Next → Technology (2 / 9), free pick of the stage → 8 / 9, overview ends it.

### UX fixes FR-2 (2026-10-14, owner request) — done, stopped for review

1. **Card title clipping** (`exhibition.css`): the name in the card header was `nowrap` + ellipsis, so «ركن الاقتصاد والاستثمار» was cut at the desktop size (22 px). It now wraps (`white-space: normal`, balanced lines, `min-width: 0` beside the fixed chevron; title line-height 1.35 for Arabic). Measured: 1440 × 900 → name 238 × 57 px on two complete lines, no overlap with the chevron; collapsed (16 px) one line; 375 px phone → one line, card 288 × 135 inside the stage, no horizontal overflow.
2. **Tour simplified** (`ExhibitionExperience.tsx`, `ui/AreaCard.tsx`, `areas.ts`, `ui/AreaPins.tsx`, `exhibition.css`): the tour status bar (step n / 9, stop name, hint, «إنهاء الجولة»), the `touring` / `tourStep` / `tourNote` state, the card's bottom inset for the bar and the bar CSS were removed. «ابدأ الجولة» simply flies to the first stop of `TOUR_ORDER` (museum). `tourNeighbours` is now **linear**: no Previous on the museum (first), no Next on the entertainment zone (last); the card renders only the controls that exist, so the last stop shows Previous + المنظر العام only, and nothing wraps in either direction. Keyboard focus after Next / Previous falls back to the remaining control at either end. Scene, labels and the area list are unchanged (unrestricted).

Verified (dev, lab route): «ابدأ الجولة» → museum, card controls [overview, next], no tour bar; Next → «ركن التقنية» with focus on Next; stage → Next → «منطقة الترفيه», controls [prev, overview], focus on Previous; title checks above. tsc ✅; eslint ✅ (only pre-existing `Departments.tsx:19`); `npm run build` ✅; homepage 270.2 KB gz / 11 chunks, no three/R3F; exhibition JS 313.0 KB gz, no `__exh` hook; Hero / page / layout / globals / brand unchanged vs `1d9cb38`.

**Release readiness:** technically ready for owner review on the `newV` branch. Not declared production-ready: needs owner approval, real-device QA (list above) and a decision on shipping provisional content.

---

## 7. Hero protection rules (every milestone)
1. Never edit `Hero.tsx`, the Hero CSS (`.hero-*`, `.field-*`, `body:has(.hero-field) .topbar`), `layout.tsx` or `public/assets/brand/*`.
2. `page.tsx` changes only in M5, and only to insert the section.
3. No global listeners that `preventDefault` or alter scroll.
4. Exhibition JS stays a separate dynamic chunk; check the homepage chunks after every build.
5. Every milestone confirms `git diff` on the Hero, page, layout, globals and public files is empty, except the planned M5 insertion.

## 8. Verification toolkit
`npx tsc --noEmit` · `npx eslint` · `npm run build` (+ the homepage chunk audit described in STATE) · `npm run dev` with the built-in browser preview (`.claude/launch.json` → `kora-dev`) · dev-only `window.__exh` hook · production profiling: `EXHIBITION_LAB=1 EXH_PROFILE=1 npx next build` then `kora-prod` (port 3100) — rebuild normally afterwards. Details, quirks and recipes are in STATE ("How to verify").

## 9. Decisions register
| ID | Decision | Status |
|---|---|---|
| D-1 | Dependencies (three, R3F 9, postprocessing) | ✅ Done |
| D-2 | Lab route `/lab/exhibition` | ✅ Done; kept through M5 for QA; remove/gate in M6 |
| D-3 | CC0 downloads | Not needed so far (all procedural) |
| D-4 | gltf-transform + decoders | Only when designer GLBs arrive |
| D-5 | Masterplan orientation over satellite | ✅ Applied |
| D-6 | Performance budgets §4.3 | Provisional; 1 deviation left (JS, D-27) |
| D-7 | No people | ✅ Approved |
| D-8 | Rename references | Not applied (optional) |
| D-9 | Remove unused Spline deps | ⏳ Still awaiting separate approval (not touched in M6; dependency changes need sign-off) |
| D-10 | 10 selectable areas | ✅ Approved |
| D-11 | Media corner first | ✅ Done |
| D-12 | Designer involvement | Optional; kit stand-ins in place |
| D-13 | Provisional museum sides | ✅ Implemented |
| D-14 | Neutral third-party replacements | ✅ Approved (F-16) |
| D-15 | Museum orientation per render | ✅ Approved (for now) |
| D-17 | Slot ↔ corner mapping; corners 6–7 | ⏳ Owner input needed |
| D-18 | Control booth omitted | ✅ Approved |
| D-19 | Entertainment zone location | ⏳ Provisional, owner input needed |
| D-20 | Booth dimensions | ⏳ Plan sizes meanwhile |
| D-21 | Stone tiers + lounge row | ✅ Applied (implicitly approved with M3/M4) |
| D-22 | Code kit vs designer GLBs | ✅ Code kit + stand-ins |
| D-23 | Cards expand/collapse (spec v1.2) | ✅ Approved and implemented |
| D-24 | Loader nearness margin 80% → 40% (on the homepage 80% would load the 3D 4.5 s after page load without any scroll, doing scene work while the Hero is on screen); poster covers the gap | ✅ Applied in M5 (routine) |
| D-25 | Ship provisional copy on the homepage, labelled as provisional | ✅ Per owner's M5 instruction; final copy still R-10 |
| D-26 | Adaptive DPR (floor 0.75) on slow GPUs while moving; capable devices unchanged | ✅ Applied in M6 (routine) |
| D-27 | Exhibition JS budget: 305 KB vs 300 KB. three.js core + R3F (imports the whole THREE namespace) + postprocessing make up nearly all of it. Options: accept / raise the budget to 310 KB, or a large refactor away from R3F (not recommended) | ⏳ Owner decision |
| D-28 | Lab route gated (404 in production unless EXHIBITION_LAB=1) rather than deleted, to keep a QA harness | ✅ Applied in M6 |
| D-29 | Entrance = the plan's west "Gate" footprint; arch moved there, gate ghost moved to the arch's former spot (same footprints) | ✅ Owner instruction (R1) |
| D-30 | Overview from the entrance side: position (−13, 35, 38) → target (28, 0, 19); portrait pulls back automatically | ✅ R2 (framing chosen after 5 renders) |
| D-31 | Tour order: corners 1→7, museum, stage, entertainment; wraps at both ends | ✅ R3 (routine; one constant `TOUR_ORDER`) |
| D-32 | Passage route implemented (optional R4): spline through the tunnel, collision-checked with arc fallback, tunnel-exit route for interruptions | ✅ R4 |
| D-33 | LR-1 revised layout (spec §4.4) supersedes masterplan positions; Buildings 70/57 + passage + entertainment zone moved as one block | ✅ Owner direction |
| D-34 | Overview draw calls 161 vs 150 after LR-1 (≈2.5× venue, sixth booth, branded elements; cheap merges applied). Accept, or trade branded elements / bloom passes | ⏳ Owner decision |
| D-35 | Booths enlarged uniformly ×1.7 (keeps design proportions) rather than stretching slot sizes | ✅ LR-1 (routine) |
| D-36 | Engineering corner = provisional concept in the corners' design language, marked in scene and card | ✅ Owner direction (design to be confirmed) |
| D-37 | Recovery point = branch `backup/pre-layout-revision` (`1d9cb38`) | ✅ LR-1 |
| D-38 | Guided tour: 9 s hold per stop, ends on any direct choice, card Previous/Next continue it | ✅ LR-2 (routine) |
| D-39 | Loading screen animates the official logo SVG's own paths (no redrawing); progress from real stages | ✅ LR-2 |
| D-40 | All camera route choices centralised in `planRoute` (gate / passage / exits / arc), shared with the dev collision sweep | ✅ LR-2 |
| D-41 | Fixed light set: far `Detail` lights fade to 0 instead of hiding; all programs compiled and all GPU resources uploaded before the reveal | ✅ PF-1 |
| D-42 | MSAA 2 on the high tier (was 4): −10–15 % GPU, no visible difference | ✅ PF-1 (routine) |
| D-43 | Compact card: name + one short question + navigation; descriptions and provisional notes move to the area list / following sections | ✅ FR-1 (owner request) |
| D-44 | Manual guided tour: no timers; Next / Previous only; free selection keeps the tour; overview ends it | ✅ FR-1 (owner request) |
| D-45 | Starting pixel ratio measured behind the loading screen; adaptive changes applied only at rest, one decisive step, never back up to a ratio found slow | ✅ FR-1 |
| D-46 | Render loop off until the scene is prepared; preparation split into yielding tasks | ✅ FR-1 |
| D-47 | `EXH_PROFILE=1` production profiling build (hook kept); flag always inlined by `next.config`, so normal builds drop the hook | ✅ FR-1 (routine) |
| D-48 | Teaser questions written by Claude as provisional copy (R-10 still open) | ⏳ Owner to approve or replace |
| D-49 | No tour mode: «ابدأ الجولة» only flies to the first stop; tour bar / counter / end button removed (supersedes D-38, D-44) | ✅ FR-2 (owner request) |
| D-50 | Linear card sequence ending at the entertainment zone; no wrap; first stop has no Previous, last has no Next | ✅ FR-2 (owner request; hiding Previous on the first stop follows from "no wrap") |

## 10. Update log
| Date | Change |
|---|---|
| 2026-10-14 | FR-2: card titles wrap (no clipping); tour UI/state removed, «ابدأ الجولة» → first stop, linear Previous / Next ending at the entertainment zone; spec v1.7; D-49–D-50. |
| 2026-10-14 | FR-1: Entrepreneurship title/plate fixed, compact question cards, manual tour, first-flight stutter fixed (starting resolution + no resizes in motion), load no longer freezes the page (render loop gated, chunked uploads), production validation recorded; spec v1.6; D-43–D-48. |
| 2026-10-14 | PF-1 performance pass: no shader compiles / uploads during flights (worst cold frame 4.3 s → ≤ 61 ms), MSAA 4 → 2, pin projector without forced layouts; D-41–D-42. |
| 2026-10-13 | LR-2: entrance-side overview + gate entry flights, guided tour, branded loading screen, collapsed-card fix, banner orientation fix; spec v1.5; D-38–D-40. |
| 2026-10-13 | v1.0: layout revision LR-1 — owner-directed venue layout (spec v1.4), six corners in a U with Engineering as a provisional concept, booths ×1.7, expanded grounds with lawns, branded wayfinding (`Venue.tsx`), rotated museum/stage frames, passage moved beyond the museum with the buildings, route/anchors/collisions/tour/overview/posters updated. D-33–D-37. |
| 2026-10-12 | v0.9: post-M6 refinements R1–R4 (arch ↔ gate swap, entrance-side overview + new posters, card Previous/Overview/Next, passage route to the entertainment zone with tunnel exit); planLift sampling densified (40 → 240 probes, +10 % headroom) after denser checks found grazes; spec v1.3. |
| 2026-10-12 | v0.8: M5 approved; M6 implemented — batching with colour baking + cross-area batch (188 → 144 calls), async-texture batching fix, adaptive DPR, a11y fixes (skip-link order, contrast), lab route gated, real-flight verification via `__exh.step`. D-26–D-28 added. |
| 2026-10-12 | v0.7: M5 implemented — section on the homepage after the Hero, posters, fallback hardening (poster + list, noscript, ScrollTrigger refresh), fullscreen stacking fix, loader margin 40% (D-24), provisional copy shipped (D-25). |
| 2026-10-12 | v0.6: M4 approved. Cards changed from close/reopen to expand/collapse (spec v1.2); "معلومات المنطقة" button removed. Roadmap consolidated: stale statuses and superseded card rules removed, architecture and budgets brought to as-built, decisions register cleaned. |
| 2026-10-12 | v0.5: M3 approved; spec v1.1 (world-anchored cards); chairs regularised; M4 implemented (corners 1, 3, 4, 5, entertainment zone, scenery, LOD). |
| 2026-10-12 | v0.4: M2 approved; south row set back; M3 implemented (model slots + GLB swap, stage, booth kit, Media corner, batching). |
| 2026-10-12 | v0.3: M1 approved; M2 implemented (layout, 10 areas, placeholders, panel, pins, fullscreen, obstacle-aware flights). |
| 2026-10-12 | v0.2: owner decisions; M1 implemented. |
| 2026-10-12 | v0.1: discovery (M0). |
