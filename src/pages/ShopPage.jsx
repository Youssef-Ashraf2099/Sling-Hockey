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
    equippedSkin, 
    equippedTheme,
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
      ? equippedSkin === item.id 
      : equippedTheme === item.id;

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
              <PuckPreview skinId={item.id} skinData={item} />
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

// PuckPreview component with high-quality SVG-based rendering
function PuckPreview({ skinId, skinData }) {
  const renderPuckSVG = () => {
    const size = 96;
    const radius = size * 0.4;
    const centerX = size / 2;
    const centerY = size / 2;

    switch (skinId) {
      case 'basketball':
      case 'football':
      case 'volleyball':
      case 'soccer':
        const sportEmojis = {
          basketball: '🏀',
          football: '🏈', 
          volleyball: '🏐',
          soccer: '⚽'
        };
        return (
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            <text x={centerX} y={centerY} textAnchor="middle" dominantBaseline="middle" fontSize="72" style={{userSelect: 'none'}}>
              {sportEmojis[skinId]}
            </text>
          </svg>
        );

      case 'rainbow_ball':
        return (
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            <defs>
              <radialGradient id="rainbowBallGrad" cx="30%" cy="30%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="20%" stopColor="#ff0000" />
                <stop offset="35%" stopColor="#ff8800" />
                <stop offset="50%" stopColor="#ffff00" />
                <stop offset="65%" stopColor="#00ff00" />
                <stop offset="80%" stopColor="#0088ff" />
                <stop offset="100%" stopColor="#8800ff" />
              </radialGradient>
              <filter id="rainbowShine">
                <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                <feMerge> 
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            <circle cx={centerX} cy={centerY} r={radius} fill="url(#rainbowBallGrad)" filter="url(#rainbowShine)" stroke="#fff" strokeWidth="1"/>
            <circle cx={centerX - radius * 0.3} cy={centerY - radius * 0.3} r={radius * 0.2} fill="rgba(255,255,255,0.6)"/>
          </svg>
        );

      case 'disco_ball':
        return (
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            <defs>
              <radialGradient id="discoGrad" cx="30%" cy="30%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="50%" stopColor="#cccccc" />
                <stop offset="100%" stopColor="#666666" />
              </radialGradient>
              <filter id="discoSparkle">
                <feGaussianBlur stdDeviation="1" result="coloredBlur"/>
                <feMerge> 
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            <circle cx={centerX} cy={centerY} r={radius} fill="url(#discoGrad)" stroke="#fff" strokeWidth="1"/>
            {/* Mirror tiles */}
            {Array.from({length: 12}).map((_, i) => {
              const angle = (i * Math.PI * 2) / 12;
              const x = centerX + Math.cos(angle) * radius * 0.6;
              const y = centerY + Math.sin(angle) * radius * 0.6;
              return (
                <rect key={i} x={x-3} y={y-3} width="6" height="6" fill="#ffffff" filter="url(#discoSparkle)" opacity="0.8"/>
              );
            })}
            <text x={centerX} y={centerY + radius + 15} textAnchor="middle" fill="#666" fontSize="8">✨</text>
          </svg>
        );

      case 'pulse_ball':
        return (
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            <defs>
              <radialGradient id="pulseGrad" cx="50%" cy="50%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="30%" stopColor="#00ffff" />
                <stop offset="70%" stopColor="#0088ff" />
                <stop offset="100%" stopColor="#000088" />
              </radialGradient>
              <filter id="pulseGlow">
                <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                <feMerge> 
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            <circle cx={centerX} cy={centerY} r={radius} fill="url(#pulseGrad)" filter="url(#pulseGlow)"/>
            <circle cx={centerX} cy={centerY} r={radius * 0.7} fill="none" stroke="#ffffff" strokeWidth="2" opacity="0.5">
              <animate attributeName="r" values={`${radius * 0.3};${radius * 0.8};${radius * 0.3}`} dur="2s" repeatCount="indefinite"/>
              <animate attributeName="opacity" values="0.8;0.2;0.8" dur="2s" repeatCount="indefinite"/>
            </circle>
          </svg>
        );

      case 'orbit_ball':
        return (
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            <defs>
              <radialGradient id="orbitGrad" cx="30%" cy="30%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="50%" stopColor="#4444ff" />
                <stop offset="100%" stopColor="#000044" />
              </radialGradient>
            </defs>
            <circle cx={centerX} cy={centerY} r={radius} fill="url(#orbitGrad)" stroke="#fff" strokeWidth="1"/>
            <circle cx={centerX} cy={centerY} r={radius * 0.8} fill="none" stroke="#ffffff" strokeWidth="1" opacity="0.3"/>
            <circle r="3" fill="#ffff00">
              <animateMotion dur="3s" repeatCount="indefinite">
                <path d={`M ${centerX + radius * 0.8} ${centerY} A ${radius * 0.8} ${radius * 0.8} 0 1 1 ${centerX - radius * 0.8} ${centerY} A ${radius * 0.8} ${radius * 0.8} 0 1 1 ${centerX + radius * 0.8} ${centerY}`}/>
              </animateMotion>
            </circle>
          </svg>
        );

      case 'smiley':
        return (
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            <defs>
              <radialGradient id="smileyGrad" cx="30%" cy="30%">
                <stop offset="0%" stopColor="#ffdd44" />
                <stop offset="100%" stopColor="#cc9900" />
              </radialGradient>
            </defs>
            <circle cx={centerX} cy={centerY} r={radius} fill="url(#smileyGrad)" stroke="#000" strokeWidth="2"/>
            <circle cx={centerX - radius * 0.3} cy={centerY - radius * 0.2} r={radius * 0.1} fill="#000"/>
            <circle cx={centerX + radius * 0.3} cy={centerY - radius * 0.2} r={radius * 0.1} fill="#000"/>
            <path d={`M ${centerX - radius * 0.5} ${centerY + radius * 0.1} Q ${centerX} ${centerY + radius * 0.6} ${centerX + radius * 0.5} ${centerY + radius * 0.1}`} 
                  fill="none" stroke="#000" strokeWidth="3"/>
          </svg>
        );

      case 'fire_emoji':
        return (
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            <defs>
              <radialGradient id="fireGrad" cx="50%" cy="50%">
                <stop offset="0%" stopColor="#ff4444" />
                <stop offset="50%" stopColor="#ff8800" />
                <stop offset="100%" stopColor="#ffaa00" />
              </radialGradient>
            </defs>
            <circle cx={centerX} cy={centerY} r={radius} fill="url(#fireGrad)"/>
            <path d={`M ${centerX} ${centerY + radius} Q ${centerX - radius * 0.5} ${centerY} ${centerX} ${centerY - radius * 0.8} Q ${centerX + radius * 0.5} ${centerY} ${centerX} ${centerY + radius}`} 
                  fill="#ff0000"/>
          </svg>
        );

      case 'star':
      case 'star_emoji':
        return (
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            <defs>
              <radialGradient id="starGrad" cx="30%" cy="30%">
                <stop offset="0%" stopColor="#ffff44" />
                <stop offset="100%" stopColor="#ccaa00" />
              </radialGradient>
            </defs>
            <circle cx={centerX} cy={centerY} r={radius} fill="url(#starGrad)" stroke="#000" strokeWidth="1"/>
            <path d={`M ${centerX} ${centerY - radius * 0.7} L ${centerX + radius * 0.2} ${centerY - radius * 0.2} L ${centerX + radius * 0.7} ${centerY - radius * 0.2} L ${centerX + radius * 0.3} ${centerY + radius * 0.1} L ${centerX + radius * 0.4} ${centerY + radius * 0.7} L ${centerX} ${centerY + radius * 0.3} L ${centerX - radius * 0.4} ${centerY + radius * 0.7} L ${centerX - radius * 0.3} ${centerY + radius * 0.1} L ${centerX - radius * 0.7} ${centerY - radius * 0.2} L ${centerX - radius * 0.2} ${centerY - radius * 0.2} Z`} 
                  fill="#ffff00" stroke="#000" strokeWidth="1"/>
          </svg>
        );

      case 'hexagon':
        return (
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            <defs>
              <radialGradient id="hexGrad" cx="30%" cy="30%">
                <stop offset="0%" stopColor="#44bb88" />
                <stop offset="100%" stopColor="#226644" />
              </radialGradient>
            </defs>
            <polygon points={[0,1,2,3,4,5].map(i => {
              const angle = (i * Math.PI) / 3;
              const x = centerX + Math.cos(angle) * radius * 0.8;
              const y = centerY + Math.sin(angle) * radius * 0.8;
              return `${x},${y}`;
            }).join(' ')} fill="url(#hexGrad)" stroke="#000" strokeWidth="2"/>
          </svg>
        );

      case 'triangle':
        return (
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            <defs>
              <radialGradient id="triangleGrad" cx="30%" cy="30%">
                <stop offset="0%" stopColor="#ffaa44" />
                <stop offset="100%" stopColor="#cc6600" />
              </radialGradient>
            </defs>
            <polygon points={`${centerX},${centerY - radius * 0.8} ${centerX - radius * 0.7},${centerY + radius * 0.4} ${centerX + radius * 0.7},${centerY + radius * 0.4}`} 
                     fill="url(#triangleGrad)" stroke="#000" strokeWidth="2"/>
          </svg>
        );

      case 'neon_glow':
        return (
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            <defs>
              <radialGradient id="neonGrad" cx="50%" cy="50%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="30%" stopColor="#00ffff" />
                <stop offset="100%" stopColor="#0088cc" />
              </radialGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
                <feMerge> 
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            <circle cx={centerX} cy={centerY} r={radius} fill="url(#neonGrad)" filter="url(#glow)"/>
          </svg>
        );

      case 'hacker':
        return (
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            <circle cx={centerX} cy={centerY} r={radius} fill="#000000" stroke="#00ff41" strokeWidth="2"/>
            <text x={centerX} y={centerY - radius * 0.3} textAnchor="middle" fill="#00ff41" fontSize="12" fontFamily="monospace">01</text>
            <text x={centerX - radius * 0.5} y={centerY} textAnchor="middle" fill="#00ff41" fontSize="12" fontFamily="monospace">10</text>
            <text x={centerX + radius * 0.5} y={centerY} textAnchor="middle" fill="#00ff41" fontSize="12" fontFamily="monospace">11</text>
            <text x={centerX} y={centerY + radius * 0.5} textAnchor="middle" fill="#00ff41" fontSize="20" fontFamily="monospace">$</text>
          </svg>
        );

      case 'matrix_code':
        return (
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            <circle cx={centerX} cy={centerY} r={radius} fill="#003300" stroke="#00ff41" strokeWidth="2"/>
            <text x={centerX} y={centerY - radius * 0.4} textAnchor="middle" fill="#00ff41" fontSize="10" fontFamily="monospace">01</text>
            <text x={centerX - radius * 0.6} y={centerY - radius * 0.2} textAnchor="middle" fill="#00ff41" fontSize="8" fontFamily="monospace">ア</text>
            <text x={centerX + radius * 0.6} y={centerY - radius * 0.2} textAnchor="middle" fill="#00ff41" fontSize="8" fontFamily="monospace">イ</text>
            <text x={centerX - radius * 0.4} y={centerY + radius * 0.2} textAnchor="middle" fill="#00ff41" fontSize="8" fontFamily="monospace">10</text>
            <text x={centerX + radius * 0.4} y={centerY + radius * 0.2} textAnchor="middle" fill="#00ff41" fontSize="8" fontFamily="monospace">ウ</text>
            <text x={centerX} y={centerY + radius * 0.6} textAnchor="middle" fill="#00ff41" fontSize="10" fontFamily="monospace">11</text>
          </svg>
        );

      case 'rocket_emoji':
        return (
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            <circle cx={centerX} cy={centerY} r={radius} fill="#1a1a2e" stroke="#fff" strokeWidth="2"/>
            <rect x={centerX - radius * 0.2} y={centerY - radius * 0.6} width={radius * 0.4} height={radius * 1.2} fill="#cccccc"/>
            <polygon points={`${centerX},${centerY - radius * 0.8} ${centerX - radius * 0.2},${centerY - radius * 0.6} ${centerX + radius * 0.2},${centerY - radius * 0.6}`} fill="#ff4444"/>
            <polygon points={`${centerX - radius * 0.1},${centerY + radius * 0.6} ${centerX},${centerY + radius * 0.9} ${centerX + radius * 0.1},${centerY + radius * 0.6}`} fill="#ffaa00"/>
          </svg>
        );

      case 'lightning_emoji':
        return (
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            <defs>
              <filter id="lightningGlow">
                <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                <feMerge> 
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            <circle cx={centerX} cy={centerY} r={radius} fill="#1a1a2e"/>
            <path d={`M ${centerX - radius * 0.2} ${centerY - radius * 0.7} L ${centerX + radius * 0.3} ${centerY - radius * 0.7} L ${centerX - radius * 0.1} ${centerY} L ${centerX + radius * 0.2} ${centerY} L ${centerX - radius * 0.3} ${centerY + radius * 0.7} L ${centerX + radius * 0.1} ${centerY} L ${centerX - radius * 0.2} ${centerY - radius * 0.7}`} 
                  fill="#ffff00" filter="url(#lightningGlow)"/>
          </svg>
        );

      case 'gem_emoji':
        return (
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            <defs>
              <linearGradient id="gemGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="30%" stopColor="#00ffff" />
                <stop offset="100%" stopColor="#0066cc" />
              </linearGradient>
            </defs>
            <path d={`M ${centerX} ${centerY - radius * 0.8} L ${centerX + radius * 0.6} ${centerY - radius * 0.3} L ${centerX + radius * 0.4} ${centerY + radius * 0.8} L ${centerX - radius * 0.4} ${centerY + radius * 0.8} L ${centerX - radius * 0.6} ${centerY - radius * 0.3} Z`} 
                  fill="url(#gemGrad)" stroke="#fff" strokeWidth="1"/>
            <line x1={centerX} y1={centerY - radius * 0.8} x2={centerX} y2={centerY + radius * 0.2} stroke="#fff" strokeWidth="1"/>
            <line x1={centerX - radius * 0.6} y1={centerY - radius * 0.3} x2={centerX + radius * 0.6} y2={centerY - radius * 0.3} stroke="#fff" strokeWidth="1"/>
          </svg>
        );

      case 'crown_emoji':
        return (
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            <circle cx={centerX} cy={centerY} r={radius} fill="#fbbf24"/>
            <path d={`M ${centerX - radius * 0.6} ${centerY + radius * 0.3} L ${centerX - radius * 0.4} ${centerY - radius * 0.2} L ${centerX - radius * 0.2} ${centerY + radius * 0.1} L ${centerX} ${centerY - radius * 0.5} L ${centerX + radius * 0.2} ${centerY + radius * 0.1} L ${centerX + radius * 0.4} ${centerY - radius * 0.2} L ${centerX + radius * 0.6} ${centerY + radius * 0.3} Z`} 
                  fill="#ffdd00"/>
            <circle cx={centerX} cy={centerY - radius * 0.2} r={radius * 0.1} fill="#ff0000"/>
          </svg>
        );

      case 'alien_emoji':
        return (
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            <circle cx={centerX} cy={centerY} r={radius} fill="#10b981"/>
            <ellipse cx={centerX} cy={centerY - radius * 0.1} rx={radius * 0.6} ry={radius * 0.8} fill="#00ff88"/>
            <ellipse cx={centerX - radius * 0.2} cy={centerY - radius * 0.2} rx={radius * 0.15} ry={radius * 0.25} fill="#000"/>
            <ellipse cx={centerX + radius * 0.2} cy={centerY - radius * 0.2} rx={radius * 0.15} ry={radius * 0.25} fill="#000"/>
          </svg>
        );

      case 'skull_emoji':
        return (
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            <circle cx={centerX} cy={centerY} r={radius} fill="#f3f4f6" stroke="#000" strokeWidth="2"/>
            <circle cx={centerX - radius * 0.25} cy={centerY - radius * 0.2} r={radius * 0.15} fill="#000"/>
            <circle cx={centerX + radius * 0.25} cy={centerY - radius * 0.2} r={radius * 0.15} fill="#000"/>
            <path d={`M ${centerX} ${centerY} L ${centerX - radius * 0.1} ${centerY + radius * 0.2} L ${centerX + radius * 0.1} ${centerY + radius * 0.2} Z`} fill="#000"/>
          </svg>
        );

      case 'rainbow_emoji':
        return (
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            <circle cx={centerX} cy={centerY} r={radius} fill="#87ceeb"/>
            {["#ff0000", "#ff8800", "#ffff00", "#00ff00", "#0088ff", "#4400ff"].map((color, i) => (
              <path key={i} d={`M ${centerX - radius * 0.8 + i * radius * 0.08} ${centerY + radius * 0.3} A ${radius * 0.8 - i * radius * 0.08} ${radius * 0.8 - i * radius * 0.08} 0 0 1 ${centerX + radius * 0.8 - i * radius * 0.08} ${centerY + radius * 0.3}`} 
                    fill="none" stroke={color} strokeWidth={radius * 0.08}/>
            ))}
          </svg>
        );

      case 'snowflake_emoji':
        return (
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            <circle cx={centerX} cy={centerY} r={radius} fill="#a5f3fc"/>
            {[0, 1, 2, 3, 4, 5].map(i => {
              const angle = (i * Math.PI) / 3;
              const endX = centerX + Math.cos(angle) * radius * 0.7;
              const endY = centerY + Math.sin(angle) * radius * 0.7;
              const branchX = centerX + Math.cos(angle) * radius * 0.4;
              const branchY = centerY + Math.sin(angle) * radius * 0.4;
              return (
                <g key={i}>
                  <line x1={centerX} y1={centerY} x2={endX} y2={endY} stroke="#fff" strokeWidth="2"/>
                  <line x1={branchX + Math.cos(angle + Math.PI/4) * radius * 0.2} y1={branchY + Math.sin(angle + Math.PI/4) * radius * 0.2} 
                        x2={branchX} y2={branchY} stroke="#fff" strokeWidth="2"/>
                  <line x1={branchX} y1={branchY} 
                        x2={branchX + Math.cos(angle - Math.PI/4) * radius * 0.2} y2={branchY + Math.sin(angle - Math.PI/4) * radius * 0.2} stroke="#fff" strokeWidth="2"/>
                </g>
              );
            })}
          </svg>
        );

      case 'octagon':
        return (
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            <defs>
              <radialGradient id="octGrad" cx="30%" cy="30%">
                <stop offset="0%" stopColor="#bb88ff" />
                <stop offset="100%" stopColor="#6644aa" />
              </radialGradient>
            </defs>
            <polygon points={[0,1,2,3,4,5,6,7].map(i => {
              const angle = (i * Math.PI) / 4;
              const x = centerX + Math.cos(angle) * radius * 0.8;
              const y = centerY + Math.sin(angle) * radius * 0.8;
              return `${x},${y}`;
            }).join(' ')} fill="url(#octGrad)" stroke="#000" strokeWidth="2"/>
          </svg>
        );

      case 'heart':
        return (
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            <defs>
              <radialGradient id="heartGrad" cx="30%" cy="30%">
                <stop offset="0%" stopColor="#ff88bb" />
                <stop offset="100%" stopColor="#cc2266" />
              </radialGradient>
            </defs>
            <path d={`M ${centerX} ${centerY + radius * 0.7} C ${centerX} ${centerY + radius * 0.7} ${centerX - radius * 0.5} ${centerY} ${centerX - radius * 0.25} ${centerY - radius * 0.25} C ${centerX - radius * 0.25} ${centerY - radius * 0.25} ${centerX} ${centerY - radius * 0.25} ${centerX} ${centerY - radius * 0.25} C ${centerX} ${centerY - radius * 0.25} ${centerX + radius * 0.25} ${centerY - radius * 0.25} ${centerX + radius * 0.25} ${centerY - radius * 0.25} C ${centerX + radius * 0.5} ${centerY} ${centerX} ${centerY + radius * 0.7} ${centerX} ${centerY + radius * 0.7}`} 
                  fill="url(#heartGrad)" stroke="#000" strokeWidth="2"/>
          </svg>
        );

      case 'diamond_shape':
        return (
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            <defs>
              <radialGradient id="diamondGrad" cx="30%" cy="30%">
                <stop offset="0%" stopColor="#dd88ff" />
                <stop offset="100%" stopColor="#8844aa" />
              </radialGradient>
            </defs>
            <polygon points={`${centerX},${centerY - radius * 0.8} ${centerX + radius * 0.6},${centerY} ${centerX},${centerY + radius * 0.8} ${centerX - radius * 0.6},${centerY}`} 
                     fill="url(#diamondGrad)" stroke="#000" strokeWidth="2"/>
          </svg>
        );

      default:
        // Default circular puck with gradient
        const color = skinData?.color || "#ffffff";
        return (
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            <defs>
              <radialGradient id={`defaultGrad-${skinId}`} cx="30%" cy="30%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="70%" stopColor={color} />
                <stop offset="100%" stopColor="#000000" />
              </radialGradient>
            </defs>
            <circle cx={centerX} cy={centerY} r={radius} fill={`url(#defaultGrad-${skinId})`} stroke="#000" strokeWidth="2"/>
            <circle cx={centerX - radius * 0.3} cy={centerY - radius * 0.3} r={radius * 0.2} fill="rgba(255,255,255,0.4)"/>
          </svg>
        );
    }
  };

  return (
    <div className="relative flex items-center justify-center w-24 h-24">
      <div 
        className="absolute inset-0 blur-2xl opacity-20 rounded-full scale-150"
        style={{ backgroundColor: skinData?.color || "#ffffff" }}
      />
      <div className="relative z-10 drop-shadow-2xl">
        {renderPuckSVG()}
      </div>
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
