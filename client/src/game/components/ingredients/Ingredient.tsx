import { useMemo } from "react";
import * as THREE from "three";

export type IngredientType = 
  | "tomato" | "onion" | "carrot" | "chicken" | "beef" 
  | "egg" | "pepper" | "garlic" | "lettuce" | "cheese"
  | "bread" | "butter" | "salt" | "oil" | "pasta";

export type CookingState = "raw" | "cooking" | "cooked" | "burnt";

interface IngredientProps {
  type: IngredientType;
  position: [number, number, number];
  scale?: number;
  cookingState?: CookingState;
  isChopped?: boolean;
}

const INGREDIENT_COLORS: Record<IngredientType, Record<CookingState, string>> = {
  tomato: { raw: "#ff4444", cooking: "#cc3333", cooked: "#aa2222", burnt: "#333333" },
  onion: { raw: "#f5f5dc", cooking: "#e8d5a3", cooked: "#c4a35a", burnt: "#3d3d3d" },
  carrot: { raw: "#ff8c00", cooking: "#e67300", cooked: "#cc6600", burnt: "#4d4d4d" },
  chicken: { raw: "#ffb6c1", cooking: "#e6a8ad", cooked: "#c49a6c", burnt: "#4a4a4a" },
  beef: { raw: "#8b0000", cooking: "#6b3030", cooked: "#5a4030", burnt: "#2a2a2a" },
  egg: { raw: "#fffacd", cooking: "#fff8dc", cooked: "#ffe4b5", burnt: "#8b4513" },
  pepper: { raw: "#ff0000", cooking: "#cc0000", cooked: "#990000", burnt: "#330000" },
  garlic: { raw: "#fffaf0", cooking: "#f5e6d3", cooked: "#d4b896", burnt: "#5c4033" },
  lettuce: { raw: "#90ee90", cooking: "#7ccd7c", cooked: "#6aaa6a", burnt: "#3d5c3d" },
  cheese: { raw: "#ffd700", cooking: "#e6c200", cooked: "#ccaa00", burnt: "#665500" },
  bread: { raw: "#f5deb3", cooking: "#deb887", cooked: "#cd853f", burnt: "#4a3728" },
  butter: { raw: "#fffacd", cooking: "#fff8dc", cooked: "#ffd700", burnt: "#8b4513" },
  salt: { raw: "#ffffff", cooking: "#ffffff", cooked: "#ffffff", burnt: "#ffffff" },
  oil: { raw: "#ffd700", cooking: "#ffd700", cooked: "#ffd700", burnt: "#8b4513" },
  pasta: { raw: "#f5deb3", cooking: "#ffe4b5", cooked: "#ffdab9", burnt: "#8b4513" }
};

export function Ingredient({ 
  type, 
  position, 
  scale = 1, 
  cookingState = "raw",
  isChopped = false 
}: IngredientProps) {
  const color = INGREDIENT_COLORS[type][cookingState];
  
  const geometry = useMemo(() => {
    switch (type) {
      case "tomato":
        return <sphereGeometry args={[0.08 * scale, 16, 16]} />;
      case "onion":
        return <sphereGeometry args={[0.07 * scale, 16, 16]} />;
      case "carrot":
        return <cylinderGeometry args={[0.02 * scale, 0.04 * scale, 0.2 * scale, 12]} />;
      case "chicken":
        return <boxGeometry args={[0.15 * scale, 0.05 * scale, 0.1 * scale]} />;
      case "beef":
        return <boxGeometry args={[0.12 * scale, 0.04 * scale, 0.1 * scale]} />;
      case "egg":
        return <sphereGeometry args={[0.04 * scale, 16, 12]} />;
      case "pepper":
        return <capsuleGeometry args={[0.03 * scale, 0.1 * scale, 8, 16]} />;
      case "garlic":
        return <sphereGeometry args={[0.03 * scale, 8, 8]} />;
      case "lettuce":
        return <sphereGeometry args={[0.12 * scale, 8, 6]} />;
      case "cheese":
        return <boxGeometry args={[0.1 * scale, 0.03 * scale, 0.08 * scale]} />;
      case "bread":
        return <boxGeometry args={[0.15 * scale, 0.08 * scale, 0.1 * scale]} />;
      case "butter":
        return <boxGeometry args={[0.08 * scale, 0.03 * scale, 0.04 * scale]} />;
      case "salt":
        return <cylinderGeometry args={[0.02 * scale, 0.02 * scale, 0.08 * scale, 8]} />;
      case "oil":
        return <cylinderGeometry args={[0.03 * scale, 0.03 * scale, 0.12 * scale, 12]} />;
      case "pasta":
        return <cylinderGeometry args={[0.01 * scale, 0.01 * scale, 0.15 * scale, 8]} />;
      default:
        return <sphereGeometry args={[0.05 * scale, 16, 16]} />;
    }
  }, [type, scale]);

  if (isChopped) {
    return <ChoppedIngredient type={type} position={position} scale={scale} color={color} />;
  }

  return (
    <mesh position={position} castShadow>
      {geometry}
      <meshStandardMaterial color={color} roughness={0.6} />
    </mesh>
  );
}

interface ChoppedIngredientProps {
  type: IngredientType;
  position: [number, number, number];
  scale: number;
  color: string;
}

function ChoppedIngredient({ type, position, scale, color }: ChoppedIngredientProps) {
  const pieces = useMemo(() => {
    const result: { pos: [number, number, number]; rot: [number, number, number] }[] = [];
    const count = 4 + Math.floor(Math.random() * 4);
    for (let i = 0; i < count; i++) {
      result.push({
        pos: [
          (Math.random() - 0.5) * 0.1,
          0,
          (Math.random() - 0.5) * 0.1
        ],
        rot: [
          Math.random() * Math.PI,
          Math.random() * Math.PI,
          Math.random() * Math.PI
        ]
      });
    }
    return result;
  }, []);

  return (
    <group position={position}>
      {pieces.map((piece, i) => (
        <mesh 
          key={i} 
          position={piece.pos} 
          rotation={piece.rot}
          castShadow
        >
          <boxGeometry args={[0.03 * scale, 0.02 * scale, 0.03 * scale]} />
          <meshStandardMaterial color={color} roughness={0.6} />
        </mesh>
      ))}
    </group>
  );
}
