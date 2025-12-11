import { useRef, useEffect } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { useCookingGame } from "@/lib/stores/useCookingGame";

const CAMERA_PRESETS = {
  wide: {
    position: new THREE.Vector3(0, 5, 8),
    target: new THREE.Vector3(0, 1, 0)
  },
  closeup: {
    position: new THREE.Vector3(0, 2.5, 3),
    target: new THREE.Vector3(0, 1, 0)
  },
  firstperson: {
    position: new THREE.Vector3(0, 1.8, 2),
    target: new THREE.Vector3(0, 1, -2)
  },
  stove: {
    position: new THREE.Vector3(0, 2.5, 1),
    target: new THREE.Vector3(0, 1, -2)
  },
  cutting: {
    position: new THREE.Vector3(-3, 2.2, 0.5),
    target: new THREE.Vector3(-3, 1, -1.8)
  }
};

export function CameraController() {
  const { camera } = useThree();
  const controlsRef = useRef<any>(null);
  const cameraPreset = useCookingGame(state => state.cameraPreset);
  const currentMiniGame = useCookingGame(state => state.currentMiniGame);
  
  const targetPosition = useRef(new THREE.Vector3(0, 5, 8));
  const targetLookAt = useRef(new THREE.Vector3(0, 1, 0));

  useEffect(() => {
    let preset = cameraPreset;
    
    if (currentMiniGame === "chopping") {
      preset = "cutting";
    } else if (currentMiniGame === "heat_control") {
      preset = "stove";
    } else if (currentMiniGame === "stirring") {
      preset = "closeup";
    }
    
    const presetData = CAMERA_PRESETS[preset];
    targetPosition.current.copy(presetData.position);
    targetLookAt.current.copy(presetData.target);
  }, [cameraPreset, currentMiniGame]);

  useFrame(() => {
    camera.position.lerp(targetPosition.current, 0.05);
    
    if (controlsRef.current) {
      controlsRef.current.target.lerp(targetLookAt.current, 0.05);
      controlsRef.current.update();
    }
  });

  return (
    <OrbitControls
      ref={controlsRef}
      enablePan={false}
      enableZoom={true}
      minDistance={2}
      maxDistance={15}
      minPolarAngle={Math.PI / 6}
      maxPolarAngle={Math.PI / 2.2}
      dampingFactor={0.05}
      enableDamping
    />
  );
}
