import { useRef, useState, useEffect, useCallback, useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useCookingGame } from "@/lib/stores/useCookingGame";
import { Text } from "@react-three/drei";

interface StirringGameProps {
  onComplete: (score: number) => void;
  targetProgress?: number;
  timeLimit?: number;
}

type MixingTool = "spoon" | "whisk" | "spatula";
type MixingPattern = "clockwise" | "counterclockwise" | "figure_eight";
type BowlSize = "small" | "medium" | "large";

interface TrailPoint {
  pos: [number, number, number];
  time: number;
  opacity: number;
}

interface SplashParticle {
  id: number;
  pos: [number, number, number];
  vel: [number, number, number];
  life: number;
  color: string;
}

interface FlourParticle {
  id: number;
  pos: [number, number, number];
  vel: [number, number, number];
  life: number;
  scale: number;
}

interface IngredientChunk {
  id: number;
  angle: number;
  radius: number;
  blendProgress: number;
  color: string;
}

export function StirringGame({ onComplete, targetProgress = 100, timeLimit = 60 }: StirringGameProps) {
  const { gl, camera } = useThree();
  const spoonRef = useRef<THREE.Group>(null);
  const bowlContentsRef = useRef<THREE.Mesh>(null);
  const fluidRef = useRef<THREE.Mesh>(null);
  
  const [progress, setProgress] = useState(0);
  const [lastAngle, setLastAngle] = useState(0);
  const [stirSpeed, setStirSpeed] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isTooFast, setIsTooFast] = useState(false);
  const [isTooSlow, setIsTooSlow] = useState(false);
  const [isInPerfectZone, setIsInPerfectZone] = useState(false);
  const [splashParticles, setSplashParticles] = useState<SplashParticle[]>([]);
  const [flourParticles, setFlourParticles] = useState<FlourParticle[]>([]);
  const [trail, setTrail] = useState<TrailPoint[]>([]);
  const [circularityScore, setCircularityScore] = useState(0);
  const [currentPattern, setCurrentPattern] = useState<MixingPattern>("clockwise");
  const [currentTool, setCurrentTool] = useState<MixingTool>("spoon");
  const [bowlSize, setBowlSize] = useState<BowlSize>("medium");
  const [consistencyText, setConsistencyText] = useState("Lumpy");
  const [ingredientChunks, setIngredientChunks] = useState<IngredientChunk[]>([]);
  const [fatigue, setFatigue] = useState(0);
  const [rhythmBonus, setRhythmBonus] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(timeLimit);
  const [showTutorial, setShowTutorial] = useState(true);
  const [totalRotations, setTotalRotations] = useState(0);
  const [isDryIngredient, setIsDryIngredient] = useState(false);
  const [viscosity, setViscosity] = useState(0.5);
  
  const setMixingProgress = useCookingGame(state => state.setMixingProgress);

  const bowlDimensions = useMemo(() => {
    switch (bowlSize) {
      case "small": return { top: 0.12, bottom: 0.09, height: 0.1 };
      case "large": return { top: 0.28, bottom: 0.22, height: 0.18 };
      default: return { top: 0.2, bottom: 0.15, height: 0.14 };
    }
  }, [bowlSize]);

  const toolProperties = useMemo(() => {
    switch (currentTool) {
      case "whisk": return { speed: 1.3, efficiency: 1.2, color: "#c0c0c0" };
      case "spatula": return { speed: 0.8, efficiency: 0.9, color: "#ff6b6b" };
      default: return { speed: 1.0, efficiency: 1.0, color: "#8b7355" };
    }
  }, [currentTool]);

  useEffect(() => {
    const initialChunks: IngredientChunk[] = Array.from({ length: 8 }, (_, i) => ({
      id: i,
      angle: (i / 8) * Math.PI * 2,
      radius: 0.06 + Math.random() * 0.04,
      blendProgress: 0,
      color: Math.random() > 0.5 ? "#fff5dc" : "#f5e6c8"
    }));
    setIngredientChunks(initialChunks);
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    const rect = gl.domElement.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    setMousePos({ x, y });
  }, [gl.domElement]);

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [handleMouseMove]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Digit1") setCurrentTool("spoon");
      if (e.code === "Digit2") setCurrentTool("whisk");
      if (e.code === "Digit3") setCurrentTool("spatula");
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (progress >= targetProgress || timeRemaining <= 0) {
      const consistencyBonus = progress >= targetProgress ? 20 : 0;
      const speedPenalty = isTooFast ? 15 : 0;
      const rhythmPoints = Math.min(15, rhythmBonus);
      const circularBonus = Math.round(circularityScore * 10);
      
      const finalScore = Math.min(100, Math.round(
        (progress / targetProgress) * 50 + consistencyBonus + rhythmPoints + circularBonus - speedPenalty
      ));
      
      setTimeout(() => onComplete(finalScore), 400);
    }
  }, [progress, targetProgress, timeRemaining, onComplete, isTooFast, rhythmBonus, circularityScore]);

  useEffect(() => {
    if (timeRemaining > 0 && progress < targetProgress) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => Math.max(0, prev - 1));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [timeRemaining, progress, targetProgress]);

  useEffect(() => {
    const tutorialTimer = setTimeout(() => setShowTutorial(false), 3500);
    return () => clearTimeout(tutorialTimer);
  }, []);

  useFrame((state, delta) => {
    if (spoonRef.current) {
      const maxRadius = bowlDimensions.top * 0.7;
      const targetX = mousePos.x * maxRadius;
      const targetZ = mousePos.y * maxRadius;
      
      const dampening = 0.18 * toolProperties.speed * (1 - fatigue * 0.3);
      spoonRef.current.position.x += (targetX - spoonRef.current.position.x) * dampening;
      spoonRef.current.position.z += (targetZ - spoonRef.current.position.z) * dampening;
      
      const currentAngle = Math.atan2(spoonRef.current.position.z, spoonRef.current.position.x);
      let angleDiff = currentAngle - lastAngle;
      
      if (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
      if (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
      
      const speed = Math.abs(angleDiff) / delta;
      setStirSpeed(speed);
      
      if (angleDiff > 0.01) setCurrentPattern("counterclockwise");
      else if (angleDiff < -0.01) setCurrentPattern("clockwise");
      
      setTotalRotations(prev => prev + Math.abs(angleDiff) / (Math.PI * 2));
      
      const tooFast = speed > 7;
      const tooSlow = speed < 0.4 && speed > 0;
      const perfectZone = speed >= 2 && speed <= 5;
      
      setIsTooFast(tooFast);
      setIsTooSlow(tooSlow);
      setIsInPerfectZone(perfectZone);
      
      if (perfectZone) {
        setRhythmBonus(prev => Math.min(15, prev + delta * 2));
        setFatigue(prev => Math.max(0, prev - delta * 0.1));
      } else {
        setFatigue(prev => Math.min(1, prev + delta * 0.05));
      }
      
      if (tooFast && Math.random() > 0.85) {
        const newParticles = Array.from({ length: 2 }, (_, i) => ({
          id: Date.now() + i + Math.random(),
          pos: [
            spoonRef.current!.position.x,
            0.12,
            spoonRef.current!.position.z
          ] as [number, number, number],
          vel: [
            (Math.random() - 0.5) * 0.04,
            Math.random() * 0.05 + 0.02,
            (Math.random() - 0.5) * 0.04
          ] as [number, number, number],
          life: 1.0,
          color: "#fff5dc"
        }));
        setSplashParticles(prev => [...prev.slice(-15), ...newParticles]);
      }
      
      if (isDryIngredient && speed > 1.5 && Math.random() > 0.9) {
        const newFlour: FlourParticle = {
          id: Date.now() + Math.random(),
          pos: [
            spoonRef.current.position.x + (Math.random() - 0.5) * 0.1,
            0.1,
            spoonRef.current.position.z + (Math.random() - 0.5) * 0.1
          ],
          vel: [
            (Math.random() - 0.5) * 0.01,
            Math.random() * 0.015 + 0.005,
            (Math.random() - 0.5) * 0.01
          ],
          life: 1.0,
          scale: 0.01 + Math.random() * 0.015
        };
        setFlourParticles(prev => [...prev.slice(-20), newFlour]);
      }
      
      const resistance = viscosity * (1 - progress / targetProgress * 0.5);
      if (speed > 0.5 && speed < 7 && progress < targetProgress) {
        const progressGain = delta * 18 * toolProperties.efficiency * (1 - resistance * 0.3);
        const bonusMultiplier = perfectZone ? 1.3 : 1;
        setProgress(prev => Math.min(targetProgress, prev + progressGain * bonusMultiplier));
        setMixingProgress(Math.min(100, progress + progressGain * bonusMultiplier));
      }
      
      const distFromCenter = Math.sqrt(
        spoonRef.current.position.x ** 2 + spoonRef.current.position.z ** 2
      );
      const expectedRadius = maxRadius * 0.6;
      const circularity = 1 - Math.abs(distFromCenter - expectedRadius) / expectedRadius;
      setCircularityScore(prev => prev * 0.95 + circularity * 0.05);
      
      setTrail(prev => {
        const newPoint: TrailPoint = {
          pos: [spoonRef.current!.position.x, 0.08, spoonRef.current!.position.z],
          time: state.clock.elapsedTime,
          opacity: 1
        };
        return [...prev.slice(-25), newPoint].map(p => ({
          ...p,
          opacity: Math.max(0, 1 - (state.clock.elapsedTime - p.time) * 0.8)
        })).filter(p => p.opacity > 0);
      });
      
      setLastAngle(currentAngle);
    }
    
    if (bowlContentsRef.current) {
      bowlContentsRef.current.rotation.y += stirSpeed * delta * 0.4;
      
      const t = progress / 100;
      const startColor = new THREE.Color("#fff5dc");
      const endColor = new THREE.Color("#f0e0b8");
      const currentColor = startColor.clone().lerp(endColor, t);
      (bowlContentsRef.current.material as THREE.MeshStandardMaterial).color = currentColor;
    }
    
    setIngredientChunks(prev => 
      prev.map(chunk => ({
        ...chunk,
        angle: chunk.angle + stirSpeed * delta * 0.3,
        blendProgress: Math.min(1, chunk.blendProgress + (stirSpeed > 1 ? delta * 0.03 : 0))
      }))
    );
    
    if (progress < 25) setConsistencyText("Lumpy");
    else if (progress < 50) setConsistencyText("Chunky");
    else if (progress < 75) setConsistencyText("Smooth");
    else setConsistencyText("Perfect!");
    
    setSplashParticles(prev => 
      prev
        .map(p => ({
          ...p,
          pos: [
            p.pos[0] + p.vel[0],
            p.pos[1] + p.vel[1] - 0.004,
            p.pos[2] + p.vel[2]
          ] as [number, number, number],
          life: p.life - delta * 1.2
        }))
        .filter(p => p.life > 0 && p.pos[1] > 0)
    );
    
    setFlourParticles(prev =>
      prev
        .map(p => ({
          ...p,
          pos: [
            p.pos[0] + p.vel[0],
            p.pos[1] + p.vel[1],
            p.pos[2] + p.vel[2]
          ] as [number, number, number],
          vel: [p.vel[0], p.vel[1] - 0.0002, p.vel[2]] as [number, number, number],
          life: p.life - delta * 0.8
        }))
        .filter(p => p.life > 0)
    );
  });

  return (
    <group position={[0, 1.1, 1]}>
      <mesh castShadow>
        <cylinderGeometry args={[bowlDimensions.top, bowlDimensions.bottom, bowlDimensions.height, 32]} />
        <meshStandardMaterial color="#e8e0d5" roughness={0.3} metalness={0.1} />
      </mesh>
      
      <mesh position={[0, -bowlDimensions.height * 0.45, 0]}>
        <cylinderGeometry args={[bowlDimensions.bottom * 0.6, bowlDimensions.bottom * 0.7, 0.015, 24]} />
        <meshStandardMaterial color="#d8d0c5" roughness={0.4} metalness={0.1} />
      </mesh>
      
      <mesh ref={bowlContentsRef} position={[0, 0.01, 0]}>
        <cylinderGeometry args={[bowlDimensions.top * 0.85, bowlDimensions.bottom * 0.8, bowlDimensions.height * 0.6, 32]} />
        <meshStandardMaterial color="#fff5dc" roughness={0.85} />
      </mesh>
      
      {ingredientChunks.filter(c => c.blendProgress < 0.9).map(chunk => (
        <mesh
          key={chunk.id}
          position={[
            Math.cos(chunk.angle) * chunk.radius * (1 - chunk.blendProgress),
            0.03,
            Math.sin(chunk.angle) * chunk.radius * (1 - chunk.blendProgress)
          ]}
          scale={1 - chunk.blendProgress}
        >
          <sphereGeometry args={[0.015, 8, 8]} />
          <meshStandardMaterial color={chunk.color} roughness={0.9} transparent opacity={1 - chunk.blendProgress} />
        </mesh>
      ))}
      
      {trail.map((point, i) => (
        <mesh key={i} position={point.pos}>
          <sphereGeometry args={[0.006, 6, 6]} />
          <meshBasicMaterial color="#ffd700" transparent opacity={point.opacity * 0.6} />
        </mesh>
      ))}
      
      <group ref={spoonRef} position={[0, 0.08, 0]}>
        {currentTool === "spoon" && (
          <>
            <mesh position={[0, 0.12, 0]} rotation={[0.35, 0, 0]} castShadow>
              <cylinderGeometry args={[0.01, 0.01, 0.22, 8]} />
              <meshStandardMaterial color={toolProperties.color} roughness={0.7} />
            </mesh>
            <mesh position={[0, -0.02, 0.015]}>
              <sphereGeometry args={[0.028, 12, 8]} />
              <meshStandardMaterial color={toolProperties.color} roughness={0.7} />
            </mesh>
          </>
        )}
        {currentTool === "whisk" && (
          <>
            <mesh position={[0, 0.14, 0]} rotation={[0.2, 0, 0]} castShadow>
              <cylinderGeometry args={[0.008, 0.008, 0.15, 8]} />
              <meshStandardMaterial color="#444444" metalness={0.8} roughness={0.2} />
            </mesh>
            <group position={[0, 0.02, 0]}>
              {Array.from({ length: 8 }, (_, i) => (
                <mesh key={i} position={[0, 0, 0]} rotation={[0, (i / 8) * Math.PI * 2, 0]}>
                  <torusGeometry args={[0.02, 0.003, 6, 16, Math.PI]} />
                  <meshStandardMaterial color={toolProperties.color} metalness={0.9} roughness={0.1} />
                </mesh>
              ))}
            </group>
          </>
        )}
        {currentTool === "spatula" && (
          <>
            <mesh position={[0, 0.12, 0]} rotation={[0.3, 0, 0]} castShadow>
              <cylinderGeometry args={[0.008, 0.008, 0.18, 8]} />
              <meshStandardMaterial color="#8b4513" roughness={0.7} />
            </mesh>
            <mesh position={[0, -0.01, 0.02]} rotation={[0.2, 0, 0]}>
              <boxGeometry args={[0.05, 0.003, 0.06]} />
              <meshStandardMaterial color={toolProperties.color} roughness={0.6} />
            </mesh>
          </>
        )}
      </group>
      
      {splashParticles.map(p => (
        <mesh key={p.id} position={p.pos}>
          <sphereGeometry args={[0.012, 6, 6]} />
          <meshStandardMaterial color={p.color} transparent opacity={p.life} />
        </mesh>
      ))}
      
      {flourParticles.map(p => (
        <mesh key={p.id} position={p.pos} scale={p.scale}>
          <sphereGeometry args={[1, 6, 6]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={p.life * 0.7} />
        </mesh>
      ))}
      
      <mesh position={[0, -0.08, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[bowlDimensions.top * 0.9, bowlDimensions.top * 1.0, 32]} />
        <meshBasicMaterial 
          color={isTooFast ? "#ff4444" : isInPerfectZone ? "#00ff88" : isTooSlow ? "#ffaa00" : "#888888"} 
          transparent 
          opacity={0.4} 
        />
      </mesh>
      
      <group position={[0, -0.1, bowlDimensions.top + 0.08]}>
        <mesh>
          <planeGeometry args={[0.18, 0.06]} />
          <meshBasicMaterial color="#222222" transparent opacity={0.85} />
        </mesh>
        <mesh position={[0, 0, 0.001]} scale={[progress / 100, 1, 1]}>
          <planeGeometry args={[0.17, 0.035]} />
          <meshBasicMaterial 
            color={progress >= 100 ? "#00ff88" : progress >= 75 ? "#88ff00" : progress >= 50 ? "#ffdd00" : "#ff8800"} 
          />
        </mesh>
        <Text
          position={[0, 0, 0.002]}
          fontSize={0.018}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
        >
          {`${Math.round(progress)}% - ${consistencyText}`}
        </Text>
      </group>
      
      <group position={[-bowlDimensions.top - 0.08, 0.1, 0]}>
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
      
      <group position={[bowlDimensions.top + 0.08, 0.1, 0]}>
        <mesh>
          <planeGeometry args={[0.1, 0.06]} />
          <meshBasicMaterial color="#222222" transparent opacity={0.8} />
        </mesh>
        <Text
          position={[0, 0.01, 0.01]}
          fontSize={0.014}
          color={isInPerfectZone ? "#00ff88" : "#ffffff"}
          anchorX="center"
        >
          {currentPattern === "clockwise" ? "CW" : "CCW"}
        </Text>
        <Text
          position={[0, -0.012, 0.01]}
          fontSize={0.012}
          color="#aaaaaa"
          anchorX="center"
        >
          Pattern
        </Text>
      </group>
      
      {showTutorial && (
        <group position={[0, 0.35, 0]}>
          <mesh>
            <planeGeometry args={[0.45, 0.12]} />
            <meshBasicMaterial color="#000000" transparent opacity={0.75} />
          </mesh>
          <Text
            position={[0, 0.025, 0.01]}
            fontSize={0.022}
            color="#ffffff"
            anchorX="center"
            anchorY="middle"
          >
            Move mouse in circles to stir!
          </Text>
          <Text
            position={[0, -0.02, 0.01]}
            fontSize={0.016}
            color="#aaaaaa"
            anchorX="center"
            anchorY="middle"
          >
            Stay in the green zone for bonus points
          </Text>
        </group>
      )}
      
      {isTooFast && (
        <Text
          position={[0, 0.25, 0]}
          fontSize={0.03}
          color="#ff4444"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.002}
          outlineColor="#000000"
        >
          Too Fast! Slow Down!
        </Text>
      )}
      
      {isTooSlow && !isTooFast && stirSpeed > 0 && (
        <Text
          position={[0, 0.25, 0]}
          fontSize={0.025}
          color="#ffaa00"
          anchorX="center"
          anchorY="middle"
        >
          Stir Faster!
        </Text>
      )}
    </group>
  );
}
