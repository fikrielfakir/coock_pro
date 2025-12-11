import { useState, useEffect } from "react";
import { useCookingGame } from "@/lib/stores/useCookingGame";
import { fullRecipes } from "@/game/data/recipesData";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Pause, Play, X, ChefHat, Clock, Lightbulb, 
  CheckCircle2, Circle, ArrowRight, Timer
} from "lucide-react";

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
  const timeRemaining = useCookingGame(state => state.timeRemaining);

  const [showTip, setShowTip] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);

  const fullRecipeData = currentRecipe ? fullRecipes.find(r => r.id === currentRecipe.id) : null;
  const fullStep = fullRecipeData?.steps[currentStepIndex];

  useEffect(() => {
    if (!isPaused) {
      const interval = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isPaused]);

  useEffect(() => {
    setElapsedTime(0);
  }, [currentStepIndex]);

  if (!currentRecipe) return null;

  const currentStep = currentRecipe.steps[currentStepIndex];
  const progress = ((currentStepIndex) / currentRecipe.steps.length) * 100;
  const completedSteps = currentRecipe.steps.filter(s => s.completed).length;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimerColor = () => {
    if (!currentStep) return "text-green-600";
    const targetTime = currentStep.duration;
    if (elapsedTime <= targetTime * 0.7) return "text-green-600";
    if (elapsedTime <= targetTime) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="absolute inset-0 pointer-events-none z-40">
      <div className="absolute top-4 left-4 right-4 flex gap-4 pointer-events-auto">
        <Card className="flex-1 p-4 bg-white/95 backdrop-blur border-orange-200 max-w-lg">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
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
            
            <div className="flex items-center gap-4">
              <div className={`flex items-center gap-1 ${getTimerColor()}`}>
                <Timer className="w-4 h-4" />
                <span className="font-mono font-bold">{formatTime(elapsedTime)}</span>
              </div>
              <div className="flex gap-1">
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={togglePause}
                  className="bg-white/90 border-orange-200 h-8 w-8"
                >
                  {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                </Button>
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={resetGame}
                  className="bg-white/90 border-orange-200 text-red-500 hover:text-red-600 h-8 w-8"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
          
          <Progress value={progress} className="h-2 mb-3" />
          
          {currentStep && (
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <h3 className="font-semibold text-orange-700 text-lg">{currentStep.title}</h3>
                  <p className="text-sm text-gray-600">{currentStep.instruction}</p>
                  {fullStep?.detailedInstruction && (
                    <p className="text-xs text-gray-500 mt-1">{fullStep.detailedInstruction}</p>
                  )}
                </div>
                
                {fullStep?.tips && fullStep.tips.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowTip(!showTip)}
                    className="text-amber-600 hover:text-amber-700"
                  >
                    <Lightbulb className="w-4 h-4" />
                  </Button>
                )}
              </div>
              
              {showTip && fullStep?.tips && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                  <p className="text-xs text-amber-800 flex items-start gap-2">
                    <Lightbulb className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    {fullStep.tips[0]}
                  </p>
                </div>
              )}
              
              <div className="flex items-center gap-2 flex-wrap">
                {currentMiniGame && (
                  <Badge className="bg-orange-500">
                    {currentMiniGame === "chopping" && "Chopping Mode"}
                    {currentMiniGame === "stirring" && "Stirring Mode"}
                    {currentMiniGame === "heat_control" && "Heat Control"}
                    {currentMiniGame === "measuring" && "Measuring Mode"}
                    {currentMiniGame === "plating" && "Plating Mode"}
                  </Badge>
                )}
                
                {fullStep?.tools && fullStep.tools.length > 0 && (
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-gray-500">Tools:</span>
                    {fullStep.tools.slice(0, 3).map(tool => (
                      <Badge key={tool} variant="outline" className="text-xs capitalize border-gray-300">
                        {tool.replace('_', ' ')}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </Card>
        
        <Card className="p-3 bg-white/95 backdrop-blur border-orange-200 w-48">
          <h4 className="text-xs font-semibold text-orange-700 mb-2">Step Progress</h4>
          <div className="space-y-1">
            {currentRecipe.steps.map((step, index) => (
              <div 
                key={step.id} 
                className={`flex items-center gap-2 text-xs ${
                  index === currentStepIndex ? 'text-orange-700 font-medium' : 
                  step.completed ? 'text-green-600' : 'text-gray-400'
                }`}
              >
                {step.completed ? (
                  <CheckCircle2 className="w-3 h-3 text-green-500" />
                ) : index === currentStepIndex ? (
                  <ArrowRight className="w-3 h-3 text-orange-500" />
                ) : (
                  <Circle className="w-3 h-3" />
                )}
                <span className="truncate">{step.title}</span>
                {step.completed && step.score > 0 && (
                  <span className="ml-auto text-green-600">{step.score}</span>
                )}
              </div>
            ))}
          </div>
        </Card>
      </div>
      
      <div className="absolute bottom-4 left-4 right-4 flex justify-between pointer-events-auto">
        <Card className="p-3 bg-white/95 backdrop-blur border-orange-200">
          <div className="flex items-center gap-6">
            <div className="text-center">
              <p className="text-xs text-orange-600">Total Score</p>
              <p className="text-2xl font-bold text-orange-800">{totalScore}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-orange-600">Steps Done</p>
              <p className="text-xl font-bold text-green-600">{completedSteps}/{currentRecipe.steps.length}</p>
            </div>
            {fullRecipeData && (
              <div className="text-center">
                <p className="text-xs text-orange-600">XP Reward</p>
                <p className="text-lg font-bold text-purple-600">+{fullRecipeData.rewards.baseXP}</p>
              </div>
            )}
          </div>
        </Card>
        
        {currentMiniGame && (
          <Card className="p-3 bg-white/95 backdrop-blur border-orange-200">
            <div className="flex items-center gap-4">
              {currentMiniGame === "chopping" && (
                <div className="text-center">
                  <p className="text-xs text-orange-600">Cuts Made</p>
                  <p className="text-xl font-bold text-orange-800">{Math.floor(choppingScore / 10)}</p>
                </div>
              )}
              
              {currentMiniGame === "stirring" && (
                <div className="w-32">
                  <p className="text-xs text-orange-600 mb-1">Mixing Progress</p>
                  <Progress value={mixingProgress} className="h-3" />
                  <p className="text-xs text-center mt-1 font-mono">{Math.round(mixingProgress)}%</p>
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
                  <p className="text-xs text-gray-500">Target: 60-80°</p>
                </div>
              )}
              
              {currentMiniGame === "measuring" && (
                <div className="text-center">
                  <p className="text-xs text-orange-600">Measuring</p>
                  <p className="text-xl font-bold text-orange-800">Active</p>
                </div>
              )}
              
              {currentMiniGame === "plating" && (
                <div className="text-center">
                  <p className="text-xs text-orange-600">Plating</p>
                  <p className="text-xl font-bold text-orange-800">Active</p>
                </div>
              )}
            </div>
          </Card>
        )}
        
        <MiniGameInstructions miniGame={currentMiniGame} technique={fullStep?.technique} />
      </div>
      
      {isPaused && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 pointer-events-auto">
          <Card className="p-6 text-center bg-white border-orange-200">
            <h3 className="text-2xl font-bold text-orange-800 mb-4">Paused</h3>
            <Button onClick={togglePause} className="bg-orange-500 hover:bg-orange-600">
              <Play className="w-5 h-5 mr-2" />
              Resume Cooking
            </Button>
          </Card>
        </div>
      )}
    </div>
  );
}

interface MiniGameInstructionsProps {
  miniGame: string | null;
  technique?: string;
}

function MiniGameInstructions({ miniGame, technique }: MiniGameInstructionsProps) {
  if (!miniGame) return null;

  const instructions: Record<string, string> = {
    chopping: "Click or press Space rapidly to chop",
    stirring: "Move mouse in circles to stir",
    heat_control: "Use Up/Down arrows or drag to adjust heat",
    measuring: "Click to stop at the target amount",
    plating: "Drag items to arrange on the plate"
  };

  return (
    <Card className="p-3 bg-white/95 backdrop-blur border-orange-200 max-w-xs">
      <p className="text-sm text-orange-700 font-medium">{instructions[miniGame]}</p>
      {technique && (
        <p className="text-xs text-gray-500 mt-1">Technique: {technique}</p>
      )}
    </Card>
  );
}
