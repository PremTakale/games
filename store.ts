import { create } from 'zustand';
import { GameState, Difficulty, WeaponType, PlayerStats } from './types';

interface GameStore {
  gameState: GameState;
  difficulty: Difficulty;
  score: number;
  health: number;
  selectedWeapon: WeaponType;
  playerStats: PlayerStats;
  ammo: number;
  targetsRemaining: number;
  levelLore: string;
  
  // Actions
  setGameState: (state: GameState) => void;
  setDifficulty: (diff: Difficulty) => void;
  setWeapon: (weapon: WeaponType) => void;
  startGame: () => void;
  takeDamage: (amount: number) => void;
  scorePoint: (points: number) => void;
  decrementAmmo: () => void;
  setLevelLore: (lore: string) => void;
  completeLevel: () => void;
  resetGame: () => void;
}

export const useGameStore = create<GameStore>((set, get) => ({
  gameState: GameState.MENU,
  difficulty: Difficulty.EASY,
  score: 0,
  health: 100,
  selectedWeapon: WeaponType.STANDARD,
  ammo: 20,
  targetsRemaining: 5,
  levelLore: "Loading mission data...",
  playerStats: {
    coins: 0,
    unlockedWeapons: [WeaponType.STANDARD],
    currentLevel: 1,
  },

  setGameState: (state) => set({ gameState: state }),
  setDifficulty: (difficulty) => set({ difficulty }),
  setWeapon: (selectedWeapon) => set({ selectedWeapon }),
  setLevelLore: (levelLore) => set({ levelLore }),

  startGame: () => {
    const { difficulty, playerStats } = get();
    let ammoCount = 20;
    let targetCount = 3 + playerStats.currentLevel;

    if (difficulty === Difficulty.MEDIUM) {
        ammoCount = 15;
        targetCount += 2;
    } else if (difficulty === Difficulty.HARD) {
        ammoCount = 10;
        targetCount += 4;
    }

    set({
      gameState: GameState.PLAYING,
      score: 0,
      health: 100,
      ammo: ammoCount,
      targetsRemaining: targetCount,
    });
  },

  takeDamage: (amount) => {
    const { health } = get();
    const newHealth = Math.max(0, health - amount);
    set({ health: newHealth });
    if (newHealth <= 0) {
      set({ gameState: GameState.GAME_OVER });
    }
  },

  scorePoint: (points) => {
    const { score, targetsRemaining } = get();
    const newTargets = targetsRemaining - 1;
    set({ 
      score: score + points,
      targetsRemaining: newTargets 
    });

    if (newTargets <= 0) {
      set({ gameState: GameState.LEVEL_COMPLETE });
    }
  },

  decrementAmmo: () => {
    const { ammo } = get();
    const newAmmo = ammo - 1;
    set({ ammo: newAmmo });
    if (newAmmo < 0) { // Allow last shot
        // Check game over condition if out of ammo and targets remain
        const { targetsRemaining } = get();
        if (targetsRemaining > 0) {
            set({ gameState: GameState.GAME_OVER });
        }
    }
  },

  completeLevel: () => {
    const { playerStats, difficulty } = get();
    // Rewards
    let coinReward = 50;
    if (difficulty === Difficulty.MEDIUM) coinReward = 100;
    if (difficulty === Difficulty.HARD) coinReward = 200;

    const newWeapons = [...playerStats.unlockedWeapons];
    
    // Unlock mechanics
    if (playerStats.currentLevel === 1 && !newWeapons.includes(WeaponType.FIRE)) newWeapons.push(WeaponType.FIRE);
    if (playerStats.currentLevel === 2 && !newWeapons.includes(WeaponType.ICE)) newWeapons.push(WeaponType.ICE);
    if (playerStats.currentLevel === 4 && !newWeapons.includes(WeaponType.ELECTRIC)) newWeapons.push(WeaponType.ELECTRIC);

    set({
        playerStats: {
            ...playerStats,
            coins: playerStats.coins + coinReward,
            currentLevel: playerStats.currentLevel + 1,
            unlockedWeapons: newWeapons
        },
        gameState: GameState.MENU // Return to menu to see rewards/next level
    });
  },

  resetGame: () => {
      set({
          gameState: GameState.MENU,
          health: 100,
          score: 0
      })
  }
}));