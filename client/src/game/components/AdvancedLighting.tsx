import { useRef, useMemo, useEffect, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
import * as THREE from "three";
import { useCookingGame } from "@/lib/stores/useCookingGame";
import {
  useGraphicsSettings,
  TIME_OF_DAY_SETTINGS,
  LIGHT_TEMPERATURE,
} from "@/lib/stores/useGraphicsSettings";

interface BurnerLightProps {
  position: [number, number, number];
  intensity: number;
}

function BurnerLight({ position, intensity }: BurnerLightProps) {
  const lightRef = useRef<THREE.PointLight>(null);
  const flickerOffset = useRef(Math.random() * Math.PI * 2);

  useFrame((state) => {
    if (lightRef.current && intensity > 0) {
      const flicker =
        Math.sin(state.clock.elapsedTime * 15 + flickerOffset.current) * 0.1 +
        Math.sin(state.clock.elapsedTime * 23 + flickerOffset.current) * 0.05;
      lightRef.current.intensity = intensity * (0.9 + flicker);
    }
  });

  if (intensity <= 0) return null;

  const burnerColor = useMemo(() => {
    if (intensity > 0.8) return "#ff4400";
    if (intensity > 0.5) return "#ff6600";
    if (intensity > 0.2) return "#ff8800";
    return "#ffaa44";
  }, [intensity]);

  return (
    <pointLight
      ref={lightRef}
      position={position}
      intensity={intensity * 2}
      color={burnerColor}
      distance={3}
      decay={2}
    />
  );
}

interface CandleLightProps {
  position: [number, number, number];
  intensity?: number;
}

function CandleLight({ position, intensity = 0.5 }: CandleLightProps) {
  const lightRef = useRef<THREE.PointLight>(null);
  const flickerOffset = useRef(Math.random() * Math.PI * 2);

  useFrame((state) => {
    if (lightRef.current) {
      const flicker =
        Math.sin(state.clock.elapsedTime * 8 + flickerOffset.current) * 0.15 +
        Math.sin(state.clock.elapsedTime * 12 + flickerOffset.current * 2) *
          0.1 +
        Math.sin(state.clock.elapsedTime * 20 + flickerOffset.current * 3) *
          0.05;
      lightRef.current.intensity = intensity * (0.85 + flicker);
    }
  });

  return (
    <pointLight
      ref={lightRef}
      position={position}
      intensity={intensity}
      color={LIGHT_TEMPERATURE.warm.color}
      distance={4}
      decay={2}
    />
  );
}

interface SpotLightWithAnimationProps {
  position: [number, number, number];
  target: [number, number, number];
  intensity?: number;
  angle?: number;
  penumbra?: number;
  color?: string;
}

function AnimatedSpotLight({
  position,
  target,
  intensity = 1,
  angle = 0.3,
  penumbra = 0.5,
  color = LIGHT_TEMPERATURE.neutral.color,
}: SpotLightWithAnimationProps) {
  const lightRef = useRef<THREE.SpotLight>(null);
  const targetRef = useRef<THREE.Object3D>(null);

  return (
    <>
      <object3D ref={targetRef} position={target} />
      <spotLight
        ref={lightRef}
        position={position}
        intensity={intensity}
        angle={angle}
        penumbra={penumbra}
        color={color}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        target={targetRef.current || undefined}
        distance={10}
        decay={2}
      />
    </>
  );
}

export function AdvancedLighting() {
  const temperature = useCookingGame((state) => state.temperature);
  const timeOfDay = useGraphicsSettings((state) => state.timeOfDay);
  const shadowQuality = useGraphicsSettings((state) => state.shadowQuality);
  const quality = useGraphicsSettings((state) => state.quality);
  
  const { gl } = useThree();

  const directionalLightRef = useRef<THREE.DirectionalLight>(null);
  const fillLightRef = useRef<THREE.DirectionalLight>(null);
  
  const [todTransition, setTodTransition] = useState(0);
  const prevTimeOfDay = useRef(timeOfDay);

  const todSettings = TIME_OF_DAY_SETTINGS[timeOfDay];

  useEffect(() => {
    if (prevTimeOfDay.current !== timeOfDay) {
      setTodTransition(0);
      prevTimeOfDay.current = timeOfDay;
    }
  }, [timeOfDay]);

  const shadowMapSize = useMemo(() => {
    switch (shadowQuality) {
      case "low":
        return 1024;
      case "medium":
        return 2048;
      case "high":
        return 4096;
    }
  }, [shadowQuality]);

  useEffect(() => {
    if (directionalLightRef.current) {
      directionalLightRef.current.shadow.mapSize.set(shadowMapSize, shadowMapSize);
      directionalLightRef.current.shadow.map?.dispose();
      directionalLightRef.current.shadow.map = null;
    }
  }, [shadowMapSize]);

  const burnerIntensities = useMemo(() => {
    const normalizedTemp = temperature / 100;
    return [
      normalizedTemp,
      normalizedTemp * 0.8,
      normalizedTemp * 0.6,
      normalizedTemp * 0.4,
    ];
  }, [temperature]);

  useFrame((state, delta) => {
    if (todTransition < 1) {
      setTodTransition(Math.min(todTransition + delta * 0.5, 1));
    }

    if (directionalLightRef.current) {
      const subtle =
        Math.sin(state.clock.elapsedTime * 0.1) * 0.02 +
        Math.sin(state.clock.elapsedTime * 0.05) * 0.01;
      directionalLightRef.current.intensity =
        todSettings.sunIntensity + subtle;
      
      const sunAngle = state.clock.elapsedTime * 0.005;
      directionalLightRef.current.position.x = 8 + Math.sin(sunAngle) * 2;
      directionalLightRef.current.position.y = 12 + Math.cos(sunAngle) * 1;
    }
  });

  return (
    <>
      <Environment preset="apartment" background={false} />

      <ambientLight
        intensity={todSettings.ambientIntensity}
        color={todSettings.ambientColor}
      />

      <directionalLight
        ref={directionalLightRef}
        position={[8, 12, 8]}
        intensity={todSettings.sunIntensity}
        color={todSettings.sunColor}
        castShadow
        shadow-mapSize-width={shadowMapSize}
        shadow-mapSize-height={shadowMapSize}
        shadow-camera-far={50}
        shadow-camera-left={-12}
        shadow-camera-right={12}
        shadow-camera-top={12}
        shadow-camera-bottom={-12}
        shadow-bias={-0.0002}
        shadow-normalBias={0.02}
      />

      <directionalLight
        ref={fillLightRef}
        position={[-5, 8, -3]}
        intensity={todSettings.sunIntensity * 0.4}
        color="#e0e8ff"
      />

      <hemisphereLight
        args={[todSettings.skyColor, "#8b7355", 0.35]}
      />

      <pointLight
        position={[-3, 2.8, -1]}
        intensity={0.9}
        color={LIGHT_TEMPERATURE.neutral.color}
        distance={6}
        decay={2}
      />

      <pointLight
        position={[3, 2.8, -1]}
        intensity={0.9}
        color={LIGHT_TEMPERATURE.neutral.color}
        distance={6}
        decay={2}
      />

      <AnimatedSpotLight
        position={[-3, 3, -2]}
        target={[-3, 1, -2.8]}
        intensity={1.2}
        angle={0.4}
        penumbra={0.6}
        color={LIGHT_TEMPERATURE.neutral.color}
      />

      <AnimatedSpotLight
        position={[0, 3.5, -2]}
        target={[0, 1, -2.5]}
        intensity={0.8}
        angle={0.5}
        penumbra={0.7}
        color={LIGHT_TEMPERATURE.neutral.color}
      />

      <BurnerLight
        position={[-0.6, 1.2, -3]}
        intensity={burnerIntensities[0]}
      />
      <BurnerLight
        position={[0.6, 1.2, -3]}
        intensity={burnerIntensities[1]}
      />
      <BurnerLight
        position={[-0.6, 1.2, -3.5]}
        intensity={burnerIntensities[2]}
      />
      <BurnerLight
        position={[0.6, 1.2, -3.5]}
        intensity={burnerIntensities[3]}
      />

      <pointLight
        position={[4.5, 1, -3]}
        intensity={0.3}
        color={LIGHT_TEMPERATURE.cool.color}
        distance={2}
        decay={2}
      />

      <rectAreaLight
        position={[0, 0.92, 1]}
        rotation={[-Math.PI / 2, 0, 0]}
        width={2}
        height={1}
        intensity={0.5}
        color={LIGHT_TEMPERATURE.neutral.color}
      />
    </>
  );
}
