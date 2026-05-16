import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

import { resolveFatigueMarkers } from './fatigueZones.js';

/**
 * HolographicModel
 *
 * Loads a humanoid `.glb` and re-skins it as a high-tech wireframe hologram.
 * We intentionally ignore every native material on the mesh — the dashboard
 * doesn't care what the source artist textured it with. We just want a
 * consistent, glowing cyan wireframe that doubles as a fatigue canvas.
 *
 * The actual GLB asset is expected at `/models/humanoid.glb` by default
 * (drop yours into `public/models/`). Pass `modelPath` to point elsewhere.
 *
 * This component MUST be rendered inside a <Canvas> and wrapped in
 * <Suspense> — `useGLTF` suspends while the asset streams in.
 *
 * Props:
 *   - modelPath:    path to the .glb (default `/models/humanoid.glb`)
 *   - fatigueZones: array of zone keys; renders glowing markers from
 *                   `fatigueZones.js` (see that file for the full key list)
 *   - scale, position, rotation: standard r3f transforms applied to the
 *                                model + marker group
 */
export default function HolographicModel({
  modelPath = '/models/humanoid.glb',
  fatigueZones = [],
  scale = 1,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
}) {
  const { scene } = useGLTF(modelPath);

  // Clone so multiple instances (or remounts) don't share the same nodes —
  // useGLTF caches the original scene graph, and mutating it in place would
  // leak state between mounts.
  const cloned = useMemo(() => scene.clone(true), [scene]);

  // Normalize arbitrary humanoid GLBs into the coordinate space used by the
  // fatigue markers: feet at y=0, centered on X/Z, roughly 1.8 units tall.
  // This fixes models exported with their origin around the stomach / pelvis.
  const modelTransform = useMemo(() => {
    const box = new THREE.Box3().setFromObject(cloned);
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(center);

    const height = size.y || 1;
    return {
      scale: 1.8 / height,
      offset: [-center.x, -box.min.y, -center.z],
    };
  }, [cloned]);

  // Build the wireframe material once and reuse across every mesh in the
  // model. Reusing keeps the GPU happy on dense / multi-mesh humanoids.
  const holoMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#7fdfff',
        emissive: '#1aa6d6',
        emissiveIntensity: 0.55,
        wireframe: true,
        transparent: true,
        opacity: 0.3,
        depthWrite: false,
        roughness: 0.4,
        metalness: 0.15,
        side: THREE.DoubleSide,
      }),
    []
  );

  // Programmatically override every material in the scene graph. Anything
  // that wasn't a Mesh (lights, bones, helpers) is left alone.
  useEffect(() => {
    cloned.traverse((node) => {
      if (!node.isMesh) return;
      node.material = holoMaterial;
      node.castShadow = false;
      node.receiveShadow = false;
      node.frustumCulled = true;
    });
  }, [cloned, holoMaterial]);

  // Tear the material down on unmount so we don't leak GPU resources when
  // the coach navigates between athletes.
  useEffect(() => {
    return () => holoMaterial.dispose();
  }, [holoMaterial]);

  const markers = useMemo(() => resolveFatigueMarkers(fatigueZones), [fatigueZones]);

  return (
    <group position={position} rotation={rotation} scale={scale}>
      <group scale={modelTransform.scale}>
        <primitive object={cloned} position={modelTransform.offset} />
      </group>
      {markers.map((m) => (
        <FatigueMarker key={m.id} position={m.position} />
      ))}
    </group>
  );
}

// Preload the default asset so the first navigation to a detail view doesn't
// pay the full fetch + parse cost. No-ops if the file doesn't exist yet.
useGLTF.preload('/models/humanoid.glb');

/**
 * A single "danger zone" glow: a small emissive sphere + an interior point
 * light. The sphere pulses gently so multiple markers stay readable instead
 * of melting into a single orange smear.
 */
function FatigueMarker({ position }) {
  const lightRef = useRef(null);
  const sphereRef = useRef(null);

  // Each marker gets a slight phase offset so a row of markers pulses out of
  // sync instead of strobing in unison. Derived from position so it's stable
  // across re-renders without needing an extra prop.
  const phase = useMemo(
    () => (position[0] + position[1] * 1.7 + position[2] * 2.3) * 4,
    [position]
  );

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const pulse = 0.7 + Math.sin(t * 2.4 + phase) * 0.3;
    if (lightRef.current) lightRef.current.intensity = 1.6 * pulse;
    if (sphereRef.current) {
      const s = 0.85 + pulse * 0.25;
      sphereRef.current.scale.set(s, s, s);
    }
  });

  return (
    <group position={position}>
      <pointLight
        ref={lightRef}
        color="#ff5722"
        intensity={1.6}
        distance={0.6}
        decay={2}
      />
      <mesh ref={sphereRef}>
        <sphereGeometry args={[0.04, 24, 24]} />
        <meshStandardMaterial
          color="#ff7043"
          emissive="#ff3d00"
          emissiveIntensity={3.2}
          transparent
          opacity={0.85}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}
