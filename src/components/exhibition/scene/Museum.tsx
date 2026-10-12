"use client";

import { useEffect, useMemo, useState } from "react";
import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { MUSEUM } from "@/lib/exhibition/layout";
import { FACADE_LINES, type FacadeFace, type FacadeLine } from "@/lib/exhibition/museumFacade";
import { facadeWashTexture, museumSignTexture, radialTexture, wayfindingTexture } from "./textures";
import { useQuality } from "./quality";

/**
 * Museum exterior after the preliminary render (references/…12.05.47 PM.jpeg).
 *
 * Local frame: the plaza-facing (west) facade lies in the plane x = 0 and
 * faces −X; the building extends into +X (depth) and +Z (length, from its
 * northern end). Unseen faces follow the provisional linework in
 * museumFacade.ts.
 */

const { length: L, depth: D, height: H, portal, exit } = MUSEUM;

type FaceSpec = {
  face: FacadeFace;
  width: number;
  /** Maps facade (u, v) to local position on the face plane. */
  place: (u: number, v: number) => THREE.Vector3;
  normal: THREE.Vector3;
  holes?: { u0: number; u1: number; v1: number }[];
};

const FACES: FaceSpec[] = [
  {
    face: "west",
    width: L,
    place: (u, v) => new THREE.Vector3(0, v, u),
    normal: new THREE.Vector3(-1, 0, 0),
    holes: [
      { u0: portal.u0, u1: portal.u1, v1: portal.openingHeight },
      { u0: exit.u0, u1: exit.u1, v1: exit.height },
    ],
  },
  {
    face: "north",
    width: D,
    place: (u, v) => new THREE.Vector3(D - u, v, 0),
    normal: new THREE.Vector3(0, 0, -1),
  },
  {
    face: "south",
    width: D,
    place: (u, v) => new THREE.Vector3(u, v, L),
    normal: new THREE.Vector3(0, 0, 1),
  },
  {
    face: "east",
    width: L,
    place: (u, v) => new THREE.Vector3(D, v, L - u),
    normal: new THREE.Vector3(1, 0, 0),
  },
];

/** Facade surface for one face, with door openings cut out and UVs in 0..1. */
function faceGeometry(spec: FaceSpec) {
  const shape = new THREE.Shape();
  const w = spec.width;
  // Walk the outline, notching openings that touch the ground.
  const holes = [...(spec.holes ?? [])].sort((a, b) => a.u0 - b.u0);
  shape.moveTo(0, 0);
  for (const h of holes) {
    shape.lineTo(h.u0, 0);
    shape.lineTo(h.u0, h.v1);
    shape.lineTo(h.u1, h.v1);
    shape.lineTo(h.u1, 0);
  }
  shape.lineTo(w, 0);
  shape.lineTo(w, H);
  shape.lineTo(0, H);
  shape.closePath();
  const geo = new THREE.ShapeGeometry(shape);
  const pos = geo.attributes.position;
  const uv = geo.attributes.uv;
  for (let i = 0; i < pos.count; i++) {
    const u = pos.getX(i);
    const v = pos.getY(i);
    uv.setXY(i, u / w, v / H);
    const p = spec.place(u, v);
    pos.setXYZ(i, p.x, p.y, p.z);
  }
  geo.computeVertexNormals();
  // ShapeGeometry winds for +Z; make sure the face points outward.
  const n = new THREE.Vector3().fromBufferAttribute(geo.attributes.normal, 0);
  if (n.dot(spec.normal) < 0) {
    const index = geo.index!;
    for (let i = 0; i < index.count; i += 3) {
      const a = index.getX(i + 1);
      index.setX(i + 1, index.getX(i + 2));
      index.setX(i + 2, a);
    }
    geo.computeVertexNormals();
  }
  return geo;
}

const tmpColor = new THREE.Color();

/**
 * The luminous lines: slim proud bars (so they keep depth at grazing
 * angles) with per-vertex HDR colour, which drives the bloom pass.
 */
function linesGeometry(spec: FaceSpec, lines: readonly FacadeLine[], strength: number) {
  const parts: THREE.BufferGeometry[] = [];
  const thick = 0.1;
  const proud = 0.04;
  for (const line of lines) {
    const total = line.points.reduce(
      (acc, p, i) => (i ? acc + Math.hypot(p[0] - line.points[i - 1][0], p[1] - line.points[i - 1][1]) : 0),
      0,
    );
    const c0 = new THREE.Color(line.colors[0]);
    const c1 = new THREE.Color(line.colors[1]);
    let run = 0;
    for (let i = 1; i < line.points.length; i++) {
      const [ua, va] = line.points[i - 1];
      const [ub, vb] = line.points[i];
      const len = Math.hypot(ub - ua, vb - va);
      const box = new THREE.BoxGeometry(len + thick, thick, proud);
      // Orient in facade space, then map into the face plane.
      box.rotateZ(Math.atan2(vb - va, ub - ua));
      box.translate((ua + ub) / 2, (va + vb) / 2, proud / 2);
      const pos = box.attributes.position;
      const colors = new Float32Array(pos.count * 3);
      const k = strength * (line.intensity ?? 1);
      for (let j = 0; j < pos.count; j++) {
        const u = pos.getX(j);
        const v = pos.getY(j);
        const out = pos.getZ(j);
        const along = total > 0 ? (run + Math.hypot(u - ua, v - va)) / total : 0;
        tmpColor.copy(c0).lerp(c1, Math.min(1, Math.max(0, along))).multiplyScalar(k);
        colors.set([tmpColor.r, tmpColor.g, tmpColor.b], j * 3);
        const p = spec.place(Math.min(spec.width, Math.max(0, u)), Math.min(H, Math.max(0, v)));
        p.addScaledVector(spec.normal, out);
        pos.setXYZ(j, p.x, p.y, p.z);
      }
      box.setAttribute("color", new THREE.BufferAttribute(colors, 3));
      box.deleteAttribute("uv");
      box.deleteAttribute("normal");
      parts.push(box);
      run += len;
    }
  }
  return parts.length ? mergeGeometries(parts) : new THREE.BufferGeometry();
}

/** Warm LED strip along the foot of a face, interrupted by doorways. */
function baseStripGeometry(spec: FaceSpec) {
  const spans: [number, number][] = [];
  let start = 0;
  for (const h of [...(spec.holes ?? [])].sort((a, b) => a.u0 - b.u0)) {
    spans.push([start, h.u0 - 0.05]);
    start = h.u1 + 0.05;
  }
  spans.push([start, spec.width]);
  const parts = spans.map(([a, b]) => {
    const g = new THREE.BoxGeometry(b - a, 0.035, 0.05);
    g.translate((a + b) / 2, 0.06, 0.025);
    const pos = g.attributes.position;
    for (let j = 0; j < pos.count; j++) {
      const p = spec.place(pos.getX(j), pos.getY(j)).addScaledVector(spec.normal, pos.getZ(j));
      pos.setXYZ(j, p.x, p.y, p.z);
    }
    g.deleteAttribute("uv");
    g.deleteAttribute("normal");
    return g;
  });
  return mergeGeometries(parts);
}

function useAsyncTexture(factory: () => Promise<THREE.Texture>) {
  const [tex, setTex] = useState<THREE.Texture | null>(null);
  useEffect(() => {
    let alive = true;
    let made: THREE.Texture | null = null;
    factory().then((t) => {
      made = t;
      if (alive) setTex(t);
      else t.dispose();
    });
    return () => {
      alive = false;
      made?.dispose();
    };
    // Factories are module-level and stable.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return tex;
}

const warm = new THREE.Color("#ffb36b");

export function Museum() {
  const q = useQuality();

  const faces = useMemo(
    () =>
      FACES.map((spec) => {
        const wash = facadeWashTexture(
          FACADE_LINES[spec.face],
          spec.width,
          H,
          spec.width > 20 ? q.facadeTex : q.facadeTex / 2,
        );
        return {
          spec,
          surface: faceGeometry(spec),
          lines: linesGeometry(spec, FACADE_LINES[spec.face], 3.2),
          base: baseStripGeometry(spec),
          wash,
        };
      }),
    [q.facadeTex],
  );

  const pool = useMemo(() => radialTexture(), []);
  const sign = useAsyncTexture(museumSignTexture);
  const entranceSign = useAsyncTexture(() => wayfindingTexture("المدخل", "Entrance"));
  const exitSign = useAsyncTexture(() => wayfindingTexture("المخرج", "Exit"));

  useEffect(
    () => () => {
      for (const f of faces) {
        f.surface.dispose();
        f.lines.dispose();
        f.base.dispose();
        f.wash.dispose();
      }
      pool.dispose();
    },
    [faces, pool],
  );

  const portalW = portal.u1 - portal.u0;
  const portalMid = (portal.u0 + portal.u1) / 2;
  const exitW = exit.u1 - exit.u0;
  const exitMid = (exit.u0 + exit.u1) / 2;

  return (
    <group position={[MUSEUM.facadeX, 0, MUSEUM.northZ]}>
      {faces.map(({ spec, surface, lines, base, wash }) => (
        <group key={spec.face}>
          <mesh geometry={surface} castShadow receiveShadow>
            <meshStandardMaterial
              color="#141626"
              roughness={0.46}
              metalness={0.5}
              emissive="#ffffff"
              emissiveMap={wash}
              emissiveIntensity={2.2}
              envMapIntensity={0.9}
            />
          </mesh>
          <mesh geometry={lines}>
            <meshBasicMaterial vertexColors toneMapped={false} />
          </mesh>
          <mesh geometry={base}>
            <meshBasicMaterial color={warm.clone().multiplyScalar(2.4)} toneMapped={false} />
          </mesh>
        </group>
      ))}

      {/* Roof and metal coping. */}
      <mesh position={[D / 2, H, L / 2]} rotation-x={-Math.PI / 2} receiveShadow>
        <planeGeometry args={[D, L]} />
        <meshStandardMaterial color="#1a1b24" roughness={0.9} />
      </mesh>
      <Coping />

      {/* ---------- Entrance portal ---------- */}
      {/* Pilasters and sign box, slightly proud of the facade. */}
      {[portal.u0 - 0.18, portal.u1 + 0.18].map((z) => (
        <mesh key={z} position={[-0.14, H / 2, z]} castShadow>
          <boxGeometry args={[0.28, H + 0.02, 0.36]} />
          <meshStandardMaterial color="#0f1019" roughness={0.5} metalness={0.4} />
        </mesh>
      ))}
      <mesh position={[-0.14, (portal.openingHeight + H) / 2, portalMid]} castShadow>
        <boxGeometry args={[0.28, H - portal.openingHeight, portalW]} />
        <meshStandardMaterial color="#10111b" roughness={0.42} metalness={0.45} envMapIntensity={0.9} />
      </mesh>
      {sign && (
        <mesh position={[-0.285, portal.openingHeight + 1.02, portalMid]} rotation-y={-Math.PI / 2}>
          <planeGeometry args={[5.4, 1.35]} />
          <meshBasicMaterial map={sign} transparent color={new THREE.Color(1.5, 1.45, 1.6)} toneMapped={false} />
        </mesh>
      )}
      {/* Soffit with linear warm lights. */}
      <mesh position={[(portal.recess - 0.28) / 2, portal.openingHeight, portalMid]} rotation-x={Math.PI / 2}>
        <planeGeometry args={[portal.recess + 0.28, portalW]} />
        <meshStandardMaterial color="#17151a" roughness={0.6} side={THREE.DoubleSide} />
      </mesh>
      {/* Front edge line, then linear lights running back into the lobby (render). */}
      <mesh position={[-0.22, portal.openingHeight - 0.02, portalMid]}>
        <boxGeometry args={[0.05, 0.03, portalW - 0.3]} />
        <meshBasicMaterial color={warm.clone().multiplyScalar(3.2)} toneMapped={false} />
      </mesh>
      {[0.2, 0.4, 0.6, 0.8].map((t) => (
        <mesh key={t} position={[(portal.recess + 2.4) / 2 - 0.1, portal.openingHeight - 0.02, portal.u0 + portalW * t]}>
          <boxGeometry args={[portal.recess + 2.4, 0.03, 0.045]} />
          <meshBasicMaterial color={warm.clone().multiplyScalar(2)} toneMapped={false} />
        </mesh>
      ))}
      {/* Recess side walls. */}
      {[portal.u0, portal.u1].map((z, i) => (
        <mesh
          key={z}
          position={[portal.recess / 2, portal.openingHeight / 2, z]}
          rotation-y={i === 0 ? 0 : Math.PI}
          receiveShadow
        >
          <planeGeometry args={[portal.recess, portal.openingHeight]} />
          <meshStandardMaterial color="#1b1a1f" roughness={0.55} metalness={0.3} />
        </mesh>
      ))}
      {/* Vertical warm strips on the jambs and inner mullions. */}
      {[portal.u0 + 0.04, portal.u1 - 0.04, portal.u0 + portalW * 0.36, portal.u0 + portalW * 0.68].map((z, i) => (
        <mesh key={z} position={[i < 2 ? 0.02 : portal.recess - 0.12, portal.openingHeight / 2, z]}>
          <boxGeometry args={[0.04, portal.openingHeight - 0.05, 0.04]} />
          <meshBasicMaterial color={warm.clone().multiplyScalar(i < 2 ? 2.6 : 1.8)} toneMapped={false} />
        </mesh>
      ))}
      {/* Lobby: glazed doors in front of a softly lit interior. */}
      <mesh position={[portal.recess + 1.5, portal.openingHeight / 2, portalMid]}>
        <boxGeometry args={[3, portal.openingHeight, portalW]} />
        <meshStandardMaterial
          color="#0d0c0d"
          emissive="#4a2e18"
          emissiveIntensity={0.28}
          roughness={0.8}
          side={THREE.BackSide}
        />
      </mesh>
      <mesh position={[portal.recess, portal.openingHeight / 2, portalMid]} rotation-y={-Math.PI / 2}>
        <planeGeometry args={[portalW, portal.openingHeight]} />
        <meshStandardMaterial
          color="#06070a"
          roughness={0.05}
          metalness={0.9}
          transparent
          opacity={0.72}
          envMapIntensity={1.2}
        />
      </mesh>
      {[0.25, 0.5, 0.75].map((t) => (
        <mesh key={t} position={[portal.recess - 0.02, portal.openingHeight / 2, portal.u0 + portalW * t]}>
          <boxGeometry args={[0.05, portal.openingHeight, 0.05]} />
          <meshStandardMaterial color="#08080b" roughness={0.4} metalness={0.6} />
        </mesh>
      ))}
      <pointLight position={[0.8, 3.1, portalMid]} color="#ffb06a" intensity={q.lights ? 28 : 18} distance={14} decay={2} />

      {/* ---------- Exit ---------- */}
      <mesh position={[exit.recess, exit.height / 2, exitMid]} rotation-y={-Math.PI / 2}>
        <planeGeometry args={[exitW, exit.height]} />
        <meshStandardMaterial color="#0a0a0d" emissive="#3a2412" emissiveIntensity={0.35} roughness={0.8} />
      </mesh>
      {[exit.u0, exit.u1].map((z, i) => (
        <mesh key={z} position={[exit.recess / 2, exit.height / 2, z]} rotation-y={i === 0 ? 0 : Math.PI}>
          <planeGeometry args={[exit.recess, exit.height]} />
          <meshStandardMaterial color="#1a1a1f" roughness={0.6} />
        </mesh>
      ))}
      <mesh position={[exit.recess / 2, exit.height, exitMid]} rotation-x={Math.PI / 2}>
        <planeGeometry args={[exit.recess, exitW]} />
        <meshStandardMaterial color="#1a1a1f" roughness={0.6} side={THREE.DoubleSide} />
      </mesh>
      {[exit.u0 + 0.05, exit.u1 - 0.05].map((z) => (
        <mesh key={z} position={[0.03, exit.height / 2, z]}>
          <boxGeometry args={[0.04, exit.height, 0.04]} />
          <meshBasicMaterial color={warm.clone().multiplyScalar(2.6)} toneMapped={false} />
        </mesh>
      ))}
      <mesh position={[0.03, exit.height - 0.03, exitMid]}>
        <boxGeometry args={[0.04, 0.04, exitW]} />
        <meshBasicMaterial color={warm.clone().multiplyScalar(2.6)} toneMapped={false} />
      </mesh>
      {q.lights && (
        <pointLight position={[-0.6, 2.4, exitMid]} color="#ffb06a" intensity={7} distance={7} decay={2} />
      )}

      {/* ---------- Wayfinding ---------- */}
      {entranceSign && (
        <mesh position={[-0.012, 2.25, 1.3]} rotation-y={-Math.PI / 2}>
          <planeGeometry args={[1.5, 1.5]} />
          <meshBasicMaterial map={entranceSign} transparent color={new THREE.Color(1.15, 1.15, 1.2)} toneMapped={false} />
        </mesh>
      )}
      {exitSign && (
        <mesh position={[-0.012, 1.75, 26.4]} rotation-y={-Math.PI / 2}>
          <planeGeometry args={[1.2, 1.2]} />
          <meshBasicMaterial map={exitSign} transparent color={new THREE.Color(1.05, 1.05, 1.1)} toneMapped={false} />
        </mesh>
      )}

      {/* ---------- Light thrown on the forecourt ---------- */}
      <FacadeSpill wash={faces[0].wash} />
      <GroundPool texture={pool} position={[-2.2, portalMid]} size={[7, portalW + 2.5]} color="#ff9d55" opacity={0.42} />
      <GroundPool texture={pool} position={[-0.9, exitMid]} size={[3, 3]} color="#ff9d55" opacity={0.3} />
    </group>
  );
}

function Coping() {
  const t = 0.12;
  const w = 0.22;
  const bars: [number, number, number, number, number][] = [
    [D / 2, L + w / 2 - 0.1, D + w, t, w],
    [D / 2, -w / 2 + 0.1, D + w, t, w],
  ];
  return (
    <group>
      {bars.map(([x, z, sx, sy, sz]) => (
        <mesh key={z} position={[x, H + t / 2, z]}>
          <boxGeometry args={[sx, sy, sz]} />
          <meshStandardMaterial color="#3a3c48" roughness={0.32} metalness={0.85} />
        </mesh>
      ))}
      {[-w / 2 + 0.1, D + w / 2 - 0.1].map((x) => (
        <mesh key={x} position={[x, H + t / 2, L / 2]}>
          <boxGeometry args={[w, t, L + w]} />
          <meshStandardMaterial color="#3a3c48" roughness={0.32} metalness={0.85} />
        </mesh>
      ))}
    </group>
  );
}

/**
 * Soft coloured bounce of the facade light on the matte forecourt. Uses the
 * same wash texture mirrored onto the ground, fading with distance — a diffuse
 * spill, deliberately not a mirror reflection (no "wet" look).
 */
function FacadeSpill({ wash }: { wash: THREE.Texture }) {
  const depth = 3.4;
  const geo = useMemo(() => {
    const g = new THREE.PlaneGeometry(L, depth, 1, 8);
    const pos = g.attributes.position;
    const uv = g.attributes.uv;
    const col = new Float32Array(pos.count * 3);
    for (let i = 0; i < pos.count; i++) {
      const along = pos.getX(i) + L / 2;
      const d = depth / 2 - pos.getY(i); // 0 at the facade
      uv.setXY(i, along / L, (d / H) * 0.9);
      const f = Math.pow(1 - d / depth, 2.2);
      col.set([f, f, f], i * 3);
      pos.setXYZ(i, -d, 0.012, along);
    }
    g.setAttribute("color", new THREE.BufferAttribute(col, 3));
    g.computeVertexNormals();
    return g;
  }, []);
  useEffect(() => () => geo.dispose(), [geo]);
  return (
    <mesh geometry={geo}>
      <meshBasicMaterial
        map={wash}
        vertexColors
        transparent
        opacity={0.5}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

export function GroundPool({
  texture,
  position,
  size,
  color,
  opacity,
}: {
  texture: THREE.Texture;
  position: [number, number];
  size: [number, number];
  color: string;
  opacity: number;
}) {
  return (
    <mesh position={[position[0], 0.014, position[1]]} rotation-x={-Math.PI / 2}>
      <planeGeometry args={size} />
      <meshBasicMaterial
        map={texture}
        color={color}
        transparent
        opacity={opacity}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </mesh>
  );
}
