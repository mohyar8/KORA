"use client";

import { Component, Suspense, useEffect, useState, type ComponentType, type ReactNode } from "react";
import type * as THREE from "three";
import { AREA_ORDER, AREAS } from "@/lib/exhibition/areas";
import type { AreaId } from "@/lib/exhibition/types";
import { Batched } from "./Batched";
import { Museum } from "./Museum";
import { EntertainmentZone } from "./models/EntertainmentZone";
import { EntrepreneurshipCorner, HealthCorner } from "./models/FrameCorners";
import { MediaCorner } from "./models/MediaCorner";
import { EconomyCorner, TechnologyCorner } from "./models/NavyShellCorners";
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
  return (
    <group>
      {AREA_ORDER.map((id) => {
        const Kit = KIT[id];
        const url = overrides[id] ?? AREAS[id].modelUrl;
        if (!Kit && !url) return null;
        const { position, rotationY } = AREAS[id].frame;
        const kit = Kit ? (
          <Batched key="kit" delay={1200}>
            <Kit />
          </Batched>
        ) : null;
        return (
          <group key={id} name={`area-${id}`} position={position} rotation-y={rotationY}>
            {url ? (
              <Fallback key={url} fallback={kit}>
                <Suspense fallback={kit}>
                  <Glb url={url} />
                </Suspense>
              </Fallback>
            ) : (
              kit
            )}
          </group>
        );
      })}
    </group>
  );
}
