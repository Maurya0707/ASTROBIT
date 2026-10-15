import React from 'react';
import { 
  X, 
  Trophy, 
  RotateCcw, 
  CheckCircle2
} from 'lucide-react';
import { getRankForXp, getNextRank, PROBLEMS } from '../data/curriculum';
import { soundFx } from '../services/soundFx';
import { ACHIEVEMENTS } from '../data/achievements';

export default function ProfileModal({ 
  currentUser,
  userProgress, 
  onClose, 
  onResetProgress, 
  selectedAvatar, 
  setSelectedAvatar 
}) {
  const currentRank = getRankForXp(userProgress.xp);

  const avatarOptions = [
    { id: 'idle', name: 'Cadet Salute', path: '/sprites/astronaut_idle.png', desc: 'Standing by for mission' },
    { id: 'walking', name: 'Path Walk', path: '/sprites/astronaut_walking.png', desc: 'Spline traversal' },
    { id: 'floating', name: 'Zero-G Coder', path: '/sprites/astronaut_floating.png', desc: 'Coding with sparks' },
    { id: 'cheering', name: 'Victory Leap', path: '/sprites/astronaut_cheering.png', desc: 'Level up celebration' },
    { id: 'typing', name: 'Active Terminal', path: '/sprites/astronaut_typing.png', desc: 'Compiler execution' },
    { id: 'sitting', name: 'Lab Study', path: '/sprites/astronaut_sitting.png', desc: 'Engineering analysis' },
    { id: 'running', name: 'Time Attack', path: '/sprites/astronaut_running.png', desc: 'Rapid sprint' },
    { id: 'hint', name: 'Bug Hunter', path: '/sprites/astronaut_hint.png', desc: 'Memory debugging' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-950/80 backdrop-blur-md select-none animate-fadeInScale">
      <div className="relative w-full max-w-2xl bg-charcoal-900 border border-charcoal-700 rounded-2xl p-6 shadow-2xl overflow-hidden box-glow-cyan max-h-[90vh] flex flex-col font-retro">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-charcoal-800 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-cosmic-cyan" />
            <h2 className="text-sm font-pixel text-slate-100">
              ASTRONAUT FLIGHT DOSSIER
            </h2>
          </div>
          <button
            onClick={() => { soundFx.playClick(); onClose(); }}
            className="p-1 rounded-lg bg-charcoal-800 hover:bg-charcoal-700 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Scrollable Content */}
        <div className="flex-1 overflow-y-auto space-y-5 pr-1">
          
          {/* Astronaut Profile Hero Card */}
          <div className="flex flex-col sm:flex-row items-center gap-4 bg-charcoal-950 p-4 rounded-xl border border-charcoal-800">
            <div className="relative w-16 h-16 bg-charcoal-900 rounded-xl border border-cosmic-cyan flex items-center justify-center overflow-hidden box-glow-cyan">
              <img 
                src={selectedAvatar} 
                alt="Avatar" 
                style={{ width: '48px', height: '48px', maxWidth: '48px', maxHeight: '48px' }}
                className="object-contain pixelated animate-float" 
              />
              <span className="absolute bottom-0 right-0 px-1 rounded bg-cosmic-orange text-charcoal-950 text-[8px] font-pixel font-bold">
                LV.{currentRank.level}
              </span>
            </div>

            <div className="flex-1 text-center sm:text-left space-y-0.5">
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <span className="text-xs font-pixel text-slate-100">
                  {currentUser?.name || 'Cadet Aditya Maurya'}
                </span>
                <span className="text-xs text-cosmic-amber">
                  {currentRank.badge}
                </span>
              </div>
              <p className="text-[11px] text-cosmic-cyan font-bold">
                {currentUser?.role === 'admin' ? 'Faculty Instructor' : currentRank.title}
                {currentUser?.rollNo && <span className="text-slate-400 ml-2 font-mono">({currentUser.rollNo})</span>}
              </p>

              {/* Stats Counters */}
              <div className="flex items-center justify-center sm:justify-start gap-4 pt-1.5 text-xs">
                <div>
                  <span className="text-slate-500 text-[9px] block">TOTAL XP</span>
                  <span className="font-pixel text-cosmic-amber text-xs">{userProgress.xp}</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[9px] block">SOLVED</span>
                  <span className="font-pixel text-cosmic-emerald text-xs">{userProgress.clearedProblems.length}/21</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[9px] block">ATTEMPTED</span>
                  <span className="font-pixel text-cosmic-cyan text-xs">{userProgress.attemptedProblems.length}/21</span>
                </div>
              </div>
            </div>
          </div>

          {/* Sprite Selection */}
          <div className="space-y-2">
            <span className="text-[10px] font-pixel text-cosmic-cyan block">
              CHOOSE ASTRONAUT AVATAR SPRITE
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {avatarOptions.map((opt) => (
                <div
                  key={opt.id}
                  onClick={() => {
                    soundFx.playClick();
                    setSelectedAvatar(opt.path);
                  }}
                  className={`p-2 rounded-xl border cursor-pointer flex flex-col items-center text-center transition-all ${
                    selectedAvatar === opt.path
                      ? 'bg-charcoal-850 border-cosmic-cyan box-glow-cyan'
                      : 'bg-charcoal-950 border-charcoal-800 hover:border-charcoal-700'
                  }`}
                >
                  <img 
                    src={opt.path} 
                    alt={opt.name} 
                    style={{ width: '36px', height: '36px', maxWidth: '36px', maxHeight: '36px' }}
                    className="object-contain pixelated mb-1" 
                  />
                  <span className="font-pixel text-[8px] text-slate-200">{opt.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Achievements */}
          <div className="space-y-2">
            <span className="text-[10px] font-pixel text-cosmic-amber block">
              COSMIC ACHIEVEMENTS &amp; MILESTONES
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {ACHIEVEMENTS.map((a) => {
                const isUnlocked = (userProgress.unlockedAchievements || []).includes(a.id);
                return (
                  <div 
                    key={a.id}
                    className={`p-2.5 rounded-xl border flex items-center gap-2.5 transition-all ${
                      isUnlocked 
                        ? 'bg-charcoal-950 border-cosmic-emerald/60 box-glow-cyan' 
                        : 'bg-charcoal-950/40 border-charcoal-800/80 opacity-40 grayscale'
                    }`}
                  >
                    <div 
                      className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs"
                      style={{ 
                        backgroundColor: isUnlocked ? '#15161a' : '#111216',
                        border: `1px solid ${isUnlocked ? a.badgeColor : '#333'}` 
                      }}
                    >
                      <Trophy className="w-4 h-4" style={{ color: isUnlocked ? a.badgeColor : '#666' }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h4 className="font-pixel text-[9px] text-slate-200 truncate">{a.title}</h4>
                        <span className="text-[8px] font-retro text-cosmic-amber">+{a.xpReward} XP</span>
                      </div>
                      <p className="text-[10px] text-slate-400 line-clamp-1">{a.description}</p>
                    </div>
                    {isUnlocked && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-cosmic-emerald ml-auto flex-shrink-0" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="mt-4 pt-3 border-t border-charcoal-800 flex items-center justify-between">
          <button
            onClick={() => {
              if (confirm('Reset your solved problems and XP progress?')) {
                onResetProgress();
                soundFx.playFail();
              }
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-950/40 border border-red-800/60 text-red-400 text-[9px] font-pixel hover:bg-red-900/40 transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            <span>RESET PROGRESS</span>
          </button>

          <button
            onClick={() => { soundFx.playClick(); onClose(); }}
            className="px-4 py-1.5 rounded-xl bg-cosmic-cyan text-charcoal-950 text-xs font-pixel font-bold hover:bg-cyan-400 transition-colors"
          >
            CONFIRM & CLOSE
          </button>
        </div>

      </div>
    </div>
  );
}
