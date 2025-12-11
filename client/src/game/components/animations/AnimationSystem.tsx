import { useRef, useEffect, useState, useCallback } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface SpringConfig {
  stiffness: number;
  damping: number;
  mass: number;
}

const DEFAULT_SPRING: SpringConfig = {
  stiffness: 150,
  damping: 15,
  mass: 1,
};

export function useSpringValue(
  target: number,
  config: Partial<SpringConfig> = {}
): number {
  const { stiffness, damping, mass } = { ...DEFAULT_SPRING, ...config };
  const valueRef = useRef(target);
  const velocityRef = useRef(0);

  useFrame((_, delta) => {
    const clampedDelta = Math.min(delta, 0.1);
    const displacement = target - valueRef.current;
    const springForce = displacement * stiffness;
    const dampingForce = velocityRef.current * damping;
    const acceleration = (springForce - dampingForce) / mass;
    
    velocityRef.current += acceleration * clampedDelta;
    valueRef.current += velocityRef.current * clampedDelta;
  });

  return valueRef.current;
}

export function useSpringVector3(
  target: THREE.Vector3,
  config: Partial<SpringConfig> = {}
): THREE.Vector3 {
  const { stiffness, damping, mass } = { ...DEFAULT_SPRING, ...config };
  const valueRef = useRef(target.clone());
  const velocityRef = useRef(new THREE.Vector3());

  useFrame((_, delta) => {
    const clampedDelta = Math.min(delta, 0.1);
    const displacement = new THREE.Vector3().subVectors(target, valueRef.current);
    const springForce = displacement.multiplyScalar(stiffness);
    const dampingForce = velocityRef.current.clone().multiplyScalar(damping);
    const acceleration = springForce.sub(dampingForce).divideScalar(mass);
    
    velocityRef.current.add(acceleration.multiplyScalar(clampedDelta));
    valueRef.current.add(velocityRef.current.clone().multiplyScalar(clampedDelta));
  });

  return valueRef.current;
}

type EasingFunction = (t: number) => number;

export const Easing = {
  linear: (t: number) => t,
  easeInQuad: (t: number) => t * t,
  easeOutQuad: (t: number) => t * (2 - t),
  easeInOutQuad: (t: number) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t),
  easeInCubic: (t: number) => t * t * t,
  easeOutCubic: (t: number) => (--t) * t * t + 1,
  easeInOutCubic: (t: number) =>
    t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,
  easeOutElastic: (t: number) => {
    const c4 = (2 * Math.PI) / 3;
    return t === 0 ? 0 : t === 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
  },
  easeOutBounce: (t: number) => {
    const n1 = 7.5625;
    const d1 = 2.75;
    if (t < 1 / d1) return n1 * t * t;
    if (t < 2 / d1) return n1 * (t -= 1.5 / d1) * t + 0.75;
    if (t < 2.5 / d1) return n1 * (t -= 2.25 / d1) * t + 0.9375;
    return n1 * (t -= 2.625 / d1) * t + 0.984375;
  },
  easeInOutBack: (t: number) => {
    const c1 = 1.70158;
    const c2 = c1 * 1.525;
    return t < 0.5
      ? (Math.pow(2 * t, 2) * ((c2 + 1) * 2 * t - c2)) / 2
      : (Math.pow(2 * t - 2, 2) * ((c2 + 1) * (t * 2 - 2) + c2) + 2) / 2;
  },
};

interface TweenOptions {
  duration: number;
  easing?: EasingFunction;
  delay?: number;
  onComplete?: () => void;
  onUpdate?: (value: number) => void;
}

export function useTween(options: TweenOptions) {
  const { duration, easing = Easing.easeOutCubic, delay = 0, onComplete, onUpdate } = options;
  const [progress, setProgress] = useState(0);
  const startTimeRef = useRef<number | null>(null);
  const isActiveRef = useRef(false);

  const start = useCallback(() => {
    startTimeRef.current = null;
    isActiveRef.current = true;
    setProgress(0);
  }, []);

  const stop = useCallback(() => {
    isActiveRef.current = false;
  }, []);

  const reset = useCallback(() => {
    startTimeRef.current = null;
    isActiveRef.current = false;
    setProgress(0);
  }, []);

  useFrame((state) => {
    if (!isActiveRef.current) return;

    if (startTimeRef.current === null) {
      startTimeRef.current = state.clock.elapsedTime;
    }

    const elapsed = state.clock.elapsedTime - startTimeRef.current - delay;
    
    if (elapsed < 0) return;

    const rawProgress = Math.min(elapsed / duration, 1);
    const easedProgress = easing(rawProgress);
    
    setProgress(easedProgress);
    onUpdate?.(easedProgress);

    if (rawProgress >= 1) {
      isActiveRef.current = false;
      onComplete?.();
    }
  });

  return { progress, start, stop, reset, isActive: isActiveRef.current };
}

interface AnimationState {
  from: number;
  to: number;
  current: number;
}

export function useAnimatedValue(
  initialValue: number,
  duration: number = 0.3,
  easing: EasingFunction = Easing.easeOutCubic
): [number, (newValue: number) => void] {
  const stateRef = useRef<AnimationState>({
    from: initialValue,
    to: initialValue,
    current: initialValue,
  });
  const progressRef = useRef(1);
  const [value, setValue] = useState(initialValue);

  const setTargetValue = useCallback((newValue: number) => {
    stateRef.current.from = stateRef.current.current;
    stateRef.current.to = newValue;
    progressRef.current = 0;
  }, []);

  useFrame((_, delta) => {
    if (progressRef.current >= 1) return;

    progressRef.current = Math.min(progressRef.current + delta / duration, 1);
    const easedProgress = easing(progressRef.current);
    
    stateRef.current.current = THREE.MathUtils.lerp(
      stateRef.current.from,
      stateRef.current.to,
      easedProgress
    );
    
    setValue(stateRef.current.current);
  });

  return [value, setTargetValue];
}

interface SequenceStep {
  action: () => void | Promise<void>;
  duration?: number;
}

export function useAnimationSequence(steps: SequenceStep[]) {
  const currentStepRef = useRef(0);
  const stepStartTimeRef = useRef<number | null>(null);
  const isPlayingRef = useRef(false);
  const [currentStep, setCurrentStep] = useState(0);

  const play = useCallback(() => {
    currentStepRef.current = 0;
    stepStartTimeRef.current = null;
    isPlayingRef.current = true;
    setCurrentStep(0);
  }, []);

  const stop = useCallback(() => {
    isPlayingRef.current = false;
  }, []);

  const reset = useCallback(() => {
    currentStepRef.current = 0;
    stepStartTimeRef.current = null;
    isPlayingRef.current = false;
    setCurrentStep(0);
  }, []);

  useFrame((state) => {
    if (!isPlayingRef.current || currentStepRef.current >= steps.length) {
      return;
    }

    const step = steps[currentStepRef.current];

    if (stepStartTimeRef.current === null) {
      stepStartTimeRef.current = state.clock.elapsedTime;
      step.action();
    }

    const elapsed = state.clock.elapsedTime - stepStartTimeRef.current;
    const stepDuration = step.duration || 0;

    if (elapsed >= stepDuration) {
      currentStepRef.current++;
      stepStartTimeRef.current = null;
      setCurrentStep(currentStepRef.current);

      if (currentStepRef.current >= steps.length) {
        isPlayingRef.current = false;
      }
    }
  });

  return {
    play,
    stop,
    reset,
    currentStep,
    isPlaying: isPlayingRef.current,
    totalSteps: steps.length,
  };
}

interface FloatingAnimationProps {
  children: React.ReactNode;
  amplitude?: number;
  frequency?: number;
  phase?: number;
}

export function FloatingAnimation({
  children,
  amplitude = 0.05,
  frequency = 1,
  phase = 0,
}: FloatingAnimationProps) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      const y = Math.sin(state.clock.elapsedTime * frequency + phase) * amplitude;
      groupRef.current.position.y = y;
    }
  });

  return <group ref={groupRef}>{children}</group>;
}

interface PulseAnimationProps {
  children: React.ReactNode;
  minScale?: number;
  maxScale?: number;
  frequency?: number;
}

export function PulseAnimation({
  children,
  minScale = 0.95,
  maxScale = 1.05,
  frequency = 2,
}: PulseAnimationProps) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      const t = (Math.sin(state.clock.elapsedTime * frequency) + 1) / 2;
      const scale = THREE.MathUtils.lerp(minScale, maxScale, t);
      groupRef.current.scale.setScalar(scale);
    }
  });

  return <group ref={groupRef}>{children}</group>;
}

interface RotateAnimationProps {
  children: React.ReactNode;
  axis?: "x" | "y" | "z";
  speed?: number;
}

export function RotateAnimation({
  children,
  axis = "y",
  speed = 1,
}: RotateAnimationProps) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation[axis] += delta * speed;
    }
  });

  return <group ref={groupRef}>{children}</group>;
}

interface ShakeAnimationProps {
  children: React.ReactNode;
  intensity?: number;
  decay?: number;
  trigger?: boolean;
}

export function ShakeAnimation({
  children,
  intensity = 0.1,
  decay = 0.9,
  trigger = false,
}: ShakeAnimationProps) {
  const groupRef = useRef<THREE.Group>(null);
  const currentIntensityRef = useRef(0);

  useEffect(() => {
    if (trigger) {
      currentIntensityRef.current = intensity;
    }
  }, [trigger, intensity]);

  useFrame(() => {
    if (groupRef.current && currentIntensityRef.current > 0.001) {
      groupRef.current.position.x = (Math.random() - 0.5) * currentIntensityRef.current;
      groupRef.current.position.y = (Math.random() - 0.5) * currentIntensityRef.current;
      currentIntensityRef.current *= decay;
    } else if (groupRef.current) {
      groupRef.current.position.x = 0;
      groupRef.current.position.y = 0;
    }
  });

  return <group ref={groupRef}>{children}</group>;
}

interface DoorAnimationState {
  isOpen: boolean;
  angle: number;
}

export function useDoorAnimation(
  maxAngle: number = Math.PI / 2,
  speed: number = 5
): [DoorAnimationState, () => void, () => void] {
  const [state, setState] = useState<DoorAnimationState>({ isOpen: false, angle: 0 });
  const targetAngleRef = useRef(0);

  const open = useCallback(() => {
    targetAngleRef.current = maxAngle;
    setState((prev) => ({ ...prev, isOpen: true }));
  }, [maxAngle]);

  const close = useCallback(() => {
    targetAngleRef.current = 0;
    setState((prev) => ({ ...prev, isOpen: false }));
  }, []);

  useFrame((_, delta) => {
    const diff = targetAngleRef.current - state.angle;
    if (Math.abs(diff) > 0.001) {
      const newAngle = state.angle + diff * Math.min(speed * delta, 1);
      setState((prev) => ({ ...prev, angle: newAngle }));
    }
  });

  return [state, open, close];
}

export function useDrawerAnimation(
  maxDistance: number = 0.5,
  speed: number = 5
): [number, () => void, () => void] {
  const [distance, setDistance] = useState(0);
  const targetDistanceRef = useRef(0);
  const isOpenRef = useRef(false);

  const open = useCallback(() => {
    targetDistanceRef.current = maxDistance;
    isOpenRef.current = true;
  }, [maxDistance]);

  const close = useCallback(() => {
    targetDistanceRef.current = 0;
    isOpenRef.current = false;
  }, []);

  useFrame((_, delta) => {
    const diff = targetDistanceRef.current - distance;
    if (Math.abs(diff) > 0.001) {
      const newDistance = distance + diff * Math.min(speed * delta, 1);
      setDistance(newDistance);
    }
  });

  return [distance, open, close];
}

interface KnobRotationState {
  angle: number;
  normalizedValue: number;
}

export function useKnobRotation(
  minAngle: number = 0,
  maxAngle: number = (Math.PI * 3) / 2,
  speed: number = 3
): [KnobRotationState, (value: number) => void] {
  const [state, setState] = useState<KnobRotationState>({ angle: 0, normalizedValue: 0 });
  const targetNormalizedRef = useRef(0);

  const setNormalizedValue = useCallback((value: number) => {
    targetNormalizedRef.current = Math.max(0, Math.min(1, value));
  }, []);

  useFrame((_, delta) => {
    const targetAngle = THREE.MathUtils.lerp(minAngle, maxAngle, targetNormalizedRef.current);
    const diff = targetAngle - state.angle;
    
    if (Math.abs(diff) > 0.001) {
      const newAngle = state.angle + diff * Math.min(speed * delta, 1);
      const normalizedValue = (newAngle - minAngle) / (maxAngle - minAngle);
      setState({ angle: newAngle, normalizedValue });
    }
  });

  return [state, setNormalizedValue];
}

interface ScorePopupConfig {
  startPosition: THREE.Vector3;
  floatDistance: number;
  duration: number;
}

export function useScorePopupAnimation(
  config: ScorePopupConfig = {
    startPosition: new THREE.Vector3(0, 0, 0),
    floatDistance: 1,
    duration: 1.5,
  }
) {
  const [isActive, setIsActive] = useState(false);
  const [position, setPosition] = useState(config.startPosition.clone());
  const [scale, setScale] = useState(0);
  const [opacity, setOpacity] = useState(1);
  const progressRef = useRef(0);

  const trigger = useCallback((startPos?: THREE.Vector3) => {
    if (startPos) {
      config.startPosition.copy(startPos);
    }
    setPosition(config.startPosition.clone());
    setScale(0);
    setOpacity(1);
    progressRef.current = 0;
    setIsActive(true);
  }, [config]);

  useFrame((_, delta) => {
    if (!isActive) return;

    progressRef.current += delta / config.duration;

    if (progressRef.current >= 1) {
      setIsActive(false);
      return;
    }

    const bounceProgress = Easing.easeOutElastic(Math.min(progressRef.current * 2, 1));
    setScale(bounceProgress);

    const floatProgress = Easing.easeOutCubic(progressRef.current);
    setPosition(
      new THREE.Vector3(
        config.startPosition.x,
        config.startPosition.y + config.floatDistance * floatProgress,
        config.startPosition.z
      )
    );

    if (progressRef.current > 0.6) {
      const fadeProgress = (progressRef.current - 0.6) / 0.4;
      setOpacity(1 - fadeProgress);
    }
  });

  return { isActive, position, scale, opacity, trigger };
}
