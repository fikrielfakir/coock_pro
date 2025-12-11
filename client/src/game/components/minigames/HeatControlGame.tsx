import { useRef, useState, useEffect, useCallback, useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useCookingGame } from "@/lib/stores/useCookingGame";
import { Text } from "@react-three/drei";

interface HeatControlGameProps {
  onComplete: (score: number) => void;
  targetTemp?: number;
  duration?: number;
  cookingType?: "sear" | "saute" | "simmer";
}

type HeatLevel = "off" | "low" | "medium" | "high";
type FoodState = "raw" | "cooking" | "cooked" | "burnt";

interface FlameParticle {
  id: number;
  pos: [number, number, number];
  vel: [number, number, number];
  life: number;
  scale: number;
  color: string;
}

interface SmokeParticle {
  id: number;
  pos: [number, number, number];
  opacity: number;
  scale: number;
  type: "steam" | "smoke" | "burnt";
}

interface FoodItem {
  id: number;
  pos: [number, number, number];
  temperature: number;
  state: FoodState;
  cookProgress: number;
  color: string;
  targetColor: string;
}

export function HeatControlGame({ 
  onComplete, 
  targetTemp = 75, 
  duration = 15,
  cookingType = "saute"
}: HeatControlGameProps) {
  const { gl } = useThree();
  const panRef = useRef<THREE.Mesh>(null);
  const knobRef = useRef<THREE.Group>(null);
  
  const [temperature, setTemperatureLocal] = useState(20);
  const [knobRotation, setKnobRotation] = useState(0);
  const [heatLevel, setHeatLevel] = useState<HeatLevel>("off");
  const [timeInZone, setTimeInZone] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartY, setDragStartY] = useState(0);
  const [flameParticles, setFlameParticles] = useState<FlameParticle[]>([]);
  const [smokeParticles, setSmokeParticles] = useState<SmokeParticle[]>([]);
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [showWarning, setShowWarning] = useState(false);
  const [warningFlash, setWarningFlash] = useState(false);
  const [perfectTimeBonus, setPerfectTimeBonus] = useState(0);
  const [burntPenalty, setBurntPenalty] = useState(0);
  const [showTutorial, setShowTutorial] = useState(true);
  const [oilShimmer, setOilShimmer] = useState(0);
  
  const setGameTemperature = useCookingGame(state => state.setTemperature);

  const targetZone = useMemo(() => ({
    min: targetTemp - 12,
    max: targetTemp + 12
  }), [targetTemp]);

  const dangerZone = useMemo(() => ({
    min: targetTemp + 20,
    max: 100
  }), [targetTemp]);

  useEffect(() => {
    const initialFood: FoodItem[] = [
      { id: 1, pos: [-0.06, 0.04, -0.04], temperature: 20, state: "raw", cookProgress: 0, color: "#c49a6c", targetColor: "#8b6914" },
      { id: 2, pos: [0.05, 0.04, 0.02], temperature: 20, state: "raw", cookProgress: 0, color: "#c49a6c", targetColor: "#8b6914" },
      { id: 3, pos: [-0.02, 0.04, 0.06], temperature: 20, state: "raw", cookProgress: 0, color: "#c49a6c", targetColor: "#8b6914" },
    ];
    setFoodItems(initialFood);
  }, []);

  const handleMouseDown = useCallback((e: MouseEvent) => {
    setIsDragging(true);
    setDragStartY(e.clientY);
  }, []);
  
  const handleMouseUp = useCallback(() => setIsDragging(false), []);
  
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;
    const movementY = e.clientY - dragStartY;
    setDragStartY(e.clientY);
    setKnobRotation(prev => {
      const newRot = Math.max(0, Math.min(Math.PI, prev - movementY * 0.015));
      return newRot;
    });
  }, [isDragging, dragStartY]);

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
        setKnobRotation(prev => Math.min(Math.PI, prev + 0.12));
      } else if (e.code === "ArrowDown" || e.code === "KeyS") {
        setKnobRotation(prev => Math.max(0, prev - 0.12));
      } else if (e.code === "Space") {
        setKnobRotation(0);
      }
    };
    
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (timeInZone >= duration) {
      const accuracy = Math.abs(temperature - targetTemp);
      const accuracyScore = Math.max(0, 50 - accuracy);
      const timeBonus = Math.min(25, perfectTimeBonus);
      const penalty = Math.min(30, burntPenalty);
      const finalScore = Math.max(0, Math.min(100, accuracyScore + timeBonus + 25 - penalty));
      onComplete(Math.round(finalScore));
    }
  }, [timeInZone, duration, temperature, targetTemp, onComplete, perfectTimeBonus, burntPenalty]);

  useEffect(() => {
    const tutorialTimer = setTimeout(() => setShowTutorial(false), 3500);
    return () => clearTimeout(tutorialTimer);
  }, []);

  useFrame((state, delta) => {
    const rotationPercent = knobRotation / Math.PI;
    const targetTemperature = 20 + rotationPercent * 80;
    const heatingRate = rotationPercent > 0.1 ? 2.5 : 0.8;
    const coolingRate = 1.2;
    
    const tempDiff = targetTemperature - temperature;
    const rate = tempDiff > 0 ? heatingRate : coolingRate;
    const newTemp = temperature + tempDiff * delta * rate;
    setTemperatureLocal(Math.max(20, Math.min(100, newTemp)));
    setGameTemperature(newTemp);
    
    if (rotationPercent < 0.05) setHeatLevel("off");
    else if (rotationPercent < 0.35) setHeatLevel("low");
    else if (rotationPercent < 0.7) setHeatLevel("medium");
    else setHeatLevel("high");
    
    if (knobRef.current) {
      knobRef.current.rotation.z = knobRotation;
    }
    
    const inZone = newTemp >= targetZone.min && newTemp <= targetZone.max;
    const inDanger = newTemp >= dangerZone.min;
    
    if (inZone) {
      setTimeInZone(prev => prev + delta);
      setPerfectTimeBonus(prev => Math.min(25, prev + delta * 2));
    }
    
    setShowWarning(inDanger);
    if (inDanger) {
      setWarningFlash(prev => !prev);
      setBurntPenalty(prev => prev + delta * 3);
    }
    
    if (heatLevel !== "off" && Math.random() > 0.7) {
      const flameCount = heatLevel === "high" ? 3 : heatLevel === "medium" ? 2 : 1;
      const newFlames: FlameParticle[] = Array.from({ length: flameCount }, (_, i) => {
        const baseColor = heatLevel === "low" ? "#4488ff" : 
                         heatLevel === "medium" ? "#ff8844" : "#ff4400";
        return {
          id: Date.now() + i + Math.random(),
          pos: [
            (Math.random() - 0.5) * 0.15,
            -0.03,
            (Math.random() - 0.5) * 0.15
          ] as [number, number, number],
          vel: [
            (Math.random() - 0.5) * 0.005,
            0.02 + Math.random() * 0.015,
            (Math.random() - 0.5) * 0.005
          ] as [number, number, number],
          life: 1.0,
          scale: 0.015 + Math.random() * 0.01,
          color: baseColor
        };
      });
      setFlameParticles(prev => [...prev.slice(-25), ...newFlames]);
    }
    
    if (newTemp > 50 && Math.random() > 0.92) {
      const isBurnt = newTemp > 90;
      const isSteam = newTemp < 70;
      const newSmoke: SmokeParticle = {
        id: Date.now() + Math.random(),
        pos: [
          (Math.random() - 0.5) * 0.12,
          0.08,
          (Math.random() - 0.5) * 0.12
        ],
        opacity: 0.5,
        scale: 0.015 + Math.random() * 0.01,
        type: isBurnt ? "burnt" : isSteam ? "steam" : "smoke"
      };
      setSmokeParticles(prev => [...prev.slice(-15), newSmoke]);
    }
    
    if (newTemp > 60) {
      setOilShimmer(prev => (prev + delta * 3) % (Math.PI * 2));
    }
    
    setFoodItems(prev => prev.map(food => {
      const tempTransfer = (newTemp - food.temperature) * delta * 0.8;
      const newFoodTemp = food.temperature + tempTransfer;
      
      let newProgress = food.cookProgress;
      if (newFoodTemp > 60) {
        const cookRate = (newFoodTemp - 60) / 40;
        newProgress = Math.min(100, food.cookProgress + cookRate * delta * 15);
      }
      
      let newState: FoodState = food.state;
      if (newProgress < 20) newState = "raw";
      else if (newProgress < 80) newState = "cooking";
      else if (newProgress < 95) newState = "cooked";
      else newState = "burnt";
      
      const rawColor = new THREE.Color(food.color);
      const cookedColor = new THREE.Color(food.targetColor);
      const burntColor = new THREE.Color("#1a0f05");
      
      let displayColor: THREE.Color;
      if (newProgress < 80) {
        displayColor = rawColor.clone().lerp(cookedColor, newProgress / 80);
      } else {
        displayColor = cookedColor.clone().lerp(burntColor, (newProgress - 80) / 20);
      }
      
      return {
        ...food,
        temperature: newFoodTemp,
        cookProgress: newProgress,
        state: newState,
        color: `#${displayColor.getHexString()}`
      };
    }));
    
    setFlameParticles(prev =>
      prev
        .map(p => ({
          ...p,
          pos: [
            p.pos[0] + p.vel[0],
            p.pos[1] + p.vel[1],
            p.pos[2] + p.vel[2]
          ] as [number, number, number],
          life: p.life - delta * 2.5,
          scale: p.scale * (1 + delta)
        }))
        .filter(p => p.life > 0)
    );
    
    setSmokeParticles(prev =>
      prev
        .map(p => ({
          ...p,
          pos: [
            p.pos[0] + (Math.random() - 0.5) * 0.002,
            p.pos[1] + 0.012,
            p.pos[2] + (Math.random() - 0.5) * 0.002
          ] as [number, number, number],
          opacity: p.opacity - delta * 0.4,
          scale: p.scale + delta * 0.02
        }))
        .filter(p => p.opacity > 0)
    );
    
    if (panRef.current) {
      const heatIntensity = Math.max(0, (newTemp - 40) / 60);
      const heatColor = new THREE.Color().setHSL(
        0.05 - heatIntensity * 0.05,
        0.9,
        0.2 + heatIntensity * 0.3
      );
      (panRef.current.material as THREE.MeshStandardMaterial).emissive = heatColor;
      (panRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity = heatIntensity * 0.4;
    }
  });

  const inZone = temperature >= targetZone.min && temperature <= targetZone.max;
  const isBurning = temperature > 90;

  return (
    <group position={[0, 1.05, -2]}>
      <group position={[0, -0.08, 0]}>
        <mesh>
          <boxGeometry args={[0.7, 0.06, 0.5]} />
          <meshStandardMaterial color="#2a2a2a" metalness={0.6} roughness={0.4} />
        </mesh>
        
        {[-0.2, 0.2].map((x, i) => (
          <group key={i} position={[x, 0.035, 0]}>
            <mesh>
              <cylinderGeometry args={[0.12, 0.12, 0.008, 32]} />
              <meshStandardMaterial color="#333333" metalness={0.8} roughness={0.3} />
            </mesh>
            {Array.from({ length: 4 }, (_, j) => (
              <mesh key={j} position={[0, 0.005, 0]} rotation={[0, (j / 4) * Math.PI * 2, 0]}>
                <boxGeometry args={[0.22, 0.006, 0.015]} />
                <meshStandardMaterial color="#444444" metalness={0.7} roughness={0.3} />
              </mesh>
            ))}
          </group>
        ))}
      </group>
      
      <mesh ref={panRef} position={[0, 0.05, 0]} castShadow>
        <cylinderGeometry args={[0.18, 0.16, 0.05, 32]} />
        <meshStandardMaterial color="#3a3a3a" metalness={0.85} roughness={0.25} />
      </mesh>
      
      <mesh position={[0.28, 0.05, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.012, 0.012, 0.18, 12]} />
        <meshStandardMaterial color="#2a2a2a" metalness={0.7} roughness={0.4} />
      </mesh>
      <mesh position={[0.36, 0.05, 0]}>
        <sphereGeometry args={[0.015, 12, 12]} />
        <meshStandardMaterial color="#222222" metalness={0.6} roughness={0.5} />
      </mesh>
      
      <mesh position={[0, 0.03, 0]}>
        <cylinderGeometry args={[0.15, 0.15, 0.015, 32]} />
        <meshStandardMaterial 
          color={isBurning ? "#1a1005" : "#c49a6c"} 
          roughness={0.6}
          emissive={new THREE.Color("#ff6600")}
          emissiveIntensity={Math.sin(oilShimmer) * 0.05 * (temperature / 100)}
        />
      </mesh>
      
      {foodItems.map(food => (
        <mesh key={food.id} position={food.pos}>
          <boxGeometry args={[0.04, 0.025, 0.04]} />
          <meshStandardMaterial 
            color={food.color} 
            roughness={0.6}
            emissive={food.state === "burnt" ? new THREE.Color("#330000") : new THREE.Color("#000000")}
            emissiveIntensity={food.state === "burnt" ? 0.2 : 0}
          />
        </mesh>
      ))}
      
      {flameParticles.map(p => (
        <mesh key={p.id} position={p.pos} scale={p.scale * p.life}>
          <sphereGeometry args={[1, 8, 8]} />
          <meshBasicMaterial color={p.color} transparent opacity={p.life * 0.9} />
        </mesh>
      ))}
      
      {smokeParticles.map(p => (
        <mesh key={p.id} position={p.pos} scale={p.scale}>
          <sphereGeometry args={[1, 6, 6]} />
          <meshBasicMaterial 
            color={p.type === "burnt" ? "#222222" : p.type === "steam" ? "#ffffff" : "#666666"} 
            transparent 
            opacity={p.opacity} 
          />
        </mesh>
      ))}
      
      <group ref={knobRef} position={[-0.4, -0.02, 0.3]}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.035, 0.035, 0.018, 20]} />
          <meshStandardMaterial color="#555555" metalness={0.85} roughness={0.2} />
        </mesh>
        <mesh position={[0.025, 0, 0.01]}>
          <boxGeometry args={[0.015, 0.008, 0.004]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
        
        <group position={[0, 0, -0.015]} rotation={[Math.PI / 2, 0, 0]}>
          {["OFF", "LOW", "MED", "HIGH"].map((label, i) => (
            <Text
              key={label}
              position={[
                Math.sin((i / 4) * Math.PI) * 0.055,
                0.012,
                -Math.cos((i / 4) * Math.PI) * 0.055
              ]}
              rotation={[-Math.PI / 2, 0, 0]}
              fontSize={0.012}
              color="#888888"
              anchorX="center"
            >
              {label}
            </Text>
          ))}
        </group>
      </group>
      
      <group position={[-0.5, 0.15, 0]}>
        <mesh>
          <boxGeometry args={[0.06, 0.18, 0.012]} />
          <meshStandardMaterial color="#222222" />
        </mesh>
        
        <mesh position={[0, 0, 0.007]}>
          <boxGeometry args={[0.045, 0.16, 0.002]} />
          <meshStandardMaterial color="#111111" />
        </mesh>
        
        <mesh 
          position={[0, -0.08 + ((temperature - 20) / 80) * 0.16, 0.009]}
          scale={[1, (temperature - 20) / 80, 1]}
        >
          <boxGeometry args={[0.04, 0.16, 0.002]} />
          <meshStandardMaterial 
            color={isBurning ? "#ff0000" : inZone ? "#00ff00" : temperature > targetZone.max ? "#ffaa00" : "#4488ff"} 
          />
        </mesh>
        
        <mesh position={[0, -0.08 + ((targetZone.min + targetZone.max - 40) / 160) * 0.16, 0.012]}>
          <boxGeometry args={[0.055, 0.025, 0.002]} />
          <meshBasicMaterial color="#00ff88" transparent opacity={0.4} />
        </mesh>
        
        <Text
          position={[0.045, 0.07, 0.01]}
          fontSize={0.014}
          color="#ffffff"
          anchorX="left"
        >
          {`${Math.round(temperature)}°C`}
        </Text>
      </group>
      
      <group position={[0, 0.22, 0.2]}>
        <mesh>
          <planeGeometry args={[0.2, 0.06]} />
          <meshBasicMaterial color="#222222" transparent opacity={0.85} />
        </mesh>
        <mesh 
          position={[0, 0, 0.001]} 
          scale={[Math.min(1, timeInZone / duration), 1, 1]}
        >
          <planeGeometry args={[0.19, 0.03]} />
          <meshBasicMaterial color={timeInZone >= duration ? "#00ff88" : "#ffdd00"} />
        </mesh>
        <Text
          position={[0, 0, 0.002]}
          fontSize={0.016}
          color="#ffffff"
          anchorX="center"
        >
          {`Cooking: ${Math.round((timeInZone / duration) * 100)}%`}
        </Text>
      </group>
      
      {showWarning && (
        <group position={[0, 0.35, 0]}>
          <mesh>
            <planeGeometry args={[0.25, 0.06]} />
            <meshBasicMaterial color={warningFlash ? "#ff0000" : "#aa0000"} transparent opacity={0.9} />
          </mesh>
          <Text
            position={[0, 0, 0.01]}
            fontSize={0.022}
            color="#ffffff"
            anchorX="center"
          >
            BURNING! Lower Heat!
          </Text>
        </group>
      )}
      
      {showTutorial && (
        <group position={[0, 0.45, 0]}>
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
            Drag knob or use W/S keys to control heat
          </Text>
          <Text
            position={[0, -0.02, 0.01]}
            fontSize={0.015}
            color="#aaaaaa"
            anchorX="center"
          >
            Keep temperature in the green zone
          </Text>
        </group>
      )}
      
      {temperature > 35 && (
        <pointLight
          position={[0, 0.1, 0]}
          color="#ff6600"
          intensity={((temperature - 35) / 65) * 0.6}
          distance={1.2}
        />
      )}
    </group>
  );
}
