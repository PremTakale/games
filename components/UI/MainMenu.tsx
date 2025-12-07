import React, { useEffect } from 'react';
import { useGameStore } from '../../store';
import { Difficulty, GameState, WeaponType } from '../../types';
import { Play, Shield, ShieldAlert, Skull, Zap } from 'lucide-react';
import { generateLevelLore } from '../../services/geminiService';

export const MainMenu: React.FC = () => {
  const { 
    startGame, 
    setDifficulty, 
    difficulty, 
    gameState, 
    playerStats, 
    levelLore, 
    setLevelLore,
    setWeapon,
    selectedWeapon,
    resetGame,
    completeLevel
  } = useGameStore();

  useEffect(() => {
    // Generate lore when menu mounts
    let active = true;
    const fetchLore = async () => {
        setLevelLore("Decrypting mission files...");
        const lore = await generateLevelLore(playerStats.currentLevel, difficulty, playerStats.unlockedWeapons[playerStats.unlockedWeapons.length-1]);
        if(active) setLevelLore(lore);
    };
    fetchLore();
    return () => { active = false; };
  }, [difficulty, playerStats.currentLevel]); // Re-fetch if difficulty changes

  const isGameOver = gameState === GameState.GAME_OVER;
  const isLevelComplete = gameState === GameState.LEVEL_COMPLETE;

  if (gameState === GameState.PLAYING) return null;

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/90 backdrop-blur-sm p-4">
      <div className="glass-panel max-w-2xl w-full rounded-2xl p-8 border border-purple-500/30 shadow-[0_0_50px_rgba(168,85,247,0.2)]">
        
        {/* Header */}
        <div className="text-center mb-8">
            <h1 className="text-5xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 mb-2">
                NEON ARCHER
            </h1>
            <p className="text-slate-400 tracking-[0.2em] text-sm uppercase">Cyber Hunt Initiative // v1.0.4</p>
        </div>

        {/* Content based on State */}
        {(isGameOver || isLevelComplete) ? (
            <div className="text-center space-y-6">
                <h2 className={`text-3xl font-bold ${isLevelComplete ? 'text-green-400' : 'text-red-500'}`}>
                    {isLevelComplete ? 'MISSION ACCOMPLISHED' : 'CRITICAL FAILURE'}
                </h2>
                <p className="text-slate-300">
                    {isLevelComplete ? 'Target neutralized. Rewards deposited.' : 'Operator status: KIA.'}
                </p>
                <div className="flex justify-center gap-4">
                    {isLevelComplete ? (
                         <button 
                         onClick={completeLevel}
                         className="px-8 py-3 bg-green-600 hover:bg-green-500 text-white rounded-lg font-bold shadow-lg shadow-green-500/20 transition-all flex items-center gap-2"
                     >
                         <Play className="w-5 h-5" /> CONTINUE
                     </button>
                    ) : (
                        <button 
                            onClick={resetGame}
                            className="px-8 py-3 bg-red-600 hover:bg-red-500 text-white rounded-lg font-bold shadow-lg shadow-red-500/20 transition-all flex items-center gap-2"
                        >
                            <Skull className="w-5 h-5" /> RETRY
                        </button>
                    )}
                </div>
            </div>
        ) : (
            <div className="space-y-8">
                 {/* Mission Briefing (Gemini) */}
                 <div className="bg-slate-950/50 p-4 rounded-lg border-l-4 border-cyan-500">
                    <h3 className="text-cyan-400 font-mono text-xs uppercase mb-1">Mission Intelligence</h3>
                    <p className="text-slate-300 italic text-sm font-light leading-relaxed">
                        "{levelLore}"
                    </p>
                 </div>

                 {/* Difficulty Select */}
                 <div>
                    <div className="text-xs text-slate-500 uppercase font-bold mb-3">Select Difficulty</div>
                    <div className="grid grid-cols-3 gap-4">
                        {[Difficulty.EASY, Difficulty.MEDIUM, Difficulty.HARD].map((d) => (
                            <button
                                key={d}
                                onClick={() => setDifficulty(d)}
                                className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${
                                    difficulty === d 
                                    ? 'bg-purple-600/20 border-purple-500 text-white shadow-[0_0_20px_rgba(168,85,247,0.3)]' 
                                    : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:bg-slate-700'
                                }`}
                            >
                                {d === Difficulty.EASY && <Shield className="w-6 h-6" />}
                                {d === Difficulty.MEDIUM && <ShieldAlert className="w-6 h-6" />}
                                {d === Difficulty.HARD && <Skull className="w-6 h-6" />}
                                <span className="text-xs font-bold">{d}</span>
                            </button>
                        ))}
                    </div>
                 </div>

                 {/* Loadout Select */}
                 <div>
                    <div className="text-xs text-slate-500 uppercase font-bold mb-3">Loadout</div>
                    <div className="flex gap-2 overflow-x-auto pb-2">
                        {Object.values(WeaponType).map((w) => {
                            const isUnlocked = playerStats.unlockedWeapons.includes(w);
                            return (
                                <button
                                    key={w}
                                    disabled={!isUnlocked}
                                    onClick={() => setWeapon(w)}
                                    className={`px-4 py-2 rounded-lg text-sm font-bold border transition-all whitespace-nowrap ${
                                        selectedWeapon === w
                                        ? 'bg-pink-600/20 border-pink-500 text-pink-400'
                                        : isUnlocked 
                                            ? 'bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-500' 
                                            : 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed opacity-50'
                                    }`}
                                >
                                    {w} {(!isUnlocked) && '(LOCKED)'}
                                </button>
                            )
                        })}
                    </div>
                 </div>

                 {/* Start */}
                 <button 
                    onClick={startGame}
                    className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl text-white font-black text-xl tracking-widest shadow-xl hover:shadow-purple-500/25 transform hover:scale-[1.02] transition-all flex items-center justify-center gap-3"
                 >
                    <Zap className="w-6 h-6 fill-white" />
                    INITIATE
                 </button>
            </div>
        )}
      </div>
    </div>
  );
};