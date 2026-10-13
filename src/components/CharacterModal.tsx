import React, { useState } from 'react';
import { X, Check, Lock, Zap, Shield, Sparkles } from 'lucide-react';
import { useGameStore } from '../store/gameStore.ts';
import { buyCharacterApi, updatePlayerSettings } from '../services/api.ts';
import { audio } from '../services/audio.ts';

interface CharacterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CharacterModal: React.FC<CharacterModalProps> = ({ isOpen, onClose }) => {
  const { characters, unlockedCharacters, profile, loadProfile } = useGameStore();
  const [loadingCode, setLoadingCode] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentEquippedCode = profile?.currentCharacterId || 'runner-dash';
  const totalCoins = profile?.totalCoins || 0;

  const handleSelect = async (code: string) => {
    try {
      setLoadingCode(code);
      setErrorMsg(null);
      await updatePlayerSettings({ characterCode: code });
      await loadProfile();
      audio.playClick();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to select character');
    } finally {
      setLoadingCode(null);
    }
  };

  const handleUnlock = async (code: string, price: number) => {
    if (totalCoins < price) {
      setErrorMsg(`Not enough coins! Need ${price.toLocaleString()}, you have ${totalCoins.toLocaleString()}`);
      return;
    }
    try {
      setLoadingCode(code);
      setErrorMsg(null);
      await buyCharacterApi(code);
      await loadProfile();
      audio.playPowerup();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to unlock character');
    } finally {
      setLoadingCode(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="w-full max-w-2xl max-h-[90vh] flex flex-col rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl text-left overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800">
          <div>
            <h3 className="text-xl font-black text-white uppercase tracking-wider flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-cyan-400" />
              <span>Runner Roster</span>
            </h3>
            <p className="text-xs text-slate-400">Unlock and customize your 3D runners</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="mx-5 mt-3 p-3 rounded-xl bg-red-950/60 border border-red-500/40 text-red-200 text-xs font-semibold">
            {errorMsg}
          </div>
        )}

        {/* Character List */}
        <div className="p-5 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-4">
          {characters.map((char) => {
            const isUnlocked = unlockedCharacters.includes(char.code);
            const isEquipped = currentEquippedCode === char.code;
            const isLoading = loadingCode === char.code;

            return (
              <div
                key={char.code}
                className={`p-4 rounded-2xl border transition relative flex flex-col justify-between ${
                  isEquipped
                    ? 'bg-blue-950/40 border-cyan-500 shadow-lg shadow-cyan-500/10'
                    : 'bg-slate-850 bg-slate-800/40 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <div
                        className="w-4 h-4 rounded-full shadow"
                        style={{ backgroundColor: char.colorTheme }}
                      />
                      <h4 className="font-bold text-white text-base">{char.name}</h4>
                    </div>

                    {isEquipped && (
                      <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-[10px] font-black uppercase">
                        Equipped
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-400 mb-3 line-clamp-2">{char.description}</p>

                  <div className="flex items-center space-x-2 text-xs font-semibold text-slate-300 mb-4">
                    <Zap className="w-3.5 h-3.5 text-yellow-400" />
                    <span>Speed bonus: {char.speedMultiplier}%</span>
                  </div>
                </div>

                <div>
                  {isUnlocked ? (
                    <button
                      onClick={() => handleSelect(char.code)}
                      disabled={isEquipped || isLoading}
                      className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center space-x-1.5 transition active:scale-95 ${
                        isEquipped
                          ? 'bg-slate-800 text-slate-400 cursor-default'
                          : 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-md'
                      }`}
                    >
                      {isEquipped ? (
                        <>
                          <Check className="w-4 h-4" />
                          <span>Active Runner</span>
                        </>
                      ) : (
                        <span>Equip Runner</span>
                      )}
                    </button>
                  ) : (
                    <button
                      onClick={() => handleUnlock(char.code, char.price)}
                      disabled={isLoading}
                      className="w-full py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center space-x-1.5 bg-gradient-to-r from-amber-600 to-yellow-500 hover:from-amber-500 hover:to-yellow-400 text-slate-950 transition active:scale-95 shadow-md shadow-amber-500/20"
                    >
                      <Lock className="w-3.5 h-3.5" />
                      <span>Unlock ({char.price.toLocaleString()} Coins)</span>
                    </button>
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
