"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { APPLY_URL } from "@/lib/constants";
import { NAV_LINKS } from "@/lib/content";

export function Navbar() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const update = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(max > 0 ? (window.scrollY / max) * 100 : 0);
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
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
        <a className="topbar-apply" href={APPLY_URL} target="_blank" rel="noreferrer">انضم للفريق</a>
      </nav>
      <div className="scroll-progress"><span style={{ width: `${progress}%` }} /></div>
    </header>
  );
}
