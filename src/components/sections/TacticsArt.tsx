"use client";

import { useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";

const PLAYERS = [
  [560, 90],
  [560, 210],
  [560, 330],
  [400, 120],
  [400, 300],
  [250, 210],
] as const;

const OPPONENTS = [
  [470, 160],
  [470, 268],
  [320, 168],
  [320, 256],
] as const;

/** Passing runs, drawn in order; the last one is the shot. */
const RUNS = [
  "M546 96 Q480 88 414 114",
  "M546 324 Q480 332 414 306",
  "M390 130 Q322 160 262 200",
  "M390 290 Q322 262 262 220",
  "M236 210 Q160 200 92 210",
];

const BALL_PATH = "M546 210 C470 212 340 206 262 210 Q160 200 92 210";

/**
 * A coach's tactics board behind the hero's story: players, dashed runs that
 * appear one by one, and the ball travelling slowly towards goal.
 */
export function TacticsArt() {
  const ref = useRef<HTMLDivElement>(null);
  const [drawn, setDrawn] = useState(false);
  const still = Boolean(useReducedMotion());

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setDrawn(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} aria-hidden className="tactics-art" data-drawn={drawn}>
      <svg viewBox="0 0 640 420" preserveAspectRatio="xMidYMid meet" className="tactics-board">
        <path d="M40 160H70V260H40" className="tactics-goal" />
        {OPPONENTS.map(([x, y], index) => (
          <path
            key={index}
            d={`M${x - 6} ${y - 6}L${x + 6} ${y + 6}M${x + 6} ${y - 6}L${x - 6} ${y + 6}`}
            className="tactics-opponent"
          />
        ))}
        {RUNS.map((d, index) => (
          <path
            key={d}
            d={d}
            className={index === RUNS.length - 1 ? "tactics-run tactics-shot" : "tactics-run"}
            style={{ transitionDelay: `${0.4 + index * 0.45}s` }}
          />
        ))}
        {PLAYERS.map(([x, y], index) => (
          <circle
            key={index}
            cx={x}
            cy={y}
            r="9"
            className="tactics-player"
            style={{ transitionDelay: `${index * 0.08}s` }}
          />
        ))}
        <circle r="6" cx={still ? 92 : 0} cy={still ? 210 : 0} className="tactics-ball">
          {!still && drawn ? (
            <animateMotion
              path={BALL_PATH}
              dur="10s"
              begin="2.6s"
              repeatCount="indefinite"
              keyPoints="0;0;1;1"
              keyTimes="0;0.15;0.75;1"
              calcMode="linear"
            />
          ) : null}
        </circle>
      </svg>
    </div>
  );
}
