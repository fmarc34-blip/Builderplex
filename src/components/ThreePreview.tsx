import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stage, Box, Sphere, Torus, MeshDistortMaterial } from '@react-three/drei';
import { Suspense } from 'react';

interface ThreePreviewProps {
  type: 'box' | 'sphere' | 'torus';
  color?: string;
}

export function ThreePreview({ type, color = '#3b82f6' }: ThreePreviewProps) {
  return (
    <div className="w-full h-64 rounded-2xl overflow-hidden bg-black/20 border border-white/5">
      <Canvas shadows camera={{ position: [4, 4, 4], fov: 50 }}>
        <Suspense fallback={null}>
          <Stage environment="city" intensity={0.6}>
            {type === 'box' && (
              <Box args={[1, 1, 1]}>
                <MeshDistortMaterial color={color} speed={2} distort={0.2} />
              </Box>
            )}
            {type === 'sphere' && (
              <Sphere args={[1, 32, 32]}>
                <MeshDistortMaterial color={color} speed={2} distort={0.4} />
              </Sphere>
            )}
            {type === 'torus' && (
              <Torus args={[1, 0.4, 16, 100]}>
                <MeshDistortMaterial color={color} speed={2} distort={0.3} />
              </Torus>
            )}
          </Stage>
          <OrbitControls makeDefault autoRotate />
        </Suspense>
      </Canvas>
    </div>
  );
}
