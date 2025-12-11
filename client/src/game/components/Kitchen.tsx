import { useRef, useMemo } from "react";
import * as THREE from "three";
import { useTexture } from "@react-three/drei";
import { Stove } from "./Stove";
import { CuttingBoard } from "./CuttingBoard";
import { Refrigerator } from "./Refrigerator";

const KITCHEN_WIDTH = 10;
const KITCHEN_DEPTH = 8;

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
      <Countertop position={[-3, 0.9, -3]} />
      <Countertop position={[0, 0.9, -3]} />
      <Countertop position={[3, 0.9, -3]} />
      <IslandCounter position={[0, 0.9, 1]} />
      <Stove position={[0, 0.9, -3]} />
      <CuttingBoard position={[-3, 1.02, -2.8]} />
      <Refrigerator position={[4.5, 0, -3.5]} />
      <Sink position={[3, 0.9, -3]} />
      <Cabinets />
      <KitchenProps />
    </group>
  );
}

function Floor() {
  const tiles = useMemo(() => {
    const tileArray: { position: [number, number, number]; color: string }[] = [];
    const tileSize = 0.5;
    const tilesX = Math.floor(KITCHEN_WIDTH / tileSize);
    const tilesZ = Math.floor(KITCHEN_DEPTH / tileSize);
    
    for (let x = 0; x < tilesX; x++) {
      for (let z = 0; z < tilesZ; z++) {
        const isAlternate = (x + z) % 2 === 0;
        tileArray.push({
          position: [
            -KITCHEN_WIDTH / 2 + tileSize / 2 + x * tileSize,
            0.001,
            -KITCHEN_DEPTH / 2 + tileSize / 2 + z * tileSize
          ],
          color: isAlternate ? "#d4c4b0" : "#c9b99a"
        });
      }
    }
    return tileArray;
  }, []);

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[KITCHEN_WIDTH, KITCHEN_DEPTH]} />
        <meshStandardMaterial color="#d4c4b0" roughness={0.6} />
      </mesh>
      {tiles.map((tile, i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={tile.position} receiveShadow>
          <planeGeometry args={[0.48, 0.48]} />
          <meshStandardMaterial color={tile.color} roughness={0.5} metalness={0.05} />
        </mesh>
      ))}
    </group>
  );
}

function Walls() {
  return (
    <group>
      <mesh position={[0, 3, -KITCHEN_DEPTH / 2]} receiveShadow>
        <planeGeometry args={[KITCHEN_WIDTH, 6]} />
        <meshStandardMaterial color="#f5f0e8" roughness={0.9} />
      </mesh>
      <mesh position={[-KITCHEN_WIDTH / 2, 3, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[KITCHEN_DEPTH, 6]} />
        <meshStandardMaterial color="#f0ebe3" roughness={0.9} />
      </mesh>
      <mesh position={[KITCHEN_WIDTH / 2, 3, 0]} rotation={[0, -Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[KITCHEN_DEPTH, 6]} />
        <meshStandardMaterial color="#f0ebe3" roughness={0.9} />
      </mesh>
      <Backsplash />
    </group>
  );
}

function Backsplash() {
  return (
    <mesh position={[0, 1.5, -3.95]} receiveShadow>
      <boxGeometry args={[8, 1.2, 0.1]} />
      <meshStandardMaterial color="#e8e0d5" roughness={0.4} metalness={0.1} />
    </mesh>
  );
}

interface CountertopProps {
  position: [number, number, number];
}

function Countertop({ position }: CountertopProps) {
  return (
    <group position={position}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[2.8, 0.1, 1.2]} />
        <meshStandardMaterial 
          color="#e8e0d5" 
          roughness={0.25} 
          metalness={0.15}
        />
      </mesh>
      <mesh position={[0, -0.45, 0]} castShadow>
        <boxGeometry args={[2.6, 0.8, 1]} />
        <meshStandardMaterial color="#8b7355" roughness={0.7} />
      </mesh>
      <DrawerHandles position={[0, -0.35, 0.52]} />
    </group>
  );
}

function DrawerHandles({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[-0.6, 0, 0]} castShadow>
        <boxGeometry args={[0.3, 0.03, 0.03]} />
        <meshStandardMaterial color="#a0a0a0" metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh position={[0.6, 0, 0]} castShadow>
        <boxGeometry args={[0.3, 0.03, 0.03]} />
        <meshStandardMaterial color="#a0a0a0" metalness={0.8} roughness={0.2} />
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
          roughness={0.35} 
          metalness={0.1}
        />
      </mesh>
      <mesh position={[0, -0.5, 0]} castShadow>
        <boxGeometry args={[3.8, 0.9, 1.3]} />
        <meshStandardMaterial color="#5c4033" roughness={0.8} />
      </mesh>
      <mesh position={[0, -0.35, 0.67]} castShadow>
        <boxGeometry args={[0.4, 0.03, 0.03]} />
        <meshStandardMaterial color="#a0a0a0" metalness={0.8} roughness={0.2} />
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
      <mesh position={[0, 0.5, 0.12]} rotation={[Math.PI / 4, 0, 0]}>
        <cylinderGeometry args={[0.02, 0.03, 0.18, 16]} />
        <meshStandardMaterial color="#c0c0c0" metalness={0.9} roughness={0.1} />
      </mesh>
      <FaucetHandle position={[-0.15, 0.35, 0]} />
      <FaucetHandle position={[0.15, 0.35, 0]} />
    </group>
  );
}

function FaucetHandle({ position }: { position: [number, number, number] }) {
  return (
    <mesh position={position}>
      <cylinderGeometry args={[0.025, 0.025, 0.08, 8]} />
      <meshStandardMaterial color="#b0b0b0" metalness={0.9} roughness={0.15} />
    </mesh>
  );
}

function Cabinets() {
  const positions: [number, number, number][] = [
    [-3, 2.5, -3.9],
    [-1, 2.5, -3.9],
    [1, 2.5, -3.9],
    [3, 2.5, -3.9],
  ];

  return (
    <group>
      {positions.map((pos, i) => (
        <group key={i} position={pos}>
          <mesh castShadow>
            <boxGeometry args={[1.8, 1, 0.4]} />
            <meshStandardMaterial color="#6b5344" roughness={0.7} />
          </mesh>
          <mesh position={[0.6, 0, 0.21]} castShadow>
            <boxGeometry args={[0.15, 0.03, 0.03]} />
            <meshStandardMaterial color="#a0a0a0" metalness={0.8} roughness={0.2} />
          </mesh>
          <mesh position={[-0.6, 0, 0.21]} castShadow>
            <boxGeometry args={[0.15, 0.03, 0.03]} />
            <meshStandardMaterial color="#a0a0a0" metalness={0.8} roughness={0.2} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function KitchenProps() {
  return (
    <group>
      <WindowFrame position={[0, 3, -3.98]} />
      <PotRack position={[0, 3.5, 1]} />
    </group>
  );
}

function WindowFrame({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh>
        <boxGeometry args={[2.5, 1.8, 0.05]} />
        <meshStandardMaterial color="#87ceeb" roughness={0.1} metalness={0.1} />
      </mesh>
      <mesh position={[0, 0, 0.03]}>
        <boxGeometry args={[2.6, 0.08, 0.08]} />
        <meshStandardMaterial color="#f5f0e8" roughness={0.8} />
      </mesh>
      <mesh position={[0, 0.9, 0.03]}>
        <boxGeometry args={[2.6, 0.08, 0.08]} />
        <meshStandardMaterial color="#f5f0e8" roughness={0.8} />
      </mesh>
      <mesh position={[0, -0.9, 0.03]}>
        <boxGeometry args={[2.6, 0.08, 0.08]} />
        <meshStandardMaterial color="#f5f0e8" roughness={0.8} />
      </mesh>
      <mesh position={[-1.3, 0, 0.03]} rotation={[0, 0, Math.PI / 2]}>
        <boxGeometry args={[1.8, 0.08, 0.08]} />
        <meshStandardMaterial color="#f5f0e8" roughness={0.8} />
      </mesh>
      <mesh position={[1.3, 0, 0.03]} rotation={[0, 0, Math.PI / 2]}>
        <boxGeometry args={[1.8, 0.08, 0.08]} />
        <meshStandardMaterial color="#f5f0e8" roughness={0.8} />
      </mesh>
    </group>
  );
}

function PotRack({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh>
        <boxGeometry args={[2, 0.05, 0.05]} />
        <meshStandardMaterial color="#3d3d3d" metalness={0.9} roughness={0.3} />
      </mesh>
      <HangingPot position={[-0.6, -0.3, 0]} />
      <HangingPot position={[0.2, -0.25, 0]} scale={0.9} />
      <HangingPan position={[0.8, -0.35, 0]} />
    </group>
  );
}

function HangingPot({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 0.15, 0]}>
        <cylinderGeometry args={[0.01, 0.01, 0.3, 8]} />
        <meshStandardMaterial color="#4a4a4a" metalness={0.9} roughness={0.3} />
      </mesh>
      <mesh>
        <cylinderGeometry args={[0.15, 0.12, 0.15, 16]} />
        <meshStandardMaterial color="#4a4a4a" metalness={0.8} roughness={0.35} />
      </mesh>
    </group>
  );
}

function HangingPan({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.12, 0]}>
        <cylinderGeometry args={[0.01, 0.01, 0.25, 8]} />
        <meshStandardMaterial color="#4a4a4a" metalness={0.9} roughness={0.3} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.18, 0.18, 0.05, 16]} />
        <meshStandardMaterial color="#3a3a3a" metalness={0.85} roughness={0.3} />
      </mesh>
      <mesh position={[0.22, 0, 0]}>
        <boxGeometry args={[0.15, 0.02, 0.04]} />
        <meshStandardMaterial color="#4a4a4a" metalness={0.8} roughness={0.35} />
      </mesh>
    </group>
  );
}
