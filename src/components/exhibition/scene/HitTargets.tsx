"use client";

import type { ThreeEvent } from "@react-three/fiber";
import { AREA_ORDER, AREAS } from "@/lib/exhibition/areas";
import { BUILDINGS } from "@/lib/exhibition/layout";
import type { AreaId } from "@/lib/exhibition/types";

/** Pointer travel (px) above which a press counts as a look-drag, not a click. */
export const CLICK_SLOP = 6;

/**
 * Invisible, model-independent click/hover volumes for every selectable
 * area. They stay valid when an area's visual model is swapped.
 */
export function HitTargets({
  current,
  onSelect,
  onHover,
}: {
  current: AreaId | null;
  onSelect: (id: AreaId) => void;
  onHover: (id: AreaId | null, x?: number, y?: number) => void;
}) {
  return (
    <group>
      {/* Solid buildings swallow pointer events so areas hidden behind them can't be picked through walls. */}
      {Object.entries(BUILDINGS).map(([key, b]) => (
        <mesh
          key={key}
          position={[(b.minX + b.maxX) / 2, b.height / 2, (b.minZ + b.maxZ + 3.5) / 2]}
          onClick={(e) => e.stopPropagation()}
          onPointerOver={(e) => {
            e.stopPropagation();
            onHover(null);
          }}
          onPointerMove={(e) => e.stopPropagation()}
        >
          <boxGeometry args={[b.maxX - b.minX, b.height, b.maxZ - b.minZ + 3.5]} />
          {/* Never drawn: raycast-only volume. */}
            <meshBasicMaterial visible={false} />
        </mesh>
      ))}
      {AREA_ORDER.flatMap((id) =>
        AREAS[id].hitBoxes.map(({ center, size }, i) => (
          <mesh
            key={`${id}-${i}`}
            position={center}
            onClick={(e: ThreeEvent<MouseEvent>) => {
              if (e.delta > CLICK_SLOP) return;
              e.stopPropagation();
              if (id !== current) onSelect(id);
            }}
            onPointerOver={(e) => {
              e.stopPropagation();
              onHover(id === current ? null : id, e.nativeEvent.offsetX, e.nativeEvent.offsetY);
            }}
            onPointerMove={(e) => {
              e.stopPropagation();
              onHover(id === current ? null : id, e.nativeEvent.offsetX, e.nativeEvent.offsetY);
            }}
            onPointerOut={() => onHover(null)}
          >
            <boxGeometry args={size} />
            {/* Never drawn: raycast-only volume. */}
            <meshBasicMaterial visible={false} />
          </mesh>
        )),
      )}
    </group>
  );
}
