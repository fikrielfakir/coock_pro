import { useRef, useEffect, useCallback } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { useCookingGame } from "@/lib/stores/useCookingGame";

export type CameraPreset = "wide" | "closeup" | "firstperson" | "overhead" | "side" | "stove" | "cutting";

const CAMERA_PRESETS: Record<CameraPreset, { position: THREE.Vector3; target: THREE.Vector3 }> = {
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
  overhead: {
    position: new THREE.Vector3(0, 8, 0.5),
    target: new THREE.Vector3(0, 0, 0)
  },
  side: {
    position: new THREE.Vector3(6, 3, 0),
    target: new THREE.Vector3(0, 1, 0)
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

interface CameraShakeState {
  active: boolean;
  intensity: number;
  decay: number;
  offset: THREE.Vector3;
}

export function CameraController() {
  const { camera } = useThree();
  const controlsRef = useRef<any>(null);
  const cameraPreset = useCookingGame(state => state.cameraPreset);
  const currentMiniGame = useCookingGame(state => state.currentMiniGame);
  
  const targetPosition = useRef(new THREE.Vector3(0, 5, 8));
  const targetLookAt = useRef(new THREE.Vector3(0, 1, 0));
  
  const shakeState = useRef<CameraShakeState>({
    active: false,
    intensity: 0,
    decay: 0.95,
    offset: new THREE.Vector3()
  });

  const triggerShake = useCallback((intensity: number = 0.1, decay: number = 0.92) => {
    shakeState.current = {
      active: true,
      intensity,
      decay,
      offset: new THREE.Vector3()
    };
  }, []);

  useEffect(() => {
    (window as any).triggerCameraShake = triggerShake;
    return () => {
      delete (window as any).triggerCameraShake;
    };
  }, [triggerShake]);

  useEffect(() => {
    let preset: CameraPreset = cameraPreset as CameraPreset;
    
    if (currentMiniGame === "chopping") {
      preset = "cutting";
    } else if (currentMiniGame === "heat_control") {
      preset = "stove";
    } else if (currentMiniGame === "stirring") {
      preset = "closeup";
    }
    
    const presetData = CAMERA_PRESETS[preset] || CAMERA_PRESETS.wide;
    targetPosition.current.copy(presetData.position);
    targetLookAt.current.copy(presetData.target);
  }, [cameraPreset, currentMiniGame]);

  useFrame((_, delta) => {
    const lerpFactor = 1 - Math.pow(0.001, delta);
    
    camera.position.lerp(targetPosition.current, lerpFactor * 3);
    
    if (shakeState.current.active) {
      const shake = shakeState.current;
      shake.offset.set(
        (Math.random() - 0.5) * shake.intensity,
        (Math.random() - 0.5) * shake.intensity,
        (Math.random() - 0.5) * shake.intensity
      );
      
      camera.position.add(shake.offset);
      
      shake.intensity *= shake.decay;
      
      if (shake.intensity < 0.001) {
        shake.active = false;
        shake.intensity = 0;
        shake.offset.set(0, 0, 0);
      }
    }
    
    if (controlsRef.current) {
      controlsRef.current.target.lerp(targetLookAt.current, lerpFactor * 3);
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
      rotateSpeed={0.5}
      zoomSpeed={0.8}
    />
  );
}

export function useCameraShake() {
  const triggerShake = useCallback((intensity: number = 0.1, decay: number = 0.92) => {
    if ((window as any).triggerCameraShake) {
      (window as any).triggerCameraShake(intensity, decay);
    }
  }, []);

  return { triggerShake };
}
