import React, { Suspense, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { 
  useGLTF, 
  PresentationControls, 
  Environment, 
  ContactShadows,
  Html,
  Center
} from '@react-three/drei';
import * as THREE from 'three';

interface ModelProps {
  url: string;
  autoRotate?: boolean;
}

const Model: React.FC<ModelProps> = ({ url, autoRotate = true }) => {
  const { scene } = useGLTF(url);
  const meshRef = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    if (autoRotate && meshRef.current) {
      meshRef.current.rotation.y += delta * 0.2;
    }
  });

  // VRAM Garbage Collector
  React.useEffect(() => {
    return () => {
      scene.traverse((object: any) => {
        if (object.isMesh) {
          object.geometry?.dispose();
          if (object.material) {
            if (Array.isArray(object.material)) {
              object.material.forEach((m: any) => m.dispose());
            } else {
              object.material.dispose();
            }
          }
        }
      });
    };
  }, [scene]);

  return (
    <group ref={meshRef}>
      <Center>
        <primitive object={scene} scale={2} />
      </Center>
    </group>
  );
};

const Loader = () => {
  return (
    <Html center>
      <div className="flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-[var(--accent-primary)] border-t-transparent animate-spin" />
        <span className="text-xs font-fm uppercase tracking-widest text-[var(--accent-primary)]">Renderizando 3D...</span>
      </div>
    </Html>
  );
};

interface ModelViewerProps {
  url: string;
  className?: string;
  autoRotate?: boolean;
}

export const ModelViewer: React.FC<ModelViewerProps> = ({ url, className = "h-full w-full min-h-[400px]", autoRotate = true }) => {
  return (
    <div className={className}>
      <Canvas shadows dpr={[1, 2]} camera={{ position: [0, 0, 5], fov: 50 }}>
        {/* Lights */}
        <ambientLight intensity={0.5} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />
        <directionalLight position={[-5, 5, 5]} intensity={0.5} />

        <Suspense fallback={<Loader />}>
            <PresentationControls
              global
              config={{ mass: 2, tension: 500 }}
              snap={{ mass: 4, tension: 1500 }}
              rotation={[0, 0.3, 0]}
              polar={[-Math.PI / 3, Math.PI / 3]}
              azimuth={[-Math.PI / 1.4, Math.PI / 2]}
            >
              <Model url={url} autoRotate={autoRotate} />
            </PresentationControls>

            <ContactShadows 
              position={[0, -1.5, 0]} 
              opacity={0.7} 
              scale={10} 
              blur={2} 
              far={4} 
              color="#d4af37" 
            />
            {/* Realistically lights the model from HDRI environment */}
            <Environment preset="city" />
        </Suspense>
      </Canvas>
    </div>
  );
};

// Preload the specific model if we know it beforehand (optional utility)
// useGLTF.preload('/path-to-model.glb');
