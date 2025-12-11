import { useRef, useMemo } from "react";
import * as THREE from "three";
import { useTexture } from "@react-three/drei";
import { Stove } from "./Stove";
import { CuttingBoard } from "./CuttingBoard";
import { Refrigerator } from "./Refrigerator";

export function Kitchen() {
  const woodTexture = useTexture("/textures/wood.jpg");
  
  useMemo(() => {
    woodTexture.wrapS = woodTexture.wrapT = THREE.RepeatWrapping;
    woodTexture.repeat.set(2, 2);
  }, [woodTexture]);

  return (
    <group>
      <Floor />
      <Walls />
      <Countertop position={[-3, 0.9, -2]} />
      <Countertop position={[0, 0.9, -2]} />
      <Countertop position={[3, 0.9, -2]} />
      <IslandCounter position={[0, 0.9, 1]} />
      <Stove position={[0, 0.9, -2]} />
      <CuttingBoard position={[-3, 1.02, -1.8]} />
      <Refrigerator position={[5, 0, -2.5]} />
      <Sink position={[3, 0.9, -2]} />
      <Cabinets />
    </group>
  );
}

function Floor() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
      <planeGeometry args={[20, 20]} />
      <meshStandardMaterial color="#d4c4b0" roughness={0.8} />
    </mesh>
  );
}

function Walls() {
  return (
    <group>
      <mesh position={[0, 3, -4]} receiveShadow>
        <planeGeometry args={[20, 6]} />
        <meshStandardMaterial color="#f5f0e8" roughness={0.9} />
      </mesh>
      <mesh position={[-10, 3, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[20, 6]} />
        <meshStandardMaterial color="#f0ebe3" roughness={0.9} />
      </mesh>
      <mesh position={[10, 3, 0]} rotation={[0, -Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[20, 6]} />
        <meshStandardMaterial color="#f0ebe3" roughness={0.9} />
      </mesh>
    </group>
  );
}

interface CountertopProps {
  position: [number, number, number];
}

function Countertop({ position }: CountertopProps) {
  return (
    <group position={position}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[2.8, 0.1, 1]} />
        <meshStandardMaterial 
          color="#e8e0d5" 
          roughness={0.3} 
          metalness={0.1}
        />
      </mesh>
      <mesh position={[0, -0.45, 0]} castShadow>
        <boxGeometry args={[2.6, 0.8, 0.8]} />
        <meshStandardMaterial color="#8b7355" roughness={0.7} />
      </mesh>
    </group>
  );
}

function IslandCounter({ position }: CountertopProps) {
  return (
    <group position={position}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[4, 0.12, 1.5]} />
        <meshStandardMaterial 
          color="#d4c4b0" 
          roughness={0.4} 
          metalness={0.05}
        />
      </mesh>
      <mesh position={[0, -0.5, 0]} castShadow>
        <boxGeometry args={[3.8, 0.9, 1.3]} />
        <meshStandardMaterial color="#5c4033" roughness={0.8} />
      </mesh>
    </group>
  );
}

function Sink({ position }: CountertopProps) {
  return (
    <group position={position}>
      <mesh position={[0, 0.02, 0.2]}>
        <boxGeometry args={[0.8, 0.3, 0.5]} />
        <meshStandardMaterial color="#c0c0c0" metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh position={[0, -0.08, 0.2]}>
        <boxGeometry args={[0.7, 0.25, 0.4]} />
        <meshStandardMaterial color="#a0a0a0" metalness={0.9} roughness={0.1} />
      </mesh>
      <mesh position={[0, 0.3, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 0.4, 16]} />
        <meshStandardMaterial color="#c0c0c0" metalness={0.9} roughness={0.1} />
      </mesh>
      <mesh position={[0, 0.5, 0.1]} rotation={[Math.PI / 4, 0, 0]}>
        <cylinderGeometry args={[0.02, 0.03, 0.15, 16]} />
        <meshStandardMaterial color="#c0c0c0" metalness={0.9} roughness={0.1} />
      </mesh>
    </group>
  );
}

function Cabinets() {
  const positions: [number, number, number][] = [
    [-3, 2.5, -3.5],
    [-1, 2.5, -3.5],
    [1, 2.5, -3.5],
    [3, 2.5, -3.5],
  ];

  return (
    <group>
      {positions.map((pos, i) => (
        <mesh key={i} position={pos} castShadow>
          <boxGeometry args={[1.8, 1, 0.4]} />
          <meshStandardMaterial color="#6b5344" roughness={0.7} />
        </mesh>
      ))}
    </group>
  );
}
