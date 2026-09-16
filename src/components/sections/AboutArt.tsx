"use client";

import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";

export function AboutArt() {
  const pent = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = pent.current;
    if (!node) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const compact = window.matchMedia(
      "(max-width: 820px), (orientation: portrait) and (max-width: 1024px)",
    ).matches;

    const ctx = gsap.context(() => {
      if (compact) {
        gsap.fromTo(
          node,
          { rotate: -40 },
          {
            rotate: 28,
            ease: "none",
            scrollTrigger: {
              trigger: "#about",
              start: "top 90%",
              end: "bottom top",
              scrub: 1.15,
            },
          },
        );
        return;
      }

      gsap.fromTo(
        node,
        { xPercent: -64, yPercent: -50, rotate: -14 },
        {
          xPercent: -64,
          yPercent: -50,
          rotate: 22,
          ease: "none",
          scrollTrigger: {
            trigger: "#about",
            start: "top 85%",
            end: "bottom top",
            scrub: 1.1,
          },
        },
      );
    });

    ScrollTrigger.refresh();
    return () => ctx.revert();
  }, []);

  return (
    <div aria-hidden className="about-art">
      <div ref={pent} className="kora-pentagon about-pent" />
    </div>
  );
}
