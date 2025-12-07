import React, { useRef, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh, Vector3 } from 'three';
import { Html } from '@react-three/drei';
import { EnemyData, Difficulty } from '../types';

interface EnemyProps {
  data: EnemyData;
  difficulty: Difficulty;
  onHit: (id: string, damage: number) => void;
  onAttack: (damage: number) => void;
  playerPosition: Vector3;
}

export const Enemy: React.FC<EnemyProps> = ({ data, difficulty, onHit, onAttack, playerPosition }) => {
  const meshRef = useRef<Mesh>(null);
  const [lastAttackTime, setLastAttackTime] = useState(0);
  
  // Random offset for movement
  const offset = useMemo(() => Math.random() * 100, []);
  const initialPos = useMemo(() => new Vector3(...data.position), [data.position]);

  useFrame((state) => {
    if (!meshRef.current) return;
    const time = state.clock.getElapsedTime();

    // AI Movement Logic
    if (data.type === 'patrol') {
        // Simple side-to-side
        meshRef.current.position.x = initialPos.x + Math.sin(time * data.speed + offset) * 5;
    } else if (data.type === 'jumper') {
        // Up and down
        meshRef.current.position.y = initialPos.y + Math.abs(Math.sin(time * data.speed * 2 + offset)) * 3;
    } else if (data.type === 'chase' && difficulty !== Difficulty.EASY) {
        // Slowly move towards player Z (very simple chase logic)
        const currentPos = meshRef.current.position;
        // Don't get too close
        if (currentPos.z < -2) {
             currentPos.z += 0.02 * data.speed;
             // Wiggle x
             currentPos.x = initialPos.x + Math.sin(time * 2) * 2;
        }
    }

    // Attack Logic (Distance based)
    const distToPlayer = meshRef.current.position.distanceTo(playerPosition);
    // Simple logic: if close enough, perform "attack" (subtract health)
    // In a real game, this would spawn a projectile. Here we use immediate effect for simplicity.
    if (distToPlayer < 10 && time - lastAttackTime > 3) {
        if (Math.random() > 0.7) { // Chance to hit
            onAttack(10);
            setLastAttackTime(time);
        }
    }
  });

  return (
    <group>
        <mesh ref={meshRef} position={initialPos}>
            {/* Body */}
            <capsuleGeometry args={[0.5, 1.5, 4, 8]} />
            <meshStandardMaterial color={data.type === 'chase' ? '#f87171' : '#fbbf24'} />
            
            {/* Eyes / Visor */}
            <mesh position={[0, 0.5, 0.4]}>
                <boxGeometry args={[0.6, 0.2, 0.2]} />
                <meshStandardMaterial color="#00ffff" emissive="#00ffff" emissiveIntensity={2} />
            </mesh>

            {/* Health Bar UI */}
            <Html position={[0, 1.5, 0]} center>
                <div className="w-16 h-2 bg-gray-800 rounded overflow-hidden border border-gray-600">
                    <div 
                        className="h-full bg-red-500 transition-all duration-200" 
                        style={{ width: `${(data.health / data.maxHealth) * 100}%` }}
                    />
                </div>
            </Html>
        </mesh>
    </group>
  );
};