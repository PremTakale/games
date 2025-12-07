import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { PerspectiveCamera, Stars, PointerLockControls } from '@react-three/drei';
import { Vector3, Raycaster, Mesh, BoxGeometry, MeshStandardMaterial } from 'three';
import { useGameStore } from '../store';
import { Environment } from './Environment';
import { Enemy } from './Enemy';
import { EnemyData, GameState, WeaponType } from '../types';

// Constants
const ARROW_SPEED = 50;

// Projectile Component
const Arrow: React.FC<{ 
    position: Vector3, 
    velocity: Vector3, 
    type: WeaponType, 
    onHit: (pos: Vector3) => void,
    active: boolean
}> = ({ position, velocity, type, onHit, active }) => {
    const ref = useRef<Mesh>(null);
    const [isStuck, setIsStuck] = useState(!active);
    
    useFrame((state, delta) => {
        if (!active || isStuck || !ref.current) return;

        // Move arrow
        ref.current.position.add(velocity.clone().multiplyScalar(delta));
        // Simple gravity
        velocity.y -= 9.8 * delta * 0.5;
        
        // Face direction
        ref.current.lookAt(ref.current.position.clone().add(velocity));

        // Floor collision
        if (ref.current.position.y <= -1.9) {
            setIsStuck(true);
            onHit(ref.current.position.clone()); // Miss logic could go here
        }
    });

    const color = type === WeaponType.FIRE ? 'orange' : type === WeaponType.ICE ? 'cyan' : type === WeaponType.ELECTRIC ? 'yellow' : 'white';

    return (
        <mesh ref={ref} position={position} rotation={[0,0,0]}>
            <cylinderGeometry args={[0.05, 0.05, 2]} />
            <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2} />
        </mesh>
    );
};


const SceneContent: React.FC = () => {
    const { 
        difficulty, 
        gameState, 
        playerStats, 
        scorePoint, 
        takeDamage, 
        selectedWeapon, 
        decrementAmmo, 
        targetsRemaining 
    } = useGameStore();

    const { camera } = useThree();
    const [enemies, setEnemies] = useState<EnemyData[]>([]);
    const [arrows, setArrows] = useState<any[]>([]); // Store arrow states
    const lastShotTime = useRef(0);
    const pointerLockRef = useRef<any>(null);

    // Initial Enemy Spawning
    useEffect(() => {
        if (gameState !== GameState.PLAYING) return;
        
        // Lock pointer on start
        pointerLockRef.current?.lock();

        const count = 3 + (playerStats.currentLevel * 1) + (difficulty === 'HARD' ? 3 : 0);
        const newEnemies: EnemyData[] = [];
        for(let i=0; i<count; i++) {
            newEnemies.push({
                id: Math.random().toString(36),
                position: [(Math.random() - 0.5) * 40, 1.5, -15 - Math.random() * 30],
                speed: 1 + Math.random() * (difficulty === 'HARD' ? 3 : 1),
                type: Math.random() > 0.7 ? 'jumper' : Math.random() > 0.4 ? 'chase' : 'patrol',
                health: 100,
                maxHealth: 100
            });
        }
        setEnemies(newEnemies);
        setArrows([]);
    }, [gameState, difficulty, playerStats.currentLevel]);

    // Shooting Logic
    useEffect(() => {
        const handleMouseDown = () => {
            if (gameState !== GameState.PLAYING) return;
            const now = Date.now();
            if (now - lastShotTime.current < 500) return; // Fire rate
            
            decrementAmmo();
            lastShotTime.current = now;

            // Create arrow starting at camera position
            const direction = new Vector3();
            camera.getWorldDirection(direction);
            
            const newArrow = {
                id: Math.random().toString(),
                position: camera.position.clone().add(direction.clone().multiplyScalar(1)), // Start slightly in front
                velocity: direction.multiplyScalar(ARROW_SPEED),
                type: selectedWeapon,
                active: true
            };
            
            setArrows(prev => [...prev, newArrow]);

            // Play sound (simulated)
            // const audio = new Audio('/shoot.mp3'); audio.play();
        };

        window.addEventListener('mousedown', handleMouseDown);
        return () => window.removeEventListener('mousedown', handleMouseDown);
    }, [gameState, camera, selectedWeapon, decrementAmmo]);

    // Collision Detection Loop (Arrow vs Enemy)
    useFrame(() => {
        if (gameState !== GameState.PLAYING) return;

        // Simple distance check for collision (Optimized for demo)
        setArrows(currentArrows => {
            return currentArrows.map(arrow => {
                if (!arrow.active) return arrow;

                // Check against enemies
                let hit = false;
                
                // We need to modify the enemies state from inside here, usually bad practice in React to do deep mutations 
                // inside useFrame without refs, but strictly for collision detection loop we check:
                
                // Find hit enemy
                const arrowPos = arrow.position;
                
                // Iterate enemies (using the ref or state is tricky here, accessing state directly for read)
                // To keep it React-clean, we dispatch hits in the next frame or use a ref for enemies.
                // For this demo, let's assume we can calculate hits and trigger updates.
                
                // Note: Real collision should use Raycaster or Physics engine.
                // Simplified: Check distance to all enemies.
                
                return arrow;
            });
        });

        // Doing collision check outside the map to allow state updates
        arrows.forEach(arrow => {
             if (!arrow.active) return;
             
             enemies.forEach(enemy => {
                 if (enemy.health <= 0) return;
                 const enemyPos = new Vector3(...enemy.position);
                 // Enemy radius approx 1.5 height, 1 width
                 if (arrow.position.distanceTo(enemyPos) < 2) {
                     // HIT!
                     handleEnemyHit(enemy.id, 50, arrow.id);
                 }
             });
        });
    });

    const handleEnemyHit = (enemyId: string, damage: number, arrowId: string) => {
        // Deactivate arrow
        setArrows(prev => prev.map(a => a.id === arrowId ? { ...a, active: false } : a));

        // Damage enemy
        setEnemies(prev => prev.map(e => {
            if (e.id === enemyId) {
                const newHealth = e.health - damage;
                if (newHealth <= 0 && e.health > 0) {
                    scorePoint(100); // Kill reward
                }
                return { ...e, health: newHealth };
            }
            return e;
        }).filter(e => e.health > 0)); // Remove dead immediately for demo simplicity
    };

    const handlePlayerHit = (damage: number) => {
        takeDamage(damage);
    };

    return (
        <>
            <PointerLockControls ref={pointerLockRef} />
            <ambientLight intensity={0.2} />
            <pointLight position={[10, 10, 10]} intensity={1} castShadow />
            <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
            
            {/* Fog for atmosphere */}
            <fog attach="fog" args={['#0f172a', 10, 60]} />

            <Environment difficulty={difficulty} level={playerStats.currentLevel} />

            {/* Enemies */}
            {enemies.map(enemy => (
                <Enemy 
                    key={enemy.id} 
                    data={enemy} 
                    difficulty={difficulty}
                    onHit={(id, dmg) => console.log('hit', id)} // Handled in useFrame for collisions
                    onAttack={handlePlayerHit}
                    playerPosition={camera.position}
                />
            ))}

            {/* Arrows */}
            {arrows.map(arrow => (
                <Arrow 
                    key={arrow.id} 
                    {...arrow} 
                    onHit={() => {}} 
                />
            ))}
        </>
    );
};

export const GameScene: React.FC = () => {
    return (
        <Canvas shadows camera={{ position: [0, 1.7, 5], fov: 75 }}>
            <SceneContent />
        </Canvas>
    );
};