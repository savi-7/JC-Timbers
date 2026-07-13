import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Environment } from '@react-three/drei';
import * as THREE from 'three';

// An elegant, abstract timber sculpture (curved slats)
function TimberSculpture() {
  const groupRef = useRef();
  
  const slatCount = 24;
  const radius = 6;
  
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.05;
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.5;
    }
  });

  return (
    <group ref={groupRef} position={[5, 0, -8]} rotation={[0.2, 0, -0.1]}>
      {Array.from({ length: slatCount }).map((_, i) => {
        const angle = (i / slatCount) * Math.PI * 2;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        // height varies via sine wave
        const h = 8 + Math.sin(angle * 3) * 4;
        
        return (
          <Float key={i} speed={1.5} rotationIntensity={0.2} floatIntensity={0.5}>
            <mesh position={[x, 0, z]} rotation={[0, -angle, 0]} castShadow>
              <boxGeometry args={[0.3, h, 0.8]} />
              <meshPhysicalMaterial 
                color="#8B5A2B" 
                roughness={0.6} 
                metalness={0.2} 
                clearcoat={0.1}
                envMapIntensity={1.2}
              />
            </mesh>
          </Float>
        );
      })}
    </group>
  );
}

// Floating fine dust particles to give a luxury atmosphere
function Dust() {
  const particlesRef = useRef();
  
  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < 300; i++) {
      const x = (Math.random() - 0.5) * 30;
      const y = (Math.random() - 0.5) * 20;
      const z = (Math.random() - 0.5) * 20 - 5;
      temp.push(x, y, z);
    }
    return new Float32Array(temp);
  }, []);

  useFrame((state, delta) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y += delta * 0.02;
      particlesRef.current.rotation.x += delta * 0.01;
    }
  });

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={particles.length / 3} array={particles} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.06} color="#cda47b" transparent opacity={0.6} sizeAttenuation />
    </points>
  );
}

export default function Hero3DBackground() {
  return (
    <div className="absolute inset-0 pointer-events-none opacity-50 z-0">
      <Canvas camera={{ position: [0, 0, 15], fov: 45 }} dpr={[1, 2]}>
        <ambientLight intensity={0.8} />
        <directionalLight position={[10, 20, 15]} intensity={2.5} castShadow />
        <spotLight position={[-15, 10, -10]} intensity={1.5} color="#FFE4B5" angle={0.5} penumbra={1} />
        
        <TimberSculpture />
        <Dust />
        <Environment preset="city" />
      </Canvas>
    </div>
  );
}
