import { Suspense, useCallback, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { useCookingGame } from "@/lib/stores/useCookingGame";
import { Kitchen } from "./components/Kitchen";
import { Lighting } from "./components/Lighting";
import { CameraController } from "./components/CameraController";
import { ChoppingGame } from "./components/minigames/ChoppingGame";
import { StirringGame } from "./components/minigames/StirringGame";
import { HeatControlGame } from "./components/minigames/HeatControlGame";
import { MainMenu } from "./components/ui/MainMenu";
import { RecipeSelect } from "./components/ui/RecipeSelect";
import { CookingHUD } from "./components/ui/CookingHUD";
import { RecipeComplete } from "./components/ui/RecipeComplete";

export function Game() {
  const phase = useCookingGame(state => state.phase);
  const currentMiniGame = useCookingGame(state => state.currentMiniGame);
  const completeMiniGameAndAdvance = useCookingGame(state => state.completeMiniGameAndAdvance);

  useEffect(() => {
    console.log("[Game] Phase changed:", phase, "Mini-game:", currentMiniGame);
  }, [phase, currentMiniGame]);

  const handleMiniGameComplete = useCallback((score: number) => {
    console.log("[Game] Mini-game complete with score:", score);
    completeMiniGameAndAdvance(score);
  }, [completeMiniGameAndAdvance]);

  const showCanvas = phase === "cooking" || phase === "mini_game";

  return (
    <div className="w-full h-full relative">
      {phase === "menu" && <MainMenu />}
      {phase === "recipe_select" && <RecipeSelect />}
      {phase === "recipe_complete" && <RecipeComplete />}
      
      {showCanvas && (
        <>
          <Canvas
            shadows
            camera={{
              position: [0, 5, 8],
              fov: 50,
              near: 0.1,
              far: 100
            }}
            gl={{
              antialias: true,
              powerPreference: "default"
            }}
          >
            <color attach="background" args={["#f5f0e8"]} />
            
            <Suspense fallback={null}>
              <Lighting />
              <Kitchen />
              <CameraController />
              
              {currentMiniGame === "chopping" && (
                <ChoppingGame onComplete={handleMiniGameComplete} />
              )}
              {currentMiniGame === "stirring" && (
                <StirringGame onComplete={handleMiniGameComplete} />
              )}
              {currentMiniGame === "heat_control" && (
                <HeatControlGame onComplete={handleMiniGameComplete} />
              )}
            </Suspense>
          </Canvas>
          
          <CookingHUD />
        </>
      )}
    </div>
  );
}
