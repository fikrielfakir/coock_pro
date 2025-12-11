import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface RefrigeratorProps {
  position: [number, number, number];
}

export function Refrigerator({ position }: RefrigeratorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const doorRef = useRef<THREE.Group>(null);
  const targetRotation = useRef(0);

  useFrame(() => {
    if (doorRef.current) {
      targetRotation.current = isOpen ? -Math.PI / 2 : 0;
      doorRef.current.rotation.y += (targetRotation.current - doorRef.current.rotation.y) * 0.1;
    }
  });

  return (
    <group position={position}>
      <mesh castShadow>
        <boxGeometry args={[1, 2.2, 0.8]} />
        <meshStandardMaterial color="#e8e8e8" metalness={0.3} roughness={0.4} />
      </mesh>
      
      <group ref={doorRef} position={[0.5, 0, 0.4]}>
        <mesh position={[-0.5, 0.55, 0]} castShadow>
          <boxGeometry args={[0.98, 1.05, 0.05]} />
          <meshStandardMaterial color="#f0f0f0" metalness={0.4} roughness={0.3} />
        </mesh>
        <mesh position={[-0.15, 0.55, 0.03]}>
          <boxGeometry args={[0.08, 0.3, 0.02]} />
          <meshStandardMaterial color="#c0c0c0" metalness={0.8} roughness={0.2} />
        </mesh>
        
        <mesh position={[-0.5, -0.55, 0]} castShadow>
          <boxGeometry args={[0.98, 1.05, 0.05]} />
          <meshStandardMaterial color="#f0f0f0" metalness={0.4} roughness={0.3} />
        </mesh>
        <mesh position={[-0.15, -0.55, 0.03]}>
          <boxGeometry args={[0.08, 0.3, 0.02]} />
          <meshStandardMaterial color="#c0c0c0" metalness={0.8} roughness={0.2} />
        </mesh>
      </group>
      
      {isOpen && (
        <group position={[0, 0, 0.35]}>
          <mesh position={[0, 0.7, 0]}>
            <boxGeometry args={[0.85, 0.02, 0.6]} />
            <meshStandardMaterial color="#cccccc" />
          </mesh>
          <mesh position={[0, 0.3, 0]}>
            <boxGeometry args={[0.85, 0.02, 0.6]} />
            <meshStandardMaterial color="#cccccc" />
          </mesh>
          <mesh position={[0, -0.1, 0]}>
            <boxGeometry args={[0.85, 0.02, 0.6]} />
            <meshStandardMaterial color="#cccccc" />
          </mesh>
          
          <pointLight position={[0, 0, 0]} intensity={0.5} color="#ffffee" distance={2} />
        </group>
      )}
      
      <mesh 
        position={[0, 0, 0.45]} 
        onClick={() => setIsOpen(!isOpen)}
        visible={false}
      >
        <boxGeometry args={[1.2, 2.4, 0.2]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
    </group>
  );
}
