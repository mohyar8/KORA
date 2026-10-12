"use client";

import { useThree } from "@react-three/fiber";
import { useEffect, useRef, type ReactNode } from "react";
import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";

/**
 * Static batching: once the subtree has mounted, plain opaque meshes that
 * share an identical material signature are merged into one mesh per
 * signature (draw-call reduction without touching how models are authored).
 * Instanced meshes, lines, transparent/additive materials and anything added
 * later (async signage) are left as they are. Purely a rendering
 * optimisation: hit volumes and interaction never depend on these meshes.
 */

const KEYS = [
  "type",
  "roughness",
  "metalness",
  "emissiveIntensity",
  "envMapIntensity",
  "side",
  "vertexColors",
  "toneMapped",
  "flatShading",
] as const;

function signature(mesh: THREE.Mesh) {
  const m = mesh.material as THREE.MeshStandardMaterial;
  const parts: unknown[] = KEYS.map((k) => (m as unknown as Record<string, unknown>)[k]);
  parts.push(m.color?.getHex(), m.emissive?.getHex(), m.color && [m.color.r, m.color.g, m.color.b].map((v) => v.toFixed(3)));
  for (const slot of ["map", "emissiveMap", "roughnessMap", "normalMap", "bumpMap", "alphaMap"] as const)
    parts.push((m as unknown as Record<string, THREE.Texture | null>)[slot]?.uuid ?? null);
  parts.push(Object.keys(mesh.geometry.attributes).sort().join(","));
  parts.push(mesh.castShadow, mesh.receiveShadow, mesh.renderOrder);
  return JSON.stringify(parts);
}

function batchable(o: THREE.Object3D): o is THREE.Mesh {
  const mesh = o as THREE.Mesh;
  if (!mesh.isMesh || (mesh as THREE.InstancedMesh).isInstancedMesh || (mesh as THREE.SkinnedMesh).isSkinnedMesh) return false;
  if (Array.isArray(mesh.material)) return false;
  const m = mesh.material as THREE.Material;
  if (m.transparent || m.blending !== THREE.NormalBlending || !m.visible || !mesh.visible) return false;
  return mesh.geometry.attributes.position !== undefined && !mesh.geometry.morphAttributes.position;
}

export function Batched({ children, delay = 0 }: { children: ReactNode; delay?: number }) {
  const group = useRef<THREE.Group>(null);
  const get = useThree((s) => s.get);

  useEffect(() => {
    const root = group.current;
    if (!root) return;
    const created: THREE.Mesh[] = [];
    const hidden: THREE.Mesh[] = [];
    const timer = window.setTimeout(() => {
      root.updateMatrixWorld(true);
      const inv = new THREE.Matrix4().copy(root.matrixWorld).invert();
      const buckets = new Map<string, THREE.Mesh[]>();
      root.traverse((o) => {
        if (o === root || !batchable(o)) return;
        // Skip anything inside a hidden branch or a LOD (Detail) group.
        for (let p: THREE.Object3D | null = o; p && p !== root; p = p.parent)
          if (!p.visible || p.userData.noBatch) return;
        const key = signature(o);
        const list = buckets.get(key) ?? [];
        list.push(o);
        buckets.set(key, list);
      });
      const rel = new THREE.Matrix4();
      for (const list of buckets.values()) {
        if (list.length < 2) continue;
        const geos = list.map((mesh) => {
          rel.multiplyMatrices(inv, mesh.matrixWorld);
          const g = (mesh.geometry.index ? mesh.geometry.toNonIndexed() : mesh.geometry.clone()).applyMatrix4(rel);
          return g;
        });
        const merged = mergeGeometries(geos);
        geos.forEach((g) => g.dispose());
        if (!merged) continue;
        merged.computeBoundingSphere();
        const first = list[0];
        const mesh = new THREE.Mesh(merged, first.material);
        mesh.castShadow = first.castShadow;
        mesh.receiveShadow = first.receiveShadow;
        mesh.renderOrder = first.renderOrder;
        mesh.name = "batched";
        root.add(mesh);
        created.push(mesh);
        for (const m of list) {
          m.visible = false;
          hidden.push(m);
        }
      }
      // Shadows are rendered once (see Lighting); refresh them for the new meshes.
      const { gl, invalidate } = get();
      gl.shadowMap.needsUpdate = true;
      invalidate();
    }, delay);
    return () => {
      window.clearTimeout(timer);
      for (const m of created) {
        root.remove(m);
        m.geometry.dispose();
      }
      for (const m of hidden) m.visible = true;
    };
  }, [delay, get]);

  return <group ref={group}>{children}</group>;
}
