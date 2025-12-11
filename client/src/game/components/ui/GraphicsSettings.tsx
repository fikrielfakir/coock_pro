import { useState } from "react";
import { Settings, X, Sun, Moon, Monitor, Sparkles } from "lucide-react";
import {
  useGraphicsSettings,
  GraphicsQuality,
  TimeOfDay,
} from "@/lib/stores/useGraphicsSettings";

export function GraphicsSettings() {
  const [isOpen, setIsOpen] = useState(false);
  const {
    quality,
    timeOfDay,
    bloomEnabled,
    ssaoEnabled,
    dofEnabled,
    vignetteEnabled,
    chromaticAberrationEnabled,
    filmGrainEnabled,
    shadowQuality,
    particleQuality,
    applyPreset,
    setTimeOfDay,
    setBloomEnabled,
    setSsaoEnabled,
    setDofEnabled,
    setVignetteEnabled,
    setChromaticAberrationEnabled,
    setFilmGrainEnabled,
    setShadowQuality,
    setParticleQuality,
  } = useGraphicsSettings();

  const qualityLabels: Record<GraphicsQuality, string> = {
    low: "Low",
    medium: "Medium",
    high: "High",
    ultra: "Ultra",
  };

  const timeLabels: Record<TimeOfDay, { label: string; icon: typeof Sun }> = {
    morning: { label: "Morning", icon: Sun },
    noon: { label: "Noon", icon: Sun },
    afternoon: { label: "Afternoon", icon: Sun },
    evening: { label: "Evening", icon: Moon },
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 z-50 p-3 bg-white/90 rounded-full shadow-lg hover:bg-white transition-colors"
        title="Graphics Settings"
      >
        <Settings className="w-5 h-5 text-gray-700" />
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-orange-500" />
            <h2 className="text-lg font-semibold text-gray-800">Graphics Settings</h2>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-4 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quality Preset
            </label>
            <div className="grid grid-cols-4 gap-2">
              {(Object.keys(qualityLabels) as GraphicsQuality[]).map((q) => (
                <button
                  key={q}
                  onClick={() => applyPreset(q)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    quality === q
                      ? "bg-orange-500 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {qualityLabels[q]}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Time of Day
            </label>
            <div className="grid grid-cols-4 gap-2">
              {(Object.keys(timeLabels) as TimeOfDay[]).map((t) => {
                const TimeIcon = timeLabels[t].icon;
                return (
                  <button
                    key={t}
                    onClick={() => setTimeOfDay(t)}
                    className={`flex flex-col items-center px-2 py-2 rounded-lg text-xs font-medium transition-colors ${
                      timeOfDay === t
                        ? "bg-blue-500 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    <TimeIcon className="w-4 h-4 mb-1" />
                    {timeLabels[t].label}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Post-Processing Effects
            </label>
            <div className="space-y-2">
              <ToggleSwitch
                label="Bloom"
                description="Glow effect on bright surfaces"
                enabled={bloomEnabled}
                onChange={setBloomEnabled}
              />
              <ToggleSwitch
                label="Ambient Occlusion (SSAO)"
                description="Contact shadows for enhanced depth"
                enabled={ssaoEnabled}
                onChange={setSsaoEnabled}
              />
              <ToggleSwitch
                label="Depth of Field"
                description="Background blur effect"
                enabled={dofEnabled}
                onChange={setDofEnabled}
              />
              <ToggleSwitch
                label="Vignette"
                description="Darkened screen edges"
                enabled={vignetteEnabled}
                onChange={setVignetteEnabled}
              />
              <ToggleSwitch
                label="Chromatic Aberration"
                description="Lens color fringing"
                enabled={chromaticAberrationEnabled}
                onChange={setChromaticAberrationEnabled}
              />
              <ToggleSwitch
                label="Film Grain"
                description="Subtle texture overlay"
                enabled={filmGrainEnabled}
                onChange={setFilmGrainEnabled}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Shadow Quality
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(["low", "medium", "high"] as const).map((q) => (
                <button
                  key={q}
                  onClick={() => setShadowQuality(q)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
                    shadowQuality === q
                      ? "bg-purple-500 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Particle Quality
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(["low", "medium", "high"] as const).map((q) => (
                <button
                  key={q}
                  onClick={() => setParticleQuality(q)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
                    particleQuality === q
                      ? "bg-green-500 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="p-4 border-t bg-gray-50 rounded-b-2xl">
          <p className="text-xs text-gray-500 text-center">
            Changes are applied instantly and saved automatically.
          </p>
        </div>
      </div>
    </div>
  );
}

interface ToggleSwitchProps {
  label: string;
  description: string;
  enabled: boolean;
  onChange: (enabled: boolean) => void;
}

function ToggleSwitch({ label, description, enabled, onChange }: ToggleSwitchProps) {
  return (
    <div
      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
      onClick={() => onChange(!enabled)}
    >
      <div>
        <p className="text-sm font-medium text-gray-800">{label}</p>
        <p className="text-xs text-gray-500">{description}</p>
      </div>
      <div
        className={`relative w-11 h-6 rounded-full transition-colors ${
          enabled ? "bg-orange-500" : "bg-gray-300"
        }`}
      >
        <div
          className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${
            enabled ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </div>
    </div>
  );
}
