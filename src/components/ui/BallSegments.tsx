import { clsx } from "clsx";

/**
 * A short arc of hexagons echoing the brand's pattern system (itself derived
 * from the ball icon's facets — see brand-assets/05 Pattern) and its
 * "partially visible football" motif. An original geometric abstraction,
 * not a trace of the official logo artwork, used for motion moments like
 * the intro loader and section dividers.
 */
const HEX_COUNT = 7;
const HEX_RADIUS = 30;

function hexPoints(cx: number, cy: number, r: number): string {
  return Array.from({ length: 6 }, (_, i) => {
    const angle = (Math.PI / 180) * (60 * i - 30);
    return `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`;
  }).join(" ");
}

export const BALL_FACETS = Array.from({ length: HEX_COUNT }, (_, i) => {
  const spacing = HEX_RADIUS * 1.72;
  const cx = i * spacing;
  const arcLift = Math.pow(i - (HEX_COUNT - 1) / 2, 2) * 3.2;
  const cy = arcLift;
  return { cx, cy, points: hexPoints(cx, cy, HEX_RADIUS * 0.94) };
});

export function BallSegments({
  className,
  fill = "currentColor",
}: {
  className?: string;
  fill?: string;
}) {
  const width = BALL_FACETS[BALL_FACETS.length - 1].cx + HEX_RADIUS * 2;
  const height = HEX_RADIUS * 4;

  return (
    <svg
      viewBox={`-${HEX_RADIUS} -${HEX_RADIUS * 1.5} ${width} ${height}`}
      className={clsx("overflow-visible", className)}
      aria-hidden="true"
    >
      {BALL_FACETS.map((facet, index) => (
        <polygon key={index} points={facet.points} fill={fill} />
      ))}
    </svg>
  );
}
