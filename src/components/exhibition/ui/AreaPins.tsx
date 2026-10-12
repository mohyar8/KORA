"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, type RefObject } from "react";
import * as THREE from "three";
import { AREA_ORDER, AREAS, CORNER_IDS, isCorner } from "@/lib/exhibition/areas";
import { BUILDINGS, MUSEUM } from "@/lib/exhibition/layout";
import type { AreaId } from "@/lib/exhibition/types";

/**
 * In-scene labels as real DOM buttons (focusable, screen-reader named,
 * keyboard operable), positioned every rendered frame from 3D anchor points.
 * Pins are hidden when behind a building, behind the camera, or overlapping a
 * higher-priority pin. They draw above the area card so neighbouring areas
 * always stay reachable.
 *
 * The same pass positions the world-anchored area card: it follows its world
 * point (so it stays with the area when the visitor looks around), is kept
 * inside the viewport while that point is in view, and hides when it is not.
 */

export type PinRegistry = {
  pins: Map<AreaId, HTMLButtonElement>;
  /** The open area card (world-anchored) and its world anchor. */
  card: HTMLElement | null;
  cardAt: readonly [number, number, number] | null;
};

const PRIORITY: readonly AreaId[] = ["museum", "stage", "entertainment", ...CORNER_IDS];

/** Solid volumes that hide labels (ghosted placeholders deliberately don't). */
const OCCLUDERS = [
  ...Object.values(BUILDINGS).map(
    (b) => new THREE.Box3(new THREE.Vector3(b.minX, 0, b.minZ), new THREE.Vector3(b.maxX, b.height, b.maxZ + 3.5)),
  ),
  new THREE.Box3(
    new THREE.Vector3(MUSEUM.facadeX, 0, MUSEUM.northZ),
    new THREE.Vector3(MUSEUM.facadeX + MUSEUM.depth, MUSEUM.height, MUSEUM.northZ + MUSEUM.length),
  ),
];

type Rect = { x0: number; y0: number; x1: number; y1: number };

const cardV = new THREE.Vector3();
const MARGIN = 12;

/** Positions the world-anchored card for this frame (see PinRegistry). */
function placeCard(reg: PinRegistry, camera: THREE.Camera, size: { width: number; height: number }) {
  const el = reg.card;
  if (!el || !reg.cardAt) return;
  cardV.set(reg.cardAt[0], reg.cardAt[1], reg.cardAt[2]).project(camera);
  // In view = anchor in front of the camera and within the frame (+ a little slack).
  const inView = cardV.z < 1 && Math.abs(cardV.x) <= 1.1 && Math.abs(cardV.y) <= 1.15;
  const w = el.offsetWidth;
  const h = el.offsetHeight;
  let x = ((cardV.x + 1) / 2) * size.width - w / 2;
  // The card hangs below its world point (top edge at the anchor), so the
  // subject above the anchor stays visible on every aspect ratio.
  let y = ((1 - cardV.y) / 2) * size.height + 8;
  x = Math.min(Math.max(x, MARGIN), size.width - w - MARGIN);
  y = Math.min(Math.max(y, 64), size.height - h - MARGIN);
  el.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`;
  el.dataset.inview = inView ? "true" : "false";
}
const overlaps = (a: Rect, b: Rect) => a.x0 < b.x1 && a.x1 > b.x0 && a.y0 < b.y1 && a.y1 > b.y0;

/** Runs inside the Canvas: projects pins after the camera rig has moved. */
export function PinProjector({ registry, current }: { registry: RefObject<PinRegistry>; current: AreaId | null }) {
  const tmp = useMemo(
    () => ({ v: new THREE.Vector3(), ray: new THREE.Ray(), hit: new THREE.Vector3(), dir: new THREE.Vector3() }),
    [],
  );

  useFrame(({ camera, size }) => {
    const reg = registry.current;
    if (!reg) return;
    placeCard(reg, camera, size);
    const placed: Rect[] = [];
    for (const id of PRIORITY) {
      const el = reg.pins.get(id);
      if (!el) continue;
      const at = AREAS[id].labelAt;
      tmp.v.set(at[0], at[1], at[2]);
      const dist = tmp.v.distanceTo(camera.position);
      tmp.dir.copy(tmp.v).sub(camera.position).normalize();
      tmp.ray.set(camera.position, tmp.dir);
      let hidden = id === current;
      for (const o of OCCLUDERS) {
        if (hidden) break;
        if (o.containsPoint(tmp.v)) continue;
        const h = tmp.ray.intersectBox(o, tmp.hit);
        if (h && h.distanceTo(camera.position) < dist - 0.5) hidden = true;
      }
      tmp.v.project(camera);
      if (tmp.v.z > 1 || Math.abs(tmp.v.x) > 1.05 || Math.abs(tmp.v.y) > 1.05) hidden = true;
      const x = ((tmp.v.x + 1) / 2) * size.width;
      const y = ((1 - tmp.v.y) / 2) * size.height;
      if (!hidden) {
        const w = el.offsetWidth;
        const h = el.offsetHeight;
        // Collision box slightly smaller than the pin: neighbours may touch.
        const rect = { x0: x - w / 2 + 5, y0: y - h + 5, x1: x + w / 2 - 5, y1: y - 3 };
        if (placed.some((p) => overlaps(p, rect))) hidden = true;
        else placed.push(rect);
      }
      el.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`;
      el.dataset.hidden = hidden ? "true" : "false";
      el.tabIndex = hidden ? -1 : 0;
    }
  });

  return null;
}

/** The DOM side: one button per area. */
export function AreaPins({
  registry,
  current,
  overview,
  onSelect,
}: {
  registry: RefObject<PinRegistry>;
  current: AreaId | null;
  overview: boolean;
  onSelect: (id: AreaId) => void;
}) {
  return (
    <div className="exh-pins" data-mode={overview ? "overview" : "anchored"}>
      {AREA_ORDER.map((id) => {
        const area = AREAS[id];
        const corner = isCorner(id);
        return (
          <button
            key={id}
            type="button"
            className="exh-pin"
            data-kind={area.kind}
            data-hidden="true"
            data-placeholder={area.model === "placeholder" ? "true" : undefined}
            aria-label={`${area.content.name}${area.id === current ? " (المنطقة الحالية)" : ""}`}
            ref={(el) => {
              const reg = registry.current;
              if (!reg) return;
              if (el) reg.pins.set(id, el);
              else reg.pins.delete(id);
            }}
            onClick={() => onSelect(id)}
          >
            {corner && <span className="exh-pin-num">{CORNER_IDS.indexOf(id) + 1}</span>}
            <span className="exh-pin-label">{area.content.shortName}</span>
          </button>
        );
      })}
    </div>
  );
}
