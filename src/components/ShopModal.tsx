import React, { useState } from 'react';
import { X, ShoppingBag, Zap, Rocket, Star, Shield, Magnet, Check, Coins } from 'lucide-react';
import { useGameStore } from '../store/gameStore.ts';
import { buyItemApi, updatePlayerSettings } from '../services/api.ts';
import { audio } from '../services/audio.ts';

interface ShopModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShopModal: React.FC<ShopModalProps> = ({ isOpen, onClose }) => {
  const { items, profile, loadProfile } = useGameStore();
  const [activeTab, setActiveTab] = useState<'hoverboard' | 'powerup'>('hoverboard');
  const [purchasingCode, setPurchasingCode] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ text: string; error?: boolean } | null>(null);

  if (!isOpen) return null;

  const totalCoins = profile?.totalCoins || 0;
  const currentBoardId = profile?.currentBoardId || 'none';

  const filteredItems = items.filter((item) =>
    activeTab === 'hoverboard' ? item.category === 'hoverboard' : item.category === 'powerup'
  );

  const handleBuy = async (code: string, price: number) => {
    if (totalCoins < price) {
      setMsg({ text: `Not enough coins! Need ${price.toLocaleString()}`, error: true });
      return;
    }
    try {
      setPurchasingCode(code);
      setMsg(null);
      await buyItemApi(code);
      await loadProfile();
      audio.playPowerup();
      setMsg({ text: 'Purchase successful!' });
    } catch (err: any) {
      setMsg({ text: err.message || 'Purchase failed', error: true });
    } finally {
      setPurchasingCode(null);
    }
  };

  const handleEquipBoard = async (code: string) => {
    try {
      setPurchasingCode(code);
      setMsg(null);
      await updatePlayerSettings({ boardCode: code });
      await loadProfile();
      audio.playClick();
      setMsg({ text: 'Hoverboard equipped!' });
    } catch (err: any) {
      setMsg({ text: err.message || 'Failed to equip board', error: true });
    } finally {
      setPurchasingCode(null);
    }
  };

  const renderIcon = (iconName: string) => {
    switch (iconName) {
      case 'Flame':
      case 'Zap':
        return <Zap className="w-6 h-6 text-emerald-400" />;
      case 'Rocket':
        return <Rocket className="w-6 h-6 text-cyan-400" />;
      case 'Star':
        return <Star className="w-6 h-6 text-purple-400" />;
      case 'Magnet':
        return <Magnet className="w-6 h-6 text-red-400" />;
      default:
        return <Shield className="w-6 h-6 text-blue-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="w-full max-w-2xl max-h-[90vh] flex flex-col rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl text-left overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800">
          <div>
            <h3 className="text-xl font-black text-white uppercase tracking-wider flex items-center space-x-2">
              <ShoppingBag className="w-5 h-5 text-amber-400" />
              <span>Gear Shop</span>
            </h3>
            <p className="text-xs text-slate-400">Upgrade boards and in-game power enhancements</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Category Tabs */}
        <div className="flex px-5 pt-3 space-x-2 border-b border-slate-800">
          <button
            onClick={() => setActiveTab('hoverboard')}
            className={`pb-2.5 px-3 text-xs font-bold uppercase tracking-wider border-b-2 transition ${
              activeTab === 'hoverboard'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            Hoverboards (Shields)
          </button>
          <button
            onClick={() => setActiveTab('powerup')}
            className={`pb-2.5 px-3 text-xs font-bold uppercase tracking-wider border-b-2 transition ${
              activeTab === 'powerup'
                ? 'border-cyan-500 text-cyan-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            Power-Up Boosters
          </button>
        </div>

        {msg && (
          <div
            className={`mx-5 mt-3 p-3 rounded-xl text-xs font-semibold ${
              msg.error
                ? 'bg-red-950/60 border border-red-500/40 text-red-200'
                : 'bg-emerald-950/60 border border-emerald-500/40 text-emerald-200'
            }`}
          >
            {msg.text}
          </div>
        )}

        {/* Item Grid */}
        <div className="p-5 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filteredItems.map((item) => {
            const isEquipped = currentBoardId === item.code;
            const isLoading = purchasingCode === item.code;

            return (
              <div
                key={item.code}
                className="p-4 rounded-2xl bg-slate-800/40 border border-slate-800 hover:border-slate-700 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center border border-slate-700">
                      {renderIcon(item.icon)}
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-sm">{item.name}</h4>
                      <span className="text-[11px] text-amber-300 font-mono font-bold flex items-center space-x-1">
                        <Coins className="w-3 h-3 inline text-amber-400" />
                        <span>{item.price.toLocaleString()} Coins</span>
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-400 mb-4">{item.description}</p>
                </div>

                <div className="flex space-x-2">
                  {item.category === 'hoverboard' && isEquipped ? (
                    <button
                      disabled
                      className="w-full py-2.5 px-3 rounded-xl bg-slate-800 text-slate-400 font-bold text-xs flex items-center justify-center space-x-1"
                    >
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span>Equipped Board</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleBuy(item.code, item.price)}
                      disabled={isLoading}
                      className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-600 to-yellow-500 hover:from-amber-500 hover:to-yellow-400 text-slate-950 font-black text-xs flex items-center justify-center space-x-1.5 transition active:scale-95 shadow-md shadow-amber-500/10"
                    >
                      <span>Buy ({item.price.toLocaleString()})</span>
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
