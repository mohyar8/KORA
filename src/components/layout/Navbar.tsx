"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { NAV_LINKS } from "@/lib/content";

export function Navbar() {
  const bar = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    // Written straight to the DOM inside a frame so scrolling never
    // re-renders the navbar.
    let frame = 0;
    const update = () => {
      frame = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (bar.current) {
        bar.current.style.width = `${max > 0 ? (window.scrollY / max) * 100 : 0}%`;
      }
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    return () => {
      window.removeEventListener("scroll", schedule);
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <header className="topbar">
      <nav aria-label="التنقل الرئيسي">
        <ul className="topbar-links">
          {NAV_LINKS.map((link, index) => (
            <li key={link.href}>
              <Link href={link.href}>
                <span>0{index + 1}</span>
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
        <Link className="topbar-apply" href="/partners">كن شريكًا</Link>
      </nav>
      <div className="scroll-progress"><span ref={bar} style={{ width: "0%" }} /></div>
    </header>
  );
}
