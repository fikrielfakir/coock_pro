import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";

export type IngredientType = 
  | "tomato" | "onion" | "carrot" | "bell_pepper" | "lettuce"
  | "chicken" | "beef" | "egg"
  | "milk" | "cheese" | "butter"
  | "bread" | "rice"
  | "oil" | "water";

export type CookingState = "raw" | "cooking" | "cooked" | "burnt";

interface IngredientProps {
  type: IngredientType;
  position: [number, number, number];
  scale?: number;
  cookingState?: CookingState;
  isChopped?: boolean;
  rotation?: [number, number, number];
  animated?: boolean;
}

const INGREDIENT_COLORS: Record<IngredientType, Record<CookingState, string>> = {
  tomato: { 
    raw: "#e53935", 
    cooking: "#c62828", 
    cooked: "#b71c1c", 
    burnt: "#3e2723" 
  },
  onion: { 
    raw: "#f5f5dc", 
    cooking: "#e8d5a3", 
    cooked: "#c4a35a", 
    burnt: "#5d4037" 
  },
  carrot: { 
    raw: "#ff7043", 
    cooking: "#f4511e", 
    cooked: "#e64a19", 
    burnt: "#4e342e" 
  },
  bell_pepper: { 
    raw: "#43a047", 
    cooking: "#388e3c", 
    cooked: "#2e7d32", 
    burnt: "#33691e" 
  },
  lettuce: { 
    raw: "#81c784", 
    cooking: "#66bb6a", 
    cooked: "#4caf50", 
    burnt: "#2e7d32" 
  },
  chicken: { 
    raw: "#ffccbc", 
    cooking: "#ffab91", 
    cooked: "#d7a86e", 
    burnt: "#5d4037" 
  },
  beef: { 
    raw: "#c62828", 
    cooking: "#8d6e63", 
    cooked: "#795548", 
    burnt: "#3e2723" 
  },
  egg: { 
    raw: "#fff8e1", 
    cooking: "#fff9c4", 
    cooked: "#ffecb3", 
    burnt: "#8d6e63" 
  },
  milk: { 
    raw: "#fafafa", 
    cooking: "#f5f5f5", 
    cooked: "#eeeeee", 
    burnt: "#bdbdbd" 
  },
  cheese: { 
    raw: "#ffca28", 
    cooking: "#ffc107", 
    cooked: "#ffb300", 
    burnt: "#ff6f00" 
  },
  butter: { 
    raw: "#fff59d", 
    cooking: "#fff176", 
    cooked: "#ffee58", 
    burnt: "#8d6e63" 
  },
  bread: { 
    raw: "#d7ccc8", 
    cooking: "#bcaaa4", 
    cooked: "#a1887f", 
    burnt: "#4e342e" 
  },
  rice: { 
    raw: "#fafafa", 
    cooking: "#f5f5f5", 
    cooked: "#eeeeee", 
    burnt: "#bdbdbd" 
  },
  oil: { 
    raw: "#ffee58", 
    cooking: "#ffeb3b", 
    cooked: "#fdd835", 
    burnt: "#8d6e63" 
  },
  water: { 
    raw: "#b3e5fc", 
    cooking: "#81d4fa", 
    cooked: "#4fc3f7", 
    burnt: "#4fc3f7" 
  }
};

const INGREDIENT_ROUGHNESS: Record<IngredientType, number> = {
  tomato: 0.4,
  onion: 0.5,
  carrot: 0.5,
  bell_pepper: 0.45,
  lettuce: 0.7,
  chicken: 0.6,
  beef: 0.55,
  egg: 0.3,
  milk: 0.2,
  cheese: 0.5,
  butter: 0.3,
  bread: 0.8,
  rice: 0.6,
  oil: 0.1,
  water: 0.1
};

export function Ingredient({ 
  type, 
  position, 
  scale = 1, 
  cookingState = "raw",
  isChopped = false,
  rotation = [0, 0, 0],
  animated = false
}: IngredientProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const color = INGREDIENT_COLORS[type][cookingState];
  const roughness = INGREDIENT_ROUGHNESS[type];
  
  useFrame((_, delta) => {
    if (animated && meshRef.current) {
      meshRef.current.rotation.y += delta * 0.5;
    }
  });

  if (isChopped) {
    return <ChoppedIngredient type={type} position={position} scale={scale} color={color} roughness={roughness} />;
  }

  const geometry = useMemo(() => {
    switch (type) {
      case "tomato":
        return <sphereGeometry args={[0.06 * scale, 24, 24]} />;
      case "onion":
        return <sphereGeometry args={[0.055 * scale, 20, 20]} />;
      case "carrot":
        return <coneGeometry args={[0.025 * scale, 0.18 * scale, 12]} />;
      case "bell_pepper":
        return <capsuleGeometry args={[0.04 * scale, 0.06 * scale, 8, 16]} />;
      case "lettuce":
        return <icosahedronGeometry args={[0.08 * scale, 1]} />;
      case "chicken":
        return <boxGeometry args={[0.14 * scale, 0.04 * scale, 0.09 * scale]} />;
      case "beef":
        return <boxGeometry args={[0.12 * scale, 0.035 * scale, 0.1 * scale]} />;
      case "egg":
        return <sphereGeometry args={[0.03 * scale, 16, 12]} />;
      case "milk":
        return <cylinderGeometry args={[0.03 * scale, 0.035 * scale, 0.15 * scale, 12]} />;
      case "cheese":
        return <boxGeometry args={[0.1 * scale, 0.04 * scale, 0.08 * scale]} />;
      case "butter":
        return <boxGeometry args={[0.08 * scale, 0.025 * scale, 0.04 * scale]} />;
      case "bread":
        return <boxGeometry args={[0.18 * scale, 0.1 * scale, 0.12 * scale]} />;
      case "rice":
        return <sphereGeometry args={[0.005 * scale, 6, 6]} />;
      case "oil":
        return <cylinderGeometry args={[0.025 * scale, 0.03 * scale, 0.14 * scale, 16]} />;
      case "water":
        return <cylinderGeometry args={[0.035 * scale, 0.04 * scale, 0.16 * scale, 16]} />;
      default:
        return <sphereGeometry args={[0.05 * scale, 16, 16]} />;
    }
  }, [type, scale]);

  return (
    <mesh ref={meshRef} position={position} rotation={rotation} castShadow receiveShadow>
      {geometry}
      <meshStandardMaterial 
        color={color} 
        roughness={roughness}
        metalness={type === "oil" ? 0.3 : 0.1}
        transparent={type === "water" || type === "oil"}
        opacity={type === "water" ? 0.7 : type === "oil" ? 0.9 : 1}
      />
    </mesh>
  );
}

interface ChoppedIngredientProps {
  type: IngredientType;
  position: [number, number, number];
  scale: number;
  color: string;
  roughness: number;
}

function ChoppedIngredient({ type, position, scale, color, roughness }: ChoppedIngredientProps) {
  const pieces = useMemo(() => {
    const result: { 
      pos: [number, number, number]; 
      rot: [number, number, number];
      size: [number, number, number];
    }[] = [];
    const count = 5 + Math.floor(Math.random() * 4);
    
    for (let i = 0; i < count; i++) {
      const sizeVariation = 0.7 + Math.random() * 0.6;
      result.push({
        pos: [
          (Math.random() - 0.5) * 0.12,
          0.01,
          (Math.random() - 0.5) * 0.12
        ],
        rot: [
          Math.random() * Math.PI * 0.3,
          Math.random() * Math.PI * 2,
          Math.random() * Math.PI * 0.3
        ],
        size: [
          0.025 * scale * sizeVariation,
          0.015 * scale * sizeVariation,
          0.025 * scale * sizeVariation
        ]
      });
    }
    return result;
  }, [scale]);

  return (
    <group position={position}>
      {pieces.map((piece, i) => (
        <mesh 
          key={i} 
          position={piece.pos} 
          rotation={piece.rot}
          castShadow
          receiveShadow
        >
          <boxGeometry args={piece.size} />
          <meshStandardMaterial color={color} roughness={roughness} />
        </mesh>
      ))}
    </group>
  );
}

export function RiceParticles({ 
  position, 
  count = 50, 
  spread = 0.1,
  cookingState = "raw" 
}: { 
  position: [number, number, number]; 
  count?: number; 
  spread?: number;
  cookingState?: CookingState;
}) {
  const particles = useMemo(() => {
    const result: [number, number, number][] = [];
    for (let i = 0; i < count; i++) {
      result.push([
        (Math.random() - 0.5) * spread,
        Math.random() * 0.02,
        (Math.random() - 0.5) * spread
      ]);
    }
    return result;
  }, [count, spread]);

  const color = INGREDIENT_COLORS.rice[cookingState];

  return (
    <group position={position}>
      {particles.map((pos, i) => (
        <mesh key={i} position={pos} castShadow>
          <sphereGeometry args={[0.003, 4, 4]} />
          <meshStandardMaterial color={color} roughness={0.6} />
        </mesh>
      ))}
    </group>
  );
}

export function TomatoDetailed({ 
  position, 
  scale = 1, 
  cookingState = "raw" 
}: { 
  position: [number, number, number]; 
  scale?: number; 
  cookingState?: CookingState;
}) {
  const color = INGREDIENT_COLORS.tomato[cookingState];
  
  return (
    <group position={position}>
      <mesh castShadow receiveShadow>
        <sphereGeometry args={[0.06 * scale, 24, 24]} />
        <meshStandardMaterial color={color} roughness={0.4} />
      </mesh>
      <mesh position={[0, 0.055 * scale, 0]}>
        <cylinderGeometry args={[0.008 * scale, 0.004 * scale, 0.02 * scale, 8]} />
        <meshStandardMaterial color="#2e7d32" roughness={0.7} />
      </mesh>
      {[0, 1, 2, 3].map((i) => (
        <mesh 
          key={i}
          position={[
            Math.cos(i * Math.PI / 2) * 0.02 * scale, 
            0.06 * scale, 
            Math.sin(i * Math.PI / 2) * 0.02 * scale
          ]}
          rotation={[0.3, i * Math.PI / 2, 0]}
        >
          <boxGeometry args={[0.015 * scale, 0.002 * scale, 0.008 * scale]} />
          <meshStandardMaterial color="#4caf50" roughness={0.7} />
        </mesh>
      ))}
    </group>
  );
}
