import { useProgression } from "@/lib/stores/useProgression";
import { Progress } from "@/components/ui/progress";
import { ChefHat, Coins, Flame, TrendingUp } from "lucide-react";

export function PlayerStatsHeader() {
  const currentLevel = useProgression(state => state.currentLevel);
  const currentXP = useProgression(state => state.currentXP);
  const coins = useProgression(state => state.coins);
  const streak = useProgression(state => state.streak);
  const chefTitle = useProgression(state => state.chefTitle);
  const getXPForNextLevel = useProgression(state => state.getXPForNextLevel);
  const getXPProgressPercent = useProgression(state => state.getXPProgressPercent);

  const xpNeeded = getXPForNextLevel();
  const progressPercent = getXPProgressPercent();

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-xl border border-orange-200 p-4 shadow-lg">
      <div className="flex items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center shadow-md">
              <ChefHat className="w-8 h-8 text-white" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center text-xs font-bold text-yellow-900 border-2 border-white">
              {currentLevel}
            </div>
          </div>
          
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-bold text-orange-800">Level {currentLevel}</span>
              <span className="text-sm text-orange-600">{chefTitle}</span>
            </div>
            <div className="w-36">
              <Progress value={progressPercent} className="h-2" />
              <p className="text-xs text-gray-500 mt-0.5">
                {currentXP.toLocaleString()} / {xpNeeded.toLocaleString()} XP
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-yellow-100 rounded-lg px-3 py-2">
            <Coins className="w-5 h-5 text-yellow-600" />
            <span className="font-bold text-yellow-700">{coins.toLocaleString()}</span>
          </div>
          
          {streak > 0 && (
            <div className="flex items-center gap-2 bg-orange-100 rounded-lg px-3 py-2">
              <Flame className="w-5 h-5 text-orange-600" />
              <span className="font-bold text-orange-700">{streak} day{streak !== 1 ? 's' : ''}</span>
            </div>
          )}
          
          {streak > 0 && (
            <div className="flex items-center gap-1 text-green-600 text-sm">
              <TrendingUp className="w-4 h-4" />
              <span>+{Math.min(streak * 10, 50)}% XP</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
