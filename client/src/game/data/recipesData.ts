import type { FullRecipe, RecipeStep, MiniGameConfig } from "./types";
import { createDefaultCompletionStats, calculateTotalCost } from "./types";

function createMiniGame(type: "chopping" | "stirring" | "heat_control" | "measuring" | "plating", difficulty: number = 3): MiniGameConfig {
  return {
    type,
    difficulty,
    targetScore: 70 + difficulty * 5,
    timeLimit: 30 + (5 - difficulty) * 10,
    bonusObjective: undefined
  };
}

export const fullRecipes: FullRecipe[] = [
  // BREAKFAST RECIPES (3)
  {
    id: "scrambled_eggs",
    name: "Scrambled Eggs",
    description: "Classic fluffy scrambled eggs cooked to perfection with butter and seasoning.",
    category: "breakfast",
    cuisine: "american",
    difficulty: 1,
    prepTime: 5,
    cookTime: 5,
    totalTime: 10,
    servings: 2,
    scalingFactor: 1,
    nutrition: {
      calories: 220,
      protein: 14,
      carbs: 2,
      fat: 17,
      fiber: 0,
      sodium: 320,
      sugar: 1
    },
    vitamins: {
      vitaminA: 15,
      vitaminD: 10,
      vitaminB12: 25,
      riboflavin: 20
    },
    healthTags: ["high-protein", "low-carb", "gluten-free", "keto"],
    allergens: ["eggs", "dairy"],
    ingredients: [
      { id: "eggs_1", displayName: "Large Eggs", quantity: 3, unit: "whole", category: "protein", preparationNotes: "Room temperature", cost: 15 },
      { id: "butter_1", displayName: "Butter", quantity: 2, unit: "tbsp", category: "fat", cost: 10 },
      { id: "salt_1", displayName: "Salt", quantity: 0.25, unit: "tsp", category: "spice", cost: 1 },
      { id: "pepper_1", displayName: "Black Pepper", quantity: 0.125, unit: "tsp", category: "spice", cost: 1 }
    ],
    totalCost: 27,
    steps: [
      {
        id: 1,
        action: "prep",
        title: "Crack the Eggs",
        instruction: "Crack 3 eggs into a bowl and beat them well",
        detailedInstruction: "Crack each egg on a flat surface to avoid shell fragments. Beat vigorously for about 30 seconds until the yolks and whites are fully combined.",
        miniGame: createMiniGame("stirring", 2),
        cameraAngle: "closeup",
        tools: ["bowl", "whisk"],
        duration: 30,
        tips: ["Use a flat surface to crack eggs for cleaner breaks", "Beat until no streaks of white remain"],
        technique: "Whisking",
        completed: false,
        score: 0
      },
      {
        id: 2,
        action: "cook",
        title: "Heat the Pan",
        instruction: "Melt butter in a pan over medium heat",
        detailedInstruction: "Add butter to a non-stick pan. Heat until the butter is just melted and slightly foamy, but not browning.",
        miniGame: createMiniGame("heat_control", 2),
        cameraAngle: "side",
        tools: ["pan", "spatula"],
        duration: 20,
        tips: ["Don't let the butter brown - it will affect the flavor"],
        technique: "Temperature Control",
        completed: false,
        score: 0
      },
      {
        id: 3,
        action: "cook",
        title: "Cook the Eggs",
        instruction: "Pour eggs into pan and stir gently until cooked",
        detailedInstruction: "Pour the beaten eggs into the pan. Using a spatula, gently push the eggs from the edges to the center, creating soft curds. Remove from heat while still slightly wet.",
        miniGame: createMiniGame("stirring", 3),
        cameraAngle: "overhead",
        tools: ["pan", "spatula"],
        duration: 45,
        tips: ["Remove from heat while eggs are still slightly wet - they will continue cooking", "Low and slow creates the creamiest eggs"],
        technique: "Gentle Folding",
        completed: false,
        score: 0
      }
    ],
    unlockRequirements: { playerLevel: 1, coinCost: 0 },
    unlocked: true,
    rewards: { baseXP: 50, baseCoins: 25 },
    originStory: "Scrambled eggs have been a breakfast staple for centuries, with variations appearing in cuisines worldwide.",
    completionStats: createDefaultCompletionStats()
  },
  {
    id: "pancakes",
    name: "Fluffy Pancakes",
    description: "Light and fluffy American-style pancakes, golden brown and perfect for stacking.",
    category: "breakfast",
    cuisine: "american",
    difficulty: 2,
    prepTime: 10,
    cookTime: 15,
    totalTime: 25,
    servings: 4,
    scalingFactor: 1,
    nutrition: {
      calories: 350,
      protein: 8,
      carbs: 52,
      fat: 12,
      fiber: 2,
      sodium: 480,
      sugar: 14
    },
    vitamins: {
      vitaminB6: 8,
      thiamin: 15,
      riboflavin: 20,
      folate: 12
    },
    healthTags: ["vegetarian"],
    allergens: ["gluten", "eggs", "dairy"],
    ingredients: [
      { id: "flour_1", displayName: "All-Purpose Flour", quantity: 1.5, unit: "cups", category: "grain", cost: 10 },
      { id: "eggs_2", displayName: "Large Eggs", quantity: 2, unit: "whole", category: "protein", cost: 10 },
      { id: "milk_1", displayName: "Whole Milk", quantity: 1.25, unit: "cups", category: "dairy", cost: 12 },
      { id: "butter_2", displayName: "Melted Butter", quantity: 3, unit: "tbsp", category: "fat", cost: 15 },
      { id: "sugar_1", displayName: "Sugar", quantity: 2, unit: "tbsp", category: "sweetener", cost: 5 }
    ],
    totalCost: 52,
    steps: [
      {
        id: 1,
        action: "mix",
        title: "Mix Batter",
        instruction: "Combine flour, eggs, milk, and sugar in a bowl",
        detailedInstruction: "Whisk dry ingredients first, then create a well. Add wet ingredients and mix until just combined - some lumps are okay!",
        miniGame: createMiniGame("stirring", 3),
        cameraAngle: "overhead",
        tools: ["bowl", "whisk", "measuring_cup"],
        duration: 40,
        tips: ["Don't overmix - lumps are fine and lead to fluffier pancakes"],
        technique: "Gentle Mixing",
        completed: false,
        score: 0
      },
      {
        id: 2,
        action: "cook",
        title: "Heat Griddle",
        instruction: "Heat a griddle with butter over medium heat",
        detailedInstruction: "Heat the griddle to 375°F (190°C). Test by sprinkling water drops - they should dance and evaporate.",
        miniGame: createMiniGame("heat_control", 2),
        cameraAngle: "side",
        tools: ["pan", "spatula"],
        duration: 25,
        tips: ["A properly heated pan is the secret to golden pancakes"],
        technique: "Heat Testing",
        completed: false,
        score: 0
      },
      {
        id: 3,
        action: "cook",
        title: "Cook Pancakes",
        instruction: "Pour batter and flip when bubbles form",
        detailedInstruction: "Pour 1/4 cup batter per pancake. Wait until bubbles form on surface and edges look set, about 2-3 minutes. Flip and cook 1-2 more minutes.",
        miniGame: createMiniGame("heat_control", 3),
        cameraAngle: "overhead",
        tools: ["pan", "spatula", "ladle"],
        duration: 60,
        tips: ["Only flip once - multiple flips lead to tough pancakes"],
        technique: "Timing the Flip",
        completed: false,
        score: 0
      }
    ],
    unlockRequirements: { playerLevel: 1, coinCost: 0 },
    unlocked: true,
    rewards: { baseXP: 75, baseCoins: 35 },
    originStory: "Pancakes date back to ancient Greece. The American-style thick pancake became popular in the 1800s with the invention of baking powder.",
    completionStats: createDefaultCompletionStats()
  },
  {
    id: "omelette",
    name: "French Omelette",
    description: "A classic French omelette with a silky, custardy center and delicate exterior.",
    category: "breakfast",
    cuisine: "french",
    difficulty: 3,
    prepTime: 5,
    cookTime: 5,
    totalTime: 10,
    servings: 1,
    scalingFactor: 1,
    nutrition: {
      calories: 280,
      protein: 18,
      carbs: 3,
      fat: 22,
      fiber: 0,
      sodium: 380,
      sugar: 1
    },
    vitamins: {
      vitaminA: 18,
      vitaminD: 15,
      vitaminB12: 30,
      vitaminK: 5
    },
    healthTags: ["high-protein", "low-carb", "gluten-free", "keto"],
    allergens: ["eggs", "dairy"],
    ingredients: [
      { id: "eggs_3", displayName: "Large Eggs", quantity: 3, unit: "whole", category: "protein", cost: 15 },
      { id: "butter_3", displayName: "Butter", quantity: 2, unit: "tbsp", category: "fat", cost: 10 },
      { id: "cheese_1", displayName: "Gruyere Cheese", quantity: 2, unit: "tbsp", category: "dairy", preparationNotes: "Finely grated", cost: 20 },
      { id: "herbs_1", displayName: "Fresh Chives", quantity: 1, unit: "tbsp", category: "spice", preparationNotes: "Finely chopped", cost: 8 }
    ],
    totalCost: 53,
    steps: [
      {
        id: 1,
        action: "prep",
        title: "Beat Eggs",
        instruction: "Whisk eggs vigorously until fluffy",
        detailedInstruction: "Beat eggs with a fork until the yolks and whites are completely integrated. Season with salt and pepper.",
        miniGame: createMiniGame("stirring", 3),
        cameraAngle: "closeup",
        tools: ["bowl", "whisk"],
        duration: 30,
        tips: ["More beating = fluffier omelette"],
        technique: "Vigorous Whisking",
        completed: false,
        score: 0
      },
      {
        id: 2,
        action: "cook",
        title: "Heat Pan",
        instruction: "Melt butter in non-stick pan over medium heat",
        detailedInstruction: "Heat an 8-inch non-stick pan over medium heat. Add butter and swirl to coat the entire surface.",
        miniGame: createMiniGame("heat_control", 3),
        cameraAngle: "side",
        tools: ["pan"],
        duration: 20,
        tips: ["The butter should foam but not brown"],
        technique: "Pan Preparation",
        completed: false,
        score: 0
      },
      {
        id: 3,
        action: "cook",
        title: "Cook Omelette",
        instruction: "Pour eggs and swirl pan while cooking",
        detailedInstruction: "Pour eggs into pan. Shake the pan constantly while stirring with a fork, creating small curds. When mostly set but still creamy on top, add fillings.",
        miniGame: createMiniGame("stirring", 4),
        cameraAngle: "dynamic",
        tools: ["pan", "spatula"],
        duration: 35,
        tips: ["The omelette should be creamy inside, never rubbery"],
        technique: "French Fold",
        completed: false,
        score: 0
      }
    ],
    unlockRequirements: { playerLevel: 3, coinCost: 50 },
    unlocked: true,
    rewards: { baseXP: 100, baseCoins: 50 },
    originStory: "The French omelette is considered a test of a chef's skill. Auguste Escoffier codified the technique in his classic culinary texts.",
    completionStats: createDefaultCompletionStats()
  },

  // LUNCH RECIPES (5)
  {
    id: "caesar_salad",
    name: "Caesar Salad",
    description: "Crisp romaine lettuce tossed with creamy Caesar dressing, parmesan, and crunchy croutons.",
    category: "lunch",
    cuisine: "american",
    difficulty: 1,
    prepTime: 15,
    cookTime: 0,
    totalTime: 15,
    servings: 2,
    scalingFactor: 1,
    nutrition: {
      calories: 280,
      protein: 8,
      carbs: 18,
      fat: 20,
      fiber: 4,
      sodium: 580,
      sugar: 3
    },
    vitamins: {
      vitaminA: 120,
      vitaminC: 25,
      vitaminK: 180,
      folate: 35
    },
    healthTags: ["vegetarian", "high-protein"],
    allergens: ["gluten", "dairy", "eggs", "fish"],
    ingredients: [
      { id: "lettuce_1", displayName: "Romaine Lettuce", quantity: 1, unit: "head", category: "vegetable", preparationNotes: "Washed and dried", cost: 15 },
      { id: "parmesan_1", displayName: "Parmesan Cheese", quantity: 0.5, unit: "cup", category: "dairy", preparationNotes: "Shaved", cost: 25 },
      { id: "croutons_1", displayName: "Croutons", quantity: 1, unit: "cup", category: "grain", cost: 10 },
      { id: "dressing_1", displayName: "Caesar Dressing", quantity: 0.25, unit: "cup", category: "sauce", cost: 15 }
    ],
    totalCost: 65,
    steps: [
      {
        id: 1,
        action: "chop",
        title: "Chop Lettuce",
        instruction: "Chop the romaine lettuce into bite-sized pieces",
        detailedInstruction: "Remove any wilted outer leaves. Cut the head in half lengthwise, then slice into 1-inch pieces. Wash and dry thoroughly.",
        miniGame: createMiniGame("chopping", 2),
        cameraAngle: "overhead",
        tools: ["knife", "cutting_board"],
        duration: 30,
        tips: ["Dry lettuce thoroughly - wet leaves won't hold dressing well"],
        technique: "Chiffonade Cut",
        completed: false,
        score: 0
      },
      {
        id: 2,
        action: "combine",
        title: "Mix Salad",
        instruction: "Toss lettuce with dressing and toppings",
        detailedInstruction: "Place lettuce in a large bowl. Add dressing and toss until evenly coated. Add croutons and parmesan, toss gently one more time.",
        miniGame: createMiniGame("stirring", 2),
        cameraAngle: "overhead",
        tools: ["bowl", "tongs"],
        duration: 25,
        tips: ["Add dressing gradually - you can always add more"],
        technique: "Tossing",
        completed: false,
        score: 0
      }
    ],
    unlockRequirements: { playerLevel: 1, coinCost: 0 },
    unlocked: true,
    rewards: { baseXP: 50, baseCoins: 25 },
    originStory: "Created in 1924 by Italian immigrant Caesar Cardini in Tijuana, Mexico, during a busy Fourth of July rush.",
    completionStats: createDefaultCompletionStats()
  },
  {
    id: "grilled_cheese",
    name: "Grilled Cheese Sandwich",
    description: "The ultimate comfort food - perfectly golden, buttery bread with melted cheese inside.",
    category: "lunch",
    cuisine: "american",
    difficulty: 1,
    prepTime: 5,
    cookTime: 10,
    totalTime: 15,
    servings: 1,
    scalingFactor: 1,
    nutrition: {
      calories: 440,
      protein: 16,
      carbs: 32,
      fat: 28,
      fiber: 2,
      sodium: 780,
      sugar: 4
    },
    vitamins: {
      vitaminA: 12,
      vitaminD: 5,
      vitaminB12: 15,
      riboflavin: 10
    },
    healthTags: ["vegetarian"],
    allergens: ["gluten", "dairy"],
    ingredients: [
      { id: "bread_1", displayName: "Bread Slices", quantity: 2, unit: "slices", category: "grain", cost: 8 },
      { id: "cheese_2", displayName: "Cheddar Cheese", quantity: 3, unit: "slices", category: "dairy", cost: 18 },
      { id: "butter_4", displayName: "Butter", quantity: 2, unit: "tbsp", category: "fat", cost: 10 }
    ],
    totalCost: 36,
    steps: [
      {
        id: 1,
        action: "cook",
        title: "Heat Pan",
        instruction: "Heat a pan with butter over medium-low heat",
        detailedInstruction: "Melt butter in a skillet over medium-low heat. The key is patience - lower heat means better melting and even browning.",
        miniGame: createMiniGame("heat_control", 2),
        cameraAngle: "side",
        tools: ["pan", "spatula"],
        duration: 20,
        tips: ["Medium-low heat prevents burning while cheese melts"],
        technique: "Low and Slow",
        completed: false,
        score: 0
      },
      {
        id: 2,
        action: "cook",
        title: "Grill Sandwich",
        instruction: "Cook sandwich until golden brown on both sides",
        detailedInstruction: "Place assembled sandwich in pan. Cook 3-4 minutes per side until golden brown and cheese is melted. Press gently with spatula.",
        miniGame: createMiniGame("heat_control", 3),
        cameraAngle: "dynamic",
        tools: ["pan", "spatula"],
        duration: 50,
        tips: ["Cover the pan to help cheese melt faster"],
        technique: "Perfect Flip",
        completed: false,
        score: 0
      }
    ],
    unlockRequirements: { playerLevel: 1, coinCost: 0 },
    unlocked: true,
    rewards: { baseXP: 50, baseCoins: 25 },
    originStory: "Grilled cheese sandwiches became popular in America during the 1920s when processed cheese and sliced bread became widely available.",
    completionStats: createDefaultCompletionStats()
  },
  {
    id: "club_sandwich",
    name: "Classic Club Sandwich",
    description: "A triple-decker sandwich with turkey, bacon, lettuce, tomato, and mayo.",
    category: "lunch",
    cuisine: "american",
    difficulty: 2,
    prepTime: 15,
    cookTime: 10,
    totalTime: 25,
    servings: 1,
    scalingFactor: 1,
    nutrition: {
      calories: 520,
      protein: 35,
      carbs: 38,
      fat: 26,
      fiber: 4,
      sodium: 1200,
      sugar: 6
    },
    vitamins: {
      vitaminA: 15,
      vitaminC: 20,
      vitaminB6: 25,
      niacin: 35
    },
    healthTags: ["high-protein"],
    allergens: ["gluten", "eggs"],
    ingredients: [
      { id: "bread_2", displayName: "White Bread", quantity: 3, unit: "slices", category: "grain", preparationNotes: "Toasted", cost: 12 },
      { id: "turkey_1", displayName: "Turkey Breast", quantity: 4, unit: "oz", category: "protein", preparationNotes: "Sliced", cost: 30 },
      { id: "bacon_1", displayName: "Bacon", quantity: 4, unit: "strips", category: "protein", preparationNotes: "Cooked crispy", cost: 25 },
      { id: "lettuce_2", displayName: "Iceberg Lettuce", quantity: 2, unit: "leaves", category: "vegetable", cost: 5 },
      { id: "tomato_1", displayName: "Tomato", quantity: 4, unit: "slices", category: "vegetable", cost: 10 },
      { id: "mayo_1", displayName: "Mayonnaise", quantity: 2, unit: "tbsp", category: "sauce", cost: 5 }
    ],
    totalCost: 87,
    steps: [
      {
        id: 1,
        action: "cook",
        title: "Cook Bacon",
        instruction: "Fry bacon until crispy",
        detailedInstruction: "Lay bacon strips in a cold pan, then turn heat to medium. Cook, flipping occasionally, until crispy. Drain on paper towels.",
        miniGame: createMiniGame("heat_control", 3),
        cameraAngle: "side",
        tools: ["pan", "tongs"],
        duration: 40,
        tips: ["Starting with a cold pan renders fat better"],
        technique: "Rendering Fat",
        completed: false,
        score: 0
      },
      {
        id: 2,
        action: "chop",
        title: "Slice Tomatoes",
        instruction: "Slice tomatoes evenly",
        detailedInstruction: "Use a sharp knife to slice tomatoes about 1/4 inch thick. Even slices ensure even distribution in the sandwich.",
        miniGame: createMiniGame("chopping", 2),
        cameraAngle: "closeup",
        tools: ["knife", "cutting_board"],
        duration: 25,
        tips: ["A serrated knife works best for tomatoes"],
        technique: "Even Slicing",
        completed: false,
        score: 0
      },
      {
        id: 3,
        action: "plate",
        title: "Assemble Sandwich",
        instruction: "Layer ingredients and stack the sandwich",
        detailedInstruction: "Toast bread. Spread mayo on each slice. Layer turkey and tomato on first slice, add second slice, then lettuce and bacon, top with third slice. Cut diagonally.",
        miniGame: createMiniGame("plating", 3),
        cameraAngle: "overhead",
        tools: ["knife", "cutting_board"],
        duration: 35,
        tips: ["Use toothpicks to hold the layers together"],
        technique: "Layering",
        completed: false,
        score: 0
      }
    ],
    unlockRequirements: { playerLevel: 2, coinCost: 30 },
    unlocked: true,
    rewards: { baseXP: 80, baseCoins: 40 },
    originStory: "The club sandwich originated in American country clubs in the late 1800s, hence the name.",
    completionStats: createDefaultCompletionStats()
  },
  {
    id: "tomato_soup",
    name: "Creamy Tomato Soup",
    description: "A velvety smooth tomato soup with fresh basil and a touch of cream.",
    category: "lunch",
    cuisine: "american",
    difficulty: 2,
    prepTime: 10,
    cookTime: 25,
    totalTime: 35,
    servings: 4,
    scalingFactor: 1,
    nutrition: {
      calories: 180,
      protein: 4,
      carbs: 22,
      fat: 9,
      fiber: 4,
      sodium: 620,
      sugar: 12
    },
    vitamins: {
      vitaminA: 35,
      vitaminC: 45,
      vitaminK: 12,
      vitaminE: 8
    },
    healthTags: ["vegetarian", "gluten-free"],
    allergens: ["dairy"],
    ingredients: [
      { id: "tomatoes_1", displayName: "Canned Tomatoes", quantity: 28, unit: "oz", category: "vegetable", cost: 20 },
      { id: "onion_1", displayName: "Onion", quantity: 1, unit: "medium", category: "vegetable", preparationNotes: "Diced", cost: 8 },
      { id: "garlic_1", displayName: "Garlic", quantity: 3, unit: "cloves", category: "spice", preparationNotes: "Minced", cost: 5 },
      { id: "cream_1", displayName: "Heavy Cream", quantity: 0.5, unit: "cup", category: "dairy", cost: 18 },
      { id: "basil_1", displayName: "Fresh Basil", quantity: 0.25, unit: "cup", category: "spice", preparationNotes: "Chopped", cost: 10 }
    ],
    totalCost: 61,
    steps: [
      {
        id: 1,
        action: "chop",
        title: "Prep Aromatics",
        instruction: "Dice onion and mince garlic",
        detailedInstruction: "Cut onion into small, even dice. Mince garlic finely - smaller pieces mean more flavor released.",
        miniGame: createMiniGame("chopping", 3),
        cameraAngle: "closeup",
        tools: ["knife", "cutting_board"],
        duration: 35,
        tips: ["Chill the onion for 10 minutes to reduce tears"],
        technique: "Fine Dice",
        completed: false,
        score: 0
      },
      {
        id: 2,
        action: "cook",
        title: "Sauté Aromatics",
        instruction: "Cook onion and garlic until fragrant",
        detailedInstruction: "Heat olive oil in a pot. Add onion and cook until translucent, about 5 minutes. Add garlic and cook 1 more minute.",
        miniGame: createMiniGame("heat_control", 2),
        cameraAngle: "side",
        tools: ["pot", "spatula"],
        duration: 30,
        tips: ["Don't brown the garlic or it will taste bitter"],
        technique: "Sweating",
        completed: false,
        score: 0
      },
      {
        id: 3,
        action: "simmer",
        title: "Simmer Soup",
        instruction: "Add tomatoes and simmer to develop flavor",
        detailedInstruction: "Add canned tomatoes with juices. Bring to a boil, then reduce heat and simmer for 20 minutes.",
        miniGame: createMiniGame("heat_control", 3),
        cameraAngle: "side",
        tools: ["pot", "ladle"],
        duration: 45,
        tips: ["Longer simmering develops deeper flavor"],
        technique: "Simmering",
        completed: false,
        score: 0
      },
      {
        id: 4,
        action: "combine",
        title: "Blend & Finish",
        instruction: "Blend soup and stir in cream",
        detailedInstruction: "Blend until smooth using an immersion blender. Stir in cream and fresh basil. Season to taste.",
        miniGame: createMiniGame("stirring", 2),
        cameraAngle: "overhead",
        tools: ["pot", "ladle", "mixer"],
        duration: 30,
        tips: ["Let soup cool slightly before blending for safety"],
        technique: "Emulsifying",
        completed: false,
        score: 0
      }
    ],
    unlockRequirements: { playerLevel: 2, coinCost: 40 },
    unlocked: true,
    rewards: { baseXP: 90, baseCoins: 45 },
    originStory: "Tomato soup became an American staple after Campbell's introduced their condensed version in 1897.",
    completionStats: createDefaultCompletionStats()
  },
  {
    id: "chicken_wrap",
    name: "Grilled Chicken Wrap",
    description: "A healthy wrap filled with grilled chicken, fresh vegetables, and tangy sauce.",
    category: "lunch",
    cuisine: "american",
    difficulty: 2,
    prepTime: 15,
    cookTime: 15,
    totalTime: 30,
    servings: 2,
    scalingFactor: 1,
    nutrition: {
      calories: 380,
      protein: 32,
      carbs: 28,
      fat: 16,
      fiber: 4,
      sodium: 680,
      sugar: 4
    },
    vitamins: {
      vitaminA: 45,
      vitaminC: 30,
      vitaminB6: 40,
      niacin: 55
    },
    healthTags: ["high-protein", "low-carb"],
    allergens: ["gluten"],
    ingredients: [
      { id: "chicken_1", displayName: "Chicken Breast", quantity: 8, unit: "oz", category: "protein", cost: 40 },
      { id: "tortilla_1", displayName: "Flour Tortillas", quantity: 2, unit: "large", category: "grain", cost: 12 },
      { id: "lettuce_3", displayName: "Mixed Greens", quantity: 2, unit: "cups", category: "vegetable", cost: 10 },
      { id: "tomato_2", displayName: "Cherry Tomatoes", quantity: 0.5, unit: "cup", category: "vegetable", preparationNotes: "Halved", cost: 12 },
      { id: "ranch_1", displayName: "Ranch Dressing", quantity: 2, unit: "tbsp", category: "sauce", cost: 8 }
    ],
    totalCost: 82,
    steps: [
      {
        id: 1,
        action: "cook",
        title: "Grill Chicken",
        instruction: "Grill chicken breast to perfection",
        detailedInstruction: "Season chicken with salt and pepper. Grill over medium-high heat for 6-7 minutes per side until internal temperature reaches 165°F.",
        miniGame: createMiniGame("heat_control", 3),
        cameraAngle: "side",
        tools: ["pan", "tongs"],
        duration: 50,
        tips: ["Let chicken rest 5 minutes before slicing"],
        technique: "Grilling",
        completed: false,
        score: 0
      },
      {
        id: 2,
        action: "chop",
        title: "Slice Chicken",
        instruction: "Slice grilled chicken into strips",
        detailedInstruction: "Let chicken rest, then slice against the grain into thin strips for maximum tenderness.",
        miniGame: createMiniGame("chopping", 2),
        cameraAngle: "closeup",
        tools: ["knife", "cutting_board"],
        duration: 25,
        tips: ["Cutting against the grain makes meat more tender"],
        technique: "Slicing",
        completed: false,
        score: 0
      },
      {
        id: 3,
        action: "plate",
        title: "Assemble Wrap",
        instruction: "Layer ingredients and roll the wrap",
        detailedInstruction: "Warm tortilla. Layer greens, chicken, tomatoes, and drizzle with dressing. Fold sides in, then roll tightly from bottom.",
        miniGame: createMiniGame("plating", 2),
        cameraAngle: "overhead",
        tools: ["cutting_board"],
        duration: 30,
        tips: ["Don't overfill or the wrap won't close properly"],
        technique: "Wrapping",
        completed: false,
        score: 0
      }
    ],
    unlockRequirements: { playerLevel: 3, coinCost: 50 },
    unlocked: true,
    rewards: { baseXP: 85, baseCoins: 42 },
    originStory: "Wraps gained popularity in the 1990s as a healthier alternative to sandwiches.",
    completionStats: createDefaultCompletionStats()
  },

  // DINNER RECIPES (4)
  {
    id: "beef_stirfry",
    name: "Beef Stir-Fry",
    description: "Tender strips of beef with colorful vegetables in a savory soy-ginger sauce.",
    category: "dinner",
    cuisine: "asian",
    difficulty: 3,
    prepTime: 20,
    cookTime: 15,
    totalTime: 35,
    servings: 4,
    scalingFactor: 1,
    nutrition: {
      calories: 380,
      protein: 28,
      carbs: 22,
      fat: 20,
      fiber: 4,
      sodium: 920,
      sugar: 8
    },
    vitamins: {
      vitaminA: 85,
      vitaminC: 120,
      vitaminB12: 45,
      vitaminB6: 35
    },
    healthTags: ["high-protein", "dairy-free"],
    allergens: ["soy"],
    ingredients: [
      { id: "beef_1", displayName: "Beef Sirloin", quantity: 1, unit: "lb", category: "protein", preparationNotes: "Sliced thin against grain", cost: 60 },
      { id: "bellpepper_1", displayName: "Bell Pepper", quantity: 2, unit: "medium", category: "vegetable", preparationNotes: "Sliced", cost: 18 },
      { id: "onion_2", displayName: "Onion", quantity: 1, unit: "medium", category: "vegetable", preparationNotes: "Sliced", cost: 8 },
      { id: "soysauce_1", displayName: "Soy Sauce", quantity: 3, unit: "tbsp", category: "sauce", cost: 8 },
      { id: "garlic_2", displayName: "Garlic", quantity: 4, unit: "cloves", category: "spice", preparationNotes: "Minced", cost: 6 }
    ],
    totalCost: 100,
    steps: [
      {
        id: 1,
        action: "chop",
        title: "Slice Beef",
        instruction: "Slice beef into thin strips against the grain",
        detailedInstruction: "Freeze beef for 15 minutes for easier slicing. Cut against the grain into 1/4 inch strips.",
        miniGame: createMiniGame("chopping", 4),
        cameraAngle: "closeup",
        tools: ["knife", "cutting_board"],
        duration: 45,
        tips: ["Partially freezing meat makes slicing much easier"],
        technique: "Thin Slicing",
        completed: false,
        score: 0
      },
      {
        id: 2,
        action: "chop",
        title: "Chop Vegetables",
        instruction: "Dice bell peppers and slice onions",
        detailedInstruction: "Cut peppers into strips, removing seeds. Slice onion into thin half-moons. Keep sizes uniform for even cooking.",
        miniGame: createMiniGame("chopping", 3),
        cameraAngle: "overhead",
        tools: ["knife", "cutting_board"],
        duration: 40,
        tips: ["Uniform cuts ensure even cooking"],
        technique: "Julienne",
        completed: false,
        score: 0
      },
      {
        id: 3,
        action: "cook",
        title: "Heat Wok",
        instruction: "Heat wok over high heat until smoking",
        detailedInstruction: "Heat wok until a drop of water evaporates immediately. Add oil and swirl to coat.",
        miniGame: createMiniGame("heat_control", 4),
        cameraAngle: "side",
        tools: ["wok"],
        duration: 25,
        tips: ["A properly heated wok is essential for the 'wok hei' flavor"],
        technique: "Wok Preheating",
        completed: false,
        score: 0
      },
      {
        id: 4,
        action: "cook",
        title: "Sear Beef",
        instruction: "Sear beef quickly, then add vegetables",
        detailedInstruction: "Add beef in a single layer. Don't stir for 30 seconds to get a good sear. Then stir-fry 1-2 minutes. Remove and set aside.",
        miniGame: createMiniGame("heat_control", 4),
        cameraAngle: "dynamic",
        tools: ["wok", "spatula"],
        duration: 40,
        tips: ["Don't crowd the wok - cook in batches if needed"],
        technique: "Searing",
        completed: false,
        score: 0
      },
      {
        id: 5,
        action: "combine",
        title: "Stir-Fry",
        instruction: "Toss everything with sauce until coated",
        detailedInstruction: "Add vegetables, stir-fry 2-3 minutes. Return beef, add sauce, and toss until everything is coated and heated through.",
        miniGame: createMiniGame("stirring", 3),
        cameraAngle: "overhead",
        tools: ["wok", "spatula"],
        duration: 30,
        tips: ["Toss from the wrist for authentic stir-fry technique"],
        technique: "Tossing",
        completed: false,
        score: 0
      }
    ],
    unlockRequirements: { playerLevel: 4, coinCost: 75 },
    unlocked: true,
    rewards: { baseXP: 120, baseCoins: 60 },
    originStory: "Stir-frying originated in China over 2000 years ago. The technique spread globally as Chinese immigrants shared their culinary traditions.",
    completionStats: createDefaultCompletionStats()
  },
  {
    id: "pasta_marinara",
    name: "Pasta Marinara",
    description: "Al dente pasta with a fresh, vibrant tomato-basil sauce.",
    category: "dinner",
    cuisine: "italian",
    difficulty: 2,
    prepTime: 10,
    cookTime: 25,
    totalTime: 35,
    servings: 4,
    scalingFactor: 1,
    nutrition: {
      calories: 420,
      protein: 14,
      carbs: 72,
      fat: 10,
      fiber: 6,
      sodium: 580,
      sugar: 10
    },
    vitamins: {
      vitaminA: 25,
      vitaminC: 35,
      vitaminK: 18,
      folate: 45
    },
    healthTags: ["vegetarian", "vegan", "dairy-free"],
    allergens: ["gluten"],
    ingredients: [
      { id: "pasta_1", displayName: "Spaghetti", quantity: 1, unit: "lb", category: "grain", cost: 15 },
      { id: "tomatoes_2", displayName: "San Marzano Tomatoes", quantity: 28, unit: "oz", category: "vegetable", preparationNotes: "Crushed", cost: 25 },
      { id: "garlic_3", displayName: "Garlic", quantity: 4, unit: "cloves", category: "spice", preparationNotes: "Minced", cost: 6 },
      { id: "basil_2", displayName: "Fresh Basil", quantity: 0.5, unit: "cup", category: "spice", preparationNotes: "Chopped", cost: 12 },
      { id: "oliveoil_1", displayName: "Extra Virgin Olive Oil", quantity: 3, unit: "tbsp", category: "fat", cost: 15 }
    ],
    totalCost: 73,
    steps: [
      {
        id: 1,
        action: "chop",
        title: "Chop Tomatoes",
        instruction: "Dice fresh tomatoes and mince garlic",
        detailedInstruction: "If using fresh tomatoes, core and dice. Mince garlic finely - it should almost become a paste.",
        miniGame: createMiniGame("chopping", 3),
        cameraAngle: "closeup",
        tools: ["knife", "cutting_board"],
        duration: 35,
        tips: ["Room temperature tomatoes have more flavor"],
        technique: "Mincing",
        completed: false,
        score: 0
      },
      {
        id: 2,
        action: "cook",
        title: "Cook Garlic",
        instruction: "Sauté garlic in olive oil until fragrant",
        detailedInstruction: "Heat olive oil over medium heat. Add garlic and cook until golden and fragrant, about 1 minute. Don't let it brown.",
        miniGame: createMiniGame("heat_control", 3),
        cameraAngle: "closeup",
        tools: ["pan", "spatula"],
        duration: 20,
        tips: ["Garlic goes from perfect to burnt very quickly"],
        technique: "Infusing Oil",
        completed: false,
        score: 0
      },
      {
        id: 3,
        action: "simmer",
        title: "Simmer Sauce",
        instruction: "Add tomatoes and simmer for 15 minutes",
        detailedInstruction: "Add crushed tomatoes. Bring to a simmer and cook for 15-20 minutes until slightly thickened. Season with salt.",
        miniGame: createMiniGame("heat_control", 2),
        cameraAngle: "side",
        tools: ["pan", "ladle"],
        duration: 45,
        tips: ["Add a splash of pasta water to loosen if needed"],
        technique: "Simmering",
        completed: false,
        score: 0
      },
      {
        id: 4,
        action: "combine",
        title: "Toss Pasta",
        instruction: "Mix cooked pasta with the sauce",
        detailedInstruction: "Cook pasta until al dente. Reserve 1 cup pasta water. Drain and add to sauce. Toss, adding pasta water as needed. Finish with fresh basil.",
        miniGame: createMiniGame("stirring", 2),
        cameraAngle: "overhead",
        tools: ["pot", "tongs"],
        duration: 25,
        tips: ["Pasta water is liquid gold - it helps sauce cling to pasta"],
        technique: "Finishing in Sauce",
        completed: false,
        score: 0
      }
    ],
    unlockRequirements: { playerLevel: 2, coinCost: 35 },
    unlocked: true,
    rewards: { baseXP: 90, baseCoins: 45 },
    originStory: "Marinara sauce has been a staple of Italian cooking since the 16th century when tomatoes arrived from the Americas.",
    completionStats: createDefaultCompletionStats()
  },
  {
    id: "chicken_stirfry",
    name: "Chicken Stir-Fry",
    description: "Juicy chicken with broccoli and carrots in a ginger-soy glaze.",
    category: "dinner",
    cuisine: "chinese",
    difficulty: 3,
    prepTime: 20,
    cookTime: 15,
    totalTime: 35,
    servings: 4,
    scalingFactor: 1,
    nutrition: {
      calories: 320,
      protein: 32,
      carbs: 18,
      fat: 14,
      fiber: 4,
      sodium: 780,
      sugar: 6
    },
    vitamins: {
      vitaminA: 120,
      vitaminC: 95,
      vitaminB6: 45,
      vitaminK: 85
    },
    healthTags: ["high-protein", "low-carb", "dairy-free"],
    allergens: ["soy"],
    ingredients: [
      { id: "chicken_2", displayName: "Chicken Breast", quantity: 1, unit: "lb", category: "protein", preparationNotes: "Cubed", cost: 45 },
      { id: "broccoli_1", displayName: "Broccoli", quantity: 2, unit: "cups", category: "vegetable", preparationNotes: "Florets", cost: 15 },
      { id: "carrot_1", displayName: "Carrots", quantity: 2, unit: "medium", category: "vegetable", preparationNotes: "Sliced", cost: 8 },
      { id: "soysauce_2", displayName: "Soy Sauce", quantity: 3, unit: "tbsp", category: "sauce", cost: 8 },
      { id: "ginger_1", displayName: "Fresh Ginger", quantity: 2, unit: "tbsp", category: "spice", preparationNotes: "Minced", cost: 10 }
    ],
    totalCost: 86,
    steps: [
      {
        id: 1,
        action: "chop",
        title: "Slice Chicken",
        instruction: "Cut chicken breast into bite-sized pieces",
        detailedInstruction: "Cut chicken into 1-inch cubes. Uniform size ensures even cooking. Pat dry for better browning.",
        miniGame: createMiniGame("chopping", 3),
        cameraAngle: "closeup",
        tools: ["knife", "cutting_board"],
        duration: 40,
        tips: ["Dry chicken browns better"],
        technique: "Cubing",
        completed: false,
        score: 0
      },
      {
        id: 2,
        action: "chop",
        title: "Prep Vegetables",
        instruction: "Cut broccoli into florets and slice carrots",
        detailedInstruction: "Cut broccoli into bite-sized florets. Slice carrots on the diagonal for better presentation and faster cooking.",
        miniGame: createMiniGame("chopping", 2),
        cameraAngle: "overhead",
        tools: ["knife", "cutting_board"],
        duration: 35,
        tips: ["Diagonal cuts look better and cook faster"],
        technique: "Bias Cut",
        completed: false,
        score: 0
      },
      {
        id: 3,
        action: "cook",
        title: "Stir-Fry Chicken",
        instruction: "Cook chicken over high heat until golden",
        detailedInstruction: "Heat wok until smoking. Add oil, then chicken. Spread in single layer, don't stir for 30 seconds, then stir-fry until golden.",
        miniGame: createMiniGame("heat_control", 4),
        cameraAngle: "dynamic",
        tools: ["wok", "spatula"],
        duration: 35,
        tips: ["High heat and no stirring at first gives good browning"],
        technique: "Wok Cooking",
        completed: false,
        score: 0
      },
      {
        id: 4,
        action: "combine",
        title: "Add Vegetables",
        instruction: "Add vegetables and toss until tender-crisp",
        detailedInstruction: "Add carrots first (they take longer), then broccoli. Stir-fry 3-4 minutes. Add sauce and ginger, toss to coat.",
        miniGame: createMiniGame("stirring", 3),
        cameraAngle: "overhead",
        tools: ["wok", "spatula"],
        duration: 30,
        tips: ["Add vegetables in order of cooking time needed"],
        technique: "Tossing",
        completed: false,
        score: 0
      }
    ],
    unlockRequirements: { playerLevel: 3, coinCost: 60 },
    unlocked: true,
    rewards: { baseXP: 100, baseCoins: 50 },
    originStory: "Chinese stir-fry techniques date back thousands of years, developed to cook quickly over wood fires with minimal fuel.",
    completionStats: createDefaultCompletionStats()
  },
  {
    id: "gourmet_steak",
    name: "Gourmet Steak Dinner",
    description: "Restaurant-quality ribeye with asparagus and creamy mashed potatoes.",
    category: "dinner",
    cuisine: "american",
    difficulty: 4,
    prepTime: 20,
    cookTime: 25,
    totalTime: 45,
    servings: 2,
    scalingFactor: 1,
    nutrition: {
      calories: 680,
      protein: 48,
      carbs: 32,
      fat: 42,
      fiber: 6,
      sodium: 780,
      sugar: 4
    },
    vitamins: {
      vitaminA: 45,
      vitaminB12: 180,
      vitaminB6: 65,
      niacin: 75,
      vitaminK: 55
    },
    healthTags: ["high-protein", "gluten-free"],
    allergens: ["dairy"],
    ingredients: [
      { id: "steak_1", displayName: "Ribeye Steak", quantity: 2, unit: "pieces", category: "protein", preparationNotes: "Room temperature", cost: 120 },
      { id: "asparagus_1", displayName: "Asparagus", quantity: 1, unit: "bunch", category: "vegetable", preparationNotes: "Trimmed", cost: 25 },
      { id: "potato_1", displayName: "Yukon Gold Potatoes", quantity: 1, unit: "lb", category: "vegetable", cost: 15 },
      { id: "winesauce_1", displayName: "Red Wine", quantity: 0.5, unit: "cup", category: "sauce", cost: 20 },
      { id: "herbs_2", displayName: "Fresh Thyme", quantity: 4, unit: "sprigs", category: "spice", cost: 8 }
    ],
    totalCost: 188,
    steps: [
      {
        id: 1,
        action: "chop",
        title: "Prep Asparagus",
        instruction: "Trim and chop the asparagus",
        detailedInstruction: "Hold each end and bend until it snaps - it naturally breaks where tender meets tough. Discard the woody ends.",
        miniGame: createMiniGame("chopping", 2),
        cameraAngle: "closeup",
        tools: ["knife", "cutting_board"],
        duration: 30,
        tips: ["The natural snap point shows where the tender part begins"],
        technique: "Trimming",
        completed: false,
        score: 0
      },
      {
        id: 2,
        action: "measure",
        title: "Make Sauce",
        instruction: "Measure and combine sauce ingredients",
        detailedInstruction: "Measure red wine, butter, and aromatics. Set aside for the pan sauce after cooking the steak.",
        miniGame: createMiniGame("measuring", 3),
        cameraAngle: "closeup",
        tools: ["measuring_cup", "bowl"],
        duration: 40,
        tips: ["Mise en place - have everything ready before you start cooking"],
        technique: "Preparation",
        completed: false,
        score: 0
      },
      {
        id: 3,
        action: "cook",
        title: "Sear Steak",
        instruction: "Sear steak to perfect medium-rare",
        detailedInstruction: "Season steak generously. Heat cast iron until smoking. Sear 3-4 minutes per side for medium-rare. Rest 5 minutes before slicing.",
        miniGame: createMiniGame("heat_control", 5),
        cameraAngle: "dynamic",
        tools: ["pan", "tongs"],
        duration: 45,
        tips: ["A meat thermometer ensures perfect doneness: 130°F for medium-rare"],
        technique: "Searing",
        completed: false,
        score: 0
      },
      {
        id: 4,
        action: "combine",
        title: "Make Mash",
        instruction: "Whip potatoes until creamy and smooth",
        detailedInstruction: "Boil potatoes until tender. Drain and mash while hot. Add warm cream and butter, whip until fluffy. Season well.",
        miniGame: createMiniGame("stirring", 3),
        cameraAngle: "overhead",
        tools: ["pot", "whisk"],
        duration: 35,
        tips: ["Warm dairy prevents gluey mashed potatoes"],
        technique: "Mashing",
        completed: false,
        score: 0
      },
      {
        id: 5,
        action: "plate",
        title: "Plate Dish",
        instruction: "Arrange the steak, vegetables, and sauce beautifully",
        detailedInstruction: "Place mashed potatoes in center. Lean sliced steak against them. Arrange asparagus alongside. Drizzle with pan sauce.",
        miniGame: createMiniGame("plating", 4),
        cameraAngle: "overhead",
        tools: ["cutting_board", "ladle"],
        duration: 60,
        tips: ["Think about height, color contrast, and negative space"],
        technique: "Restaurant Plating",
        completed: false,
        score: 0
      }
    ],
    unlockRequirements: { playerLevel: 8, coinCost: 150 },
    unlocked: true,
    rewards: { baseXP: 180, baseCoins: 90, achievementUnlocks: ["steakhouse_master"] },
    originStory: "The modern steakhouse emerged in 19th century America, elevating beef to fine dining status.",
    completionStats: createDefaultCompletionStats()
  },

  // DESSERT RECIPES (2)
  {
    id: "chocolate_cake",
    name: "Chocolate Cake",
    description: "A rich, moist chocolate cake with deep cocoa flavor.",
    category: "dessert",
    cuisine: "american",
    difficulty: 3,
    prepTime: 20,
    cookTime: 35,
    totalTime: 55,
    servings: 12,
    scalingFactor: 1,
    nutrition: {
      calories: 420,
      protein: 6,
      carbs: 58,
      fat: 20,
      fiber: 3,
      sodium: 380,
      sugar: 42
    },
    vitamins: {
      vitaminA: 8,
      vitaminB6: 5,
      riboflavin: 10,
      folate: 8
    },
    healthTags: ["vegetarian"],
    allergens: ["gluten", "eggs", "dairy"],
    ingredients: [
      { id: "flour_2", displayName: "All-Purpose Flour", quantity: 2, unit: "cups", category: "grain", cost: 12 },
      { id: "cocoa_1", displayName: "Cocoa Powder", quantity: 0.75, unit: "cup", category: "other", cost: 18 },
      { id: "eggs_4", displayName: "Large Eggs", quantity: 3, unit: "whole", category: "protein", cost: 15 },
      { id: "sugar_2", displayName: "Sugar", quantity: 2, unit: "cups", category: "sweetener", cost: 10 },
      { id: "butter_5", displayName: "Butter", quantity: 0.5, unit: "cup", category: "fat", cost: 20 },
      { id: "milk_2", displayName: "Buttermilk", quantity: 1, unit: "cup", category: "dairy", cost: 15 }
    ],
    totalCost: 90,
    steps: [
      {
        id: 1,
        action: "measure",
        title: "Measure Ingredients",
        instruction: "Carefully measure flour, sugar, and cocoa powder",
        detailedInstruction: "Use the spoon-and-level method for flour. Pack brown sugar. Sift cocoa to remove lumps.",
        miniGame: createMiniGame("measuring", 3),
        cameraAngle: "closeup",
        tools: ["measuring_cup", "measuring_spoon", "bowl"],
        duration: 45,
        tips: ["Accurate measuring is crucial in baking"],
        technique: "Spoon and Level",
        completed: false,
        score: 0
      },
      {
        id: 2,
        action: "mix",
        title: "Mix Batter",
        instruction: "Combine all ingredients until smooth",
        detailedInstruction: "Cream butter and sugar until fluffy. Add eggs one at a time. Alternate adding dry ingredients and buttermilk, mixing until just combined.",
        miniGame: createMiniGame("stirring", 4),
        cameraAngle: "overhead",
        tools: ["bowl", "mixer", "spatula"],
        duration: 40,
        tips: ["Don't overmix after adding flour - it develops gluten and makes cake tough"],
        technique: "Creaming Method",
        completed: false,
        score: 0
      },
      {
        id: 3,
        action: "bake",
        title: "Bake Cake",
        instruction: "Bake at 350°F until a toothpick comes out clean",
        detailedInstruction: "Pour batter into prepared pans. Bake at 350°F for 30-35 minutes. Test with a toothpick - it should come out with a few moist crumbs.",
        miniGame: createMiniGame("heat_control", 4),
        cameraAngle: "side",
        tools: ["oven", "baking_sheet"],
        duration: 50,
        tips: ["Don't open the oven door until the last 10 minutes of baking"],
        technique: "Even Baking",
        completed: false,
        score: 0
      }
    ],
    unlockRequirements: { playerLevel: 4, coinCost: 70 },
    unlocked: true,
    rewards: { baseXP: 120, baseCoins: 60 },
    originStory: "Chocolate cake became possible after the invention of Dutch-processed cocoa in 1828, which made chocolate easier to mix into batters.",
    completionStats: createDefaultCompletionStats()
  },
  {
    id: "tiramisu",
    name: "Classic Tiramisu",
    description: "An elegant Italian dessert with layers of coffee-soaked ladyfingers and mascarpone cream.",
    category: "dessert",
    cuisine: "italian",
    difficulty: 4,
    prepTime: 30,
    cookTime: 0,
    totalTime: 30,
    servings: 8,
    scalingFactor: 1,
    nutrition: {
      calories: 380,
      protein: 8,
      carbs: 38,
      fat: 22,
      fiber: 1,
      sodium: 120,
      sugar: 28
    },
    vitamins: {
      vitaminA: 15,
      vitaminB12: 12,
      riboflavin: 15,
      vitaminD: 5
    },
    healthTags: ["vegetarian"],
    allergens: ["eggs", "dairy", "gluten"],
    ingredients: [
      { id: "mascarpone_1", displayName: "Mascarpone", quantity: 16, unit: "oz", category: "dairy", cost: 45 },
      { id: "espresso_1", displayName: "Strong Espresso", quantity: 2, unit: "cups", category: "other", preparationNotes: "Cooled", cost: 15 },
      { id: "ladyfingers_1", displayName: "Ladyfingers", quantity: 24, unit: "cookies", category: "grain", cost: 20 },
      { id: "cocoa_2", displayName: "Cocoa Powder", quantity: 3, unit: "tbsp", category: "other", preparationNotes: "For dusting", cost: 8 },
      { id: "eggs_5", displayName: "Egg Yolks", quantity: 4, unit: "large", category: "protein", cost: 12 },
      { id: "sugar_3", displayName: "Sugar", quantity: 0.75, unit: "cup", category: "sweetener", cost: 8 }
    ],
    totalCost: 108,
    steps: [
      {
        id: 1,
        action: "measure",
        title: "Measure Ingredients",
        instruction: "Measure mascarpone, sugar, and espresso precisely",
        detailedInstruction: "Measure mascarpone and let it come to room temperature. Measure sugar for the zabaglione. Prepare and cool the espresso.",
        miniGame: createMiniGame("measuring", 3),
        cameraAngle: "closeup",
        tools: ["measuring_cup", "measuring_spoon"],
        duration: 40,
        tips: ["Room temperature mascarpone mixes more smoothly"],
        technique: "Precise Measurement",
        completed: false,
        score: 0
      },
      {
        id: 2,
        action: "mix",
        title: "Whip Cream",
        instruction: "Beat eggs and sugar until light and fluffy",
        detailedInstruction: "Whisk egg yolks and sugar over a double boiler until ribbon stage. Remove from heat and continue whisking until cool.",
        miniGame: createMiniGame("stirring", 4),
        cameraAngle: "closeup",
        tools: ["bowl", "whisk"],
        duration: 45,
        tips: ["The zabaglione should triple in volume and form ribbons"],
        technique: "Ribbon Stage",
        completed: false,
        score: 0
      },
      {
        id: 3,
        action: "combine",
        title: "Fold Mixture",
        instruction: "Gently fold mascarpone into the egg mixture",
        detailedInstruction: "Add mascarpone to the cooled zabaglione. Fold gently with a spatula until smooth and creamy. Don't overmix.",
        miniGame: createMiniGame("stirring", 3),
        cameraAngle: "overhead",
        tools: ["bowl", "spatula"],
        duration: 35,
        tips: ["Folding preserves the air - stir and you'll lose the lightness"],
        technique: "Folding",
        completed: false,
        score: 0
      },
      {
        id: 4,
        action: "plate",
        title: "Assemble & Present",
        instruction: "Layer and decorate the tiramisu beautifully",
        detailedInstruction: "Quickly dip ladyfingers in espresso. Layer in dish, add cream, repeat. Refrigerate 4+ hours. Dust with cocoa before serving.",
        miniGame: createMiniGame("plating", 4),
        cameraAngle: "overhead",
        tools: ["bowl", "spatula"],
        duration: 50,
        tips: ["Quick dips only - soggy ladyfingers ruin the texture"],
        technique: "Layering",
        completed: false,
        score: 0
      }
    ],
    unlockRequirements: { playerLevel: 7, coinCost: 120 },
    unlocked: true,
    rewards: { baseXP: 160, baseCoins: 80, achievementUnlocks: ["italian_master"] },
    originStory: "Tiramisu was invented in the 1960s in the Veneto region of Italy. Its name means 'pick me up' in Italian, referring to the espresso.",
    completionStats: createDefaultCompletionStats()
  },

  // SNACK RECIPE (1)
  {
    id: "guacamole",
    name: "Fresh Guacamole",
    description: "Creamy, zesty guacamole made with perfectly ripe avocados and fresh lime.",
    category: "snack",
    cuisine: "mexican",
    difficulty: 1,
    prepTime: 15,
    cookTime: 0,
    totalTime: 15,
    servings: 4,
    scalingFactor: 1,
    nutrition: {
      calories: 160,
      protein: 2,
      carbs: 9,
      fat: 14,
      fiber: 7,
      sodium: 150,
      sugar: 1
    },
    vitamins: {
      vitaminC: 15,
      vitaminE: 12,
      vitaminK: 25,
      vitaminB6: 18,
      folate: 22
    },
    healthTags: ["vegan", "vegetarian", "gluten-free", "dairy-free", "keto", "paleo"],
    allergens: [],
    ingredients: [
      { id: "avocado_1", displayName: "Ripe Avocados", quantity: 3, unit: "medium", category: "fruit", cost: 30 },
      { id: "lime_1", displayName: "Fresh Lime", quantity: 2, unit: "whole", category: "fruit", preparationNotes: "Juiced", cost: 8 },
      { id: "onion_3", displayName: "Red Onion", quantity: 0.25, unit: "cup", category: "vegetable", preparationNotes: "Finely diced", cost: 5 },
      { id: "cilantro_1", displayName: "Fresh Cilantro", quantity: 0.25, unit: "cup", category: "spice", preparationNotes: "Chopped", cost: 8 },
      { id: "jalapeno_1", displayName: "Jalapeño", quantity: 1, unit: "small", category: "vegetable", preparationNotes: "Seeded and minced", cost: 5, optional: true }
    ],
    totalCost: 56,
    steps: [
      {
        id: 1,
        action: "chop",
        title: "Prep Ingredients",
        instruction: "Dice onion, mince jalapeño, and chop cilantro",
        detailedInstruction: "Finely dice the red onion. Seed and mince the jalapeño (wear gloves!). Roughly chop the cilantro leaves.",
        miniGame: createMiniGame("chopping", 2),
        cameraAngle: "closeup",
        tools: ["knife", "cutting_board"],
        duration: 30,
        tips: ["Remove jalapeño seeds for less heat"],
        technique: "Fine Dice",
        completed: false,
        score: 0
      },
      {
        id: 2,
        action: "prep",
        title: "Mash Avocados",
        instruction: "Mash avocados to your desired consistency",
        detailedInstruction: "Cut avocados in half, remove pit. Scoop flesh into bowl. Mash with a fork - leave it chunky for texture or smooth if preferred.",
        miniGame: createMiniGame("stirring", 2),
        cameraAngle: "overhead",
        tools: ["bowl", "spatula"],
        duration: 25,
        tips: ["A few chunks add great texture"],
        technique: "Mashing",
        completed: false,
        score: 0
      },
      {
        id: 3,
        action: "combine",
        title: "Mix Together",
        instruction: "Combine all ingredients and season to taste",
        detailedInstruction: "Add lime juice, onion, cilantro, and jalapeño to the avocado. Mix gently. Season with salt and taste - adjust as needed.",
        miniGame: createMiniGame("stirring", 1),
        cameraAngle: "overhead",
        tools: ["bowl", "spatula"],
        duration: 20,
        tips: ["Lime juice prevents browning and adds brightness"],
        technique: "Gentle Mixing",
        completed: false,
        score: 0
      }
    ],
    unlockRequirements: { playerLevel: 1, coinCost: 0 },
    unlocked: true,
    rewards: { baseXP: 40, baseCoins: 20 },
    originStory: "Guacamole dates back to the Aztecs in the 1500s. The name comes from 'āhuacamolli' - āhuacatl (avocado) + molli (sauce).",
    completionStats: createDefaultCompletionStats()
  }
];

// Helper functions
export function getFullRecipeById(id: string): FullRecipe | undefined {
  return fullRecipes.find(r => r.id === id);
}

export function getFullRecipesByCategory(category: string): FullRecipe[] {
  return fullRecipes.filter(r => r.category === category);
}

export function getFullRecipesByCuisine(cuisine: string): FullRecipe[] {
  return fullRecipes.filter(r => r.cuisine === cuisine);
}

export function getFullRecipesByDifficulty(difficulty: number): FullRecipe[] {
  return fullRecipes.filter(r => r.difficulty === difficulty);
}

export function getFullRecipesByHealthTag(tag: string): FullRecipe[] {
  return fullRecipes.filter(r => r.healthTags.includes(tag as any));
}

export function getUnlockedRecipes(): FullRecipe[] {
  return fullRecipes.filter(r => r.unlocked);
}

export function getLockedRecipes(): FullRecipe[] {
  return fullRecipes.filter(r => !r.unlocked);
}

export function searchRecipes(query: string): FullRecipe[] {
  const lowerQuery = query.toLowerCase();
  return fullRecipes.filter(r => 
    r.name.toLowerCase().includes(lowerQuery) ||
    r.description.toLowerCase().includes(lowerQuery) ||
    r.ingredients.some(i => i.displayName.toLowerCase().includes(lowerQuery))
  );
}

export function getRecipesByTimeRange(minTime: number, maxTime: number): FullRecipe[] {
  return fullRecipes.filter(r => r.totalTime >= minTime && r.totalTime <= maxTime);
}

export function sortRecipes(recipes: FullRecipe[], sortBy: "name" | "difficulty" | "time" | "category"): FullRecipe[] {
  return [...recipes].sort((a, b) => {
    switch (sortBy) {
      case "name":
        return a.name.localeCompare(b.name);
      case "difficulty":
        return a.difficulty - b.difficulty;
      case "time":
        return a.totalTime - b.totalTime;
      case "category":
        return a.category.localeCompare(b.category);
      default:
        return 0;
    }
  });
}
