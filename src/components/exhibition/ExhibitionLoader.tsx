"use client";

import dynamic from "next/dynamic";
import { Component, useEffect, useRef, useState, type ReactNode } from "react";
import { LoadingScreen } from "./ui/LoadingScreen";

const ExhibitionExperience = dynamic(() => import("./ExhibitionExperience"), { ssr: false });

type Status = "waiting" | "deferred" | "loading" | "failed" | "unsupported";

function hasWebGL2() {
  try {
    return !!document.createElement("canvas").getContext("webgl2");
  } catch {
    return false;
  }
}

function prefersReducedData() {
  const conn = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
  return !!conn?.saveData || window.matchMedia("(prefers-reduced-data: reduce)").matches;
}

class Boundary extends Component<{ onError: () => void; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    this.props.onError();
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

/** Still frame of the overview, shown while the scene loads and as part of the fallback. */
function Poster({ hidden }: { hidden: boolean }) {
  return (
    <div className="exh-poster" data-hidden={hidden} aria-hidden>
      <picture>
        <source media="(max-width: 767px)" srcSet="/exhibition/poster-mobile.webp" type="image/webp" />
        <img src="/exhibition/poster.webp" alt="" decoding="async" fetchPriority="low" />
      </picture>
    </div>
  );
}

/**
 * Decides whether and when the 3D experience loads: only near the viewport,
 * never before `deferMs` after page load (keeps the Hero intro untouched),
 * only with WebGL2, and on data-saver connections only on request. Nothing
 * (poster included) is requested before the section is near. Any failure —
 * including a lost WebGL context — leaves the poster and the
 * server-rendered area list as the experience.
 */
export function ExhibitionLoader({ deferMs = 4500 }: { deferMs?: number }) {
  const [status, setStatus] = useState<Status>("waiting");
  const [near, setNear] = useState(false);
  const [ready, setReady] = useState(false);
  /** Loading stage reached (see ExhibitionExperience onProgress); `shown` eases towards it. */
  const [stage, setStage] = useState(0.04);
  const [shown, setShown] = useState(0);
  const host = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = host.current;
    if (!el) return;
    const supported = hasWebGL2();
    const reduced = supported && prefersReducedData();
    if (!supported) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- capability check needs the DOM
      setStatus("unsupported");
    } else if (reduced) {
      setStatus("deferred");
    }
    let timer: number | undefined;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        setNear(true);
        if (!supported || reduced) return;
        const wait = Math.max(0, deferMs - performance.now());
        timer = window.setTimeout(() => setStatus((s) => (s === "waiting" ? "loading" : s)), wait);
      },
      { rootMargin: "40% 0px" },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      window.clearTimeout(timer);
    };
  }, [deferMs]);

  // The fallback list becomes visible and pushes the sections below down:
  // re-measure their scroll-triggered animations (gsap is already a page dependency).
  const listShown = status === "failed" || status === "unsupported" || status === "deferred";
  useEffect(() => {
    if (!listShown) return;
    let cancelled = false;
    import("@/lib/gsap").then(({ ScrollTrigger }) => {
      if (!cancelled) ScrollTrigger.refresh();
    });
    return () => {
      cancelled = true;
    };
  }, [listShown]);

  const live = status === "loading" && ready;
  const goal = live ? 1 : status === "loading" ? Math.max(stage, 0.12) : stage;

  // The line eases towards the stage reached and keeps creeping slowly
  // within that stage (the code download has no byte progress), so it is
  // always visibly moving but never runs ahead of the real state.
  useEffect(() => {
    if (!near || listShown) return;
    let raf = 0;
    const cap = goal >= 1 ? 1 : goal <= 0.12 ? 0.45 : Math.min(0.97, goal + 0.08);
    const tick = () => {
      setShown((v) => {
        const next = Math.min(cap, v + Math.max((goal - v) * 0.08, 0.0007));
        return next > v ? next : v;
      });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [goal, near, listShown]);

  return (
    <div ref={host} className="exh-loader" data-status={status} data-ready={live}>
      {status === "loading" && (
        <Boundary onError={() => setStatus("failed")}>
          <ExhibitionExperience
            onFail={() => setStatus("failed")}
            onReady={() => setReady(true)}
            onProgress={(p) => setStage((s) => Math.max(s, p))}
          />
        </Boundary>
      )}
      {near && <Poster hidden={live} />}
      {near && (status === "waiting" || status === "loading") && <LoadingScreen progress={live ? 1 : shown} hidden={live} />}
      {status === "deferred" && (
        <div className="exh-placeholder-note">
          <p>العرض ثلاثي الأبعاد متوقف لتوفير البيانات.</p>
          <button type="button" className="exh-btn exh-btn-primary" onClick={() => setStatus("loading")}>
            تحميل العرض
          </button>
        </div>
      )}
      {(status === "failed" || status === "unsupported") && (
        <p className="exh-placeholder-note">
          تعذّر عرض المشهد ثلاثي الأبعاد على هذا الجهاز. تجد وصف مناطق المعرض أدناه.
        </p>
      )}
      {near && !live && <p className="exh-poster-caption">صورة من التصور المبدئي للمعرض</p>}
    </div>
  );
}
