import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ChefTitle = 
  | "Kitchen Novice"
  | "Apprentice Cook"
  | "Home Chef"
  | "Skilled Cook"
  | "Senior Chef"
  | "Expert Chef"
  | "Master Chef"
  | "Executive Chef"
  | "Culinary Artist"
  | "Legendary Chef";

export interface LevelMilestone {
  level: number;
  title: ChefTitle;
  unlockedRecipes: string[];
  unlockedIngredients: string[];
  bonusCoins: number;
  specialReward?: string;
}

export interface ProgressionState {
  currentLevel: number;
  currentXP: number;
  totalXP: number;
  coins: number;
  streak: number;
  lastPlayedDate: string | null;
  recipesCompleted: Record<string, { count: number; bestScore: number; bestStars: number; bestTime: number | null }>;
  achievementProgress: Record<string, number>;
  unlockedRecipes: string[];
  chefTitle: ChefTitle;
  
  addXP: (amount: number, source: string) => { leveledUp: boolean; newLevel: number; oldLevel: number };
  addCoins: (amount: number) => void;
  spendCoins: (amount: number) => boolean;
  recordRecipeCompletion: (recipeId: string, score: number, stars: number, time: number) => void;
  updateStreak: () => void;
  getXPForNextLevel: () => number;
  getXPProgressPercent: () => number;
  getLevelMilestone: (level: number) => LevelMilestone;
  getTitleForLevel: (level: number) => ChefTitle;
  unlockRecipe: (recipeId: string) => void;
  canAfford: (cost: number) => boolean;
  resetProgression: () => void;
}

function calculateXPForLevel(level: number): number {
  return Math.floor((level * 200) + Math.pow(level, 1.5) * 50);
}

function calculateTotalXPToLevel(level: number): number {
  let total = 0;
  for (let i = 1; i < level; i++) {
    total += calculateXPForLevel(i);
  }
  return total;
}

function getTitleForLevel(level: number): ChefTitle {
  if (level >= 50) return "Legendary Chef";
  if (level >= 45) return "Culinary Artist";
  if (level >= 40) return "Executive Chef";
  if (level >= 35) return "Master Chef";
  if (level >= 28) return "Expert Chef";
  if (level >= 20) return "Senior Chef";
  if (level >= 14) return "Skilled Cook";
  if (level >= 8) return "Home Chef";
  if (level >= 4) return "Apprentice Cook";
  return "Kitchen Novice";
}

const levelMilestones: LevelMilestone[] = [
  { level: 1, title: "Kitchen Novice", unlockedRecipes: ["scrambled_eggs", "pancakes", "caesar_salad", "grilled_cheese", "guacamole"], unlockedIngredients: [], bonusCoins: 0 },
  { level: 2, title: "Kitchen Novice", unlockedRecipes: ["club_sandwich", "tomato_soup", "pasta_marinara"], unlockedIngredients: [], bonusCoins: 50 },
  { level: 3, title: "Kitchen Novice", unlockedRecipes: ["omelette", "chicken_wrap"], unlockedIngredients: [], bonusCoins: 75 },
  { level: 4, title: "Apprentice Cook", unlockedRecipes: ["beef_stirfry", "chicken_stirfry", "chocolate_cake"], unlockedIngredients: [], bonusCoins: 100, specialReward: "New apron unlocked!" },
  { level: 5, title: "Apprentice Cook", unlockedRecipes: [], unlockedIngredients: [], bonusCoins: 125 },
  { level: 6, title: "Apprentice Cook", unlockedRecipes: [], unlockedIngredients: [], bonusCoins: 150 },
  { level: 7, title: "Apprentice Cook", unlockedRecipes: ["tiramisu"], unlockedIngredients: [], bonusCoins: 175 },
  { level: 8, title: "Home Chef", unlockedRecipes: ["gourmet_steak"], unlockedIngredients: [], bonusCoins: 200, specialReward: "Chef hat unlocked!" },
  { level: 10, title: "Home Chef", unlockedRecipes: [], unlockedIngredients: [], bonusCoins: 300, specialReward: "Kitchen theme unlocked!" },
  { level: 15, title: "Skilled Cook", unlockedRecipes: [], unlockedIngredients: [], bonusCoins: 500 },
  { level: 20, title: "Senior Chef", unlockedRecipes: [], unlockedIngredients: [], bonusCoins: 750, specialReward: "Gold knife unlocked!" },
  { level: 25, title: "Senior Chef", unlockedRecipes: [], unlockedIngredients: [], bonusCoins: 1000 },
  { level: 30, title: "Expert Chef", unlockedRecipes: [], unlockedIngredients: [], bonusCoins: 1500 },
  { level: 35, title: "Master Chef", unlockedRecipes: [], unlockedIngredients: [], bonusCoins: 2000, specialReward: "Master Chef badge!" },
  { level: 40, title: "Executive Chef", unlockedRecipes: [], unlockedIngredients: [], bonusCoins: 2500 },
  { level: 45, title: "Culinary Artist", unlockedRecipes: [], unlockedIngredients: [], bonusCoins: 3000 },
  { level: 50, title: "Legendary Chef", unlockedRecipes: [], unlockedIngredients: [], bonusCoins: 5000, specialReward: "Legendary status achieved!" }
];

const defaultRecipesUnlocked = ["scrambled_eggs", "pancakes", "caesar_salad", "grilled_cheese", "guacamole"];

export const useProgression = create<ProgressionState>()(
  persist(
    (set, get) => ({
      currentLevel: 1,
      currentXP: 0,
      totalXP: 0,
      coins: 100,
      streak: 0,
      lastPlayedDate: null,
      recipesCompleted: {},
      achievementProgress: {},
      unlockedRecipes: [...defaultRecipesUnlocked],
      chefTitle: "Kitchen Novice",

      addXP: (amount, source) => {
        const state = get();
        let { currentXP, currentLevel, totalXP } = state;
        
        const streakMultiplier = Math.min(1 + (state.streak * 0.1), 1.5);
        const adjustedAmount = Math.floor(amount * streakMultiplier);
        
        currentXP += adjustedAmount;
        totalXP += adjustedAmount;
        
        let leveledUp = false;
        const oldLevel = currentLevel;
        let xpNeeded = calculateXPForLevel(currentLevel);
        
        while (currentXP >= xpNeeded && currentLevel < 50) {
          currentXP -= xpNeeded;
          currentLevel++;
          leveledUp = true;
          
          const milestone = levelMilestones.find(m => m.level === currentLevel);
          if (milestone) {
            set(s => ({
              coins: s.coins + milestone.bonusCoins,
              unlockedRecipes: Array.from(new Set([...s.unlockedRecipes, ...milestone.unlockedRecipes]))
            }));
          }
          
          xpNeeded = calculateXPForLevel(currentLevel);
        }
        
        const newTitle = getTitleForLevel(currentLevel);
        
        set({
          currentXP,
          currentLevel,
          totalXP,
          chefTitle: newTitle
        });
        
        console.log(`[Progression] Added ${adjustedAmount} XP (${amount} base, ${streakMultiplier.toFixed(2)}x streak) from ${source}. Level: ${currentLevel}, XP: ${currentXP}/${xpNeeded}`);
        
        return { leveledUp, newLevel: currentLevel, oldLevel };
      },

      addCoins: (amount) => {
        set(state => ({ coins: state.coins + amount }));
        console.log(`[Progression] Added ${amount} coins. Total: ${get().coins}`);
      },

      spendCoins: (amount) => {
        const state = get();
        if (state.coins >= amount) {
          set({ coins: state.coins - amount });
          console.log(`[Progression] Spent ${amount} coins. Remaining: ${get().coins}`);
          return true;
        }
        return false;
      },

      recordRecipeCompletion: (recipeId, score, stars, time) => {
        set(state => {
          const existing = state.recipesCompleted[recipeId] || { count: 0, bestScore: 0, bestStars: 0, bestTime: null };
          return {
            recipesCompleted: {
              ...state.recipesCompleted,
              [recipeId]: {
                count: existing.count + 1,
                bestScore: Math.max(existing.bestScore, score),
                bestStars: Math.max(existing.bestStars, stars),
                bestTime: existing.bestTime === null ? time : Math.min(existing.bestTime, time)
              }
            }
          };
        });
      },

      updateStreak: () => {
        const today = new Date().toDateString();
        const { lastPlayedDate, streak } = get();
        
        if (lastPlayedDate === today) {
          return;
        }
        
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toDateString();
        
        if (lastPlayedDate === yesterdayStr) {
          set({ streak: Math.min(streak + 1, 7), lastPlayedDate: today });
          console.log(`[Progression] Streak extended to ${streak + 1} days!`);
        } else {
          set({ streak: 1, lastPlayedDate: today });
          console.log(`[Progression] Streak reset to 1`);
        }
      },

      getXPForNextLevel: () => {
        return calculateXPForLevel(get().currentLevel);
      },

      getXPProgressPercent: () => {
        const { currentXP, currentLevel } = get();
        const xpNeeded = calculateXPForLevel(currentLevel);
        return (currentXP / xpNeeded) * 100;
      },

      getLevelMilestone: (level) => {
        return levelMilestones.find(m => m.level === level) || levelMilestones[0];
      },

      getTitleForLevel,

      unlockRecipe: (recipeId) => {
        set(state => ({
          unlockedRecipes: Array.from(new Set([...state.unlockedRecipes, recipeId]))
        }));
      },

      canAfford: (cost) => {
        return get().coins >= cost;
      },

      resetProgression: () => {
        set({
          currentLevel: 1,
          currentXP: 0,
          totalXP: 0,
          coins: 100,
          streak: 0,
          lastPlayedDate: null,
          recipesCompleted: {},
          achievementProgress: {},
          unlockedRecipes: [...defaultRecipesUnlocked],
          chefTitle: "Kitchen Novice"
        });
      }
    }),
    {
      name: "cooking-sim-progression"
    }
  )
);

export interface ScoreCalculation {
  miniGameScore: number;
  timeBonus: number;
  techniqueBonus: number;
  difficultyMultiplier: number;
  streakBonus: number;
  firstTimeBonus: number;
  totalScore: number;
  stars: number;
  xpEarned: number;
  coinsEarned: number;
}

export function calculateRecipeScore(
  miniGameScores: number[],
  actualTime: number,
  targetTime: number,
  difficulty: number,
  streak: number,
  isFirstCompletion: boolean,
  baseXP: number,
  baseCoins: number
): ScoreCalculation {
  const miniGameAverage = miniGameScores.length > 0 
    ? miniGameScores.reduce((a, b) => a + b, 0) / miniGameScores.length 
    : 50;
  
  const miniGameComponent = miniGameAverage * 0.4;
  
  let timeBonus = 0;
  if (actualTime <= targetTime) {
    const timeRatio = actualTime / targetTime;
    timeBonus = (1 - timeRatio) * 30;
  } else {
    const overTime = (actualTime - targetTime) / targetTime;
    timeBonus = -Math.min(overTime * 15, 15);
  }
  const timeComponent = Math.max(0, 20 + timeBonus) * 0.2;
  
  const techniqueScore = miniGameAverage >= 80 ? 20 : miniGameAverage >= 60 ? 15 : 10;
  const techniqueComponent = techniqueScore * 0.2;
  
  const presentationScore = miniGameAverage * 0.1;
  const ingredientScore = 10;
  
  const baseScore = miniGameComponent + timeComponent + techniqueComponent + presentationScore + ingredientScore;
  
  const difficultyMultiplier = 1 + (difficulty - 1) * 0.15;
  
  const streakMultiplier = 1 + Math.min(streak * 0.1, 0.5);
  
  const firstTimeMultiplier = isFirstCompletion ? 1.5 : 1;
  
  const totalScore = Math.round(baseScore * difficultyMultiplier * streakMultiplier * firstTimeMultiplier);
  
  let stars = 1;
  const percentage = (totalScore / 100) * 100;
  if (percentage >= 90) stars = 3;
  else if (percentage >= 75) stars = 2;
  
  const starBonus = stars === 3 ? 1.5 : stars === 2 ? 1.25 : 1;
  const xpEarned = Math.floor(baseXP * starBonus * (isFirstCompletion ? 1.5 : 1));
  const coinsEarned = Math.floor(baseCoins * starBonus);
  
  return {
    miniGameScore: Math.round(miniGameComponent / 0.4),
    timeBonus: Math.round(timeBonus),
    techniqueBonus: Math.round(techniqueScore),
    difficultyMultiplier,
    streakBonus: Math.round((streakMultiplier - 1) * 100),
    firstTimeBonus: isFirstCompletion ? 50 : 0,
    totalScore,
    stars,
    xpEarned,
    coinsEarned
  };
}
