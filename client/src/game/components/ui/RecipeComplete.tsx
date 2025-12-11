import { useEffect, useState, useRef } from "react";
import { useCookingGame } from "@/lib/stores/useCookingGame";
import { useProgression } from "@/lib/stores/useProgression";
import { fullRecipes } from "@/game/data/recipesData";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Star, RotateCcw, Home, ChefHat, Trophy, Clock, Target, Flame, Award, TrendingUp } from "lucide-react";
import Confetti from "react-confetti";
import { LevelUpNotification } from "./LevelUpNotification";

export function RecipeComplete() {
  const currentRecipe = useCookingGame(state => state.currentRecipe);
  const starRating = useCookingGame(state => state.starRating);
  const totalScore = useCookingGame(state => state.totalScore);
  const resetGame = useCookingGame(state => state.resetGame);
  const goToRecipeSelect = useCookingGame(state => state.goToRecipeSelect);
  const selectRecipe = useCookingGame(state => state.selectRecipe);
  
  const addXP = useProgression(state => state.addXP);
  const addCoins = useProgression(state => state.addCoins);
  const recordRecipeCompletion = useProgression(state => state.recordRecipeCompletion);
  const recipesCompleted = useProgression(state => state.recipesCompleted);
  const streak = useProgression(state => state.streak);
  
  const [showConfetti, setShowConfetti] = useState(true);
  const [animatedStars, setAnimatedStars] = useState(0);
  const [animatedScore, setAnimatedScore] = useState(0);
  const [windowSize, setWindowSize] = useState({ width: window.innerWidth, height: window.innerHeight });
  const [levelUpInfo, setLevelUpInfo] = useState<{ show: boolean; newLevel: number; oldLevel: number }>({ show: false, newLevel: 0, oldLevel: 0 });
  
  const hasRecordedRef = useRef(false);

  const fullRecipeData = currentRecipe ? fullRecipes.find(r => r.id === currentRecipe.id) : null;
  const isFirstCompletion = currentRecipe ? !recipesCompleted[currentRecipe.id] : false;

  const maxPossibleScore = currentRecipe ? currentRecipe.steps.length * 100 : 100;
  const scorePercentage = (totalScore / maxPossibleScore) * 100;
  
  const baseXP = fullRecipeData?.rewards.baseXP || 50;
  const baseCoins = fullRecipeData?.rewards.baseCoins || 25;
  const starBonus = starRating === 3 ? 1.5 : starRating === 2 ? 1.25 : 1;
  const firstTimeBonus = isFirstCompletion ? 1.5 : 1;
  
  const xpEarned = Math.floor(baseXP * starBonus * firstTimeBonus);
  const coinsEarned = Math.floor(baseCoins * starBonus);

  useEffect(() => {
    if (currentRecipe && !hasRecordedRef.current) {
      hasRecordedRef.current = true;
      
      const result = addXP(xpEarned, `Recipe: ${currentRecipe.name}`);
      addCoins(coinsEarned);
      recordRecipeCompletion(currentRecipe.id, totalScore, starRating, 0);
      
      if (result.leveledUp) {
        setTimeout(() => {
          setLevelUpInfo({ show: true, newLevel: result.newLevel, oldLevel: result.oldLevel });
        }, 1500);
      }
      
      console.log(`[RecipeComplete] Recorded completion: +${xpEarned} XP, +${coinsEarned} coins`);
    }
  }, [currentRecipe?.id]);

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setShowConfetti(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    let current = 0;
    const interval = setInterval(() => {
      if (current < starRating) {
        current++;
        setAnimatedStars(current);
      } else {
        clearInterval(interval);
      }
    }, 400);
    return () => clearInterval(interval);
  }, [starRating]);

  useEffect(() => {
    const duration = 1500;
    const steps = 30;
    const increment = totalScore / steps;
    let current = 0;
    const interval = setInterval(() => {
      current += increment;
      if (current >= totalScore) {
        setAnimatedScore(totalScore);
        clearInterval(interval);
      } else {
        setAnimatedScore(Math.floor(current));
      }
    }, duration / steps);
    return () => clearInterval(interval);
  }, [totalScore]);

  const handlePlayAgain = () => {
    hasRecordedRef.current = false;
    if (currentRecipe) {
      selectRecipe(currentRecipe);
    }
  };

  const handleBackToMenu = () => {
    hasRecordedRef.current = false;
    resetGame();
  };

  const handleChooseAnother = () => {
    hasRecordedRef.current = false;
    goToRecipeSelect();
  };

  const getStepBreakdown = () => {
    if (!currentRecipe) return [];
    return currentRecipe.steps.map((step, index) => ({
      name: step.title,
      score: step.score,
      maxScore: 100,
      miniGame: step.miniGame
    }));
  };

  const stepBreakdown = getStepBreakdown();

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50 p-4">
      {showConfetti && (
        <Confetti
          width={windowSize.width}
          height={windowSize.height}
          recycle={false}
          numberOfPieces={starRating * 100}
          colors={["#ff6b35", "#f7931e", "#ffd700", "#4ecdc4", "#ff6b6b"]}
        />
      )}
      
      <Card className="w-full max-w-2xl bg-gradient-to-b from-white to-orange-50 border-orange-200 shadow-2xl overflow-y-auto max-h-[90vh]">
        <div className="h-2 bg-gradient-to-r from-orange-400 via-yellow-400 to-orange-400" />
        
        <CardHeader className="text-center pb-4">
          <div className="flex justify-center mb-4">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center shadow-lg ${
              starRating === 3 ? 'bg-gradient-to-br from-yellow-400 to-orange-500 animate-bounce' :
              starRating === 2 ? 'bg-gradient-to-br from-gray-300 to-gray-400' :
              'bg-gradient-to-br from-amber-600 to-amber-700'
            }`}>
              <Trophy className="w-10 h-10 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl text-orange-800">
            {starRating === 3 ? "Perfect!" : starRating === 2 ? "Great Job!" : "Good Effort!"}
          </CardTitle>
          {currentRecipe && (
            <p className="text-orange-600 font-medium">{currentRecipe.name}</p>
          )}
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="flex justify-center gap-3">
            {[1, 2, 3].map(star => (
              <Star
                key={star}
                className={`w-14 h-14 transition-all duration-500 ${
                  star <= animatedStars
                    ? "fill-yellow-400 text-yellow-400 scale-110 drop-shadow-lg"
                    : "text-gray-300"
                }`}
                style={{
                  transitionDelay: `${star * 200}ms`
                }}
              />
            ))}
          </div>
          
          <div className="text-center space-y-2">
            <p className="text-5xl font-bold text-orange-800">{animatedScore}</p>
            <p className="text-sm text-orange-600">Total Score</p>
            <div className="w-full max-w-xs mx-auto">
              <Progress value={scorePercentage} className="h-3" />
              <p className="text-xs text-gray-500 mt-1">{Math.round(scorePercentage)}% of maximum</p>
            </div>
          </div>
          
          <div className="bg-orange-50 rounded-lg p-4">
            <h4 className="font-semibold text-orange-800 mb-3 flex items-center gap-2">
              <Target className="w-4 h-4" />
              Step Breakdown
            </h4>
            <div className="space-y-2">
              {stepBreakdown.map((step, index) => (
                <div key={index} className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-orange-200 text-orange-700 text-xs flex items-center justify-center font-bold">
                    {index + 1}
                  </span>
                  <span className="flex-1 text-sm text-gray-700 truncate">{step.name}</span>
                  <div className="flex items-center gap-2">
                    <Progress value={(step.score / step.maxScore) * 100} className="w-16 h-2" />
                    <span className={`text-sm font-mono w-8 text-right ${
                      step.score >= 90 ? 'text-green-600' :
                      step.score >= 70 ? 'text-yellow-600' :
                      'text-red-600'
                    }`}>
                      {step.score}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-purple-100 rounded-lg p-3 text-center">
              <div className="flex items-center justify-center gap-1 text-purple-700">
                <ChefHat className="w-5 h-5" />
                <span className="font-bold text-lg">+{xpEarned}</span>
              </div>
              <p className="text-xs text-purple-600">XP Earned</p>
            </div>
            <div className="bg-yellow-100 rounded-lg p-3 text-center">
              <div className="flex items-center justify-center gap-1 text-yellow-700">
                <span className="text-lg">$</span>
                <span className="font-bold text-lg">{coinsEarned}</span>
              </div>
              <p className="text-xs text-yellow-600">Coins</p>
            </div>
            <div className="bg-blue-100 rounded-lg p-3 text-center">
              <div className="flex items-center justify-center gap-1 text-blue-700">
                <Clock className="w-5 h-5" />
                <span className="font-bold text-lg">{currentRecipe?.steps.length || 0}</span>
              </div>
              <p className="text-xs text-blue-600">Steps</p>
            </div>
            <div className="bg-green-100 rounded-lg p-3 text-center">
              <div className="flex items-center justify-center gap-1 text-green-700">
                <Flame className="w-5 h-5" />
                <span className="font-bold text-lg">{fullRecipeData?.nutrition.calories || 0}</span>
              </div>
              <p className="text-xs text-green-600">Calories</p>
            </div>
          </div>
          
          {isFirstCompletion && (
            <div className="bg-gradient-to-r from-green-100 to-emerald-100 rounded-lg p-4 text-center border border-green-300">
              <div className="flex items-center justify-center gap-2 text-green-700">
                <TrendingUp className="w-6 h-6" />
                <span className="font-bold">First Time Bonus!</span>
              </div>
              <p className="text-sm text-green-600 mt-1">+50% XP for completing this recipe for the first time!</p>
            </div>
          )}
          
          {starRating === 3 && (
            <div className="bg-gradient-to-r from-yellow-100 to-orange-100 rounded-lg p-4 text-center border border-yellow-300">
              <div className="flex items-center justify-center gap-2 text-yellow-700">
                <Award className="w-6 h-6" />
                <span className="font-bold">Perfect Score Bonus!</span>
              </div>
              <p className="text-sm text-yellow-600 mt-1">50% bonus XP and coins for 3 stars!</p>
            </div>
          )}
          
          {streak > 1 && (
            <div className="bg-gradient-to-r from-orange-100 to-red-100 rounded-lg p-3 text-center border border-orange-300">
              <div className="flex items-center justify-center gap-2 text-orange-700">
                <Flame className="w-5 h-5" />
                <span className="font-semibold">{streak} Day Streak!</span>
                <span className="text-sm">+{Math.min(streak * 10, 50)}% XP</span>
              </div>
            </div>
          )}
          
          <div className="space-y-2 pt-2">
            <Button 
              onClick={handlePlayAgain}
              className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-lg py-6"
            >
              <RotateCcw className="w-5 h-5 mr-2" />
              Cook Again
            </Button>
            
            <div className="grid grid-cols-2 gap-2">
              <Button 
                variant="outline"
                onClick={handleChooseAnother}
                className="border-orange-300 text-orange-700 hover:bg-orange-50"
              >
                More Recipes
              </Button>
              <Button 
                variant="outline"
                onClick={handleBackToMenu}
                className="border-orange-300 text-orange-700 hover:bg-orange-50"
              >
                <Home className="w-4 h-4 mr-2" />
                Main Menu
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <LevelUpNotification
        isOpen={levelUpInfo.show}
        onClose={() => setLevelUpInfo(prev => ({ ...prev, show: false }))}
        newLevel={levelUpInfo.newLevel}
        oldLevel={levelUpInfo.oldLevel}
      />
    </div>
  );
}
