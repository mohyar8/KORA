"use client";

import { useThree } from "@react-three/fiber";
import { Bloom, EffectComposer, ToneMapping, Vignette } from "@react-three/postprocessing";
import { ToneMappingMode } from "postprocessing";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { MAIN_PATH } from "@/lib/exhibition/layout";
import { useQuality } from "./quality";

/**
 * Evening light rig: cool sky fill, a low moonlit key for soft grounding
 * shadows, and a restrained bloom so only the genuinely luminous elements
 * (facade lines, LED strips, lamps) glow.
 */
export function Lighting() {
  const q = useQuality();
  const get = useThree((s) => s.get);
  const key = useRef<THREE.DirectionalLight>(null);
  // Centre of the venue (the main path between the museum and the corner U).
  const focus = new THREE.Vector3(52, 0, MAIN_PATH.z + 6);

  useEffect(() => {
    const light = key.current;
    if (!light) return;
    const { gl } = get();
    light.target.position.copy(focus);
    light.target.updateMatrixWorld();
    // The scene is static: render the shadow map once, not every frame.
    gl.shadowMap.autoUpdate = false;
    gl.shadowMap.needsUpdate = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [get]);

  return (
    <>
      <hemisphereLight args={["#5a66a8", "#3a2a24", 0.55]} />
      <directionalLight
        ref={key}
        position={[focus.x - 55, 42, focus.z + 24]}
        color="#b4bcff"
        intensity={0.55}
        castShadow={q.shadows}
        // The larger venue needs a wider shadow frustum; 4096 keeps texel density close to before.
        shadow-mapSize={[4096, 4096]}
        shadow-bias={-0.0004}
        shadow-normalBias={0.04}
        shadow-camera-left={-80}
        shadow-camera-right={80}
        shadow-camera-top={60}
        shadow-camera-bottom={-60}
        shadow-camera-near={1}
        shadow-camera-far={240}
      />
    </>
  );
}

export function Effects() {
  const q = useQuality();
  return (
    <EffectComposer multisampling={q.msaa} enableNormalPass={false}>
      <Bloom mipmapBlur luminanceThreshold={1} luminanceSmoothing={0.2} intensity={0.75} radius={0.72} />
      <Vignette offset={0.32} darkness={0.5} />
      <ToneMapping mode={ToneMappingMode.AGX} />
    </EffectComposer>
  );
}
