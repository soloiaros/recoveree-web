import { useMemo, useState, useEffect } from 'react';
import * as THREE from 'three';
import { Html } from '@react-three/drei';
import { useThree } from '@react-three/fiber';

import { resolveFatigueMarkers } from './fatigueZones.js';
import SymbolIcon from '../SymbolIcon.jsx';

/**
 * Stand-in humanoid built from primitives. Used as the Suspense / error
 * fallback for <HolographicModel> when the `.glb` is missing — keeps the
 * dashboard visually complete during development and CI builds.
 */
export default function ProceduralHumanoid({
  severeFatigue = [],
  mildFatigue = [],
  scale = 1,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
}) {
  const { gl } = useThree();
  const [activeMarkerId, setActiveMarkerId] = useState(null);

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

  // Click outside to close active dialog
  useEffect(() => {
    if (!activeMarkerId) return;

    const handleGlobalClick = (e) => {
      const isUiClick = e.target.closest('.fatigue-marker-btn') || e.target.closest('.fatigue-dialog');
      if (!isUiClick) {
        setActiveMarkerId(null);
      }
    };

    window.addEventListener('pointerdown', handleGlobalClick);
    return () => window.removeEventListener('pointerdown', handleGlobalClick);
  }, [activeMarkerId]);

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
        <ProcFatigueMarker
          key={`severe-${m.id}`}
          marker={m}
          severity="severe"
          isOpen={activeMarkerId === `severe-${m.id}`}
          onToggle={(e) => {
            e.stopPropagation();
            setActiveMarkerId(prev => (prev === `severe-${m.id}` ? null : `severe-${m.id}`));
          }}
          onClose={() => setActiveMarkerId(null)}
        />
      ))}
      {mildMarkers.map((m) => (
        <ProcFatigueMarker
          key={`mild-${m.id}`}
          marker={m}
          severity="mild"
          isOpen={activeMarkerId === `mild-${m.id}`}
          onToggle={(e) => {
            e.stopPropagation();
            setActiveMarkerId(prev => (prev === `mild-${m.id}` ? null : `mild-${m.id}`));
          }}
          onClose={() => setActiveMarkerId(null)}
        />
      ))}
    </group>
  );
}

function ProcFatigueMarker({ marker, severity, isOpen, onToggle, onClose }) {
  const isSevere = severity === 'severe';
  const lightColor = isSevere ? '#ff3b30' : '#ff9500';

  return (
    <group position={marker.position}>
      <pointLight color={lightColor} intensity={1.6} distance={0.6} decay={2} />

      <Html center distanceFactor={1.5}>
        <div style={{ position: 'relative' }}>
          <button
            type="button"
            className="fatigue-marker-btn"
            style={{ '--marker-color': lightColor }}
            onClick={onToggle}
          />

          {isOpen && (
            <div className="fatigue-dialog" onClick={(e) => e.stopPropagation()}>
              <div className="fatigue-dialog__header">
                <span className="fatigue-dialog__title">{marker.label}</span>
                <button
                  type="button"
                  className="fatigue-dialog__close"
                  onClick={onClose}
                >
                  <SymbolIcon name="cross" size={12} style={{ transform: 'rotate(45deg)' }} />
                </button>
              </div>
              <textarea
                className="fatigue-dialog__textarea"
                placeholder={`Detailed feedback for ${marker.label.toLowerCase()}...`}
                autoFocus
              />
            </div>
          )}
        </div>
      </Html>
    </group>
  );
}
