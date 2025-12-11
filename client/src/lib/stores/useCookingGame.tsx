import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

export type GamePhase = "menu" | "recipe_select" | "cooking" | "mini_game" | "recipe_complete";
export type MiniGameType = "chopping" | "stirring" | "heat_control" | "measuring" | "plating" | null;

export interface IngredientState {
  id: string;
  name: string;
  cookingProgress: number;
  state: "raw" | "cooking" | "cooked" | "burnt";
  position: [number, number, number];
  isChopped: boolean;
  pieces: number;
}

export interface RecipeStep {
  id: number;
  action: string;
  title: string;
  instruction: string;
  miniGame: MiniGameType;
  duration: number;
  completed: boolean;
  score: number;
}

export interface Recipe {
  id: string;
  name: string;
  category: "breakfast" | "lunch" | "dinner" | "dessert";
  difficulty: "easy" | "medium" | "hard";
  ingredients: string[];
  steps: RecipeStep[];
  unlocked: boolean;
  bestStars: number;
}

interface CookingGameState {
  phase: GamePhase;
  currentRecipe: Recipe | null;
  currentStepIndex: number;
  currentMiniGame: MiniGameType;
  score: number;
  totalScore: number;
  starRating: number;
  ingredients: IngredientState[];
  temperature: number;
  mixingProgress: number;
  choppingScore: number;
  timeRemaining: number;
  isPaused: boolean;
  cameraPreset: "wide" | "closeup" | "firstperson" | "overhead" | "side" | "stove" | "cutting";

  setPhase: (phase: GamePhase) => void;
  selectRecipe: (recipe: Recipe) => void;
  startCooking: () => void;
  nextStep: () => void;
  startMiniGame: (type: MiniGameType) => void;
  completeMiniGame: (score: number) => void;
  completeMiniGameAndAdvance: (score: number) => void;
  setTemperature: (temp: number) => void;
  setMixingProgress: (progress: number) => void;
  addChoppingScore: (score: number) => void;
  updateIngredient: (id: string, updates: Partial<IngredientState>) => void;
  setCameraPreset: (preset: "wide" | "closeup" | "firstperson" | "overhead" | "side" | "stove" | "cutting") => void;
  togglePause: () => void;
  completeRecipe: () => void;
  resetGame: () => void;
  goToRecipeSelect: () => void;
}

function getCameraPresetForMiniGame(miniGame: MiniGameType): "wide" | "closeup" | "firstperson" | "overhead" | "side" | "stove" | "cutting" {
  if (miniGame === "chopping") return "cutting";
  if (miniGame === "heat_control") return "stove";
  if (miniGame === "stirring") return "closeup";
  if (miniGame === "measuring") return "closeup";
  if (miniGame === "plating") return "overhead";
  return "wide";
}

export const useCookingGame = create<CookingGameState>()(
  subscribeWithSelector((set, get) => ({
    phase: "menu",
    currentRecipe: null,
    currentStepIndex: 0,
    currentMiniGame: null,
    score: 0,
    totalScore: 0,
    starRating: 0,
    ingredients: [],
    temperature: 0,
    mixingProgress: 0,
    choppingScore: 0,
    timeRemaining: 0,
    isPaused: false,
    cameraPreset: "wide",

    setPhase: (phase) => set({ phase }),

    selectRecipe: (recipe) => {
      const clonedSteps = recipe.steps.map(step => ({
        ...step,
        completed: false,
        score: 0
      }));
      
      const clonedRecipe = {
        ...recipe,
        steps: clonedSteps
      };
      
      const firstStep = clonedSteps[0];
      const firstMiniGame = firstStep?.miniGame || null;
      const cameraPreset = getCameraPresetForMiniGame(firstMiniGame);
      const initialPhase = firstMiniGame ? "mini_game" : "cooking";
      
      set({ 
        currentRecipe: clonedRecipe,
        phase: initialPhase,
        currentStepIndex: 0,
        currentMiniGame: firstMiniGame,
        score: 0,
        totalScore: 0,
        temperature: 0,
        mixingProgress: 0,
        choppingScore: 0,
        timeRemaining: firstStep?.duration || 30,
        cameraPreset,
        ingredients: recipe.ingredients.map((name, i) => ({
          id: `ing_${i}`,
          name,
          cookingProgress: 0,
          state: "raw",
          position: [0, 0, 0],
          isChopped: false,
          pieces: 1
        }))
      });
      
      console.log("[CookingGame] Recipe selected:", recipe.name, "Starting with mini-game:", firstMiniGame, "Phase:", initialPhase);
    },

    startCooking: () => {
      const { currentRecipe, currentStepIndex } = get();
      if (currentRecipe && currentRecipe.steps[currentStepIndex]) {
        const step = currentRecipe.steps[currentStepIndex];
        const cameraPreset = getCameraPresetForMiniGame(step.miniGame);
        
        set({ 
          phase: "cooking",
          currentMiniGame: step.miniGame,
          timeRemaining: step.duration,
          cameraPreset
        });
        
        console.log("[CookingGame] Starting cooking, mini-game:", step.miniGame);
      }
    },

    nextStep: () => {
      const { currentRecipe, currentStepIndex } = get();
      if (!currentRecipe) return;
      
      const nextIndex = currentStepIndex + 1;
      console.log("[CookingGame] Moving to step", nextIndex + 1, "of", currentRecipe.steps.length);
      
      if (nextIndex >= currentRecipe.steps.length) {
        console.log("[CookingGame] All steps complete, finishing recipe");
        get().completeRecipe();
      } else {
        const nextStep = currentRecipe.steps[nextIndex];
        const cameraPreset = getCameraPresetForMiniGame(nextStep.miniGame);
        
        set({ 
          currentStepIndex: nextIndex,
          currentMiniGame: nextStep.miniGame,
          timeRemaining: nextStep.duration,
          score: 0,
          mixingProgress: 0,
          choppingScore: 0,
          temperature: 0,
          cameraPreset,
          phase: "cooking"
        });
        
        console.log("[CookingGame] Next step mini-game:", nextStep.miniGame);
      }
    },

    startMiniGame: (type) => {
      const cameraPreset = getCameraPresetForMiniGame(type);
      
      set({ 
        currentMiniGame: type,
        phase: "mini_game",
        score: 0,
        cameraPreset
      });
      
      console.log("[CookingGame] Starting mini-game:", type);
    },

    completeMiniGame: (miniGameScore) => {
      const { totalScore, currentRecipe, currentStepIndex } = get();
      const newTotal = totalScore + miniGameScore;
      
      if (currentRecipe) {
        const updatedSteps = [...currentRecipe.steps];
        if (updatedSteps[currentStepIndex]) {
          updatedSteps[currentStepIndex] = {
            ...updatedSteps[currentStepIndex],
            completed: true,
            score: miniGameScore
          };
        }
        
        set({ 
          totalScore: newTotal,
          currentMiniGame: null,
          phase: "cooking",
          currentRecipe: {
            ...currentRecipe,
            steps: updatedSteps
          }
        });
      } else {
        set({ 
          totalScore: newTotal,
          currentMiniGame: null,
          phase: "cooking"
        });
      }
      
      console.log("[CookingGame] Mini-game complete, score:", miniGameScore, "total:", newTotal);
    },

    completeMiniGameAndAdvance: (miniGameScore) => {
      const { totalScore, currentRecipe, currentStepIndex } = get();
      if (!currentRecipe) return;
      
      const newTotal = totalScore + miniGameScore;
      
      const updatedSteps = [...currentRecipe.steps];
      if (updatedSteps[currentStepIndex]) {
        updatedSteps[currentStepIndex] = {
          ...updatedSteps[currentStepIndex],
          completed: true,
          score: miniGameScore
        };
      }
      
      const nextIndex = currentStepIndex + 1;
      const isLastStep = nextIndex >= currentRecipe.steps.length;
      
      console.log("[CookingGame] Mini-game complete, score:", miniGameScore, "total:", newTotal, "isLast:", isLastStep);
      
      if (isLastStep) {
        const maxPossibleScore = currentRecipe.steps.length * 100;
        const percentage = (newTotal / maxPossibleScore) * 100;
        
        let stars = 1;
        if (percentage >= 90) stars = 3;
        else if (percentage >= 70) stars = 2;
        
        set({ 
          totalScore: newTotal,
          currentMiniGame: null,
          phase: "recipe_complete",
          starRating: stars,
          currentRecipe: {
            ...currentRecipe,
            steps: updatedSteps,
            bestStars: Math.max(currentRecipe.bestStars, stars)
          }
        });
        
        console.log("[CookingGame] Recipe complete! Stars:", stars);
      } else {
        const nextStep = currentRecipe.steps[nextIndex];
        const cameraPreset = getCameraPresetForMiniGame(nextStep.miniGame);
        const nextPhase = nextStep.miniGame ? "mini_game" : "cooking";
        
        set({ 
          totalScore: newTotal,
          currentStepIndex: nextIndex,
          currentMiniGame: nextStep.miniGame,
          timeRemaining: nextStep.duration,
          score: 0,
          mixingProgress: 0,
          choppingScore: 0,
          temperature: 0,
          cameraPreset,
          phase: nextPhase,
          currentRecipe: {
            ...currentRecipe,
            steps: updatedSteps
          }
        });
        
        console.log("[CookingGame] Moving to step", nextIndex + 1, "mini-game:", nextStep.miniGame, "Phase:", nextPhase);
      }
    },

    setTemperature: (temp) => set({ temperature: Math.max(0, Math.min(100, temp)) }),

    setMixingProgress: (progress) => set({ mixingProgress: Math.max(0, Math.min(100, progress)) }),

    addChoppingScore: (points) => {
      const { choppingScore } = get();
      set({ choppingScore: choppingScore + points });
    },

    updateIngredient: (id, updates) => {
      const { ingredients } = get();
      set({
        ingredients: ingredients.map(ing => 
          ing.id === id ? { ...ing, ...updates } : ing
        )
      });
    },

    setCameraPreset: (preset) => set({ cameraPreset: preset }),

    togglePause: () => set(state => ({ isPaused: !state.isPaused })),

    completeRecipe: () => {
      const { totalScore, currentRecipe } = get();
      const maxPossibleScore = currentRecipe ? currentRecipe.steps.length * 100 : 100;
      const percentage = (totalScore / maxPossibleScore) * 100;
      
      let stars = 1;
      if (percentage >= 90) stars = 3;
      else if (percentage >= 70) stars = 2;
      
      console.log("[CookingGame] Recipe complete! Score:", totalScore, "Stars:", stars);
      
      set({ 
        phase: "recipe_complete",
        starRating: stars,
        currentMiniGame: null
      });
    },

    goToRecipeSelect: () => {
      set({
        phase: "recipe_select",
        currentRecipe: null,
        currentStepIndex: 0,
        currentMiniGame: null,
        score: 0,
        totalScore: 0,
        starRating: 0,
        ingredients: [],
        temperature: 0,
        mixingProgress: 0,
        choppingScore: 0,
        timeRemaining: 0,
        isPaused: false,
        cameraPreset: "wide"
      });
    },

    resetGame: () => {
      console.log("[CookingGame] Resetting game");
      set({
        phase: "menu",
        currentRecipe: null,
        currentStepIndex: 0,
        currentMiniGame: null,
        score: 0,
        totalScore: 0,
        starRating: 0,
        ingredients: [],
        temperature: 0,
        mixingProgress: 0,
        choppingScore: 0,
        timeRemaining: 0,
        isPaused: false,
        cameraPreset: "wide"
      });
    }
  }))
);
