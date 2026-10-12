"use client";

import { Canvas, invalidate, type RootState } from "@react-three/fiber";
import { useCallback, useEffect, useRef, useState } from "react";
import type { WebGLRenderer } from "three";
import { AREAS } from "@/lib/exhibition/areas";
import type { AreaId } from "@/lib/exhibition/types";
import { CameraRig, type LookInput } from "./camera/CameraRig";
import { fovFor } from "./camera/rig";
import { Atmosphere } from "./scene/Atmosphere";
import { Ground } from "./scene/Ground";
import { HitTargets, CLICK_SLOP } from "./scene/HitTargets";
import { Effects, Lighting } from "./scene/Lighting";
import { Museum } from "./scene/Museum";
import { QualityContext, detectQuality, type Quality } from "./scene/quality";
import { Surroundings } from "./scene/Surroundings";
import { AreaCard } from "./ui/AreaCard";

type Drag = {
  id: number;
  x: number;
  y: number;
  yaw: number;
  pitch: number;
  touch: boolean;
  axis: "x" | "y" | null;
};

const KEY_STEP = 0.12;

/**
 * The interactive 3D exhibition: canvas + DOM overlays. Loaded lazily by
 * ExhibitionLoader, never server-rendered.
 */
export default function ExhibitionExperience({ onFail }: { onFail: () => void }) {
  const [quality] = useState<Quality>(() => detectQuality());
  const [reducedMotion, setReducedMotion] = useState(false);
  const [selected, setSelected] = useState<AreaId | null>(null);
  const [arrived, setArrived] = useState<AreaId | null>(null);
  const [hover, setHover] = useState<{ id: AreaId; x: number; y: number } | null>(null);
  const [visible, setVisible] = useState(true);
  const [ready, setReady] = useState(false);
  const look = useRef<LookInput>({ yaw: 0, pitch: 0 });
  const drag = useRef<Drag | null>(null);
  const root = useRef<HTMLDivElement>(null);
  const cardHeading = useRef<HTMLHeadingElement>(null);
  const focusCardOnArrive = useRef(false);
  const glRef = useRef<WebGLRenderer | null>(null);
  const getRef = useRef<(() => RootState) | null>(null);
  const [instant, setInstant] = useState(false);

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

  const anchored = arrived !== null && arrived === selected;
  const area = anchored ? AREAS[arrived] : null;

  const select = useCallback((id: AreaId | null, viaKeyboard = false) => {
    focusCardOnArrive.current = viaKeyboard;
    look.current = { yaw: 0, pitch: 0 };
    setHover(null);
    setArrived(null);
    setSelected(id);
  }, []);

  // Development-only inspection hook (stripped from production builds).
  useEffect(() => {
    if (process.env.NODE_ENV !== "development") return;
    const w = window as unknown as { __exh?: unknown };
    w.__exh = {
      select: (id: AreaId | null) => select(id),
      state: () => getRef.current?.(),
      instant: (on = true) => setInstant(on),
      look: (yaw: number, pitch = 0) => {
        look.current = { yaw, pitch };
        invalidate();
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
      /** Settle and render, then open the frame as an image in a blob URL. */
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
    if (anchored && focusCardOnArrive.current) {
      cardHeading.current?.focus({ preventScroll: true });
      focusCardOnArrive.current = false;
    }
  }, [anchored]);

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
    drag.current = {
      id: e.pointerId,
      x: e.clientX,
      y: e.clientY,
      yaw: look.current.yaw,
      pitch: look.current.pitch,
      touch: e.pointerType === "touch",
      axis: e.pointerType === "touch" ? null : "x",
    };
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    const dx = e.clientX - d.x;
    const dy = e.clientY - d.y;
    if (d.touch && d.axis === null) {
      if (Math.hypot(dx, dy) < 9) return;
      // Vertical intent belongs to page scrolling (touch-action: pan-y).
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
    look.current = clampLook(d.yaw + dx * k, d.touch ? d.pitch : d.pitch + dy * k);
    invalidate();
  };
  const endDrag = (e: React.PointerEvent) => {
    if (drag.current?.id === e.pointerId) drag.current = null;
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape" && selected) {
      e.preventDefault();
      select(null, true);
      return;
    }
    if (!anchored) return;
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

  return (
    <div
      ref={root}
      className="exh-canvas-root"
      data-state={anchored ? "anchored" : flying ? "flying" : "overview"}
      data-hover={hover ? "true" : undefined}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onKeyDown={onKeyDown}
      tabIndex={0}
      role="group"
      aria-label="المشهد ثلاثي الأبعاد. بعد اختيار منطقة استخدم الأسهم للتلفّت، و Escape للعودة إلى المنظر العام."
    >
      <Canvas
        className="exh-canvas"
        frameloop={visible ? "demand" : "never"}
        dpr={quality.dpr}
        shadows={quality.shadows ? "soft" : false}
        gl={{ antialias: false, alpha: false, stencil: false, powerPreference: "high-performance" }}
        camera={{ fov: 40, near: 0.3, far: 2000, position: [0, 40, 80] }}
        onCreated={({ gl, get }) => {
          glRef.current = gl;
          getRef.current = get;
          gl.domElement.addEventListener("webglcontextlost", (ev) => {
            ev.preventDefault();
            onFail();
          });
          requestAnimationFrame(() => requestAnimationFrame(() => setReady(true)));
        }}
        aria-hidden
        tabIndex={-1}
      >
        <QualityContext.Provider value={quality}>
          <Atmosphere />
          <Lighting />
          <Ground />
          <Surroundings />
          <Museum />
          <HitTargets
            onSelect={(id) => {
              if (id !== selected) select(id);
            }}
            onHover={(id, x, y) => setHover(id && id !== selected ? { id, x: x ?? 0, y: y ?? 0 } : null)}
          />
          <CameraRig selected={selected} look={look} reducedMotion={reducedMotion || instant} onArrive={handleArrive} />
          <Effects />
        </QualityContext.Provider>
      </Canvas>

      <div className="exh-veil" data-ready={ready} aria-hidden />

      {hover && (
        <div className="exh-hover-chip" style={{ left: hover.x, top: hover.y }} aria-hidden>
          <span>{AREAS[hover.id].content.name}</span>
          <small>اضغط للاستكشاف</small>
        </div>
      )}

      <div className="exh-ui">
        <p className="exh-concept-note">تصور مبدئي — التصميم النهائي قد يختلف</p>

        {selected ? (
          <button type="button" className="exh-btn exh-btn-back" onClick={() => select(null, true)}>
            <span aria-hidden>→</span> المنظر العام
          </button>
        ) : (
          <div className="exh-overview-cta">
            <p>اختر مبنى في المشهد أو ابدأ من هنا</p>
            <button type="button" className="exh-btn exh-btn-primary" onClick={() => select("museum", true)}>
              استكشف المتحف
            </button>
          </div>
        )}

        {area && <AreaCard key={area.id} area={area} headingRef={cardHeading} reducedMotion={reducedMotion} />}

        {anchored && <p className="exh-look-hint">اسحب يمينًا أو يسارًا للتلفّت حولك</p>}
      </div>

      <p className="sr-only" aria-live="polite">
        {anchored && area ? `${area.content.name}: ${area.content.teaser}` : flying ? "جارٍ الانتقال…" : ""}
      </p>
    </div>
  );
}
