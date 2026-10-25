"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
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
        <Link className="topbar-apply" href="/partners">انضم للفريق</Link>
      </nav>
      <div className="scroll-progress"><span style={{ width: `${progress}%` }} /></div>
    </header>
  );
}
