import { useState, useMemo } from "react";
import { useCookingGame } from "@/lib/stores/useCookingGame";
import { useProgression } from "@/lib/stores/useProgression";
import { recipes } from "@/game/data/recipes";
import { fullRecipes } from "@/game/data/recipesData";
import type { FullRecipe, HealthTag, CuisineType, RecipeCategory } from "@/game/data/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  ArrowLeft, Clock, Star, ChefHat, Search, Filter, Heart, 
  Lock, Flame, Leaf, X, Info, Users, DollarSign 
} from "lucide-react";
import type { Recipe } from "@/lib/stores/useCookingGame";

type SortOption = "name" | "difficulty" | "time" | "category";
type TimeFilter = "all" | "under15" | "15-30" | "30-45" | "over45";
type RecipeWithUnlock = FullRecipe & { unlocked: boolean };

export function RecipeSelect() {
  const setPhase = useCookingGame(state => state.setPhase);
  const selectRecipe = useCookingGame(state => state.selectRecipe);
  
  const currentLevel = useProgression(state => state.currentLevel);
  const unlockedRecipes = useProgression(state => state.unlockedRecipes);
  const coins = useProgression(state => state.coins);
  const spendCoins = useProgression(state => state.spendCoins);
  const unlockRecipe = useProgression(state => state.unlockRecipe);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<RecipeCategory | "all">("all");
  const [selectedHealthTags, setSelectedHealthTags] = useState<HealthTag[]>([]);
  const [selectedDifficulty, setSelectedDifficulty] = useState<number | null>(null);
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("all");
  const [selectedCuisine, setSelectedCuisine] = useState<CuisineType | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>("name");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState<RecipeWithUnlock | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);

  const categories: (RecipeCategory | "all")[] = ["all", "breakfast", "lunch", "dinner", "dessert", "snack"];
  const healthTags: HealthTag[] = ["vegetarian", "vegan", "gluten-free", "dairy-free", "low-carb", "high-protein", "keto", "paleo"];
  const cuisines: CuisineType[] = ["american", "italian", "asian", "mexican", "french", "chinese", "japanese", "indian"];

  const isRecipeUnlocked = (recipe: FullRecipe): boolean => {
    if (unlockedRecipes.includes(recipe.id)) return true;
    const meetsLevelRequirement = currentLevel >= recipe.unlockRequirements.playerLevel;
    const hasCoinCost = recipe.unlockRequirements.coinCost > 0;
    if (meetsLevelRequirement && !hasCoinCost) return true;
    return false;
  };

  const meetsLevelRequirement = (recipe: FullRecipe): boolean => {
    return currentLevel >= recipe.unlockRequirements.playerLevel;
  };

  const canPurchaseRecipe = (recipe: FullRecipe): boolean => {
    if (unlockedRecipes.includes(recipe.id)) return false;
    if (!meetsLevelRequirement(recipe)) return false;
    if (recipe.unlockRequirements.coinCost <= 0) return false;
    return coins >= recipe.unlockRequirements.coinCost;
  };

  const handlePurchaseRecipe = (recipe: RecipeWithUnlock) => {
    if (recipe.unlockRequirements.coinCost <= 0) return;
    if (!meetsLevelRequirement(recipe)) return;
    if (unlockedRecipes.includes(recipe.id)) return;
    
    if (spendCoins(recipe.unlockRequirements.coinCost)) {
      unlockRecipe(recipe.id);
    }
  };

  const filteredRecipes = useMemo(() => {
    let result = fullRecipes.map(r => ({
      ...r,
      unlocked: isRecipeUnlocked(r)
    }));
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(r => 
        r.name.toLowerCase().includes(query) ||
        r.description.toLowerCase().includes(query) ||
        r.ingredients.some(i => i.displayName.toLowerCase().includes(query))
      );
    }
    
    if (activeCategory !== "all") {
      result = result.filter(r => r.category === activeCategory);
    }
    
    if (selectedHealthTags.length > 0) {
      result = result.filter(r => 
        selectedHealthTags.every(tag => r.healthTags.includes(tag))
      );
    }
    
    if (selectedDifficulty !== null) {
      result = result.filter(r => r.difficulty === selectedDifficulty);
    }
    
    if (selectedCuisine) {
      result = result.filter(r => r.cuisine === selectedCuisine);
    }
    
    if (timeFilter !== "all") {
      result = result.filter(r => {
        switch (timeFilter) {
          case "under15": return r.totalTime < 15;
          case "15-30": return r.totalTime >= 15 && r.totalTime <= 30;
          case "30-45": return r.totalTime > 30 && r.totalTime <= 45;
          case "over45": return r.totalTime > 45;
          default: return true;
        }
      });
    }
    
    result.sort((a, b) => {
      switch (sortBy) {
        case "name": return a.name.localeCompare(b.name);
        case "difficulty": return a.difficulty - b.difficulty;
        case "time": return a.totalTime - b.totalTime;
        case "category": return a.category.localeCompare(b.category);
        default: return 0;
      }
    });
    
    return result;
  }, [searchQuery, activeCategory, selectedHealthTags, selectedDifficulty, selectedCuisine, timeFilter, sortBy, currentLevel, unlockedRecipes]);

  const handleSelectRecipe = (recipe: RecipeWithUnlock) => {
    if (!recipe.unlocked) {
      console.log("[RecipeSelect] Recipe is locked:", recipe.id);
      return;
    }
    const legacyRecipe = recipes.find(r => r.id === recipe.id);
    if (legacyRecipe) {
      selectRecipe(legacyRecipe);
    }
  };

  const toggleHealthTag = (tag: HealthTag) => {
    setSelectedHealthTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const toggleFavorite = (recipeId: string) => {
    setFavorites(prev => 
      prev.includes(recipeId)
        ? prev.filter(id => id !== recipeId)
        : [...prev, recipeId]
    );
  };

  const clearFilters = () => {
    setSearchQuery("");
    setActiveCategory("all");
    setSelectedHealthTags([]);
    setSelectedDifficulty(null);
    setSelectedCuisine(null);
    setTimeFilter("all");
  };

  const hasActiveFilters = searchQuery || activeCategory !== "all" || selectedHealthTags.length > 0 || selectedDifficulty !== null || selectedCuisine !== null || timeFilter !== "all";

  const getDifficultyStars = (difficulty: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star 
        key={i} 
        className={`w-3 h-3 ${i < difficulty ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} 
      />
    ));
  };

  return (
    <div className="absolute inset-0 bg-gradient-to-b from-orange-50 to-amber-100 z-50 overflow-hidden flex flex-col">
      <div className="bg-white/80 backdrop-blur-sm border-b border-orange-200 p-4">
        <div className="container mx-auto max-w-6xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                onClick={() => setPhase("menu")}
                className="text-orange-700"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back
              </Button>
              <h1 className="text-2xl font-bold text-orange-800">Recipe Book</h1>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-orange-600 border-orange-300">
                {filteredRecipes.length} recipes
              </Badge>
              <Button
                variant={showFilters ? "default" : "outline"}
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className={showFilters ? "bg-orange-500" : "border-orange-300 text-orange-600"}
              >
                <Filter className="w-4 h-4 mr-1" />
                Filters
              </Button>
            </div>
          </div>

          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-orange-400" />
            <Input
              placeholder="Search recipes or ingredients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 border-orange-200 focus:border-orange-400"
            />
          </div>

          <Tabs value={activeCategory} onValueChange={(v) => setActiveCategory(v as RecipeCategory | "all")}>
            <TabsList className="bg-orange-100/50 w-full justify-start overflow-x-auto">
              {categories.map(cat => (
                <TabsTrigger 
                  key={cat} 
                  value={cat}
                  className="capitalize data-[state=active]:bg-orange-500 data-[state=active]:text-white"
                >
                  {cat === "all" ? "All Recipes" : cat}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
      </div>

      {showFilters && (
        <div className="bg-white/90 backdrop-blur-sm border-b border-orange-200 p-4">
          <div className="container mx-auto max-w-6xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-orange-800">Filter Options</h3>
              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters} className="text-orange-600">
                  <X className="w-4 h-4 mr-1" />
                  Clear All
                </Button>
              )}
            </div>

            <div>
              <p className="text-sm text-orange-700 mb-2">Dietary Preferences</p>
              <div className="flex flex-wrap gap-2">
                {healthTags.map(tag => (
                  <Badge
                    key={tag}
                    variant={selectedHealthTags.includes(tag) ? "default" : "outline"}
                    className={`cursor-pointer ${selectedHealthTags.includes(tag) ? "bg-green-500" : "border-green-300 text-green-600"}`}
                    onClick={() => toggleHealthTag(tag)}
                  >
                    <Leaf className="w-3 h-3 mr-1" />
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-orange-700 mb-2">Difficulty</p>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map(d => (
                    <Button
                      key={d}
                      variant={selectedDifficulty === d ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedDifficulty(selectedDifficulty === d ? null : d)}
                      className={selectedDifficulty === d ? "bg-orange-500" : "border-orange-300"}
                    >
                      {d}★
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm text-orange-700 mb-2">Cook Time</p>
                <div className="flex flex-wrap gap-2">
                  {[
                    { value: "under15", label: "<15 min" },
                    { value: "15-30", label: "15-30 min" },
                    { value: "30-45", label: "30-45 min" },
                    { value: "over45", label: "45+ min" }
                  ].map(t => (
                    <Badge
                      key={t.value}
                      variant={timeFilter === t.value ? "default" : "outline"}
                      className={`cursor-pointer ${timeFilter === t.value ? "bg-blue-500" : "border-blue-300 text-blue-600"}`}
                      onClick={() => setTimeFilter(timeFilter === t.value ? "all" : t.value as TimeFilter)}
                    >
                      <Clock className="w-3 h-3 mr-1" />
                      {t.label}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm text-orange-700 mb-2">Cuisine</p>
                <div className="flex flex-wrap gap-2">
                  {cuisines.slice(0, 4).map(c => (
                    <Badge
                      key={c}
                      variant={selectedCuisine === c ? "default" : "outline"}
                      className={`cursor-pointer capitalize ${selectedCuisine === c ? "bg-purple-500" : "border-purple-300 text-purple-600"}`}
                      onClick={() => setSelectedCuisine(selectedCuisine === c ? null : c)}
                    >
                      {c}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <p className="text-sm text-orange-700 mb-2">Sort By</p>
              <div className="flex gap-2">
                {[
                  { value: "name", label: "Name" },
                  { value: "difficulty", label: "Difficulty" },
                  { value: "time", label: "Time" },
                  { value: "category", label: "Category" }
                ].map(s => (
                  <Button
                    key={s.value}
                    variant={sortBy === s.value ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSortBy(s.value as SortOption)}
                    className={sortBy === s.value ? "bg-orange-500" : "border-orange-300"}
                  >
                    {s.label}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <ScrollArea className="flex-1 p-4">
        <div className="container mx-auto max-w-6xl">
          {filteredRecipes.length === 0 ? (
            <div className="text-center py-12">
              <ChefHat className="w-16 h-16 mx-auto text-orange-300 mb-4" />
              <h3 className="text-xl font-semibold text-orange-700 mb-2">No recipes found</h3>
              <p className="text-orange-600">Try adjusting your filters or search query</p>
              <Button 
                variant="outline" 
                onClick={clearFilters}
                className="mt-4 border-orange-300 text-orange-600"
              >
                Clear Filters
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredRecipes.map(recipe => (
                <EnhancedRecipeCard
                  key={recipe.id}
                  recipe={recipe}
                  isFavorite={favorites.includes(recipe.id)}
                  onSelect={() => handleSelectRecipe(recipe)}
                  onViewDetails={() => setSelectedRecipe(recipe)}
                  onToggleFavorite={() => toggleFavorite(recipe.id)}
                  onPurchase={() => handlePurchaseRecipe(recipe)}
                  canPurchase={canPurchaseRecipe(recipe)}
                  getDifficultyStars={getDifficultyStars}
                />
              ))}
            </div>
          )}
        </div>
      </ScrollArea>

      <RecipeDetailModal
        recipe={selectedRecipe}
        onClose={() => setSelectedRecipe(null)}
        onCook={() => {
          if (selectedRecipe) {
            handleSelectRecipe(selectedRecipe);
            setSelectedRecipe(null);
          }
        }}
      />
    </div>
  );
}

interface EnhancedRecipeCardProps {
  recipe: RecipeWithUnlock;
  isFavorite: boolean;
  onSelect: () => void;
  onViewDetails: () => void;
  onToggleFavorite: () => void;
  onPurchase: () => void;
  canPurchase: boolean;
  getDifficultyStars: (difficulty: number) => React.ReactNode;
}

function EnhancedRecipeCard({ 
  recipe, 
  isFavorite, 
  onSelect, 
  onViewDetails,
  onToggleFavorite,
  onPurchase,
  canPurchase,
  getDifficultyStars 
}: EnhancedRecipeCardProps) {
  const isLocked = !recipe.unlocked;
  
  return (
    <Card className={`hover:shadow-lg transition-all border-orange-200 overflow-hidden ${isLocked ? 'opacity-70' : ''}`}>
      <div className={`h-2 ${isLocked ? 'bg-gray-400' : 'bg-gradient-to-r from-orange-400 to-red-400'}`} />
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="text-lg text-orange-800 flex items-center gap-2">
              {isLocked && <Lock className="w-4 h-4 text-gray-500" />}
              {recipe.name}
            </CardTitle>
            <p className="text-xs text-orange-600 capitalize">{recipe.cuisine} • {recipe.category}</p>
          </div>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={(e) => { e.stopPropagation(); onToggleFavorite(); }}
            >
              <Heart className={`w-4 h-4 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={(e) => { e.stopPropagation(); onViewDetails(); }}
            >
              <Info className="w-4 h-4 text-orange-400" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-gray-600 line-clamp-2">{recipe.description}</p>
        
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-1">
            {getDifficultyStars(recipe.difficulty)}
          </div>
          <div className="flex items-center gap-3 text-orange-700">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {recipe.totalTime}m
            </span>
            <span className="flex items-center gap-1">
              <ChefHat className="w-3 h-3" />
              {recipe.steps.length}
            </span>
            <span className="flex items-center gap-1">
              <Flame className="w-3 h-3" />
              {recipe.nutrition.calories}
            </span>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-1">
          {recipe.healthTags.slice(0, 3).map(tag => (
            <Badge key={tag} variant="outline" className="text-xs border-green-300 text-green-600">
              {tag}
            </Badge>
          ))}
          {recipe.healthTags.length > 3 && (
            <Badge variant="outline" className="text-xs border-green-300 text-green-600">
              +{recipe.healthTags.length - 3}
            </Badge>
          )}
        </div>
        
        {isLocked ? (
          <div className="bg-gray-100 rounded-md p-2 text-center space-y-2">
            <p className="text-xs text-gray-600">
              Unlock at Level {recipe.unlockRequirements.playerLevel} 
              {recipe.unlockRequirements.coinCost > 0 && ` • ${recipe.unlockRequirements.coinCost} coins`}
            </p>
            {canPurchase && (
              <Button 
                onClick={onPurchase}
                className="w-full bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 text-sm"
                size="sm"
              >
                <DollarSign className="w-3 h-3 mr-1" />
                Unlock for {recipe.unlockRequirements.coinCost} coins
              </Button>
            )}
          </div>
        ) : (
          <Button 
            onClick={onSelect}
            className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
          >
            Cook This Recipe
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

interface RecipeDetailModalProps {
  recipe: RecipeWithUnlock | null;
  onClose: () => void;
  onCook: () => void;
}

function RecipeDetailModal({ recipe, onClose, onCook }: RecipeDetailModalProps) {
  if (!recipe) return null;
  
  return (
    <Dialog open={!!recipe} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl text-orange-800">{recipe.name}</DialogTitle>
          <p className="text-orange-600 capitalize">{recipe.cuisine} • {recipe.category}</p>
        </DialogHeader>
        
        <div className="space-y-6">
          <p className="text-gray-700">{recipe.description}</p>
          
          {recipe.originStory && (
            <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
              <h4 className="font-semibold text-amber-800 mb-1">Origin Story</h4>
              <p className="text-sm text-amber-700">{recipe.originStory}</p>
            </div>
          )}
          
          <div className="grid grid-cols-4 gap-4 text-center">
            <div className="bg-orange-50 rounded-lg p-3">
              <Clock className="w-5 h-5 mx-auto text-orange-500 mb-1" />
              <p className="text-xs text-gray-600">Total Time</p>
              <p className="font-semibold text-orange-700">{recipe.totalTime} min</p>
            </div>
            <div className="bg-orange-50 rounded-lg p-3">
              <Users className="w-5 h-5 mx-auto text-orange-500 mb-1" />
              <p className="text-xs text-gray-600">Servings</p>
              <p className="font-semibold text-orange-700">{recipe.servings}</p>
            </div>
            <div className="bg-orange-50 rounded-lg p-3">
              <Flame className="w-5 h-5 mx-auto text-orange-500 mb-1" />
              <p className="text-xs text-gray-600">Calories</p>
              <p className="font-semibold text-orange-700">{recipe.nutrition.calories}</p>
            </div>
            <div className="bg-orange-50 rounded-lg p-3">
              <DollarSign className="w-5 h-5 mx-auto text-orange-500 mb-1" />
              <p className="text-xs text-gray-600">Cost</p>
              <p className="font-semibold text-orange-700">{recipe.totalCost}</p>
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold text-orange-800 mb-2">Nutrition Facts</h4>
            <div className="grid grid-cols-4 gap-2">
              <div className="bg-blue-50 rounded p-2 text-center">
                <p className="text-xs text-gray-600">Protein</p>
                <p className="font-semibold text-blue-700">{recipe.nutrition.protein}g</p>
              </div>
              <div className="bg-yellow-50 rounded p-2 text-center">
                <p className="text-xs text-gray-600">Carbs</p>
                <p className="font-semibold text-yellow-700">{recipe.nutrition.carbs}g</p>
              </div>
              <div className="bg-red-50 rounded p-2 text-center">
                <p className="text-xs text-gray-600">Fat</p>
                <p className="font-semibold text-red-700">{recipe.nutrition.fat}g</p>
              </div>
              <div className="bg-green-50 rounded p-2 text-center">
                <p className="text-xs text-gray-600">Fiber</p>
                <p className="font-semibold text-green-700">{recipe.nutrition.fiber}g</p>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold text-orange-800 mb-2">
              Ingredients ({recipe.ingredients.length})
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {recipe.ingredients.map(ing => (
                <div key={ing.id} className="flex justify-between text-sm p-2 bg-gray-50 rounded">
                  <span>{ing.displayName}</span>
                  <span className="text-gray-600">{ing.quantity} {ing.unit}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold text-orange-800 mb-2">Dietary Info</h4>
            <div className="flex flex-wrap gap-2">
              {recipe.healthTags.map(tag => (
                <Badge key={tag} className="bg-green-100 text-green-700 border-green-300">
                  {tag}
                </Badge>
              ))}
              {recipe.allergens.length > 0 && (
                <>
                  <span className="text-gray-400">|</span>
                  {recipe.allergens.map(allergen => (
                    <Badge key={allergen} variant="destructive" className="bg-red-100 text-red-700">
                      Contains: {allergen}
                    </Badge>
                  ))}
                </>
              )}
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold text-orange-800 mb-2">Steps Preview</h4>
            <div className="space-y-2">
              {recipe.steps.map((step, i) => (
                <div key={step.id} className="flex gap-3 p-2 bg-gray-50 rounded">
                  <div className="w-6 h-6 rounded-full bg-orange-500 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
                    {i + 1}
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">{step.title}</p>
                    <p className="text-sm text-gray-600">{step.instruction}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Close
            </Button>
            {recipe.unlocked ? (
              <Button 
                onClick={onCook}
                className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
              >
                Start Cooking
              </Button>
            ) : (
              <Button disabled className="flex-1 bg-gray-400">
                <Lock className="w-4 h-4 mr-2" />
                Locked (Level {recipe.unlockRequirements.playerLevel})
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
