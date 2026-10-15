import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { 
  Trophy, 
  Sparkles, 
  X, 
  Zap, 
  Award, 
  CheckCircle2, 
  Star 
} from 'lucide-react';
import { soundFx } from '../services/soundFx';

export default function AchievementToast({ achievement, onDismiss }) {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (!achievement) return;

    // Trigger celebratory sound and confetti fanfare
    soundFx.playLevelUp();
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.2, x: 0.85 },
      colors: ['#00f0ff', '#ff6b00', '#ffd700', '#10b981']
    });

    // Auto dismiss countdown
    const duration = 6000;
    const interval = 50;
    const step = (interval / duration) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev <= 0) {
          clearInterval(timer);
          onDismiss();
          return 0;
        }
        return prev - step;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [achievement]);

  if (!achievement) return null;

  return (
    <div className="fixed top-20 right-4 sm:right-8 z-50 max-w-sm w-full animate-fadeInScale select-none pointer-events-auto">
      <div 
        className="relative overflow-hidden rounded-md bg-black/60 border-2 backdrop-blur-2xl shadow-2xl p-4 transition-all"
        style={{
          borderColor: achievement.badgeColor || '#00f0ff',
          boxShadow: `0 0 25px ${achievement.badgeColor || '#00f0ff'}44, inset 0 0 15px ${achievement.badgeColor || '#00f0ff'}15`
        }}
      >
        {/* Subtle Decorative Starburst Background Glow */}
        <div 
          className="absolute -top-12 -right-12 w-32 h-32 rounded-full blur-2xl opacity-30 pointer-events-none"
          style={{ background: achievement.badgeColor || '#00f0ff' }}
        />

        {/* Top Header Row */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <span className="animate-spin-slow">
              <Sparkles className="w-4 h-4 text-cosmic-amber" />
            </span>
            <span className="font-pixel text-[10px] text-cosmic-amber tracking-wider text-glow-orange">
              ★ ACHIEVEMENT UNLOCKED! ★
            </span>
          </div>

          <button
            onClick={onDismiss}
            className="p-1 rounded-sm bg-charcoal-800 hover:bg-charcoal-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Achievement Core Content */}
        <div className="flex items-start gap-3 mt-2">
          {/* Badge Icon Orb */}
          <div 
            className="relative flex-shrink-0 w-12 h-12 rounded-md flex items-center justify-center border shadow-md animate-bounce"
            style={{
              backgroundColor: '#15161a',
              borderColor: achievement.badgeColor || '#00f0ff'
            }}
          >
            <Trophy 
              className="w-6 h-6" 
              style={{ color: achievement.badgeColor || '#00f0ff' }}
            />
            {/* Mini Star Sparkle */}
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-cosmic-amber rounded-sm flex items-center justify-center text-[7px] font-bold text-charcoal-950">
              ★
            </span>
          </div>

          {/* Texts */}
          <div className="flex-1 min-w-0">
            <h4 className="font-pixel text-xs text-white truncate drop-shadow-sm">
              {achievement.title}
            </h4>
            <p className="font-retro text-[11px] text-slate-300 mt-1 leading-snug">
              {achievement.description}
            </p>
            
            <div className="flex items-center gap-2 mt-2">
              <span className="px-2 py-0.5 rounded-sm bg-cosmic-emerald/20 border border-cosmic-emerald/60 text-cosmic-emerald text-[9px] font-pixel flex items-center gap-1">
                <Zap className="w-2.5 h-2.5" /> +{achievement.xpReward} BONUS XP
              </span>
              <span className="text-[10px] font-retro text-slate-400 uppercase tracking-wider">
                {achievement.category}
              </span>
            </div>
          </div>
        </div>

        {/* Auto Dismiss Progress Bar */}
        <div className="mt-3.5 w-full h-1 bg-charcoal-800 rounded-full overflow-hidden">
          <div 
            className="h-full transition-all ease-linear"
            style={{ 
              width: `${progress}%`,
              backgroundColor: achievement.badgeColor || '#00f0ff'
            }}
          />
        </div>

      </div>
    </div>
  );
}
