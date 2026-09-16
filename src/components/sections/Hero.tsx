"use client";

import { motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";

const PASS_TIMES = [0, 0.1, 0.2, 0.32, 0.44, 0.55, 0.66, 0.78, 0.88, 1];

const PASS = {
  x: ["-38vw", "22vw", "40vw", "-8vw", "-36vw", "12vw", "34vw", "-28vw", "6vw", "-38vw"],
  y: ["22vh", "-26vh", "10vh", "28vh", "-16vh", "-28vh", "24vh", "6vh", "-22vh", "22vh"],
};

const PASS_LAYER = {
  zIndex: [2, 4, 2, 4, 2, 4, 2, 4, 2, 2],
};

const SPIN = {
  rotate: [0, 260, 540, 820, 1120, 1400, 1680, 1980],
};

export function Hero() {
  const reduced = useReducedMotion();
  const [pointer, setPointer] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (reduced) return;
    const move = (event: PointerEvent) =>
      setPointer({
        x: (event.clientX / window.innerWidth - 0.5) * 18,
        y: (event.clientY / window.innerHeight - 0.5) * 10,
      });
    window.addEventListener("pointermove", move, { passive: true });
    return () => window.removeEventListener("pointermove", move);
  }, [reduced]);

  return (
    <section id="top" aria-labelledby="hero-title" className="hero-field">
      <div className="hero-stage">
        <div aria-hidden className="field-columns" />
        <div aria-hidden className="field-circle field-circle-center" />
        <div aria-hidden className="field-halfway" />
        <div aria-hidden className="field-box field-box-right" />
        <div aria-hidden className="field-box field-box-left" />
        <div aria-hidden className="field-goal field-goal-right" />
        <div aria-hidden className="field-goal field-goal-left" />
        <span aria-hidden className="field-spot field-spot-right" />
        <span aria-hidden className="field-spot field-spot-left" />

        <motion.div
          aria-hidden
          className="hero-ball-anchor"
          animate={reduced ? undefined : PASS_LAYER}
          transition={{
            duration: 16,
            ease: [0.22, 0.8, 0.28, 1],
            times: PASS_TIMES,
            repeat: Infinity,
          }}
        >
          {reduced ? (
            <div className="hero-ball">
              <BallMark />
            </div>
          ) : (
            <motion.div
              className="hero-ball-pass"
              animate={PASS}
              transition={{
                duration: 16,
                ease: [0.22, 0.8, 0.28, 1],
                times: PASS_TIMES,
                repeat: Infinity,
              }}
            >
              <motion.div
                className="hero-ball"
                animate={{ x: pointer.x * 0.35, y: pointer.y * 0.35 }}
                transition={{ type: "spring", stiffness: 80, damping: 18, mass: 0.6 }}
              >
                <motion.div
                  className="hero-ball-spin"
                  animate={SPIN}
                  transition={{
                    duration: 16,
                    ease: [0.22, 0.8, 0.28, 1],
                    times: PASS_TIMES,
                    repeat: Infinity,
                  }}
                >
                  <BallMark />
                </motion.div>
              </motion.div>
            </motion.div>
          )}
        </motion.div>

        <div className="hero-crest-anchor">
          <div className="hero-wordmark hero-crest">
            <h1 id="hero-title" className="sr-only">كورة</h1>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              className="hero-crest-ball"
              src="/assets/brand/kora-old-ball.png"
              alt=""
              width={604}
              height={312}
            />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              className="hero-crest-word"
              src="/assets/brand/kora-old-word.png"
              alt=""
              width={1062}
              height={367}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function BallMark() {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src="/assets/brand/kora-field-ball.png" alt="" width={140} height={140} />
  );
}
