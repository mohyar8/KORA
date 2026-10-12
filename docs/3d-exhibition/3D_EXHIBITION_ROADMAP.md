# KORA 3D Exhibition — Implementation Roadmap

**Status:** v0.7 (2026-10-12) — M0–M4 approved; M5 (homepage integration & fallback) **implemented and verified, awaiting owner review**; next: M6.
**Authoritative spec:** [`3D_EXHIBITION_SPEC.md`](./3D_EXHIBITION_SPEC.md) **v1.2**. This roadmap never overrides it; conflicts are logged in §9.
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
- **Placement:** take positions from the masterplan and references; the full PDF is not required while the references suffice.
- **Earlier recommendations approved as a batch:**
  - D-7: no people for now.
  - D-11: Media corner first.
  - D-14: neutral replacements for third-party marks.
  - D-17: provisional slot mapping.
  - D-18: control booth omitted.
  - D-19: entertainment zone provisional.
  - R-8: stage without the render's background building.
  - GATE 2 recommendations: keep plan booth sizes; code kit for shells and scenery; simplified stand-ins for complex props.
- **Layout:** south booth row (slots 3–5) and its palms set back so slots 2 and 7 have clear fronts.
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

Everything else is inferred and tagged in `layout.ts`. Plan px → m: `x = (px − 80)/16.4`, `z = (py − 185)/14` on the 1056 × 1516 image.

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
src/app/lab/exhibition/page.tsx      Temporary noindex lab route (filler above/below, deferMs 0). Kept for M6 QA; remove/gate in M6.
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
                           dev-only window.__exh hook.
  exhibition.css           All styles, scoped .exh-*.
  camera/rig.ts            Poses (anchor/overview, aspect fit, portrait tilt), flightPoint + planLift.
  camera/CameraRig.tsx     Overview ⇄ anchored state machine, interruptible GSAP flights, damped clamped look.
  camera/obstacles.ts      Solid volumes for flight clearance (buildings, museum, stage, seating, booths, gate, scenery).
  scene/quality.ts         Quality tiers (high / mobile).
  scene/textures.ts        Canvas textures, signage from official PNGs, lockups, plates, ray screens.
  scene/Atmosphere.tsx, Lighting.tsx, Ground.tsx, Surroundings.tsx   Sky/env, lights + bloom/AgX, paving, campus context.
  scene/AreaModels.tsx     Model slots: per-area frame; code kit or GLB (modelUrl / dev override), kit fallback.
  scene/Museum.tsx         Museum exterior (M1).
  scene/models/Stage.tsx                Stage + amphitheatre + lounge row.
  scene/models/MediaCorner.tsx          Slot 2.
  scene/models/NavyShellCorners.tsx     Slots 1 (Technology) and 4 (Economy & Investment).
  scene/models/FrameCorners.tsx         Slots 3 (Entrepreneurship) and 5 (Health).
  scene/models/EntertainmentZone.tsx    Entertainment zone.
  scene/Scenery.tsx        Entrance arch, passage tunnel + banners, photo booth, coffee kiosk, press wall, stanchions.
  scene/Placeholders.tsx   Ghost massings for unmodelled areas (now slots 6–7 + gate), 3 draw calls.
  scene/HitTargets.tsx     Raycast-only volumes per area + building blockers.
  scene/Batched.tsx        Static batching of same-material meshes (delayed until async textures exist).
  scene/kit/primitives.tsx Struts/truss, Instanced, tubes/arcs, Detail (distance LOD), useDispose.
  scene/kit/booth.tsx      Booth kit: walls, on-wall placement, chamfer/octagon frames, Plate, Screen, TripodCamera.
  scene/kit/panels.ts      Own panel graphics (dashboard, map, funnels, infographic, playfields, arch face, skins).
  scene/useAsyncTexture.ts Async texture hook.
  ui/AreaCard.tsx          World-anchored card; expand/collapse (accordion pattern).
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
  - **Collapse:** the whole title row is an `aria-expanded` toggle; the body and eyebrow fold away with a 0.32 s grid-rows animation, and the card narrows to a 250 px bar at the same anchor. Reduced motion → no animation. The body is `inert` while collapsed.
- **Loading:** nothing (JS or poster) before near-viewport; 3D also not before `deferMs`; poster while loading; SSR text list always present; failure / context loss / no WebGL / Save-Data → dimmed poster + message + visible text list; `<noscript>` reveals the list.
- **Fullscreen stacking:** while fullscreen, `.exh-stage` is lifted to z 100 (via `:has`) so the fixed overlay covers the topbar (z 60) and noise overlay (z 90); before M5 the isolated stage kept it below the topbar.
- **Performance:** frameloop `demand` / `never` off-screen; DPR caps per tier; `Detail` LOD (booth interiors 22 m, entertainment 40 m); static batching; one-shot shadow map.

### 4.3 Performance budgets (proposed, D-6) and current values
| Metric | Budget | Now | Status |
|---|---|---|---|
| Hero impact / homepage JS | ≈0 KB added | 832 KB raw / 269 KB gz (+8 / +4.3 KB for the client loader gate; no three/R3F) | ✅ (gate is unavoidable) |
| Poster | — | 77 KB desktop / 40 KB mobile, only when near | ✅ |
| Exhibition JS (gz, loaded with section) | ≤ 300 KB | ≈301 KB | ⚠ M6 |
| Draw calls, overview (desktop) | ≤ 150 | ≈188 | ⚠ M6 |
| Draw calls, anchored | ≤ 150 | 84–126 | ✅ |
| Triangles (overview) | ≤ 600 k desktop / 300 k mobile | ≈320 k desktop / ≈200 k mobile | ✅ |
| DPR | 1.5 desktop / 1.25 mobile | as budgeted | ✅ |

---

## 5. Modelling status
| Area / element | Model | Notes |
|---|---|---|
| Museum | Code (M1) | Approved quality benchmark |
| Stage + amphitheatre | Code (M3) | Lounge row regularised (pre-M4) |
| Corners 1–5 | Code kit (M3/M4) | Adapted to plan slots (D-20); stadium miniature is a simplified stand-in |
| Corners 6–7 | Placeholder | Blocked on D-17 |
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
| M5 | Homepage integration & fallback | ✅ implemented + verified — **awaiting owner review** |
| **M6** | **Performance, accessibility, device QA → release** | **Next** (after M5 review) |

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

---

## 7. Hero protection rules (every milestone)
1. Never edit `Hero.tsx`, the Hero CSS (`.hero-*`, `.field-*`, `body:has(.hero-field) .topbar`), `layout.tsx` or `public/assets/brand/*`.
2. `page.tsx` changes only in M5, and only to insert the section.
3. No global listeners that `preventDefault` or alter scroll.
4. Exhibition JS stays a separate dynamic chunk; check the homepage chunks after every build.
5. Every milestone confirms `git diff` on the Hero, page, layout, globals and public files is empty, except the planned M5 insertion.

## 8. Verification toolkit
`npx tsc --noEmit` · `npx eslint` · `npm run build` (+ the homepage chunk audit described in STATE) · `npm run dev` with the built-in browser preview (`.claude/launch.json` → `kora-dev`) · dev-only `window.__exh` hook. Details, quirks and recipes are in STATE ("How to verify").

## 9. Decisions register
| ID | Decision | Status |
|---|---|---|
| D-1 | Dependencies (three, R3F 9, postprocessing) | ✅ Done |
| D-2 | Lab route `/lab/exhibition` | ✅ Done; kept through M5 for QA; remove/gate in M6 |
| D-3 | CC0 downloads | Not needed so far (all procedural) |
| D-4 | gltf-transform + decoders | Only when designer GLBs arrive |
| D-5 | Masterplan orientation over satellite | ✅ Applied |
| D-6 | Performance budgets §4.3 | Provisional; 2 deviations → M6 |
| D-7 | No people | ✅ Approved |
| D-8 | Rename references | Not applied (optional) |
| D-9 | Remove unused Spline deps | M6, separate approval |
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

## 10. Update log
| Date | Change |
|---|---|
| 2026-10-12 | v0.7: M5 implemented — section on the homepage after the Hero, posters, fallback hardening (poster + list, noscript, ScrollTrigger refresh), fullscreen stacking fix, loader margin 40% (D-24), provisional copy shipped (D-25). |
| 2026-10-12 | v0.6: M4 approved. Cards changed from close/reopen to expand/collapse (spec v1.2); "معلومات المنطقة" button removed. Roadmap consolidated: stale statuses and superseded card rules removed, architecture and budgets brought to as-built, decisions register cleaned. |
| 2026-10-12 | v0.5: M3 approved; spec v1.1 (world-anchored cards); chairs regularised; M4 implemented (corners 1, 3, 4, 5, entertainment zone, scenery, LOD). |
| 2026-10-12 | v0.4: M2 approved; south row set back; M3 implemented (model slots + GLB swap, stage, booth kit, Media corner, batching). |
| 2026-10-12 | v0.3: M1 approved; M2 implemented (layout, 10 areas, placeholders, panel, pins, fullscreen, obstacle-aware flights). |
| 2026-10-12 | v0.2: owner decisions; M1 implemented. |
| 2026-10-12 | v0.1: discovery (M0). |
