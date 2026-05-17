import { Component, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import {
  Environment,
  Html,
  OrbitControls,
} from '@react-three/drei';

import HolographicModel from './HolographicModel.jsx';
import ProceduralHumanoid from './ProceduralHumanoid.jsx';

/**
 * FatigueMapCanvas
 *
 * Top-level R3F scene for the "Holographic Fatigue Map" panel. Responsible
 * for:
 *   - Sizing the canvas to its parent container
 *   - Staging lights while leaving the page background fully visible
 *   - Locking the camera so the coach can only ORBIT the athlete
 *     (zoom + pan disabled — keeps the figure framed at all times)
 *   - Falling back to a procedural humanoid if the `.glb` is missing or
 *     fails to load (lets the dashboard ship before the art asset does)
 */
export default function FatigueMapCanvas({
  athleteId,
  severeFatigue = [],
  mildFatigue = [],
  modelPath = '/models/humanoid.glb',
}) {
  return (
    <Canvas
      dpr={[1, 2]}
      camera={{ position: [0, 0.95, 3.45], fov: 34, near: 0.1, far: 50 }}
      gl={{ antialias: true, alpha: true }}
      style={{ width: '100%', height: '100%' }}
    >
      {/* Stage lighting — subtle key + rim so the wireframe catches highlights
          without overpowering the emissive hologram colour. */}
      <ambientLight intensity={0.45} color="#cfeaff" />
      <directionalLight
        position={[3, 4, 2]}
        intensity={0.8}
        color="#a6e1ff"
      />
      <directionalLight position={[-3, 2, -2]} intensity={0.35} color="#0c5fa8" />

      {/* Environment gives the wireframe lines something to reflect so they
          read as glass / energy instead of flat colour. */}
      <Suspense fallback={null}>
        <Environment preset="city" />
      </Suspense>

      <ModelWithFallback
        athleteId={athleteId}
        severeFatigue={severeFatigue}
        mildFatigue={mildFatigue}
        modelPath={modelPath}
      />

      <OrbitControls
        makeDefault
        enablePan={false}
        enableZoom={false}
        minPolarAngle={Math.PI / 3.2}
        maxPolarAngle={Math.PI / 1.9}
        target={[0, 0.9, 0]}
        rotateSpeed={0.7}
      />
    </Canvas>
  );
}

/**
 * Try to load the GLB; on Suspense or error, render the procedural humanoid
 * so the panel is never blank.
 */
function ModelWithFallback({ athleteId, severeFatigue, mildFatigue, modelPath }) {
  return (
    <GLBErrorBoundary
      fallback={
        <ProceduralHumanoid
          athleteId={athleteId}
          severeFatigue={severeFatigue}
          mildFatigue={mildFatigue}
        />
      }
    >
      <Suspense
        fallback={
          <>
            <ProceduralHumanoid
              athleteId={athleteId}
              severeFatigue={severeFatigue}
              mildFatigue={mildFatigue}
            />
            <Html center position={[0, 1.85, 0]} style={{ pointerEvents: 'none' }}>
              <div style={loadingTagStyle}>Loading hologram…</div>
            </Html>
          </>
        }
      >
        <HolographicModel
          athleteId={athleteId}
          modelPath={modelPath}
          severeFatigue={severeFatigue}
          mildFatigue={mildFatigue}
        />
      </Suspense>
    </GLBErrorBoundary>
  );
}

const loadingTagStyle = {
  fontFamily: '-apple-system, BlinkMacSystemFont, system-ui, sans-serif',
  fontSize: 11,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  color: '#7fdfff',
  background: 'rgba(6, 18, 29, 0.6)',
  padding: '4px 10px',
  borderRadius: 999,
  border: '1px solid rgba(127, 223, 255, 0.4)',
};

class GLBErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error) {
    if (import.meta.env.DEV) {
      console.warn('[FatigueMapCanvas] GLB load failed, using procedural fallback:', error);
    }
  }

  render() {
    if (this.state.hasError) return this.props.fallback;
    return this.props.children;
  }
}
