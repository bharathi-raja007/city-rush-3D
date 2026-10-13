import React from 'react';
import { Play, Users, ShoppingBag, Target, Trophy, HelpCircle, Shield, Sparkles } from 'lucide-react';
import { useGameStore } from '../store/gameStore.ts';
import { audio } from '../services/audio.ts';

interface HomeScreenProps {
  onOpenCharacters: () => void;
  onOpenShop: () => void;
  onOpenMissions: () => void;
  onOpenLeaderboard: () => void;
  onOpenSettings: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onOpenCharacters,
  onOpenShop,
  onOpenMissions,
  onOpenLeaderboard,
  onOpenSettings,
}) => {
  const { gameState, startRun, profile, characters, missions } = useGameStore();

  if (gameState !== 'menu') return null;

  const currentCharacter = characters.find((c) => c.code === profile?.currentCharacterId) || characters[0];
  const claimableMissionsCount = missions.filter((m) => m.completed && !m.claimed).length;

  const handleStart = () => {
    audio.playClick();
    startRun();
  };

  return (
    <div className="absolute inset-0 pointer-events-none z-20 flex flex-col justify-between p-6 sm:p-8 select-none">
      {/* Top spacer (below navbar) */}
      <div className="h-16" />

      {/* Center Action & Title */}
      <div className="flex flex-col items-center justify-center text-center my-auto">
        <div className="mb-2 inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-950/70 border border-cyan-500/40 text-cyan-300 text-xs font-black tracking-widest uppercase backdrop-blur-md">
          <Sparkles className="w-3.5 h-3.5" />
          <span>SEASON 1 : SUBWAY NEON</span>
        </div>

        <h1 className="text-5xl sm:text-7xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-cyan-300 via-sky-200 to-blue-500 drop-shadow-[0_8px_24px_rgba(37,99,235,0.6)] uppercase">
          City Rush <span className="text-yellow-400">3D</span>
        </h1>

        <p className="text-sm sm:text-base font-bold text-slate-300/90 max-w-sm sm:max-w-md mt-1 mb-8 drop-shadow">
          Dodge trains, jump barricades, collect coins, and conquer the global subway leaderboards!
        </p>

        {/* Big Start Button */}
        <div className="pointer-events-auto">
          <button
            onClick={handleStart}
            className="group relative flex items-center justify-center space-x-3 px-10 py-5 rounded-3xl bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-400 hover:from-blue-500 hover:to-teal-300 text-white font-black text-xl sm:text-2xl tracking-wider shadow-2xl shadow-cyan-500/40 border border-cyan-300/40 transition-all duration-200 active:scale-95 hover:scale-105"
          >
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center shadow-inner group-hover:scale-110 transition">
              <Play className="w-6 h-6 fill-white text-white translate-x-0.5" />
            </div>
            <span className="drop-shadow">START RUN</span>
          </button>
        </div>

        {/* Selected Runner Tag */}
        {currentCharacter && (
          <div className="mt-4 pointer-events-auto cursor-pointer" onClick={onOpenCharacters}>
            <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-slate-900/80 border border-slate-700/80 hover:border-cyan-500/60 backdrop-blur-md transition shadow-md">
              <div
                className="w-3 h-3 rounded-full shadow"
                style={{ backgroundColor: currentCharacter.colorTheme }}
              />
              <span className="text-xs font-bold text-slate-200">
                Runner: <span className="text-cyan-300">{currentCharacter.name}</span>
              </span>
              <span className="text-[10px] text-slate-400 font-semibold underline ml-1">Change</span>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Navigation Dock */}
      <div className="flex justify-center pointer-events-auto">
        <div className="flex items-center space-x-2 sm:space-x-4 p-2 rounded-3xl bg-slate-900/90 backdrop-blur-xl border border-slate-800 shadow-2xl">
          {/* Characters */}
          <button
            onClick={onOpenCharacters}
            className="flex flex-col items-center justify-center w-16 h-14 sm:w-20 sm:h-16 rounded-2xl bg-slate-800/60 hover:bg-slate-800 hover:text-cyan-300 text-slate-300 transition active:scale-95 border border-slate-700/40"
          >
            <Users className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Runners</span>
          </button>

          {/* Shop */}
          <button
            onClick={onOpenShop}
            className="flex flex-col items-center justify-center w-16 h-14 sm:w-20 sm:h-16 rounded-2xl bg-slate-800/60 hover:bg-slate-800 hover:text-amber-300 text-slate-300 transition active:scale-95 border border-slate-700/40"
          >
            <ShoppingBag className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Shop</span>
          </button>

          {/* Missions */}
          <button
            onClick={onOpenMissions}
            className="relative flex flex-col items-center justify-center w-16 h-14 sm:w-20 sm:h-16 rounded-2xl bg-slate-800/60 hover:bg-slate-800 hover:text-purple-300 text-slate-300 transition active:scale-95 border border-slate-700/40"
          >
            {claimableMissionsCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-purple-500 text-white font-black text-[10px] flex items-center justify-center animate-bounce shadow">
                {claimableMissionsCount}
              </span>
            )}
            <Target className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Missions</span>
          </button>

          {/* Leaderboard */}
          <button
            onClick={onOpenLeaderboard}
            className="flex flex-col items-center justify-center w-16 h-14 sm:w-20 sm:h-16 rounded-2xl bg-slate-800/60 hover:bg-slate-800 hover:text-yellow-300 text-slate-300 transition active:scale-95 border border-slate-700/40"
          >
            <Trophy className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Ranks</span>
          </button>

          {/* Settings */}
          <button
            onClick={onOpenSettings}
            className="flex flex-col items-center justify-center w-16 h-14 sm:w-20 sm:h-16 rounded-2xl bg-slate-800/60 hover:bg-slate-800 hover:text-slate-100 text-slate-400 transition active:scale-95 border border-slate-700/40"
          >
            <HelpCircle className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Help</span>
          </button>
        </div>
      </div>
    </div>
  );
};
