"use client";

import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { LAWNS, MUSEUM, MUSEUM_BOUNDS, MUSEUM_PATH_PLANTERS, PATHS, PLAZA } from "@/lib/exhibition/layout";
import { Batched } from "./Batched";
import { apronTexture, plazaTexture } from "./textures";
import { useQuality } from "./quality";

const apronDims = {
  // Between the museum-path planter strip and the facade (into the portal recess).
  x0: MUSEUM_BOUNDS.minX - 2,
  x1: MUSEUM_BOUNDS.maxX + 2,
  z0: MUSEUM.facadeZ - MUSEUM.portal.recess - 0.4,
  z1: MUSEUM_PATH_PLANTERS.z - 0.8,
};
const aw = apronDims.x1 - apronDims.x0;
const ad = apronDims.z1 - apronDims.z0;

/** Walkway paving (one merged mesh) and its kerb lines. */
function pathGeometry() {
  const tops: THREE.BufferGeometry[] = [];
  for (const [x0, x1, z0, z1] of PATHS) {
    const g = new THREE.PlaneGeometry(x1 - x0, z1 - z0).rotateX(-Math.PI / 2);
    g.translate((x0 + x1) / 2, 0.008, (z0 + z1) / 2);
    g.deleteAttribute("uv");
    tops.push(g);
  }
  return mergeGeometries(tops);
}

/** Lawn panels (one merged mesh) and their stone edging. */
function lawnGeometry() {
  const grass: THREE.BufferGeometry[] = [];
  const edge: THREE.BufferGeometry[] = [];
  for (const [x0, x1, z0, z1] of LAWNS) {
    const w = x1 - x0;
    const d = z1 - z0;
    grass.push(new THREE.BoxGeometry(w, 0.08, d).translate((x0 + x1) / 2, 0.04, (z0 + z1) / 2));
    edge.push(
      new THREE.BoxGeometry(w + 0.3, 0.14, 0.15).translate((x0 + x1) / 2, 0.07, z0),
      new THREE.BoxGeometry(w + 0.3, 0.14, 0.15).translate((x0 + x1) / 2, 0.07, z1),
      new THREE.BoxGeometry(0.15, 0.14, d).translate(x0, 0.07, (z0 + z1) / 2),
      new THREE.BoxGeometry(0.15, 0.14, d).translate(x1, 0.07, (z0 + z1) / 2),
    );
  }
  return { grass: mergeGeometries(grass), edge: mergeGeometries(edge) };
}

/** Site paving, walkways, lawns, the museum forecourt and its in-ground linear light. */
export function Ground() {
  const q = useQuality();
  const b = PLAZA.pavedBounds;
  const pw = b.maxX - b.minX;
  const pd = b.maxZ - b.minZ;

  const plaza = useMemo(() => {
    const t = plazaTexture(q.groundTex);
    t.repeat.set(pw / 24, pd / 24);
    return t;
  }, [q.groundTex, pw, pd]);

  const apron = useMemo(() => {
    const t = apronTexture(q.groundTex / 2);
    t.repeat.set(aw / 12, ad / 12);
    return t;
  }, [q.groundTex]);

  const paths = useMemo(() => pathGeometry(), []);
  const lawns = useMemo(() => lawnGeometry(), []);

  useEffect(
    () => () => {
      plaza.dispose();
      apron.dispose();
      paths.dispose();
      lawns.grass.dispose();
      lawns.edge.dispose();
    },
    [plaza, apron, paths, lawns],
  );

  const strip = new THREE.Color("#ffbf80").multiplyScalar(1.7);
  // In-ground linear light parallel to the facade, from beyond the portal to the far end (render).
  const lightZ = MUSEUM.facadeZ + 3.4;
  const lightX0 = MUSEUM_BOUNDS.minX + MUSEUM.portal.u1 + 0.6;
  const lightX1 = MUSEUM_BOUNDS.maxX;

  return (
    // Batched: kerbs and lawn edging share one draw.
    <Batched>
      {/* Unpaved / asphalt surroundings. */}
      <mesh rotation-x={-Math.PI / 2} position={[56, -0.02, 0]} receiveShadow>
        <planeGeometry args={[1400, 1400]} />
        <meshStandardMaterial color="#1c1a1d" roughness={1} />
      </mesh>
      <mesh rotation-x={-Math.PI / 2} position={[(b.minX + b.maxX) / 2, 0, (b.minZ + b.maxZ) / 2]} receiveShadow>
        <planeGeometry args={[pw, pd]} />
        <meshStandardMaterial map={plaza} bumpMap={plaza} bumpScale={0.6} roughness={0.88} envMapIntensity={0.35} />
      </mesh>
      {/* Kerb around the paved field (south and east edges; north meets the building forecourts). */}
      <mesh position={[(b.minX + b.maxX) / 2, 0.06, b.maxZ + 0.15]}>
        <boxGeometry args={[pw + 0.6, 0.14, 0.3]} />
        <meshStandardMaterial color="#8d8a84" roughness={0.9} />
      </mesh>
      <mesh position={[b.maxX + 0.15, 0.06, (b.minZ + b.maxZ) / 2]}>
        <boxGeometry args={[0.3, 0.14, pd]} />
        <meshStandardMaterial color="#8d8a84" roughness={0.9} />
      </mesh>

      {/* Walkways: lighter honed stone over the patterned field. */}
      <mesh geometry={paths} receiveShadow>
        <meshStandardMaterial color="#b3aca1" roughness={0.78} envMapIntensity={0.35} polygonOffset polygonOffsetFactor={-1} />
      </mesh>

      {/* Lawns with stone edging. */}
      <mesh geometry={lawns.grass} receiveShadow>
        <meshStandardMaterial color="#3f5636" roughness={1} envMapIntensity={0.45} />
      </mesh>
      <mesh geometry={lawns.edge}>
        <meshStandardMaterial color="#8e877b" roughness={0.9} />
      </mesh>

      {/* Museum forecourt: satin stone, tiles running along the facade. */}
      <mesh
        rotation-x={-Math.PI / 2}
        position={[(apronDims.x0 + apronDims.x1) / 2, 0.006, (apronDims.z0 + apronDims.z1) / 2]}
        receiveShadow
      >
        <planeGeometry args={[aw, ad]} />
        <meshStandardMaterial
          map={apron}
          roughness={0.34}
          metalness={0.05}
          envMapIntensity={0.7}
          polygonOffset
          polygonOffsetFactor={-1}
        />
      </mesh>
      <mesh position={[(lightX0 + lightX1) / 2, 0.012, lightZ]}>
        <boxGeometry args={[lightX1 - lightX0, 0.01, 0.05]} />
        <meshBasicMaterial color={strip} toneMapped={false} />
      </mesh>
      {/* Forecourt edge band along the path side. */}
      <mesh position={[(apronDims.x0 + apronDims.x1) / 2, 0.01, apronDims.z1 + 0.12]}>
        <boxGeometry args={[aw, 0.02, 0.24]} />
        <meshStandardMaterial color="#3d3e44" roughness={0.6} />
      </mesh>
    </Batched>
  );
}
