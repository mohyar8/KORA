"use client";

import { Canvas, invalidate, type RootState } from "@react-three/fiber";
import gsap from "gsap";
import { useCallback, useEffect, useRef, useState } from "react";
import { HalfFloatType, Vector3, WebGLRenderTarget, type Light, type Object3D, type WebGLRenderer } from "three";
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
import { AdaptiveResolution, adaptiveControl, startingScale } from "./scene/AdaptiveResolution";
import { AreaModels } from "./scene/AreaModels";
import { Placeholders } from "./scene/Placeholders";
import { Scenery } from "./scene/Scenery";
import { Venue } from "./scene/Venue";
import { asyncTexturesSettled } from "./scene/useAsyncTexture";
import { batchesSettled } from "./scene/Batched";
import { QualityContext, detectQuality, type Quality } from "./scene/quality";
import { Surroundings } from "./scene/Surroundings";
import { AreaCard, type CardNav } from "./ui/AreaCard";
import { AreaPanel, AreaPanelTrigger } from "./ui/AreaPanel";
import { AreaPins, PinProjector, type PinRegistry } from "./ui/AreaPins";

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
  /** Render loop allowed (after shaders, uploads and the starting resolution are prepared). */
  const [live, setLive] = useState(false);
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

  /** Visitor-driven navigation (scene, labels, area list, card controls). */
  const select = go;

  // «ابدأ الجولة» (spec v1.7): simply flies to the first stop of TOUR_ORDER.
  // There is no tour state: the card's Previous / Next walk the order, which
  // ends at the entertainment zone; free navigation is never restricted.
  const startTour = useCallback(() => go(TOUR_ORDER[0]), [go]);

  // Development-only inspection hook (stripped from production builds).
  useEffect(() => {
    // Also in production builds made with EXH_PROFILE=1 (profiling only;
    // next.config inlines the flag, so a normal build drops the hook).
    if (process.env.NODE_ENV !== "development" && process.env.EXH_PROFILE !== "1") return;
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
    // At either end of the sequence Next / Previous is not rendered: fall
    // back to the other one so keyboard focus stays in the card.
    const nav = (id: string) => pins.current.card?.querySelector<HTMLButtonElement>(`[data-nav="${id}"]`);
    const el =
      want === "toggle" ? cardToggle.current : (nav(want) ?? nav(want === "next" ? "prev" : "next") ?? cardToggle.current);
    el?.focus({ preventScroll: true });
  }, [anchored]);

  // Card Previous / Next / Overview: the same cinematic flights as any other
  // selection. Focus follows to the same control on the next card, or to the
  // scene itself when returning to the overview (the card unmounts).
  const navigateFromCard = useCallback(
    (id: AreaId | null, control: CardNav) => {
      // Previous / Next follow TOUR_ORDER (linear: museum … entertainment).
      select(id);
      if (control === "overview") root.current?.focus({ preventScroll: true });
      else focusOnArrive.current = control;
    },
    [select],
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
        // No automatic frames until the scene is prepared: the first render
        // used to compile every visible shader synchronously, freezing the
        // page for 3.4 s (production build, 2026-10-14). The preparation
        // below renders the frames it needs itself.
        frameloop={visible && live ? "demand" : "never"}
        dpr={dpr}
        shadows={quality.shadows ? "percentage" : false}
        gl={{ antialias: false, alpha: false, stencil: false, powerPreference: "high-performance" }}
        camera={{ fov: 40, near: 0.3, far: 2000, position: [0, 40, 80] }}
        onCreated={({ gl, get }) => {
          glRef.current = gl;
          getRef.current = get;
          onProgress?.(0.65);
          gl.domElement.addEventListener("webglcontextlost", (ev) => {
            ev.preventDefault();
            onFail();
          });
          // Behind the loading screen: wait for the async textures and the
          // static batches (they create the final materials), then compile
          // every shader of the scene — hidden LOD detail included — without
          // blocking the page (KHR_parallel_shader_compile where available).
          // Before this, those compiles happened mid-flight on first visits
          // (multi-second stalls; perf pass 2026-10-14). A timeout keeps a
          // stuck texture from ever holding the scene back.
          const settle = <T,>(p: Promise<T>) => Promise.race([p, new Promise<void>((r) => window.setTimeout(r, 12000))]);
          // Yields to the page (input, scrolling) between preparation steps.
          const nextTask = () =>
            new Promise<void>((r) => {
              const ch = new MessageChannel();
              ch.port1.onmessage = () => r();
              ch.port2.postMessage(null);
            });
          (async () => {
            await settle(asyncTexturesSettled());
            onProgress?.(0.8);
            await settle(batchesSettled());
            await settle(asyncTexturesSettled());
            onProgress?.(0.86);
            const { scene, camera } = get();
            // Compile for the composer's off-screen target, not the canvas:
            // three bakes tone mapping and output colour space into each
            // shader from the bound render target, so the screen variant
            // would be the wrong one. Shader inputs are fixed synchronously
            // inside compileAsync, so the target is restored right away.
            const target = new WebGLRenderTarget(1, 1, { type: HalfFloatType });
            const previous = gl.getRenderTarget();
            try {
              gl.setRenderTarget(target);
              const compiling = gl.compileAsync(scene, camera);
              gl.setRenderTarget(previous);
              await settle(compiling);
            } catch {
              gl.setRenderTarget(previous);
              /* compiled lazily on first use instead */
            }
            // Upload every geometry and texture now, behind the loading
            // screen. Interiors hidden by <Detail> would otherwise upload the
            // first time a flight reaches them (measured 100–175 ms stalls
            // mid-flight). Renders into the 1×1 target with culling off, in
            // a few chunks with a yield between them so the page keeps
            // scrolling; lights are left alone, so every chunk uses the
            // program keys just compiled.
            await nextTask();
            const restore: [Object3D, boolean, boolean][] = [];
            const renderables: Object3D[] = [];
            scene.traverse((o) => {
              if ((o as Light).isLight) return;
              restore.push([o, o.visible, o.frustumCulled]);
              o.visible = true;
              o.frustumCulled = false;
              const r = o as Object3D & { isMesh?: boolean; isLine?: boolean; isPoints?: boolean; isSprite?: boolean };
              if (r.isMesh || r.isLine || r.isPoints || r.isSprite) renderables.push(o);
            });
            const CHUNKS = 6;
            const per = Math.ceil(renderables.length / CHUNKS) || 1;
            try {
              for (let c = 0; c < CHUNKS; c++) {
                for (const o of renderables) o.visible = false;
                // This chunk's objects, plus their ancestors so they are reached.
                for (const o of renderables.slice(c * per, (c + 1) * per)) {
                  for (let p: Object3D | null = o; p && p !== scene; p = p.parent) p.visible = true;
                }
                gl.setRenderTarget(target);
                gl.render(scene, camera);
                gl.setRenderTarget(previous);
                await nextTask();
              }
            } catch {
              /* uploaded lazily on first use instead */
            } finally {
              gl.setRenderTarget(previous);
              for (const [o, visible, culled] of restore) {
                o.visible = visible;
                o.frustumCulled = culled;
              }
              target.dispose();
            }
            // Starting resolution from a few real frames, still behind the
            // loading screen: adaptive resolution used to step down during
            // the very first flight, and each step reallocates the canvas and
            // every post-processing buffer (79 ms hitches + a visible jump in
            // sharpness on a 1920×1080 integrated-GPU stage, 2026-10-14).
            if (adaptiveControl.enabled) {
              const ctx = gl.getContext();
              const px = new Uint8Array(4);
              const times: number[] = [];
              for (let i = 0; i < 8; i++) {
                const t0 = performance.now();
                get().advance(t0);
                ctx.readPixels(0, 0, 1, 1, ctx.RGBA, ctx.UNSIGNED_BYTE, px);
                times.push(performance.now() - t0);
                await nextTask();
              }
              // The first frames still carry queued upload work.
              const steady = times.slice(3).sort((a, b) => a - b);
              const scale = startingScale(quality.dpr[1], steady[steady.length >> 1]);
              const current = gl.getPixelRatio();
              adaptiveControl.seed = Math.min(scale, current);
              if (scale < current - 0.01) setDpr(scale);
            }
            onProgress?.(0.97);
            setLive(true);
            requestAnimationFrame(() => {
              invalidate();
              requestAnimationFrame(() => {
                setReady(true);
                onReady?.();
              });
            });
          })();
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

        {!selected && (
          <div className="exh-overview-cta">
            <button type="button" className="exh-btn exh-btn-primary exh-tour-start" onClick={startTour}>
              <span aria-hidden>▶</span> ابدأ الجولة
            </button>
            <p className="exh-overview-hint">أو اختر منطقة من المشهد أو من «مناطق المعرض»</p>
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
        {anchored && area ? `${area.content.name}: ${area.content.question}` : flying ? "جارٍ الانتقال…" : ""}
      </p>
    </div>
  );
}
