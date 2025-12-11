import { useRef } from "react";
import * as THREE from "three";

export function Lighting() {
  const directionalLightRef = useRef<THREE.DirectionalLight>(null);

  return (
    <>
      <ambientLight intensity={0.4} color="#fff8f0" />
      
      <directionalLight
        ref={directionalLightRef}
        position={[5, 8, 5]}
        intensity={1.2}
        color="#fffaf0"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={50}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
        shadow-bias={-0.0001}
      />
      
      <directionalLight
        position={[-3, 6, -2]}
        intensity={0.5}
        color="#e8f0ff"
      />
      
      <pointLight
        position={[-3, 2.5, -1]}
        intensity={0.8}
        color="#fff5e6"
        distance={5}
      />
      
      <pointLight
        position={[3, 2.5, -1]}
        intensity={0.8}
        color="#fff5e6"
        distance={5}
      />
      
      <hemisphereLight
        args={["#87ceeb", "#8b4513", 0.3]}
      />
    </>
  );
}
