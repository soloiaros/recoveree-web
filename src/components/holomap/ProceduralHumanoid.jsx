import { useMemo } from 'react';
import * as THREE from 'three';

import { resolveFatigueMarkers } from './fatigueZones.js';

/**
 * Stand-in humanoid built from primitives. Used as the Suspense / error
 * fallback for <HolographicModel> when the `.glb` is missing — keeps the
 * dashboard visually complete during development and CI builds.
 *
 * Proportions roughly match a 1.8m mesh so the same `fatigueZones.js`
 * coordinates land on the right body parts.
 */
export default function ProceduralHumanoid({
  severeFatigue = [],
  mildFatigue = [],
  scale = 1,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
}) {
  const material = useMemo(
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
      }),
    []
  );

  const severeMarkers = useMemo(() => resolveFatigueMarkers(severeFatigue), [severeFatigue]);
  const mildMarkers = useMemo(() => resolveFatigueMarkers(mildFatigue), [mildFatigue]);

  return (
    <group position={position} rotation={rotation} scale={scale}>
      {/* head */}
      <mesh position={[0, 1.65, 0]} material={material}>
        <sphereGeometry args={[0.12, 24, 24]} />
      </mesh>
      {/* neck */}
      <mesh position={[0, 1.5, 0]} material={material}>
        <cylinderGeometry args={[0.04, 0.05, 0.08, 16]} />
      </mesh>
      {/* torso */}
      <mesh position={[0, 1.18, 0]} material={material}>
        <cylinderGeometry args={[0.16, 0.13, 0.5, 24]} />
      </mesh>
      {/* hips */}
      <mesh position={[0, 0.9, 0]} material={material}>
        <cylinderGeometry args={[0.14, 0.13, 0.12, 24]} />
      </mesh>
      {/* arms */}
      {[-1, 1].map((s) => (
        <group key={s}>
          <mesh position={[s * 0.25, 1.25, 0]} rotation={[0, 0, (-s * Math.PI) / 24]} material={material}>
            <cylinderGeometry args={[0.05, 0.045, 0.34, 16]} />
          </mesh>
          <mesh position={[s * 0.36, 0.93, 0]} rotation={[0, 0, (-s * Math.PI) / 28]} material={material}>
            <cylinderGeometry args={[0.04, 0.035, 0.32, 16]} />
          </mesh>
        </group>
      ))}
      {/* legs */}
      {[-1, 1].map((s) => (
        <group key={s}>
          <mesh position={[s * 0.08, 0.6, 0]} material={material}>
            <cylinderGeometry args={[0.07, 0.06, 0.42, 18]} />
          </mesh>
          <mesh position={[s * 0.08, 0.22, 0]} material={material}>
            <cylinderGeometry args={[0.05, 0.04, 0.38, 18]} />
          </mesh>
        </group>
      ))}

      {severeMarkers.map((m) => (
        <ProcFatigueMarker key={`severe-${m.id}`} position={m.position} severity="severe" />
      ))}
      {mildMarkers.map((m) => (
        <ProcFatigueMarker key={`mild-${m.id}`} position={m.position} severity="mild" />
      ))}
    </group>
  );
}

function ProcFatigueMarker({ position, severity = 'severe' }) {
  const isSevere = severity === 'severe';
  const colors = isSevere
    ? { light: '#ff3b30', sphere: '#ff5c53', emissive: '#ff3b30' }
    : { light: '#ff9500', sphere: '#ffb74d', emissive: '#ff9500' };

  return (
    <group position={position}>
      <pointLight color={colors.light} intensity={1.6} distance={0.6} decay={2} />
      <mesh>
        <sphereGeometry args={[0.04, 24, 24]} />
        <meshStandardMaterial
          color={colors.sphere}
          emissive={colors.emissive}
          emissiveIntensity={3.2}
          transparent
          opacity={0.85}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}
