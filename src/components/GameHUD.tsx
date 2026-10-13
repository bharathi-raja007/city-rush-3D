import React from 'react';
import { Pause, Coins, Flame, Magnet, Rocket, Zap, Shield, ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';
import { useGameStore } from '../store/gameStore.ts';

export const GameHUD: React.FC = () => {
  const { score, distance, coinsCollected, powerUps, pauseRun } = useGameStore();

  const isMagnet = powerUps.magnet > 0;
  const isJetpack = powerUps.jetpack > 0;
  const isMultiplier = powerUps.multiplier > 0;
  const isHoverboard = powerUps.hoverboard > 0;

  return (
    <div className="absolute inset-0 pointer-events-none z-20 flex flex-col justify-between p-4 sm:p-6 select-none">
      {/* Top HUD Row */}
      <div className="flex items-start justify-between">
        {/* Left Stats: Score & Multiplier */}
        <div className="flex flex-col space-y-1">
          <div className="flex items-center space-x-2">
            <span className="text-3xl sm:text-4xl font-black font-mono tracking-tighter text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
              {score.toLocaleString()}
            </span>
            <div className={`px-2 py-0.5 rounded-md font-black text-xs font-mono uppercase tracking-wider ${
              isMultiplier 
                ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white animate-pulse shadow-lg shadow-purple-500/50' 
                : 'bg-slate-900/80 text-cyan-300 border border-cyan-500/30'
            }`}>
              {isMultiplier ? '2X BOOST' : '1X'}
            </div>
          </div>

          {/* Distance Meter */}
          <div className="flex items-center space-x-1 text-slate-300 text-xs sm:text-sm font-bold font-mono">
            <span className="text-cyan-400">DIST:</span>
            <span>{distance.toLocaleString()} m</span>
          </div>
        </div>

        {/* Center: Active Power-Ups Timers */}
        <div className="flex items-center space-x-2">
          {isMagnet && (
            <div className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-red-950/80 border border-red-500/50 text-red-200 text-xs font-black shadow-lg shadow-red-500/20 animate-pulse">
              <Magnet className="w-4 h-4 text-red-400" />
              <span>{Math.ceil(powerUps.magnet)}s</span>
            </div>
          )}

          {isJetpack && (
            <div className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/50 text-cyan-200 text-xs font-black shadow-lg shadow-cyan-500/20 animate-pulse">
              <Rocket className="w-4 h-4 text-cyan-400" />
              <span>{Math.ceil(powerUps.jetpack)}s</span>
            </div>
          )}

          {isHoverboard && (
            <div className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/50 text-emerald-200 text-xs font-black shadow-lg shadow-emerald-500/20">
              <Shield className="w-4 h-4 text-emerald-400 animate-spin" style={{ animationDuration: '4s' }} />
              <span>SHIELDED</span>
            </div>
          )}
        </div>

        {/* Right Stats: Coins & Pause Button */}
        <div className="flex items-center space-x-3 pointer-events-auto">
          {/* Run Coins Counter */}
          <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-slate-900/85 backdrop-blur-md border border-amber-500/40 shadow-lg">
            <div className="w-4 h-4 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center">
              <Coins className="w-3 h-3 text-amber-950 stroke-[3]" />
            </div>
            <span className="text-base font-black text-amber-300 font-mono">
              {coinsCollected}
            </span>
          </div>

          {/* Pause Button */}
          <button
            onClick={pauseRun}
            className="p-2.5 rounded-full bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 text-white shadow-lg active:scale-95 transition"
          >
            <Pause className="w-5 h-5 fill-current" />
          </button>
        </div>
      </div>

      {/* Bottom Hint / Controls Assist */}
      <div className="flex items-end justify-between">
        {/* Hoverboard Activate Indicator */}
        <div className="pointer-events-auto">
          {!isHoverboard && (
            <button
              onClick={() => useGameStore.getState().activatePowerUp('hoverboard', 25)}
              className="px-3 py-1.5 rounded-xl bg-slate-900/80 backdrop-blur-md border border-cyan-500/30 text-[11px] font-bold text-cyan-300 flex items-center space-x-1.5 hover:bg-slate-800/80 active:scale-95 transition"
            >
              <Zap className="w-3.5 h-3.5 text-yellow-400" />
              <span>Space / Tap: Hoverboard</span>
            </button>
          )}
        </div>

        {/* On-Screen Mobile Action Buttons for Accessibility */}
        <div className="sm:hidden flex items-center space-x-2 pointer-events-auto">
          <div className="text-[10px] text-slate-400 font-semibold bg-slate-900/60 px-2 py-1 rounded-md backdrop-blur-sm">
            Swipe or use arrow keys
          </div>
        </div>
      </div>
    </div>
  );
};
