import { useCookingGame } from "@/lib/stores/useCookingGame";
import { recipes } from "@/game/data/recipes";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Clock, Star, ChefHat } from "lucide-react";
import type { Recipe } from "@/lib/stores/useCookingGame";

export function RecipeSelect() {
  const setPhase = useCookingGame(state => state.setPhase);
  const selectRecipe = useCookingGame(state => state.selectRecipe);

  const handleSelectRecipe = (recipe: Recipe) => {
    selectRecipe(recipe);
  };

  const categories = ["breakfast", "lunch", "dinner"] as const;

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy": return "bg-green-500";
      case "medium": return "bg-yellow-500";
      case "hard": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  return (
    <div className="absolute inset-0 bg-gradient-to-b from-orange-50 to-amber-100 z-50 overflow-y-auto">
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="flex items-center gap-4 mb-6">
          <Button 
            variant="ghost" 
            onClick={() => setPhase("menu")}
            className="text-orange-700"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold text-orange-800">Choose a Recipe</h1>
        </div>
        
        <Tabs defaultValue="breakfast" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-orange-200/50">
            {categories.map(cat => (
              <TabsTrigger 
                key={cat} 
                value={cat}
                className="capitalize data-[state=active]:bg-orange-500 data-[state=active]:text-white"
              >
                {cat}
              </TabsTrigger>
            ))}
          </TabsList>
          
          {categories.map(category => (
            <TabsContent key={category} value={category} className="mt-6">
              <div className="grid gap-4 md:grid-cols-2">
                {recipes
                  .filter(r => r.category === category)
                  .map(recipe => (
                    <RecipeCard 
                      key={recipe.id} 
                      recipe={recipe}
                      onSelect={() => handleSelectRecipe(recipe)}
                      getDifficultyColor={getDifficultyColor}
                    />
                  ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
}

interface RecipeCardProps {
  recipe: Recipe;
  onSelect: () => void;
  getDifficultyColor: (difficulty: string) => string;
}

function RecipeCard({ recipe, onSelect, getDifficultyColor }: RecipeCardProps) {
  const totalDuration = recipe.steps.reduce((sum, step) => sum + step.duration, 0);
  const minutes = Math.ceil(totalDuration / 60);

  return (
    <Card className="hover:shadow-lg transition-shadow border-orange-200 overflow-hidden">
      <div className="h-2 bg-gradient-to-r from-orange-400 to-red-400" />
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-xl text-orange-800">{recipe.name}</CardTitle>
          <Badge className={`${getDifficultyColor(recipe.difficulty)} text-white`}>
            {recipe.difficulty}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4 text-sm text-orange-700">
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{minutes} min</span>
          </div>
          <div className="flex items-center gap-1">
            <ChefHat className="w-4 h-4" />
            <span>{recipe.steps.length} steps</span>
          </div>
          {recipe.bestStars > 0 && (
            <div className="flex items-center gap-1">
              {Array.from({ length: recipe.bestStars }).map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              ))}
            </div>
          )}
        </div>
        
        <div className="flex flex-wrap gap-1">
          {recipe.ingredients.slice(0, 4).map((ing, i) => (
            <Badge key={i} variant="outline" className="text-xs border-orange-300 text-orange-600">
              {ing}
            </Badge>
          ))}
          {recipe.ingredients.length > 4 && (
            <Badge variant="outline" className="text-xs border-orange-300 text-orange-600">
              +{recipe.ingredients.length - 4} more
            </Badge>
          )}
        </div>
        
        <Button 
          onClick={onSelect}
          className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
        >
          Cook This Recipe
        </Button>
      </CardContent>
    </Card>
  );
}
