"use client";

import type { ThreeEvent } from "@react-three/fiber";
import { AREA_ORDER, AREAS } from "@/lib/exhibition/areas";
import type { AreaId } from "@/lib/exhibition/types";

/** Pointer travel (px) above which a press counts as a look-drag, not a click. */
export const CLICK_SLOP = 6;

/**
 * Invisible, model-independent click/hover volumes, one per area. They stay
 * valid when an area's visual model is swapped.
 */
export function HitTargets({
  onSelect,
  onHover,
}: {
  onSelect: (id: AreaId) => void;
  onHover: (id: AreaId | null, x?: number, y?: number) => void;
}) {
  return (
    <group>
      {AREA_ORDER.map((id) => {
        const { center, size } = AREAS[id].hitBox;
        return (
          <mesh
            key={id}
            position={center}
            onClick={(e: ThreeEvent<MouseEvent>) => {
              if (e.delta > CLICK_SLOP) return;
              e.stopPropagation();
              onSelect(id);
            }}
            onPointerOver={(e) => {
              e.stopPropagation();
              onHover(id, e.nativeEvent.offsetX, e.nativeEvent.offsetY);
            }}
            onPointerMove={(e) => onHover(id, e.nativeEvent.offsetX, e.nativeEvent.offsetY)}
            onPointerOut={() => onHover(null)}
          >
            <boxGeometry args={size} />
            <meshBasicMaterial colorWrite={false} depthWrite={false} />
          </mesh>
        );
      })}
    </group>
  );
}
