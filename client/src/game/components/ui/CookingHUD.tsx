import { useCookingGame } from "@/lib/stores/useCookingGame";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Pause, Play, X, ChefHat } from "lucide-react";

export function CookingHUD() {
  const currentRecipe = useCookingGame(state => state.currentRecipe);
  const currentStepIndex = useCookingGame(state => state.currentStepIndex);
  const currentMiniGame = useCookingGame(state => state.currentMiniGame);
  const totalScore = useCookingGame(state => state.totalScore);
  const temperature = useCookingGame(state => state.temperature);
  const mixingProgress = useCookingGame(state => state.mixingProgress);
  const choppingScore = useCookingGame(state => state.choppingScore);
  const isPaused = useCookingGame(state => state.isPaused);
  const togglePause = useCookingGame(state => state.togglePause);
  const resetGame = useCookingGame(state => state.resetGame);

  if (!currentRecipe) return null;

  const currentStep = currentRecipe.steps[currentStepIndex];
  const progress = ((currentStepIndex) / currentRecipe.steps.length) * 100;

  return (
    <div className="absolute inset-0 pointer-events-none z-40">
      <div className="absolute top-4 left-4 right-4 flex justify-between items-start pointer-events-auto">
        <Card className="p-4 bg-white/90 backdrop-blur border-orange-200 max-w-md">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center">
              <ChefHat className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-orange-800">{currentRecipe.name}</h2>
              <p className="text-sm text-orange-600">
                Step {currentStepIndex + 1} of {currentRecipe.steps.length}
              </p>
            </div>
          </div>
          
          <Progress value={progress} className="h-2 mb-3" />
          
          {currentStep && (
            <div className="space-y-2">
              <h3 className="font-semibold text-orange-700">{currentStep.title}</h3>
              <p className="text-sm text-gray-600">{currentStep.instruction}</p>
              
              {currentMiniGame && (
                <Badge className="bg-orange-500">
                  {currentMiniGame === "chopping" && "Chopping Mode"}
                  {currentMiniGame === "stirring" && "Stirring Mode"}
                  {currentMiniGame === "heat_control" && "Heat Control"}
                </Badge>
              )}
            </div>
          )}
        </Card>
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="icon"
            onClick={togglePause}
            className="bg-white/90 border-orange-200"
          >
            {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
          </Button>
          <Button 
            variant="outline" 
            size="icon"
            onClick={resetGame}
            className="bg-white/90 border-orange-200 text-red-500 hover:text-red-600"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>
      
      <div className="absolute bottom-4 left-4 right-4 flex justify-between pointer-events-auto">
        <Card className="p-3 bg-white/90 backdrop-blur border-orange-200">
          <div className="flex items-center gap-4">
            <div className="text-center">
              <p className="text-xs text-orange-600">Score</p>
              <p className="text-2xl font-bold text-orange-800">{totalScore}</p>
            </div>
          </div>
        </Card>
        
        {currentMiniGame && (
          <Card className="p-3 bg-white/90 backdrop-blur border-orange-200">
            <div className="flex items-center gap-4">
              {currentMiniGame === "chopping" && (
                <div className="text-center">
                  <p className="text-xs text-orange-600">Cuts</p>
                  <p className="text-xl font-bold text-orange-800">{choppingScore / 10}</p>
                </div>
              )}
              
              {currentMiniGame === "stirring" && (
                <div className="w-32">
                  <p className="text-xs text-orange-600 mb-1">Mixing Progress</p>
                  <Progress value={mixingProgress} className="h-3" />
                </div>
              )}
              
              {currentMiniGame === "heat_control" && (
                <div className="text-center">
                  <p className="text-xs text-orange-600">Temperature</p>
                  <p className={`text-xl font-bold ${
                    temperature > 85 ? "text-red-600" : 
                    temperature > 55 && temperature < 85 ? "text-green-600" : 
                    "text-orange-800"
                  }`}>
                    {Math.round(temperature)}°
                  </p>
                </div>
              )}
            </div>
          </Card>
        )}
        
        <MiniGameInstructions miniGame={currentMiniGame} />
      </div>
    </div>
  );
}

function MiniGameInstructions({ miniGame }: { miniGame: string | null }) {
  if (!miniGame) return null;

  const instructions: Record<string, string> = {
    chopping: "Click or press Space to chop",
    stirring: "Move mouse in circles to stir",
    heat_control: "Use Up/Down arrows or drag to adjust heat"
  };

  return (
    <Card className="p-3 bg-white/90 backdrop-blur border-orange-200">
      <p className="text-sm text-orange-700">{instructions[miniGame]}</p>
    </Card>
  );
}
