import { create } from "zustand";
import { persist } from "zustand/middleware";

export type GraphicsQuality = "low" | "medium" | "high" | "ultra";
export type TimeOfDay = "morning" | "noon" | "afternoon" | "evening";

interface GraphicsState {
  quality: GraphicsQuality;
  timeOfDay: TimeOfDay;
  bloomEnabled: boolean;
  bloomIntensity: number;
  ssaoEnabled: boolean;
  ssaoIntensity: number;
  dofEnabled: boolean;
  vignetteEnabled: boolean;
  vignetteIntensity: number;
  chromaticAberrationEnabled: boolean;
  filmGrainEnabled: boolean;
  motionBlurEnabled: boolean;
  shadowQuality: "low" | "medium" | "high";
  particleQuality: "low" | "medium" | "high";
  
  setQuality: (quality: GraphicsQuality) => void;
  setTimeOfDay: (time: TimeOfDay) => void;
  setBloomEnabled: (enabled: boolean) => void;
  setBloomIntensity: (intensity: number) => void;
  setSsaoEnabled: (enabled: boolean) => void;
  setSsaoIntensity: (intensity: number) => void;
  setDofEnabled: (enabled: boolean) => void;
  setVignetteEnabled: (enabled: boolean) => void;
  setVignetteIntensity: (intensity: number) => void;
  setChromaticAberrationEnabled: (enabled: boolean) => void;
  setFilmGrainEnabled: (enabled: boolean) => void;
  setMotionBlurEnabled: (enabled: boolean) => void;
  setShadowQuality: (quality: "low" | "medium" | "high") => void;
  setParticleQuality: (quality: "low" | "medium" | "high") => void;
  applyPreset: (preset: GraphicsQuality) => void;
}

const QUALITY_PRESETS: Record<GraphicsQuality, Partial<GraphicsState>> = {
  low: {
    bloomEnabled: false,
    ssaoEnabled: false,
    dofEnabled: false,
    vignetteEnabled: false,
    chromaticAberrationEnabled: false,
    filmGrainEnabled: false,
    motionBlurEnabled: false,
    shadowQuality: "low",
    particleQuality: "low",
  },
  medium: {
    bloomEnabled: true,
    bloomIntensity: 0.3,
    ssaoEnabled: true,
    ssaoIntensity: 0.2,
    dofEnabled: false,
    vignetteEnabled: true,
    vignetteIntensity: 0.15,
    chromaticAberrationEnabled: false,
    filmGrainEnabled: false,
    motionBlurEnabled: false,
    shadowQuality: "medium",
    particleQuality: "medium",
  },
  high: {
    bloomEnabled: true,
    bloomIntensity: 0.5,
    ssaoEnabled: true,
    ssaoIntensity: 0.3,
    dofEnabled: true,
    vignetteEnabled: true,
    vignetteIntensity: 0.2,
    chromaticAberrationEnabled: true,
    filmGrainEnabled: false,
    motionBlurEnabled: true,
    shadowQuality: "high",
    particleQuality: "high",
  },
  ultra: {
    bloomEnabled: true,
    bloomIntensity: 0.6,
    ssaoEnabled: true,
    ssaoIntensity: 0.35,
    dofEnabled: true,
    vignetteEnabled: true,
    vignetteIntensity: 0.2,
    chromaticAberrationEnabled: true,
    filmGrainEnabled: true,
    motionBlurEnabled: true,
    shadowQuality: "high",
    particleQuality: "high",
  },
};

export const useGraphicsSettings = create<GraphicsState>()(
  persist(
    (set) => ({
      quality: "medium",
      timeOfDay: "noon",
      bloomEnabled: true,
      bloomIntensity: 0.3,
      ssaoEnabled: true,
      ssaoIntensity: 0.2,
      dofEnabled: false,
      vignetteEnabled: true,
      vignetteIntensity: 0.15,
      chromaticAberrationEnabled: false,
      filmGrainEnabled: false,
      motionBlurEnabled: false,
      shadowQuality: "medium",
      particleQuality: "medium",

      setQuality: (quality) => set({ quality }),
      setTimeOfDay: (timeOfDay) => set({ timeOfDay }),
      setBloomEnabled: (bloomEnabled) => set({ bloomEnabled }),
      setBloomIntensity: (bloomIntensity) => set({ bloomIntensity }),
      setSsaoEnabled: (ssaoEnabled) => set({ ssaoEnabled }),
      setSsaoIntensity: (ssaoIntensity) => set({ ssaoIntensity }),
      setDofEnabled: (dofEnabled) => set({ dofEnabled }),
      setVignetteEnabled: (vignetteEnabled) => set({ vignetteEnabled }),
      setVignetteIntensity: (vignetteIntensity) => set({ vignetteIntensity }),
      setChromaticAberrationEnabled: (chromaticAberrationEnabled) =>
        set({ chromaticAberrationEnabled }),
      setFilmGrainEnabled: (filmGrainEnabled) => set({ filmGrainEnabled }),
      setMotionBlurEnabled: (motionBlurEnabled) => set({ motionBlurEnabled }),
      setShadowQuality: (shadowQuality) => set({ shadowQuality }),
      setParticleQuality: (particleQuality) => set({ particleQuality }),
      applyPreset: (preset) => {
        const presetSettings = QUALITY_PRESETS[preset];
        set({ ...presetSettings, quality: preset });
      },
    }),
    {
      name: "cooking-graphics-settings",
    }
  )
);

export const TIME_OF_DAY_SETTINGS = {
  morning: {
    sunIntensity: 0.7,
    sunColor: "#ffcc88",
    ambientIntensity: 0.35,
    ambientColor: "#fff0e0",
    skyColor: "#87ceeb",
  },
  noon: {
    sunIntensity: 1.0,
    sunColor: "#fffaf0",
    ambientIntensity: 0.4,
    ambientColor: "#fff8f0",
    skyColor: "#add8e6",
  },
  afternoon: {
    sunIntensity: 0.85,
    sunColor: "#ffe4b5",
    ambientIntensity: 0.38,
    ambientColor: "#fff5e6",
    skyColor: "#87ceeb",
  },
  evening: {
    sunIntensity: 0.5,
    sunColor: "#ff9966",
    ambientIntensity: 0.25,
    ambientColor: "#ffe0cc",
    skyColor: "#ff7f50",
  },
};

export const LIGHT_TEMPERATURE = {
  warm: { kelvin: 2700, color: "#ff9933" },
  neutral: { kelvin: 4000, color: "#fff5e0" },
  daylight: { kelvin: 6500, color: "#e0f0ff" },
  cool: { kelvin: 5000, color: "#f0f8ff" },
};
