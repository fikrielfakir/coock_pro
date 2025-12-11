import { useRef, useState, useCallback, useEffect, useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useCookingGame } from "@/lib/stores/useCookingGame";
import { useAudio } from "@/lib/stores/useAudio";
import { Text } from "@react-three/drei";

interface ChoppingGameProps {
  onComplete: (score: number) => void;
  targetCuts?: number;
  timeLimit?: number;
}

type CutQuality = "perfect" | "good" | "poor";
type CuttingTechnique = "chop" | "dice" | "julienne";

interface Particle {
  id: number;
  pos: [number, number, number];
  vel: [number, number, number];
  color: string;
  scale: number;
  life: number;
}

interface JuiceSplat {
  id: number;
  pos: [number, number, number];
  opacity: number;
  scale: number;
}

interface CutPiece {
  id: number;
  pos: [number, number, number];
  rotation: [number, number, number];
  vel: [number, number, number];
  rotVel: [number, number, number];
  size: [number, number, number];
  color: string;
}

interface SwipeData {
  startPos: { x: number; y: number };
  startTime: number;
  isActive: boolean;
}

export function ChoppingGame({ onComplete, targetCuts = 8, timeLimit = 90 }: ChoppingGameProps) {
  const { camera, gl } = useThree();
  const knifeRef = useRef<THREE.Group>(null);
  const boardRef = useRef<THREE.Group>(null);
  
  const [cuts, setCuts] = useState(0);
  const [isChopping, setIsChopping] = useState(false);
  const [knifePos, setKnifePos] = useState({ x: 0, y: 0.4, z: 0 });
  const [knifeAngle, setKnifeAngle] = useState(0);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [juiceSplats, setJuiceSplats] = useState<JuiceSplat[]>([]);
  const [cutPieces, setCutPieces] = useState<CutPiece[]>([]);
  const [combo, setCombo] = useState(0);
  const [scoreMultiplier, setScoreMultiplier] = useState(1);
  const [timeRemaining, setTimeRemaining] = useState(timeLimit);
  const [lastCutQuality, setLastCutQuality] = useState<CutQuality | null>(null);
  const [feedbackText, setFeedbackText] = useState("");
  const [feedbackOpacity, setFeedbackOpacity] = useState(0);
  const [totalScore, setTotalScore] = useState(0);
  const [currentTechnique, setCurrentTechnique] = useState<CuttingTechnique>("chop");
  const [showTutorial, setShowTutorial] = useState(true);
  const [swipeData, setSwipeData] = useState<SwipeData>({ startPos: { x: 0, y: 0 }, startTime: 0, isActive: false });
  const [ingredientType, setIngredientType] = useState<"tomato" | "carrot" | "onion">("tomato");
  
  const addChoppingScore = useCookingGame(state => state.addChoppingScore);
  const { playHit, playSuccess } = useAudio();

  const slicePositions = useMemo(() => {
    const positions: number[] = [];
    for (let i = 0; i < targetCuts; i++) {
      positions.push(-0.22 + (i / (targetCuts - 1)) * 0.44);
    }
    return positions;
  }, [targetCuts]);

  const ingredientColor = useMemo(() => {
    switch (ingredientType) {
      case "tomato": return "#ff4444";
      case "carrot": return "#ff8c00";
      case "onion": return "#f0e68c";
      default: return "#ff4444";
    }
  }, [ingredientType]);

  const calculateCutQuality = useCallback((cutX: number, targetX: number): CutQuality => {
    const distance = Math.abs(cutX - targetX);
    if (distance < 0.02) return "perfect";
    if (distance < 0.05) return "good";
    return "poor";
  }, []);

  const getScoreForQuality = useCallback((quality: CutQuality, technique: CuttingTechnique): number => {
    const baseScore = { perfect: 15, good: 10, poor: 5 };
    const techniqueMultiplier = { chop: 1, dice: 1.2, julienne: 1.5 };
    return Math.round(baseScore[quality] * techniqueMultiplier[technique]);
  }, []);

  const showFeedback = useCallback((quality: CutQuality) => {
    const messages = {
      perfect: ["Perfect Cut!", "Amazing!", "Masterful!"],
      good: ["Nice!", "Good Cut!", "Well Done!"],
      poor: ["Try Again!", "Keep Going!", "Almost!"]
    };
    const randomMessage = messages[quality][Math.floor(Math.random() * messages[quality].length)];
    setFeedbackText(randomMessage);
    setFeedbackOpacity(1);
  }, []);

  const spawnParticles = useCallback((position: [number, number, number], swipeSpeed: number, color: string) => {
    const particleCount = Math.min(12, Math.floor(5 + swipeSpeed * 2));
    const newParticles: Particle[] = Array.from({ length: particleCount }, (_, i) => ({
      id: Date.now() + i + Math.random(),
      pos: [
        position[0] + (Math.random() - 0.5) * 0.05,
        position[1] + 0.05,
        position[2] + (Math.random() - 0.5) * 0.05
      ] as [number, number, number],
      vel: [
        (Math.random() - 0.5) * 0.03 * swipeSpeed,
        Math.random() * 0.04 + 0.02,
        (Math.random() - 0.5) * 0.03 * swipeSpeed
      ] as [number, number, number],
      color,
      scale: 0.008 + Math.random() * 0.006,
      life: 1.0
    }));
    setParticles(prev => [...prev.slice(-30), ...newParticles]);
  }, []);

  const spawnJuiceSplat = useCallback((position: [number, number, number]) => {
    const newSplat: JuiceSplat = {
      id: Date.now() + Math.random(),
      pos: [
        position[0] + (Math.random() - 0.5) * 0.1,
        0.02,
        position[2] + (Math.random() - 0.5) * 0.08
      ] as [number, number, number],
      opacity: 0.7,
      scale: 0.02 + Math.random() * 0.02
    };
    setJuiceSplats(prev => [...prev.slice(-15), newSplat]);
  }, []);

  const spawnCutPiece = useCallback((position: [number, number, number], swipeSpeed: number, color: string) => {
    const newPiece: CutPiece = {
      id: Date.now() + Math.random(),
      pos: [...position] as [number, number, number],
      rotation: [0, 0, 0],
      vel: [
        (Math.random() - 0.5) * 0.02 * swipeSpeed,
        0.03 + Math.random() * 0.02,
        (Math.random() - 0.5) * 0.02 * swipeSpeed
      ],
      rotVel: [
        (Math.random() - 0.5) * 0.3,
        (Math.random() - 0.5) * 0.3,
        (Math.random() - 0.5) * 0.3
      ],
      size: [0.015, 0.03, 0.015],
      color
    };
    setCutPieces(prev => [...prev.slice(-20), newPiece]);
  }, []);

  const handleChop = useCallback((swipeSpeed: number = 1, swipeAngle: number = 0) => {
    if (isChopping || cuts >= targetCuts || timeRemaining <= 0) return;
    
    setIsChopping(true);
    
    const targetX = slicePositions[cuts] || 0;
    const cutX = knifePos.x;
    const quality = calculateCutQuality(cutX, targetX);
    
    setKnifeAngle(swipeAngle * 0.3);
    setKnifePos(prev => ({ ...prev, y: 0.08 }));
    
    setTimeout(() => {
      const score = getScoreForQuality(quality, currentTechnique);
      const finalScore = Math.round(score * scoreMultiplier);
      
      setCuts(prev => prev + 1);
      setTotalScore(prev => prev + finalScore);
      addChoppingScore(finalScore);
      setLastCutQuality(quality);
      showFeedback(quality);
      
      if (quality === "perfect") {
        setCombo(prev => prev + 1);
        setScoreMultiplier(prev => Math.min(4, prev + 0.25));
        playSuccess();
      } else if (quality === "good") {
        setCombo(prev => Math.max(0, prev - 1));
        playHit();
      } else {
        setCombo(0);
        setScoreMultiplier(1);
        playHit();
      }
      
      const cutPosition: [number, number, number] = [targetX, 0.08, 0];
      spawnParticles(cutPosition, swipeSpeed, ingredientColor);
      spawnJuiceSplat(cutPosition);
      spawnCutPiece(cutPosition, swipeSpeed, ingredientColor);
      
      setTimeout(() => {
        setIsChopping(false);
        setKnifePos(prev => ({ ...prev, y: 0.4 }));
        setKnifeAngle(0);
      }, 120);
    }, 60);
  }, [isChopping, cuts, targetCuts, timeRemaining, slicePositions, knifePos, calculateCutQuality, 
      getScoreForQuality, currentTechnique, scoreMultiplier, addChoppingScore, showFeedback, 
      playHit, playSuccess, spawnParticles, spawnJuiceSplat, spawnCutPiece, ingredientColor]);

  const handleMouseDown = useCallback((e: MouseEvent) => {
    const rect = gl.domElement.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    setSwipeData({ startPos: { x, y }, startTime: Date.now(), isActive: true });
  }, [gl.domElement]);

  const handleMouseUp = useCallback((e: MouseEvent) => {
    if (!swipeData.isActive) return;
    
    const rect = gl.domElement.getBoundingClientRect();
    const endX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const endY = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    
    const dx = endX - swipeData.startPos.x;
    const dy = endY - swipeData.startPos.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const duration = (Date.now() - swipeData.startTime) / 1000;
    const speed = Math.min(3, distance / Math.max(0.1, duration));
    const angle = Math.atan2(dy, dx);
    
    if (distance > 0.05 && Math.abs(dy) > Math.abs(dx) * 0.3) {
      handleChop(speed, angle);
    }
    
    setSwipeData({ startPos: { x: 0, y: 0 }, startTime: 0, isActive: false });
  }, [swipeData, gl.domElement, handleChop]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    const rect = gl.domElement.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const targetX = x * 0.25;
    setKnifePos(prev => ({ ...prev, x: targetX }));
  }, [gl.domElement]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space" || e.code === "KeyJ") {
        handleChop(1.5, 0);
      }
      if (e.code === "Digit1") setCurrentTechnique("chop");
      if (e.code === "Digit2") setCurrentTechnique("dice");
      if (e.code === "Digit3") setCurrentTechnique("julienne");
    };
    
    gl.domElement.addEventListener("mousedown", handleMouseDown);
    gl.domElement.addEventListener("mouseup", handleMouseUp);
    gl.domElement.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("keydown", handleKeyDown);
    
    return () => {
      gl.domElement.removeEventListener("mousedown", handleMouseDown);
      gl.domElement.removeEventListener("mouseup", handleMouseUp);
      gl.domElement.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleChop, handleMouseDown, handleMouseUp, handleMouseMove, gl.domElement]);

  useEffect(() => {
    if (cuts >= targetCuts || timeRemaining <= 0) {
      const finalScore = Math.round((totalScore / (targetCuts * 15)) * 100);
      setTimeout(() => onComplete(Math.min(100, finalScore)), 600);
    }
  }, [cuts, targetCuts, timeRemaining, totalScore, onComplete]);

  useEffect(() => {
    if (timeRemaining > 0 && cuts < targetCuts) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => Math.max(0, prev - 1));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [timeRemaining, cuts, targetCuts]);

  useEffect(() => {
    const tutorialTimer = setTimeout(() => setShowTutorial(false), 4000);
    return () => clearTimeout(tutorialTimer);
  }, []);

  useFrame((state, delta) => {
    if (knifeRef.current) {
      knifeRef.current.position.x += (knifePos.x - knifeRef.current.position.x) * 0.25;
      knifeRef.current.position.y += (knifePos.y - knifeRef.current.position.y) * 0.35;
      
      const wobble = Math.sin(state.clock.elapsedTime * 3) * 0.008;
      knifeRef.current.rotation.z = knifeAngle + wobble;
    }
    
    setParticles(prev => 
      prev
        .map(p => ({
          ...p,
          pos: [
            p.pos[0] + p.vel[0],
            p.pos[1] + p.vel[1] - 0.003,
            p.pos[2] + p.vel[2]
          ] as [number, number, number],
          vel: [p.vel[0] * 0.98, p.vel[1], p.vel[2] * 0.98] as [number, number, number],
          life: p.life - delta * 1.5
        }))
        .filter(p => p.life > 0 && p.pos[1] > -0.1)
    );
    
    setJuiceSplats(prev =>
      prev
        .map(s => ({ ...s, opacity: s.opacity - delta * 0.3 }))
        .filter(s => s.opacity > 0)
    );
    
    setCutPieces(prev =>
      prev
        .map(p => ({
          ...p,
          pos: [
            p.pos[0] + p.vel[0],
            p.pos[1] + p.vel[1] - 0.002,
            p.pos[2] + p.vel[2]
          ] as [number, number, number],
          rotation: [
            p.rotation[0] + p.rotVel[0],
            p.rotation[1] + p.rotVel[1],
            p.rotation[2] + p.rotVel[2]
          ] as [number, number, number],
          vel: [p.vel[0] * 0.95, p.vel[1] * 0.95, p.vel[2] * 0.95] as [number, number, number]
        }))
        .filter(p => p.pos[1] > -0.2)
    );
    
    if (feedbackOpacity > 0) {
      setFeedbackOpacity(prev => Math.max(0, prev - delta * 1.5));
    }
  });

  return (
    <group position={[-3, 1.05, -1.8]}>
      <group ref={boardRef}>
        <mesh receiveShadow castShadow>
          <boxGeometry args={[0.6, 0.025, 0.4]} />
          <meshStandardMaterial color="#b8956e" roughness={0.85} />
        </mesh>
        <mesh position={[0, 0.013, 0]}>
          <boxGeometry args={[0.58, 0.002, 0.38]} />
          <meshStandardMaterial color="#d4a574" roughness={0.9} />
        </mesh>
        <mesh position={[0, -0.013, 0]}>
          <boxGeometry args={[0.58, 0.002, 0.38]} />
          <meshStandardMaterial color="#8b6f47" roughness={0.9} />
        </mesh>
      </group>
      
      <group position={[0, 0.025, 0]}>
        {slicePositions.map((x, i) => (
          <group key={i}>
            {i >= cuts && (
              <mesh position={[x, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <ringGeometry args={[0.012, 0.016, 16]} />
                <meshBasicMaterial 
                  color={i === cuts ? "#00ff88" : "#ffffff"} 
                  transparent 
                  opacity={i === cuts ? 0.8 : 0.3} 
                />
              </mesh>
            )}
            
            <mesh 
              position={[x, 0.035, 0]}
              visible={i < cuts}
            >
              <boxGeometry args={[0.018, 0.05, 0.1]} />
              <meshStandardMaterial color={ingredientColor} roughness={0.5} />
            </mesh>
          </group>
        ))}
        
        {cuts < targetCuts && (
          <mesh position={[slicePositions[cuts] || 0, 0.04, 0]}>
            <sphereGeometry args={[0.055, 24, 24]} />
            <meshStandardMaterial color={ingredientColor} roughness={0.4} />
          </mesh>
        )}
      </group>
      
      <group ref={knifeRef} position={[knifePos.x, knifePos.y, 0]} rotation={[0, 0, knifeAngle]}>
        <mesh position={[0, 0, 0]} castShadow>
          <boxGeometry args={[0.018, 0.14, 0.008]} />
          <meshStandardMaterial color="#e0e0e0" metalness={0.95} roughness={0.08} />
        </mesh>
        <mesh position={[0.008, 0, 0]}>
          <boxGeometry args={[0.004, 0.14, 0.008]} />
          <meshStandardMaterial color="#c0c0c0" metalness={0.9} roughness={0.15} />
        </mesh>
        <mesh position={[0, -0.09, 0]}>
          <boxGeometry args={[0.028, 0.045, 0.018]} />
          <meshStandardMaterial color="#3d2817" roughness={0.85} />
        </mesh>
        <mesh position={[0, -0.095, 0]}>
          <cylinderGeometry args={[0.003, 0.003, 0.04, 8]} />
          <meshStandardMaterial color="#b8860b" metalness={0.7} roughness={0.3} />
        </mesh>
      </group>
      
      {particles.map(p => (
        <mesh key={p.id} position={p.pos} scale={p.scale * p.life}>
          <sphereGeometry args={[1, 8, 8]} />
          <meshStandardMaterial color={p.color} transparent opacity={p.life} />
        </mesh>
      ))}
      
      {juiceSplats.map(s => (
        <mesh key={s.id} position={s.pos} rotation={[-Math.PI / 2, 0, Math.random() * Math.PI]}>
          <circleGeometry args={[s.scale, 12]} />
          <meshBasicMaterial color={ingredientColor} transparent opacity={s.opacity * 0.6} />
        </mesh>
      ))}
      
      {cutPieces.map(p => (
        <mesh key={p.id} position={p.pos} rotation={p.rotation}>
          <boxGeometry args={p.size} />
          <meshStandardMaterial color={p.color} roughness={0.6} />
        </mesh>
      ))}
      
      {feedbackOpacity > 0 && (
        <Text
          position={[0, 0.5, 0.3]}
          fontSize={0.08}
          color={lastCutQuality === "perfect" ? "#00ff88" : lastCutQuality === "good" ? "#ffdd00" : "#ff6644"}
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.003}
          outlineColor="#000000"
          fillOpacity={feedbackOpacity}
        >
          {feedbackText}
        </Text>
      )}
      
      {combo > 1 && (
        <Text
          position={[0.25, 0.4, 0.3]}
          fontSize={0.04}
          color="#ffaa00"
          anchorX="center"
          anchorY="middle"
        >
          {`${combo}x Combo!`}
        </Text>
      )}
      
      {showTutorial && (
        <group position={[0, 0.65, 0]}>
          <mesh>
            <planeGeometry args={[0.5, 0.15]} />
            <meshBasicMaterial color="#000000" transparent opacity={0.7} />
          </mesh>
          <Text
            position={[0, 0.02, 0.01]}
            fontSize={0.025}
            color="#ffffff"
            anchorX="center"
            anchorY="middle"
          >
            Swipe down or press SPACE to chop!
          </Text>
          <Text
            position={[0, -0.03, 0.01]}
            fontSize={0.018}
            color="#aaaaaa"
            anchorX="center"
            anchorY="middle"
          >
            Aim for the green targets for Perfect cuts
          </Text>
        </group>
      )}
      
      <group position={[-0.35, 0.15, 0.25]}>
        <mesh>
          <planeGeometry args={[0.12, 0.08]} />
          <meshBasicMaterial color="#222222" transparent opacity={0.8} />
        </mesh>
        <Text
          position={[0, 0.015, 0.01]}
          fontSize={0.02}
          color="#ffffff"
          anchorX="center"
        >
          {`${cuts}/${targetCuts}`}
        </Text>
        <Text
          position={[0, -0.015, 0.01]}
          fontSize={0.015}
          color="#aaaaaa"
          anchorX="center"
        >
          Cuts
        </Text>
      </group>
      
      <group position={[0.35, 0.15, 0.25]}>
        <mesh>
          <planeGeometry args={[0.12, 0.08]} />
          <meshBasicMaterial color="#222222" transparent opacity={0.8} />
        </mesh>
        <Text
          position={[0, 0.015, 0.01]}
          fontSize={0.02}
          color={timeRemaining < 15 ? "#ff4444" : "#ffffff"}
          anchorX="center"
        >
          {`${timeRemaining}s`}
        </Text>
        <Text
          position={[0, -0.015, 0.01]}
          fontSize={0.015}
          color="#aaaaaa"
          anchorX="center"
        >
          Time
        </Text>
      </group>
      
      <group position={[0, 0.15, 0.25]}>
        <mesh>
          <planeGeometry args={[0.14, 0.08]} />
          <meshBasicMaterial color="#222222" transparent opacity={0.8} />
        </mesh>
        <Text
          position={[0, 0.015, 0.01]}
          fontSize={0.02}
          color="#ffdd00"
          anchorX="center"
        >
          {`${totalScore}`}
        </Text>
        <Text
          position={[0, -0.015, 0.01]}
          fontSize={0.015}
          color="#aaaaaa"
          anchorX="center"
        >
          {scoreMultiplier > 1 ? `Score x${scoreMultiplier.toFixed(1)}` : "Score"}
        </Text>
      </group>
    </group>
  );
}
