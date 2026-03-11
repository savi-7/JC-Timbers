import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';

function TimberPiece({ position, rotation, scale, color }) {
    const mesh = useRef();

    useFrame((state, delta) => {
        if (mesh.current) {
            mesh.current.rotation.x += delta * 0.1;
            mesh.current.rotation.y += delta * 0.15;
        }
    });

    return (
        <Float speed={1.5} rotationIntensity={1} floatIntensity={2} position={position}>
            <mesh ref={mesh} rotation={rotation} scale={scale}>
                <boxGeometry args={[1, 1, 1]} />
                <meshStandardMaterial color={color} roughness={0.9} metalness={0.1} />
            </mesh>
        </Float>
    );
}

export default function Hero3DBackground() {
    const pieces = useMemo(() => Array.from({ length: 15 }).map(() => ({
        position: [
            (Math.random() - 0.5) * 20,
            (Math.random() - 0.5) * 15,
            (Math.random() - 0.5) * 10 - 5
        ],
        rotation: [Math.random() * Math.PI, Math.random() * Math.PI, 0],
        scale: [
            Math.random() * 3 + 1,
            Math.random() * 0.6 + 0.2,
            Math.random() * 0.6 + 0.2
        ],
        color: ['#654321', '#8B5A2B', '#A0522D', '#CD853F'][Math.floor(Math.random() * 4)],
    })), []);

    return (
        <div className="absolute inset-0 pointer-events-none opacity-30 z-0">
            <Canvas camera={{ position: [0, 0, 10], fov: 60 }}>
                <ambientLight intensity={0.6} />
                <directionalLight position={[10, 10, 10]} intensity={1} />
                <pointLight position={[-10, -10, -10]} intensity={0.5} />
                {pieces.map((props, i) => (
                    <TimberPiece key={i} {...props} />
                ))}
            </Canvas>
        </div>
    );
}
