# KORA 3D Exhibition — State (resume here)

**Last updated:** 2026-10-12 · **Branch:** `newV` · **Spec:** v1.2 · **Roadmap:** v0.7

A new session should read, in order:
1. This file.
2. [`3D_EXHIBITION_SPEC.md`](./3D_EXHIBITION_SPEC.md): product rules. Authoritative; never change it without the owner.
3. [`3D_EXHIBITION_ROADMAP.md`](./3D_EXHIBITION_ROADMAP.md): findings, architecture, decisions, M5/M6 plan.
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
| M5 Homepage integration & fallback | ✅ implemented and verified — **awaiting owner review** |
| **M6 Hardening → release** | **NEXT.** Do not start without the owner's go-ahead after the M5 review. |

**Git:**
- Committed by the owner: M1 `f7aabfa`, M2 `264fa21`, M3 `b0dc63e`.
- **Uncommitted:** all M4 work, the expand/collapse change, all M5 work, and the doc updates. Don't commit unless the owner asks.
- `.serena/` (tool folder, untracked) is not ours and should be left alone.

**Where the exhibition runs today:** on the homepage, directly after the Hero (`src/app/page.tsx`, default `deferMs` 4500), and on the lab route `/lab/exhibition` (noindex, `deferMs` 0; kept for M6 QA, remove/gate in M6).

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

## 3. Last verification (2026-10-12, M5)

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

1. **Owner review of M5.** If the scene changes visibly, re-capture the posters (method in §7).
2. **M6 (after the go-ahead):**
   - Lighthouse `/` before/after on a real machine (baseline: build with `page.tsx` reverted).
   - Bring overview draw calls ≤ 150 (texture atlas for signage; merge the surroundings' instanced sets).
   - Bring JS ≤ 300 KB (lazy-load the entertainment zone and scenery).
   - Device and accessibility QA; remove or gate the lab route; Spline deps (D-9).

## 5. Open questions for the owner
- **D-17:** which corners occupy which slots, and what corners 6–7 are, with their designs.
- **D-19:** real location and footprint of the entertainment zone.
- **R-4:** which Economy render is current (variant A was built).
- **D-20:** real booth dimensions. The renders read ~8–12 m wide against 3–4 m plan slots.
- **F-15 / F-16:** confirm the inferred scenery positions and the neutral partner placeholders, or supply approved partner artwork.
- **R-10:** approved teaser copy. M5 ships the provisional copy, labelled as provisional.

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
| `checkFlights(aspect)` | List flights that collide with obstacles (expect `[]`). |
| `swapModel(id, url?)` / `clearModels()` | GLB swap proof; `url` omitted = export the kit to GLB. |

**Browser-pane quirks seen in this environment:**
- **Hidden pane pauses rendering:** rAF, IntersectionObserver and CSS transitions pause; screenshots often time out — retry. Force frames with `__exh.state().advance(performance.now())`, or render through `snap()`.
- **Screenshot width:** screenshots capture about 640 CSS px at DPR 1.25. Use the tablet (768) or mobile preset for full-width UI checks. For a desktop render, show the `snap()` image as a fixed `<img>` at 80vw.
- **DOM overlays over a render:** set the snap as the `.exh-stage` background image and hide the canvas.
- **Hot reload can corrupt meshes:** Fast Refresh can mis-reconcile meshes after structural JSX edits (seen once: a material ended up with `opacity:0`). Do a full reload before judging visuals.
- **Black frame:** a fully black frame means NaN pixels spread by bloom (e.g. `pow()` of a tiny negative number). Bisect by hiding `area-*` groups and sampling with `readPixels`.
- **Synthetic 3D clicks:** dispatch `pointermove` before `pointerdown` → `pointerup` → `click` on the canvas.

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

**Re-capturing the posters:** on the lab route, set `.exh-stage` to 1280×720 (desktop) or 480×802 (portrait), `__exh.state().setDpr(1.5 | 2)`, dispatch `resize`, advance ~40 frames, then `toDataURL('image/png')` in the same task. The pane blocks uploads to `127.0.0.1` and CORS-preflighted bodies: POST to a local `http://localhost:<port>` receiver as a `text/plain` Blob. Encode with sharp (bundled with Next): `flatten` → resize 1600 / 720 → WebP q72.

## 8. Assumptions log
- Museum 28 × 10 × 5.6 m; its south/east faces are authored.
- Buildings 70/57: 15 m and 17 m tall.
- Stage deck 1.0 m, LED wall 4.3 m, truss roof 7.3 m. Amphitheatre: 5 × 1.9 m bands, 0.42 m rise.
- Booths 2.4–2.6 m tall plus fascias and titles; slot sizes from the plan.
- Entertainment zone 32 × 22 m (provisional).
- Arch radius 4.4 m. Tunnel frames 5.3 × 5.6 m, every 2.6 m.
- Corner ↔ slot mapping is provisional.
