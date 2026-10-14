"use client";

import { useMemo } from "react";
import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { BRAND } from "@/lib/constants";
import { MAIN_PATH, PASSAGE, PATHS, U_WALK, VENUE } from "@/lib/exhibition/layout";
import { Batched } from "./Batched";
import { beamLoop } from "./kit/booth";
import { Instanced, glow, tubeAlong, useDispose, type Placement, type V3 } from "./kit/primitives";
import { brandFontFamily, canvas, drawLockup, finish } from "./textures";
import { useAsyncTexture } from "./useAsyncTexture";

/**
 * KORA-branded wayfinding and identity elements for the expanded grounds
 * (owner request, 2026-10-13): banners along the paths, directional totems
 * at the junctions, warm in-ground lines along the walkway edges, an open
 * pentagon canopy (the ball panel) in the corner courtyard and a lit
 * lockup monolith at the passage branch. Official assets only (lockup
 * files, brand colours, Alexandria); restrained light. Built for few draw
 * calls: one texture each for banners, totems (atlas) and monolith, and the
 * rest merged/instanced and statically batched.
 */

const NAVY = "#1b2350";
const CORAL = "#f26557";

type Dest = "museum" | "corners" | "stage" | "entertainment";
const DEST: Record<Dest, [string, string]> = {
  museum: ["المتحف", "MUSEUM"],
  corners: ["الأركان", "CORNERS"],
  stage: ["المسرح", "STAGE"],
  entertainment: ["الساحة الترفيهية", "ENTERTAINMENT"],
};

async function loadFont(sample: string) {
  try {
    await document.fonts.load(`600 48px ${brandFontFamily()}`, sample);
  } catch {
    /* fall back to whatever is available */
  }
}

/** Vertical path banner: navy, coral band, official stacked lockup, Arabic tagline. */
async function bannerTexture() {
  await loadFont(BRAND.taglineAr);
  const { c, ctx } = canvas(256, 896);
  const g = ctx.createLinearGradient(0, 0, 0, 896);
  g.addColorStop(0, "#22306e");
  g.addColorStop(1, "#141b45");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 256, 896);
  ctx.fillStyle = CORAL;
  ctx.fillRect(0, 0, 256, 18);
  ctx.fillRect(0, 878, 256, 18);
  await drawLockup(ctx, 128, 380, 96, true);
  ctx.fillStyle = "rgba(236,239,245,0.92)";
  ctx.textAlign = "center";
  ctx.direction = "rtl";
  ctx.font = `600 30px ${brandFontFamily()}`;
  const words = BRAND.taglineAr.split(" ");
  const half = Math.ceil(words.length / 2);
  ctx.fillText(words.slice(0, half).join(" "), 128, 690);
  ctx.fillText(words.slice(half).join(" "), 128, 738);
  return finish(c);
}

const CELL = { w: 256, h: 768 };

function arrow(ctx: CanvasRenderingContext2D, x: number, y: number, dir: string) {
  const r = 22;
  ctx.beginPath();
  if (dir === "ahead") {
    ctx.moveTo(x, y + r);
    ctx.lineTo(x, y - r);
    ctx.moveTo(x - 14, y - r + 14);
    ctx.lineTo(x, y - r);
    ctx.lineTo(x + 14, y - r + 14);
  } else {
    const s = dir === "left" ? -1 : 1;
    ctx.moveTo(x - s * r, y);
    ctx.lineTo(x + s * r, y);
    ctx.moveTo(x + s * (r - 14), y - 14);
    ctx.lineTo(x + s * r, y);
    ctx.lineTo(x + s * (r - 14), y + 14);
  }
  ctx.stroke();
}

/** One atlas: a cell per totem face (destinations + arrows) and a last cell with the lockup for the backs. */
async function totemAtlas() {
  await loadFont(Object.values(DEST).map(([ar]) => ar).join(" "));
  const n = VENUE.totems.length + 1;
  const { c, ctx } = canvas(CELL.w * n, CELL.h);
  const family = brandFontFamily();
  for (let i = 0; i < n; i++) {
    const x0 = i * CELL.w;
    ctx.fillStyle = NAVY;
    ctx.fillRect(x0, 0, CELL.w, CELL.h);
    ctx.fillStyle = CORAL;
    ctx.fillRect(x0, 0, CELL.w, 14);
    if (i === n - 1) {
      await drawLockup(ctx, x0 + CELL.w / 2, 430, 74, true);
      continue;
    }
    await drawLockup(ctx, x0 + CELL.w / 2, 120, 26);
    ctx.strokeStyle = "rgba(236,239,245,0.3)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x0 + 24, 170);
    ctx.lineTo(x0 + CELL.w - 24, 170);
    ctx.stroke();
    VENUE.totems[i].rows.forEach((row, k) => {
      const [dest, dir] = row.split(":") as [Dest, string];
      const y = 240 + k * 128;
      ctx.fillStyle = "#ffffff";
      ctx.textAlign = "right";
      ctx.direction = "rtl";
      ctx.font = `600 ${DEST[dest][0].length > 8 ? 30 : 38}px ${family}`;
      ctx.fillText(DEST[dest][0], x0 + CELL.w - 24, y);
      ctx.direction = "ltr";
      ctx.font = `500 19px ${family}`;
      ctx.fillStyle = "rgba(236,239,245,0.7)";
      ctx.fillText(DEST[dest][1], x0 + CELL.w - 24, y + 32);
      ctx.strokeStyle = CORAL;
      ctx.lineWidth = 6;
      ctx.lineCap = "round";
      arrow(ctx, x0 + 46, y - 6, dir);
    });
  }
  return finish(c);
}

/** Monolith face: official stacked lockup and a coral rule. */
async function monolithTexture() {
  const { c, ctx } = canvas(512, 1536);
  ctx.fillStyle = "#121834";
  ctx.fillRect(0, 0, 512, 1536);
  await drawLockup(ctx, 256, 860, 170, true);
  ctx.fillStyle = CORAL;
  ctx.fillRect(196, 1180, 120, 10);
  return finish(c);
}

/** Totem face planes, UV-mapped into their atlas cell, merged into one geometry. */
function totemFaces() {
  const n = VENUE.totems.length + 1;
  const parts: THREE.BufferGeometry[] = [];
  VENUE.totems.forEach((t, i) => {
    for (const side of [0, 1]) {
      const cell = side === 0 ? i : n - 1;
      const g = new THREE.PlaneGeometry(0.84, 2.4);
      const uv = g.attributes.uv;
      for (let k = 0; k < uv.count; k++) uv.setX(k, (cell + uv.getX(k)) / n);
      g.translate(0, 1.5, 0.131);
      if (side === 1) g.rotateY(Math.PI);
      g.rotateY(t.rotationY);
      g.translate(t.x, 0, t.z);
      parts.push(g);
    }
  });
  return mergeGeometries(parts);
}

/** Warm in-ground lines along the walkway edges (open where paths meet). */
function edgeLines() {
  const W = 0.06;
  const z0 = MAIN_PATH.z - MAIN_PATH.halfWidth;
  const z1 = MAIN_PATH.z + MAIN_PATH.halfWidth;
  const h = U_WALK.halfWidth;
  const runsX: [number, number, number][] = [
    [MAIN_PATH.fromX, PASSAGE.minX, z0],
    [PASSAGE.maxX, MAIN_PATH.toX, z0],
    [MAIN_PATH.fromX, U_WALK.westX - h, z1],
    [U_WALK.westX + h, U_WALK.eastX - h, z1],
    [U_WALK.eastX + h, MAIN_PATH.toX, z1],
    [U_WALK.westX - h, U_WALK.eastX + h, U_WALK.baseZ + h],
    [U_WALK.westX + h, U_WALK.eastX - h, U_WALK.baseZ - h],
  ];
  const branch = PATHS[PATHS.length - 1];
  const runsZ: [number, number, number][] = [
    [U_WALK.westX - h, U_WALK.fromZ, U_WALK.baseZ + h],
    [U_WALK.westX + h, U_WALK.fromZ, U_WALK.baseZ - h],
    [U_WALK.eastX - h, U_WALK.fromZ, U_WALK.baseZ - h],
    [U_WALK.eastX + h, U_WALK.fromZ, U_WALK.baseZ + h],
    [PASSAGE.minX, branch[2], z0],
    [PASSAGE.maxX, branch[2], z0],
  ];
  const parts = [
    ...runsX.map(([a, b, z]) => new THREE.BoxGeometry(b - a, 0.012, W).translate((a + b) / 2, 0.012, z)),
    ...runsZ.map(([x, a, b]) => new THREE.BoxGeometry(W, 0.012, b - a).translate(x, 0.012, (a + b) / 2)),
  ];
  return mergeGeometries(parts);
}

function pentagonPoints(r: number): [number, number][] {
  const { x, z } = VENUE.pentagon;
  // One vertex points north, towards the main path.
  return Array.from({ length: 5 }, (_, i) => {
    const a = -Math.PI / 2 + (i * 2 * Math.PI) / 5;
    return [x + Math.cos(a) * r, z + Math.sin(a) * r];
  });
}

export function Venue() {
  const banner = useAsyncTexture(bannerTexture);
  const atlas = useAsyncTexture(totemAtlas);
  const mono = useAsyncTexture(monolithTexture);
  const P = VENUE.pentagon;
  const M = VENUE.monolith;

  const geo = useMemo(() => {
    const pts = pentagonPoints(P.radius);
    const shape = new THREE.Shape(pts.map(([x, z]) => new THREE.Vector2(x, -z)));
    const canopy = new THREE.ShapeGeometry(shape).rotateX(-Math.PI / 2).translate(0, P.height - 0.25, 0);
    canopy.deleteAttribute("uv");
    return {
      pole: new THREE.CylinderGeometry(0.055, 0.07, VENUE.bannerHeight, 8).translate(0, VENUE.bannerHeight / 2, 0),
      arm: new THREE.BoxGeometry(1.1, 0.05, 0.05),
      cloth: new THREE.PlaneGeometry(0.9, 3.15),
      totemBody: mergeGeometries(
        VENUE.totems.map((t) => new THREE.BoxGeometry(0.9, 2.8, 0.26).translate(0, 1.4, 0).rotateY(t.rotationY).translate(t.x, 0, t.z)),
      ),
      totemFaces: totemFaces(),
      edges: edgeLines(),
      ring: beamLoop(pts, P.height, 0.2, 0.26),
      canopy,
      ringLed: tubeAlong([...pts, pts[0]].map(([x, z]) => [x, P.height - 0.15, z] as V3), 0.02),
      ground: beamLoop(pentagonPoints(P.radius + 1.2), 0.011, 0.22, 0.012),
    };
  }, [P.radius, P.height]);
  useDispose(...Object.values(geo));

  const poles = useMemo<Placement[]>(() => VENUE.bannerPoles.map(([x, z]) => ({ p: [x, 0, z] })), []);
  // Arms and cloths hang towards the walkway. Each banner is two single-sided
  // faces back to back, so the graphic reads correctly from both directions;
  // the front faces arriving visitors (west on the main path, the main path
  // on the passage branch).
  const hung = useMemo(() => {
    return VENUE.bannerPoles.map(([x, z]) => {
      const onBranch = Math.abs(z) > MAIN_PATH.halfWidth + 2;
      const dx = onBranch ? Math.sign(PASSAGE.x - x) * 0.55 : 0;
      const dz = onBranch ? 0 : Math.sign(MAIN_PATH.z - z) * 0.55;
      const front = onBranch ? 0 : -Math.PI / 2;
      const nx = Math.sin(front) * 0.006;
      const nz = Math.cos(front) * 0.006;
      const y = VENUE.bannerHeight - 1.9;
      return {
        arm: { p: [x + dx, VENUE.bannerHeight - 0.25, z + dz], r: onBranch ? 0 : Math.PI / 2 } as Placement,
        faces: [
          { p: [x + dx + nx, y, z + dz + nz], r: front } as Placement,
          { p: [x + dx - nx, y, z + dz - nz], r: front + Math.PI } as Placement,
        ],
      };
    });
  }, []);
  const columns = useMemo<Placement[]>(
    () => pentagonPoints(P.radius - 0.1).map(([x, z]) => ({ p: [x, 0, z], s: [1, P.height, 1] })),
    [P.radius, P.height],
  );
  const colGeo = useMemo(() => new THREE.CylinderGeometry(0.11, 0.13, 1, 10).translate(0, 0.5, 0), []);
  useDispose(colGeo);

  const steel = { color: "#d9dce3", roughness: 0.35, metalness: 0.7 } as const;
  const warm = glow("#ffd6a0", 1.15);
  const white = glow("#f4f7ff", 1.8);

  return (
    <Batched delay={1500}>
      {/* Banner poles and arms. */}
      <Instanced geometry={geo.pole} items={poles}>
        <meshStandardMaterial color="#20232b" roughness={0.5} metalness={0.6} />
      </Instanced>
      <Instanced geometry={geo.arm} items={hung.map((h) => h.arm)}>
        <meshStandardMaterial color="#20232b" roughness={0.5} metalness={0.6} />
      </Instanced>
      {banner && (
        <Instanced geometry={geo.cloth} items={hung.flatMap((h) => h.faces)}>
          <meshStandardMaterial map={banner} roughness={0.8} emissive="#ffffff" emissiveMap={banner} emissiveIntensity={0.18} />
        </Instanced>
      )}

      {/* Directional totems. */}
      <mesh geometry={geo.totemBody} castShadow>
        <meshStandardMaterial color="#121834" roughness={0.6} />
      </mesh>
      {atlas && (
        <mesh geometry={geo.totemFaces}>
          <meshStandardMaterial map={atlas} emissive="#ffffff" emissiveMap={atlas} emissiveIntensity={0.5} roughness={0.6} />
        </mesh>
      )}

      {/* Walkway edge lines. */}
      <mesh geometry={geo.edges}>
        <meshBasicMaterial color={warm} toneMapped={false} />
      </mesh>

      {/* Pentagon canopy in the corner courtyard. */}
      <Instanced geometry={colGeo} items={columns} castShadow>
        <meshStandardMaterial {...steel} />
      </Instanced>
      <mesh geometry={geo.ring} castShadow receiveShadow>
        <meshStandardMaterial {...steel} />
      </mesh>
      <mesh geometry={geo.canopy}>
        <meshStandardMaterial color={NAVY} roughness={0.8} side={THREE.DoubleSide} />
      </mesh>
      <mesh geometry={geo.ringLed}>
        <meshBasicMaterial color={white} toneMapped={false} />
      </mesh>
      <mesh geometry={geo.ground}>
        <meshStandardMaterial color={CORAL} roughness={0.6} />
      </mesh>

      {/* Lockup monolith at the passage branch. */}
      <group position={[M.x, 0, M.z]} rotation-y={-Math.PI / 2}>
        <mesh position={[0, M.height / 2, 0]} castShadow>
          <boxGeometry args={[M.width, M.height, M.depth]} />
          <meshStandardMaterial color="#121834" roughness={0.6} />
        </mesh>
        {mono &&
          [1, -1].map((s) => (
            <mesh key={s} position={[0, M.height / 2, s * (M.depth / 2 + 0.005)]} rotation-y={s === 1 ? 0 : Math.PI}>
              <planeGeometry args={[M.width - 0.12, M.height - 0.2]} />
              <meshStandardMaterial map={mono} emissive="#ffffff" emissiveMap={mono} emissiveIntensity={0.55} roughness={0.6} />
            </mesh>
          ))}
      </group>
    </Batched>
  );
}
