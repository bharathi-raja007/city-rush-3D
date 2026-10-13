import React, { useEffect, useState } from 'react';
import { X, Trophy, Medal, Crown, Footprints, Coins, RefreshCw } from 'lucide-react';
import { fetchLeaderboard } from '../services/api.ts';
import type { LeaderboardEntry } from '../types/game.ts';
import { useGameStore } from '../store/gameStore.ts';

interface LeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({ isOpen, onClose }) => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const currentUser = useGameStore((s) => s.user);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await fetchLeaderboard();
      setEntries(data);
    } catch (err) {
      console.error('Failed to load leaderboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="w-full max-w-2xl max-h-[90vh] flex flex-col rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl text-left overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
              <Trophy className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h3 className="text-xl font-black text-white uppercase tracking-wider">Global Rankings</h3>
              <p className="text-xs text-slate-400">Top subway runners worldwide</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={loadData}
              disabled={loading}
              className="p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Leaderboard Table / List */}
        <div className="p-5 overflow-y-auto">
          {loading && entries.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-sm font-semibold">
              Loading rankings...
            </div>
          ) : entries.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-sm">
              No runs recorded yet. Start a run to claim the top spot!
            </div>
          ) : (
            <div className="space-y-2.5">
              {entries.map((entry, idx) => {
                const rank = idx + 1;
                const isCurrent = currentUser?.id === entry.userId;

                return (
                  <div
                    key={entry.id || idx}
                    className={`flex items-center justify-between p-3.5 rounded-2xl border transition ${
                      isCurrent
                        ? 'bg-blue-950/40 border-cyan-500/80 shadow-lg shadow-cyan-500/10'
                        : rank === 1
                        ? 'bg-amber-950/20 border-amber-500/40'
                        : rank === 2
                        ? 'bg-slate-800/40 border-slate-600/40'
                        : rank === 3
                        ? 'bg-amber-900/15 border-amber-700/40'
                        : 'bg-slate-800/20 border-slate-800/80'
                    }`}
                  >
                    {/* Rank & User */}
                    <div className="flex items-center space-x-3">
                      <div className="w-7 text-center font-black font-mono">
                        {rank === 1 ? (
                          <Crown className="w-5 h-5 text-amber-400 mx-auto" />
                        ) : rank === 2 ? (
                          <Medal className="w-5 h-5 text-slate-300 mx-auto" />
                        ) : rank === 3 ? (
                          <Medal className="w-5 h-5 text-amber-600 mx-auto" />
                        ) : (
                          <span className="text-slate-500 text-sm">#{rank}</span>
                        )}
                      </div>

                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-white text-sm">{entry.username}</span>
                          {isCurrent && (
                            <span className="px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 text-[9px] font-black uppercase">
                              YOU
                            </span>
                          )}
                        </div>
                        <div className="flex items-center space-x-3 text-[11px] text-slate-400 font-mono mt-0.5">
                          <span className="flex items-center space-x-1">
                            <Footprints className="w-3 h-3 text-cyan-400 inline" />
                            <span>{entry.distance.toLocaleString()}m</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <Coins className="w-3 h-3 text-amber-400 inline" />
                            <span>{entry.coins}</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Score */}
                    <div className="text-right">
                      <span className="text-base sm:text-lg font-black font-mono text-cyan-300">
                        {entry.score.toLocaleString()}
                      </span>
                      <span className="block text-[10px] text-slate-500 uppercase font-semibold">PTS</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
