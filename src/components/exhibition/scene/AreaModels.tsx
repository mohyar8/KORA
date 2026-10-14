"use client";

import { Component, Suspense, useEffect, useState, type ComponentType, type ReactNode } from "react";
import type * as THREE from "three";
import { AREA_ORDER, AREAS } from "@/lib/exhibition/areas";
import type { AreaId } from "@/lib/exhibition/types";
import { Batched } from "./Batched";
import { Museum } from "./Museum";
import { EntrepreneurshipCorner, HealthCorner } from "./models/FrameCorners";
import { MediaCorner } from "./models/MediaCorner";
import { EngineeringCorner } from "./models/EngineeringCorner";
import { EconomyCorner, TechnologyCorner } from "./models/NavyShellCorners";
import { EntertainmentZone } from "./models/EntertainmentZone";
import { StageModel } from "./models/Stage";

/**
 * Model slots. Each modelled area renders inside its own frame
 * (`AreaConfig.frame`): a code-kit model by default, or a GLB when the area
 * config (or a development override) provides a URL. Anchors, hit volumes,
 * pins and cards never depend on which one is shown.
 */

const KIT: Partial<Record<AreaId, ComponentType>> = {
  museum: Museum,
  stage: StageModel,
  entertainment: EntertainmentZone,
  "corner-1": TechnologyCorner,
  "corner-2": MediaCorner,
  "corner-3": EntrepreneurshipCorner,
  "corner-4": EconomyCorner,
  "corner-5": HealthCorner,
  "corner-6": EngineeringCorner,
};

/** Areas that currently render a real model (kit or GLB) instead of a placeholder. */
export const hasModel = (id: AreaId, overrides: Partial<Record<AreaId, string>> = {}) =>
  Boolean(KIT[id] || AREAS[id].modelUrl || overrides[id]);

class Fallback extends Component<{ fallback: ReactNode; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(error: unknown) {
    console.warn("[exhibition] model failed to load, using the kit model instead", error);
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

/** Loads a GLB lazily (the loader is only fetched when some area actually uses one). */
function Glb({ url }: { url: string }) {
  const [scene, setScene] = useState<THREE.Group | null>(null);
  const [error, setError] = useState<unknown>(null);
  useEffect(() => {
    let alive = true;
    import("three/examples/jsm/loaders/GLTFLoader.js")
      .then(({ GLTFLoader }) => new GLTFLoader().loadAsync(url))
      .then((gltf) => {
        if (!alive) return;
        gltf.scene.traverse((o) => {
          const mesh = o as THREE.Mesh;
          if (mesh.isMesh) {
            mesh.castShadow = true;
            mesh.receiveShadow = true;
          }
        });
        setScene(gltf.scene);
      })
      .catch((e) => alive && setError(e));
    return () => {
      alive = false;
    };
  }, [url]);
  if (error) throw error;
  return scene ? <primitive object={scene} /> : null;
}

export function AreaModels({ overrides = {} }: { overrides?: Partial<Record<AreaId, string>> }) {
  const urlOf = (id: AreaId) => overrides[id] ?? AREAS[id].modelUrl;
  const frame = (id: AreaId, children: ReactNode) => {
    const { position, rotationY, scale = 1 } = AREAS[id].frame;
    return (
      <group key={id} name={`area-${id}`} position={position} rotation-y={rotationY} scale={scale}>
        {children}
      </group>
    );
  };
  // Kit models share one static batch, so identical materials merge across
  // areas. It is keyed by its member set and rebuilds when a GLB takes a slot.
  const kitIds = AREA_ORDER.filter((id) => KIT[id] && !urlOf(id));
  const glbIds = AREA_ORDER.filter((id) => urlOf(id));
  return (
    <group>
      <Batched key={kitIds.join()} delay={1200}>
        {kitIds.map((id) => {
          const Kit = KIT[id]!;
          return frame(id, <Kit />);
        })}
      </Batched>
      {glbIds.map((id) => {
        const Kit = KIT[id];
        const url = urlOf(id)!;
        const kit = Kit ? (
          <Batched delay={1200}>
            <Kit />
          </Batched>
        ) : null;
        return frame(
          id,
          <Fallback key={url} fallback={kit}>
            <Suspense fallback={kit}>
              <Glb url={url} />
            </Suspense>
          </Fallback>,
        );
      })}
    </group>
  );
}
