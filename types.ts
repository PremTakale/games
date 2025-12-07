import { Vector3 } from 'three';

export enum GameState {
  MENU = 'MENU',
  PLAYING = 'PLAYING',
  GAME_OVER = 'GAME_OVER',
  LEVEL_COMPLETE = 'LEVEL_COMPLETE'
}

export enum Difficulty {
  EASY = 'EASY',
  MEDIUM = 'MEDIUM',
  HARD = 'HARD'
}

export enum WeaponType {
  STANDARD = 'Standard',
  FIRE = 'Fire',
  ICE = 'Ice',
  ELECTRIC = 'Electric'
}

export interface PlayerStats {
  coins: number;
  unlockedWeapons: WeaponType[];
  currentLevel: number;
}

export interface EnemyData {
  id: string;
  position: [number, number, number];
  speed: number;
  type: 'patrol' | 'chase' | 'jumper';
  health: number;
  maxHealth: number;
}

export interface ArrowData {
  id: string;
  position: Vector3;
  velocity: Vector3;
  active: boolean;
  type: WeaponType;
}

export interface LevelConfig {
  enemyCount: number;
  enemySpeedMultiplier: number;
  obstacles: boolean;
  environmentColor: string;
  name: string;
  description: string;
}