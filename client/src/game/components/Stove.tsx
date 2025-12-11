import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useCookingGame } from "@/lib/stores/useCookingGame";

interface StoveProps {
  position: [number, number, number];
}

export function Stove({ position }: StoveProps) {
  const temperature = useCookingGame(state => state.temperature);
  
  return (
    <group position={position}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[2.5, 0.15, 0.9]} />
        <meshStandardMaterial color="#1a1a1a" metalness={0.7} roughness={0.3} />
      </mesh>
      
      <Burner position={[-0.6, 0.1, 0]} intensity={temperature / 100} />
      <Burner position={[0.6, 0.1, 0]} intensity={temperature / 100 * 0.8} />
      
      <StoveKnob position={[-0.8, 0, 0.5]} />
      <StoveKnob position={[-0.4, 0, 0.5]} />
      <StoveKnob position={[0.4, 0, 0.5]} />
      <StoveKnob position={[0.8, 0, 0.5]} />
      
      <mesh position={[0, -0.4, -0.1]} castShadow>
        <boxGeometry args={[2.4, 0.7, 0.7]} />
        <meshStandardMaterial color="#2a2a2a" metalness={0.5} roughness={0.4} />
      </mesh>
      
      <mesh position={[0, -0.4, 0.25]}>
        <boxGeometry args={[0.8, 0.4, 0.05]} />
        <meshStandardMaterial color="#111111" />
      </mesh>
    </group>
  );
}

interface BurnerProps {
  position: [number, number, number];
  intensity: number;
}

function Burner({ position, intensity }: BurnerProps) {
  const flameRef = useRef<THREE.Group>(null);
  
  const flameParticles = useMemo(() => {
    const particles: { offset: number; scale: number; angle: number }[] = [];
    for (let i = 0; i < 12; i++) {
      particles.push({
        offset: Math.random() * 0.5,
        scale: 0.5 + Math.random() * 0.5,
        angle: (i / 12) * Math.PI * 2
      });
    }
    return particles;
  }, []);
  
  useFrame((state) => {
    if (flameRef.current && intensity > 0) {
      flameRef.current.children.forEach((child, i) => {
        const particle = flameParticles[i];
        const flickerY = Math.sin(state.clock.elapsedTime * 10 + particle.offset) * 0.02;
        const flickerScale = 0.8 + Math.sin(state.clock.elapsedTime * 15 + particle.offset) * 0.2;
        child.position.y = 0.05 + flickerY;
        child.scale.setScalar(intensity * particle.scale * flickerScale);
      });
    }
  });

  return (
    <group position={position}>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.15, 0.25, 32]} />
        <meshStandardMaterial 
          color={intensity > 0 ? "#ff4400" : "#333333"} 
          emissive={intensity > 0 ? "#ff2200" : "#000000"}
          emissiveIntensity={intensity * 2}
        />
      </mesh>
      
      {intensity > 0 && (
        <group ref={flameRef}>
          {flameParticles.map((particle, i) => (
            <mesh 
              key={i}
              position={[
                Math.cos(particle.angle) * 0.18,
                0.05,
                Math.sin(particle.angle) * 0.18
              ]}
            >
              <coneGeometry args={[0.02, 0.08, 8]} />
              <meshBasicMaterial 
                color={new THREE.Color().setHSL(0.08, 1, 0.5 + intensity * 0.3)}
                transparent
                opacity={0.8}
              />
            </mesh>
          ))}
        </group>
      )}
      
      {intensity > 0 && (
        <pointLight 
          position={[0, 0.1, 0]} 
          color="#ff6600" 
          intensity={intensity * 2} 
          distance={3}
        />
      )}
    </group>
  );
}

interface StoveKnobProps {
  position: [number, number, number];
}

function StoveKnob({ position }: StoveKnobProps) {
  return (
    <group position={position}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 0.03, 16]} />
        <meshStandardMaterial color="#888888" metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh position={[0, 0, 0.025]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 0.02, 8]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
    </group>
  );
}
