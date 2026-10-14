"use client";

import { Canvas, invalidate, type RootState } from "@react-three/fiber";
import gsap from "gsap";
import { useCallback, useEffect, useRef, useState } from "react";
import { Vector3, type WebGLRenderer } from "three";
import { AREA_ORDER, AREAS, TOUR_ORDER, cardAnchor } from "@/lib/exhibition/areas";
import { PASSAGE } from "@/lib/exhibition/layout";
import type { AreaId } from "@/lib/exhibition/types";
import { CameraRig, type LookInput } from "./camera/CameraRig";
import { OBSTACLES } from "./camera/obstacles";
import { flightPoint, fovFor, planLift, poseFor } from "./camera/rig";
import { planGateExit, planRoute, planTunnelExit } from "./camera/route";
import { Atmosphere } from "./scene/Atmosphere";
import { Ground } from "./scene/Ground";
import { HitTargets, CLICK_SLOP } from "./scene/HitTargets";
import { Effects, Lighting } from "./scene/Lighting";
import { AdaptiveResolution, adaptiveControl } from "./scene/AdaptiveResolution";
import { AreaModels } from "./scene/AreaModels";
import { Placeholders } from "./scene/Placeholders";
import { Scenery } from "./scene/Scenery";
import { Venue } from "./scene/Venue";
import { asyncTexturesSettled } from "./scene/useAsyncTexture";
import { QualityContext, detectQuality, type Quality } from "./scene/quality";
import { Surroundings } from "./scene/Surroundings";
import { AreaCard, type CardNav } from "./ui/AreaCard";
import { AreaPanel, AreaPanelTrigger } from "./ui/AreaPanel";
import { AreaPins, PinProjector, type PinRegistry } from "./ui/AreaPins";

/** How long the guided tour holds at each stop (reading time for the card). */
const TOUR_DWELL_MS = 9000;

type Drag = {
  id: number;
  x: number;
  y: number;
  yaw: number;
  pitch: number;
  touch: boolean;
  axis: "x" | "y" | "free" | null;
};

const KEY_STEP = 0.12;

/**
 * The interactive 3D exhibition: canvas + DOM overlays. Loaded lazily by
 * ExhibitionLoader, never server-rendered.
 */
export default function ExhibitionExperience({
  onFail,
  onReady,
  onProgress,
}: {
  onFail: () => void;
  onReady?: () => void;
  /** Loading stages for the loader's progress line: 0.5 code, 0.65 scene, 0.9 textures. */
  onProgress?: (p: number) => void;
}) {
  const [quality] = useState<Quality>(() => detectQuality());
  const [dpr, setDpr] = useState<number | [number, number]>(quality.dpr);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [selected, setSelected] = useState<AreaId | null>(null);
  const [arrived, setArrived] = useState<AreaId | null>(null);
  const [hover, setHover] = useState<{ id: AreaId; x: number; y: number } | null>(null);
  const [visible, setVisible] = useState(true);
  const [ready, setReady] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const look = useRef<LookInput>({ yaw: 0, pitch: 0 });
  const drag = useRef<Drag | null>(null);
  const root = useRef<HTMLDivElement>(null);
  const cardToggle = useRef<HTMLButtonElement>(null);
  // What to focus once the destination's card appears (keyboard / card-nav continuity).
  const focusOnArrive = useRef<"toggle" | "prev" | "next" | null>(null);
  const pins = useRef<PinRegistry>({ pins: new Map(), card: null, cardAt: null });
  const [cardExpanded, setCardExpanded] = useState(true);
  const savedScroll = useRef(0);
  const menuTrigger = useRef<HTMLButtonElement>(null);
  const glRef = useRef<WebGLRenderer | null>(null);
  const getRef = useRef<(() => RootState) | null>(null);
  const [instant, setInstant] = useState(false);
  const [modelOverrides, setModelOverrides] = useState<Partial<Record<AreaId, string>>>({});

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReducedMotion(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  // Stop rendering entirely while the section is off-screen.
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { rootMargin: "10% 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Optional fullscreen: a fixed overlay (works on iOS, unlike element
  // fullscreen); page scroll is locked meanwhile and restored on exit.
  useEffect(() => {
    if (!fullscreen) return;
    const html = document.documentElement;
    savedScroll.current = window.scrollY;
    const prev = html.style.overflow;
    html.style.overflow = "hidden";
    return () => {
      html.style.overflow = prev;
      window.scrollTo(0, savedScroll.current);
    };
  }, [fullscreen]);

  // The code has loaded and the component is mounting.
  useEffect(() => {
    onProgress?.(0.5);
    // Report once per mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const anchored = arrived !== null && arrived === selected;
  const area = anchored ? AREAS[arrived] : null;

  /** Moves to an area (or the overview) without touching the guided tour. */
  const go = useCallback((id: AreaId | null, viaKeyboard = false) => {
    focusOnArrive.current = viaKeyboard ? "toggle" : null;
    look.current = { yaw: 0, pitch: 0 };
    setHover(null);
    setPanelOpen(false);
    setArrived(null);
    setSelected(id);
    // Every arrival (including switching destination) shows the card expanded.
    setCardExpanded(true);
  }, []);

  // ----- Guided tour (owner request, 2026-10-13) ---------------------------
  // «ابدأ الجولة» plays TOUR_ORDER: fly to each stop, hold for DWELL while the
  // card is read, then move on. The visitor stays free: choosing any area
  // (scene, label, list) or the overview ends the tour; the card's Previous /
  // Next move the tour along; looking around or folding the card restarts
  // the hold; it pauses while the section is off-screen.
  const [tour, setTour] = useState({ active: false, index: 0, paused: false });
  const [dwellKey, setDwellKey] = useState(0);
  const [tourNote, setTourNote] = useState("");
  const holdTour = useCallback(() => setDwellKey((k) => k + 1), []);

  /** Visitor-driven navigation: ends a running tour. */
  const select = useCallback(
    (id: AreaId | null, viaKeyboard = false) => {
      setTour((t) => (t.active ? { ...t, active: false } : t));
      go(id, viaKeyboard);
    },
    [go],
  );

  const startTour = useCallback(() => {
    setTour({ active: true, index: 0, paused: false });
    setTourNote("بدأت الجولة");
    go(TOUR_ORDER[0]);
  }, [go]);
  const stopTour = useCallback(() => {
    setTour((t) => ({ ...t, active: false }));
    setTourNote("انتهت الجولة");
  }, []);

  useEffect(() => {
    if (!tour.active || tour.paused || !visible) return;
    if (arrived === null || arrived !== selected || selected !== TOUR_ORDER[tour.index]) return;
    const timer = window.setTimeout(() => {
      if (tour.index >= TOUR_ORDER.length - 1) {
        setTour((t) => ({ ...t, active: false }));
        setTourNote("انتهت الجولة");
        return;
      }
      const next = tour.index + 1;
      setTour((t) => ({ ...t, index: next }));
      go(TOUR_ORDER[next]);
    }, TOUR_DWELL_MS);
    return () => window.clearTimeout(timer);
  }, [tour, visible, arrived, selected, go, dwellKey]);

  // Keep the world-anchored card clear of the tour bar at the bottom.
  useEffect(() => {
    // The bar is ~70 px tall, 16 px from the bottom (44 px on phones, above the skip link).
    const narrow = (root.current?.clientWidth ?? 1024) < 768;
    pins.current.bottomInset = tour.active ? (narrow ? 124 : 96) : 12;
    invalidate();
  }, [tour.active]);

  // Development-only inspection hook (stripped from production builds).
  useEffect(() => {
    if (process.env.NODE_ENV !== "development") return;
    const w = window as unknown as { __exh?: unknown };
    w.__exh = {
      select: (id: AreaId | null) => select(id),
      state: () => getRef.current?.(),
      instant: (on = true) => setInstant(on),
      /** Enable/disable adaptive resolution (fixed-resolution measurements). */
      adaptive: (on = true) => {
        adaptiveControl.enabled = on;
      },
      panel: (open = true) => setPanelOpen(open),
      fullscreen: (on = true) => setFullscreen(on),
      look: (yaw: number, pitch = 0) => {
        look.current = { yaw, pitch };
        invalidate();
      },
      /**
       * Advance animation time by `ms` without requestAnimationFrame (hidden
       * preview panes pause it): steps GSAP's root clock, then renders one frame.
       */
      step: (ms = 1000 / 60) => {
        const g = gsap as unknown as { _simT?: number };
        g._simT = Math.max(g._simT ?? 0, gsap.ticker.time) + ms / 1000;
        gsap.updateRoot(g._simT);
        getRef.current?.().advance(performance.now());
      },
      /**
       * Model-swap proof: exports an area's current kit model to GLB in the
       * browser and loads it back through the GLB slot (or `url` if given).
       */
      swapModel: async (id: AreaId, url?: string) => {
        if (!url) {
          const root = getRef.current?.().scene.getObjectByName(`area-${id}`);
          if (!root) return "no model";
          const { GLTFExporter } = await import("three/examples/jsm/exporters/GLTFExporter.js");
          const glb = (await new GLTFExporter().parseAsync(root.children[0], { binary: true, onlyVisible: false })) as ArrayBuffer;
          url = URL.createObjectURL(new Blob([glb], { type: "model/gltf-binary" }));
          setModelOverrides((m) => ({ ...m, [id]: url }));
          return { bytes: glb.byteLength, url };
        }
        setModelOverrides((m) => ({ ...m, [id]: url }));
        return { url };
      },
      clearModels: () => setModelOverrides({}),
      /** Checks every overview/area flight pair against the obstacle volumes. */
      checkFlights: (aspect = 16 / 9) => {
        const ids: (AreaId | null)[] = [null, ...AREA_ORDER];
        const out: string[] = [];
        const routed: string[] = [];
        const p = new Vector3();
        for (const a of ids)
          for (const b of ids) {
            if (a === b) continue;
            const fromPose = poseFor(a, aspect);
            const toPose = poseFor(b, aspect);
            const from = fromPose.position;
            const to = toPose.position;
            // Same choice as CameraRig (gate / passage / exit routes, else the arc).
            const route = planRoute(a, fromPose, toPose, b);
            if (route) routed.push(`${a ?? "overview"}→${b ?? "overview"}`);
            const lift = route ? 0 : planLift(from, to);
            const tgt = new Vector3();
            for (let i = 0; i <= 200; i++) {
              if (route) route.sample(i / 200, toPose, p, tgt);
              else flightPoint(from, to, lift, i / 200, p);
              if (OBSTACLES.some((o) => o.containsPoint(p))) {
                out.push(`${a ?? "overview"}→${b ?? "overview"} @${i}`);
                break;
              }
            }
          }
        // Flights interrupted inside the tunnel (both headings) to every destination.
        const exits: string[] = [];
        const tgt = new Vector3();
        for (const dz of [2, -5, -12])
          for (const dir of [-1, 1]) {
            const z = PASSAGE.frontZ + dz;
            const from = { position: new Vector3(PASSAGE.x, 3.1, z), target: new Vector3(PASSAGE.x, 3.1, z + dir * 10) };
            for (const b of ids) {
              const toPose = poseFor(b, aspect);
              const route = planTunnelExit(from, toPose);
              if (!route) {
                exits.push(`z${z}/${dir}→${b ?? "overview"}: no route`);
                continue;
              }
              for (let i = 0; i <= 200; i++) {
                route.sample(i / 200, toPose, p, tgt);
                if (OBSTACLES.some((o) => o.containsPoint(p))) {
                  exits.push(`z${z}/${dir}→${b ?? "overview"} @${i}`);
                  break;
                }
              }
            }
          }
        // Flights interrupted under the entrance arch (both headings).
        for (const dx of [-6, 0, 6])
          for (const dir of [-1, 1]) {
            const from = { position: new Vector3(dx, 1.8, 0), target: new Vector3(dx + dir * 10, 1.8, 0) };
            for (const b of ids) {
              const toPose = poseFor(b, aspect);
              const route = planGateExit(from, toPose);
              if (!route) {
                exits.push(`gate x${dx}/${dir}→${b ?? "overview"}: no route`);
                continue;
              }
              for (let i = 0; i <= 200; i++) {
                route.sample(i / 200, toPose, p, tgt);
                if (OBSTACLES.some((o) => o.containsPoint(p))) {
                  exits.push(`gate x${dx}/${dir}→${b ?? "overview"} @${i}`);
                  break;
                }
              }
            }
          }
        return { collisions: out, routed, exitProblems: exits };
      },
      /** Render n frames synchronously; returns mean CPU+GPU ms per frame. */
      bench: (n = 20) => {
        const get = getRef.current;
        const gl = glRef.current;
        if (!get || !gl) return null;
        const px = new Uint8Array(4);
        const ctx = gl.getContext();
        const t0 = performance.now();
        for (let i = 0; i < n; i++) {
          get().advance(performance.now());
          ctx.readPixels(0, 0, 1, 1, ctx.RGBA, ctx.UNSIGNED_BYTE, px);
        }
        return (performance.now() - t0) / n;
      },
      /** Settle and render, then return the frame as a blob URL. */
      snap: (frames = 12) => {
        const get = getRef.current;
        if (!get) return null;
        for (let i = 0; i < frames; i++) get().advance(performance.now() + i * 50);
        const url = get().gl.domElement.toDataURL("image/jpeg", 0.88);
        return fetch(url)
          .then((r) => r.blob())
          .then((b) => URL.createObjectURL(b));
      },
      info: () => {
        const gl = glRef.current;
        const get = getRef.current;
        if (!gl || !get) return null;
        // Count the whole frame (all composer passes), not just the last pass.
        gl.info.autoReset = false;
        gl.info.reset();
        get().advance(performance.now());
        const { calls, triangles } = gl.info.render;
        gl.info.autoReset = true;
        return { calls, triangles, geometries: gl.info.memory.geometries, textures: gl.info.memory.textures, dpr: gl.getPixelRatio() };
      },
    };
    return () => {
      delete w.__exh;
    };
  }, [select]);

  const handleArrive = useCallback((id: AreaId | null) => {
    setArrived(id);
  }, []);

  useEffect(() => {
    const want = focusOnArrive.current;
    if (!anchored || !want) return;
    focusOnArrive.current = null;
    const el =
      want === "toggle"
        ? cardToggle.current
        : pins.current.card?.querySelector<HTMLButtonElement>(`[data-nav="${want}"]`);
    el?.focus({ preventScroll: true });
  }, [anchored]);

  // Card Previous / Next / Overview: the same cinematic flights as any other
  // selection. Focus follows to the same control on the next card, or to the
  // scene itself when returning to the overview (the card unmounts).
  const navigateFromCard = useCallback(
    (id: AreaId | null, control: CardNav) => {
      // During the tour, Previous / Next move the tour; the overview ends it.
      const step = id ? TOUR_ORDER.indexOf(id) : -1;
      if (tour.active && control !== "overview" && step >= 0) {
        setTour((t) => ({ ...t, index: step, paused: false }));
        go(id);
      } else select(id);
      if (control === "overview") root.current?.focus({ preventScroll: true });
      else focusOnArrive.current = control;
    },
    [select, go, tour.active],
  );

  const clampLook = (yaw: number, pitch: number) => {
    const b = area?.look;
    if (!b) return { yaw: 0, pitch: 0 };
    return {
      yaw: Math.max(-b.yaw, Math.min(b.yaw, yaw)),
      pitch: Math.max(-b.pitchDown, Math.min(b.pitchUp, pitch)),
    };
  };

  // ----- Look-around gestures (only once anchored) -----------------------
  const onPointerDown = (e: React.PointerEvent) => {
    if (!anchored || e.button > 0) return;
    if (tour.active) holdTour();
    // Controls, pins, the card and the panel keep their own pointer behaviour.
    if ((e.target as HTMLElement).closest("button, a, nav, .exh-card")) return;
    const touch = e.pointerType === "touch";
    drag.current = {
      id: e.pointerId,
      x: e.clientX,
      y: e.clientY,
      yaw: look.current.yaw,
      pitch: look.current.pitch,
      touch,
      // Embedded touch: decide the axis first (vertical = page scroll).
      axis: !touch || fullscreen ? "free" : null,
    };
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    const dx = e.clientX - d.x;
    const dy = e.clientY - d.y;
    if (d.axis === null) {
      if (Math.hypot(dx, dy) < 9) return;
      d.axis = Math.abs(dx) > Math.abs(dy) * 1.2 ? "x" : "y";
      if (d.axis === "y") {
        drag.current = null;
        return;
      }
    }
    if (Math.hypot(dx, dy) > CLICK_SLOP && e.pointerType === "mouse") {
      (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
    }
    const width = (e.currentTarget as HTMLElement).clientWidth || 1;
    const h = (e.currentTarget as HTMLElement).clientHeight || 1;
    const hfov = 2 * Math.atan(Math.tan(((fovFor(width / h) * Math.PI) / 180) / 2) * (width / h));
    const k = (hfov / width) * 0.9;
    look.current = clampLook(d.yaw + dx * k, d.axis === "x" ? d.pitch : d.pitch + dy * k);
    invalidate();
  };
  const endDrag = (e: React.PointerEvent) => {
    if (drag.current?.id === e.pointerId) drag.current = null;
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      // Innermost first: panel, then fullscreen, then the selection.
      if (panelOpen) setPanelOpen(false);
      else if (fullscreen) setFullscreen(false);
      else if (selected) select(null, true);
      else return;
      e.preventDefault();
      return;
    }
    if (!anchored || e.target !== e.currentTarget) return;
    const map: Record<string, [number, number]> = {
      ArrowLeft: [KEY_STEP, 0],
      ArrowRight: [-KEY_STEP, 0],
      ArrowUp: [0, KEY_STEP / 2],
      ArrowDown: [0, -KEY_STEP / 2],
    };
    const step = map[e.key];
    if (!step) return;
    e.preventDefault();
    look.current = clampLook(look.current.yaw + step[0], look.current.pitch + step[1]);
    invalidate();
  };

  const flying = selected !== arrived;
  const registerCard = useCallback((el: HTMLElement | null) => {
    pins.current.card = el;
    invalidate();
  }, []);
  useEffect(() => {
    pins.current.cardAt = area ? cardAnchor(area) : null;
    invalidate();
  }, [area]);

  // Size changes while the card folds/unfolds: keep re-projecting for the
  // length of the transition so it stays pinned to its world point.
  const toggleCard = () => {
    setCardExpanded((e) => !e);
    if (tour.active) holdTour();
    const until = performance.now() + 450;
    const tick = () => {
      invalidate();
      if (performance.now() < until) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  return (
    <div
      ref={root}
      className="exh-canvas-root"
      data-state={anchored ? "anchored" : flying ? "flying" : "overview"}
      data-hover={hover ? "true" : undefined}
      data-fullscreen={fullscreen ? "true" : undefined}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onKeyDown={onKeyDown}
      tabIndex={0}
      role="group"
      aria-label="المشهد ثلاثي الأبعاد. اختر منطقة من العلامات أو من قائمة مناطق المعرض. بعد الوصول استخدم الأسهم للتلفّت، و Escape للعودة إلى المنظر العام."
    >
      {/* First stop after the scene in the tab order, so keyboard users can bypass it early. */}
      {!fullscreen && (
        <div className="exh-ui">
          <a className="exh-skip" href="#exhibition-after">
            تخطَّ المعرض <span aria-hidden>↓</span>
          </a>
        </div>
      )}
      <Canvas
        className="exh-canvas"
        frameloop={visible ? "demand" : "never"}
        dpr={dpr}
        shadows={quality.shadows ? "percentage" : false}
        gl={{ antialias: false, alpha: false, stencil: false, powerPreference: "high-performance" }}
        camera={{ fov: 40, near: 0.3, far: 2000, position: [0, 40, 80] }}
        onCreated={({ gl, get }) => {
          glRef.current = gl;
          getRef.current = get;
          onProgress?.(0.65);
          asyncTexturesSettled().then(() => onProgress?.(0.9));
          gl.domElement.addEventListener("webglcontextlost", (ev) => {
            ev.preventDefault();
            onFail();
          });
          requestAnimationFrame(() =>
            requestAnimationFrame(() => {
              setReady(true);
              // Async signage textures land shortly after the first frames;
              // let the loader's poster cover them before it fades out.
              window.setTimeout(() => onReady?.(), 400);
            }),
          );
        }}
        aria-hidden
        tabIndex={-1}
      >
        <QualityContext.Provider value={quality}>
          <Atmosphere />
          <Lighting />
          <Ground />
          <Surroundings />
          <AreaModels overrides={modelOverrides} />
          <Placeholders />
          <Scenery />
          <Venue />
          <HitTargets
            current={selected}
            onSelect={(id) => select(id)}
            onHover={(id, x, y) => setHover(id ? { id, x: x ?? 0, y: y ?? 0 } : null)}
          />
          <CameraRig selected={selected} look={look} reducedMotion={reducedMotion || instant} onArrive={handleArrive} />
          <PinProjector registry={pins} current={selected} />
          <Effects />
          <AdaptiveResolution max={quality.dpr[1]} onChange={setDpr} />
        </QualityContext.Provider>
      </Canvas>

      <div className="exh-veil" data-ready={ready} aria-hidden />

      {/* World-anchored card layer: below the pins (neighbours stay clickable), above the canvas. */}
      <div className="exh-card-layer">
        {area && (
          <AreaCard
            key={area.id}
            area={area}
            expanded={cardExpanded}
            onToggle={toggleCard}
            toggleRef={cardToggle}
            cardRef={registerCard}
            reducedMotion={reducedMotion}
            onNavigate={navigateFromCard}
          />
        )}
      </div>

      <AreaPins registry={pins} current={selected} overview={!selected} onSelect={(id) => select(id, true)} />

      {hover && (
        <div className="exh-hover-chip" style={{ left: hover.x, top: hover.y }} aria-hidden>
          <span>{AREAS[hover.id].content.name}</span>
          <small>اضغط للانتقال</small>
        </div>
      )}

      <div className="exh-ui">
        <p className="exh-concept-note">
          تصور مبدئي<span className="exh-concept-legend"> · الكتل الشفافة تصاميم قيد الإعداد</span>
        </p>

        <div className="exh-toolbar">
          <AreaPanelTrigger open={panelOpen} onOpenChange={setPanelOpen} triggerRef={menuTrigger} />
          {selected && (
            <button type="button" className="exh-btn exh-btn-back" onClick={() => select(null, true)}>
              <span aria-hidden>→</span> المنظر العام
            </button>
          )}
          <button
            type="button"
            className="exh-btn exh-btn-fullscreen"
            aria-pressed={fullscreen}
            onClick={() => setFullscreen((f) => !f)}
          >
            {fullscreen ? "إغلاق ملء الشاشة" : "ملء الشاشة"}
          </button>
        </div>

        {!selected && !tour.active && (
          <div className="exh-overview-cta">
            <button type="button" className="exh-btn exh-btn-primary exh-tour-start" onClick={startTour}>
              <span aria-hidden>▶</span> ابدأ الجولة
            </button>
            <p className="exh-overview-hint">أو اختر منطقة من المشهد أو من «مناطق المعرض»</p>
          </div>
        )}

        {tour.active && (
          <div className="exh-tour" role="group" aria-label="الجولة الموجّهة">
            <p className="exh-tour-step">
              <span>
                الجولة {tour.index + 1} / {TOUR_ORDER.length}
              </span>
              <strong>{AREAS[TOUR_ORDER[tour.index]].content.shortName}</strong>
            </p>
            <span className="exh-tour-progress" aria-hidden>
              <i
                key={`${tour.index}-${dwellKey}-${tour.paused}-${anchored}`}
                data-run={anchored && !tour.paused ? "true" : "false"}
                style={{ animationDuration: `${TOUR_DWELL_MS}ms` }}
              />
            </span>
            <button
              type="button"
              className="exh-btn exh-tour-btn"
              aria-pressed={tour.paused}
              onClick={() => setTour((t) => ({ ...t, paused: !t.paused }))}
            >
              {tour.paused ? "متابعة" : "إيقاف مؤقت"}
            </button>
            <button type="button" className="exh-btn exh-tour-btn" onClick={stopTour}>
              إنهاء الجولة
            </button>
          </div>
        )}


        {anchored && <p className="exh-look-hint">اسحب للتلفّت · اضغط منطقة مجاورة للانتقال إليها</p>}

        <AreaPanel
          open={panelOpen}
          onOpenChange={setPanelOpen}
          current={selected}
          onSelect={(id) => select(id, true)}
          onOverview={() => select(null, true)}
          triggerRef={menuTrigger}
        />

      </div>

      <p className="sr-only" aria-live="polite">
        {anchored && area ? `${area.content.name}: ${area.content.teaser}` : flying ? "جارٍ الانتقال…" : tourNote}
      </p>
    </div>
  );
}
