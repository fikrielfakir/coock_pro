import { useEffect, useState } from "react";
import { useCookingGame } from "@/lib/stores/useCookingGame";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star, RotateCcw, Home, ChefHat, Trophy } from "lucide-react";
import Confetti from "react-confetti";

export function RecipeComplete() {
  const currentRecipe = useCookingGame(state => state.currentRecipe);
  const starRating = useCookingGame(state => state.starRating);
  const totalScore = useCookingGame(state => state.totalScore);
  const resetGame = useCookingGame(state => state.resetGame);
  const goToRecipeSelect = useCookingGame(state => state.goToRecipeSelect);
  const selectRecipe = useCookingGame(state => state.selectRecipe);
  
  const [showConfetti, setShowConfetti] = useState(true);
  const [animatedStars, setAnimatedStars] = useState(0);
  const [windowSize, setWindowSize] = useState({ width: window.innerWidth, height: window.innerHeight });

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

  const handlePlayAgain = () => {
    if (currentRecipe) {
      selectRecipe(currentRecipe);
    }
  };

  const handleBackToMenu = () => {
    resetGame();
  };

  const handleChooseAnother = () => {
    goToRecipeSelect();
  };

  const xpEarned = starRating * 50 + totalScore;
  const coinsEarned = starRating * 20 + Math.floor(totalScore / 5);

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50">
      {showConfetti && (
        <Confetti
          width={windowSize.width}
          height={windowSize.height}
          recycle={false}
          numberOfPieces={starRating * 100}
          colors={["#ff6b35", "#f7931e", "#ffd700", "#4ecdc4", "#ff6b6b"]}
        />
      )}
      
      <Card className="w-full max-w-md mx-4 bg-gradient-to-b from-white to-orange-50 border-orange-200 shadow-2xl">
        <div className="h-2 bg-gradient-to-r from-orange-400 via-yellow-400 to-orange-400" />
        
        <CardHeader className="text-center pb-2">
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg animate-bounce">
              <Trophy className="w-10 h-10 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl text-orange-800">Recipe Complete!</CardTitle>
          {currentRecipe && (
            <p className="text-orange-600 font-medium">{currentRecipe.name}</p>
          )}
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="flex justify-center gap-2">
            {[1, 2, 3].map(star => (
              <Star
                key={star}
                className={`w-12 h-12 transition-all duration-500 ${
                  star <= animatedStars
                    ? "fill-yellow-400 text-yellow-400 scale-110"
                    : "text-gray-300"
                }`}
                style={{
                  transitionDelay: `${star * 200}ms`
                }}
              />
            ))}
          </div>
          
          <div className="text-center">
            <p className="text-4xl font-bold text-orange-800">{totalScore}</p>
            <p className="text-sm text-orange-600">Total Score</p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-orange-100 rounded-lg p-3 text-center">
              <div className="flex items-center justify-center gap-1 text-orange-700">
                <ChefHat className="w-5 h-5" />
                <span className="font-bold text-lg">+{xpEarned}</span>
              </div>
              <p className="text-xs text-orange-600">XP Earned</p>
            </div>
            <div className="bg-yellow-100 rounded-lg p-3 text-center">
              <div className="flex items-center justify-center gap-1 text-yellow-700">
                <span className="text-lg">$</span>
                <span className="font-bold text-lg">{coinsEarned}</span>
              </div>
              <p className="text-xs text-yellow-600">Coins Earned</p>
            </div>
          </div>
          
          <div className="space-y-2">
            <Button 
              onClick={handlePlayAgain}
              className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Play Again
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
                Menu
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
