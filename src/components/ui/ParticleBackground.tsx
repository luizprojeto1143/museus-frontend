import React, { useRef, useMemo, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';

const ParticleCloud = ({ count = 3000, color = "#d4af37" }) => {
  const points = useRef<THREE.Points>(null);
  const [sphere] = useState(() => {
    // Generate random points within a sphere
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
        // Random point on a sphere using spherical coords
        const u = Math.random();
        const v = Math.random();
        const theta = Math.random() * 2.0 * Math.PI;
        const phi = Math.acos(2.0 * v - 1.0);
        // Radius up to 10
        const r = Math.cbrt(u) * 10;
        
        const x = r * Math.sin(phi) * Math.cos(theta);
        const y = r * Math.sin(phi) * Math.sin(theta);
        const z = r * Math.cos(phi);
        
        positions[i * 3] = x;
        positions[i * 3 + 1] = y;
        positions[i * 3 + 2] = z;
    }
    return positions;
  });

  useFrame((state, delta) => {
    if (points.current) {
        points.current.rotation.x -= delta / 10;
        points.current.rotation.y -= delta / 15;
    }
  });

  return (
    <group rotation={[0, 0, Math.PI / 4]}>
      <Points ref={points} positions={sphere} stride={3} frustumCulled={false}>
        <PointMaterial
          transparent
          color={color}
          size={0.05}
          sizeAttenuation={true}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </Points>
    </group>
  );
};

interface ParticleBackgroundProps {
  color?: string;
  count?: number;
}

export const ParticleBackground: React.FC<ParticleBackgroundProps> = ({ 
  color = "#d4af37", 
  count = 3000 
}) => {
  return (
    <div className="absolute inset-0 z-0 pointer-events-none opacity-60">
      <Canvas camera={{ position: [0, 0, 8], fov: 60 }}>
        <ParticleCloud color={color} count={count} />
      </Canvas>
      {/* Vignette effect to fade out the edges and highlight center */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,_transparent_0%,_var(--bg-page)_80%)]" />
    </div>
  );
};
