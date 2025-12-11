import { useCookingGame } from "@/lib/stores/useCookingGame";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChefHat, BookOpen, Settings, HelpCircle, Flame } from "lucide-react";
import { motion } from "framer-motion";

export function MainMenu() {
  const setPhase = useCookingGame(state => state.setPhase);

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-cooking-cream via-orange-100 to-amber-200 z-50">
      <div className="text-center space-y-8 p-8">
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
          className="space-y-4 max-w-md mx-auto"
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
          className="mt-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Card className="bg-white/90 backdrop-blur-sm border-cooking-gold/30 shadow-lg max-w-md mx-auto">
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
  );
}
