// Comprehensive Recipe Data Types for Phase 3

export type RecipeCategory = "breakfast" | "lunch" | "dinner" | "dessert" | "snack";
export type DifficultyLevel = 1 | 2 | 3 | 4 | 5;
export type CuisineType = "american" | "italian" | "asian" | "mexican" | "mediterranean" | "french" | "japanese" | "indian" | "chinese" | "thai";
export type HealthTag = "high-protein" | "low-carb" | "vegetarian" | "vegan" | "gluten-free" | "dairy-free" | "keto" | "paleo" | "low-sodium" | "low-sugar";
export type Allergen = "gluten" | "dairy" | "eggs" | "nuts" | "peanuts" | "soy" | "shellfish" | "fish" | "sesame";
export type IngredientCategory = "protein" | "vegetable" | "fruit" | "dairy" | "grain" | "spice" | "sauce" | "fat" | "sweetener" | "other";
export type ToolType = "knife" | "cutting_board" | "bowl" | "pan" | "pot" | "spatula" | "whisk" | "measuring_cup" | "measuring_spoon" | "oven" | "mixer" | "grater" | "peeler" | "tongs" | "ladle" | "rolling_pin" | "baking_sheet" | "wok";
export type ActionType = "prep" | "cook" | "combine" | "plate" | "bake" | "fry" | "boil" | "simmer" | "chop" | "mix" | "measure";
export type CameraAngle = "overhead" | "closeup" | "side" | "dynamic" | "wide";
export type MiniGameType = "chopping" | "stirring" | "heat_control" | "measuring" | "plating" | null;

export interface NutritionInfo {
  calories: number;
  protein: number;      // grams
  carbs: number;        // grams
  fat: number;          // grams
  fiber: number;        // grams
  sodium: number;       // mg
  sugar: number;        // grams
}

export interface VitaminContent {
  vitaminA?: number;    // percentage of daily value
  vitaminC?: number;
  vitaminD?: number;
  vitaminE?: number;
  vitaminK?: number;
  vitaminB6?: number;
  vitaminB12?: number;
  folate?: number;
  thiamin?: number;
  riboflavin?: number;
  niacin?: number;
}

export interface RecipeIngredient {
  id: string;
  displayName: string;
  quantity: number;
  unit: string;
  category: IngredientCategory;
  preparationNotes?: string;
  cost: number;         // in-game currency
  optional?: boolean;
}

export interface MiniGameConfig {
  type: MiniGameType;
  difficulty: number;   // 1-5
  targetScore: number;
  timeLimit: number;    // seconds
  bonusObjective?: string;
}

export interface RecipeStep {
  id: number;
  action: ActionType;
  title: string;
  instruction: string;
  detailedInstruction?: string;
  miniGame: MiniGameConfig | null;
  cameraAngle: CameraAngle;
  tools: ToolType[];
  duration: number;     // seconds
  tips?: string[];
  technique?: string;
  completed: boolean;
  score: number;
}

export interface UnlockRequirements {
  playerLevel: number;
  coinCost: number;
  prerequisiteRecipes?: string[];  // recipe IDs
}

export interface RecipeRewards {
  baseXP: number;
  baseCoins: number;
  bonusXP?: number;
  bonusCoins?: number;
  achievementUnlocks?: string[];
}

export interface RecipeVariation {
  id: string;
  name: string;
  description: string;
  modifiedIngredients: Partial<RecipeIngredient>[];
  healthTags: HealthTag[];
}

export interface RecipeCompletionStats {
  timesCooked: number;
  bestStars: number;
  bestScore: number;
  bestTime: number | null;  // in seconds
  firstCompletedAt: number | null;
  lastCompletedAt: number | null;
}

export interface FullRecipe {
  // Basic Info
  id: string;
  name: string;
  description: string;
  category: RecipeCategory;
  cuisine: CuisineType;
  difficulty: DifficultyLevel;
  
  // Timing
  prepTime: number;     // minutes
  cookTime: number;     // minutes
  totalTime: number;    // minutes
  
  // Servings
  servings: number;
  scalingFactor: number;
  
  // Nutrition
  nutrition: NutritionInfo;
  vitamins?: VitaminContent;
  
  // Tags & Attributes
  healthTags: HealthTag[];
  allergens: Allergen[];
  
  // Ingredients
  ingredients: RecipeIngredient[];
  totalCost: number;    // calculated from ingredients
  
  // Steps
  steps: RecipeStep[];
  
  // Unlock & Progression
  unlockRequirements: UnlockRequirements;
  unlocked: boolean;
  
  // Rewards
  rewards: RecipeRewards;
  
  // Variations
  variations?: RecipeVariation[];
  
  // Cultural Context
  originStory?: string;
  culturalContext?: string;
  
  // Player Stats (runtime)
  completionStats: RecipeCompletionStats;
  
  // Favorites & Tags
  isFavorite?: boolean;
  userTags?: string[];
}

// Helper function to convert legacy recipe to full recipe
export function createDefaultCompletionStats(): RecipeCompletionStats {
  return {
    timesCooked: 0,
    bestStars: 0,
    bestScore: 0,
    bestTime: null,
    firstCompletedAt: null,
    lastCompletedAt: null
  };
}

// Calculate total cost from ingredients
export function calculateTotalCost(ingredients: RecipeIngredient[]): number {
  return ingredients.reduce((sum, ing) => sum + ing.cost * ing.quantity, 0);
}

// Validate recipe data integrity
export function validateRecipe(recipe: FullRecipe): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!recipe.id || recipe.id.trim() === "") {
    errors.push("Recipe ID is required");
  }
  
  if (!recipe.name || recipe.name.trim() === "") {
    errors.push("Recipe name is required");
  }
  
  if (recipe.steps.length === 0) {
    errors.push("Recipe must have at least one step");
  }
  
  if (recipe.ingredients.length === 0) {
    errors.push("Recipe must have at least one ingredient");
  }
  
  if (recipe.difficulty < 1 || recipe.difficulty > 5) {
    errors.push("Difficulty must be between 1 and 5");
  }
  
  if (recipe.totalTime !== recipe.prepTime + recipe.cookTime) {
    errors.push("Total time should equal prep time + cook time");
  }
  
  if (recipe.nutrition.calories < 0) {
    errors.push("Calories cannot be negative");
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}
