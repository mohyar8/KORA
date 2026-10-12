"use client";

import { useMemo, type ReactNode } from "react";
import * as THREE from "three";
import { CORNER_SLOTS } from "@/lib/exhibition/layout";
import { useQuality } from "../quality";
import { broadcastTexture } from "../textures";
import { useAsyncTexture } from "../useAsyncTexture";
import { Screen } from "../kit/booth";
import { dashboardTexture, fasciaTexture, infoPanelTexture, worldMapTexture } from "../kit/panels";
import { Detail, glow, useDispose, type V3 } from "../kit/primitives";

/**
 * The navy shell family (Technology / Economy & Investment renders,
 * references/…12.05.48 PM.jpeg and …(3).jpeg): navy back and side walls, a
 * header fascia with the title and the official KORA lockup at both ends,
 * white linear ceiling lights, brand-colour edge panels at the opening, and a
 * dark floor with white pitch lines. Adapted to the masterplan slot sizes.
 */

const H = 2.6;
const NAVY = "#1b2350";

function floorTexture() {
  const c = document.createElement("canvas");
  c.width = 512;
  c.height = 512;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = "#161b33";
  ctx.fillRect(0, 0, 512, 512);
  ctx.strokeStyle = "rgba(236,239,245,0.75)";
  ctx.lineWidth = 5;
  ctx.strokeRect(24, 24, 464, 464);
  ctx.beginPath();
  ctx.moveTo(256, 24);
  ctx.lineTo(256, 488);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(256, 256, 70, 0, Math.PI * 2);
  ctx.stroke();
  ctx.strokeRect(24, 170, 70, 172);
  ctx.strokeRect(418, 170, 70, 172);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function NavyShell({
  w,
  d,
  title,
  subtitle,
  edge,
  children,
}: {
  w: number;
  d: number;
  title: string;
  subtitle?: string;
  /** Edge panel colours (left, right as seen from the front). */
  edge: [string, string];
  children: ReactNode;
}) {
  const q = useQuality();
  const fascia = useAsyncTexture(() => fasciaTexture(title, subtitle));
  const floor = useMemo(() => floorTexture(), []);
  useDispose(floor);
  const back = -d / 2;
  const white = glow("#f4f7ff", 2.4);
  return (
    <group>
      {/* Floor plinth with pitch lines. */}
      <mesh position={[0, 0.03, 0]} receiveShadow>
        <boxGeometry args={[w, 0.06, d]} />
        <meshStandardMaterial map={floor} roughness={0.55} />
      </mesh>
      {/* Walls. */}
      <mesh position={[0, H / 2, back + 0.04]} castShadow receiveShadow>
        <boxGeometry args={[w, H, 0.08]} />
        <meshStandardMaterial color={NAVY} roughness={0.7} />
      </mesh>
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * (w / 2 - 0.04), H / 2, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.08, H, d]} />
          <meshStandardMaterial color={NAVY} roughness={0.7} />
        </mesh>
      ))}
      {/* Brand-colour edge panels at the opening. */}
      {[-1, 1].map((s, i) => (
        <mesh key={s} position={[s * (w / 2 - 0.12), H / 2, d / 2 - 0.3]} rotation-y={s * 0.5}>
          <boxGeometry args={[0.06, H - 0.1, 0.5]} />
          <meshStandardMaterial color={edge[i]} roughness={0.6} />
        </mesh>
      ))}
      {/* Ceiling + linear lights. */}
      <mesh position={[0, H + 0.02, 0]} rotation-x={Math.PI / 2}>
        <planeGeometry args={[w, d]} />
        <meshStandardMaterial color="#141a3a" roughness={0.8} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, H - 0.01, d / 2 - 0.55]}>
        <boxGeometry args={[w * 0.55, 0.02, 0.12]} />
        <meshBasicMaterial color={white} toneMapped={false} />
      </mesh>
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * w * 0.3, H - 0.01, -0.1]} rotation-y={s * 0.6}>
          <boxGeometry args={[0.02, 0.02, d * 0.6]} />
          <meshBasicMaterial color={white} toneMapped={false} />
        </mesh>
      ))}
      {/* Header fascia. */}
      <mesh position={[0, H + 0.24, d / 2 - 0.05]} castShadow>
        <boxGeometry args={[w + 0.1, 0.48, 0.1]} />
        <meshStandardMaterial color={NAVY} roughness={0.6} />
      </mesh>
      {fascia && (
        <mesh position={[0, H + 0.24, d / 2 + 0.006]}>
          <planeGeometry args={[w + 0.08, 0.46]} />
          <meshStandardMaterial map={fascia} emissive="#ffffff" emissiveMap={fascia} emissiveIntensity={0.55} roughness={0.6} />
        </mesh>
      )}
      <Detail>
        {children}
        {q.lights && <pointLight position={[0, H - 0.4, 0.2]} color="#e8eeff" intensity={9} distance={5} decay={2} />}
      </Detail>
    </group>
  );
}

/** Simplified stadium miniature (a stand-in for a designer model, see GATE 2). */
function StadiumModel({ position, scale = 1, cutaway = false }: { position: V3; scale?: number; cutaway?: boolean }) {
  const theta = cutaway ? Math.PI : Math.PI * 2;
  const geo = useMemo(
    () => ({
      bowl: new THREE.CylinderGeometry(0.46, 0.38, 0.16, 40, 1, true, 0, theta),
      upper: new THREE.CylinderGeometry(0.5, 0.47, 0.06, 40, 1, true, 0, theta),
      pitch: new THREE.BoxGeometry(0.5, 0.02, 0.32),
    }),
    [theta],
  );
  useDispose(geo.bowl, geo.upper, geo.pitch);
  return (
    <group position={position} scale={[scale * 1.25, scale, scale]}>
      <mesh geometry={geo.bowl} position={[0, 0.08, 0]} castShadow>
        <meshStandardMaterial color="#d9dbe2" roughness={0.6} side={THREE.DoubleSide} />
      </mesh>
      <mesh geometry={geo.upper} position={[0, 0.19, 0]}>
        <meshStandardMaterial color="#9aa0ad" roughness={0.5} side={THREE.DoubleSide} />
      </mesh>
      <mesh geometry={geo.pitch} position={[0, 0.02, 0]}>
        <meshStandardMaterial color="#3a8f46" roughness={0.8} />
      </mesh>
    </group>
  );
}

function Panel({ heading, lines, size, position, rotationY = 0, accent }: { heading: string; lines: string[]; size: [number, number]; position: V3; rotationY?: number; accent?: string }) {
  const tex = useAsyncTexture(async () => (await infoPanelTexture(heading, lines, { accent })).tex);
  return tex ? (
    <mesh position={position} rotation-y={rotationY}>
      <planeGeometry args={size} />
      <meshStandardMaterial map={tex} emissive="#ffffff" emissiveMap={tex} emissiveIntensity={0.3} roughness={0.7} />
    </mesh>
  ) : null;
}

function Kiosk({ position, rotationY = 0, screen }: { position: V3; rotationY?: number; screen: THREE.Texture }) {
  return (
    <group position={position} rotation-y={rotationY}>
      <mesh position={[0, 0.42, 0]} castShadow>
        <boxGeometry args={[0.36, 0.84, 0.3]} />
        <meshStandardMaterial color="#10142a" roughness={0.5} metalness={0.3} />
      </mesh>
      <mesh position={[0, 0.9, 0.02]} rotation-x={-0.9} castShadow>
        <boxGeometry args={[0.7, 0.04, 0.45]} />
        <meshStandardMaterial color="#0a0c18" roughness={0.4} />
      </mesh>
      <mesh position={[0, 0.925, 0.03]} rotation-x={-0.9 - Math.PI / 2}>
        <planeGeometry args={[0.64, 0.4]} />
        <meshBasicMaterial map={screen} toneMapped={false} />
      </mesh>
    </group>
  );
}

const TECH = CORNER_SLOTS[0];
const ECON = CORNER_SLOTS[3];

export function TechnologyCorner() {
  const { w, d } = TECH;
  const tex = useMemo(
    () => ({ dash: dashboardTexture(4), plan: dashboardTexture(8), feeds: [1, 2, 3, 4].map((s) => broadcastTexture(20 + s)) }),
    [],
  );
  useDispose(tex.dash, tex.plan, ...tex.feeds);
  const back = -d / 2 + 0.1;
  return (
    <NavyShell w={w} d={d} title="ركن التقنية" subtitle="TECHNOLOGY CORNER" edge={["#4ea649", "#f26557"]}>
      <Screen texture={tex.dash} size={[1.5, 0.84]} position={[0, 1.62, back]} />
      {/* Left wall: video grid. */}
      {tex.feeds.map((t, i) => (
        <Screen
          key={i}
          texture={t}
          size={[0.48, 0.27]}
          position={[-w / 2 + 0.11, 1.35 + Math.floor(i / 2) * 0.33, -0.55 + (i % 2) * 0.54]}
          rotationY={Math.PI / 2}
        />
      ))}
      {/* Right wall: stadium system panel + smart-stadium cutaway. */}
      <Panel heading="منظومة الملعب" lines={["الملعب الذكي", "البيانات والتحليل"]} size={[0.7, 1.05]} position={[w / 2 - 0.09, 1.55, -0.45]} rotationY={-Math.PI / 2} />
      <mesh position={[w / 2 - 0.5, 0.4, 0.35]} castShadow>
        <boxGeometry args={[0.72, 0.8, 0.6]} />
        <meshStandardMaterial color="#141a3a" roughness={0.6} />
      </mesh>
      <StadiumModel position={[w / 2 - 0.5, 0.8, 0.35]} scale={0.75} cutaway />
      <Kiosk position={[0, 0, -0.35]} screen={tex.plan} />
    </NavyShell>
  );
}

export function EconomyCorner() {
  const { w, d } = ECON;
  const tex = useMemo(() => ({ dash: dashboardTexture(11), map: worldMapTexture(), kiosk: dashboardTexture(13) }), []);
  useDispose(tex.dash, tex.map, tex.kiosk);
  const back = -d / 2 + 0.1;
  const gold = "#c9a45a";
  return (
    <NavyShell w={w} d={d} title="الاقتصاد والاستثمار" edge={["#4ea649", "#f26557"]}>
      <Screen texture={tex.dash} size={[1.9, 0.82]} position={[0, 1.7, back]} />
      {/* Gold angled panels flanking the screen. */}
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * 1.2, 1.3, back + 0.12]} rotation-y={-s * 0.35}>
          <boxGeometry args={[0.12, 2.3, 0.05]} />
          <meshStandardMaterial color={gold} roughness={0.35} metalness={0.6} />
        </mesh>
      ))}
      {/* Centre plinth with the stadium miniature and radial topic markers. */}
      <mesh position={[0, 0.3, 0.05]} castShadow>
        <boxGeometry args={[1.25, 0.6, 0.7]} />
        <meshStandardMaterial color="#141a3a" roughness={0.6} />
      </mesh>
      <mesh position={[0, 0.61, 0.05]}>
        <boxGeometry args={[1.27, 0.02, 0.72]} />
        <meshStandardMaterial color={gold} roughness={0.35} metalness={0.6} />
      </mesh>
      <StadiumModel position={[0, 0.62, 0.05]} scale={0.95} />
      {Array.from({ length: 8 }, (_, i) => {
        const a = Math.PI * (0.1 + (i / 7) * 0.8);
        return (
          <mesh key={i} position={[Math.cos(a) * 0.85, 1.12 + (i % 2) * 0.12, 0.05 - Math.sin(a) * 0.45]}>
            <cylinderGeometry args={[0.07, 0.07, 0.025, 16]} />
            <meshStandardMaterial color="#0d1028" emissive="#7fb2ff" emissiveIntensity={0.25} roughness={0.5} />
          </mesh>
        );
      })}
      {/* Left: investors panel with world map + kiosk. */}
      <Panel heading="أبرز المستثمرين" lines={["في مجال الرياضة"]} size={[0.62, 1.0]} position={[-w / 2 + 0.09, 1.6, -0.2]} rotationY={Math.PI / 2} accent="#4ea649" />
      <mesh position={[-w / 2 + 0.095, 1.25, -0.2]} rotation-y={Math.PI / 2}>
        <planeGeometry args={[0.52, 0.3]} />
        <meshBasicMaterial map={tex.map} toneMapped={false} />
      </mesh>
      <Kiosk position={[-w / 2 + 0.55, 0, 0.35]} rotationY={0.6} screen={tex.kiosk} />
      {/* Right: stadium system panel with three topic cards. */}
      <Panel heading="منظومة الملعب" lines={[]} size={[0.62, 1.0]} position={[w / 2 - 0.09, 1.6, -0.2]} rotationY={-Math.PI / 2} accent="#f26557" />
      {["#944399", "#f26557", "#c9a45a"].map((c, i) => (
        <mesh key={c} position={[w / 2 - 0.095, 1.35, -0.42 + i * 0.22]} rotation-y={-Math.PI / 2}>
          <planeGeometry args={[0.18, 0.4]} />
          <meshStandardMaterial color={c} roughness={0.6} />
        </mesh>
      ))}
    </NavyShell>
  );
}
