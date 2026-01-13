import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ChevronLeft, 
  ShoppingBag, 
  Layout, 
  Circle, 
  Tv, 
  Check, 
  Lock,
  Star,
  Package
} from "lucide-react";
import { soundManager } from "../core/audio/SoundManager";
import { Button } from "../shared/components/Button";
import { Card } from "../shared/components/Card";
import { useShopStore, PUCK_SKINS, BOARD_THEMES } from "../features/shop/store/shopStore";
import { useGameStore } from "../features/game/store/gameStore";

export default function ShopPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("pucks");
  const [isWatchingAd, setIsWatchingAd] = useState(false);
  const [adTarget, setAdTarget] = useState(null);

  const { 
    purchasedSkins, 
    purchasedThemes, 
    currentSkin, 
    currentTheme,
    equipSkin,
    equipTheme,
    unlockWithAd,
    isPro
  } = useShopStore();

  const { playerLevel, playerXP, getXPRequired, getPlayerTitle, getPlayerTitleColor } = useGameStore();

  const xpRequired = getXPRequired ? getXPRequired() : 100;
  const xpProgress = (playerXP / xpRequired) * 100;
  const playerTitle = getPlayerTitle ? getPlayerTitle() : "Rookie";
  const playerTitleColor = getPlayerTitleColor ? getPlayerTitleColor() : "text-gray-400";

  const handleWatchAd = async (itemId, type) => {
    setIsWatchingAd(true);
    setAdTarget(itemId);
    const success = await unlockWithAd(itemId, type);
    if (success) {
      soundManager.playGoal();
    }
    setIsWatchingAd(false);
    setAdTarget(null);
  };

  const renderItem = (item, type) => {
    const isOwned = type === "puck" 
      ? purchasedSkins.includes(item.id) 
      : purchasedThemes.includes(item.id);
    
    const isEquipped = type === "puck" 
      ? currentSkin === item.id 
      : currentTheme === item.id;

    const isLevelLocked = playerLevel < (item.requiredLevel || 1);

    const handleEquip = (itemId, type) => {
      soundManager.playEquip();
      if (type === "puck") equipSkin(itemId);
      else equipTheme(itemId);
    };

    return (
      <Card key={item.id} className={`relative overflow-hidden group transition-all duration-300 hover:shadow-2xl ${isEquipped ? 'ring-2 ring-blue-500 bg-blue-500/5' : 'hover:bg-gray-800/50'} ${isLevelLocked && !isOwned ? 'opacity-80' : ''}`}>
        <div className="p-4 flex flex-col h-full">
          {/* Preview Area */}
          <div 
            className="h-40 rounded-xl mb-4 flex items-center justify-center border border-gray-700/50 shadow-inner group-hover:scale-105 transition-transform overflow-hidden relative"
            style={{ 
              backgroundColor: type === "board" ? item.backgroundColor : "#020617",
              borderColor: type === "board" ? item.dividerColor : "rgba(55, 65, 81, 0.5)"
            }}
          >
            {isLevelLocked && !isOwned && (
              <div className="absolute inset-0 bg-gray-950/80 z-20 flex flex-col items-center justify-center backdrop-blur-[2px]">
                <Lock className="w-8 h-8 text-gray-500 mb-2" />
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Unlocks at Lvl {item.requiredLevel}</p>
              </div>
            )}

            {type === "puck" ? (
              <div className="relative flex items-center justify-center">
                <div 
                  className="absolute inset-0 blur-2xl opacity-20 rounded-full scale-150"
                  style={{ backgroundColor: item.color }}
                />
                
                {["basketball", "football", "volleyball"].includes(item.id) ? (
                   <div className="text-7xl relative z-10 drop-shadow-2xl filter saturate-125">
                     {item.id === "basketball" && "🏀"}
                     {item.id === "football" && "🏈"}
                     {item.id === "volleyball" && "🏐"}
                   </div>
                ) : (
                  <div 
                    className="w-24 h-24 rounded-full shadow-2xl relative flex items-center justify-center border-2 border-white/10 overflow-hidden z-10"
                    style={{ 
                     background: `radial-gradient(circle at 30% 30%, ${item.color}, #000)`,
                     boxShadow: `inset -8px -8px 16px rgba(0,0,0,0.6), 0 15px 30px rgba(0,0,0,0.4)`
                    }}
                  >
                    <div className="absolute top-4 left-4 w-8 h-8 bg-white/40 rounded-full blur-[2px]" />
                    {item.id === "gold" && <div className="text-3xl">✨</div>}
                  </div>
                )
                }
              </div>
            ) : (
              <div className="w-full h-full flex flex-col p-4 relative">
                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: `radial-gradient(${item.dividerColor} 1px, transparent 1px)`, backgroundSize: '10px 10px' }} />
                <div className="h-1.5 w-full rounded-full shadow-lg z-10" style={{ backgroundColor: item.dividerColor }} />
                <div className="flex-1" />
                <div className="h-1.5 w-full rounded-full shadow-lg z-10" style={{ backgroundColor: item.dividerColor }} />
              </div>
            )}
          </div>

          <div className="flex-1">
            <h4 className="font-bold text-white text-lg flex items-center gap-2">
              {item.name}
              {isOwned && <div className="p-0.5 bg-green-500 rounded-full"><Check className="w-3 h-3 text-white" /></div>}
            </h4>
            <p className="text-gray-500 text-xs mb-4 line-clamp-2 italic font-medium">"{item.description}"</p>
          </div>

          <div className="mt-auto pt-4">
            {isOwned ? (
              <Button 
                variant={isEquipped ? "secondary" : "primary"}
                className="w-full font-bold"
                size="sm"
                onClick={() => handleEquip(item.id, type)}
                disabled={isEquipped}
              >
                {isEquipped ? "Equipped" : "Equip"}
              </Button>
            ) : (
              <Button 
                variant={isLevelLocked ? "secondary" : "primary"}
                className="w-full flex items-center justify-center gap-2 relative overflow-hidden group font-bold"
                size="sm"
                onClick={() => !isLevelLocked && handleWatchAd(item.id, type)}
                disabled={isWatchingAd || isLevelLocked}
              >
                {isWatchingAd && adTarget === item.id ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Watching...</span>
                  </div>
                ) : isLevelLocked ? (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>Level {item.requiredLevel} Required</span>
                  </>
                ) : (
                  <>
                    <Tv className="w-4 h-4" />
                    <span>Unlock (Ad)</span>
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 pb-12">
      <header className="bg-gray-900 border-b border-gray-800 sticky top-0 z-50 backdrop-blur-xl">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between gap-8">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate("/")} className="p-2 hover:bg-gray-800 rounded-xl transition-colors text-gray-400">
              <ChevronLeft className="w-6 h-6" />
            </button>
            <h1 className="text-xl font-black flex items-center gap-3 tracking-tighter">
              <ShoppingBag className="w-6 h-6 text-blue-500" />
              ARENA SHOP
            </h1>
          </div>
          
          <div className="flex-1 max-w-sm hidden md:block">
            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-1 shadow-sm">
              <span className={playerTitleColor}>{playerTitle} · Lvl {playerLevel}</span>
              <span className="text-gray-500">{Math.floor(playerXP)} / {xpRequired} XP</span>
            </div>
            <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden border border-white/5">
              <div className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 transition-all duration-500" style={{ width: `${xpProgress}%` }} />
            </div>
          </div>

          <div className="flex items-center gap-3">
             {isPro && <div className="px-3 py-1 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full text-[10px] font-black text-gray-950 uppercase tracking-widest">PRO</div>}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-12">
          <div className="flex gap-1.5 bg-gray-900 p-1.5 rounded-2xl border border-gray-800">
            <TabBtn active={activeTab === "pucks"} onClick={() => setActiveTab("pucks")} icon={<Circle className="w-4 h-4" />} label="Pucks" />
            <TabBtn active={activeTab === "boards"} onClick={() => setActiveTab("boards")} icon={<Layout className="w-4 h-4" />} label="Boards" />
            <TabBtn active={activeTab === "inventory"} onClick={() => setActiveTab("inventory")} icon={<Package className="w-4 h-4" />} label="My Collection" color="purple" />
          </div>

          <div className="flex items-center gap-4 px-6 py-3 bg-blue-500/5 border border-blue-500/20 rounded-2xl">
             <Star className="w-5 h-5 text-yellow-400" />
             <p className="text-xs font-bold text-blue-300">Level up to unlock high-tier items</p>
          </div>
        </div>

        {activeTab === "pucks" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Object.values(PUCK_SKINS).map(puck => renderItem(puck, "puck"))}
          </div>
        )}

        {activeTab === "boards" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Object.values(BOARD_THEMES).map(theme => renderItem(theme, "board"))}
          </div>
        )}

        {activeTab === "inventory" && (
          <div className="animate-fade-in space-y-12">
            <InventorySection title="Puck Collection" items={purchasedSkins.map(id => PUCK_SKINS[id])} type="puck" renderItem={renderItem} />
            <InventorySection title="Board Styles" items={purchasedThemes.map(id => BOARD_THEMES[id])} type="board" renderItem={renderItem} />
          </div>
        )}
      </main>

      {isWatchingAd && (
        <div className="fixed inset-0 z-[100] bg-gray-950 flex items-center justify-center p-8 backdrop-blur-3xl">
          <div className="max-w-md w-full text-center">
             <div className="w-24 h-24 bg-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-8 animate-pulse shadow-[0_0_80px_rgba(37,99,235,0.4)] rotate-3">
               <Tv className="w-12 h-12 text-white" />
             </div>
             <h2 className="text-4xl font-black mb-4 tracking-tighter italic">SPONSORED UNLOCK</h2>
             <p className="text-gray-500 font-bold mb-10 uppercase tracking-widest text-xs">Unlocking exclusive gear...</p>
             <div className="w-full h-3 bg-gray-900 rounded-full overflow-hidden border border-white/5 p-0.5">
                <div className="h-full bg-gradient-to-r from-blue-600 to-cyan-400 animate-progress origin-left rounded-full" />
             </div>
          </div>
        </div>
      )}
    </div>
  );
}

function TabBtn({ active, onClick, icon, label, color = "blue" }) {
  const activeStyles = {
    blue: "bg-blue-600 text-white shadow-lg shadow-blue-600/20",
    purple: "bg-purple-600 text-white shadow-lg shadow-purple-600/20"
  };

  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${
        active ? activeStyles[color] : "text-gray-500 hover:text-white hover:bg-white/5"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function InventorySection({ title, items, type, renderItem }) {
  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <div className="h-px bg-gray-800 flex-1" />
        <h3 className="text-xs font-black text-gray-500 uppercase tracking-[0.3em]">{title}</h3>
        <div className="h-px bg-gray-800 flex-1" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {items.map(item => renderItem(item, type))}
      </div>
    </div>
  );
}
