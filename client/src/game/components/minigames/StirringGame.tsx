import { useRef, useState, useEffect, useCallback } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useCookingGame } from "@/lib/stores/useCookingGame";

interface StirringGameProps {
  onComplete: (score: number) => void;
  targetProgress?: number;
}

export function StirringGame({ onComplete, targetProgress = 100 }: StirringGameProps) {
  const { gl, camera } = useThree();
  const spoonRef = useRef<THREE.Group>(null);
  const bowlContentsRef = useRef<THREE.Mesh>(null);
  const [progress, setProgress] = useState(0);
  const [lastAngle, setLastAngle] = useState(0);
  const [stirSpeed, setStirSpeed] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isTooFast, setIsTooFast] = useState(false);
  const [splashParticles, setSplashParticles] = useState<{ id: number; pos: [number, number, number]; vel: [number, number, number] }[]>([]);
  
  const setMixingProgress = useCookingGame(state => state.setMixingProgress);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    const rect = gl.domElement.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    setMousePos({ x, y });
  }, [gl.domElement]);

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [handleMouseMove]);

  useEffect(() => {
    if (progress >= targetProgress) {
      const speedBonus = isTooFast ? 0 : 20;
      const score = Math.min(100, Math.round(progress + speedBonus));
      setTimeout(() => onComplete(score), 300);
    }
  }, [progress, targetProgress, onComplete, isTooFast]);

  useFrame((state, delta) => {
    if (spoonRef.current) {
      const targetX = mousePos.x * 0.15;
      const targetZ = mousePos.y * 0.15;
      
      spoonRef.current.position.x += (targetX - spoonRef.current.position.x) * 0.2;
      spoonRef.current.position.z += (targetZ - spoonRef.current.position.z) * 0.2;
      
      const currentAngle = Math.atan2(spoonRef.current.position.z, spoonRef.current.position.x);
      const angleDiff = currentAngle - lastAngle;
      
      let normalizedDiff = angleDiff;
      if (normalizedDiff > Math.PI) normalizedDiff -= Math.PI * 2;
      if (normalizedDiff < -Math.PI) normalizedDiff += Math.PI * 2;
      
      const speed = Math.abs(normalizedDiff) / delta;
      setStirSpeed(speed);
      
      const tooFast = speed > 8;
      setIsTooFast(tooFast);
      
      if (tooFast && Math.random() > 0.8) {
        const newParticles = Array.from({ length: 2 }, (_, i) => ({
          id: Date.now() + i,
          pos: [
            spoonRef.current!.position.x,
            0.15,
            spoonRef.current!.position.z
          ] as [number, number, number],
          vel: [
            (Math.random() - 0.5) * 0.03,
            Math.random() * 0.04,
            (Math.random() - 0.5) * 0.03
          ] as [number, number, number]
        }));
        setSplashParticles(prev => [...prev, ...newParticles]);
      }
      
      if (speed > 0.5 && speed < 8 && progress < targetProgress) {
        const progressGain = delta * 15;
        setProgress(prev => Math.min(targetProgress, prev + progressGain));
        setMixingProgress(Math.min(100, progress + progressGain));
      }
      
      setLastAngle(currentAngle);
    }
    
    if (bowlContentsRef.current) {
      bowlContentsRef.current.rotation.y += stirSpeed * delta * 0.5;
      
      const t = progress / 100;
      const startColor = new THREE.Color("#fff5dc");
      const endColor = new THREE.Color("#f5e6c8");
      const currentColor = startColor.lerp(endColor, t);
      (bowlContentsRef.current.material as THREE.MeshStandardMaterial).color = currentColor;
    }
    
    setSplashParticles(prev => 
      prev
        .map(p => ({
          ...p,
          pos: [
            p.pos[0] + p.vel[0],
            p.pos[1] + p.vel[1] - 0.003,
            p.pos[2] + p.vel[2]
          ] as [number, number, number]
        }))
        .filter(p => p.pos[1] > 0)
    );
  });

  return (
    <group position={[0, 1.1, 1]}>
      <mesh castShadow>
        <cylinderGeometry args={[0.2, 0.15, 0.15, 32]} />
        <meshStandardMaterial color="#e8e0d5" roughness={0.3} metalness={0.1} />
      </mesh>
      
      <mesh ref={bowlContentsRef} position={[0, 0.02, 0]}>
        <cylinderGeometry args={[0.17, 0.12, 0.1, 32]} />
        <meshStandardMaterial color="#fff5dc" roughness={0.8} />
      </mesh>
      
      <group ref={spoonRef} position={[0, 0.1, 0]}>
        <mesh position={[0, 0.1, 0]} rotation={[0.3, 0, 0]} castShadow>
          <cylinderGeometry args={[0.012, 0.012, 0.25, 8]} />
          <meshStandardMaterial color="#8b7355" roughness={0.7} />
        </mesh>
        <mesh position={[0, -0.02, 0.02]}>
          <sphereGeometry args={[0.03, 12, 8]} />
          <meshStandardMaterial color="#8b7355" roughness={0.7} />
        </mesh>
      </group>
      
      {splashParticles.map(p => (
        <mesh key={p.id} position={p.pos}>
          <sphereGeometry args={[0.01, 6, 6]} />
          <meshStandardMaterial color="#fff5dc" />
        </mesh>
      ))}
      
      <mesh position={[0, -0.08, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.18, 0.22, 32]} />
        <meshBasicMaterial 
          color={isTooFast ? "#ff4444" : progress > 50 ? "#44ff44" : "#ffff44"} 
          transparent 
          opacity={0.3} 
        />
      </mesh>
    </group>
  );
}
