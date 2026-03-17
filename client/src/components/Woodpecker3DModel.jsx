import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, Float, useCursor } from '@react-three/drei';
import * as THREE from 'three';

const WoodpeckerModel = ({ isChatOpen }) => {
  const groupRef = useRef();
  const headRef = useRef();
  const elapsedRef = useRef(0);

  useFrame((state, delta) => {
    elapsedRef.current += delta;
    const t = elapsedRef.current;
    
    // Idle floating/breathing animation
    if (groupRef.current) {
      groupRef.current.position.y = Math.sin(t * 2) * 0.05;
    }

    // Interactively look at the mouse pointer
    if (headRef.current) {
      // Map mouse coordinates (-1 to 1) to subtle rotation angles
      const targetX = (state.pointer.x * Math.PI) / 4;
      const targetY = (state.pointer.y * Math.PI) / 4;
      
      // Smooth interpolation
      headRef.current.rotation.y = THREE.MathUtils.lerp(headRef.current.rotation.y, targetX, 0.1);
      headRef.current.rotation.x = THREE.MathUtils.lerp(headRef.current.rotation.x, -targetY, 0.1);
    }

    // "Pecking" animation when chat is open
    if (isChatOpen && groupRef.current) {
      // Quick pecking motion on the z-axis and slight x-axis rotation
      const peckCycle = t * 6; // speed
      const isPecking = Math.sin(peckCycle) > 0.8; // only peck at the peak of the sine wave
      
      if (isPecking) {
        groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, 0.3, 0.2);
        groupRef.current.position.z = THREE.MathUtils.lerp(groupRef.current.position.z, 0.2, 0.2);
      } else {
        groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, 0, 0.1);
        groupRef.current.position.z = THREE.MathUtils.lerp(groupRef.current.position.z, 0, 0.1);
      }
    }
  });

  return (
    <group ref={groupRef} dispose={null} scale={1.5} position={[0, -0.2, 0]}>
      {/* Body */}
      <mesh position={[0, -0.4, 0]}>
        <sphereGeometry args={[0.5, 32, 32]} />
        <meshStandardMaterial color="#2d2d2d" roughness={0.7} />
      </mesh>
      
      {/* White Belly */}
      <mesh position={[0, -0.4, 0.25]} scale={[0.8, 1, 0.8]}>
        <sphereGeometry args={[0.4, 32, 32]} />
        <meshStandardMaterial color="#f0f0f0" roughness={0.9} />
      </mesh>

      {/* Wings */}
      <group position={[0, -0.3, 0]}>
        {/* Left Wing */}
        <mesh position={[-0.45, 0, 0]} rotation={[0, 0, 0.2]} scale={[0.2, 0.6, 0.5]}>
          <sphereGeometry args={[0.5, 32, 32]} />
          <meshStandardMaterial color="#1a1a1a" roughness={0.6} />
        </mesh>
        <mesh position={[-0.5, -0.1, 0.1]} rotation={[0, 0, 0.2]} scale={[0.05, 0.3, 0.2]}>
          <sphereGeometry args={[0.5, 16, 16]} />
          <meshStandardMaterial color="#ffffff" roughness={0.6} />
        </mesh>

        {/* Right Wing */}
        <mesh position={[0.45, 0, 0]} rotation={[0, 0, -0.2]} scale={[0.2, 0.6, 0.5]}>
          <sphereGeometry args={[0.5, 32, 32]} />
          <meshStandardMaterial color="#1a1a1a" roughness={0.6} />
        </mesh>
        <mesh position={[0.5, -0.1, 0.1]} rotation={[0, 0, -0.2]} scale={[0.05, 0.3, 0.2]}>
          <sphereGeometry args={[0.5, 16, 16]} />
          <meshStandardMaterial color="#ffffff" roughness={0.6} />
        </mesh>
      </group>

      {/* Tail */}
      <mesh position={[0, -0.9, -0.3]} rotation={[0.4, 0, 0]} scale={[0.3, 0.8, 0.1]}>
        <coneGeometry args={[0.5, 1, 4]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.8} />
      </mesh>

      {/* Head Group (Rotates interactively) */}
      <group ref={headRef} position={[0, 0.2, 0.1]}>
        {/* Head Base */}
        <mesh>
          <sphereGeometry args={[0.35, 32, 32]} />
          <meshStandardMaterial color="#2d2d2d" roughness={0.7} />
        </mesh>

        {/* White Cheek patches */}
        <mesh position={[-0.25, 0, 0.15]} scale={[0.5, 0.5, 0.8]}>
          <sphereGeometry args={[0.2, 16, 16]} />
          <meshStandardMaterial color="#ffffff" roughness={0.9} />
        </mesh>
        <mesh position={[0.25, 0, 0.15]} scale={[0.5, 0.5, 0.8]}>
          <sphereGeometry args={[0.2, 16, 16]} />
          <meshStandardMaterial color="#ffffff" roughness={0.9} />
        </mesh>

        {/* Red Crest */}
        <mesh position={[0, 0.3, -0.1]} rotation={[-0.3, 0, 0]} scale={[0.4, 0.6, 0.8]}>
          <sphereGeometry args={[0.25, 16, 16]} />
          <meshStandardMaterial color="#e63946" roughness={0.5} />
        </mesh>

        {/* Beak */}
        <mesh position={[0, -0.05, 0.4]} rotation={[Math.PI / 2, 0, 0]}>
          <coneGeometry args={[0.08, 0.5, 16]} />
          <meshStandardMaterial color="#fca311" roughness={0.4} />
        </mesh>

        {/* Eyes */}
        <group position={[0, 0.08, 0.25]}>
          {/* Left Eye */}
          <mesh position={[-0.18, 0, 0]}>
            <sphereGeometry args={[0.04, 16, 16]} />
            <meshStandardMaterial color="#111111" roughness={0.2} metalness={0.8} />
          </mesh>
          {/* Right Eye */}
          <mesh position={[0.18, 0, 0]}>
            <sphereGeometry args={[0.04, 16, 16]} />
            <meshStandardMaterial color="#111111" roughness={0.2} metalness={0.8} />
          </mesh>
        </group>
      </group>
    </group>
  );
};

export const Woodpecker3DCanvas = ({ isChatOpen, className = "w-full h-full" }) => {
  const [hovered, setHovered] = useState(false);
  useCursor(hovered, 'pointer', 'auto');

  return (
    <div 
      className={className} 
      onPointerOver={() => setHovered(true)} 
      onPointerOut={() => setHovered(false)}
    >
      <Canvas legacy={true} camera={{ position: [0, 0, 3.5], fov: 45 }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 10, 5]} intensity={1.5} castShadow />
        <pointLight position={[-5, -5, -5]} intensity={0.5} />
        
        <Environment preset="city" />
        
        <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
          <WoodpeckerModel isChatOpen={isChatOpen} />
        </Float>
        
        <OrbitControls 
          enableZoom={false} 
          enablePan={false}
          minPolarAngle={Math.PI / 2.5}
          maxPolarAngle={Math.PI / 1.5}
        />
      </Canvas>
    </div>
  );
};

// Also export just the model for embedding in the header if desired
export default Woodpecker3DCanvas;
