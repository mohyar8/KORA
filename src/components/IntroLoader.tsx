"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { BALL_FACETS } from "@/components/ui/BallSegments";
import { BRAND } from "@/lib/constants";

const SESSION_KEY = "kora-intro-seen";

type Stage = "assembling" | "revealed" | "hidden";

export function IntroLoader() {
  const reduced = useReducedMotion();
  const [stage, setStage] = useState<Stage>("assembling");
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    if (reduced === null || reduced === undefined) return;

    let alreadySeen = false;
    try {
      alreadySeen = sessionStorage.getItem(SESSION_KEY) === "1";
    } catch {
      // sessionStorage unavailable (private mode / disabled storage) — treat as unseen.
    }

    if (reduced || alreadySeen) return;

    // Synchronizing with two external systems (the OS motion preference and
    // sessionStorage) that are only readable after mount — there is no
    // render-time value to derive this from.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setShouldRender(true);
    document.documentElement.style.overflow = "hidden";

    const toRevealed = window.setTimeout(() => setStage("revealed"), 1100);
    const toHidden = window.setTimeout(close, 1900);

    function close() {
      setStage("hidden");
      document.documentElement.style.overflow = "";
      try {
        sessionStorage.setItem(SESSION_KEY, "1");
      } catch {
        // ignore
      }
    }

    return () => {
      window.clearTimeout(toRevealed);
      window.clearTimeout(toHidden);
      document.documentElement.style.overflow = "";
    };
  }, [reduced]);

  useEffect(() => {
    if (!shouldRender || stage === "hidden") return;

    function skip() {
      document.documentElement.style.overflow = "";
      setStage("hidden");
      try {
        sessionStorage.setItem(SESSION_KEY, "1");
      } catch {
        // ignore
      }
    }

    window.addEventListener("pointerdown", skip);
    window.addEventListener("keydown", skip);
    return () => {
      window.removeEventListener("pointerdown", skip);
      window.removeEventListener("keydown", skip);
    };
  }, [shouldRender, stage]);

  if (!shouldRender) return null;

  return (
    <AnimatePresence>
      {stage !== "hidden" && (
        <motion.div
          aria-hidden="true"
          exit={{ opacity: 0, transition: { duration: 0.5, ease: "easeInOut" } }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-navy"
        >
          <div className="relative flex flex-col items-center gap-8">
            <div className="relative h-[7.5rem] w-[19rem]">
              <motion.div
                className="absolute inset-0 flex items-center justify-center text-paper"
                animate={{ opacity: stage === "assembling" ? 1 : 0 }}
                transition={{ duration: 0.4 }}
              >
                <svg
                  viewBox="-30 -45 250 140"
                  className="h-24 w-auto overflow-visible"
                >
                  {BALL_FACETS.map((facet, index) => (
                    <motion.polygon
                      key={index}
                      points={facet.points}
                      fill="currentColor"
                      initial={{
                        opacity: 0,
                        scale: 0.2,
                        x: (index % 2 === 0 ? -1 : 1) * 60,
                        y: -80,
                      }}
                      animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
                      transition={{
                        duration: 0.7,
                        delay: index * 0.07,
                        ease: [0.16, 1, 0.3, 1],
                      }}
                    />
                  ))}
                </svg>
              </motion.div>

              <motion.div
                className="absolute inset-0 flex items-center justify-center"
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{
                  opacity: stage === "revealed" ? 1 : 0,
                  scale: stage === "revealed" ? 1 : 0.92,
                }}
                transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
              >
                <Image
                  src="/assets/brand/kora-main-tight.svg"
                  alt={`${BRAND.name} | ${BRAND.nameAr}`}
                  width={220}
                  height={163}
                  priority
                  className="h-28 w-auto"
                />
              </motion.div>
            </div>

            <motion.p
              className="text-xs font-medium tracking-[0.3em] text-paper/50"
              initial={{ opacity: 0 }}
              animate={{ opacity: stage === "revealed" ? 1 : 0 }}
              transition={{ duration: 0.4, delay: 0.15 }}
            >
              {BRAND.tagline}
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
