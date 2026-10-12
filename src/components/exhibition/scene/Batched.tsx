"use client";

import { useThree } from "@react-three/fiber";
import { useEffect, useRef, type ReactNode } from "react";
import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { asyncTexturesSettled, asyncWorkPending } from "./useAsyncTexture";

/**
 * Static batching: once the subtree has mounted, opaque meshes whose
 * materials match in everything but base colour are merged into one mesh
 * per signature (draw-call reduction without touching how models are
 * authored). Differing colours (and per-instance colours) are baked into a
 * vertex-colour attribute, which three multiplies exactly like
 * `material.color`. Small static instanced sets are expanded into the same
 * merge. Lines, transparent/additive materials, LOD (Detail) branches and
 * anything added later (async signage) are left as they are. Purely a
 * rendering optimisation: hit volumes and interaction never depend on these
 * meshes.
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
  "alphaTest",
  "depthWrite",
  "polygonOffset",
] as const;

/** Instanced sets larger than this (expanded vertices) stay instanced. */
const MAX_BAKED_VERTICES = 40000;

function signature(mesh: THREE.Mesh) {
  const m = mesh.material as THREE.MeshStandardMaterial;
  const parts: unknown[] = KEYS.map((k) => (m as unknown as Record<string, unknown>)[k]);
  // Base colour is deliberately not part of the signature (baked per vertex).
  parts.push(m.emissive?.getHex(), !!m.color);
  for (const slot of ["map", "emissiveMap", "roughnessMap", "normalMap", "bumpMap", "alphaMap"] as const)
    parts.push((m as unknown as Record<string, THREE.Texture | null>)[slot]?.uuid ?? null);
  parts.push(Object.keys(mesh.geometry.attributes).sort().join(","));
  parts.push(mesh.castShadow, mesh.receiveShadow, mesh.renderOrder);
  return JSON.stringify(parts);
}

function batchable(o: THREE.Object3D): o is THREE.Mesh {
  const mesh = o as THREE.Mesh;
  if (!mesh.isMesh || (mesh as THREE.SkinnedMesh).isSkinnedMesh) return false;
  if (Array.isArray(mesh.material)) return false;
  const m = mesh.material as THREE.Material;
  if (m.transparent || m.blending !== THREE.NormalBlending || !m.visible || !mesh.visible) return false;
  const g = mesh.geometry;
  if (g.attributes.position === undefined || g.morphAttributes.position) return false;
  const inst = mesh as THREE.InstancedMesh;
  if (inst.isInstancedMesh) {
    const verts = g.index ? g.index.count : g.attributes.position.count;
    if (inst.count * verts > MAX_BAKED_VERTICES) return false;
  }
  return true;
}

const tmpColor = new THREE.Color();
const tmpMatrix = new THREE.Matrix4();

/** Non-indexed copy in the batch root's space with a colour attribute = material colour × instance/vertex colour. */
function bake(geometry: THREE.BufferGeometry, matrix: THREE.Matrix4, color: THREE.Color, useVertexColors: boolean) {
  const g = (geometry.index ? geometry.toNonIndexed() : geometry.clone()).applyMatrix4(matrix);
  const n = g.attributes.position.count;
  const src = useVertexColors ? (g.attributes.color as THREE.BufferAttribute | undefined) : undefined;
  const out = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    out[i * 3] = color.r * (src ? src.getX(i) : 1);
    out[i * 3 + 1] = color.g * (src ? src.getY(i) : 1);
    out[i * 3 + 2] = color.b * (src ? src.getZ(i) : 1);
  }
  g.setAttribute("color", new THREE.BufferAttribute(out, 3));
  return g;
}

/** Baked pieces of one mesh (one per instance for instanced meshes). */
function pieces(mesh: THREE.Mesh, inv: THREE.Matrix4) {
  const m = mesh.material as THREE.MeshStandardMaterial;
  const base = m.color ?? new THREE.Color(1, 1, 1);
  const rel = new THREE.Matrix4().multiplyMatrices(inv, mesh.matrixWorld);
  const inst = mesh as THREE.InstancedMesh;
  if (!inst.isInstancedMesh) return [bake(mesh.geometry, rel, base, m.vertexColors)];
  const out: THREE.BufferGeometry[] = [];
  for (let i = 0; i < inst.count; i++) {
    inst.getMatrixAt(i, tmpMatrix);
    tmpColor.copy(base);
    if (inst.instanceColor) {
      const c = new THREE.Color();
      inst.getColorAt(i, c);
      tmpColor.multiply(c);
    }
    out.push(bake(mesh.geometry, new THREE.Matrix4().multiplyMatrices(rel, tmpMatrix), tmpColor, m.vertexColors));
  }
  return out;
}

function needsColours(list: THREE.Mesh[]) {
  const first = list[0].material as THREE.MeshStandardMaterial;
  return list.some((mesh) => {
    const m = mesh.material as THREE.MeshStandardMaterial;
    return !!(mesh as THREE.InstancedMesh).instanceColor || (m.color && first.color && !m.color.equals(first.color));
  });
}

export function Batched({ children, delay = 0 }: { children: ReactNode; delay?: number }) {
  const group = useRef<THREE.Group>(null);
  const get = useThree((s) => s.get);

  useEffect(() => {
    const root = group.current;
    if (!root) return;
    const created: THREE.Mesh[] = [];
    const ownMaterials: THREE.Material[] = [];
    const hidden: THREE.Mesh[] = [];
    let cancelled = false;
    let commit: number | undefined;
    const run = () => {
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
      for (const list of buckets.values()) {
        if (list.length < 2) continue;
        const geos = list.flatMap((mesh) => pieces(mesh, inv));
        const merged = mergeGeometries(geos);
        geos.forEach((g) => g.dispose());
        if (!merged) continue;
        merged.computeBoundingSphere();
        const first = list[0];
        let material = first.material as THREE.MeshStandardMaterial;
        if (needsColours(list) || material.vertexColors) {
          // Colours now live in the vertices; the shared material goes neutral.
          material = material.clone();
          material.vertexColors = true;
          material.color?.setRGB(1, 1, 1);
          ownMaterials.push(material);
        } else {
          merged.deleteAttribute("color");
        }
        const mesh = new THREE.Mesh(merged, material);
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
    };
    // After `delay`, wait for async textures, then one more tick so React has
    // committed them to their materials (if new ones started meanwhile, wait again).
    const attempt = () =>
      asyncTexturesSettled().then(() => {
        if (!cancelled) commit = window.setTimeout(() => (asyncWorkPending() ? attempt() : run()), 50);
      });
    const timer = window.setTimeout(attempt, delay);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
      window.clearTimeout(commit);
      for (const m of created) {
        root.remove(m);
        m.geometry.dispose();
      }
      for (const m of ownMaterials) m.dispose();
      for (const m of hidden) m.visible = true;
    };
  }, [delay, get]);

  return <group ref={group}>{children}</group>;
}
