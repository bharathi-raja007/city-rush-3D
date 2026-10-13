import React, { useState } from 'react';
import { Volume2, VolumeX, Music, Coins, Trophy, User, LogIn, LogOut, Settings as SettingsIcon } from 'lucide-react';
import { useGameStore } from '../store/gameStore.ts';
import { audio } from '../services/audio.ts';
import { auth, googleAuthProvider } from '../lib/firebase.ts';
import { signInWithPopup, signOut } from 'firebase/auth';

interface NavbarProps {
  onOpenSettings: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenSettings }) => {
  const { profile, user, gameState, loadProfile } = useGameStore();
  const [sfxOn, setSfxOn] = useState(true);
  const [musicOn, setMusicOn] = useState(true);
  const [isSigningIn, setIsSigningIn] = useState(false);

  const toggleSfx = () => {
    const next = !sfxOn;
    setSfxOn(next);
    audio.toggleSfx(next);
  };

  const toggleMusic = () => {
    const next = !musicOn;
    setMusicOn(next);
    audio.toggleMusic(next);
  };

  const handleSignIn = async () => {
    try {
      setIsSigningIn(true);
      await signInWithPopup(auth, googleAuthProvider);
      await loadProfile();
    } catch (e: any) {
      console.error('Google Sign-In error:', e);
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      await loadProfile();
    } catch (e) {
      console.error('Sign-Out error:', e);
    }
  };

  if (gameState === 'playing') return null; // Clean viewport during gameplay

  return (
    <header className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between px-4 py-3 sm:px-6 pointer-events-auto">
      {/* Brand Logo */}
      <div className="flex items-center space-x-2">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-cyan-500 to-indigo-600 shadow-lg shadow-cyan-500/30 border border-cyan-400/30">
          <span className="text-xl font-black italic tracking-tighter text-white">CR</span>
        </div>
        <div>
          <h1 className="text-lg font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-500 uppercase drop-shadow-sm">
            City Rush <span className="text-yellow-400">3D</span>
          </h1>
          <p className="text-[10px] text-cyan-200/70 font-semibold uppercase tracking-widest hidden sm:block">
            Endless Subway Adventure
          </p>
        </div>
      </div>

      {/* Stats Badges */}
      <div className="flex items-center space-x-2 sm:space-x-4">
        {/* Coins Pill */}
        <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-slate-900/80 backdrop-blur-md border border-amber-500/30 shadow-md shadow-amber-500/10">
          <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center shadow-inner">
            <Coins className="w-3.5 h-3.5 text-amber-950 stroke-[2.5]" />
          </div>
          <span className="text-sm font-black text-amber-300 tracking-wide font-mono">
            {profile?.totalCoins.toLocaleString() ?? 0}
          </span>
        </div>

        {/* High Score Pill */}
        <div className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-slate-900/80 backdrop-blur-md border border-purple-500/30 shadow-md">
          <Trophy className="w-4 h-4 text-purple-400" />
          <span className="text-xs font-bold text-slate-300">BEST:</span>
          <span className="text-sm font-black text-purple-300 font-mono">
            {profile?.bestScore.toLocaleString() ?? 0}
          </span>
        </div>

        {/* Audio Controls */}
        <div className="flex items-center space-x-1 bg-slate-900/70 backdrop-blur-md p-1 rounded-full border border-slate-700/50">
          <button
            onClick={toggleSfx}
            title={sfxOn ? 'Mute SFX' : 'Enable SFX'}
            className={`p-1.5 rounded-full transition-colors ${
              sfxOn ? 'text-cyan-400 hover:bg-slate-800' : 'text-slate-500 hover:bg-slate-800'
            }`}
          >
            {sfxOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
          <button
            onClick={toggleMusic}
            title={musicOn ? 'Mute Music' : 'Enable Music'}
            className={`p-1.5 rounded-full transition-colors ${
              musicOn ? 'text-pink-400 hover:bg-slate-800' : 'text-slate-500 hover:bg-slate-800'
            }`}
          >
            <Music className="w-4 h-4" />
          </button>
        </div>

        {/* Auth / Profile Button */}
        {auth.currentUser ? (
          <div className="flex items-center space-x-1.5 bg-slate-900/80 border border-cyan-500/40 rounded-full pl-2 pr-1 py-1">
            <span className="text-xs font-semibold text-cyan-200 max-w-[90px] truncate hidden md:inline">
              {auth.currentUser.displayName || auth.currentUser.email?.split('@')[0]}
            </span>
            <button
              onClick={handleSignOut}
              title="Sign Out"
              className="p-1 rounded-full bg-slate-800 text-slate-300 hover:text-red-400 hover:bg-slate-700 transition"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <button
            onClick={handleSignIn}
            disabled={isSigningIn}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold shadow-lg shadow-cyan-600/25 transition active:scale-95 border border-cyan-400/40"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Google Sign In</span>
            <span className="sm:hidden">Login</span>
          </button>
        )}

        {/* Settings button */}
        <button
          onClick={onOpenSettings}
          className="p-2 rounded-full bg-slate-900/80 hover:bg-slate-800 border border-slate-700/60 text-slate-300 hover:text-white transition active:scale-95"
        >
          <SettingsIcon className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
