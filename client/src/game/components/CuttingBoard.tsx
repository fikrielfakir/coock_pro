import * as THREE from "three";
import { useTexture } from "@react-three/drei";
import { useMemo } from "react";

interface CuttingBoardProps {
  position: [number, number, number];
}

export function CuttingBoard({ position }: CuttingBoardProps) {
  const woodTexture = useTexture("/textures/wood.jpg");
  
  useMemo(() => {
    woodTexture.wrapS = woodTexture.wrapT = THREE.RepeatWrapping;
    woodTexture.repeat.set(1, 0.5);
  }, [woodTexture]);

  return (
    <group position={position}>
      <mesh castShadow receiveShadow rotation={[0, 0, 0]}>
        <boxGeometry args={[0.6, 0.03, 0.4]} />
        <meshStandardMaterial 
          map={woodTexture}
          color="#c4a574"
          roughness={0.8}
        />
      </mesh>
      <mesh position={[0, 0.005, 0]}>
        <boxGeometry args={[0.55, 0.01, 0.35]} />
        <meshStandardMaterial color="#d4b584" roughness={0.9} />
      </mesh>
    </group>
  );
}
