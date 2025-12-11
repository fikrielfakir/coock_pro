import { useEffect, useState } from "react";
import { useProgression, ChefTitle } from "@/lib/stores/useProgression";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Star, ChefHat, Gift, Sparkles } from "lucide-react";
import Confetti from "react-confetti";

interface LevelUpNotificationProps {
  isOpen: boolean;
  onClose: () => void;
  newLevel: number;
  oldLevel: number;
}

export function LevelUpNotification({ isOpen, onClose, newLevel, oldLevel }: LevelUpNotificationProps) {
  const getLevelMilestone = useProgression(state => state.getLevelMilestone);
  const getTitleForLevel = useProgression(state => state.getTitleForLevel);
  
  const [showConfetti, setShowConfetti] = useState(true);
  const [windowSize, setWindowSize] = useState({ width: window.innerWidth, height: window.innerHeight });

  const milestone = getLevelMilestone(newLevel);
  const newTitle = getTitleForLevel(newLevel);
  const oldTitle = getTitleForLevel(oldLevel);
  const titleChanged = newTitle !== oldTitle;

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-md bg-gradient-to-b from-yellow-50 to-orange-100 border-yellow-300">
        {showConfetti && (
          <Confetti
            width={windowSize.width}
            height={windowSize.height}
            recycle={false}
            numberOfPieces={200}
            colors={["#ffd700", "#ff6b35", "#f7931e", "#4ecdc4"]}
            style={{ position: 'fixed', top: 0, left: 0, zIndex: 100 }}
          />
        )}
        
        <div className="text-center space-y-6 py-4">
          <div className="relative inline-block">
            <div className="w-24 h-24 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-xl animate-pulse">
              <ChefHat className="w-14 h-14 text-white" />
            </div>
            <div className="absolute -top-2 -right-2 w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center text-xl font-bold text-yellow-900 border-4 border-white shadow-lg">
              {newLevel}
            </div>
            <Sparkles className="absolute -top-4 -left-4 w-8 h-8 text-yellow-500 animate-spin" style={{ animationDuration: '3s' }} />
            <Sparkles className="absolute -bottom-2 -right-4 w-6 h-6 text-orange-400 animate-spin" style={{ animationDuration: '2s', animationDirection: 'reverse' }} />
          </div>
          
          <div>
            <h2 className="text-3xl font-bold text-yellow-800 mb-2">Level Up!</h2>
            <p className="text-lg text-orange-700">You reached Level {newLevel}!</p>
          </div>
          
          {titleChanged && (
            <div className="bg-white/80 rounded-xl p-4 border border-yellow-200">
              <p className="text-sm text-gray-600 mb-1">New Title Unlocked</p>
              <div className="flex items-center justify-center gap-2">
                <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                <span className="text-xl font-bold text-orange-800">{newTitle}</span>
                <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
              </div>
            </div>
          )}
          
          {(milestone.bonusCoins > 0 || milestone.unlockedRecipes.length > 0 || milestone.specialReward) && (
            <div className="bg-white/80 rounded-xl p-4 border border-yellow-200 space-y-3">
              <div className="flex items-center justify-center gap-2 text-orange-700">
                <Gift className="w-5 h-5" />
                <span className="font-semibold">Rewards</span>
              </div>
              
              <div className="space-y-2 text-sm">
                {milestone.bonusCoins > 0 && (
                  <div className="flex items-center justify-center gap-2 bg-yellow-100 rounded-lg py-2">
                    <span className="text-yellow-700">+{milestone.bonusCoins} Coins</span>
                  </div>
                )}
                
                {milestone.unlockedRecipes.length > 0 && (
                  <div className="bg-green-100 rounded-lg py-2 px-3">
                    <p className="text-green-700 font-medium">New Recipes Unlocked!</p>
                    <p className="text-green-600 text-xs">{milestone.unlockedRecipes.length} new recipe{milestone.unlockedRecipes.length !== 1 ? 's' : ''}</p>
                  </div>
                )}
                
                {milestone.specialReward && (
                  <div className="bg-purple-100 rounded-lg py-2 px-3">
                    <p className="text-purple-700">{milestone.specialReward}</p>
                  </div>
                )}
              </div>
            </div>
          )}
          
          <Button 
            onClick={onClose}
            className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-lg py-6"
          >
            Continue Cooking!
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
