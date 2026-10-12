# KORA 3D Exhibition — State (resume here)

**Last updated:** 2026-10-12 · **Branch:** `newV` · **Spec:** v1.3 · **Roadmap:** v0.9

A new session should read, in order:
1. This file.
2. [`3D_EXHIBITION_SPEC.md`](./3D_EXHIBITION_SPEC.md): product rules. Authoritative; never change it without the owner.
3. [`3D_EXHIBITION_ROADMAP.md`](./3D_EXHIBITION_ROADMAP.md): findings, architecture, decisions, M6 result and release readiness.
4. The repo `AGENTS.md`: this Next.js version differs from training data, so read `node_modules/next/dist/docs/` before writing Next code.

---

## 1. Where things stand

| Milestone | Status |
|---|---|
| M0 Discovery | ✅ |
| M1 Museum prototype (GATE 1) | ✅ approved |
| M2 Layout + interactions | ✅ approved |
| M3 Stage, booth kit, Media corner, model slots (GATE 2) | ✅ approved |
| M4 Remaining corners, entertainment zone, scenery, world-anchored cards, chairs | ✅ approved |
| Card expand/collapse change (spec v1.2) | ✅ done and verified (see §3) |
| M5 Homepage integration & fallback | ✅ approved |
| M6 Hardening → release | ✅ implemented and verified (owner review pending) |
| **Post-M6 refinements R1–R4** (entrance swap, entrance-side overview, card Previous/Next/Overview, passage route) | ✅ implemented and verified — **awaiting owner review.** Not declared production-ready; nothing committed or deployed. |

**Git:**
- Committed by the owner: M1 `f7aabfa`, M2 `264fa21`, M3 `b0dc63e`, M4 + M5 `5a1b6cf`.
- **Uncommitted:** all M6 work, the post-M6 refinements (roadmap §6) and the doc updates. Don't commit or deploy unless the owner asks.
- `.serena/` (tool folder, untracked) is not ours and should be left alone.

**Where the exhibition runs today:** on the homepage, directly after the Hero (`src/app/page.tsx`, default `deferMs` 4500), and on the lab route `/lab/exhibition` (noindex, `deferMs` 0) in development only — production builds return 404 there unless built with `EXHIBITION_LAB=1`.

## 2. What exists (summary; full file map in roadmap §4.1)

- **Areas (10 selectable):**
  - Museum (code model, the approved quality benchmark).
  - Stage + amphitheatre with a regular lounge row facing the stage.
  - Corners 1 Technology, 2 Media, 3 Entrepreneurship, 4 Economy & Investment, 5 Health: code kit, adapted to plan slot sizes. The slot mapping is provisional.
  - Corners 6–7: translucent placeholders «ركن قيد التأكيد».
  - Entertainment zone: code model, provisional location north of the passage between Buildings 70 and 57.
- **Scenery (not selectable, positions inferred):** entrance arch, passage light tunnel + banners, photo booth, coffee kiosk, press wall, stanchions. Also Buildings 70/57, paving, palms, lamps and trees.
- **Interaction:**
  - Overview → select via 3D click, in-scene pins, or the «مناطق المعرض» panel (RTL drawer / mobile bottom sheet).
  - Obstacle-aware cinematic flight → clamped look-around (drag / horizontal swipe / arrow keys).
  - Escape order: panel → fullscreen → selection.
  - Optional mobile fullscreen; "تخطَّ المعرض" skip link.
- **Card (spec §3.4 v1.2):**
  - World-anchored at `cardAnchor(area)`, hanging below the anchor point; moves with the world, hides while the anchor is out of frame.
  - Expanded on every arrival.
  - The title row is the toggle: collapse → 250 px bar (name + chevron) at the same anchor; click/tap → expand.
  - 0.32 s grid-rows animation (none under reduced motion).
  - Pins stay clickable above it. No "معلومات المنطقة" button any more.
- **Content:** all teaser copy is provisional and labelled so in the cards. Third-party marks are neutralised.
- **Loading / fallback (M5):** nothing requested before the section is within 40% of a viewport; then the poster (`public/exhibition/poster.webp`, `poster-mobile.webp` ≤ 767 px) shows with «جارٍ تجهيز المعرض…» and caption «صورة من التصور المبدئي للمعرض», and cross-fades out ~400 ms after the scene's first frames. No WebGL2 / error / context loss / Save-Data → dimmed poster + message, area list revealed below (ScrollTrigger refreshed). No JS → `<noscript>` message + list.
- **Fullscreen:** the stage is raised to z 100 while fullscreen, so the overlay covers the topbar.

## 3. Last verification (2026-10-12, post-M6 refinements)

| Check | Result |
|---|---|
| `tsc` / `eslint` / `next build` | ✅ / ✅ only pre-existing `Departments.tsx:19` / ✅ |
| Homepage JS | 269.3 KB gz, unchanged; no three/R3F. Hero / page / layout / globals / navbar / brand: `git diff` empty |
| Exhibition JS | ≈306 KB gz (+1 KB) |
| Entrance placement | ✅ arch rendered on the former gate footprint (x 6.85, z 16.3), face towards the overview camera; gate ghost at x −2.6, z 24.2 (visible in the portrait overview) |
| Overview framing | ✅ renders at 2.4 : 1, 16 : 9 and portrait 0.6: museum facade, stage, seating, booths, ghosts and arch all in frame; posters re-captured |
| Draw calls | overview 141; anchored 83–117 (sampled: entertainment 83, museum 89, stage 94, corner-1 117) |
| Collision sweep (`checkFlights`, 200 samples/flight) | ✅ 0 collisions at 2.4 / 16:9 / 1.2 / 0.8 / 0.58 / 0.46 — 110 pairs each; passage route used from all 10 origins; 66 tunnel-exit cases per aspect (3 tunnel points × 2 headings × 11 targets) clear |
| Passage route, real GSAP time (`step`) | ✅ overview → entertainment arrives in 6.0 s, ≤ 0.81 m/frame; frames show descent → mouth with photo booth and sign → tunnel with banners → zone; card expanded |
| Interrupt inside the tunnel | ✅ switched to corner 3 at z −11.3: continued north, left the tunnel at y ≈ 4.7, climbed and arced; ≤ 0.71 m/frame; correct card |
| Card navigation | ✅ Next ×10 from corner 1: 1→2→3→4→5→6→7→museum→stage→entertainment→1 (wraps); Previous wraps back; focus stays on Next/Previous in the new card; collapsed bar 250 × 109 with all three 34 px controls (not inert); Next from collapsed → next card expanded; Overview → overview, card removed, focus on the scene |
| Mobile 375 × 812 | ✅ card 300 wide inside the stage, no horizontal overflow |

**Not verifiable here:** same list as M6 (real devices, screen readers, Lighthouse, visible-window frame rate). The preview pane served stale/zoomed captures for some mobile/tablet screenshots — DOM metrics were used instead.

## 3c. M6 verification (2026-10-12)

**Actually tested** (dev server + `next start` in the built-in preview pane; integrated AMD Radeon GPU, Windows):

| Check | Result |
|---|---|
| `npx tsc --noEmit` / `npx eslint` / `npm run build` | ✅ / ✅ only pre-existing `Departments.tsx:19` / ✅ |
| Homepage initial JS | 832 KB raw / 269.3 KB gz — unchanged since M5; no three/R3F |
| Exhibition JS (served compressed, `next start`) | 305.2 KB (budget 300 → D-27) |
| At rest on `/` (prod, 6 s, no scroll) | ✅ no exhibition JS, no poster requested |
| `/lab/exhibition` in prod | ✅ 404 |
| Draw calls (desktop, dev) | overview **144** (was 188); anchored 72–119 (was 84–126); triangles ≈319 k unchanged |
| Visual parity after batching changes | ✅ pixel diff vs M5 poster frame: mean 0.002/255, 0.001 % px > 24/255 — posters still valid |
| Real GSAP flights via `__exh.step` (60 fps steps) | ✅ overview→museum arrives frame 190 (3.2 s), overview→Health 140; max 1.3 m/frame; card expanded with the right name on arrival |
| Interruptions | ✅ stage→entertainment at frame 40 and overview→Media at frame 30: no jump (≤ 0.9 m/frame), lands on the new target, new card expanded |
| Resize mid-flight (16:9 → 0.58) | ✅ re-fits (1.6 m step at the resize frame), card inside the stage; return to overview lands on the exact overview pose and removes the card |
| Flight clearance (`checkFlights`) | ✅ 0 collisions at 2.4 / 16:9 / 0.8 / 0.46 |
| Gestures (synthetic pointer events) | ✅ mouse drag +10.4° yaw; touch horizontal −10.4°; touch vertical 0° (left to the page); drag release does not select; wheel never `preventDefault`ed; `touch-action: pan-y`; ArrowLeft +6.9° |
| Card | ✅ expanded on arrival → collapse → 250 × 58 bar, body `inert`, `aria-controls` set; follows look horizontally (x 309 → 516 → 19) at constant y |
| Focus order (anchored) | scene → **skip link** (moved, M6) → card toggle → visible neighbour pins → «مناطق المعرض» → back; no focusable target < 24 px |
| Contrast (worst case over bright paving) | ✅ all ≥ 4.5:1 after fixes (provisional label 6.2, concept note 4.99, skip link 5.06, look hint 5.52) |
| Mobile 375 × 812 | ✅ mobile tier (DPR 1.25), anchored 81 calls, no horizontal overflow, card inside, RTL toolbar, bottom sheet with 40 px+ items |
| Tablet (prod) | ✅ overview with pins, RTL toolbar, backed concept note |
| Adaptive DPR | ✅ 1260×823 at 23 ms holds 1.25; 1920×1080 at 87 ms steps 1.25 → 0.75 (32 ms); small stage recovers to 1.25; survives panel/selection re-renders |
| Frame time (warm, dev, 1260×823) | 19–26 ms at DPR 1–1.25, 30 ms at 1.5 (the 70–80 ms first readings were shader warm-up) |
| GPU memory | ✅ 261 → 356 geometries / 56 → 91 textures on the first full tour (LOD detail uploads), identical after a second tour (no leak) |
| Hero / layout / globals / navbar / brand assets | ✅ `git diff` empty |

**Could not be tested here:** real iOS Safari / Android Chrome devices and real touch; NVDA / VoiceOver; Lighthouse (not installed); throttled network; frame rate in a visible window; `prefers-reduced-motion` and Save-Data emulation (the preview pane has no media emulation and page-level stubs are lost on a full navigation — code reviewed; the reduced-motion camera path is the same `instant` branch that was exercised above).

## 3b. M5 verification (2026-10-12)

| Check | Result |
|---|---|
| `npx tsc --noEmit` / `npx eslint` / `npm run build` | ✅ / ✅ only pre-existing `Departments.tsx:19` / ✅ |
| Homepage order (built HTML) | ✅ Hero → exhibition → Manifesto; section, list and `<noscript>` server-rendered |
| Homepage initial JS | 832 KB raw / 269 KB gz (+8 / +4.3 KB = client loader gate); no three/R3F in homepage chunks |
| Network at rest (dev + prod, 7–18 s, no scroll) | ✅ no exhibition JS, no poster requested |
| After scrolling near | ✅ poster first, then 3D chunks (~304 KB compressed); ready → poster opacity 0; mobile fetches only `poster-mobile.webp` |
| Live scene vs poster | ✅ same composition (desktop and portrait) |
| Card on the homepage | ✅ expanded on arrival → collapse → expand |
| Context loss (`WEBGL_lose_context`) | ✅ status `failed`, canvas removed, dimmed poster + message, list visible (820 px) |
| Mobile fullscreen | ✅ stage z 100, top of screen hits the exhibition toolbar (not the topbar); exit restores scroll |
| CLS (prod, warm load) | ✅ 0 shifts. A cold first load once reported 0.13 from `BODY` 8 → 0 px (UA margin before the stylesheet applied) — unrelated to the section, not reproduced |
| LCP element (prod) | Hero crest image, as before. Timing not measurable here (hidden pane paints only on screenshot) |
| Hero intro / parallax (prod) | ✅ intro frames at ~0 s / ~2 s normal; pointermove changes the Hero transforms |
| Hero / layout / globals / navbar | ✅ `git diff` empty; `page.tsx` has only the import + insertion |
| `window.__exh` in prod | ✅ absent |

**Not verified (environment limits → M6):** Lighthouse before/after (not installed), real-time LCP/TBT, Save-Data / `prefers-reduced-data` path (logic unchanged since M2, code-reviewed only), ScrollTrigger positions after the fallback reveal (refresh call code-reviewed only; the normal path reserves height server-side, so positions are correct from first paint).

## 3a. Previous verification (2026-10-12, after the expand/collapse change)

| Check | Result |
|---|---|
| `npx tsc --noEmit` | ✅ |
| `npx eslint` | ✅ only the pre-existing `src/components/sections/Departments.tsx:19` (not ours) |
| `npm run build` | ✅ |
| Homepage initial JS | 824 KB raw / 265 KB gz, unchanged; no three/R3F in homepage chunks |
| Exhibition JS | ≈301 KB gz (budget 300 — deviation, M6) |
| Flight clearance (`__exh.checkFlights`) | ✅ 0 collisions, all pairs, aspects 2.4 / 16:9 / 0.8 / 0.46 (last run in M4; layout unchanged since) |
| Card expand/collapse | ✅ starts expanded (`aria-expanded=true`) → toggle collapses (body `inert`, 250 × 58 bar with the name) → stays world-anchored while collapsed (moves with look) → new destination re-expands → toggle expands again; no info button |
| Card visuals | ✅ tablet: collapsed «المسرح والمدرّج» bar below the stage; mobile: collapsed «ركن الصحة» bar below the booth, booth fully visible; chevron fixed for RTL |
| Draw calls (desktop) | overview ≈188 (budget 150 — deviation, M6); anchored 84–126 |
| Hero / page.tsx / layout.tsx / globals.css / public | ✅ unchanged (`git diff` empty) |

**Never verified (environment limits, planned for M6):** real-time flights and interrupting them (the browser pane was hidden, so rAF and GSAP were paused), real iOS/Android touch, screen readers, Lighthouse.

## 4. Next steps

1. **Owner review of M6** (roadmap §6 "M6 — Result").
2. **Before release (owner-side or with devices):** Lighthouse `/` before/after on a real machine (baseline: build at `b0dc63e`); iOS Safari + Android Chrome touch and fullscreen; NVDA / VoiceOver pass; one visible-window frame-rate check on a typical integrated-GPU laptop.
3. **Owner decisions:** D-27 (JS budget 305 vs 300 KB), D-9 (remove unused Spline deps), whether to ship provisional content (R-10, D-17, D-19).
4. If the scene changes visibly, re-capture the posters (method in §7).

## 5. Open questions for the owner
- **D-17:** which corners occupy which slots, and what corners 6–7 are, with their designs.
- **D-19:** real location and footprint of the entertainment zone.
- **R-4:** which Economy render is current (variant A was built).
- **D-20:** real booth dimensions. The renders read ~8–12 m wide against 3–4 m plan slots.
- **F-15 / F-16:** confirm the inferred scenery positions and the neutral partner placeholders, or supply approved partner artwork.
- **R-10:** approved teaser copy. M5 ships the provisional copy, labelled as provisional.
- **D-27:** accept the exhibition JS at 305 KB (budget 300) or raise the budget; the overage is three.js/R3F/postprocessing, not app code.
- **D-9:** approve removing the unused `@splinetool/*` dependencies (untouched so far).

## 6. Decisions to respect (details in roadmap §1 and §9)
- 10 selectable areas; everything else is scenery.
- Close fidelity to the renders. Never invent missing designs; mark placeholders clearly.
- Hero is never modified.
- Museum keeps the M1 orientation (entrance at the north end of the west facade).
- Seating: stone tiers + lounge row.
- Control booth omitted.
- No people.
- Neutral replacements for third-party marks; official KORA files only, never redrawn; Arabic text in Alexandria (Ghroob is not web-licensed).
- Placement from the masterplan: plan px → m `x=(px−80)/16.4`, `z=(py−185)/14`.
- South booth row is set back (slots 3–5 at z ≈ 34.2–34.4).
- Cards: world-anchored, expand/collapse, expanded on arrival (spec v1.2).

## 7. How to verify (practical notes for a new session)

**Run:**
- `npm run dev`, then the built-in browser preview. `.claude/launch.json` defines `kora-dev` on port 3000.
- Open `http://localhost:3000/lab/exhibition` and scroll to the stage.

**Dev-only hook `window.__exh`** (exists only in development; stripped from production):

| Call | Purpose |
|---|---|
| `instant(true)` | Skip flight animations. **Call it, wait about 200 ms, *then* `select()`**; otherwise a real GSAP flight starts and stalls while the pane is hidden. |
| `select(id \| null)` | Go to an area, or back to the overview. |
| `look(yaw, pitch)` | Set the look-around offset. |
| `panel(bool)`, `fullscreen(bool)` | Open/close the panel; toggle fullscreen. |
| `info()` | Whole-frame draw calls and triangles. |
| `bench(n)` | Average ms per frame over n frames. |
| `snap(frames)` | Render frames and return a blob URL of the canvas. |
| `state()` | The R3F state. |
| `checkFlights(aspect)` | `{ collisions, passageRouteFrom, tunnelExitProblems }` — all flights (arcs and spline routes) and tunnel exits sampled against the obstacles; expect `collisions: []`, 10 routed origins, `tunnelExitProblems: []`. |
| `step(ms)` | Advance GSAP's root clock by `ms` and render one frame — drives real flights while the pane is hidden. |
| `swapModel(id, url?)` / `clearModels()` | GLB swap proof; `url` omitted = export the kit to GLB. |

**Browser-pane quirks seen in this environment:**
- **Hidden pane pauses rendering:** rAF, IntersectionObserver and CSS transitions pause; screenshots often time out — retry. Force frames with `__exh.state().advance(performance.now())`, or render through `snap()`.
- **Screenshot width:** screenshots capture about 640 CSS px at DPR 1.25. Use the tablet (768) or mobile preset for full-width UI checks. For a desktop render, show the `snap()` image as a fixed `<img>` at 80vw.
- **DOM overlays over a render:** set the snap as the `.exh-stage` background image and hide the canvas.
- **Hot reload can corrupt meshes:** Fast Refresh can mis-reconcile meshes after structural JSX edits (seen once: a material ended up with `opacity:0`). Do a full reload before judging visuals.
- **Black frame:** a fully black frame means NaN pixels spread by bloom (e.g. `pow()` of a tiny negative number). Bisect by hiding `area-*` groups and sampling with `readPixels`.
- **Synthetic 3D clicks:** dispatch `pointermove` before `pointerdown` → `pointerup` → `click` on the canvas.
- **Timers are throttled when hidden:** `await setTimeout` loops crawl; yield with a `MessageChannel` tick instead and keep each tool call short (store results on `window` and poll).
- **Flights:** `instant(false)`, `select(id)`, then call `step(1000/60)` per frame (lower the DPR first to speed it up).
- **`setDpr` from the console is temporary:** R3F re-applies the Canvas `dpr` prop on every Canvas render (adaptive DPR lives in React state for that reason).
- **Hot reload during a scripted test** can remount or fail the scene — full reload before re-running.
- **Several live WebGL tabs** made captures come back blank or offset; close extra tabs and switch the viewport preset once to recover.

**Homepage chunk audit after `npm run build`:**
- Parse the `/_next/static/...js` script tags in `.next/server/app/index.html`.
- Sum their raw and gzip sizes.
- Grep each for `WebGLRenderer` / `react-three`; none may match.

**Hero diff check:**
```bash
git diff --quiet -- src/components/sections/Hero.tsx src/app/page.tsx src/app/layout.tsx src/app/globals.css public/
```
From M5 on, the only allowed change in that set is the section insertion in `page.tsx` (plus the posters under `public/exhibition/`).

**Production preview:** `.claude/launch.json` → `kora-prod` (`next start -p 3100`, after `npm run build`). Port 3000 may be held by another session's dev server; navigating the pane to `http://localhost:3000` still works.

**Re-capturing the posters:** on the lab route, set `.exh-stage` to 1280×720 (desktop) or 480×802 (portrait), `__exh.state().setDpr(1.5 | 2)` (immediately before capturing — see the `setDpr` note), dispatch `resize`, advance ~40 frames, then `toDataURL('image/png')` in the same task. The pane blocks uploads to `127.0.0.1` and CORS-preflighted bodies: POST to a local `http://localhost:<port>` receiver as a `text/plain` Blob. Encode with sharp (bundled with Next): `flatten` → resize 1600 / 720 → WebP q72.

## 8. Assumptions log
- Museum 28 × 10 × 5.6 m; its south/east faces are authored.
- Buildings 70/57: 15 m and 17 m tall.
- Stage deck 1.0 m, LED wall 4.3 m, truss roof 7.3 m. Amphitheatre: 5 × 1.9 m bands, 0.42 m rise.
- Booths 2.4–2.6 m tall plus fascias and titles; slot sizes from the plan.
- Entertainment zone 32 × 22 m (provisional).
- Arch radius 4.4 m. Tunnel frames 5.3 × 5.6 m, every 2.6 m.
- Corner ↔ slot mapping is provisional.
