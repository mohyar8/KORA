# KORA Official Website — Interactive 3D Exhibition

**Document status:** Approved product direction / implementation specification, v1.2 (2026-10-12; §3.4 card rules amended twice by the product owner, see §11)  
**Owner:** KORA website product planning  
**Implementation agent:** Claude Code  
**Scope:** The 3D exhibition section only; other homepage sections will be discussed later.

## 1. Purpose and success criteria

Create a premium, visually compelling, realistic interactive 3D preview of the physical KORA event, *The Industry Behind the Game*, encouraging attendance rather than replacing the in-person experience. The section belongs immediately **after the existing homepage Hero**, not inside or instead of it. Visitors may ignore the 3D section and scroll normally to the rest of the website. The existing Hero is a protected asset: preserve its visuals, animations, interactions, responsiveness, loading behavior and perceived performance.

**Primary visitor journey:** scroll past the existing Hero -> see an elevated overview of the entire exhibition -> choose any location -> cinematic camera transition to a controlled viewpoint facing that location -> an information card anchored to that location in the 3D world appears expanded and communicates the concept without spoilers (it can be collapsed to a compact name bar and expanded again) -> look left/right to see neighboring locations (the card stays with its location) -> click a visible neighboring location, choose any location from the menu, or return to the overview -> scroll away whenever desired.

**Quality bar:** Cohesive, professional architectural visualization; believable geometry, materials, depth and evening lighting. No generic floating boxes or isolated booths against empty backgrounds. Do not present unapproved preliminary designs as final built reality.

## 2. Scope boundaries

### In scope
- A full-width, visually dominant but **non-blocking** homepage exhibition section.
- Overview of the event layout, stage, museum and exhibition areas based on supplied references.
- Clickable 3D locations and alternative navigation panel.
- Smooth cinematic transitions; constrained look-around camera at selected viewpoints.
- World-anchored area information card that appears expanded when a location is reached and can be collapsed to a compact bar and expanded again; card content is teaser-level only.
- Responsive desktop/mobile interaction; optional mobile fullscreen.
- Replaceable 3D assets and configurable camera anchors, selectable regions, content and layout.
- Night/evening architectural lighting and KORA-inspired environmental design.
- Accessible non-3D fallback and graceful degradation.

### Out of scope unless explicitly approved
- Rebuilding or redesigning the existing Hero.
- Redesigning other homepage sections, navigation or footer.
- Free-roam, first-person game controls, unrestricted orbit around structures.
- Virtual entry into the museum or reproducing its six interior zones.
- Scroll-controlled mandatory tour, scroll-jacking or forced fullscreen.
- Showing full booth activities or detailed spoilers.
- New backend, CMS, account system, or fabricated APIs.
- Claiming precise surveyed dimensions, final designs, or complete 360-degree architectural fidelity without source evidence.

## 3. Approved interaction behavior

### 3.1 Section and overview
- Place the exhibition section directly after the current Hero, while preserving normal document flow.
- Use a large, responsive full-width scene, not a mandatory page takeover.
- Initially show the entire exhibition from an elevated overview angle.
- All major areas should be discoverable via 3D click targets and an accessible list.
- Do not autoplay a mandatory route between locations.
- Keep a visible means to scroll onward, and ensure the scene does not trap mouse wheel or vertical touch gestures.

### 3.2 Three navigation paths
1. Click an area directly in the 3D scene, including a neighboring area visible from another selected viewpoint.
2. Open a collapsible **right-side panel in Arabic RTL desktop layout**, listing locations; use a bottom sheet on mobile. Closed by default, with a clear persistent trigger. Choosing a location closes the panel and starts the camera transition.
3. Return to the elevated overview and choose another area.

Do not make the 3D hit targets the only navigation mechanism. Provide hover/focus/selected feedback that is not color-only. Resolve click-versus-drag conflicts deliberately.

### 3.3 Camera
- Camera transitions smoothly from current pose to an intentional viewing anchor in front of the selected area; avoid sudden teleports or clipping through models.
- After arrival, permit constrained **look-around from a stable viewpoint**, primarily horizontal yaw and modest vertical pitch, to see neighboring areas and select them. This is NOT a full orbit around a building.
- Limit rotation to authored, safe bounds and keep the card readable while the 3D scene moves behind it.
- Clicking another visible area triggers a new cinematic transition and changes the active area/card.
- Returning to overview restores the overview camera and removes the selected-area card.
- Interrupt/retrigger behavior, camera animation cancellation, and resize transitions must be robust.
- Prefer explicit on-screen zoom controls only if needed; mouse wheel must remain page scrolling in embedded mode.

### 3.4 Information card — content is primary (amended 2026-10-12, v1.2)
- The card is **anchored to its area in the 3D world** (a world-anchored HTML overlay positioned from a 3D point near the area), **not fixed to the camera viewport**. It never follows camera rotation.
- It appears **expanded** on arrival at an area, and the **new area's card appears expanded** whenever the destination changes.
- **Expand / collapse (no hide):**
  - Collapsing turns the card into a **compact bar** showing the area's name and an expand indicator.
  - The bar stays visible at the **same world-anchored position**.
  - Clicking or tapping the bar expands the card again.
  - Transitions are smooth and subtle (none under reduced motion).
  - There is no separate "show information" button.
- When the camera looks left or right, the card (expanded or collapsed) **stays with its area**: it moves with the world and leaves the frame with it.
- Arabic text stays crisp and accessible: HTML, not text rendered into the 3D scene. The toggle follows the accordion pattern (heading + button with `aria-expanded` / `aria-controls`); collapsed content is not focusable.
- Cards must **not obstruct navigation or interaction with neighbouring areas**: in-scene area labels stay clickable above the card, and the card is compact and placed below its subject.
- Identify the area and convey its idea, appeal and reason to visit as a concise teaser; avoid disclosing full activities or surprises.
- Remove the card in the overview. Adapt to mobile size, safe areas and legibility; preserve scene context.
- Card text and final copy are not yet approved: use clearly marked provisional content until provided.

### 3.5 Mobile and accessibility
- Embedded mode: vertical swipe scrolls the page; horizontal swipe within the scene adjusts look direction, without blocking normal scrolling. Test touch gesture conflicts on actual devices.
- Optional fullscreen on mobile with clear exit restoring the prior scroll position; fullscreen must not be required for exploration.
- Bottom-sheet navigation, touch-friendly targets, RTL labels, keyboard navigation, visible focus, reduced-motion behavior, screen-reader-friendly textual location list and fallback.
- Never require WebGL, drag gestures or motion to access basic exhibition information.

## 4. Visual and architectural direction

### 4.1 Fidelity priorities
- **Buildings/booths/stage/museum:** follow the actual *preliminary designs* in the event design PDF and individual reference images. Do not replace them with generic invented booth designs.
- **Spatial organization:** preserve the approximate distribution, orientation, adjacency and visitor pathways from the event masterplan; distinguish measured dimensions from inferred ones.
- **Surrounding world:** may be creatively authored as a realistic architectural environment inspired by KORA's brand and *The Industry Behind the Game*. This creative freedom applies to the **surroundings**, not to arbitrarily redesigning referenced booths.
- **Lighting:** realistic evening/night with readable ambient fill, plausible architectural lighting, illuminated stage, believable materials, carefully restrained KORA accent colors. Avoid exaggerated neon, excessive glow, glassmorphism, wet-looking ground or unrelated fantasy imagery.
- **Brand:** reuse the official KORA assets/identity actually found in the repository; do not redraw logos or invent patterns when official files exist. Follow the project's current brand sources, not speculative replacements.
- **Architectural realism:** web-optimized, not a static image pretending to be 3D. 3D models need actual depth for side views and look-around. High-quality materials and composition matter more than expensive rendering effects.

### 4.2 Reference hierarchy and uncertainty
1. Approved design assets and verified 3D/architectural drawings, if available.
2. Preliminary event PDF and museum exterior image supplied by product owner.
3. Site photographs and satellite screenshot for environment context.
4. Carefully documented provisional assumptions for unseen geometry, dimensions and unapproved details.

The event masterplan and design brief are **preliminary**. Do not assert a render's appearance is final or surveyed. Never fabricate exact dimensions when absent. Flag inconsistent or ambiguous references.

### 4.3 Reference-specific observations
- Event PDF `layout_koora.pdf` is a 96-page design/vendor brief. Key starting points: page 4 event masterplan (aerial layout/render), page 6 entertainment zone arrangement, pages 8–10 stage design, page 14 museum plan. The document also contains separate chapters for entertainment, technology, media, entrepreneurship, investment/economy, health and engineering. Review the relevant pages/images rather than relying on this summary alone.
- Museum exterior image `IMG_5695.jpeg`: dark elongated architectural volume, irregular illuminated polygonal linework in multiple restrained colors, a recessed main entrance with KORA signage, separate exit, evening scene, warm lighting at openings. The visible front is a preliminary concept, not sufficient evidence of unseen sides or precise dimensions.
- Site photos `IMG_5690.jpeg` through `IMG_5693.jpeg`: paved outdoor plaza with red/gray geometric tiles, repeated concrete academic-building facade, benches, light poles, trees and rails. Satellite screenshot `IMG_5694.jpeg` gives additional layout context, but is not a surveyed plan. These inform optional environmental realism; they do not require copying every surrounding building.
- The design brief shows the museum's internal six-zone visitor path, but **virtual museum interiors are out of scope**.

## 5. Asset strategy and modeling feasibility

- Use independent replaceable models per area (e.g., optimized glTF/GLB), separate from scene logic, navigation and card content.
- Treat preliminary models as replaceable; stable IDs, transforms, bounds, interaction regions and camera anchor configuration should survive model swaps where possible.
- A 2D reference image is **not** a finished 3D asset. Do not promise faithful production-quality 3D modeling purely from frontend code.
- Evaluate what can be modeled procedurally for a proof of concept versus what should be modeled/textured in Blender or supplied by a 3D designer.
- Prioritize a museum exterior visual prototype as the fidelity benchmark. It must demonstrate actual geometry, lighting, camera interaction and a central information card in a coherent surrounding environment.
- The museum prototype is an **early quality gate**: assess visual similarity, atmosphere, interaction, performance and asset-production cost before expanding to all areas.
- Preserve a traceable list of temporary assumptions and missing angles/dimensions; request additional assets only when necessary.

## 6. Engineering constraints and expectations

- Claude Code must first inspect the actual repository; do not assume framework, dependencies, file names, routing, asset paths or deployment setup.
- Prefer a small pragmatic integration that isolates the 3D feature and preserves the existing Hero.
- Consider Three.js/React Three Fiber only after checking compatibility with the current stack. Choose the smallest appropriate camera/animation solution; avoid redundant libraries.
- Keep data/content, model references, scene composition, camera anchors, and overlay UI logically separated without excessive abstraction.
- Defer loading heavy 3D assets until the exhibition is near viewport; avoid delaying initial Hero load. Plan placeholders/loading/failure states and context-loss handling.
- Optimize model geometry, texture resolution, draw calls, lighting/shadows, device pixel ratio and mobile memory. Prefer baked/static lighting where appropriate. Test representative devices and slow networks.
- Ensure no scroll trapping, horizontal overflow, layout shift, keyboard focus loss or broken fallback if WebGL fails.
- Respect `prefers-reduced-motion`, accessible focus/contrast, RTL and touch semantics.
- Do not install new dependencies, alter build configuration, generate large assets or change existing sections without the relevant milestone's approval.
- Do not create backend/API contracts.

## 7. Implementation workflow and milestones

### Phase A — read-only repository and reference discovery (first action)
Claude Code must:
1. Inspect only files relevant to current homepage/Hero, stack, brand, build and asset pipeline.
2. Verify which reference files actually exist in the repository. **Do not assume files from this chat are mounted in Claude Code.** If absent, report the exact desired repository paths and request them before visual implementation.
3. Assess architectural realism feasibility, including external Blender/modeling requirements, not just technical ability to render boxes.
4. Identify major uncertainties, risks, dependencies, testing options and decisions needed.
5. Create a comprehensive implementation roadmap and a minimal progress/state file **only after receiving permission to write planning documents**. Do not begin product implementation during discovery.

### Roadmap ownership
Claude Code authors and maintains `docs/3d-exhibition/3D_EXHIBITION_ROADMAP.md`, choosing the largest cohesive, safely verifiable milestones based on the actual repo, dependencies and quality gates. It must include:
- Overall scope and explicit exclusions.
- Findings and constraints from the existing repository.
- Ordered milestones with objective, dependencies, exact anticipated touchpoints (verified where possible), outputs, acceptance criteria, verification and risks.
- Asset production/acquisition track and missing-reference decisions.
- Early museum visual-quality checkpoint before full-scene rollout.
- Hero regression/performance safeguards and mobile/fallback validation.
- Open decisions, blockers and an update log when the plan materially changes.

Claude Code also maintains `docs/3d-exhibition/3D_EXHIBITION_STATE.md` with completed/current/next milestone, verified test results, open blockers and decisions not easily inferable from code. Update after each completed milestone. Keep this concise; do not duplicate the whole roadmap.

### Execution discipline
- **Do not start implementation merely because the roadmap has been written.** Wait for product-owner approval of the roadmap and museum-quality approach.
- After approval, implement one milestone at a time; complete routine subtasks without asking for micro-approvals, but stop for requirement conflicts, significant architecture changes, new dependency installation, missing critical assets, destructive operations or major scope expansion.
- Run essential relevant checks per milestone; provide concise results and update state/roadmap.
- Do not silently downgrade the visual-quality target to basic primitives. An intentionally rough blockout may be used only as an explicitly temporary technical validation step, not as an acceptable final visual prototype.
- Reevaluate later milestones based on actual results; do not rewrite approved product requirements without explicit agreement.

## 8. Acceptance criteria for the exhibition

1. Existing Hero remains visually and functionally unchanged, and its load/performance is not materially degraded.
2. Exhibition appears immediately after Hero; visitor can bypass it with normal scrolling.
3. Elevated overview, area selection, smooth transition, constrained look-around and three navigation paths work reliably.
4. Area card is world-anchored to its area in both expanded and collapsed states, appears expanded on every arrival, collapses to a compact name bar that expands again on click/tap, stays with its area during look-around, keeps Arabic text crisp and accessible, does not block neighbouring areas, and is teaser-focused.
5. Mobile bottom sheet, optional fullscreen and natural page scrolling behave correctly.
6. Museum exterior prototype has believable geometry and visually reflects the supplied preliminary reference, with explicit treatment of unverified sides/details.
7. Evening lighting and KORA-inspired surroundings form a coherent, non-empty world.
8. Models are replaceable without rewriting core interactions; the actual event plan informs spatial relationships.
9. Fallback provides useful area descriptions if 3D is unavailable or disabled.
10. Accessibility, responsiveness and realistic performance targets are evaluated and documented; any trade-offs are explicit.

## 9. Outstanding decisions — do not invent answers

- Confirm availability and licensing of final brand assets and 3D source files.
- Verify precise orientation/scaling and area list from the latest event plan; confirm whether any plan revisions supersede the supplied version.
- Approve provisional museum side/rear geometry and any invented surrounding architectural elements before presenting them as production-ready.
- Approve teaser copy and final visual card design.
- Define measurable performance budgets after repository/device baseline assessment.
- Determine asset modeling responsibility and whether Blender/3D designer involvement is required to meet the agreed fidelity.

## 10. Working agreement

This specification governs product intent and approved UX decisions. Claude Code may propose engineering improvements and revise the roadmap, but must not change these product rules unilaterally. The current task is the **3D exhibition only**; planning the rest of the official website begins after this section is resolved.

## 11. Change log

| Date | Change | Approved by |
|---|---|---|
| 2026-10-12 | v1.2 — §1, §2, §3.4 and §8 item 4: the close/reopen behaviour is replaced by **expand/collapse**. Collapsed = compact bar (name + expand indicator) at the same world-anchored position; click/tap expands; smooth subtle animation; expanded on every new arrival; the separate "show information" button is removed. | Product owner |
| 2026-10-12 | v1.1 — §1, §2, §3.4 and §8 item 4 amended: the information card is world-anchored instead of centred and camera-fixed; it opens automatically on arrival and on destination change, can be closed and reopened, stays with its area during look-around, uses crisp accessible HTML overlays, and must not obstruct neighbouring areas. Supersedes "prominent, centered card" and "no hide-card action". | Product owner |
