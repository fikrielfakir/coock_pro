const STORAGE_PREFIX = "cooking-sim-";
const STORAGE_VERSION = 1;
const AUTO_SAVE_INTERVAL = 30000;

export interface PlayerProfile {
  id: string;
  name: string;
  level: number;
  experience: number;
  totalScore: number;
  createdAt: number;
  lastPlayed: number;
}

export interface InventoryItem {
  id: string;
  type: string;
  quantity: number;
  unlocked: boolean;
}

export interface RecipeProgress {
  recipeId: string;
  completed: boolean;
  bestScore: number;
  bestStars: number;
  timesCompleted: number;
  lastCompleted: number | null;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  unlocked: boolean;
  unlockedAt: number | null;
  progress: number;
  target: number;
}

export interface GameSettings {
  soundEnabled: boolean;
  musicEnabled: boolean;
  soundVolume: number;
  musicVolume: number;
  showTutorials: boolean;
  cameraSpeed: number;
  graphicsQuality: "low" | "medium" | "high";
}

export interface GameStatistics {
  totalRecipesCompleted: number;
  totalMiniGamesPlayed: number;
  totalPlayTime: number;
  averageScore: number;
  perfectRecipes: number;
  ingredientsUsed: number;
}

export interface GameSaveData {
  version: number;
  profile: PlayerProfile;
  inventory: InventoryItem[];
  recipeProgress: RecipeProgress[];
  achievements: Achievement[];
  settings: GameSettings;
  statistics: GameStatistics;
  savedAt: number;
}

function getStorageKey(key: string): string {
  return `${STORAGE_PREFIX}${key}`;
}

function generateDefaultProfile(): PlayerProfile {
  return {
    id: crypto.randomUUID ? crypto.randomUUID() : `player-${Date.now()}`,
    name: "Chef",
    level: 1,
    experience: 0,
    totalScore: 0,
    createdAt: Date.now(),
    lastPlayed: Date.now()
  };
}

function generateDefaultSettings(): GameSettings {
  return {
    soundEnabled: true,
    musicEnabled: true,
    soundVolume: 0.7,
    musicVolume: 0.5,
    showTutorials: true,
    cameraSpeed: 1.0,
    graphicsQuality: "high"
  };
}

function generateDefaultStatistics(): GameStatistics {
  return {
    totalRecipesCompleted: 0,
    totalMiniGamesPlayed: 0,
    totalPlayTime: 0,
    averageScore: 0,
    perfectRecipes: 0,
    ingredientsUsed: 0
  };
}

function generateDefaultAchievements(): Achievement[] {
  return [
    {
      id: "first_recipe",
      name: "First Steps",
      description: "Complete your first recipe",
      unlocked: false,
      unlockedAt: null,
      progress: 0,
      target: 1
    },
    {
      id: "master_chef",
      name: "Master Chef",
      description: "Get 3 stars on 10 recipes",
      unlocked: false,
      unlockedAt: null,
      progress: 0,
      target: 10
    },
    {
      id: "speedy_cook",
      name: "Speedy Cook",
      description: "Complete a recipe in under 2 minutes",
      unlocked: false,
      unlockedAt: null,
      progress: 0,
      target: 1
    },
    {
      id: "perfectionist",
      name: "Perfectionist",
      description: "Score 100 on a mini-game",
      unlocked: false,
      unlockedAt: null,
      progress: 0,
      target: 1
    },
    {
      id: "recipe_collector",
      name: "Recipe Collector",
      description: "Complete 25 different recipes",
      unlocked: false,
      unlockedAt: null,
      progress: 0,
      target: 25
    }
  ];
}

function generateDefaultSaveData(): GameSaveData {
  return {
    version: STORAGE_VERSION,
    profile: generateDefaultProfile(),
    inventory: [],
    recipeProgress: [],
    achievements: generateDefaultAchievements(),
    settings: generateDefaultSettings(),
    statistics: generateDefaultStatistics(),
    savedAt: Date.now()
  };
}

export function checkStorageQuota(): { available: boolean; used: number; remaining: number } {
  try {
    let used = 0;
    for (let key in localStorage) {
      if (key.startsWith(STORAGE_PREFIX)) {
        used += localStorage.getItem(key)?.length || 0;
      }
    }
    const remaining = 5 * 1024 * 1024 - used;
    return { available: remaining > 0, used, remaining };
  } catch {
    return { available: true, used: 0, remaining: 5 * 1024 * 1024 };
  }
}

function validateSaveData(data: unknown): data is GameSaveData {
  if (!data || typeof data !== "object") return false;
  const save = data as Partial<GameSaveData>;
  
  return (
    typeof save.version === "number" &&
    save.profile !== undefined &&
    typeof save.profile?.id === "string" &&
    typeof save.profile?.name === "string" &&
    Array.isArray(save.inventory) &&
    Array.isArray(save.recipeProgress) &&
    Array.isArray(save.achievements) &&
    save.settings !== undefined &&
    save.statistics !== undefined
  );
}

function migrateSaveData(data: GameSaveData): GameSaveData {
  if (data.version < STORAGE_VERSION) {
    const defaults = generateDefaultSaveData();
    return {
      ...defaults,
      ...data,
      version: STORAGE_VERSION,
      settings: { ...defaults.settings, ...data.settings },
      statistics: { ...defaults.statistics, ...data.statistics },
      achievements: data.achievements?.length ? data.achievements : defaults.achievements
    };
  }
  return data;
}

export function saveGameData(data: GameSaveData): boolean {
  try {
    const quota = checkStorageQuota();
    if (!quota.available) {
      console.warn("[Storage] Quota exceeded, cannot save");
      return false;
    }

    data.savedAt = Date.now();
    const serialized = JSON.stringify(data);
    localStorage.setItem(getStorageKey("save"), serialized);
    localStorage.setItem(getStorageKey("backup"), serialized);
    
    console.log("[Storage] Game saved successfully");
    return true;
  } catch (error) {
    console.error("[Storage] Failed to save game:", error);
    return false;
  }
}

export function loadGameData(): GameSaveData {
  try {
    const saved = localStorage.getItem(getStorageKey("save"));
    
    if (!saved) {
      console.log("[Storage] No save found, creating new profile");
      return generateDefaultSaveData();
    }

    const parsed = JSON.parse(saved);
    
    if (!validateSaveData(parsed)) {
      console.warn("[Storage] Invalid save data, attempting backup recovery");
      const backup = localStorage.getItem(getStorageKey("backup"));
      
      if (backup) {
        const backupParsed = JSON.parse(backup);
        if (validateSaveData(backupParsed)) {
          return migrateSaveData(backupParsed);
        }
      }
      
      console.warn("[Storage] Backup also invalid, creating new profile");
      return generateDefaultSaveData();
    }

    return migrateSaveData(parsed);
  } catch (error) {
    console.error("[Storage] Failed to load game:", error);
    return generateDefaultSaveData();
  }
}

export function saveProfile(profile: PlayerProfile): boolean {
  try {
    const data = loadGameData();
    data.profile = { ...profile, lastPlayed: Date.now() };
    return saveGameData(data);
  } catch {
    return false;
  }
}

export function saveRecipeProgress(progress: RecipeProgress): boolean {
  try {
    const data = loadGameData();
    const existingIndex = data.recipeProgress.findIndex(p => p.recipeId === progress.recipeId);
    
    if (existingIndex >= 0) {
      const existing = data.recipeProgress[existingIndex];
      data.recipeProgress[existingIndex] = {
        ...existing,
        ...progress,
        bestScore: Math.max(existing.bestScore, progress.bestScore),
        bestStars: Math.max(existing.bestStars, progress.bestStars),
        timesCompleted: existing.timesCompleted + 1,
        lastCompleted: Date.now()
      };
    } else {
      data.recipeProgress.push({
        ...progress,
        timesCompleted: 1,
        lastCompleted: Date.now()
      });
    }
    
    return saveGameData(data);
  } catch {
    return false;
  }
}

export function saveSettings(settings: Partial<GameSettings>): boolean {
  try {
    const data = loadGameData();
    data.settings = { ...data.settings, ...settings };
    return saveGameData(data);
  } catch {
    return false;
  }
}

export function unlockAchievement(achievementId: string): boolean {
  try {
    const data = loadGameData();
    const achievement = data.achievements.find(a => a.id === achievementId);
    
    if (achievement && !achievement.unlocked) {
      achievement.unlocked = true;
      achievement.unlockedAt = Date.now();
      return saveGameData(data);
    }
    
    return false;
  } catch {
    return false;
  }
}

export function updateStatistics(updates: Partial<GameStatistics>): boolean {
  try {
    const data = loadGameData();
    data.statistics = { ...data.statistics, ...updates };
    return saveGameData(data);
  } catch {
    return false;
  }
}

export function exportSaveData(): string | null {
  try {
    const data = loadGameData();
    return btoa(JSON.stringify(data));
  } catch {
    return null;
  }
}

export function importSaveData(encodedData: string): boolean {
  try {
    const decoded = atob(encodedData);
    const parsed = JSON.parse(decoded);
    
    if (!validateSaveData(parsed)) {
      console.error("[Storage] Invalid import data");
      return false;
    }
    
    return saveGameData(migrateSaveData(parsed));
  } catch {
    return false;
  }
}

export function clearAllData(): boolean {
  try {
    const keys = Object.keys(localStorage).filter(k => k.startsWith(STORAGE_PREFIX));
    keys.forEach(k => localStorage.removeItem(k));
    console.log("[Storage] All data cleared");
    return true;
  } catch {
    return false;
  }
}

let autoSaveInterval: ReturnType<typeof setInterval> | null = null;
let currentGameStateGetter: (() => Partial<GameSaveData>) | null = null;

export function startAutoSave(getGameState: () => Partial<GameSaveData>): void {
  if (autoSaveInterval) {
    clearInterval(autoSaveInterval);
  }
  
  currentGameStateGetter = getGameState;
  
  autoSaveInterval = setInterval(() => {
    try {
      const existingData = loadGameData();
      const currentState = currentGameStateGetter ? currentGameStateGetter() : {};
      
      const mergedData: GameSaveData = {
        ...existingData,
        ...currentState,
        profile: {
          ...existingData.profile,
          ...(currentState.profile || {}),
          lastPlayed: Date.now()
        },
        statistics: {
          ...existingData.statistics,
          ...(currentState.statistics || {})
        },
        savedAt: Date.now()
      };
      
      if (saveGameData(mergedData)) {
        console.log("[Storage] Auto-save completed");
      }
    } catch (error) {
      console.error("[Storage] Auto-save failed:", error);
    }
  }, AUTO_SAVE_INTERVAL);

  if (typeof window !== "undefined") {
    const handleBeforeUnload = () => {
      try {
        const existingData = loadGameData();
        const currentState = currentGameStateGetter ? currentGameStateGetter() : {};
        
        const mergedData: GameSaveData = {
          ...existingData,
          ...currentState,
          profile: {
            ...existingData.profile,
            ...(currentState.profile || {}),
            lastPlayed: Date.now()
          },
          savedAt: Date.now()
        };
        
        saveGameData(mergedData);
      } catch (error) {
        console.error("[Storage] Save on exit failed:", error);
      }
    };
    
    window.addEventListener("beforeunload", handleBeforeUnload);
  }
  
  console.log("[Storage] Auto-save started (every 30 seconds)");
}

export function stopAutoSave(): void {
  if (autoSaveInterval) {
    clearInterval(autoSaveInterval);
    autoSaveInterval = null;
    currentGameStateGetter = null;
    console.log("[Storage] Auto-save stopped");
  }
}

export function updateCurrentGameState(updates: Partial<GameSaveData>): boolean {
  try {
    const existingData = loadGameData();
    const mergedData: GameSaveData = {
      ...existingData,
      ...updates,
      profile: {
        ...existingData.profile,
        ...(updates.profile || {}),
        lastPlayed: Date.now()
      },
      savedAt: Date.now()
    };
    return saveGameData(mergedData);
  } catch (error) {
    console.error("[Storage] Failed to update game state:", error);
    return false;
  }
}
