import { useRef, useState, useCallback, useEffect, useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useCookingGame } from "@/lib/stores/useCookingGame";
import { useAudio } from "@/lib/stores/useAudio";

interface ChoppingGameProps {
  onComplete: (score: number) => void;
  targetCuts?: number;
}

export function ChoppingGame({ onComplete, targetCuts = 8 }: ChoppingGameProps) {
  const { camera, gl } = useThree();
  const knifeRef = useRef<THREE.Group>(null);
  const [cuts, setCuts] = useState(0);
  const [isChopping, setIsChopping] = useState(false);
  const [knifeY, setKnifeY] = useState(0.3);
  const [particles, setParticles] = useState<{ id: number; pos: [number, number, number]; vel: [number, number, number] }[]>([]);
  const addChoppingScore = useCookingGame(state => state.addChoppingScore);
  const { playHit } = useAudio();

  const slicePositions = useMemo(() => {
    const positions: number[] = [];
    for (let i = 0; i < targetCuts; i++) {
      positions.push(-0.25 + (i / (targetCuts - 1)) * 0.5);
    }
    return positions;
  }, [targetCuts]);

  const handleChop = useCallback(() => {
    if (isChopping || cuts >= targetCuts) return;
    
    setIsChopping(true);
    setKnifeY(0.05);
    
    setTimeout(() => {
      setCuts(prev => prev + 1);
      addChoppingScore(10);
      playHit();
      
      const newParticles = Array.from({ length: 5 }, (_, i) => ({
        id: Date.now() + i,
        pos: [
          (Math.random() - 0.5) * 0.1,
          0.1,
          (Math.random() - 0.5) * 0.1
        ] as [number, number, number],
        vel: [
          (Math.random() - 0.5) * 0.02,
          Math.random() * 0.03,
          (Math.random() - 0.5) * 0.02
        ] as [number, number, number]
      }));
      setParticles(prev => [...prev, ...newParticles]);
      
      setTimeout(() => {
        setIsChopping(false);
        setKnifeY(0.3);
      }, 100);
    }, 80);
  }, [isChopping, cuts, targetCuts, addChoppingScore, playHit]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space" || e.code === "KeyJ") {
        handleChop();
      }
    };
    
    const handleClick = () => handleChop();
    
    window.addEventListener("keydown", handleKeyDown);
    gl.domElement.addEventListener("click", handleClick);
    
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      gl.domElement.removeEventListener("click", handleClick);
    };
  }, [handleChop, gl.domElement]);

  useEffect(() => {
    if (cuts >= targetCuts) {
      const score = Math.round((cuts / targetCuts) * 100);
      setTimeout(() => onComplete(score), 500);
    }
  }, [cuts, targetCuts, onComplete]);

  useFrame((state, delta) => {
    if (knifeRef.current) {
      knifeRef.current.position.y += (knifeY - knifeRef.current.position.y) * 0.3;
      
      const wobble = Math.sin(state.clock.elapsedTime * 2) * 0.01;
      knifeRef.current.rotation.z = wobble;
    }
    
    setParticles(prev => 
      prev
        .map(p => ({
          ...p,
          pos: [
            p.pos[0] + p.vel[0],
            p.pos[1] + p.vel[1] - 0.002,
            p.pos[2] + p.vel[2]
          ] as [number, number, number]
        }))
        .filter(p => p.pos[1] > -0.1)
    );
  });

  return (
    <group position={[-3, 1.05, -1.8]}>
      <mesh receiveShadow>
        <boxGeometry args={[0.6, 0.03, 0.4]} />
        <meshStandardMaterial color="#c4a574" roughness={0.8} />
      </mesh>
      
      <group position={[0, 0.02, 0]}>
        {slicePositions.map((x, i) => (
          <mesh 
            key={i} 
            position={[x, 0.04, 0]}
            visible={i < cuts}
          >
            <boxGeometry args={[0.02, 0.06, 0.12]} />
            <meshStandardMaterial color={i < cuts ? "#ff6644" : "#ff4444"} roughness={0.5} />
          </mesh>
        ))}
        
        {cuts < targetCuts && (
          <mesh position={[slicePositions[cuts] || 0, 0.04, 0]}>
            <sphereGeometry args={[0.06, 16, 16]} />
            <meshStandardMaterial color="#ff4444" roughness={0.4} />
          </mesh>
        )}
      </group>
      
      <group ref={knifeRef} position={[slicePositions[cuts] || 0, 0.3, 0]} rotation={[0, 0, 0]}>
        <mesh position={[0, 0, 0]} castShadow>
          <boxGeometry args={[0.02, 0.12, 0.01]} />
          <meshStandardMaterial color="#c0c0c0" metalness={0.9} roughness={0.1} />
        </mesh>
        <mesh position={[0, -0.08, 0]}>
          <boxGeometry args={[0.03, 0.04, 0.015]} />
          <meshStandardMaterial color="#4a3728" roughness={0.8} />
        </mesh>
      </group>
      
      <mesh position={[slicePositions[cuts] || 0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.002, 0.3]} />
        <meshBasicMaterial color="#ffffff" opacity={0.5} transparent />
      </mesh>
      
      {particles.map(p => (
        <mesh key={p.id} position={p.pos}>
          <sphereGeometry args={[0.01, 6, 6]} />
          <meshStandardMaterial color="#ff6644" />
        </mesh>
      ))}
    </group>
  );
}
