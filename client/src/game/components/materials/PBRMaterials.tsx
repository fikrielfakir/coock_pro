import { useMemo } from "react";
import * as THREE from "three";
import { useTexture } from "@react-three/drei";

export function useStainlessSteelMaterial() {
  return useMemo(() => {
    const material = new THREE.MeshStandardMaterial({
      color: "#c0c0c0",
      metalness: 0.9,
      roughness: 0.15,
      envMapIntensity: 1.2,
    });
    return material;
  }, []);
}

export function useCopperMaterial() {
  return useMemo(() => {
    const material = new THREE.MeshStandardMaterial({
      color: "#b87333",
      metalness: 0.85,
      roughness: 0.2,
      envMapIntensity: 1.0,
    });
    return material;
  }, []);
}

export function useCastIronMaterial() {
  return useMemo(() => {
    const material = new THREE.MeshStandardMaterial({
      color: "#2a2a2a",
      metalness: 0.7,
      roughness: 0.6,
      envMapIntensity: 0.5,
    });
    return material;
  }, []);
}

export function useMarbleMaterial() {
  return useMemo(() => {
    const material = new THREE.MeshPhysicalMaterial({
      color: "#f5f5f5",
      metalness: 0.0,
      roughness: 0.2,
      clearcoat: 0.3,
      clearcoatRoughness: 0.1,
      envMapIntensity: 0.8,
    });
    return material;
  }, []);
}

export function useGraniteMaterial() {
  return useMemo(() => {
    const material = new THREE.MeshStandardMaterial({
      color: "#4a4a4a",
      metalness: 0.1,
      roughness: 0.4,
      envMapIntensity: 0.6,
    });
    return material;
  }, []);
}

export function useWoodMaterial() {
  const woodTexture = useTexture("/textures/wood.jpg");
  
  return useMemo(() => {
    woodTexture.wrapS = woodTexture.wrapT = THREE.RepeatWrapping;
    woodTexture.repeat.set(2, 2);
    
    const material = new THREE.MeshStandardMaterial({
      map: woodTexture,
      color: "#c4a574",
      metalness: 0.0,
      roughness: 0.6,
      envMapIntensity: 0.3,
    });
    return material;
  }, [woodTexture]);
}

export function useGlassMaterial() {
  return useMemo(() => {
    const material = new THREE.MeshPhysicalMaterial({
      color: "#ffffff",
      metalness: 0.0,
      roughness: 0.0,
      transmission: 0.95,
      thickness: 0.5,
      ior: 1.5,
      envMapIntensity: 1.0,
      transparent: true,
      opacity: 0.3,
    });
    return material;
  }, []);
}

export function usePlasticMaterial(color: string = "#ffffff") {
  return useMemo(() => {
    const material = new THREE.MeshStandardMaterial({
      color: color,
      metalness: 0.0,
      roughness: 0.3,
      envMapIntensity: 0.5,
    });
    return material;
  }, [color]);
}

export function useFabricMaterial(color: string = "#ffffff") {
  return useMemo(() => {
    const material = new THREE.MeshStandardMaterial({
      color: color,
      metalness: 0.0,
      roughness: 0.9,
      envMapIntensity: 0.2,
    });
    return material;
  }, [color]);
}

export function useCeramicMaterial(color: string = "#f0f0f0") {
  return useMemo(() => {
    const material = new THREE.MeshPhysicalMaterial({
      color: color,
      metalness: 0.0,
      roughness: 0.15,
      clearcoat: 0.5,
      clearcoatRoughness: 0.05,
      envMapIntensity: 0.8,
    });
    return material;
  }, [color]);
}

export type CookingState = "raw" | "cooking" | "cooked" | "burnt";

export function useFoodMaterial(
  baseColor: string,
  cookingState: CookingState = "raw"
) {
  return useMemo(() => {
    let color = baseColor;
    let roughness = 0.6;
    let metalness = 0.0;

    switch (cookingState) {
      case "raw":
        roughness = 0.5;
        break;
      case "cooking":
        color = adjustColorBrightness(baseColor, -0.1);
        roughness = 0.55;
        break;
      case "cooked":
        color = adjustColorBrightness(baseColor, -0.2);
        roughness = 0.7;
        break;
      case "burnt":
        color = "#1a1a1a";
        roughness = 0.9;
        break;
    }

    const material = new THREE.MeshStandardMaterial({
      color: color,
      metalness: metalness,
      roughness: roughness,
      envMapIntensity: 0.4,
    });
    return material;
  }, [baseColor, cookingState]);
}

export function useVegetableMaterial(
  baseColor: string,
  isWet: boolean = false
) {
  return useMemo(() => {
    const material = new THREE.MeshPhysicalMaterial({
      color: baseColor,
      metalness: 0.0,
      roughness: isWet ? 0.2 : 0.5,
      clearcoat: isWet ? 0.3 : 0.0,
      clearcoatRoughness: 0.1,
      envMapIntensity: isWet ? 0.8 : 0.4,
    });
    return material;
  }, [baseColor, isWet]);
}

export function useMeatMaterial(isCooked: boolean = false, isBurnt: boolean = false) {
  return useMemo(() => {
    let color = "#cc4444";
    let roughness = 0.4;

    if (isBurnt) {
      color = "#1a1a1a";
      roughness = 0.85;
    } else if (isCooked) {
      color = "#8b4513";
      roughness = 0.6;
    }

    const material = new THREE.MeshPhysicalMaterial({
      color: color,
      metalness: 0.0,
      roughness: roughness,
      clearcoat: isCooked && !isBurnt ? 0.2 : 0.0,
      clearcoatRoughness: 0.3,
      envMapIntensity: 0.5,
    });
    return material;
  }, [isCooked, isBurnt]);
}

export function useLiquidMaterial(color: string = "#3498db", viscosity: number = 0.5) {
  return useMemo(() => {
    const material = new THREE.MeshPhysicalMaterial({
      color: color,
      metalness: 0.0,
      roughness: 0.0,
      transmission: 0.8,
      thickness: 0.3,
      ior: 1.33,
      envMapIntensity: 1.0,
      transparent: true,
      opacity: 0.7,
    });
    return material;
  }, [color, viscosity]);
}

export function useOilMaterial() {
  return useMemo(() => {
    const material = new THREE.MeshPhysicalMaterial({
      color: "#f4d03f",
      metalness: 0.0,
      roughness: 0.0,
      transmission: 0.6,
      thickness: 0.2,
      ior: 1.47,
      envMapIntensity: 1.0,
      transparent: true,
      opacity: 0.85,
    });
    return material;
  }, []);
}

function adjustColorBrightness(hex: string, percent: number): string {
  const num = parseInt(hex.replace("#", ""), 16);
  const amt = Math.round(2.55 * percent * 100);
  const R = Math.max(0, Math.min(255, (num >> 16) + amt));
  const G = Math.max(0, Math.min(255, ((num >> 8) & 0x00ff) + amt));
  const B = Math.max(0, Math.min(255, (num & 0x0000ff) + amt));
  return `#${((1 << 24) + (R << 16) + (G << 8) + B).toString(16).slice(1)}`;
}

interface PBRCookwareProps {
  type: "pan" | "pot" | "lid" | "spatula" | "knife";
  material?: "stainless" | "copper" | "cast_iron";
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
}

export function PBRCookware({
  type,
  material = "stainless",
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
}: PBRCookwareProps) {
  const stainlessMat = useStainlessSteelMaterial();
  const copperMat = useCopperMaterial();
  const castIronMat = useCastIronMaterial();

  const selectedMaterial = useMemo(() => {
    switch (material) {
      case "copper":
        return copperMat;
      case "cast_iron":
        return castIronMat;
      default:
        return stainlessMat;
    }
  }, [material, stainlessMat, copperMat, castIronMat]);

  const geometry = useMemo(() => {
    switch (type) {
      case "pan":
        return (
          <group>
            <mesh castShadow receiveShadow>
              <cylinderGeometry args={[0.15 * scale, 0.12 * scale, 0.04 * scale, 32]} />
              <primitive object={selectedMaterial} attach="material" />
            </mesh>
            <mesh position={[0.2 * scale, 0, 0]} castShadow>
              <boxGeometry args={[0.15 * scale, 0.02 * scale, 0.03 * scale]} />
              <meshStandardMaterial color="#2a2a2a" roughness={0.6} />
            </mesh>
          </group>
        );
      case "pot":
        return (
          <group>
            <mesh castShadow receiveShadow>
              <cylinderGeometry args={[0.12 * scale, 0.12 * scale, 0.12 * scale, 32]} />
              <primitive object={selectedMaterial} attach="material" />
            </mesh>
          </group>
        );
      case "lid":
        return (
          <group>
            <mesh castShadow>
              <cylinderGeometry args={[0.13 * scale, 0.12 * scale, 0.02 * scale, 32]} />
              <primitive object={selectedMaterial} attach="material" />
            </mesh>
            <mesh position={[0, 0.02 * scale, 0]} castShadow>
              <sphereGeometry args={[0.02 * scale, 16, 16]} />
              <meshStandardMaterial color="#2a2a2a" roughness={0.4} />
            </mesh>
          </group>
        );
      case "spatula":
        return (
          <group>
            <mesh castShadow>
              <boxGeometry args={[0.25 * scale, 0.01 * scale, 0.05 * scale]} />
              <primitive object={selectedMaterial} attach="material" />
            </mesh>
          </group>
        );
      case "knife":
        return (
          <group>
            <mesh castShadow>
              <boxGeometry args={[0.2 * scale, 0.005 * scale, 0.03 * scale]} />
              <primitive object={selectedMaterial} attach="material" />
            </mesh>
            <mesh position={[-0.12 * scale, 0, 0]} castShadow>
              <boxGeometry args={[0.08 * scale, 0.02 * scale, 0.025 * scale]} />
              <meshStandardMaterial color="#4a3728" roughness={0.7} />
            </mesh>
          </group>
        );
      default:
        return null;
    }
  }, [type, selectedMaterial, scale]);

  return (
    <group position={position} rotation={rotation}>
      {geometry}
    </group>
  );
}

interface PBRCountertopProps {
  type: "marble" | "granite" | "wood";
  position?: [number, number, number];
  size?: [number, number, number];
}

export function PBRCountertop({
  type,
  position = [0, 0, 0],
  size = [2, 0.05, 0.8],
}: PBRCountertopProps) {
  const marbleMat = useMarbleMaterial();
  const graniteMat = useGraniteMaterial();
  const woodMat = useWoodMaterial();

  const selectedMaterial = useMemo(() => {
    switch (type) {
      case "granite":
        return graniteMat;
      case "wood":
        return woodMat;
      default:
        return marbleMat;
    }
  }, [type, marbleMat, graniteMat, woodMat]);

  return (
    <mesh position={position} castShadow receiveShadow>
      <boxGeometry args={size} />
      <primitive object={selectedMaterial} attach="material" />
    </mesh>
  );
}
