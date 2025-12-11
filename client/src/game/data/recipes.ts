import type { Recipe } from "@/lib/stores/useCookingGame";
import { fullRecipes, getFullRecipeById, getFullRecipesByCategory as getFullByCategory } from "./recipesData";
import type { FullRecipe, MiniGameConfig } from "./types";

function convertMiniGameConfig(config: MiniGameConfig | null): "chopping" | "stirring" | "heat_control" | "measuring" | "plating" | null {
  if (!config) return null;
  return config.type;
}

function convertFullRecipeToLegacy(full: FullRecipe): Recipe {
  return {
    id: full.id,
    name: full.name,
    category: full.category === "snack" ? "lunch" : full.category,
    difficulty: full.difficulty <= 2 ? "easy" : full.difficulty <= 3 ? "medium" : "hard",
    ingredients: full.ingredients.map(i => i.displayName),
    steps: full.steps.map(step => ({
      id: step.id,
      action: step.action,
      title: step.title,
      instruction: step.instruction,
      miniGame: convertMiniGameConfig(step.miniGame),
      duration: step.duration,
      completed: step.completed,
      score: step.score
    })),
    unlocked: full.unlocked,
    bestStars: full.completionStats.bestStars
  };
}

export const recipes: Recipe[] = fullRecipes.map(convertFullRecipeToLegacy);

export function getRecipesByCategory(category: string): Recipe[] {
  return recipes.filter(r => r.category === category);
}

export function getRecipeById(id: string): Recipe | undefined {
  return recipes.find(r => r.id === id);
}

export { fullRecipes, getFullRecipeById, getFullByCategory as getFullRecipesByCategory };
export type { FullRecipe };
