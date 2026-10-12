"use client";

import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { AREAS, BOOTH_HEIGHT, CORNER_IDS } from "@/lib/exhibition/areas";
import { CORNER_SLOTS, ENTERTAINMENT, GATE, SEATING, STAGE } from "@/lib/exhibition/layout";

/**
 * Translucent "ghost" massings for structures whose design is not modelled
 * yet (M3/M4) or not confirmed. The visual language — pale fill, crisp
 * outline, dashed footprint — is the architectural convention for "future
 * structure", so these can never be mistaken for final designs. Sizes and
 * positions follow the masterplan; heights are inferred.
 *
 * Everything is merged into three draw calls (fill, outline, footprints).
 */

const FILL = new THREE.MeshBasicMaterial({
  color: "#a9bcff",
  transparent: true,
  opacity: 0.075,
  depthWrite: false,
  side: THREE.DoubleSide,
});
const EDGE = new THREE.LineBasicMaterial({ color: "#cdd8ff", transparent: true, opacity: 0.55 });
const FOOT = new THREE.LineDashedMaterial({
  color: "#cdd8ff",
  transparent: true,
  opacity: 0.55,
  dashSize: 0.35,
  gapSize: 0.25,
});

type Rect = { x: number; z: number; w: number; d: number };

function box(w: number, h: number, d: number, x: number, y: number, z: number) {
  return new THREE.BoxGeometry(w, h, d).translate(x, y, z);
}

/** Only areas still without a model are ghosted. */
const ghosted = (i: number) => AREAS[CORNER_IDS[i]].model === "placeholder";

function cornerParts() {
  return CORNER_SLOTS.filter((_, i) => ghosted(i)).flatMap((s) => {
    const [w, d] = s.facing === "north" ? [s.w, s.d] : [s.d, s.w];
    // A neutral open-fronted shell: back wall, two side walls, header.
    const t = 0.12;
    const h = BOOTH_HEIGHT;
    const back =
      s.facing === "north"
        ? box(w, h, t, s.x, h / 2, s.z + d / 2 - t / 2)
        : s.facing === "east"
          ? box(t, h, d, s.x - w / 2 + t / 2, h / 2, s.z)
          : box(t, h, d, s.x + w / 2 - t / 2, h / 2, s.z);
    const sides =
      s.facing === "north"
        ? [box(t, h, d, s.x - w / 2 + t / 2, h / 2, s.z), box(t, h, d, s.x + w / 2 - t / 2, h / 2, s.z)]
        : [box(w, h, t, s.x, h / 2, s.z - d / 2 + t / 2), box(w, h, t, s.x, h / 2, s.z + d / 2 - t / 2)];
    return [back, ...sides, box(w, 0.45, d, s.x, h - 0.225, s.z)];
  });
}

function stageParts() {
  const { centerX: x, centerZ: z, width: w, depth: d, deckHeight: h, screenHeight: sh } = STAGE;
  const tower = h + sh + 0.6;
  return [
    box(w, h, d, x, h / 2, z),
    // Screen / backdrop along the north edge, facing the audience.
    box(w - 1.2, sh, 0.3, x, h + sh / 2, z - d / 2 + 0.3),
    box(0.7, tower, 0.7, x - w / 2 - 0.45, tower / 2, z - d / 2 + 0.4),
    box(0.7, tower, 0.7, x + w / 2 + 0.45, tower / 2, z - d / 2 + 0.4),
    box(1.4, h / 2, 1.2, x - w / 2 + 1, h / 4, z + d / 2 + 0.6),
    box(1.4, h / 2, 1.2, x + w / 2 - 1, h / 4, z + d / 2 + 0.6),
  ];
}

/** Seating blocks as low tiered annular sectors (4 tiers). */
function seatingParts() {
  const out: THREE.BufferGeometry[] = [];
  const tiers = 4;
  const span = SEATING.outerRadius - SEATING.innerRadius;
  for (const b of SEATING.blocks)
    for (let t = 0; t < tiers; t++) {
      const r0 = SEATING.innerRadius + (span * t) / tiers;
      const r1 = r0 + span / tiers - 0.25;
      const shape = new THREE.Shape();
      const n = 16;
      for (let i = 0; i <= n; i++) {
        const a = b.from + ((b.to - b.from) * i) / n;
        if (i === 0) shape.moveTo(Math.cos(a) * r0, Math.sin(a) * r0);
        else shape.lineTo(Math.cos(a) * r0, Math.sin(a) * r0);
      }
      for (let i = n; i >= 0; i--) {
        const a = b.from + ((b.to - b.from) * i) / n;
        shape.lineTo(Math.cos(a) * r1, Math.sin(a) * r1);
      }
      const h = 0.35 + t * 0.25;
      const g = new THREE.ExtrudeGeometry(shape, { depth: h, bevelEnabled: false, curveSegments: 1 });
      // Shape is in XY; lay it on the ground with shape +Y becoming +Z.
      g.rotateX(Math.PI / 2);
      g.translate(SEATING.center.x, h, SEATING.center.z);
      g.deleteAttribute("uv");
      out.push(g);
    }
  return out;
}

function gateParts() {
  const w = GATE.maxX - GATE.minX;
  const d = GATE.maxZ - GATE.minZ;
  return [box(w, GATE.height, d, (GATE.minX + GATE.maxX) / 2, GATE.height / 2, (GATE.minZ + GATE.maxZ) / 2)];
}

const ENT = {
  w: ENTERTAINMENT.maxX - ENTERTAINMENT.minX,
  d: ENTERTAINMENT.maxZ - ENTERTAINMENT.minZ,
  x: (ENTERTAINMENT.minX + ENTERTAINMENT.maxX) / 2,
  z: (ENTERTAINMENT.minZ + ENTERTAINMENT.maxZ) / 2,
};

/** A low perimeter only: the zone's layout is unknown, so nothing is implied inside it. */
function entertainmentParts() {
  const { w, d, x, z } = ENT;
  return [
    box(w, 0.5, 0.15, x, 0.25, z - d / 2),
    box(w, 0.5, 0.15, x, 0.25, z + d / 2),
    box(0.15, 0.5, d, x - w / 2, 0.25, z),
    box(0.15, 0.5, d, x + w / 2, 0.25, z),
  ];
}

const FOOTPRINTS: Rect[] = [
  ...CORNER_SLOTS.filter((_, i) => ghosted(i)).map((s) => {
    const [w, d] = s.facing === "north" ? [s.w, s.d] : [s.d, s.w];
    return { x: s.x, z: s.z, w, d };
  }),
  { x: ENT.x, z: ENT.z, w: ENT.w - 1.5, d: ENT.d - 1.5 },
];

/** Dashed rectangles on the ground, as one LineSegments geometry. */
function footprintGeometry(rects: Rect[]) {
  const pts: THREE.Vector3[] = [];
  for (const { x, z, w, d } of rects) {
    const c = [
      new THREE.Vector3(x - w / 2, 0.03, z - d / 2),
      new THREE.Vector3(x + w / 2, 0.03, z - d / 2),
      new THREE.Vector3(x + w / 2, 0.03, z + d / 2),
      new THREE.Vector3(x - w / 2, 0.03, z + d / 2),
    ];
    for (let i = 0; i < 4; i++) pts.push(c[i], c[(i + 1) % 4]);
  }
  return new THREE.BufferGeometry().setFromPoints(pts);
}

function normalise(g: THREE.BufferGeometry) {
  // Merge needs identical attribute sets.
  const out = g.index ? g.toNonIndexed() : g;
  if (out.hasAttribute("uv")) out.deleteAttribute("uv");
  if (out.hasAttribute("normal")) out.deleteAttribute("normal");
  return out;
}

export function Placeholders() {
  const { fill, edges, foot } = useMemo(() => {
    const stageGhost = AREAS.stage.model === "placeholder" ? [...stageParts(), ...seatingParts()] : [];
    const parts = [...stageGhost, ...cornerParts(), ...gateParts(), ...entertainmentParts()];
    const fill = mergeGeometries(parts.map(normalise));
    const edges = mergeGeometries(parts.map((p) => new THREE.EdgesGeometry(p, 20)));
    parts.forEach((p) => p.dispose());
    const footGeo = footprintGeometry(FOOTPRINTS);
    const foot = new THREE.LineSegments(footGeo, FOOT);
    foot.computeLineDistances();
    return { fill, edges, foot };
  }, []);

  useEffect(
    () => () => {
      fill.dispose();
      edges.dispose();
      foot.geometry.dispose();
    },
    [fill, edges, foot],
  );

  return (
    <group>
      <mesh geometry={fill} material={FILL} renderOrder={2} />
      <lineSegments geometry={edges} material={EDGE} renderOrder={3} />
      <primitive object={foot} />
    </group>
  );
}
