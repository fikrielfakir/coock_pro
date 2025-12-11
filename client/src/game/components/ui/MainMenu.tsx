import { useEffect } from "react";
import { useCookingGame } from "@/lib/stores/useCookingGame";
import { useProgression } from "@/lib/stores/useProgression";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ChefHat, BookOpen, Settings, HelpCircle, Flame, Coins, Star, TrendingUp, Trophy } from "lucide-react";
import { motion } from "framer-motion";

export function MainMenu() {
  const setPhase = useCookingGame(state => state.setPhase);
  
  const currentLevel = useProgression(state => state.currentLevel);
  const currentXP = useProgression(state => state.currentXP);
  const coins = useProgression(state => state.coins);
  const streak = useProgression(state => state.streak);
  const chefTitle = useProgression(state => state.chefTitle);
  const getXPForNextLevel = useProgression(state => state.getXPForNextLevel);
  const getXPProgressPercent = useProgression(state => state.getXPProgressPercent);
  const updateStreak = useProgression(state => state.updateStreak);
  const recipesCompleted = useProgression(state => state.recipesCompleted);

  const xpNeeded = getXPForNextLevel();
  const progressPercent = getXPProgressPercent();
  const totalRecipesCooked = Object.values(recipesCompleted).reduce((sum, r) => sum + r.count, 0);
  const perfectRecipes = Object.values(recipesCompleted).filter(r => r.bestStars === 3).length;

  useEffect(() => {
    updateStreak();
  }, [updateStreak]);

  return (
    <div className="absolute inset-0 flex flex-col bg-gradient-to-b from-cooking-cream via-orange-100 to-amber-200 z-50 overflow-y-auto">
      <div className="bg-white/80 backdrop-blur-sm border-b border-orange-200 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center shadow-md">
                  <ChefHat className="w-8 h-8 text-white" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center text-xs font-bold text-yellow-900 border-2 border-white">
                  {currentLevel}
                </div>
              </div>
              
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-orange-800">Level {currentLevel}</span>
                  <span className="text-sm text-orange-600">{chefTitle}</span>
                </div>
                <div className="w-36">
                  <Progress value={progressPercent} className="h-2" />
                  <p className="text-xs text-gray-500 mt-0.5">
                    {currentXP.toLocaleString()} / {xpNeeded.toLocaleString()} XP
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-yellow-100 rounded-lg px-3 py-2">
                <Coins className="w-5 h-5 text-yellow-600" />
                <span className="font-bold text-yellow-700">{coins.toLocaleString()}</span>
              </div>
              
              {streak > 0 && (
                <div className="flex items-center gap-2 bg-orange-100 rounded-lg px-3 py-2">
                  <Flame className="w-5 h-5 text-orange-600" />
                  <span className="font-bold text-orange-700">{streak}</span>
                  <span className="text-xs text-orange-600">day{streak !== 1 ? 's' : ''}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center space-y-8 max-w-xl">
          <motion.div 
            className="space-y-4"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <motion.div 
              className="flex justify-center"
              animate={{ 
                scale: [1, 1.05, 1],
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <div className="w-28 h-28 bg-gradient-to-br from-cooking-orange to-cooking-coral rounded-full flex items-center justify-center shadow-xl border-4 border-white/50">
                <ChefHat className="w-16 h-16 text-white drop-shadow-md" />
              </div>
            </motion.div>
            <h1 className="font-heading text-5xl md:text-6xl font-bold text-cooking-orange drop-shadow-md">
              Cooking Simulator
            </h1>
            <p className="font-accent text-xl text-cooking-coral italic">
              Master the art of cooking with immersive 3D gameplay
            </p>
          </motion.div>
          
          <motion.div 
            className="space-y-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Button 
              onClick={() => setPhase("recipe_select")}
              className="w-full h-16 text-xl font-heading bg-gradient-to-r from-cooking-orange to-cooking-coral hover:from-orange-600 hover:to-red-600 shadow-lg transition-all duration-300 hover:scale-105"
            >
              <Flame className="w-6 h-6 mr-2" />
              Start Cooking
            </Button>
            
            <div className="grid grid-cols-2 gap-4">
              <Button 
                variant="outline"
                className="h-12 font-heading border-cooking-orange text-cooking-orange hover:bg-orange-100 transition-all duration-200"
              >
                <Settings className="w-5 h-5 mr-2" />
                Settings
              </Button>
              <Button 
                variant="outline"
                className="h-12 font-heading border-cooking-orange text-cooking-orange hover:bg-orange-100 transition-all duration-200"
              >
                <HelpCircle className="w-5 h-5 mr-2" />
                How to Play
              </Button>
            </div>
          </motion.div>
          
          <motion.div 
            className="grid grid-cols-3 gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Card className="bg-white/90 backdrop-blur-sm border-orange-200 p-4">
              <div className="flex flex-col items-center gap-2">
                <BookOpen className="w-6 h-6 text-orange-500" />
                <span className="text-2xl font-bold text-orange-800">{totalRecipesCooked}</span>
                <span className="text-xs text-gray-600">Recipes Cooked</span>
              </div>
            </Card>
            <Card className="bg-white/90 backdrop-blur-sm border-orange-200 p-4">
              <div className="flex flex-col items-center gap-2">
                <Star className="w-6 h-6 text-yellow-500 fill-yellow-500" />
                <span className="text-2xl font-bold text-orange-800">{perfectRecipes}</span>
                <span className="text-xs text-gray-600">Perfect Recipes</span>
              </div>
            </Card>
            <Card className="bg-white/90 backdrop-blur-sm border-orange-200 p-4">
              <div className="flex flex-col items-center gap-2">
                <Trophy className="w-6 h-6 text-purple-500" />
                <span className="text-2xl font-bold text-orange-800">{Object.keys(recipesCompleted).length}</span>
                <span className="text-xs text-gray-600">Unique Recipes</span>
              </div>
            </Card>
          </motion.div>
          
          {streak > 0 && (
            <motion.div
              className="flex items-center justify-center gap-2 text-green-600"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <TrendingUp className="w-5 h-5" />
              <span className="font-medium">{streak} day streak! +{Math.min(streak * 10, 50)}% XP bonus</span>
            </motion.div>
          )}
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Card className="bg-white/90 backdrop-blur-sm border-cooking-gold/30 shadow-lg">
              <CardHeader className="pb-2">
                <CardTitle className="font-heading text-cooking-orange text-lg flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  Quick Tips
                </CardTitle>
              </CardHeader>
              <CardContent className="text-left text-sm font-body text-gray-700 space-y-2">
                <p className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-cooking-orange" />
                  Click or press Space to chop ingredients
                </p>
                <p className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-cooking-gold" />
                  Move mouse in circles to stir
                </p>
                <p className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-cooking-coral" />
                  Use arrow keys or drag to control temperature
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
