import { useCookingGame } from "@/lib/stores/useCookingGame";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChefHat, BookOpen, Settings } from "lucide-react";

export function MainMenu() {
  const setPhase = useCookingGame(state => state.setPhase);

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-orange-100 to-amber-200 z-50">
      <div className="text-center space-y-8 p-8">
        <div className="space-y-4">
          <div className="flex justify-center">
            <div className="w-24 h-24 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center shadow-lg">
              <ChefHat className="w-14 h-14 text-white" />
            </div>
          </div>
          <h1 className="text-5xl font-bold text-orange-800 drop-shadow-md">
            Cooking Simulator
          </h1>
          <p className="text-lg text-orange-700">
            Master the art of cooking with immersive 3D gameplay
          </p>
        </div>
        
        <div className="space-y-4 max-w-md mx-auto">
          <Button 
            onClick={() => setPhase("recipe_select")}
            className="w-full h-14 text-xl bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 shadow-lg"
          >
            <BookOpen className="w-6 h-6 mr-2" />
            Start Cooking
          </Button>
          
          <div className="grid grid-cols-2 gap-4">
            <Button 
              variant="outline"
              className="h-12 border-orange-400 text-orange-700 hover:bg-orange-100"
            >
              <Settings className="w-5 h-5 mr-2" />
              Settings
            </Button>
            <Button 
              variant="outline"
              className="h-12 border-orange-400 text-orange-700 hover:bg-orange-100"
            >
              How to Play
            </Button>
          </div>
        </div>
        
        <div className="mt-8">
          <Card className="bg-white/80 backdrop-blur border-orange-200 max-w-md mx-auto">
            <CardHeader className="pb-2">
              <CardTitle className="text-orange-800 text-lg">Quick Tips</CardTitle>
            </CardHeader>
            <CardContent className="text-left text-sm text-orange-700 space-y-2">
              <p>• Click or press Space to chop ingredients</p>
              <p>• Move mouse in circles to stir</p>
              <p>• Use arrow keys or drag to control temperature</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
