import { useRef, useState, useEffect, useCallback, useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useCookingGame } from "@/lib/stores/useCookingGame";
import { Text } from "@react-three/drei";

interface MeasuringGameProps {
  onComplete: (score: number) => void;
  targetMeasurements?: number;
  timeLimit?: number;
}

type IngredientType = "water" | "milk" | "oil" | "flour" | "sugar" | "honey";
type MeasuringCupSize = "quarter" | "third" | "half" | "full";

interface LiquidParticle {
  id: number;
  pos: [number, number, number];
  vel: [number, number, number];
  life: number;
  color: string;
}

interface SpillDrop {
  id: number;
  pos: [number, number, number];
  opacity: number;
  scale: number;
  color: string;
}

interface Measurement {
  targetAmount: number;
  currentAmount: number;
  ingredientType: IngredientType;
  cupSize: MeasuringCupSize;
  completed: boolean;
  accuracy: number;
}

export function MeasuringGame({ onComplete, targetMeasurements = 4, timeLimit = 75 }: MeasuringGameProps) {
  const { gl } = useThree();
  const containerRef = useRef<THREE.Group>(null);
  const cupRef = useRef<THREE.Group>(null);
  
  const [tiltAngle, setTiltAngle] = useState(0);
  const [isPouring, setIsPouring] = useState(false);
  const [currentAmount, setCurrentAmount] = useState(0);
  const [targetAmount, setTargetAmount] = useState(0.5);
  const [liquidParticles, setLiquidParticles] = useState<LiquidParticle[]>([]);
  const [spillDrops, setSpillDrops] = useState<SpillDrop[]>([]);
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [currentMeasurement, setCurrentMeasurement] = useState(0);
  const [combo, setCombo] = useState(0);
  const [totalScore, setTotalScore] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(timeLimit);
  const [showSlowMotion, setShowSlowMotion] = useState(false);
  const [feedbackText, setFeedbackText] = useState("");
  const [feedbackOpacity, setFeedbackOpacity] = useState(0);
  const [ingredientType, setIngredientType] = useState<IngredientType>("water");
  const [isDragging, setIsDragging] = useState(false);
  const [showTutorial, setShowTutorial] = useState(true);
  
  const ingredientProperties = useMemo(() => ({
    water: { color: "#88ccff", flowSpeed: 1.0, viscosity: 0.1, name: "Water" },
    milk: { color: "#f8f8f0", flowSpeed: 0.9, viscosity: 0.15, name: "Milk" },
    oil: { color: "#f4d03f", flowSpeed: 0.7, viscosity: 0.3, name: "Oil" },
    flour: { color: "#f5f5dc", flowSpeed: 0.5, viscosity: 0.8, name: "Flour" },
    sugar: { color: "#ffffff", flowSpeed: 0.6, viscosity: 0.6, name: "Sugar" },
    honey: { color: "#daa520", flowSpeed: 0.3, viscosity: 0.9, name: "Honey" }
  }), []);

  const cupSizes = useMemo(() => ({
    quarter: { capacity: 0.25, label: "1/4 cup", height: 0.06 },
    third: { capacity: 0.33, label: "1/3 cup", height: 0.07 },
    half: { capacity: 0.5, label: "1/2 cup", height: 0.08 },
    full: { capacity: 1.0, label: "1 cup", height: 0.1 }
  }), []);

  useEffect(() => {
    const initialMeasurements: Measurement[] = Array.from({ length: targetMeasurements }, (_, i) => {
      const ingredients: IngredientType[] = ["water", "milk", "oil", "flour", "sugar", "honey"];
      const cups: MeasuringCupSize[] = ["quarter", "third", "half", "full"];
      return {
        targetAmount: [0.25, 0.33, 0.5, 0.75, 1.0][Math.floor(Math.random() * 5)],
        currentAmount: 0,
        ingredientType: ingredients[i % ingredients.length],
        cupSize: cups[Math.floor(Math.random() * cups.length)],
        completed: false,
        accuracy: 0
      };
    });
    setMeasurements(initialMeasurements);
    if (initialMeasurements.length > 0) {
      setTargetAmount(initialMeasurements[0].targetAmount);
      setIngredientType(initialMeasurements[0].ingredientType);
    }
  }, [targetMeasurements]);

  const handleMouseDown = useCallback(() => setIsDragging(true), []);
  const handleMouseUp = useCallback(() => setIsDragging(false), []);
  
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;
    const movementY = e.movementY;
    setTiltAngle(prev => Math.max(0, Math.min(Math.PI / 2, prev + movementY * 0.008)));
  }, [isDragging]);

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
      if (e.code === "ArrowUp" || e.code === "KeyW") {
        setTiltAngle(prev => Math.min(Math.PI / 2, prev + 0.05));
      } else if (e.code === "ArrowDown" || e.code === "KeyS") {
        setTiltAngle(prev => Math.max(0, prev - 0.05));
      } else if (e.code === "Space") {
        confirmMeasurement();
      }
    };
    
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const confirmMeasurement = useCallback(() => {
    if (currentMeasurement >= measurements.length) return;
    
    const target = targetAmount;
    const current = currentAmount;
    const accuracy = Math.max(0, 100 - Math.abs(target - current) * 200);
    
    let score = 0;
    let feedback = "";
    
    if (accuracy >= 95) {
      score = 25 * (1 + combo * 0.1);
      feedback = "Perfect!";
      setCombo(prev => prev + 1);
    } else if (accuracy >= 80) {
      score = 18;
      feedback = "Great!";
      setCombo(prev => Math.max(0, prev - 1));
    } else if (accuracy >= 60) {
      score = 12;
      feedback = "Good";
      setCombo(0);
    } else {
      score = 5;
      feedback = current > target ? "Too Much!" : "Not Enough!";
      setCombo(0);
    }
    
    setTotalScore(prev => prev + Math.round(score));
    setFeedbackText(feedback);
    setFeedbackOpacity(1);
    
    const updatedMeasurements = [...measurements];
    updatedMeasurements[currentMeasurement] = {
      ...updatedMeasurements[currentMeasurement],
      currentAmount: current,
      completed: true,
      accuracy
    };
    setMeasurements(updatedMeasurements);
    
    const nextIndex = currentMeasurement + 1;
    if (nextIndex < measurements.length) {
      setTimeout(() => {
        setCurrentMeasurement(nextIndex);
        setCurrentAmount(0);
        setTiltAngle(0);
        setTargetAmount(measurements[nextIndex].targetAmount);
        setIngredientType(measurements[nextIndex].ingredientType);
      }, 500);
    }
  }, [currentMeasurement, measurements, targetAmount, currentAmount, combo]);

  useEffect(() => {
    const allCompleted = measurements.length > 0 && measurements.every(m => m.completed);
    if (allCompleted || timeRemaining <= 0) {
      const avgAccuracy = measurements.reduce((sum, m) => sum + m.accuracy, 0) / measurements.length;
      const completionBonus = allCompleted ? 20 : 0;
      const finalScore = Math.min(100, Math.round(avgAccuracy * 0.6 + completionBonus + combo * 2));
      setTimeout(() => onComplete(finalScore), 600);
    }
  }, [measurements, timeRemaining, onComplete, combo]);

  useEffect(() => {
    if (timeRemaining > 0 && currentMeasurement < measurements.length) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => Math.max(0, prev - 1));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [timeRemaining, currentMeasurement, measurements.length]);

  useEffect(() => {
    const tutorialTimer = setTimeout(() => setShowTutorial(false), 4000);
    return () => clearTimeout(tutorialTimer);
  }, []);

  useFrame((state, delta) => {
    const props = ingredientProperties[ingredientType];
    const pourThreshold = 0.3;
    const isPouringNow = tiltAngle > pourThreshold;
    setIsPouring(isPouringNow);
    
    const closeToTarget = Math.abs(currentAmount - targetAmount) < 0.1;
    setShowSlowMotion(closeToTarget && isPouringNow);
    
    if (isPouringNow && currentAmount < 1.2) {
      const pourRate = (tiltAngle - pourThreshold) * props.flowSpeed * (showSlowMotion ? 0.3 : 1);
      const amountAdded = pourRate * delta * 0.5;
      setCurrentAmount(prev => Math.min(1.2, prev + amountAdded));
      
      if (Math.random() > 0.6) {
        const newParticle: LiquidParticle = {
          id: Date.now() + Math.random(),
          pos: [0.15, 0.2 - tiltAngle * 0.1, 0],
          vel: [
            -0.02 - Math.random() * 0.01,
            -0.01,
            (Math.random() - 0.5) * 0.01
          ],
          life: 1.0,
          color: props.color
        };
        setLiquidParticles(prev => [...prev.slice(-20), newParticle]);
      }
      
      if (currentAmount > targetAmount * 1.1 && Math.random() > 0.9) {
        const newSpill: SpillDrop = {
          id: Date.now() + Math.random(),
          pos: [
            -0.1 + (Math.random() - 0.5) * 0.05,
            0,
            (Math.random() - 0.5) * 0.1
          ],
          opacity: 0.8,
          scale: 0.01 + Math.random() * 0.01,
          color: props.color
        };
        setSpillDrops(prev => [...prev.slice(-10), newSpill]);
      }
    }
    
    if (containerRef.current) {
      containerRef.current.rotation.z = -tiltAngle;
    }
    
    setLiquidParticles(prev =>
      prev
        .map(p => ({
          ...p,
          pos: [
            p.pos[0] + p.vel[0],
            p.pos[1] + p.vel[1] - 0.004,
            p.pos[2] + p.vel[2]
          ] as [number, number, number],
          life: p.life - delta * 2
        }))
        .filter(p => p.life > 0 && p.pos[1] > -0.1)
    );
    
    setSpillDrops(prev =>
      prev
        .map(s => ({ ...s, opacity: s.opacity - delta * 0.2 }))
        .filter(s => s.opacity > 0)
    );
    
    if (feedbackOpacity > 0) {
      setFeedbackOpacity(prev => Math.max(0, prev - delta * 1.5));
    }
  });

  const props = ingredientProperties[ingredientType];
  const fillPercent = Math.min(1, currentAmount / targetAmount);
  const isOverfilled = currentAmount > targetAmount;
  const accuracyColor = isOverfilled ? "#ff4444" : 
                        fillPercent > 0.9 ? "#00ff88" : 
                        fillPercent > 0.7 ? "#ffdd00" : "#ffffff";

  return (
    <group position={[0, 1.1, 0]}>
      <group ref={containerRef} position={[0.2, 0.15, 0]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.06, 0.05, 0.18, 16]} />
          <meshStandardMaterial color="#ddd" transparent opacity={0.4} />
        </mesh>
        <mesh position={[0, 0.02, 0]}>
          <cylinderGeometry args={[0.055, 0.045, 0.12, 16]} />
          <meshStandardMaterial color={props.color} transparent opacity={0.9} />
        </mesh>
        <Text
          position={[0.07, 0, 0]}
          rotation={[0, 0, Math.PI / 2]}
          fontSize={0.015}
          color="#666666"
        >
          {props.name}
        </Text>
      </group>
      
      <group ref={cupRef} position={[-0.1, 0, 0]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.07, 0.055, 0.1, 24]} />
          <meshStandardMaterial color="#ffffff" transparent opacity={0.3} />
        </mesh>
        
        <mesh position={[0.08, 0.02, 0]} rotation={[0, 0, Math.PI / 4]}>
          <cylinderGeometry args={[0.008, 0.008, 0.06, 8]} />
          <meshStandardMaterial color="#dddddd" transparent opacity={0.5} />
        </mesh>
        
        {currentAmount > 0 && (
          <mesh position={[0, -0.05 + (currentAmount * 0.08), 0]}>
            <cylinderGeometry args={[0.065, 0.05, Math.min(0.09, currentAmount * 0.09), 24]} />
            <meshStandardMaterial color={props.color} transparent opacity={0.85} />
          </mesh>
        )}
        
        <mesh position={[0, -0.05 + (targetAmount * 0.08), 0]} rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.055, 0.065, 24]} />
          <meshBasicMaterial color="#00ff88" transparent opacity={0.5} />
        </mesh>
        
        {[0.25, 0.5, 0.75, 1.0].map((mark, i) => (
          <group key={i} position={[-0.068, -0.05 + mark * 0.08, 0]}>
            <mesh>
              <boxGeometry args={[0.015, 0.002, 0.002]} />
              <meshBasicMaterial color="#888888" />
            </mesh>
          </group>
        ))}
      </group>
      
      {liquidParticles.map(p => (
        <mesh key={p.id} position={p.pos}>
          <sphereGeometry args={[0.008, 6, 6]} />
          <meshBasicMaterial color={p.color} transparent opacity={p.life} />
        </mesh>
      ))}
      
      {spillDrops.map(s => (
        <mesh key={s.id} position={s.pos} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[s.scale, 8]} />
          <meshBasicMaterial color={s.color} transparent opacity={s.opacity} />
        </mesh>
      ))}
      
      <group position={[0, 0.25, 0.15]}>
        <mesh>
          <planeGeometry args={[0.25, 0.08]} />
          <meshBasicMaterial color="#222222" transparent opacity={0.85} />
        </mesh>
        <mesh 
          position={[0, 0, 0.001]} 
          scale={[Math.min(1, fillPercent), 1, 1]}
        >
          <planeGeometry args={[0.24, 0.04]} />
          <meshBasicMaterial color={accuracyColor} />
        </mesh>
        <Text
          position={[0, 0, 0.002]}
          fontSize={0.018}
          color="#ffffff"
          anchorX="center"
        >
          {`${(currentAmount * 100).toFixed(0)}% / ${(targetAmount * 100).toFixed(0)}%`}
        </Text>
      </group>
      
      <group position={[-0.25, 0.15, 0]}>
        <mesh>
          <planeGeometry args={[0.1, 0.06]} />
          <meshBasicMaterial color="#222222" transparent opacity={0.8} />
        </mesh>
        <Text
          position={[0, 0.01, 0.01]}
          fontSize={0.016}
          color={timeRemaining < 15 ? "#ff4444" : "#ffffff"}
          anchorX="center"
        >
          {`${timeRemaining}s`}
        </Text>
        <Text
          position={[0, -0.012, 0.01]}
          fontSize={0.012}
          color="#aaaaaa"
          anchorX="center"
        >
          Time
        </Text>
      </group>
      
      <group position={[0.25, 0.15, 0]}>
        <mesh>
          <planeGeometry args={[0.12, 0.06]} />
          <meshBasicMaterial color="#222222" transparent opacity={0.8} />
        </mesh>
        <Text
          position={[0, 0.01, 0.01]}
          fontSize={0.016}
          color="#ffdd00"
          anchorX="center"
        >
          {`${totalScore}`}
        </Text>
        <Text
          position={[0, -0.012, 0.01]}
          fontSize={0.012}
          color="#aaaaaa"
          anchorX="center"
        >
          Score
        </Text>
      </group>
      
      <group position={[0, -0.12, 0.1]}>
        <mesh>
          <planeGeometry args={[0.35, 0.05]} />
          <meshBasicMaterial color="#333333" transparent opacity={0.8} />
        </mesh>
        {measurements.map((m, i) => (
          <mesh key={i} position={[-0.15 + i * 0.08, 0, 0.001]}>
            <circleGeometry args={[0.015, 16]} />
            <meshBasicMaterial 
              color={m.completed ? (m.accuracy >= 80 ? "#00ff88" : "#ffaa00") : 
                     i === currentMeasurement ? "#ffffff" : "#666666"} 
            />
          </mesh>
        ))}
      </group>
      
      {feedbackOpacity > 0 && (
        <Text
          position={[0, 0.4, 0]}
          fontSize={0.05}
          color={feedbackText.includes("Perfect") ? "#00ff88" : 
                 feedbackText.includes("Great") ? "#88ff00" : 
                 feedbackText.includes("Good") ? "#ffdd00" : "#ff6644"}
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.002}
          outlineColor="#000000"
          fillOpacity={feedbackOpacity}
        >
          {feedbackText}
        </Text>
      )}
      
      {combo > 1 && (
        <Text
          position={[0.2, 0.35, 0]}
          fontSize={0.025}
          color="#ffaa00"
          anchorX="center"
        >
          {`${combo}x Combo!`}
        </Text>
      )}
      
      {showSlowMotion && (
        <Text
          position={[0, 0.32, 0]}
          fontSize={0.02}
          color="#88ccff"
          anchorX="center"
        >
          Precision Mode
        </Text>
      )}
      
      {showTutorial && (
        <group position={[0, 0.5, 0]}>
          <mesh>
            <planeGeometry args={[0.5, 0.12]} />
            <meshBasicMaterial color="#000000" transparent opacity={0.75} />
          </mesh>
          <Text
            position={[0, 0.025, 0.01]}
            fontSize={0.02}
            color="#ffffff"
            anchorX="center"
          >
            Drag up/down or use W/S to tilt and pour
          </Text>
          <Text
            position={[0, -0.02, 0.01]}
            fontSize={0.015}
            color="#aaaaaa"
            anchorX="center"
          >
            Press SPACE when you reach the target amount
          </Text>
        </group>
      )}
    </group>
  );
}
