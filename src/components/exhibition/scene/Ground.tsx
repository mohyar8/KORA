"use client";

import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { MUSEUM, PLAZA } from "@/lib/exhibition/layout";
import { apronTexture, plazaTexture } from "./textures";
import { useQuality } from "./quality";

const apronDims = {
  x0: MUSEUM.facadeX - 9,
  x1: MUSEUM.facadeX + MUSEUM.portal.recess + 0.4,
  z0: MUSEUM.northZ - 2,
  z1: MUSEUM.northZ + MUSEUM.length + 2,
};
const aw = apronDims.x1 - apronDims.x0;
const ad = apronDims.z1 - apronDims.z0;

/** Site paving, the museum forecourt and its in-ground linear lights. */
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
    t.repeat.set(ad / 12, aw / 12);
    return t;
  }, [q.groundTex]);

  useEffect(
    () => () => {
      plaza.dispose();
      apron.dispose();
    },
    [plaza, apron],
  );

  const strip = new THREE.Color("#ffbf80").multiplyScalar(1.7);
  const fx = MUSEUM.facadeX;

  return (
    <group>
      {/* Unpaved / asphalt surroundings. */}
      <mesh rotation-x={-Math.PI / 2} position={[30, -0.02, 30]} receiveShadow>
        <planeGeometry args={[1400, 1400]} />
        <meshStandardMaterial color="#1c1a1d" roughness={1} />
      </mesh>
      <mesh rotation-x={-Math.PI / 2} position={[(b.minX + b.maxX) / 2, 0, (b.minZ + b.maxZ) / 2]} receiveShadow>
        <planeGeometry args={[pw, pd]} />
        <meshStandardMaterial map={plaza} bumpMap={plaza} bumpScale={0.6} roughness={0.88} envMapIntensity={0.35} />
      </mesh>
      {/* Kerb around the paved field. */}
      <mesh position={[(b.minX + b.maxX) / 2, 0.06, b.maxZ + 0.15]}>
        <boxGeometry args={[pw + 0.6, 0.14, 0.3]} />
        <meshStandardMaterial color="#8d8a84" roughness={0.9} />
      </mesh>

      {/* Museum forecourt: satin stone, rotated so tiles run along the facade. */}
      <mesh
        rotation={[-Math.PI / 2, 0, Math.PI / 2]}
        position={[(apronDims.x0 + apronDims.x1) / 2, 0.006, (apronDims.z0 + apronDims.z1) / 2]}
        receiveShadow
      >
        <planeGeometry args={[ad, aw]} />
        <meshStandardMaterial
          map={apron}
          roughness={0.34}
          metalness={0.05}
          envMapIntensity={0.7}
          polygonOffset
          polygonOffsetFactor={-1}
        />
      </mesh>
      {/* In-ground linear lights parallel to the facade (render). */}
      {[
        [fx - 3.4, MUSEUM.northZ + MUSEUM.portal.u1 + 0.6, MUSEUM.northZ + MUSEUM.length],
        [fx - 8.2, apronDims.z0 + 0.4, apronDims.z1 - 0.4],
      ].map(([x, z0, z1]) => (
        <mesh key={x} position={[x, 0.012, (z0 + z1) / 2]}>
          <boxGeometry args={[0.05, 0.01, z1 - z0]} />
          <meshBasicMaterial color={strip} toneMapped={false} />
        </mesh>
      ))}
      {/* Forecourt edge band. */}
      <mesh position={[apronDims.x0 - 0.12, 0.01, (apronDims.z0 + apronDims.z1) / 2]}>
        <boxGeometry args={[0.24, 0.02, ad]} />
        <meshStandardMaterial color="#3d3e44" roughness={0.6} />
      </mesh>
    </group>
  );
}
