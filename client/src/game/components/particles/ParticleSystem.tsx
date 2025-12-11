import { useRef, useMemo, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useGraphicsSettings } from "@/lib/stores/useGraphicsSettings";

interface Particle {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  life: number;
  maxLife: number;
  size: number;
  color: THREE.Color;
  rotation: number;
  rotationSpeed: number;
}

interface SteamParticlesProps {
  position: [number, number, number];
  active?: boolean;
  intensity?: number;
}

export function SteamParticles({
  position,
  active = true,
  intensity = 1,
}: SteamParticlesProps) {
  const particleQuality = useGraphicsSettings((state) => state.particleQuality);
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const particlesRef = useRef<Particle[]>([]);

  const maxParticles = useMemo(() => {
    switch (particleQuality) {
      case "low":
        return 15;
      case "medium":
        return 30;
      case "high":
        return 50;
    }
  }, [particleQuality]);

  const spawnRate = useMemo(() => {
    return (maxParticles / 3) * intensity;
  }, [maxParticles, intensity]);

  useEffect(() => {
    particlesRef.current = [];
  }, [maxParticles]);

  useFrame((state, delta) => {
    if (!meshRef.current || !active) return;

    if (Math.random() < spawnRate * delta && particlesRef.current.length < maxParticles) {
      const spread = 0.1;
      particlesRef.current.push({
        position: new THREE.Vector3(
          position[0] + (Math.random() - 0.5) * spread,
          position[1],
          position[2] + (Math.random() - 0.5) * spread
        ),
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 0.2,
          0.3 + Math.random() * 0.2,
          (Math.random() - 0.5) * 0.2
        ),
        life: 0,
        maxLife: 2 + Math.random() * 1.5,
        size: 0.05 + Math.random() * 0.08,
        color: new THREE.Color(0xffffff),
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 2,
      });
    }

    const dummy = new THREE.Object3D();
    let visibleCount = 0;

    for (let i = particlesRef.current.length - 1; i >= 0; i--) {
      const particle = particlesRef.current[i];
      particle.life += delta;

      if (particle.life >= particle.maxLife) {
        particlesRef.current.splice(i, 1);
        continue;
      }

      const lifeRatio = particle.life / particle.maxLife;

      particle.velocity.x += (Math.random() - 0.5) * delta * 0.5;
      particle.velocity.z += (Math.random() - 0.5) * delta * 0.5;
      particle.velocity.y *= 0.99;

      particle.position.add(
        particle.velocity.clone().multiplyScalar(delta)
      );
      particle.rotation += particle.rotationSpeed * delta;

      const scale = particle.size * (1 + lifeRatio * 2) * (1 - lifeRatio * 0.3);

      dummy.position.copy(particle.position);
      dummy.rotation.z = particle.rotation;
      dummy.scale.setScalar(scale);
      dummy.updateMatrix();

      meshRef.current.setMatrixAt(visibleCount, dummy.matrix);

      const alpha = 1 - lifeRatio;
      meshRef.current.setColorAt(
        visibleCount,
        new THREE.Color(1, 1, 1).multiplyScalar(alpha)
      );

      visibleCount++;
    }

    for (let i = visibleCount; i < maxParticles; i++) {
      dummy.position.set(0, -1000, 0);
      dummy.scale.setScalar(0);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }

    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) {
      meshRef.current.instanceColor.needsUpdate = true;
    }
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, maxParticles]}>
      <sphereGeometry args={[0.5, 8, 8]} />
      <meshStandardMaterial
        color="#ffffff"
        transparent
        opacity={0.4}
        depthWrite={false}
      />
    </instancedMesh>
  );
}

interface FireParticlesProps {
  position: [number, number, number];
  active?: boolean;
  intensity?: number;
}

export function FireParticles({
  position,
  active = true,
  intensity = 1,
}: FireParticlesProps) {
  const particleQuality = useGraphicsSettings((state) => state.particleQuality);
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const particlesRef = useRef<Particle[]>([]);

  const maxParticles = useMemo(() => {
    switch (particleQuality) {
      case "low":
        return 20;
      case "medium":
        return 40;
      case "high":
        return 60;
    }
  }, [particleQuality]);

  useFrame((state, delta) => {
    if (!meshRef.current || !active) return;

    const spawnCount = Math.floor(intensity * maxParticles * delta * 8);
    for (let s = 0; s < spawnCount && particlesRef.current.length < maxParticles; s++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.random() * 0.15;
      particlesRef.current.push({
        position: new THREE.Vector3(
          position[0] + Math.cos(angle) * radius,
          position[1],
          position[2] + Math.sin(angle) * radius
        ),
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 0.1,
          0.8 + Math.random() * 0.4,
          (Math.random() - 0.5) * 0.1
        ),
        life: 0,
        maxLife: 0.3 + Math.random() * 0.4,
        size: 0.03 + Math.random() * 0.04,
        color: new THREE.Color().setHSL(
          0.05 + Math.random() * 0.05,
          1,
          0.5 + Math.random() * 0.3
        ),
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 5,
      });
    }

    const dummy = new THREE.Object3D();
    let visibleCount = 0;

    for (let i = particlesRef.current.length - 1; i >= 0; i--) {
      const particle = particlesRef.current[i];
      particle.life += delta;

      if (particle.life >= particle.maxLife) {
        particlesRef.current.splice(i, 1);
        continue;
      }

      const lifeRatio = particle.life / particle.maxLife;

      particle.velocity.x += (Math.random() - 0.5) * delta * 0.8;
      particle.velocity.z += (Math.random() - 0.5) * delta * 0.8;

      particle.position.add(
        particle.velocity.clone().multiplyScalar(delta)
      );

      const scale = particle.size * (1 - lifeRatio * 0.6);

      dummy.position.copy(particle.position);
      dummy.scale.setScalar(scale);
      dummy.updateMatrix();

      meshRef.current.setMatrixAt(visibleCount, dummy.matrix);

      const hue = 0.1 * (1 - lifeRatio);
      meshRef.current.setColorAt(
        visibleCount,
        new THREE.Color().setHSL(hue, 1, 0.5 + lifeRatio * 0.3)
      );

      visibleCount++;
    }

    for (let i = visibleCount; i < maxParticles; i++) {
      dummy.position.set(0, -1000, 0);
      dummy.scale.setScalar(0);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }

    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) {
      meshRef.current.instanceColor.needsUpdate = true;
    }
  });

  if (!active || intensity <= 0) return null;

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, maxParticles]}>
      <sphereGeometry args={[0.5, 6, 6]} />
      <meshBasicMaterial
        color="#ff6600"
        transparent
        opacity={0.9}
        depthWrite={false}
      />
    </instancedMesh>
  );
}

interface SmokeParticlesProps {
  position: [number, number, number];
  active?: boolean;
  intensity?: number;
}

export function SmokeParticles({
  position,
  active = true,
  intensity = 1,
}: SmokeParticlesProps) {
  const particleQuality = useGraphicsSettings((state) => state.particleQuality);
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const particlesRef = useRef<Particle[]>([]);

  const maxParticles = useMemo(() => {
    switch (particleQuality) {
      case "low":
        return 10;
      case "medium":
        return 20;
      case "high":
        return 35;
    }
  }, [particleQuality]);

  useFrame((state, delta) => {
    if (!meshRef.current || !active) return;

    if (Math.random() < intensity * 5 * delta && particlesRef.current.length < maxParticles) {
      particlesRef.current.push({
        position: new THREE.Vector3(
          position[0] + (Math.random() - 0.5) * 0.1,
          position[1],
          position[2] + (Math.random() - 0.5) * 0.1
        ),
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 0.15,
          0.2 + Math.random() * 0.1,
          (Math.random() - 0.5) * 0.15
        ),
        life: 0,
        maxLife: 3 + Math.random() * 2,
        size: 0.08 + Math.random() * 0.1,
        color: new THREE.Color(0.3, 0.3, 0.3),
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.5,
      });
    }

    const dummy = new THREE.Object3D();
    let visibleCount = 0;

    for (let i = particlesRef.current.length - 1; i >= 0; i--) {
      const particle = particlesRef.current[i];
      particle.life += delta;

      if (particle.life >= particle.maxLife) {
        particlesRef.current.splice(i, 1);
        continue;
      }

      const lifeRatio = particle.life / particle.maxLife;

      particle.velocity.x += (Math.random() - 0.5) * delta * 0.2;
      particle.velocity.z += (Math.random() - 0.5) * delta * 0.2;
      particle.velocity.y *= 0.995;

      particle.position.add(
        particle.velocity.clone().multiplyScalar(delta)
      );
      particle.rotation += particle.rotationSpeed * delta;

      const scale = particle.size * (1 + lifeRatio * 3);

      dummy.position.copy(particle.position);
      dummy.rotation.z = particle.rotation;
      dummy.scale.setScalar(scale);
      dummy.updateMatrix();

      meshRef.current.setMatrixAt(visibleCount, dummy.matrix);

      const gray = 0.2 + lifeRatio * 0.3;
      meshRef.current.setColorAt(
        visibleCount,
        new THREE.Color(gray, gray, gray)
      );

      visibleCount++;
    }

    for (let i = visibleCount; i < maxParticles; i++) {
      dummy.position.set(0, -1000, 0);
      dummy.scale.setScalar(0);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }

    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) {
      meshRef.current.instanceColor.needsUpdate = true;
    }
  });

  if (!active) return null;

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, maxParticles]}>
      <sphereGeometry args={[0.5, 8, 8]} />
      <meshStandardMaterial
        color="#444444"
        transparent
        opacity={0.3}
        depthWrite={false}
      />
    </instancedMesh>
  );
}

interface BubbleParticlesProps {
  position: [number, number, number];
  active?: boolean;
  intensity?: number;
}

export function BubbleParticles({
  position,
  active = true,
  intensity = 1,
}: BubbleParticlesProps) {
  const particleQuality = useGraphicsSettings((state) => state.particleQuality);
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const particlesRef = useRef<Particle[]>([]);

  const maxParticles = useMemo(() => {
    switch (particleQuality) {
      case "low":
        return 15;
      case "medium":
        return 30;
      case "high":
        return 50;
    }
  }, [particleQuality]);

  useFrame((state, delta) => {
    if (!meshRef.current || !active) return;

    if (Math.random() < intensity * 12 * delta && particlesRef.current.length < maxParticles) {
      particlesRef.current.push({
        position: new THREE.Vector3(
          position[0] + (Math.random() - 0.5) * 0.3,
          position[1] + (Math.random() - 0.5) * 0.05,
          position[2] + (Math.random() - 0.5) * 0.3
        ),
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 0.1,
          0.4 + Math.random() * 0.3,
          (Math.random() - 0.5) * 0.1
        ),
        life: 0,
        maxLife: 0.5 + Math.random() * 0.5,
        size: 0.01 + Math.random() * 0.02,
        color: new THREE.Color(1, 1, 1),
        rotation: 0,
        rotationSpeed: 0,
      });
    }

    const dummy = new THREE.Object3D();
    let visibleCount = 0;

    for (let i = particlesRef.current.length - 1; i >= 0; i--) {
      const particle = particlesRef.current[i];
      particle.life += delta;

      if (particle.life >= particle.maxLife) {
        particlesRef.current.splice(i, 1);
        continue;
      }

      particle.velocity.x += (Math.random() - 0.5) * delta * 0.3;
      particle.velocity.z += (Math.random() - 0.5) * delta * 0.3;

      particle.position.add(
        particle.velocity.clone().multiplyScalar(delta)
      );

      dummy.position.copy(particle.position);
      dummy.scale.setScalar(particle.size);
      dummy.updateMatrix();

      meshRef.current.setMatrixAt(visibleCount, dummy.matrix);
      meshRef.current.setColorAt(visibleCount, new THREE.Color(0.8, 0.9, 1));

      visibleCount++;
    }

    for (let i = visibleCount; i < maxParticles; i++) {
      dummy.position.set(0, -1000, 0);
      dummy.scale.setScalar(0);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }

    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) {
      meshRef.current.instanceColor.needsUpdate = true;
    }
  });

  if (!active) return null;

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, maxParticles]}>
      <sphereGeometry args={[0.5, 8, 8]} />
      <meshPhysicalMaterial
        color="#ccddff"
        transparent
        opacity={0.6}
        transmission={0.3}
        roughness={0}
        metalness={0.1}
        depthWrite={false}
      />
    </instancedMesh>
  );
}

interface SparkleParticlesProps {
  position: [number, number, number];
  active?: boolean;
  color?: string;
}

export function SparkleParticles({
  position,
  active = false,
  color = "#ffd700",
}: SparkleParticlesProps) {
  const particleQuality = useGraphicsSettings((state) => state.particleQuality);
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const particlesRef = useRef<Particle[]>([]);
  const burstTriggered = useRef(false);

  const maxParticles = useMemo(() => {
    switch (particleQuality) {
      case "low":
        return 20;
      case "medium":
        return 40;
      case "high":
        return 60;
    }
  }, [particleQuality]);

  useEffect(() => {
    if (active && !burstTriggered.current) {
      burstTriggered.current = true;
      for (let i = 0; i < maxParticles; i++) {
        const angle = Math.random() * Math.PI * 2;
        const elevation = (Math.random() - 0.5) * Math.PI;
        const speed = 1 + Math.random() * 2;
        particlesRef.current.push({
          position: new THREE.Vector3(position[0], position[1], position[2]),
          velocity: new THREE.Vector3(
            Math.cos(angle) * Math.cos(elevation) * speed,
            Math.sin(elevation) * speed + 1,
            Math.sin(angle) * Math.cos(elevation) * speed
          ),
          life: 0,
          maxLife: 1 + Math.random() * 0.5,
          size: 0.02 + Math.random() * 0.03,
          color: new THREE.Color(color),
          rotation: Math.random() * Math.PI * 2,
          rotationSpeed: (Math.random() - 0.5) * 10,
        });
      }
    }
    if (!active) {
      burstTriggered.current = false;
    }
  }, [active, position, maxParticles, color]);

  useFrame((state, delta) => {
    if (!meshRef.current) return;

    const dummy = new THREE.Object3D();
    let visibleCount = 0;

    for (let i = particlesRef.current.length - 1; i >= 0; i--) {
      const particle = particlesRef.current[i];
      particle.life += delta;

      if (particle.life >= particle.maxLife) {
        particlesRef.current.splice(i, 1);
        continue;
      }

      const lifeRatio = particle.life / particle.maxLife;

      particle.velocity.y -= 3 * delta;
      particle.position.add(
        particle.velocity.clone().multiplyScalar(delta)
      );
      particle.rotation += particle.rotationSpeed * delta;

      const twinkle = 0.7 + Math.sin(state.clock.elapsedTime * 20 + i) * 0.3;
      const scale = particle.size * twinkle * (1 - lifeRatio * 0.5);

      dummy.position.copy(particle.position);
      dummy.rotation.set(particle.rotation, particle.rotation * 0.5, 0);
      dummy.scale.setScalar(scale);
      dummy.updateMatrix();

      meshRef.current.setMatrixAt(visibleCount, dummy.matrix);
      meshRef.current.setColorAt(
        visibleCount,
        particle.color.clone().multiplyScalar(1 - lifeRatio * 0.5)
      );

      visibleCount++;
    }

    for (let i = visibleCount; i < maxParticles; i++) {
      dummy.position.set(0, -1000, 0);
      dummy.scale.setScalar(0);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }

    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) {
      meshRef.current.instanceColor.needsUpdate = true;
    }
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, maxParticles]}>
      <octahedronGeometry args={[0.5, 0]} />
      <meshBasicMaterial color={color} transparent opacity={0.9} />
    </instancedMesh>
  );
}

interface ChoppingDebrisProps {
  position: [number, number, number];
  active?: boolean;
  color?: string;
}

export function ChoppingDebris({
  position,
  active = false,
  color = "#ff6347",
}: ChoppingDebrisProps) {
  const particleQuality = useGraphicsSettings((state) => state.particleQuality);
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const particlesRef = useRef<Particle[]>([]);
  const lastActive = useRef(false);

  const maxParticles = useMemo(() => {
    switch (particleQuality) {
      case "low":
        return 8;
      case "medium":
        return 15;
      case "high":
        return 25;
    }
  }, [particleQuality]);

  useEffect(() => {
    if (active && !lastActive.current) {
      const count = Math.floor(maxParticles * 0.5);
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 0.5 + Math.random() * 1;
        particlesRef.current.push({
          position: new THREE.Vector3(position[0], position[1], position[2]),
          velocity: new THREE.Vector3(
            Math.cos(angle) * speed,
            1 + Math.random() * 0.5,
            Math.sin(angle) * speed
          ),
          life: 0,
          maxLife: 0.8 + Math.random() * 0.4,
          size: 0.01 + Math.random() * 0.015,
          color: new THREE.Color(color).offsetHSL(
            (Math.random() - 0.5) * 0.1,
            (Math.random() - 0.5) * 0.2,
            (Math.random() - 0.5) * 0.2
          ),
          rotation: Math.random() * Math.PI * 2,
          rotationSpeed: (Math.random() - 0.5) * 15,
        });
      }
    }
    lastActive.current = active;
  }, [active, position, maxParticles, color]);

  useFrame((state, delta) => {
    if (!meshRef.current) return;

    const dummy = new THREE.Object3D();
    let visibleCount = 0;

    for (let i = particlesRef.current.length - 1; i >= 0; i--) {
      const particle = particlesRef.current[i];
      particle.life += delta;

      if (particle.life >= particle.maxLife) {
        particlesRef.current.splice(i, 1);
        continue;
      }

      particle.velocity.y -= 5 * delta;
      particle.position.add(
        particle.velocity.clone().multiplyScalar(delta)
      );
      particle.rotation += particle.rotationSpeed * delta;

      if (particle.position.y < position[1] - 0.1) {
        particle.position.y = position[1] - 0.1;
        particle.velocity.y = 0;
        particle.velocity.x *= 0.5;
        particle.velocity.z *= 0.5;
      }

      dummy.position.copy(particle.position);
      dummy.rotation.set(particle.rotation, particle.rotation * 0.7, particle.rotation * 0.5);
      dummy.scale.setScalar(particle.size);
      dummy.updateMatrix();

      meshRef.current.setMatrixAt(visibleCount, dummy.matrix);
      meshRef.current.setColorAt(visibleCount, particle.color);

      visibleCount++;
    }

    for (let i = visibleCount; i < maxParticles; i++) {
      dummy.position.set(0, -1000, 0);
      dummy.scale.setScalar(0);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }

    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) {
      meshRef.current.instanceColor.needsUpdate = true;
    }
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, maxParticles]}>
      <boxGeometry args={[1, 0.3, 1]} />
      <meshStandardMaterial color={color} roughness={0.7} />
    </instancedMesh>
  );
}

interface ConfettiParticlesProps {
  position: [number, number, number];
  active?: boolean;
}

export function ConfettiParticles({
  position,
  active = false,
}: ConfettiParticlesProps) {
  const particleQuality = useGraphicsSettings((state) => state.particleQuality);
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const particlesRef = useRef<Particle[]>([]);
  const burstTriggered = useRef(false);

  const maxParticles = useMemo(() => {
    switch (particleQuality) {
      case "low":
        return 30;
      case "medium":
        return 60;
      case "high":
        return 100;
    }
  }, [particleQuality]);

  const confettiColors = useMemo(
    () => [
      new THREE.Color("#ff6b6b"),
      new THREE.Color("#4ecdc4"),
      new THREE.Color("#ffe66d"),
      new THREE.Color("#95e1d3"),
      new THREE.Color("#f38181"),
      new THREE.Color("#a8e6cf"),
      new THREE.Color("#dcedc1"),
      new THREE.Color("#ffd3b6"),
    ],
    []
  );

  useEffect(() => {
    if (active && !burstTriggered.current) {
      burstTriggered.current = true;
      for (let i = 0; i < maxParticles; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 2 + Math.random() * 3;
        particlesRef.current.push({
          position: new THREE.Vector3(position[0], position[1], position[2]),
          velocity: new THREE.Vector3(
            Math.cos(angle) * speed * 0.5,
            3 + Math.random() * 2,
            Math.sin(angle) * speed * 0.5
          ),
          life: 0,
          maxLife: 3 + Math.random() * 2,
          size: 0.03 + Math.random() * 0.03,
          color: confettiColors[Math.floor(Math.random() * confettiColors.length)],
          rotation: Math.random() * Math.PI * 2,
          rotationSpeed: (Math.random() - 0.5) * 10,
        });
      }
    }
    if (!active) {
      burstTriggered.current = false;
    }
  }, [active, position, maxParticles, confettiColors]);

  useFrame((state, delta) => {
    if (!meshRef.current) return;

    const dummy = new THREE.Object3D();
    let visibleCount = 0;

    for (let i = particlesRef.current.length - 1; i >= 0; i--) {
      const particle = particlesRef.current[i];
      particle.life += delta;

      if (particle.life >= particle.maxLife) {
        particlesRef.current.splice(i, 1);
        continue;
      }

      particle.velocity.y -= 2 * delta;
      particle.velocity.x += Math.sin(state.clock.elapsedTime * 3 + i) * 0.1 * delta;
      particle.position.add(
        particle.velocity.clone().multiplyScalar(delta)
      );
      particle.rotation += particle.rotationSpeed * delta;

      dummy.position.copy(particle.position);
      dummy.rotation.set(particle.rotation, particle.rotation * 0.8, particle.rotation * 0.6);
      dummy.scale.set(particle.size, particle.size * 0.3, particle.size);
      dummy.updateMatrix();

      meshRef.current.setMatrixAt(visibleCount, dummy.matrix);
      meshRef.current.setColorAt(visibleCount, particle.color);

      visibleCount++;
    }

    for (let i = visibleCount; i < maxParticles; i++) {
      dummy.position.set(0, -1000, 0);
      dummy.scale.setScalar(0);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }

    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) {
      meshRef.current.instanceColor.needsUpdate = true;
    }
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, maxParticles]}>
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial color="#ffffff" side={THREE.DoubleSide} transparent opacity={0.95} />
    </instancedMesh>
  );
}
