import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { RotateCcw, Home, Trophy, Coins, Footprints, Flame } from 'lucide-react';
import { useGameStore } from '../store/gameStore.ts';

export const GameOverModal: React.FC = () => {
  const { gameState, lastRunResult, profile, startRun, setGameState } = useGameStore();

  useEffect(() => {
    if (gameState === 'gameover' && lastRunResult?.isNewBest) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  }, [gameState, lastRunResult]);

  if (gameState !== 'gameover' || !lastRunResult) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="w-full max-w-md p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl shadow-blue-950 text-center animate-in fade-in zoom-in duration-200">
        {/* Banner */}
        <div className="inline-block px-4 py-1 rounded-full bg-red-500/20 border border-red-500/40 text-red-400 text-xs font-black uppercase tracking-widest mb-3">
          Run Ended
        </div>

        <h2 className="text-3xl sm:text-4xl font-black text-white uppercase tracking-tight mb-1">
          Game Over
        </h2>

        {lastRunResult.isNewBest && (
          <div className="flex items-center justify-center space-x-1.5 text-amber-400 font-black text-sm my-2 animate-bounce">
            <Trophy className="w-5 h-5 fill-current" />
            <span>NEW ALL-TIME RECORD!</span>
          </div>
        )}

        {/* Primary Score Presentation */}
        <div className="my-5 p-4 rounded-2xl bg-gradient-to-b from-slate-800/80 to-slate-800/40 border border-slate-700/60">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Final Score</span>
          <div className="text-4xl sm:text-5xl font-black font-mono tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-400 my-1">
            {lastRunResult.score.toLocaleString()}
          </div>
          <div className="text-xs text-slate-400 font-medium">
            Best Record: <span className="text-purple-300 font-bold font-mono">{profile?.bestScore.toLocaleString() ?? 0}</span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="p-3.5 rounded-2xl bg-slate-800/50 border border-slate-700/50 flex flex-col items-center">
            <div className="flex items-center space-x-1.5 text-cyan-400 text-xs font-bold uppercase mb-1">
              <Footprints className="w-4 h-4" />
              <span>Distance</span>
            </div>
            <span className="text-xl font-black text-white font-mono">
              {lastRunResult.distance.toLocaleString()} m
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-800/50 border border-slate-700/50 flex flex-col items-center">
            <div className="flex items-center space-x-1.5 text-amber-400 text-xs font-bold uppercase mb-1">
              <Coins className="w-4 h-4" />
              <span>Coins Won</span>
            </div>
            <span className="text-xl font-black text-amber-300 font-mono">
              +{lastRunResult.coinsCollected}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={startRun}
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-500 hover:from-blue-500 hover:to-teal-400 text-white font-black text-lg shadow-xl shadow-cyan-500/25 flex items-center justify-center space-x-2 transition active:scale-95"
          >
            <RotateCcw className="w-5 h-5 stroke-[2.5]" />
            <span>PLAY AGAIN</span>
          </button>

          <button
            onClick={() => setGameState('menu')}
            className="w-full py-3 px-6 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold text-sm flex items-center justify-center space-x-2 transition active:scale-95 border border-slate-700"
          >
            <Home className="w-4 h-4" />
            <span>MAIN MENU</span>
          </button>
        </div>
      </div>
    </div>
  );
};
