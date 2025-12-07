import React from 'react';
import { GameScene } from './components/GameScene';
import { HUD } from './components/UI/HUD';
import { MainMenu } from './components/UI/MainMenu';
import { useGameStore } from './store';
import { GameState } from './types';

function App() {
  const { gameState } = useGameStore();

  return (
    <div className="relative w-full h-full bg-slate-900 overflow-hidden select-none">
      {/* 3D Background / Game Layer */}
      <div className="absolute inset-0 z-0">
        <GameScene />
      </div>

      {/* UI Overlay Layer */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        {gameState === GameState.PLAYING && <HUD />}
      </div>

      {/* Menus (Pointer events enabled) */}
      <div className="absolute inset-0 z-20 pointer-events-auto">
        {(gameState === GameState.MENU || gameState === GameState.GAME_OVER || gameState === GameState.LEVEL_COMPLETE) && (
          <MainMenu />
        )}
      </div>
      
      {/* Mobile Control Hint (Overlay) */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-50 pointer-events-none opacity-50">
        {gameState === GameState.PLAYING && (
          <p className="text-white text-xs font-mono uppercase bg-black/50 px-2 rounded">
            PC: Click to Lock Aim | Click to Shoot
          </p>
        )}
      </div>
    </div>
  );
}

export default App;