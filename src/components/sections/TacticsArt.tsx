"use client";

import { useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";

/** A 4-3-3 attacking towards the goal on the left. */
const PLAYERS = [
  [618, 210],
  [540, 70],
  [540, 160],
  [540, 260],
  [540, 350],
  [420, 110],
  [430, 210],
  [420, 310],
  [270, 80],
  [240, 210],
  [270, 340],
] as const;

const OPPONENTS = [
  [480, 120],
  [485, 300],
  [350, 165],
  [345, 265],
  [190, 140],
  [180, 275],
] as const;

/** The move, pass by pass: keeper → centre-back → midfield → wing → striker → goal. */
const STOPS = [
  [618, 210],
  [540, 260],
  [430, 210],
  [420, 110],
  [270, 80],
  [240, 210],
  [92, 210],
] as const;

const RUNS = STOPS.slice(1).map(([x, y], index) => `M${STOPS[index][0]} ${STOPS[index][1]}L${x} ${y}`);
const BALL_PATH = `M${STOPS.map(([x, y]) => `${x} ${y}`).join("L")}`;
/** Where the ball is (share of the path) and when: it pauses at each player's feet. */
const BALL_POINTS = "0;0;0.124;0.124;0.285;0.285;0.42;0.42;0.624;0.624;0.802;0.802;1;1";
const BALL_TIMES = "0;0.05;0.122;0.172;0.265;0.315;0.393;0.443;0.562;0.612;0.715;0.765;0.88;1";

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
            style={{ transitionDelay: `${0.4 + index * 0.35}s` }}
          />
        ))}
        {PLAYERS.map(([x, y], index) => (
          <circle
            key={index}
            cx={x}
            cy={y}
            r="8"
            className="tactics-player"
            style={{ transitionDelay: `${index * 0.05}s` }}
          />
        ))}
        <circle r="6" cx={still ? 240 : 0} cy={still ? 210 : 0} className="tactics-ball">
          {!still && drawn ? (
            <animateMotion
              path={BALL_PATH}
              dur="14s"
              begin="2.6s"
              repeatCount="indefinite"
              keyPoints={BALL_POINTS}
              keyTimes={BALL_TIMES}
              calcMode="linear"
            />
          ) : null}
        </circle>
      </svg>
    </div>
  );
}
