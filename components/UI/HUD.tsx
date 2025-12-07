import React from 'react';
import { useGameStore } from '../../store';
import { Heart, Crosshair, Zap, Target } from 'lucide-react';
import { WeaponType } from '../../types';

export const HUD: React.FC = () => {
  const { health, score, ammo, targetsRemaining, selectedWeapon, playerStats } = useGameStore();

  const getWeaponColor = (w: WeaponType) => {
    switch (w) {
      case WeaponType.FIRE: return 'text-orange-500';
      case WeaponType.ICE: return 'text-cyan-400';
      case WeaponType.ELECTRIC: return 'text-yellow-400';
      default: return 'text-white';
    }
  };

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-6">
      {/* Top Bar */}
      <div className="flex justify-between items-start">
        {/* Health & Level */}
        <div className="glass-panel p-4 rounded-xl flex flex-col gap-2">
            <div className="flex items-center gap-2">
                <Heart className="w-6 h-6 text-red-500 fill-red-500" />
                <div className="w-32 h-4 bg-slate-800 rounded-full overflow-hidden border border-slate-600">
                    <div 
                        className="h-full bg-gradient-to-r from-red-600 to-red-400 transition-all duration-300"
                        style={{ width: `${health}%` }}
                    />
                </div>
                <span className="text-white font-bold text-lg">{health}</span>
            </div>
            <div className="text-xs text-slate-300 font-mono tracking-widest uppercase">
                Level {playerStats.currentLevel}
            </div>
        </div>

        {/* Score & Targets */}
        <div className="glass-panel p-4 rounded-xl text-right">
            <div className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">
                {score.toLocaleString()} PTS
            </div>
            <div className="flex items-center justify-end gap-2 text-slate-200 mt-1">
                <Target className="w-4 h-4" />
                <span>REMAINING: {targetsRemaining}</span>
            </div>
        </div>
      </div>

      {/* Crosshair (Center) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <Crosshair className={`w-8 h-8 opacity-70 ${getWeaponColor(selectedWeapon)}`} />
      </div>

      {/* Bottom Bar (Ammo & Weapon) */}
      <div className="flex justify-between items-end">
         <div className="glass-panel p-4 rounded-xl flex items-center gap-4">
             <div className={`p-2 rounded-lg bg-slate-800/50 ${getWeaponColor(selectedWeapon)}`}>
                 <Zap className="w-6 h-6" />
             </div>
             <div>
                 <div className="text-sm text-slate-400 uppercase">Weapon</div>
                 <div className={`font-bold text-lg ${getWeaponColor(selectedWeapon)}`}>
                     {selectedWeapon} BOW
                 </div>
             </div>
         </div>

         <div className="glass-panel p-4 rounded-xl">
             <div className="text-4xl font-mono font-bold text-white tracking-tighter">
                 {ammo} <span className="text-lg text-slate-400">/ ARROWS</span>
             </div>
         </div>
      </div>
    </div>
  );
};