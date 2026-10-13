export type GameState = 'menu' | 'playing' | 'paused' | 'gameover';

export interface CharacterItem {
  id: number;
  code: string;
  name: string;
  description: string;
  price: number;
  colorTheme: string;
  speedMultiplier: number;
  isDefault: boolean;
}

export interface ShopItem {
  id: number;
  code: string;
  name: string;
  category: 'hoverboard' | 'powerup' | 'booster';
  price: number;
  description: string;
  icon: string;
}

export interface MissionItem {
  id: number;
  code: string;
  title: string;
  description: string;
  type: 'daily' | 'weekly';
  targetType: 'distance' | 'coins' | 'score' | 'runs';
  targetValue: number;
  rewardCoins: number;
  currentProgress: number;
  completed: boolean;
  claimed: boolean;
}

export interface PlayerProfile {
  id: number;
  userId: number;
  totalCoins: number;
  bestScore: number;
  totalDistance: number;
  totalRunsPlayed: number;
  currentCharacterId: string;
  currentBoardId: string;
}

export interface UserAccount {
  id: number;
  uid: string;
  email?: string | null;
  username: string;
  isGuest: boolean;
}

export interface LeaderboardEntry {
  id: number;
  score: number;
  distance: number;
  coins: number;
  createdAt: string;
  userId: number;
  username: string;
  isGuest: boolean;
}

export interface ActivePowerUp {
  type: 'magnet' | 'jetpack' | 'multiplier' | 'hoverboard';
  remainingSeconds: number;
  totalSeconds: number;
}
