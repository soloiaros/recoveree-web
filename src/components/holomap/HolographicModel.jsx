import { useEffect, useMemo, useRef, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useGLTF, Html } from '@react-three/drei';
import * as THREE from 'three';

import { resolveFatigueMarkers } from './fatigueZones.js';
import SymbolIcon from '../SymbolIcon.jsx';
import { supabase } from '../../lib/supabaseClient.js';

/**
 * HolographicModel
 *
 * Loads a humanoid `.glb` and re-skins it as a high-tech wireframe hologram.
 * We intentionally ignore every native material on the mesh — the dashboard
 * doesn't care what the source artist textured it with. We just want a
 * consistent, glowing cyan wireframe that doubles as a fatigue canvas.
 */
export default function HolographicModel({
  athleteId,
  modelPath = '/models/humanoid.glb',
  severeFatigue = [],
  mildFatigue = [],
  scale = 1,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
}) {
  const { scene } = useGLTF(modelPath);
  const { gl } = useThree();
  const cloned = useMemo(() => scene.clone(true), [scene]);

  const [activeMarkerId, setActiveMarkerId] = useState(null);

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

  useEffect(() => {
    cloned.traverse((node) => {
      if (!node.isMesh) return;
      node.material = holoMaterial;
      node.castShadow = false;
      node.receiveShadow = false;
      node.frustumCulled = true;
    });
  }, [cloned, holoMaterial]);

  useEffect(() => {
    return () => holoMaterial.dispose();
  }, [holoMaterial]);

  // Click outside to close active dialog
  useEffect(() => {
    if (!activeMarkerId) return;

    const handleGlobalClick = (e) => {
      // If the click is on the canvas (background) or not inside a marker/dialog, close it.
      // Html components are outside the canvas in the DOM, so we check if the click
      // target is within our custom UI.
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
      <group scale={modelTransform.scale}>
        <primitive object={cloned} position={modelTransform.offset} />
      </group>
      {severeMarkers.map((m) => (
        <FatigueMarker
          key={`severe-${m.id}`}
          marker={m}
          severity="severe"
          athleteId={athleteId}
          isOpen={activeMarkerId === `severe-${m.id}`}
          onToggle={(e) => {
            e.stopPropagation();
            setActiveMarkerId(prev => (prev === `severe-${m.id}` ? null : `severe-${m.id}`));
          }}
          onClose={() => setActiveMarkerId(null)}
        />
      ))}
      {mildMarkers.map((m) => (
        <FatigueMarker
          key={`mild-${m.id}`}
          marker={m}
          severity="mild"
          athleteId={athleteId}
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

useGLTF.preload('/models/humanoid.glb');

/**
 * A single "danger zone" glow: an interior point light + a 2D UI marker.
 * The 2D marker is interactable and opens a detail dialog.
 */
function FatigueMarker({ marker, severity, athleteId, isOpen, onToggle, onClose }) {
  const lightRef = useRef(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const isSevere = severity === 'severe';
  const lightColor = isSevere ? '#ff3b30' : '#ff9500';

  const phase = useMemo(
    () => (marker.position[0] + marker.position[1] * 1.7 + marker.position[2] * 2.3) * 4,
    [marker.position]
  );

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const pulse = 0.7 + Math.sin(t * 2.4 + phase) * 0.3;
    if (lightRef.current) lightRef.current.intensity = (isSevere ? 1.8 : 1.4) * pulse;
  });

  const handleOverride = async () => {
    if (isSubmitting || isSuccess) return;
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('interventions')
        .insert({
          athlete_id: athleteId,
          message: 'CRITICAL: Training paused by Coach. Mandatory rest day initiated.',
        });
      if (error) throw error;
      setIsSuccess(true);
    } catch (err) {
      console.error('[FatigueMarker] Failed to send override:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <group position={marker.position}>
      <pointLight
        ref={lightRef}
        color={lightColor}
        intensity={1.6}
        distance={0.6}
        decay={2}
      />

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
              <button
                type="button"
                className={`primary ${isSuccess ? 'success-btn' : ''}`}
                style={{ width: '100%', marginTop: 8 }}
                onClick={handleOverride}
                disabled={isSubmitting || isSuccess}
              >
                {isSubmitting ? (
                  <>
                    <span className="spinner" />
                    Sending Override...
                  </>
                ) : isSuccess ? (
                  'Override Sent'
                ) : (
                  'Override Training'
                )}
              </button>
            </div>
          )}
        </div>
      </Html>
    </group>
  );
}
