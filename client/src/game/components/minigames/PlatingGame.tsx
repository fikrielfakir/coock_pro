import { useRef, useState, useEffect, useCallback, useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useCookingGame } from "@/lib/stores/useCookingGame";
import { Text } from "@react-three/drei";

interface PlatingGameProps {
  onComplete: (score: number) => void;
  timeLimit?: number;
}

type PlateType = "round" | "square" | "rectangular" | "bowl" | "slate";
type GarnishType = "basil" | "parsley" | "lemon" | "microgreens" | "flower";

interface PlacedItem {
  id: number;
  type: "food" | "garnish" | "sauce";
  itemType: string;
  pos: [number, number, number];
  rotation: number;
  scale: number;
  color: string;
}

interface SaucePoint {
  id: number;
  pos: [number, number, number];
  scale: number;
  color: string;
}

interface DragState {
  isDragging: boolean;
  itemId: number | null;
  startPos: { x: number; y: number };
}

interface FoodItem {
  id: string;
  name: string;
  color: string;
  size: [number, number, number];
  shape: "box" | "sphere" | "cylinder";
}

interface GarnishItem {
  id: string;
  name: string;
  type: GarnishType;
  color: string;
}

export function PlatingGame({ onComplete, timeLimit = 90 }: PlatingGameProps) {
  const { gl, camera, raycaster, pointer } = useThree();
  const plateRef = useRef<THREE.Group>(null);
  
  const [plateType, setPlateType] = useState<PlateType>("round");
  const [placedItems, setPlacedItems] = useState<PlacedItem[]>([]);
  const [saucePoints, setSaucePoints] = useState<SaucePoint[]>([]);
  const [selectedItemIndex, setSelectedItemIndex] = useState<number | null>(null);
  const [isDrawingSauce, setIsDrawingSauce] = useState(false);
  const [sauceColor, setSauceColor] = useState("#8b4513");
  const [timeRemaining, setTimeRemaining] = useState(timeLimit);
  const [score, setScore] = useState(0);
  const [dragState, setDragState] = useState<DragState>({ isDragging: false, itemId: null, startPos: { x: 0, y: 0 }});
  const [rotationMode, setRotationMode] = useState(false);
  const [showTutorial, setShowTutorial] = useState(true);
  const [activePanel, setActivePanel] = useState<"food" | "garnish" | "sauce">("food");
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  
  const availableFood: FoodItem[] = useMemo(() => [
    { id: "steak", name: "Steak", color: "#8b4513", size: [0.08, 0.025, 0.06], shape: "box" },
    { id: "chicken", name: "Chicken", color: "#daa520", size: [0.07, 0.03, 0.05], shape: "box" },
    { id: "fish", name: "Fish", color: "#ffa07a", size: [0.09, 0.02, 0.04], shape: "box" },
    { id: "vegetable", name: "Vegetables", color: "#228b22", size: [0.03, 0.03, 0.03], shape: "sphere" },
    { id: "potato", name: "Potato", color: "#f4a460", size: [0.04, 0.03, 0.04], shape: "sphere" },
    { id: "rice", name: "Rice", color: "#fffaf0", size: [0.05, 0.025, 0.05], shape: "cylinder" },
  ], []);

  const availableGarnishes: GarnishItem[] = useMemo(() => [
    { id: "basil", name: "Basil", type: "basil", color: "#228b22" },
    { id: "parsley", name: "Parsley", type: "parsley", color: "#32cd32" },
    { id: "lemon", name: "Lemon", type: "lemon", color: "#fff44f" },
    { id: "microgreens", name: "Microgreens", type: "microgreens", color: "#90ee90" },
    { id: "flower", name: "Edible Flower", type: "flower", color: "#ff69b4" },
  ], []);

  const sauceColors = useMemo(() => [
    { id: "brown", name: "Brown Sauce", color: "#8b4513" },
    { id: "red", name: "Red Sauce", color: "#dc143c" },
    { id: "green", name: "Pesto", color: "#556b2f" },
    { id: "white", name: "Cream", color: "#fffaf0" },
    { id: "balsamic", name: "Balsamic", color: "#3d0c02" },
  ], []);

  const plateGeometry = useMemo(() => {
    switch (plateType) {
      case "square": return { shape: "box", args: [0.28, 0.015, 0.28] };
      case "rectangular": return { shape: "box", args: [0.35, 0.015, 0.22] };
      case "bowl": return { shape: "cylinder", args: [0.14, 0.1, 0.06] };
      case "slate": return { shape: "box", args: [0.3, 0.01, 0.2] };
      default: return { shape: "cylinder", args: [0.14, 0.14, 0.012] };
    }
  }, [plateType]);

  const calculateScore = useCallback(() => {
    let totalScore = 0;
    
    const itemCount = placedItems.length;
    if (itemCount >= 3 && itemCount <= 7) totalScore += 15;
    else if (itemCount > 0) totalScore += 8;
    
    const hasProtein = placedItems.some(i => ["steak", "chicken", "fish"].includes(i.itemType));
    const hasSide = placedItems.some(i => ["vegetable", "potato", "rice"].includes(i.itemType));
    const hasGarnish = placedItems.some(i => i.type === "garnish");
    const hasSauce = saucePoints.length > 3;
    
    if (hasProtein) totalScore += 15;
    if (hasSide) totalScore += 10;
    if (hasGarnish) totalScore += 10;
    if (hasSauce) totalScore += 10;
    
    const centerX = placedItems.reduce((sum, i) => sum + i.pos[0], 0) / Math.max(1, itemCount);
    const centerZ = placedItems.reduce((sum, i) => sum + i.pos[2], 0) / Math.max(1, itemCount);
    const balanceScore = Math.max(0, 15 - Math.sqrt(centerX * centerX + centerZ * centerZ) * 100);
    totalScore += Math.round(balanceScore);
    
    const uniqueColors = new Set(placedItems.map(i => i.color)).size;
    totalScore += Math.min(15, uniqueColors * 3);
    
    const hasHeight = placedItems.some((item, i) => 
      placedItems.some((other, j) => i !== j && 
        Math.abs(item.pos[0] - other.pos[0]) < 0.03 && 
        Math.abs(item.pos[2] - other.pos[2]) < 0.03
      )
    );
    if (hasHeight) totalScore += 10;
    
    return Math.min(100, totalScore);
  }, [placedItems, saucePoints]);

  const addFoodItem = useCallback((food: FoodItem) => {
    const newItem: PlacedItem = {
      id: Date.now() + Math.random(),
      type: "food",
      itemType: food.id,
      pos: [(Math.random() - 0.5) * 0.1, 0.02, (Math.random() - 0.5) * 0.1],
      rotation: 0,
      scale: 1,
      color: food.color
    };
    setPlacedItems(prev => [...prev, newItem]);
  }, []);

  const addGarnish = useCallback((garnish: GarnishItem) => {
    const newItem: PlacedItem = {
      id: Date.now() + Math.random(),
      type: "garnish",
      itemType: garnish.id,
      pos: [(Math.random() - 0.5) * 0.08, 0.025, (Math.random() - 0.5) * 0.08],
      rotation: Math.random() * Math.PI * 2,
      scale: 0.7 + Math.random() * 0.3,
      color: garnish.color
    };
    setPlacedItems(prev => [...prev, newItem]);
  }, []);

  const handleMouseDown = useCallback((e: MouseEvent) => {
    if (activePanel === "sauce") {
      setIsDrawingSauce(true);
    } else {
      const rect = gl.domElement.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      setMousePos({ x, y });
      
      if (selectedItemIndex !== null) {
        setDragState({ isDragging: true, itemId: selectedItemIndex, startPos: { x, y } });
      }
    }
  }, [activePanel, gl.domElement, selectedItemIndex]);

  const handleMouseUp = useCallback(() => {
    setIsDrawingSauce(false);
    setDragState({ isDragging: false, itemId: null, startPos: { x: 0, y: 0 } });
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    const rect = gl.domElement.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    setMousePos({ x, y });
    
    if (isDrawingSauce && Math.random() > 0.5) {
      const plateX = x * 0.12;
      const plateZ = -y * 0.12;
      
      if (Math.sqrt(plateX * plateX + plateZ * plateZ) < 0.13) {
        const newPoint: SaucePoint = {
          id: Date.now() + Math.random(),
          pos: [plateX, 0.015, plateZ],
          scale: 0.008 + Math.random() * 0.004,
          color: sauceColor
        };
        setSaucePoints(prev => [...prev.slice(-50), newPoint]);
      }
    }
    
    if (dragState.isDragging && dragState.itemId !== null) {
      const plateX = x * 0.15;
      const plateZ = -y * 0.15;
      
      setPlacedItems(prev => prev.map((item, i) => 
        i === dragState.itemId
          ? { ...item, pos: [plateX, item.pos[1], plateZ] as [number, number, number] }
          : item
      ));
    }
  }, [isDrawingSauce, sauceColor, dragState, gl.domElement]);

  useEffect(() => {
    gl.domElement.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("mousemove", handleMouseMove);
    
    return () => {
      gl.domElement.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [handleMouseDown, handleMouseUp, handleMouseMove, gl.domElement]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "KeyR" && selectedItemIndex !== null) {
        setPlacedItems(prev => prev.map((item, i) => 
          i === selectedItemIndex
            ? { ...item, rotation: item.rotation + Math.PI / 8 }
            : item
        ));
      }
      if (e.code === "Delete" || e.code === "Backspace") {
        if (selectedItemIndex !== null) {
          setPlacedItems(prev => prev.filter((_, i) => i !== selectedItemIndex));
          setSelectedItemIndex(null);
        }
      }
      if (e.code === "Space") {
        const finalScore = calculateScore();
        setScore(finalScore);
        onComplete(finalScore);
      }
      if (e.code === "Digit1") setActivePanel("food");
      if (e.code === "Digit2") setActivePanel("garnish");
      if (e.code === "Digit3") setActivePanel("sauce");
    };
    
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedItemIndex, calculateScore, onComplete]);

  useEffect(() => {
    if (timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => Math.max(0, prev - 1));
        setScore(calculateScore());
      }, 1000);
      return () => clearInterval(timer);
    } else {
      onComplete(calculateScore());
    }
  }, [timeRemaining, calculateScore, onComplete]);

  useEffect(() => {
    const tutorialTimer = setTimeout(() => setShowTutorial(false), 4000);
    return () => clearTimeout(tutorialTimer);
  }, []);

  useFrame((state, delta) => {
  });

  const renderFoodShape = (item: PlacedItem, food: FoodItem | undefined) => {
    if (!food) return null;
    
    switch (food.shape) {
      case "sphere":
        return <sphereGeometry args={[food.size[0], 16, 16]} />;
      case "cylinder":
        return <cylinderGeometry args={[food.size[0], food.size[0], food.size[1], 16]} />;
      default:
        return <boxGeometry args={food.size} />;
    }
  };

  return (
    <group position={[0, 1.0, 0]}>
      <group ref={plateRef}>
        {plateType === "round" && (
          <mesh receiveShadow>
            <cylinderGeometry args={[0.14, 0.14, 0.012, 32]} />
            <meshStandardMaterial color="#f5f5f5" roughness={0.3} />
          </mesh>
        )}
        {plateType === "square" && (
          <mesh receiveShadow>
            <boxGeometry args={[0.28, 0.015, 0.28]} />
            <meshStandardMaterial color="#f5f5f5" roughness={0.3} />
          </mesh>
        )}
        {plateType === "rectangular" && (
          <mesh receiveShadow>
            <boxGeometry args={[0.35, 0.015, 0.22]} />
            <meshStandardMaterial color="#f5f5f5" roughness={0.3} />
          </mesh>
        )}
        {plateType === "bowl" && (
          <mesh receiveShadow>
            <cylinderGeometry args={[0.14, 0.1, 0.06, 32]} />
            <meshStandardMaterial color="#f5f5f5" roughness={0.3} />
          </mesh>
        )}
        {plateType === "slate" && (
          <mesh receiveShadow>
            <boxGeometry args={[0.3, 0.01, 0.2]} />
            <meshStandardMaterial color="#2f4f4f" roughness={0.8} />
          </mesh>
        )}
        
        <mesh position={[0, -0.008, 0]}>
          <cylinderGeometry args={[0.12, 0.13, 0.004, 32]} />
          <meshStandardMaterial color="#e8e8e8" roughness={0.4} />
        </mesh>
      </group>
      
      {saucePoints.map(point => (
        <mesh key={point.id} position={point.pos}>
          <sphereGeometry args={[point.scale, 8, 8]} />
          <meshStandardMaterial color={point.color} roughness={0.6} />
        </mesh>
      ))}
      
      {placedItems.map((item, index) => {
        const food = availableFood.find(f => f.id === item.itemType);
        const isSelected = selectedItemIndex === index;
        
        return (
          <group 
            key={item.id} 
            position={item.pos} 
            rotation={[0, item.rotation, 0]}
            scale={item.scale}
            onClick={() => setSelectedItemIndex(index)}
          >
            {item.type === "food" && food && (
              <mesh castShadow>
                {renderFoodShape(item, food)}
                <meshStandardMaterial 
                  color={item.color} 
                  roughness={0.6}
                  emissive={isSelected ? new THREE.Color("#ffffff") : new THREE.Color("#000000")}
                  emissiveIntensity={isSelected ? 0.2 : 0}
                />
              </mesh>
            )}
            {item.type === "garnish" && (
              <mesh castShadow>
                <sphereGeometry args={[0.012, 8, 8]} />
                <meshStandardMaterial 
                  color={item.color} 
                  roughness={0.5}
                  emissive={isSelected ? new THREE.Color("#ffffff") : new THREE.Color("#000000")}
                  emissiveIntensity={isSelected ? 0.2 : 0}
                />
              </mesh>
            )}
            {isSelected && (
              <mesh position={[0, 0.05, 0]}>
                <ringGeometry args={[0.02, 0.025, 16]} />
                <meshBasicMaterial color="#00ff88" />
              </mesh>
            )}
          </group>
        );
      })}
      
      <group position={[-0.35, 0.1, 0]}>
        <mesh>
          <planeGeometry args={[0.18, 0.25]} />
          <meshBasicMaterial color="#222222" transparent opacity={0.9} />
        </mesh>
        
        <Text
          position={[0, 0.1, 0.01]}
          fontSize={0.016}
          color="#ffffff"
          anchorX="center"
        >
          {activePanel === "food" ? "Food Items" : activePanel === "garnish" ? "Garnishes" : "Sauces"}
        </Text>
        
        {activePanel === "food" && availableFood.slice(0, 4).map((food, i) => (
          <group 
            key={food.id} 
            position={[0, 0.05 - i * 0.045, 0.01]}
            onClick={() => addFoodItem(food)}
          >
            <mesh>
              <planeGeometry args={[0.15, 0.035]} />
              <meshBasicMaterial color="#444444" />
            </mesh>
            <Text
              position={[0, 0, 0.01]}
              fontSize={0.012}
              color="#ffffff"
              anchorX="center"
            >
              {food.name}
            </Text>
          </group>
        ))}
        
        {activePanel === "garnish" && availableGarnishes.slice(0, 4).map((garnish, i) => (
          <group 
            key={garnish.id} 
            position={[0, 0.05 - i * 0.045, 0.01]}
            onClick={() => addGarnish(garnish)}
          >
            <mesh>
              <planeGeometry args={[0.15, 0.035]} />
              <meshBasicMaterial color="#444444" />
            </mesh>
            <Text
              position={[0, 0, 0.01]}
              fontSize={0.012}
              color="#ffffff"
              anchorX="center"
            >
              {garnish.name}
            </Text>
          </group>
        ))}
        
        {activePanel === "sauce" && sauceColors.slice(0, 4).map((sauce, i) => (
          <group 
            key={sauce.id} 
            position={[0, 0.05 - i * 0.045, 0.01]}
            onClick={() => setSauceColor(sauce.color)}
          >
            <mesh>
              <planeGeometry args={[0.15, 0.035]} />
              <meshBasicMaterial color={sauceColor === sauce.color ? "#666666" : "#444444"} />
            </mesh>
            <Text
              position={[0, 0, 0.01]}
              fontSize={0.012}
              color="#ffffff"
              anchorX="center"
            >
              {sauce.name}
            </Text>
          </group>
        ))}
        
        <group position={[0, -0.1, 0.01]}>
          {["food", "garnish", "sauce"].map((panel, i) => (
            <mesh 
              key={panel} 
              position={[-0.05 + i * 0.05, 0, 0]}
              onClick={() => setActivePanel(panel as "food" | "garnish" | "sauce")}
            >
              <planeGeometry args={[0.04, 0.025]} />
              <meshBasicMaterial color={activePanel === panel ? "#00ff88" : "#555555"} />
            </mesh>
          ))}
        </group>
      </group>
      
      <group position={[0, 0.25, 0.15]}>
        <mesh>
          <planeGeometry args={[0.18, 0.06]} />
          <meshBasicMaterial color="#222222" transparent opacity={0.85} />
        </mesh>
        <Text
          position={[0, 0.01, 0.01]}
          fontSize={0.018}
          color="#ffdd00"
          anchorX="center"
        >
          {`Score: ${score}`}
        </Text>
        <Text
          position={[0, -0.015, 0.01]}
          fontSize={0.012}
          color={timeRemaining < 15 ? "#ff4444" : "#aaaaaa"}
          anchorX="center"
        >
          {`Time: ${timeRemaining}s`}
        </Text>
      </group>
      
      {showTutorial && (
        <group position={[0, 0.4, 0]}>
          <mesh>
            <planeGeometry args={[0.55, 0.14]} />
            <meshBasicMaterial color="#000000" transparent opacity={0.8} />
          </mesh>
          <Text
            position={[0, 0.035, 0.01]}
            fontSize={0.018}
            color="#ffffff"
            anchorX="center"
          >
            Click items to add, drag to position
          </Text>
          <Text
            position={[0, 0, 0.01]}
            fontSize={0.014}
            color="#aaaaaa"
            anchorX="center"
          >
            Press R to rotate, DEL to remove
          </Text>
          <Text
            position={[0, -0.035, 0.01]}
            fontSize={0.014}
            color="#aaaaaa"
            anchorX="center"
          >
            Press SPACE when done
          </Text>
        </group>
      )}
      
      <group position={[0.35, 0.1, 0]}>
        <mesh>
          <planeGeometry args={[0.12, 0.15]} />
          <meshBasicMaterial color="#222222" transparent opacity={0.85} />
        </mesh>
        <Text
          position={[0, 0.055, 0.01]}
          fontSize={0.012}
          color="#ffffff"
          anchorX="center"
        >
          Plate Style
        </Text>
        {(["round", "square", "slate"] as PlateType[]).map((type, i) => (
          <mesh 
            key={type} 
            position={[0, 0.02 - i * 0.035, 0.01]}
            onClick={() => setPlateType(type)}
          >
            <planeGeometry args={[0.1, 0.028]} />
            <meshBasicMaterial color={plateType === type ? "#00ff88" : "#444444"} />
          </mesh>
        ))}
      </group>
    </group>
  );
}
