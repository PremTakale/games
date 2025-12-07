import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh } from 'three';
import { Difficulty } from '../types';

interface EnvironmentProps {
  difficulty: Difficulty;
  level: number;
}

export const Environment: React.FC<EnvironmentProps> = ({ difficulty, level }) => {
  // Determine environment theme colors based on level
  const themes = [
    ['#059669', '#064e3b'], // Forest (Green)
    ['#0ea5e9', '#0c4a6e'], // Ice (Blue)
    ['#d97706', '#78350f'], // Desert (Orange)
    ['#7c3aed', '#4c1d95'], // Cyber City (Purple)
  ];
  
  const themeIndex = (level - 1) % themes.length;
  const [floorColor, gridColor] = themes[themeIndex];

  return (
    <group>
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]} receiveShadow>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial color={floorColor} />
      </mesh>
      
      {/* Grid Helper for Cyber look */}
      <gridHelper args={[100, 50, gridColor, gridColor]} position={[0, -1.9, 0]} />

      {/* Decorative Pillars / Ruins */}
      <mesh position={[-10, 3, -20]} castShadow receiveShadow>
        <boxGeometry args={[4, 10, 4]} />
        <meshStandardMaterial color="#334155" roughness={0.8} />
      </mesh>
      <mesh position={[10, 3, -20]} castShadow receiveShadow>
        <boxGeometry args={[4, 10, 4]} />
        <meshStandardMaterial color="#334155" roughness={0.8} />
      </mesh>

      <mesh position={[0, 8, -25]}>
        <boxGeometry args={[30, 2, 2]} />
        <meshStandardMaterial color="#1e293b" emissive="#000" />
      </mesh>

      {/* Dynamic Obstacles based on difficulty */}==
      {(difficulty === Difficulty.MEDIUM || difficulty === Difficulty.HARD) && (
        <SpinningBlade position={[-5, 0, -15]} speed={2} />
      )}
      
      {difficulty === Difficulty.HARD && (
         <SpinningBlade position={[5, 0, -10]} speed={-3} />
      )}
    </group>
  );
};

const SpinningBlade: React.FC<{ position: [number, number, number], speed: number }> = ({ position, speed }) => {
    const meshRef = useRef<Mesh>(null);
    useFrame((state, delta) => {
        if (meshRef.current) {
            meshRef.current.rotation.y += speed * delta;
        }
    });

    return (
        <group position={position}>
            <mesh ref={meshRef} castShadow>
                <boxGeometry args={[6, 0.5, 0.5]} />
                <meshStandardMaterial color="#ef4444" emissive="#7f1d1d" emissiveIntensity={0.5} />
            </mesh>
            <mesh position={[0, -1, 0]}>
                <cylinderGeometry args={[0.2, 0.2, 2]} />
                <meshStandardMaterial color="#64748b" />
            </mesh>
        </group>
    )
}