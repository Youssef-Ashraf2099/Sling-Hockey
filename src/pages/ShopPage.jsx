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
  Zap,
  Package
} from "lucide-react";
import { soundManager } from "../core/audio/SoundManager";
import { Button } from "../shared/components/Button";
import { Card } from "../shared/components/Card";
import { useShopStore, PUCK_SKINS, BOARD_THEMES } from "../features/shop/store/shopStore";

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

    const handleEquip = (itemId, type) => {
      soundManager.playEquip();
      if (type === "puck") equipSkin(itemId);
      else equipTheme(itemId);
    };

    return (
      <Card key={item.id} className={`relative overflow-hidden group transition-all duration-300 hover:shadow-2xl ${isEquipped ? 'ring-2 ring-blue-500 bg-blue-500/5' : 'hover:bg-gray-800/50'}`}>
        <div className="p-4 flex flex-col h-full">
          {/* Preview Area */}
          <div 
            className="h-40 rounded-lg mb-4 flex items-center justify-center border border-gray-700/50 shadow-inner group-hover:scale-105 transition-transform overflow-hidden relative"
            style={{ 
              backgroundColor: type === "board" ? item.backgroundColor : "#020617",
              borderColor: type === "board" ? item.dividerColor : "rgba(55, 65, 81, 0.5)"
            }}
          >
            {type === "puck" ? (
              <div className="relative flex items-center justify-center">
                {/* Glow Effect */}
                <div 
                  className="absolute inset-0 blur-2xl opacity-40 rounded-full animate-pulse scale-150"
                  style={{ backgroundColor: item.color }}
                />
                
                {["basketball", "football", "volleyball"].includes(item.id) ? (
                   // Sport Skins: No background, just large icon
                   <div className="text-7xl relative z-10 drop-shadow-2xl filter saturate-125">
                     {item.id === "basketball" && "🏀"}
                     {item.id === "football" && "🏈"}
                     {item.id === "volleyball" && "🏐"}
                   </div>
                ) : (
                  // Normal skins: High quality sphere
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
                
                {/* Wall Preview */}
                <div className="absolute left-0 top-0 bottom-0 w-2 opacity-50" style={{ backgroundColor: item.wallColor }} />
                <div className="absolute right-0 top-0 bottom-0 w-2 opacity-50" style={{ backgroundColor: item.wallColor }} />
              </div>
            )}
          </div>

          <div className="flex-1">
            <h4 className="font-bold text-white text-lg flex items-center gap-2">
              {item.name}
              {isOwned && <div className="p-0.5 bg-green-500 rounded-full"><Check className="w-3 h-3 text-white" /></div>}
            </h4>
            <p className="text-gray-400 text-sm mb-4 line-clamp-2 italic">"{item.description}"</p>
            
            {type === "puck" && (
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="text-[10px] px-2 py-0.5 bg-gray-800 text-gray-400 rounded-full border border-gray-700">Mass: {item.physics.mass}</span>
                <span className="text-[10px] px-2 py-0.5 bg-gray-800 text-gray-400 rounded-full border border-gray-700">Bounce: {item.physics.restitution}</span>
              </div>
            )}
          </div>

          <div className="mt-auto pt-4">
            {isOwned ? (
              <Button 
                variant={isEquipped ? "secondary" : "primary"}
                className="w-full"
                size="sm"
                onClick={() => handleEquip(item.id, type)}
                disabled={isEquipped}
              >
                {isEquipped ? "Equipped" : "Equip"}
              </Button>
            ) : (
              <Button 
                variant="primary"
                className="w-full flex items-center justify-center gap-2 relative overflow-hidden group"
                size="sm"
                onClick={() => handleWatchAd(item.id, type)}
                disabled={isWatchingAd}
              >
                {isWatchingAd && adTarget === item.id ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Watching...</span>
                  </div>
                ) : (
                  <>
                    <Tv className="w-4 h-4" />
                    <span>Unlock (Watch Ad)</span>
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
    <div className="min-h-screen bg-gray-900 text-gray-100 pb-12">
      {/* Header */}
      <div className="bg-gray-800/50 border-b border-gray-700 sticky top-0 z-50 backdrop-blur-md">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate("/")}
              className="p-2 hover:bg-gray-700 rounded-full transition-colors"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <ShoppingBag className="w-6 h-6 text-blue-500" />
              Sling Hockey Shop
            </h1>
          </div>
          
          <div className="flex items-center gap-3">
             {isPro && (
              <div className="px-3 py-1 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full text-sm font-bold text-white">
                PRO PLAYER
              </div>
            )}
          </div>
        </div>
      </div>

      <main className="container mx-auto px-6 py-8">
        {/* Tabs */}
        <div className="flex gap-2 mb-8 bg-gray-800/30 p-1 rounded-xl w-fit mx-auto border border-gray-800 shadow-lg">
          <button
            onClick={() => setActiveTab("pucks")}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-bold transition-all ${
              activeTab === "pucks" 
                ? "bg-blue-600 text-white shadow-lg" 
                : "text-gray-400 hover:text-white hover:bg-gray-800"
            }`}
          >
            <Circle className="w-5 h-5" />
            Pucks
          </button>
          <button
            onClick={() => setActiveTab("boards")}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-bold transition-all ${
              activeTab === "boards" 
                ? "bg-blue-600 text-white shadow-lg" 
                : "text-gray-400 hover:text-white hover:bg-gray-800"
            }`}
          >
            <Layout className="w-5 h-5" />
            Boards
          </button>
          <button
            onClick={() => setActiveTab("inventory")}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-bold transition-all ${
              activeTab === "inventory" 
                ? "bg-purple-600 text-white shadow-lg" 
                : "text-gray-400 hover:text-white hover:bg-gray-800"
            }`}
          >
            <Package className="w-5 h-5" />
            My Items
          </button>
        </div>

        {/* Content */}
        {activeTab === "pucks" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-fade-in">
            {Object.values(PUCK_SKINS).map(puck => renderItem(puck, "puck"))}
          </div>
        )}

        {activeTab === "boards" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-fade-in">
            {Object.values(BOARD_THEMES).map(theme => renderItem(theme, "board"))}
          </div>
        )}

        {activeTab === "inventory" && (
          <div className="animate-fade-in">
             <div className="flex items-center gap-3 mb-6">
               <Package className="w-6 h-6 text-purple-400" />
               <h3 className="text-xl font-bold">Your Collection</h3>
             </div>
             
             <div className="space-y-8">
                <div>
                  <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Owned Pucks</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {purchasedSkins.map(id => renderItem(PUCK_SKINS[id], "puck"))}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Owned Boards</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {purchasedThemes.map(id => renderItem(BOARD_THEMES[id], "board"))}
                  </div>
                </div>
             </div>
          </div>
        )}
      </main>

      {/* Ad Mock Overlay */}
      {isWatchingAd && (
        <div className="fixed inset-0 z-[100] bg-black flex items-center justify-center p-8 animate-fade-in">
          <div className="max-w-md w-full text-center">
             <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce shadow-[0_0_50px_rgba(37,99,235,0.5)]">
               <Tv className="w-10 h-10 text-white" />
             </div>
             <h2 className="text-3xl font-bold mb-4">Watching Advertisement</h2>
             <p className="text-gray-400 text-lg mb-8">Unlocking your item in a moment...</p>
             <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 animate-progress origin-left" />
             </div>
          </div>
        </div>
      )}
    </div>
  );
}
