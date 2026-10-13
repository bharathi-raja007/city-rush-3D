import React, { useEffect, useState } from 'react';
import { GameCanvas } from './game/GameCanvas.tsx';
import { Navbar } from './components/Navbar.tsx';
import { GameHUD } from './components/GameHUD.tsx';
import { HomeScreen } from './components/HomeScreen.tsx';
import { PauseModal } from './components/PauseModal.tsx';
import { GameOverModal } from './components/GameOverModal.tsx';
import { CharacterModal } from './components/CharacterModal.tsx';
import { ShopModal } from './components/ShopModal.tsx';
import { MissionsModal } from './components/MissionsModal.tsx';
import { LeaderboardModal } from './components/LeaderboardModal.tsx';
import { SettingsModal } from './components/SettingsModal.tsx';
import { useGameStore } from './store/gameStore.ts';

export default function App() {
  const { gameState, loadProfile } = useGameStore();

  const [isCharactersOpen, setIsCharactersOpen] = useState(false);
  const [isShopOpen, setIsShopOpen] = useState(false);
  const [isMissionsOpen, setIsMissionsOpen] = useState(false);
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 font-sans text-slate-100 select-none">
      {/* 3D Game Canvas Engine */}
      <GameCanvas />

      {/* Top Navigation & Profile Bar */}
      <Navbar onOpenSettings={() => setIsSettingsOpen(true)} />

      {/* Real-time In-Game HUD (visible while running) */}
      {gameState === 'playing' && <GameHUD />}

      {/* Main Home Menu Screen */}
      <HomeScreen
        onOpenCharacters={() => setIsCharactersOpen(true)}
        onOpenShop={() => setIsShopOpen(true)}
        onOpenMissions={() => setIsMissionsOpen(true)}
        onOpenLeaderboard={() => setIsLeaderboardOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Modals & Overlays */}
      <PauseModal />
      <GameOverModal />

      <CharacterModal
        isOpen={isCharactersOpen}
        onClose={() => setIsCharactersOpen(false)}
      />

      <ShopModal
        isOpen={isShopOpen}
        onClose={() => setIsShopOpen(false)}
      />

      <MissionsModal
        isOpen={isMissionsOpen}
        onClose={() => setIsMissionsOpen(false)}
      />

      <LeaderboardModal
        isOpen={isLeaderboardOpen}
        onClose={() => setIsLeaderboardOpen(false)}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
}
