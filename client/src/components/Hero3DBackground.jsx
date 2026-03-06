import React, { useRef, useState, useMemo, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Float, Environment, ContactShadows, useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { MeshSurfaceSampler } from 'three/examples/jsm/math/MeshSurfaceSampler.js';
import teakwoodMap from '../assets/teakwoods.jpg';

// Extremely optimized count for perfectly fluid 60FPS while maintaining zero-gap structures
const PARTICLE_COUNT = 40000;

// Helper to guarantee safe merging
function safeMerge(geoms) {
    const nonIndexed = geoms.map(g => g.toNonIndexed());
    nonIndexed.forEach(g => {
        for (let key in g.attributes) {
            if (key !== 'position' && key !== 'normal') {
                g.deleteAttribute(key);
            }
        }
    });
    return mergeGeometries(nonIndexed, false);
}

// --------------------------------------------------------
// 1. Ultra-Realistic Voxel Log
// --------------------------------------------------------
function createLogGeometry() {
    const geom = new THREE.CylinderGeometry(1.6, 1.6, 9, 64, 32);
    geom.rotateZ(Math.PI / 2);
    // Slight noise to make the bark organic
    const pos = geom.attributes.position;
    for (let i = 0; i < pos.count; i++) {
        let x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i);
        if (Math.abs(x) < 4.4) {
            let noise = Math.sin(x * 5) * 0.03 + Math.cos(z * 8) * 0.03 + Math.sin(y * 10) * 0.02;
            pos.setY(i, y + noise);
            pos.setZ(i, z + noise);
        }
    }
    geom.computeVertexNormals();
    return safeMerge([geom]);
}

// --------------------------------------------------------
// 2. High-End Shell Chair (Hans Wegner Style)
// --------------------------------------------------------
function createChairGeometry() {
    const geoms = [];

    // 1. Curved "Smile" Wing Seat (Iconic wide curve)
    // Upgraded from (..., 64, 1, 16) to completely smooth High-Poly sampling faces
    const seatGeo = new THREE.BoxGeometry(3.6, 0.1, 1.8, 64, 4, 32);
    const sPos = seatGeo.attributes.position;
    for (let i = 0; i < sPos.count; i++) {
        let x = sPos.getX(i);
        let y = sPos.getY(i) + Math.pow(Math.abs(x) * 0.55, 2);
        sPos.setY(i, y);
    }
    seatGeo.computeVertexNormals();
    seatGeo.translate(0, -0.3, 0);
    geoms.push(seatGeo);

    // 2. Leather Seat Cushion
    const cushionGeo = new THREE.BoxGeometry(2.8, 0.1, 1.4, 64, 4, 32);
    const cPos = cushionGeo.attributes.position;
    for (let i = 0; i < cPos.count; i++) {
        let x = cPos.getX(i);
        let y = cPos.getY(i) + Math.pow(Math.abs(x) * 0.55, 2);
        cPos.setY(i, y);
    }
    cushionGeo.computeVertexNormals();
    cushionGeo.translate(0, -0.2, 0.05);
    geoms.push(cushionGeo);

    // 3. Curved Form-Fitting Backrest
    const backGeo = new THREE.BoxGeometry(2.6, 1.8, 0.1, 64, 32, 4);
    const bPos = backGeo.attributes.position;
    for (let i = 0; i < bPos.count; i++) {
        let x = bPos.getX(i);
        let z = bPos.getZ(i) + Math.pow(Math.abs(x) * 0.45, 2);
        bPos.setZ(i, z);
    }
    backGeo.computeVertexNormals();
    backGeo.rotateX(-0.4);
    backGeo.translate(0, 1.0, -1.1);
    geoms.push(backGeo);

    // 4. Form-Fitting Backrest Cushion
    const backCushionGeo = new THREE.BoxGeometry(2.2, 1.5, 0.1, 64, 32, 4);
    const bcPos = backCushionGeo.attributes.position;
    for (let i = 0; i < bcPos.count; i++) {
        let x = bcPos.getX(i);
        let z = bcPos.getZ(i) + Math.pow(Math.abs(x) * 0.45, 2);
        bcPos.setZ(i, z);
    }
    backCushionGeo.computeVertexNormals();
    backCushionGeo.rotateX(-0.4);
    backCushionGeo.translate(0, 1.0, -1.0);
    geoms.push(backCushionGeo);

    // 5. Swept Laminated Front Legs
    const legFGeo = new THREE.BoxGeometry(0.2, 1.5, 0.4, 4, 32, 4);
    const lfPos = legFGeo.attributes.position;
    for (let i = 0; i < lfPos.count; i++) {
        let y = lfPos.getY(i);
        let z = lfPos.getZ(i) + Math.pow(y, 2) * 0.3;
        lfPos.setZ(i, z);
    }
    legFGeo.computeVertexNormals();

    const legFL = legFGeo.clone();
    legFL.translate(-1.4, -1.1, 0.6);
    legFL.rotateZ(0.5);
    legFL.rotateX(0.2);
    geoms.push(legFL);

    const legFR = legFGeo.clone();
    legFR.translate(1.4, -1.1, 0.6);
    legFR.rotateZ(-0.5);
    legFR.rotateX(0.2);
    geoms.push(legFR);

    // 6. Iconic Swept Back Leg (Tripod Arch)
    const legBGeo = new THREE.BoxGeometry(0.8, 1.4, 0.3, 16, 32, 4);
    const lbPos = legBGeo.attributes.position;
    for (let i = 0; i < lbPos.count; i++) {
        let y = lbPos.getY(i);
        let z = lbPos.getZ(i) - Math.pow(y, 2) * 0.6;
        lbPos.setZ(i, z);
    }
    legBGeo.computeVertexNormals();

    const legBack = legBGeo.clone();
    legBack.translate(0, -1.0, -1.0);
    legBack.rotateX(-0.3);
    geoms.push(legBack);

    return safeMerge(geoms);
}

// --------------------------------------------------------
// Mathematical Extractor (PRE-COMPUTES Quaternions to save CPU)
// --------------------------------------------------------
function extractShapeQuaternions(geometry) {
    const sampler = new MeshSurfaceSampler(new THREE.Mesh(geometry)).build();
    const p = new Float32Array(PARTICLE_COUNT * 3);
    const q = new Float32Array(PARTICLE_COUNT * 4);
    const tv1 = new THREE.Vector3();
    const tv2 = new THREE.Vector3();
    const dummy = new THREE.Object3D();

    for (let i = 0; i < PARTICLE_COUNT; i++) {
        sampler.sample(tv1, tv2);
        p[i * 3] = tv1.x; p[i * 3 + 1] = tv1.y; p[i * 3 + 2] = tv1.z;

        // Pre-compute quaternion normal alignments locally so 60FPS loop doesn't fry CPU
        dummy.position.copy(tv1);
        dummy.lookAt(tv1.clone().add(tv2));
        q[i * 4] = dummy.quaternion.x;
        q[i * 4 + 1] = dummy.quaternion.y;
        q[i * 4 + 2] = dummy.quaternion.z;
        q[i * 4 + 3] = dummy.quaternion.w;
    }
    return { p, q };
}

// Floating Sawdust Anti-Gravity State
function createSawdustData() {
    const p = new Float32Array(PARTICLE_COUNT * 3);
    const q = new Float32Array(PARTICLE_COUNT * 4);
    const dummy = new THREE.Object3D();
    for (let i = 0; i < PARTICLE_COUNT; i++) {
        // Distribute in an expansive spherical volume reaching the edges
        const radius = 6 + Math.random() * 6;
        const theta = Math.random() * 2 * Math.PI;
        const phi = Math.acos((Math.random() * 2) - 1);

        p[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
        p[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
        p[i * 3 + 2] = radius * Math.cos(phi);

        // Random chaotic rotation
        dummy.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
        q[i * 4] = dummy.quaternion.x;
        q[i * 4 + 1] = dummy.quaternion.y;
        q[i * 4 + 2] = dummy.quaternion.z;
        q[i * 4 + 3] = dummy.quaternion.w;
    }
    return { p, q };
}

// --------------------------------------------------------
// Master Setup
// --------------------------------------------------------
function TimberEvolutionShowcase() {
    const meshRef = useRef();
    const [phase, setPhase] = useState(0);
    const { mouse, viewport } = useThree();
    const group = useRef();

    // Use an ultra-realistic, native, high-res Teakwood texture bundled directly into the app.
    // Native Vite import completely bypasses WebGL CORS issues and achieves supreme photorealism.
    const woodTex = useTexture(teakwoodMap);
    woodTex.colorSpace = THREE.SRGBColorSpace;
    woodTex.wrapS = woodTex.wrapT = THREE.RepeatWrapping;
    woodTex.repeat.set(0.5, 0.5);

    // Sequence: 0 = Sawdust, 1 = Log, 2 = Sawdust, 3 = Chair
    const shapeData = useMemo(() => {
        const sawdust = createSawdustData();
        const log = extractShapeQuaternions(createLogGeometry());
        const chair = extractShapeQuaternions(createChairGeometry());
        return [sawdust, log, sawdust, chair];
    }, []);

    // Active interpolating array
    const currentPositions = useMemo(() => new Float32Array(shapeData[0].p), [shapeData]);
    const currentQuats = useMemo(() => new Float32Array(shapeData[0].q), [shapeData]);
    const timeOffsets = useMemo(() => new Float32Array(PARTICLE_COUNT).map(() => Math.random() * 100), []);

    // Explicitly set vibrant wood colors to bypass generic white lighting
    useEffect(() => {
        if (!meshRef.current) return;

        const colors = new Float32Array(PARTICLE_COUNT * 3);
        const color = new THREE.Color();
        const palettes = [
            '#d9b895', // Soft Light Oak
            '#c7956b', // Muted Teak
            '#8f6a4e', // Soft Walnut
            '#e6cdb3'  // Pale wood tone
        ];

        for (let i = 0; i < PARTICLE_COUNT; i++) {
            const hex = palettes[Math.floor(Math.random() * palettes.length)];
            color.set(hex);
            color.offsetHSL(0, 0, (Math.random() - 0.5) * 0.1);
            colors[i * 3] = color.r;
            colors[i * 3 + 1] = color.g;
            colors[i * 3 + 2] = color.b;
        }
        meshRef.current.geometry.setAttribute('color', new THREE.InstancedBufferAttribute(colors, 3));
    }, []);

    // Dedicated memory objects to prevent Garbage Collection lag
    const dummyPosition = useMemo(() => new THREE.Vector3(), []);
    const dummyQuat = useMemo(() => new THREE.Quaternion(), []);
    const targetQ = useMemo(() => new THREE.Quaternion(), []);
    const mtx = useMemo(() => new THREE.Matrix4(), []);
    const vScale = useMemo(() => new THREE.Vector3(1, 1, 1), []);

    useFrame((state, delta) => {
        if (!group.current || !meshRef.current) return;

        // Cinematic parallax
        group.current.rotation.y = THREE.MathUtils.lerp(group.current.rotation.y, (mouse.x * viewport.width) / 25, 0.02);
        group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, (mouse.y * viewport.height) / 25, 0.02);
        group.current.rotation.y += 0.002;

        const cycleTime = 6;
        const currentPhase = Math.floor((state.clock.elapsedTime / cycleTime) % 4);
        if (currentPhase !== phase) setPhase(currentPhase);

        const targetP = shapeData[phase].p;
        const targetQuat = shapeData[phase].q;
        const isSawdustPhase = (phase === 0 || phase === 2);

        // Vastly increase 'snappiness' lerp to guarantee ultra-smooth fast transitions that quickly lock into place
        const snappiness = isSawdustPhase ? 1.8 * delta : 3.5 * delta;
        const t = state.clock.elapsedTime;

        for (let i = 0; i < PARTICLE_COUNT; i++) {
            let ix3 = i * 3;
            let ix4 = i * 4;

            let cx = currentPositions[ix3], cy = currentPositions[ix3 + 1], cz = currentPositions[ix3 + 2];
            let tx = targetP[ix3], ty = targetP[ix3 + 1], tz = targetP[ix3 + 2];

            // Anti-gravity turbulence ONLY if flying
            if (isSawdustPhase) {
                const off = timeOffsets[i];
                tx += Math.sin(t * 0.4 + off) * 1.5;
                ty += Math.cos(t * 0.3 + off) * 1.5;
                tz += Math.sin(t * 0.5 + off) * 1.5;
            }

            // Lerp Positions
            cx += (tx - cx) * snappiness;
            cy += (ty - cy) * snappiness;
            cz += (tz - cz) * snappiness;

            currentPositions[ix3] = cx;
            currentPositions[ix3 + 1] = cy;
            currentPositions[ix3 + 2] = cz;

            dummyPosition.set(cx, cy, cz);

            // Fetch Target Quaternion and Current Quaternion
            targetQ.set(targetQuat[ix4], targetQuat[ix4 + 1], targetQuat[ix4 + 2], targetQuat[ix4 + 3]);
            dummyQuat.set(currentQuats[ix4], currentQuats[ix4 + 1], currentQuats[ix4 + 2], currentQuats[ix4 + 3]);

            // Fast spherical linear interpolation (slerp) replaces CPU intensive lookAt!
            dummyQuat.slerp(targetQ, snappiness);
            currentQuats[ix4] = dummyQuat.x; currentQuats[ix4 + 1] = dummyQuat.y;
            currentQuats[ix4 + 2] = dummyQuat.z; currentQuats[ix4 + 3] = dummyQuat.w;

            if (isSawdustPhase) {
                // Add tiny chaotic tumbling directly to quaternion
                const spin = new THREE.Quaternion().setFromEuler(new THREE.Euler(t * 0.2, t * 0.2, 0));
                dummyQuat.multiply(spin);
            }

            // Compose matrix directly (ultra fast)
            mtx.compose(dummyPosition, dummyQuat, vScale);
            meshRef.current.setMatrixAt(i, mtx);
        }
        meshRef.current.instanceMatrix.needsUpdate = true;
    });

    return (
        <Float floatIntensity={0.2} speed={0.5} rotationIntensity={0.02}>
            <group ref={group} scale={1.2} position={[0, -0.5, 0]}>
                <instancedMesh ref={meshRef} args={[null, null, PARTICLE_COUNT]} castShadow receiveShadow>
                    {/* Flat, wide, paper-thin scales. When 40,000 of these lay flat on the shape, they form a perfect, monolithic seamless flush skin. */}
                    <boxGeometry args={[0.08, 0.08, 0.003]} />
                    {/* Minimal, elegant texture mapping. Subdued roughness makes it look polished. */}
                    <meshStandardMaterial map={woodTex} vertexColors roughness={0.4} metalness={0.1} />
                </instancedMesh>
            </group>
        </Float>
    );
}

// --------------------------------------------------------
// Subtle Ambient Enhancements
// --------------------------------------------------------
function FloatingGoldMotes() {
    const particles = useMemo(() => Array.from({ length: 60 }).map(() => ({
        position: [
            (Math.random() - 0.5) * 25,
            (Math.random() - 0.5) * 25,
            (Math.random() - 0.5) * 15 - 5
        ],
        scale: Math.random() * 0.08 + 0.02,
        speed: Math.random() * 0.2 + 0.05
    })), []);

    return particles.map((props, i) => (
        <Float key={i} speed={props.speed} floatIntensity={1} rotationIntensity={1}>
            <mesh position={props.position} scale={props.scale}>
                <sphereGeometry args={[1, 16, 16]} />
                <meshStandardMaterial
                    color="#D4AF37"
                    emissive="#D4AF37"
                    emissiveIntensity={0.4}
                    opacity={0.6}
                    transparent
                    roughness={0.4}
                    metalness={0.9}
                />
            </mesh>
        </Float>
    ));
}

export default function Hero3DBackground() {
    return (
        <div className="absolute inset-0 z-0 bg-cream">
            <Canvas camera={{ position: [0, 0, 10], fov: 45 }} dpr={[1, 2]} shadows>
                <ambientLight intensity={1.2} />
                <spotLight position={[10, 15, 10]} angle={0.3} penumbra={1} intensity={1.2} castShadow shadow-mapSize={1024} color="#fdf4dc" />
                <pointLight position={[-10, 5, -10]} intensity={0.8} color="#d4af37" />

                <TimberEvolutionShowcase />
                <FloatingGoldMotes />

                <Environment preset="apartment" />
                <ContactShadows position={[0, -3.5, 0]} opacity={0.6} scale={20} blur={2.5} far={4} color="#2e0f13" />
            </Canvas>
            {/* Soft, minimal blending overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-cream via-cream/20 to-transparent pointer-events-none" />
        </div>
    );
}
