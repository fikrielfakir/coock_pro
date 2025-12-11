import { useRef, useState, useEffect, useCallback, useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useCookingGame } from "@/lib/stores/useCookingGame";

interface HeatControlGameProps {
  onComplete: (score: number) => void;
  targetTemp?: number;
  duration?: number;
}

export function HeatControlGame({ onComplete, targetTemp = 70, duration = 10 }: HeatControlGameProps) {
  const { gl } = useThree();
  const panRef = useRef<THREE.Mesh>(null);
  const knobRef = useRef<THREE.Group>(null);
  const [temperature, setTemperatureLocal] = useState(0);
  const [knobRotation, setKnobRotation] = useState(0);
  const [timeInZone, setTimeInZone] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [smokeParticles, setSmokeParticles] = useState<{ id: number; pos: [number, number, number]; opacity: number }[]>([]);
  const [steamParticles, setSteamParticles] = useState<{ id: number; pos: [number, number, number]; opacity: number }[]>([]);
  
  const setGameTemperature = useCookingGame(state => state.setTemperature);

  const targetZone = useMemo(() => ({
    min: targetTemp - 15,
    max: targetTemp + 15
  }), [targetTemp]);

  const handleMouseDown = useCallback(() => setIsDragging(true), []);
  const handleMouseUp = useCallback(() => setIsDragging(false), []);
  
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;
    const movementY = e.movementY;
    setKnobRotation(prev => {
      const newRot = Math.max(0, Math.min(Math.PI, prev - movementY * 0.02));
      return newRot;
    });
  }, [isDragging]);

  useEffect(() => {
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("mousemove", handleMouseMove);
    
    return () => {
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [handleMouseDown, handleMouseUp, handleMouseMove]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "ArrowUp" || e.code === "KeyW") {
        setKnobRotation(prev => Math.min(Math.PI, prev + 0.1));
      } else if (e.code === "ArrowDown" || e.code === "KeyS") {
        setKnobRotation(prev => Math.max(0, prev - 0.1));
      }
    };
    
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (timeInZone >= duration) {
      const accuracy = Math.abs(temperature - targetTemp);
      const accuracyScore = Math.max(0, 100 - accuracy * 2);
      onComplete(Math.round(accuracyScore));
    }
  }, [timeInZone, duration, temperature, targetTemp, onComplete]);

  useFrame((state, delta) => {
    const targetTemperature = (knobRotation / Math.PI) * 100;
    const newTemp = temperature + (targetTemperature - temperature) * delta * 2;
    setTemperatureLocal(newTemp);
    setGameTemperature(newTemp);
    
    if (knobRef.current) {
      knobRef.current.rotation.z = knobRotation;
    }
    
    const inZone = newTemp >= targetZone.min && newTemp <= targetZone.max;
    if (inZone) {
      setTimeInZone(prev => prev + delta);
    }
    
    if (newTemp > 85 && Math.random() > 0.9) {
      const newSmoke = {
        id: Date.now() + Math.random(),
        pos: [
          (Math.random() - 0.5) * 0.2,
          0.15,
          (Math.random() - 0.5) * 0.2
        ] as [number, number, number],
        opacity: 0.6
      };
      setSmokeParticles(prev => [...prev.slice(-10), newSmoke]);
    }
    
    if (newTemp > 40 && newTemp < 85 && Math.random() > 0.95) {
      const newSteam = {
        id: Date.now() + Math.random(),
        pos: [
          (Math.random() - 0.5) * 0.15,
          0.12,
          (Math.random() - 0.5) * 0.15
        ] as [number, number, number],
        opacity: 0.4
      };
      setSteamParticles(prev => [...prev.slice(-8), newSteam]);
    }
    
    setSmokeParticles(prev => 
      prev
        .map(p => ({
          ...p,
          pos: [p.pos[0], p.pos[1] + 0.01, p.pos[2]] as [number, number, number],
          opacity: p.opacity - 0.02
        }))
        .filter(p => p.opacity > 0)
    );
    
    setSteamParticles(prev => 
      prev
        .map(p => ({
          ...p,
          pos: [p.pos[0], p.pos[1] + 0.008, p.pos[2]] as [number, number, number],
          opacity: p.opacity - 0.015
        }))
        .filter(p => p.opacity > 0)
    );
    
    if (panRef.current) {
      const heatColor = new THREE.Color().setHSL(
        0.05 - (newTemp / 100) * 0.05,
        0.8,
        0.3 + (newTemp / 100) * 0.2
      );
      (panRef.current.material as THREE.MeshStandardMaterial).emissive = heatColor;
      (panRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity = newTemp / 150;
    }
  });

  const inZone = temperature >= targetZone.min && temperature <= targetZone.max;
  const isBurning = temperature > 85;

  return (
    <group position={[0, 1.05, -2]}>
      <mesh ref={panRef} position={[0, 0.05, 0]} castShadow>
        <cylinderGeometry args={[0.2, 0.18, 0.06, 32]} />
        <meshStandardMaterial color="#3a3a3a" metalness={0.8} roughness={0.3} />
      </mesh>
      
      <mesh position={[0.28, 0.05, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.015, 0.015, 0.15, 12]} />
        <meshStandardMaterial color="#2a2a2a" metalness={0.7} roughness={0.4} />
      </mesh>
      
      <mesh position={[0, 0.01, 0]}>
        <cylinderGeometry args={[0.17, 0.17, 0.02, 32]} />
        <meshStandardMaterial 
          color={isBurning ? "#2a1a10" : "#c49a6c"} 
          roughness={0.7} 
        />
      </mesh>
      
      <group ref={knobRef} position={[-0.5, 0, 0.3]}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.04, 0.04, 0.02, 16]} />
          <meshStandardMaterial color="#666666" metalness={0.8} roughness={0.2} />
        </mesh>
        <mesh position={[0.03, 0, 0.01]}>
          <boxGeometry args={[0.02, 0.01, 0.005]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
      </group>
      
      <group position={[-0.55, 0.15, 0.3]}>
        <mesh>
          <boxGeometry args={[0.08, 0.15, 0.01]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
        <mesh 
          position={[0, -0.07 + (temperature / 100) * 0.14, 0.006]}
          scale={[0.6, temperature / 100, 1]}
        >
          <boxGeometry args={[0.06, 0.14, 0.005]} />
          <meshStandardMaterial 
            color={isBurning ? "#ff0000" : inZone ? "#00ff00" : "#ffaa00"} 
          />
        </mesh>
        <mesh 
          position={[0, -0.07 + ((targetZone.min + targetZone.max) / 200) * 0.14, 0.008]}
        >
          <boxGeometry args={[0.08, 0.02, 0.002]} />
          <meshBasicMaterial color="#00ff00" transparent opacity={0.5} />
        </mesh>
      </group>
      
      {smokeParticles.map(p => (
        <mesh key={p.id} position={p.pos}>
          <sphereGeometry args={[0.02, 6, 6]} />
          <meshBasicMaterial color="#444444" transparent opacity={p.opacity} />
        </mesh>
      ))}
      
      {steamParticles.map(p => (
        <mesh key={p.id} position={p.pos}>
          <sphereGeometry args={[0.015, 6, 6]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={p.opacity} />
        </mesh>
      ))}
      
      {temperature > 30 && (
        <pointLight
          position={[0, 0.1, 0]}
          color="#ff6600"
          intensity={(temperature / 100) * 0.5}
          distance={1}
        />
      )}
    </group>
  );
}
