"use client";

import dynamic from "next/dynamic";
import { Component, useEffect, useRef, useState, type ReactNode } from "react";

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

/**
 * Decides whether and when the 3D experience loads: only near the viewport,
 * never before `deferMs` after page load (keeps the Hero intro untouched),
 * only with WebGL2, and on data-saver connections only on request. Any
 * failure leaves the server-rendered area list as the experience.
 */
export function ExhibitionLoader({ deferMs = 4500 }: { deferMs?: number }) {
  const [status, setStatus] = useState<Status>("waiting");
  const host = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!hasWebGL2()) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- capability check needs the DOM
      setStatus("unsupported");
      return;
    }
    if (prefersReducedData()) {
      setStatus("deferred");
      return;
    }
    const el = host.current;
    if (!el) return;
    let timer: number | undefined;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        const wait = Math.max(0, deferMs - performance.now());
        timer = window.setTimeout(() => setStatus("loading"), wait);
      },
      { rootMargin: "80% 0px" },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      window.clearTimeout(timer);
    };
  }, [deferMs]);

  return (
    <div ref={host} className="exh-loader" data-status={status}>
      {status === "loading" && (
        <Boundary onError={() => setStatus("failed")}>
          <ExhibitionExperience onFail={() => setStatus("failed")} />
        </Boundary>
      )}
      {status === "waiting" && <p className="exh-placeholder-note">جارٍ تجهيز المعرض ثلاثي الأبعاد…</p>}
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
    </div>
  );
}
