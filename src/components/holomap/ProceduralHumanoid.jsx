import { useMemo, useState, useEffect } from 'react';
import * as THREE from 'three';
import { Html } from '@react-three/drei';
import { useThree, useFrame } from '@react-three/fiber';

import { resolveFatigueMarkers } from './fatigueZones.js';
import SymbolIcon from '../SymbolIcon.jsx';
import { supabase } from '../../lib/supabaseClient.js';

const MAX_MARKERS = 40;

const ProceduralShader = {
  uniforms: {
    uTime: { value: 0 },
    uBaseColor: { value: new THREE.Color('#7fdfff') },
    uBaseOpacity: { value: 0.25 },
    uSeverePositions: { value: Array.from({ length: MAX_MARKERS }, () => new THREE.Vector3()) },
    uSevereCount: { value: 0 },
    uMildPositions: { value: Array.from({ length: MAX_MARKERS }, () => new THREE.Vector3()) },
    uMildCount: { value: 0 },
  },
  vertexShader: `
    varying vec3 vWorldPosition;
    void main() {
      vec4 worldPosition = modelMatrix * vec4(position, 1.0);
      vWorldPosition = worldPosition.xyz;
      gl_Position = projectionMatrix * viewMatrix * worldPosition;
    }
  `,
  fragmentShader: `
    uniform float uTime;
    uniform vec3 uBaseColor;
    uniform float uBaseOpacity;
    uniform vec3 uSeverePositions[${MAX_MARKERS}];
    uniform int uSevereCount;
    uniform vec3 uMildPositions[${MAX_MARKERS}];
    uniform int uMildCount;
    varying vec3 vWorldPosition;

    void main() {
      float pulse = 0.8 + sin(uTime * 2.5) * 0.2;
      vec3 severeColor = vec3(1.0, 0.05, 0.05);
      vec3 mildColor = vec3(1.0, 0.9, 0.0);
      float sH = 0.0;
      for (int i = 0; i < ${MAX_MARKERS}; i++) {
        if (i >= uSevereCount) break;
        sH = max(sH, 1.0 - smoothstep(0.0, 0.35, distance(vWorldPosition, uSeverePositions[i])));
      }
      for (int i = 0; i < ${MAX_MARKERS}; i++) {
        if (i >= uMildCount) break;
        mH = max(mH, 1.0 - smoothstep(0.0, 0.28, distance(vWorldPosition, uMildPositions[i])));
      }

      vec3 finalCol = uBaseColor;
      float finalAlpha = uBaseOpacity;

      if (sH > 0.0) {
        finalCol = mix(finalCol, severeColor, sH);
        finalCol += severeColor * sH * pulse * 6.0;
        finalAlpha = max(finalAlpha, sH * 0.9);
      } else if (mH > 0.0) {
        finalCol = mix(finalCol, mildColor, mH);
        finalCol += mildColor * mH * pulse * 4.0;
        finalAlpha = max(finalAlpha, mH * 0.8);
      }
      gl_FragColor = vec4(finalCol, finalAlpha);
    }
  `,
};

export default function ProceduralHumanoid({
  athleteId,
  severeFatigue = [],
  mildFatigue = [],
  scale = 1,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
}) {
  const [activeMarkerId, setActiveMarkerId] = useState(null);
  const severeMarkers = useMemo(() => resolveFatigueMarkers(severeFatigue), [severeFatigue]);
  const mildMarkers = useMemo(() => resolveFatigueMarkers(mildFatigue), [mildFatigue]);

  const uniforms = useMemo(() => THREE.UniformsUtils.clone(ProceduralShader.uniforms), []);
  const material = useMemo(() => new THREE.ShaderMaterial({
    uniforms,
    vertexShader: ProceduralShader.vertexShader,
    fragmentShader: ProceduralShader.fragmentShader,
    transparent: true,
    wireframe: true,
    side: THREE.DoubleSide,
    depthWrite: false,
  }), [uniforms]);

  useFrame(({ clock }) => {
    uniforms.uTime.value = clock.getElapsedTime();
    uniforms.uSevereCount.value = Math.min(severeMarkers.length, MAX_MARKERS);
    severeMarkers.forEach((m, i) => { if (i < MAX_MARKERS) uniforms.uSeverePositions.value[i].copy(new THREE.Vector3(...m.position)); });
    uniforms.uMildCount.value = Math.min(mildMarkers.length, MAX_MARKERS);
    mildMarkers.forEach((m, i) => { if (i < MAX_MARKERS) uniforms.uMildPositions.value[i].copy(new THREE.Vector3(...m.position)); });
  });

  useEffect(() => {
    if (!activeMarkerId) return;
    const handleGlobalClick = (e) => {
      const isUiClick = e.target.closest('.fatigue-marker-btn') || e.target.closest('.fatigue-dialog');
      if (!isUiClick) setActiveMarkerId(null);
    };
    window.addEventListener('pointerdown', handleGlobalClick);
    return () => window.removeEventListener('pointerdown', handleGlobalClick);
  }, [activeMarkerId]);

  return (
    <group position={position} rotation={rotation} scale={scale}>
      <mesh position={[0, 1.65, 0]} material={material}><sphereGeometry args={[0.12, 24, 24]} /></mesh>
      <mesh position={[0, 1.5, 0]} material={material}><cylinderGeometry args={[0.04, 0.05, 0.08, 16]} /></mesh>
      <mesh position={[0, 1.18, 0]} material={material}><cylinderGeometry args={[0.16, 0.13, 0.5, 24]} /></mesh>
      <mesh position={[0, 0.9, 0]} material={material}><cylinderGeometry args={[0.14, 0.13, 0.12, 24]} /></mesh>
      {[-1, 1].map((s) => (
        <group key={s}>
          <mesh position={[s * 0.25, 1.25, 0]} rotation={[0, 0, (-s * Math.PI) / 24]} material={material}><cylinderGeometry args={[0.05, 0.045, 0.34, 16]} /></mesh>
          <mesh position={[s * 0.36, 0.93, 0]} rotation={[0, 0, (-s * Math.PI) / 28]} material={material}><cylinderGeometry args={[0.04, 0.035, 0.32, 16]} /></mesh>
        </group>
      ))}
      {[-1, 1].map((s) => (
        <group key={s}>
          <mesh position={[s * 0.08, 0.6, 0]} material={material}><cylinderGeometry args={[0.07, 0.06, 0.42, 18]} /></mesh>
          <mesh position={[s * 0.08, 0.22, 0]} material={material}><cylinderGeometry args={[0.05, 0.04, 0.38, 18]} /></mesh>
        </group>
      ))}

      {severeMarkers.map((m) => (
        <ProcFatigueMarker
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
        <ProcFatigueMarker
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

function ProcFatigueMarker({ marker, severity, athleteId, isOpen, onToggle, onClose }) {
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (!isOpen) { setIsSuccess(false); setIsSubmitting(false); }
  }, [isOpen]);

  const handleOverride = async () => {
    if (isSubmitting || isSuccess) return;
    setIsSubmitting(true);
    const finalMessage = feedback.trim()
      ? `COACH [${marker.label}]: ${feedback.trim()}`
      : `CRITICAL [${marker.label}]: Training paused by Coach. Mandatory rest day initiated.`;

    try {
      const { error } = await supabase.from('interventions').insert({ athlete_id: athleteId, message: finalMessage });
      if (error) throw error;
      setIsSuccess(true);
      setFeedback('');
      setTimeout(() => setIsSuccess(false), 2500);
    } catch (err) {
      console.error('[ProcFatigueMarker] Failed to send override:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <group position={marker.position}>
      <Html center distanceFactor={1.5}>
        <div style={{ position: 'relative' }}>
          <button
            type="button"
            className="fatigue-marker-btn"
            style={{ '--marker-color': severity === 'severe' ? '#ff3b30' : '#ff9500' }}
            onClick={onToggle}
          />
          {isOpen && (
            <div className="fatigue-dialog" onClick={(e) => e.stopPropagation()}>
              <div className="fatigue-dialog__header">
                <span className="fatigue-dialog__title">{marker.label}</span>
                <button type="button" className="fatigue-dialog__close" onClick={onClose}>
                  <SymbolIcon name="cross" size={12} style={{ transform: 'rotate(45deg)' }} />
                </button>
              </div>
              <textarea
                className="fatigue-dialog__textarea"
                placeholder={`Detailed feedback for ${marker.label.toLowerCase()}...`}
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                autoFocus
              />
              <button
                type="button"
                className={`primary ${isSuccess ? 'success-btn' : ''}`}
                style={{ width: '100%', marginTop: 8 }}
                onClick={handleOverride}
                disabled={isSubmitting || isSuccess}
              >
                {isSubmitting ? <><span className="spinner" /> Sending...</> : isSuccess ? 'Override Sent' : 'Override Training'}
              </button>
            </div>
          )}
        </div>
      </Html>
    </group>
  );
}
