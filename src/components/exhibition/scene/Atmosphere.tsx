"use client";

import { useThree } from "@react-three/fiber";
import { useEffect, useMemo } from "react";
import * as THREE from "three";

/**
 * Evening sky, distance haze and the image-based lighting derived from it.
 * Palette: the periwinkle-to-lavender dusk of the museum render, with a
 * restrained warm afterglow low in the west (site photos at sunset).
 */

export const HAZE = "#4a4868";

const SKY = {
  zenith: "#0d1640",
  mid: "#2a3a82",
  horizon: "#7d84b8",
  glow: "#d9937a",
  /** Afterglow direction (west). */
  glowDir: new THREE.Vector3(-1, 0, 0.25).normalize(),
};

const vertex = /* glsl */ `
  varying vec3 vWorld;
  void main() {
    vec4 w = modelMatrix * vec4(position, 1.0);
    vWorld = w.xyz;
    gl_Position = projectionMatrix * viewMatrix * w;
  }
`;

const fragment = /* glsl */ `
  uniform vec3 zenith;
  uniform vec3 mid;
  uniform vec3 horizon;
  uniform vec3 glow;
  uniform vec3 glowDir;
  uniform vec3 center;
  varying vec3 vWorld;

  float hash(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }

  void main() {
    vec3 dir = normalize(vWorld - center);
    float h = dir.y;
    float up = clamp(h, 0.0, 1.0);
    vec3 col = mix(horizon, mid, smoothstep(0.0, 0.22, up));
    col = mix(col, zenith, smoothstep(0.18, 0.8, up));
    vec3 flat_ = normalize(vec3(dir.x, 0.0, dir.z) + 1e-5);
    float g = pow(max(dot(flat_, glowDir), 0.0), 2.5) * (1.0 - smoothstep(0.0, 0.28, up));
    col += glow * g * 0.9;
    // Below the horizon: hazy dark ground plane colour.
    col = mix(col, horizon * 0.35, smoothstep(0.0, -0.08, h));
    // Dither to avoid banding in the smooth gradient.
    col += (hash(gl_FragCoord.xy) - 0.5) / 255.0;
    gl_FragColor = vec4(col, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

function skyMaterial(center: THREE.Vector3) {
  return new THREE.ShaderMaterial({
    vertexShader: vertex,
    fragmentShader: fragment,
    uniforms: {
      zenith: { value: new THREE.Color(SKY.zenith) },
      mid: { value: new THREE.Color(SKY.mid) },
      horizon: { value: new THREE.Color(SKY.horizon) },
      glow: { value: new THREE.Color(SKY.glow) },
      glowDir: { value: SKY.glowDir },
      center: { value: center },
    },
    side: THREE.BackSide,
    depthWrite: false,
    fog: false,
  });
}

export function Atmosphere() {
  const get = useThree((s) => s.get);
  const camera = useThree((s) => s.camera);

  // The dome is centred on the camera every frame via the uniform; the mesh
  // itself is huge and static.
  const sky = useMemo(() => skyMaterial(camera.position), [camera]);

  useEffect(() => {
    const { gl, scene } = get();
    // Image-based light: sky dome plus a few warm low "city glow" panels so
    // metal and glass pick up plausible evening reflections.
    const envScene = new THREE.Scene();
    const center = new THREE.Vector3();
    const dome = new THREE.Mesh(new THREE.SphereGeometry(50, 48, 24), skyMaterial(center));
    envScene.add(dome);
    const panelMat = new THREE.MeshBasicMaterial({ color: new THREE.Color("#ffb070").multiplyScalar(1.4), side: THREE.DoubleSide });
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2 + 0.4;
      const p = new THREE.Mesh(new THREE.PlaneGeometry(14, 1.6), panelMat);
      p.position.set(Math.cos(a) * 40, -1 + (i % 2) * 1.5, Math.sin(a) * 40);
      p.lookAt(0, 0, 0);
      envScene.add(p);
    }
    const ground = new THREE.Mesh(
      new THREE.CircleGeometry(45, 32),
      new THREE.MeshBasicMaterial({ color: "#2a2426", side: THREE.DoubleSide }),
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -3;
    envScene.add(ground);

    const pmrem = new THREE.PMREMGenerator(gl);
    const rt = pmrem.fromScene(envScene, 0.02);
    scene.environment = rt.texture;
    scene.environmentIntensity = 0.65;
    pmrem.dispose();
    envScene.traverse((o) => {
      if (o instanceof THREE.Mesh) {
        o.geometry.dispose();
        (o.material as THREE.Material).dispose();
      }
    });
    return () => {
      scene.environment = null;
      rt.dispose();
    };
  }, [get]);

  useEffect(() => () => sky.dispose(), [sky]);

  return (
    <>
      <fog attach="fog" args={[HAZE, 90, 420]} />
      <mesh material={sky} renderOrder={-1} frustumCulled={false}>
        <sphereGeometry args={[900, 48, 24]} />
      </mesh>
    </>
  );
}
