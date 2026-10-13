import { create } from 'zustand';
import type {
  GameState,
  CharacterItem,
  ShopItem,
  MissionItem,
  PlayerProfile,
  UserAccount,
  ActivePowerUp,
} from '../types/game.ts';
import { fetchPlayerData, submitRunScore } from '../services/api.ts';
import { audio } from '../services/audio.ts';

interface GameStore {
  gameState: GameState;
  score: number;
  distance: number;
  coinsCollected: number;
  multiplier: number;
  runStartTime: number;

  // Active power-ups
  powerUps: {
    magnet: number; // remaining seconds
    jetpack: number;
    multiplier: number;
    hoverboard: number;
  };

  // Profile and loaded state
  user: UserAccount | null;
  profile: PlayerProfile | null;
  unlockedCharacters: string[];
  characters: CharacterItem[];
  items: ShopItem[];
  missions: MissionItem[];
  isLoadingPlayer: boolean;

  // Last run stats for Game Over screen
  lastRunResult: {
    score: number;
    distance: number;
    coinsCollected: number;
    isNewBest: boolean;
  } | null;

  // Actions
  setGameState: (state: GameState) => void;
  loadProfile: () => Promise<void>;
  startRun: () => void;
  pauseRun: () => void;
  resumeRun: () => void;
  endRun: (reason?: string) => Promise<void>;

  addDistance: (meters: number) => void;
  addScore: (points: number) => void;
  collectCoin: () => void;
  activatePowerUp: (type: 'magnet' | 'jetpack' | 'multiplier' | 'hoverboard', duration?: number) => void;
  breakHoverboard: () => void;
  tickPowerUps: (deltaSeconds: number) => void;
}

export const useGameStore = create<GameStore>((set, get) => ({
  gameState: 'menu',
  score: 0,
  distance: 0,
  coinsCollected: 0,
  multiplier: 1,
  runStartTime: 0,

  powerUps: {
    magnet: 0,
    jetpack: 0,
    multiplier: 0,
    hoverboard: 0,
  },

  user: null,
  profile: null,
  unlockedCharacters: ['runner-dash'],
  characters: [],
  items: [],
  missions: [],
  isLoadingPlayer: true,
  lastRunResult: null,

  setGameState: (gameState) => set({ gameState }),

  loadProfile: async () => {
    try {
      set({ isLoadingPlayer: true });
      const data = await fetchPlayerData();
      set({
        user: data.user,
        profile: data.profile,
        unlockedCharacters: data.unlockedCharacters || ['runner-dash'],
        characters: data.characters || [],
        items: data.items || [],
        missions: data.missions || [],
        isLoadingPlayer: false,
      });
    } catch (e) {
      console.warn('Could not load profile from server, using local fallback:', e);
      set({ isLoadingPlayer: false });
    }
  },

  startRun: () => {
    const { profile } = get();
    // Check if player has equipped a hoverboard to start with
    const hasInitialBoard = profile && profile.currentBoardId !== 'none' ? 25 : 0;

    audio.startMusic();
    set({
      gameState: 'playing',
      score: 0,
      distance: 0,
      coinsCollected: 0,
      multiplier: 1,
      runStartTime: Date.now(),
      powerUps: {
        magnet: 0,
        jetpack: 0,
        multiplier: 0,
        hoverboard: hasInitialBoard,
      },
      lastRunResult: null,
    });
  },

  pauseRun: () => {
    set({ gameState: 'paused' });
  },

  resumeRun: () => {
    set({ gameState: 'playing' });
  },

  endRun: async (reason = 'collision') => {
    const state = get();
    audio.playCrash();

    const durationSeconds = Math.max(1, Math.round((Date.now() - state.runStartTime) / 1000));
    const isNewBest = state.profile ? state.score > state.profile.bestScore : false;

    set({
      gameState: 'gameover',
      lastRunResult: {
        score: state.score,
        distance: state.distance,
        coinsCollected: state.coinsCollected,
        isNewBest,
      },
    });

    try {
      const charCode = state.profile?.currentCharacterId || 'runner-dash';
      const result = await submitRunScore({
        score: state.score,
        distance: state.distance,
        coinsCollected: state.coinsCollected,
        durationSeconds,
        characterCode: charCode,
        deathReason: reason,
      });

      if (state.profile) {
        set({
          profile: {
            ...state.profile,
            totalCoins: result.newCoins,
            bestScore: result.bestScore,
            totalDistance: result.totalDistance,
            totalRunsPlayed: result.totalRuns,
          },
        });
      }
    } catch (err) {
      console.error('Error submitting score to server:', err);
    }
  },

  addDistance: (meters) => {
    const { distance, powerUps, multiplier } = get();
    const effectiveMult = (powerUps.multiplier > 0 ? 2 : 1) * multiplier;
    const addedScore = Math.round(meters * effectiveMult * 1.5);

    set((s) => ({
      distance: Math.round(distance + meters),
      score: s.score + addedScore,
    }));
  },

  addScore: (points) => {
    set((s) => ({ score: s.score + points }));
  },

  collectCoin: () => {
    audio.playCoin();
    set((s) => ({
      coinsCollected: s.coinsCollected + 1,
      score: s.score + 50 * (s.powerUps.multiplier > 0 ? 2 : 1),
    }));
  },

  activatePowerUp: (type, duration = 10) => {
    audio.playPowerup();
    set((s) => ({
      powerUps: {
        ...s.powerUps,
        [type]: duration,
      },
    }));
  },

  breakHoverboard: () => {
    audio.playShieldBreak();
    set((s) => ({
      powerUps: {
        ...s.powerUps,
        hoverboard: 0,
      },
    }));
  },

  tickPowerUps: (deltaSeconds) => {
    set((s) => {
      const pu = { ...s.powerUps };
      let changed = false;
      (['magnet', 'jetpack', 'multiplier', 'hoverboard'] as const).forEach((key) => {
        if (pu[key] > 0) {
          pu[key] = Math.max(0, pu[key] - deltaSeconds);
          changed = true;
        }
      });
      return changed ? { powerUps: pu } : {};
    });
  },
}));
