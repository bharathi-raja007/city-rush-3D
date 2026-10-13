import React from 'react';
import { Play, RotateCcw, Home } from 'lucide-react';
import { useGameStore } from '../store/gameStore.ts';

export const PauseModal: React.FC = () => {
  const { gameState, resumeRun, startRun, setGameState } = useGameStore();

  if (gameState !== 'paused') return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md">
      <div className="w-full max-w-sm p-6 rounded-3xl bg-slate-900 border border-cyan-500/30 shadow-2xl shadow-cyan-950 text-center animate-in fade-in zoom-in duration-200">
        <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400 uppercase tracking-widest mb-6">
          Game Paused
        </h2>

        <div className="space-y-3">
          <button
            onClick={resumeRun}
            className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-500 hover:from-blue-500 hover:to-teal-400 text-white font-black text-base shadow-lg shadow-cyan-500/25 flex items-center justify-center space-x-2 transition active:scale-95"
          >
            <Play className="w-5 h-5 fill-current" />
            <span>Resume Run</span>
          </button>

          <button
            onClick={startRun}
            className="w-full py-3 px-6 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold text-sm flex items-center justify-center space-x-2 transition active:scale-95"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Restart</span>
          </button>

          <button
            onClick={() => setGameState('menu')}
            className="w-full py-3 px-6 rounded-2xl bg-slate-800/60 hover:bg-slate-700/60 text-slate-400 hover:text-white font-semibold text-sm flex items-center justify-center space-x-2 transition active:scale-95"
          >
            <Home className="w-4 h-4" />
            <span>Main Menu</span>
          </button>
        </div>
      </div>
    </div>
  );
};
