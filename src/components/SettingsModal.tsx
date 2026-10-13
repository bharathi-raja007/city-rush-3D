import React, { useState } from 'react';
import { X, Volume2, Music, Keyboard, Smartphone, HelpCircle } from 'lucide-react';
import { audio } from '../services/audio.ts';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const [sfx, setSfx] = useState(audio.sfxEnabled);
  const [music, setMusic] = useState(audio.musicEnabled);

  if (!isOpen) return null;

  const handleToggleSfx = () => {
    const next = !sfx;
    setSfx(next);
    audio.toggleSfx(next);
  };

  const handleToggleMusic = () => {
    const next = !music;
    setMusic(next);
    audio.toggleMusic(next);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl text-left overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <HelpCircle className="w-5 h-5 text-cyan-400" />
            <h3 className="text-xl font-black text-white uppercase tracking-wider">Settings & Controls</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-6">
          {/* Audio Toggles */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Audio Options</h4>
            <div className="space-y-2.5">
              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-800/40 border border-slate-800">
                <div className="flex items-center space-x-3">
                  <Volume2 className="w-5 h-5 text-cyan-400" />
                  <span className="text-sm font-semibold text-white">Sound Effects</span>
                </div>
                <button
                  onClick={handleToggleSfx}
                  className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors duration-200 ${
                    sfx ? 'bg-cyan-500 justify-end' : 'bg-slate-700 justify-start'
                  }`}
                >
                  <div className="w-4 h-4 rounded-full bg-white shadow-md" />
                </button>
              </div>

              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-800/40 border border-slate-800">
                <div className="flex items-center space-x-3">
                  <Music className="w-5 h-5 text-pink-400" />
                  <span className="text-sm font-semibold text-white">Arcade Music</span>
                </div>
                <button
                  onClick={handleToggleMusic}
                  className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors duration-200 ${
                    music ? 'bg-pink-500 justify-end' : 'bg-slate-700 justify-start'
                  }`}
                >
                  <div className="w-4 h-4 rounded-full bg-white shadow-md" />
                </button>
              </div>
            </div>
          </div>

          {/* Controls Guide */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">How to Play</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-slate-800/40 border border-slate-800">
                <div className="flex items-center space-x-1.5 font-bold text-cyan-300 mb-2">
                  <Keyboard className="w-4 h-4" />
                  <span>Desktop Keys</span>
                </div>
                <ul className="space-y-1 text-slate-300">
                  <li><span className="font-mono text-cyan-400 font-bold">← / A</span> or <span className="font-mono text-cyan-400 font-bold">→ / D</span>: Change Lane</li>
                  <li><span className="font-mono text-cyan-400 font-bold">↑ / W</span>: Jump Barrier</li>
                  <li><span className="font-mono text-cyan-400 font-bold">↓ / S</span>: Slide Under</li>
                  <li><span className="font-mono text-cyan-400 font-bold">Space</span>: Hoverboard Shield</li>
                  <li><span className="font-mono text-cyan-400 font-bold">P / Esc</span>: Pause Game</li>
                </ul>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-800/40 border border-slate-800">
                <div className="flex items-center space-x-1.5 font-bold text-pink-300 mb-2">
                  <Smartphone className="w-4 h-4" />
                  <span>Mobile Gestures</span>
                </div>
                <ul className="space-y-1 text-slate-300">
                  <li><span className="font-bold text-pink-400">Swipe Left/Right</span>: Switch Lane</li>
                  <li><span className="font-bold text-pink-400">Swipe Up</span>: Jump</li>
                  <li><span className="font-bold text-pink-400">Swipe Down</span>: Slide Duck</li>
                  <li><span className="font-bold text-pink-400">Double Tap</span>: Activate Hoverboard</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
