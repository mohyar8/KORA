"use client";

import { useMemo } from "react";
import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { ENTERTAINMENT } from "@/lib/exhibition/layout";
import { useQuality } from "../quality";
import { useAsyncTexture } from "../useAsyncTexture";
import { Plate, Screen } from "../kit/booth";
import { entertainmentSignTexture, matchScreenTexture, playfieldTexture } from "../kit/panels";
import { Detail, Instanced, Struts, glow, truss, tubeAlong, useDispose, type Placement, type Segment, type V3 } from "../kit/primitives";

/**
 * Entertainment zone «ركن الترفيه», after references/…12.05.49 PM (5).jpeg,
 * inside the provisional footprint north of the passage (D-19). Local frame:
 * zone centre, +Z towards the passage (the visitor's approach).
 *
 * From the render: a large blue LED arch with the zone sign, sponsor totems
 * (neutral labels), a big screen on truss with benches and football bean
 * bags, a console area, a 1v1 mini-pitch cage, air hockey, foosball,
 * football-tennis, a football bowling lane, crossbar and goalkeeper targets,
 * a kick-shot cabinet, ring toss, stick challenge, board-game tables and a
 * target board. Game/brand marks ("FC 27", sponsors) are not reproduced.
 */

const W = ENTERTAINMENT.maxX - ENTERTAINMENT.minX;
const D = ENTERTAINMENT.maxZ - ENTERTAINMENT.minZ;
const BLUE = "#5fb2ff";

function ballTexture() {
  const c = document.createElement("canvas");
  c.width = 256;
  c.height = 128;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = "#f2f2f2";
  ctx.fillRect(0, 0, 256, 128);
  ctx.fillStyle = "#151515";
  for (let i = 0; i < 10; i++) {
    const x = (i % 5) * 52 + (i < 5 ? 20 : 46);
    const y = i < 5 ? 36 : 92;
    ctx.beginPath();
    for (let k = 0; k < 5; k++) {
      const a = -Math.PI / 2 + (k * 2 * Math.PI) / 5;
      if (k) ctx.lineTo(x + Math.cos(a) * 13, y + Math.sin(a) * 13);
      else ctx.moveTo(x + Math.cos(a) * 13, y + Math.sin(a) * 13);
    }
    ctx.fill();
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function targetTexture() {
  const c = document.createElement("canvas");
  c.width = 256;
  c.height = 256;
  const ctx = c.getContext("2d")!;
  ["#1b2a6b", "#f2f2f2", "#2f6bd8", "#f2f2f2", "#1b2a6b"].forEach((col, i) => {
    ctx.fillStyle = col;
    ctx.beginPath();
    ctx.arc(128, 128, 124 - i * 24, 0, Math.PI * 2);
    ctx.fill();
  });
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

/** Rectangle outline on the floor (rug edges / play areas), as segments. */
function rect(x: number, z: number, w: number, d: number): Segment[] {
  const y = 0.03;
  const a: V3 = [x - w / 2, y, z - d / 2];
  const b: V3 = [x + w / 2, y, z - d / 2];
  const c: V3 = [x + w / 2, y, z + d / 2];
  const e: V3 = [x - w / 2, y, z + d / 2];
  return [
    [a, b],
    [b, c],
    [c, e],
    [e, a],
  ];
}

/** A goal frame (posts + crossbar) between two points on the ground. */
function goal(x: number, z: number, w: number, h: number, rotY = 0): Segment[] {
  const c = Math.cos(rotY);
  const s = Math.sin(rotY);
  const p = (dx: number, y: number): V3 => [x + dx * c, y, z - dx * s];
  return [
    [p(-w / 2, 0), p(-w / 2, h)],
    [p(w / 2, 0), p(w / 2, h)],
    [p(-w / 2, h), p(w / 2, h)],
  ];
}

export function EntertainmentZone() {
  const q = useQuality();
  const sign = useAsyncTexture(entertainmentSignTexture);
  const built = useMemo(() => {
    const backZ = -D / 2 + 1.2;
    // Double LED arch framing the back of the zone.
    const archPath = (inset: number): V3[] => {
      const x = 9.5 - inset;
      const top = 7 - inset;
      const r = 2.2;
      const pts: V3[] = [[-x, 0, backZ]];
      pts.push([-x, top - r, backZ]);
      for (let i = 1; i < 6; i++) {
        const a = Math.PI - (i / 6) * (Math.PI / 2);
        pts.push([-x + r + Math.cos(a) * r, top - r + Math.sin(a) * r, backZ]);
      }
      pts.push([-x + r, top, backZ], [x - r, top, backZ]);
      for (let i = 1; i < 6; i++) {
        const a = Math.PI / 2 - (i / 6) * (Math.PI / 2);
        pts.push([x - r + Math.cos(a) * r, top - r + Math.sin(a) * r, backZ]);
      }
      pts.push([x, top - r, backZ], [x, 0, backZ]);
      return pts;
    };
    const arches = mergeGeometries([tubeAlong(archPath(0), 0.1), tubeAlong(archPath(0.7), 0.08)].map((g) => g.toNonIndexed()));
    // Big screen on box truss.
    const screenTruss: Segment[] = [
      ...truss([-3.9, 0, backZ + 1.3], [-3.9, 5.8, backZ + 1.3], 0.3, 0.5),
      ...truss([3.9, 0, backZ + 1.3], [3.9, 5.8, backZ + 1.3], 0.3, 0.5),
      ...truss([-3.9, 5.7, backZ + 1.3], [3.9, 5.7, backZ + 1.3], 0.3, 0.5),
    ];
    // Mini pitch cage, rails, goals and floor outlines.
    const cage: Segment[] = [];
    const cx = -3.5;
    const cz = 5.5;
    const cw = 6;
    const cd = 4;
    const corners: [number, number][] = [
      [cx - cw / 2, cz - cd / 2],
      [cx + cw / 2, cz - cd / 2],
      [cx + cw / 2, cz + cd / 2],
      [cx - cw / 2, cz + cd / 2],
    ];
    corners.forEach(([x, z], i) => {
      const [nx, nz] = corners[(i + 1) % 4];
      cage.push([[x, 0, z], [x, 1.6, z]], [[x, 1.6, z], [nx, 1.6, nz]], [[x, 0.5, z], [nx, 0.5, nz]]);
    });
    const goals: Segment[] = [
      ...goal(cx - cw / 2 + 0.4, cz, 1.6, 1.0, Math.PI / 2),
      ...goal(cx + cw / 2 - 0.4, cz, 1.6, 1.0, Math.PI / 2),
      ...goal(-9, -6.2, 3, 2), // crossbar challenge
      ...goal(8.6, -6.4, 3, 2), // goalkeeper target
      ...goal(-12.5, -4.5, 0.1, 2.2), // stick challenge pole
    ];
    const outlines: Segment[] = [
      ...rect(0, -1.6, 3.6, 2.6), // console rug
      ...rect(-9.8, 6.2, 5.2, 4.4), // air hockey
      ...rect(4, 6.4, 2.6, 2.2), // foosball
      ...rect(8.2, 0.6, 3.6, 2.8), // football tennis
      ...rect(12.6, 8.2, 2.6, 2.6), // target challenge
    ];
    // Bowling lane: long navy box with lit edges, angled towards the back right.
    const lane = new THREE.BoxGeometry(1.0, 0.16, 6.5).rotateY(-0.5).translate(12.3, 0.08, 2.6);
    const nets = mergeGeometries(
      corners.map(([x, z], i) => {
        const [nx, nz] = corners[(i + 1) % 4];
        const len = Math.hypot(nx - x, nz - z);
        const g = new THREE.PlaneGeometry(len, 1.6);
        g.rotateY(-Math.atan2(nz - z, nx - x));
        g.translate((x + nx) / 2, 0.8, (z + nz) / 2);
        g.deleteAttribute("uv");
        return g.toNonIndexed();
      }),
    );
    return {
      backZ,
      arches,
      screenTruss,
      cage,
      goals,
      outlines,
      lane,
      nets,
      table: new THREE.BoxGeometry(1, 0.8, 1).translate(0, 0.4, 0),
      top: new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2),
      bench: new THREE.BoxGeometry(3, 0.45, 0.5).translate(0, 0.225, 0),
      ball: new THREE.SphereGeometry(0.42, 24, 16),
      stool: new THREE.CylinderGeometry(0.18, 0.18, 0.45, 12).translate(0, 0.225, 0),
      pin: new THREE.CylinderGeometry(0.05, 0.07, 0.36, 10).translate(0, 0.18, 0),
      totem: new THREE.BoxGeometry(1.3, 4.2, 0.45).translate(0, 2.1, 0),
      match: matchScreenTexture(5),
      console: matchScreenTexture(9),
      kick: matchScreenTexture(14),
      hockey: playfieldTexture("hockey"),
      foos: playfieldTexture("foosball"),
      tennis: playfieldTexture("tennis"),
      turf: playfieldTexture("pitch"),
      ballTex: ballTexture(),
      target: targetTexture(),
    };
  }, []);
  useDispose(
    built.arches,
    built.lane,
    built.nets,
    built.table,
    built.top,
    built.bench,
    built.ball,
    built.stool,
    built.pin,
    built.totem,
    built.match,
    built.console,
    built.kick,
    built.hockey,
    built.foos,
    built.tennis,
    built.turf,
    built.ballTex,
    built.target,
  );

  const B = built.backZ;
  const benches = useMemo<Placement[]>(
    () => [-2.2, 2.2].flatMap((x) => [B + 3.3, B + 4.2].map((z, i) => ({ p: [x, i * 0.2, z] as V3 }))),
    [B],
  );
  const balls = useMemo<Placement[]>(
    () => [
      { p: [-0.8, 0.42, -0.9], r: 0.4 },
      { p: [0.8, 0.42, -0.9], r: 1.2 },
      { p: [-1.3, 0.42, B + 5.3], r: 2 },
      { p: [1.3, 0.42, B + 5.3], r: 0.7 },
    ],
    [B],
  );
  const tables = useMemo(
    () => ({
      hockey: [
        { p: [-11, 0, 5.4] as V3, s: [2.0, 1, 1.1] as V3 },
        { p: [-8.6, 0, 7.1] as V3, s: [2.0, 1, 1.1] as V3, r: 0.3 },
      ],
      foos: [{ p: [4, 0, 6.4] as V3, s: [1.4, 1, 0.8] as V3 }],
      tennis: [{ p: [8.2, 0, 0.6] as V3, s: [2.6, 0.95, 1.5] as V3 }],
      board: [
        { p: [-10.5, 0, -0.8] as V3, s: [0.9, 0.95, 0.9] as V3 },
        { p: [-8.7, 0, -0.2] as V3, s: [0.9, 0.95, 0.9] as V3 },
      ],
    }),
    [],
  );
  const tops = (list: Placement[]) =>
    list.map((t) => ({ p: [t.p[0], (t.s?.[1] ?? 1) * 0.8 + 0.006, t.p[2]] as V3, s: [t.s?.[0] ?? 1, 1, t.s?.[2] ?? 1] as V3, r: t.r }));
  const stools = useMemo<Placement[]>(
    () =>
      tables.board.flatMap((t) =>
        [
          [0.75, 0],
          [-0.75, 0],
          [0, 0.75],
          [0, -0.75],
        ].map(([dx, dz]) => ({ p: [t.p[0] + dx, 0, t.p[2] + dz] as V3 })),
      ),
    [tables],
  );
  const pins = useMemo<Placement[]>(() => {
    const out: Placement[] = [];
    const base: V3 = [13.9, 0.16, -0.2];
    for (let row = 0; row < 4; row++)
      for (let i = 0; i <= row; i++) out.push({ p: [base[0] + (i - row / 2) * 0.16, base[1], base[2] - row * 0.16] });
    return out;
  }, []);

  const blue = glow(BLUE, 1.7);
  const metal = <meshStandardMaterial color="#cfd3da" roughness={0.35} metalness={0.7} />;

  // The zone sits behind Buildings 70/57: render it only when the camera is near.
  return (
    <Detail distance={40}>
      {/* LED arch + zone sign + sponsor totems. */}
      <mesh geometry={built.arches}>
        <meshBasicMaterial color={blue} toneMapped={false} />
      </mesh>
      {sign && (
        <mesh position={[0, 6.6, B + 0.05]}>
          <planeGeometry args={[4.2, 1.31]} />
          <meshBasicMaterial map={sign} toneMapped={false} />
        </mesh>
      )}
      <Instanced
        geometry={built.totem}
        items={[
          { p: [-12.6, 0, B + 1.2] },
          { p: [12.6, 0, B + 1.2] },
        ]}
      >
        <meshStandardMaterial color="#1a2a6b" emissive={BLUE} emissiveIntensity={0.15} roughness={0.5} />
      </Instanced>
      {[-12.6, 12.6].map((x) => (
        <Plate key={x} lines={[{ text: "راعٍ", size: 110 }]} size={[1.0, 0.5]} position={[x, 3.3, B + 1.45]} bg="#ffffff" fg="#1a2a6b" />
      ))}

      {/* Big screen + benches + bean bags. */}
      <Struts segments={built.screenTruss} radius={0.022}>
        <meshStandardMaterial color="#1a1b20" roughness={0.45} metalness={0.7} />
      </Struts>
      <Screen texture={built.match} size={[7, 3.9]} position={[0, 3.3, B + 1.2]} brightness={1.05} />
      <Instanced geometry={built.bench} items={benches} castShadow>
        <meshStandardMaterial color="#25336f" roughness={0.6} />
      </Instanced>
      <Instanced geometry={built.ball} items={balls} castShadow>
        <meshStandardMaterial map={built.ballTex} roughness={0.55} />
      </Instanced>

      {/* Console area: screen on a stand. */}
      <mesh position={[0, 0.7, -2.6]}>
        <boxGeometry args={[0.12, 1.4, 0.12]} />
        <meshStandardMaterial color="#111" roughness={0.5} />
      </mesh>
      <Screen texture={built.console} size={[1.8, 1.0]} position={[0, 1.75, -2.55]} />

      {/* Tables: air hockey, foosball, football-tennis, board games. */}
      <Instanced geometry={built.table} items={[...tables.hockey, ...tables.foos, ...tables.board]} castShadow>
        <meshStandardMaterial color="#1c2440" roughness={0.5} />
      </Instanced>
      <Instanced geometry={built.table} items={tables.tennis.map((t) => ({ ...t, s: [t.s[0], 0.92, t.s[2]] as V3 }))} castShadow>
        <meshStandardMaterial color="#d8dce4" roughness={0.4} />
      </Instanced>
      <Instanced geometry={built.top} items={tops(tables.hockey)}>
        <meshBasicMaterial map={built.hockey} toneMapped={false} />
      </Instanced>
      <Instanced geometry={built.top} items={tops(tables.foos)}>
        <meshStandardMaterial map={built.foos} roughness={0.6} />
      </Instanced>
      <Instanced geometry={built.top} items={tops(tables.tennis).map((t) => ({ ...t, p: [t.p[0], 0.75, t.p[2]] as V3 }))}>
        <meshStandardMaterial map={built.tennis} roughness={0.6} />
      </Instanced>
      <Instanced geometry={built.stool} items={stools}>
        <meshStandardMaterial color="#2c3a7a" roughness={0.6} />
      </Instanced>

      {/* Mini pitch cage (turf, posts, rails, goals, translucent netting). */}
      <mesh position={[-3.5, 0.02, 5.5]} rotation-x={-Math.PI / 2} receiveShadow>
        <planeGeometry args={[6, 4]} />
        <meshStandardMaterial map={built.turf} roughness={0.9} />
      </mesh>
      <Struts segments={[...built.cage, ...built.goals]} radius={0.035}>
        {metal}
      </Struts>
      <mesh geometry={built.nets}>
        <meshBasicMaterial color="#e8eefc" transparent opacity={0.07} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>

      {/* Goalkeeper target board + kick-shot cabinet + target challenge + ring toss. */}
      <mesh position={[8.6, 1.0, -6.42]}>
        <planeGeometry args={[2.9, 1.95]} />
        <meshStandardMaterial color="#e9ecf2" roughness={0.6} />
      </mesh>
      <mesh position={[8.6, 1.0, -6.4]}>
        <circleGeometry args={[0.65, 32]} />
        <meshStandardMaterial map={built.target} roughness={0.6} />
      </mesh>
      <group position={[12.8, 0, -6.6]} rotation-y={-0.4}>
        <mesh position={[0, 1.0, 0]} castShadow>
          <boxGeometry args={[0.9, 2.0, 0.9]} />
          <meshStandardMaterial color="#1f6b3a" roughness={0.5} />
        </mesh>
        <Screen texture={built.kick} size={[0.7, 0.42]} position={[0, 1.5, 0.46]} />
      </group>
      <group position={[12.6, 0, 8.2]} rotation-y={-0.7}>
        <mesh position={[0, 1.2, 0]}>
          <circleGeometry args={[0.85, 40]} />
          <meshStandardMaterial map={built.target} roughness={0.6} side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[0, 0.6, -0.05]}>
          <boxGeometry args={[0.1, 1.2, 0.1]} />
          <meshStandardMaterial color="#111" />
        </mesh>
      </group>
      <mesh position={[-12.4, 0.9, -8]} castShadow>
        <boxGeometry args={[1.6, 1.8, 0.2]} />
        <meshStandardMaterial color="#e8ecf4" roughness={0.6} />
      </mesh>

      {/* Football bowling lane + pins. */}
      <mesh geometry={built.lane} castShadow receiveShadow>
        <meshStandardMaterial color="#20306e" roughness={0.4} />
      </mesh>
      <Instanced geometry={built.pin} items={pins}>
        <meshStandardMaterial color="#f4f4f6" roughness={0.4} />
      </Instanced>

      {/* Floor outlines of the play areas (restrained blue light). */}
      <Struts segments={built.outlines} radius={0.02} radial={4}>
        <meshBasicMaterial color={glow(BLUE, 1.3)} toneMapped={false} />
      </Struts>

      {q.lights && (
        <pointLight position={[0, 5, -3]} color="#cfe3ff" intensity={60} distance={22} decay={2} />
      )}
    </Detail>
  );
}

export const ENTERTAINMENT_SIZE = { W, D };
