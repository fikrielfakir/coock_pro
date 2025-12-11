import { useCookingGame } from "@/lib/stores/useCookingGame";
import {
  SteamParticles,
  FireParticles,
  SmokeParticles,
  BubbleParticles,
} from "./particles/ParticleSystem";

export function KitchenParticles() {
  const temperature = useCookingGame((state) => state.temperature);
  const currentMiniGame = useCookingGame((state) => state.currentMiniGame);

  const normalizedTemp = temperature / 100;
  const isHeating = temperature > 30;
  const isSimmering = temperature > 50 && temperature < 80;
  const isBoiling = temperature > 80;
  const isBurning = temperature > 95;

  return (
    <group>
      {isHeating && (
        <FireParticles
          position={[-0.6, 1.15, -3]}
          active={true}
          intensity={normalizedTemp * 0.8}
        />
      )}
      {isHeating && (
        <FireParticles
          position={[0.6, 1.15, -3]}
          active={true}
          intensity={normalizedTemp * 0.6}
        />
      )}

      {isSimmering && (
        <SteamParticles
          position={[0, 1.3, -3]}
          active={true}
          intensity={normalizedTemp * 0.5}
        />
      )}

      {isBoiling && (
        <BubbleParticles
          position={[0, 1.2, -3]}
          active={true}
          intensity={(temperature - 80) / 20}
        />
      )}

      {isBoiling && (
        <SteamParticles
          position={[0, 1.35, -3]}
          active={true}
          intensity={normalizedTemp}
        />
      )}

      {isBurning && (
        <SmokeParticles
          position={[0, 1.5, -3]}
          active={true}
          intensity={(temperature - 95) / 5}
        />
      )}

      {currentMiniGame === "stirring" && isSimmering && (
        <SteamParticles
          position={[0, 1.4, -3]}
          active={true}
          intensity={0.3}
        />
      )}
    </group>
  );
}
