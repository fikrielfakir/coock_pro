import type { Recipe } from "@/lib/stores/useCookingGame";

export const recipes: Recipe[] = [
  {
    id: "scrambled_eggs",
    name: "Scrambled Eggs",
    category: "breakfast",
    difficulty: "easy",
    ingredients: ["Eggs", "Butter", "Salt", "Pepper"],
    steps: [
      {
        id: 1,
        action: "prep",
        title: "Crack the Eggs",
        instruction: "Crack 3 eggs into a bowl and beat them well",
        miniGame: "stirring",
        duration: 30,
        completed: false,
        score: 0
      },
      {
        id: 2,
        action: "cook",
        title: "Heat the Pan",
        instruction: "Melt butter in a pan over medium heat",
        miniGame: "heat_control",
        duration: 20,
        completed: false,
        score: 0
      },
      {
        id: 3,
        action: "cook",
        title: "Cook the Eggs",
        instruction: "Pour eggs into pan and stir gently until cooked",
        miniGame: "stirring",
        duration: 45,
        completed: false,
        score: 0
      }
    ],
    unlocked: true,
    bestStars: 0
  },
  {
    id: "pancakes",
    name: "Fluffy Pancakes",
    category: "breakfast",
    difficulty: "easy",
    ingredients: ["Flour", "Eggs", "Milk", "Butter", "Sugar"],
    steps: [
      {
        id: 1,
        action: "prep",
        title: "Mix Batter",
        instruction: "Combine flour, eggs, milk, and sugar in a bowl",
        miniGame: "stirring",
        duration: 40,
        completed: false,
        score: 0
      },
      {
        id: 2,
        action: "cook",
        title: "Heat Griddle",
        instruction: "Heat a griddle with butter over medium heat",
        miniGame: "heat_control",
        duration: 25,
        completed: false,
        score: 0
      },
      {
        id: 3,
        action: "cook",
        title: "Cook Pancakes",
        instruction: "Pour batter and flip when bubbles form",
        miniGame: "heat_control",
        duration: 60,
        completed: false,
        score: 0
      }
    ],
    unlocked: true,
    bestStars: 0
  },
  {
    id: "caesar_salad",
    name: "Caesar Salad",
    category: "lunch",
    difficulty: "easy",
    ingredients: ["Romaine Lettuce", "Parmesan", "Croutons", "Caesar Dressing"],
    steps: [
      {
        id: 1,
        action: "prep",
        title: "Chop Lettuce",
        instruction: "Chop the romaine lettuce into bite-sized pieces",
        miniGame: "chopping",
        duration: 30,
        completed: false,
        score: 0
      },
      {
        id: 2,
        action: "prep",
        title: "Mix Salad",
        instruction: "Toss lettuce with dressing and toppings",
        miniGame: "stirring",
        duration: 25,
        completed: false,
        score: 0
      }
    ],
    unlocked: true,
    bestStars: 0
  },
  {
    id: "grilled_cheese",
    name: "Grilled Cheese Sandwich",
    category: "lunch",
    difficulty: "easy",
    ingredients: ["Bread", "Cheese", "Butter"],
    steps: [
      {
        id: 1,
        action: "cook",
        title: "Heat Pan",
        instruction: "Heat a pan with butter over medium-low heat",
        miniGame: "heat_control",
        duration: 20,
        completed: false,
        score: 0
      },
      {
        id: 2,
        action: "cook",
        title: "Grill Sandwich",
        instruction: "Cook sandwich until golden brown on both sides",
        miniGame: "heat_control",
        duration: 50,
        completed: false,
        score: 0
      }
    ],
    unlocked: true,
    bestStars: 0
  },
  {
    id: "beef_stirfry",
    name: "Beef Stir-Fry",
    category: "dinner",
    difficulty: "medium",
    ingredients: ["Beef Sirloin", "Bell Pepper", "Onion", "Soy Sauce", "Garlic"],
    steps: [
      {
        id: 1,
        action: "prep",
        title: "Slice Beef",
        instruction: "Slice beef into thin strips against the grain",
        miniGame: "chopping",
        duration: 45,
        completed: false,
        score: 0
      },
      {
        id: 2,
        action: "prep",
        title: "Chop Vegetables",
        instruction: "Dice bell peppers and slice onions",
        miniGame: "chopping",
        duration: 40,
        completed: false,
        score: 0
      },
      {
        id: 3,
        action: "cook",
        title: "Heat Wok",
        instruction: "Heat wok over high heat until smoking",
        miniGame: "heat_control",
        duration: 25,
        completed: false,
        score: 0
      },
      {
        id: 4,
        action: "cook",
        title: "Sear Beef",
        instruction: "Sear beef quickly, then add vegetables",
        miniGame: "heat_control",
        duration: 40,
        completed: false,
        score: 0
      },
      {
        id: 5,
        action: "cook",
        title: "Stir-Fry",
        instruction: "Toss everything with sauce until coated",
        miniGame: "stirring",
        duration: 30,
        completed: false,
        score: 0
      }
    ],
    unlocked: true,
    bestStars: 0
  },
  {
    id: "pasta_marinara",
    name: "Pasta Marinara",
    category: "dinner",
    difficulty: "medium",
    ingredients: ["Pasta", "Tomatoes", "Garlic", "Basil", "Olive Oil"],
    steps: [
      {
        id: 1,
        action: "prep",
        title: "Chop Tomatoes",
        instruction: "Dice fresh tomatoes and mince garlic",
        miniGame: "chopping",
        duration: 35,
        completed: false,
        score: 0
      },
      {
        id: 2,
        action: "cook",
        title: "Cook Garlic",
        instruction: "Sauté garlic in olive oil until fragrant",
        miniGame: "heat_control",
        duration: 20,
        completed: false,
        score: 0
      },
      {
        id: 3,
        action: "cook",
        title: "Simmer Sauce",
        instruction: "Add tomatoes and simmer for 15 minutes",
        miniGame: "heat_control",
        duration: 45,
        completed: false,
        score: 0
      },
      {
        id: 4,
        action: "combine",
        title: "Toss Pasta",
        instruction: "Mix cooked pasta with the sauce",
        miniGame: "stirring",
        duration: 25,
        completed: false,
        score: 0
      }
    ],
    unlocked: true,
    bestStars: 0
  },
  {
    id: "omelette",
    name: "French Omelette",
    category: "breakfast",
    difficulty: "medium",
    ingredients: ["Eggs", "Butter", "Cheese", "Herbs"],
    steps: [
      {
        id: 1,
        action: "prep",
        title: "Beat Eggs",
        instruction: "Whisk eggs vigorously until fluffy",
        miniGame: "stirring",
        duration: 30,
        completed: false,
        score: 0
      },
      {
        id: 2,
        action: "cook",
        title: "Heat Pan",
        instruction: "Melt butter in non-stick pan over medium heat",
        miniGame: "heat_control",
        duration: 20,
        completed: false,
        score: 0
      },
      {
        id: 3,
        action: "cook",
        title: "Cook Omelette",
        instruction: "Pour eggs and swirl pan while cooking",
        miniGame: "stirring",
        duration: 35,
        completed: false,
        score: 0
      }
    ],
    unlocked: true,
    bestStars: 0
  },
  {
    id: "chicken_stirfry",
    name: "Chicken Stir-Fry",
    category: "dinner",
    difficulty: "medium",
    ingredients: ["Chicken Breast", "Broccoli", "Carrot", "Soy Sauce", "Ginger"],
    steps: [
      {
        id: 1,
        action: "prep",
        title: "Slice Chicken",
        instruction: "Cut chicken breast into bite-sized pieces",
        miniGame: "chopping",
        duration: 40,
        completed: false,
        score: 0
      },
      {
        id: 2,
        action: "prep",
        title: "Prep Vegetables",
        instruction: "Cut broccoli into florets and slice carrots",
        miniGame: "chopping",
        duration: 35,
        completed: false,
        score: 0
      },
      {
        id: 3,
        action: "cook",
        title: "Stir-Fry Chicken",
        instruction: "Cook chicken over high heat until golden",
        miniGame: "heat_control",
        duration: 35,
        completed: false,
        score: 0
      },
      {
        id: 4,
        action: "cook",
        title: "Add Vegetables",
        instruction: "Add vegetables and toss until tender-crisp",
        miniGame: "stirring",
        duration: 30,
        completed: false,
        score: 0
      }
    ],
    unlocked: true,
    bestStars: 0
  }
];

export function getRecipesByCategory(category: string): Recipe[] {
  return recipes.filter(r => r.category === category);
}

export function getRecipeById(id: string): Recipe | undefined {
  return recipes.find(r => r.id === id);
}
