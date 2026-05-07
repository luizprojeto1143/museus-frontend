import React, { useRef, useMemo, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { useVisitorTheme } from '../../modules/visitor/context/VisitorThemeProvider';

const ParticleCloud = ({ count = 3000, color = "#d4af37", isLight = false }) => {
  const points = useRef<THREE.Points>(null);
  const [sphere] = useState(() => {
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
        const u = Math.random();
        const v = Math.random();
        const theta = Math.random() * 2.0 * Math.PI;
        const phi = Math.acos(2.0 * v - 1.0);
        const r = Math.cbrt(u) * 10;
        
        positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
        positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
        positions[i * 3 + 2] = r * Math.cos(phi);
    }
    return positions;
  });

  useFrame((state, delta) => {
    if (points.current) {
        points.current.rotation.x -= delta / 15;
        points.current.rotation.y -= delta / 20;
    }
  });

  return (
    <group rotation={[0, 0, Math.PI / 4]}>
      <Points ref={points} positions={sphere} stride={3} frustumCulled={false}>
        <PointMaterial
          transparent
          color={color}
          size={0.04}
          sizeAttenuation={true}
          depthWrite={false}
          blending={isLight ? THREE.NormalBlending : THREE.AdditiveBlending}
          opacity={isLight ? 0.4 : 0.8}
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
  count = 2000 
}) => {
  const { theme } = useVisitorTheme();
  const isLight = theme.theme === 'light';

  return (
    <div className={`absolute inset-0 z-0 pointer-events-none ${isLight ? 'opacity-30' : 'opacity-60'}`}>
      <Canvas camera={{ position: [0, 0, 8], fov: 60 }}>
        <ParticleCloud color={color} count={count} isLight={isLight} />
      </Canvas>
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,_transparent_0%,_var(--bg-page)_80%)]" />
    </div>
  );
};
