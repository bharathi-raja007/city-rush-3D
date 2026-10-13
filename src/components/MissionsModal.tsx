import React, { useState } from 'react';
import { X, Target, CheckCircle2, Gift, Sparkles, Coins } from 'lucide-react';
import { useGameStore } from '../store/gameStore.ts';
import { claimMissionApi } from '../services/api.ts';
import { audio } from '../services/audio.ts';
import confetti from 'canvas-confetti';

interface MissionsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MissionsModal: React.FC<MissionsModalProps> = ({ isOpen, onClose }) => {
  const { missions, loadProfile } = useGameStore();
  const [claimingCode, setClaimingCode] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'daily' | 'weekly'>('daily');

  if (!isOpen) return null;

  const filteredMissions = missions.filter((m) => m.type === activeTab);

  const handleClaim = async (code: string) => {
    try {
      setClaimingCode(code);
      await claimMissionApi(code);
      await loadProfile();
      audio.playPowerup();
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
      });
    } catch (err: any) {
      console.error('Claim error:', err);
    } finally {
      setClaimingCode(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="w-full max-w-2xl max-h-[90vh] flex flex-col rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl text-left overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800">
          <div>
            <h3 className="text-xl font-black text-white uppercase tracking-wider flex items-center space-x-2">
              <Target className="w-5 h-5 text-purple-400" />
              <span>Missions & Rewards</span>
            </h3>
            <p className="text-xs text-slate-400">Complete challenges to earn bonus coins</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Filters */}
        <div className="flex px-5 pt-3 space-x-2 border-b border-slate-800">
          <button
            onClick={() => setActiveTab('daily')}
            className={`pb-2.5 px-3 text-xs font-bold uppercase tracking-wider border-b-2 transition ${
              activeTab === 'daily'
                ? 'border-purple-500 text-purple-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            Daily Missions
          </button>
          <button
            onClick={() => setActiveTab('weekly')}
            className={`pb-2.5 px-3 text-xs font-bold uppercase tracking-wider border-b-2 transition ${
              activeTab === 'weekly'
                ? 'border-cyan-500 text-cyan-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            Weekly Challenges
          </button>
        </div>

        {/* Mission Cards */}
        <div className="p-5 overflow-y-auto space-y-3">
          {filteredMissions.map((m) => {
            const progressPct = Math.min(100, Math.round((m.currentProgress / m.targetValue) * 100));
            const isCompleted = m.completed || m.currentProgress >= m.targetValue;
            const isClaimed = m.claimed;
            const isClaiming = claimingCode === m.code;

            return (
              <div
                key={m.code}
                className={`p-4 rounded-2xl border transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  isClaimed
                    ? 'bg-slate-900/40 border-slate-800 opacity-60'
                    : isCompleted
                    ? 'bg-purple-950/30 border-purple-500/50 shadow-md shadow-purple-500/10'
                    : 'bg-slate-800/40 border-slate-800'
                }`}
              >
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <h4 className="font-bold text-white text-sm">{m.title}</h4>
                    <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-black flex items-center space-x-1">
                      <Coins className="w-3 h-3 text-amber-400 inline" />
                      <span>+{m.rewardCoins}</span>
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mb-2.5">{m.description}</p>

                  {/* Progress Bar */}
                  <div className="flex items-center space-x-3">
                    <div className="flex-1 h-2 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-purple-500 to-cyan-400 transition-all duration-300 rounded-full"
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>
                    <span className="text-[11px] font-mono font-bold text-slate-300 whitespace-nowrap">
                      {m.currentProgress.toLocaleString()} / {m.targetValue.toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="sm:w-36 flex justify-end">
                  {isClaimed ? (
                    <div className="flex items-center space-x-1 text-xs font-semibold text-slate-400">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      <span>Claimed</span>
                    </div>
                  ) : isCompleted ? (
                    <button
                      onClick={() => handleClaim(m.code)}
                      disabled={isClaiming}
                      className="w-full sm:w-auto py-2 px-4 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 hover:from-purple-500 hover:to-amber-400 text-white font-black text-xs flex items-center justify-center space-x-1.5 shadow-lg shadow-purple-500/25 transition active:scale-95 animate-pulse"
                    >
                      <Gift className="w-3.5 h-3.5" />
                      <span>Claim Reward</span>
                    </button>
                  ) : (
                    <span className="text-xs font-semibold text-slate-500">In Progress</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
