import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Home, Settings, Trophy, ShoppingBag, Menu, Star, TrendingUp, ChevronRight, Zap, Bot } from "lucide-react";
import GameBoard from "../features/game/components/GameBoard";
import DifficultySelector from "../features/game/components/DifficultySelector";
import { useGameStore } from "../features/game/store/gameStore";
import { useShopStore } from "../features/shop/store/shopStore";
import { Button } from "../shared/components/Button";
import { Card } from "../shared/components/Card";
import PhysicsTuner from "../components/PhysicsTuner";

export default function GamePage() {
  const { mode } = useParams();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showDifficultySelector, setShowDifficultySelector] = useState(false);

  const {
    gameState,
    player1Score,
    player2Score,
    playerELO,
    playerLevel,
    playerXP,
    xpChange,
    eloChange,
    gameMode,
    difficulty,
    startGame,
    setDifficulty,
    resetGame,
    player1Name,
    player2Name,
    getXPRequired,
    getPlayerTitle,
    getPlayerTitleColor,
  } = useGameStore();

  const { isPro, getCurrentThemeData } = useShopStore();

  useEffect(() => {
    // Only PVE mode exists now
    if (gameState === "HOME") {
      setShowDifficultySelector(true);
    }
  }, [gameState]);

  const handleDifficultySelect = (diff) => {
    setDifficulty(diff);
    setShowDifficultySelector(false);
    startGame(gameMode, diff); // Preserve current mode (PVE or PARTY)
  };

  const handleBackHome = () => {
    resetGame();
    navigate("/");
  };

  const themeData = getCurrentThemeData();
  const xpRequired = getXPRequired ? getXPRequired() : 100;
  const xpProgress = (playerXP / xpRequired) * 100;
  const playerTitle = getPlayerTitle ? getPlayerTitle() : "Rookie";
  const playerTitleColor = getPlayerTitleColor ? getPlayerTitleColor() : "text-gray-400";

  return (
    <div className="h-screen bg-gray-950 overflow-hidden text-gray-100">
      <div className="h-full grid grid-cols-1 lg:grid-cols-[260px_1fr_320px]">
        {/* Left Sidebar */}
        <aside className={`bg-gray-900 border-r border-gray-800 p-6 flex flex-col lg:flex ${sidebarOpen ? "block" : "hidden lg:block"}`}>
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Trophy className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className={`font-bold tracking-tight truncate ${playerTitleColor}`}>{playerTitle}</h2>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Live Arena</span>
              </div>
            </div>
          </div>

          <nav className="space-y-1.5 flex-1">
            <NavBtn icon={<Home className="w-5 h-5" />} label="Home" onClick={handleBackHome} />
            <NavBtn icon={<ShoppingBag className="w-5 h-5" />} label="Shop" onClick={() => navigate("/shop")} />
            <NavBtn icon={<TrendingUp className="w-5 h-5" />} label="Rankings" />
            <NavBtn icon={<Settings className="w-5 h-5" />} label="Settings" />
          </nav>

          <div className="mt-auto p-4 rounded-2xl bg-gray-800/50 border border-gray-700/50">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-gray-900 font-black shadow-lg">
                {playerLevel}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-gray-400 truncate">{player1Name}</p>
                <p className="text-sm font-black text-white">{playerELO} ELO</p>
              </div>
            </div>
            <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
              <div className="h-full bg-yellow-400" style={{ width: `${xpProgress}%` }} />
            </div>
          </div>
        </aside>

        {/* Main Board */}
        <main className="bg-gray-800/20 flex flex-col relative">
          <header className="lg:hidden flex items-center justify-between p-4 bg-gray-900 border-b border-gray-800">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 text-gray-400"><Menu /></button>
            <span className="font-black tracking-tighter">SLING PRO</span>
            <button onClick={handleBackHome} className="p-2 text-gray-400"><Home /></button>
          </header>

          <div className="p-6 border-b border-gray-800/50 flex items-center justify-between bg-gray-900/20 backdrop-blur-sm">
            <div className="flex items-center gap-8">
              <ScoreCard name={player1Name} score={player1Score} color="from-blue-500 to-blue-600" />
              <div className="text-gray-600 font-black italic">VS</div>
              <ScoreCard name={player2Name} score={player2Score} color="from-gray-600 to-gray-700" isAI />
            </div>
            <div className="hidden md:block px-4 py-2 bg-gray-800/50 rounded-lg border border-gray-700">
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest text-center mb-1">Victory Target</p>
              <p className="text-lg font-black text-white text-center">10 PUCKS</p>
            </div>
          </div>

          <div className="flex-1 flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.05)_0%,transparent_100%)] pointer-events-none" />
            <GameBoard theme={themeData} />
          </div>
        </main>

        {/* Right Info Panel */}
        <aside className="hidden lg:block bg-gray-950 p-6 overflow-y-auto border-l border-gray-900">
          <Card className="mb-6 bg-blue-600/10 border-blue-500/20 overflow-hidden relative">
            <div className="absolute top-0 right-0 p-4 opacity-10"><Zap className="w-12 h-12" /></div>
            <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">Current Multiplier</p>
            <p className="text-3xl font-black text-white">x1.5 XP</p>
            <p className="text-xs text-blue-300/60 mt-2">Active difficulty: Medium</p>
          </Card>

          <h3 className="text-xs font-black text-gray-500 uppercase tracking-[0.2em] mb-4">Progression</h3>
          <div className="space-y-3 mb-8">
            <StatRow label="Rating" value={playerELO} sub={`+${eloChange} last match`} />
            <StatRow label="Global Rank" value="#1,242" />
            <StatRow label="Matches" value={useGameStore.getState().gamesPlayed} />
          </div>

          <Card className="p-4 bg-gray-900/50 border-gray-800">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-sm">Quests</h3>
              <ChevronRight className="w-4 h-4 text-gray-600" />
            </div>
            <div className="space-y-4">
              <QuestItem label="Win 3 matches" progress={1} total={3} />
              <QuestItem label="Daily: Hard Mode" progress={0} total={1} />
            </div>
          </Card>
        </aside>
      </div>

      {/* Enhanced Victory/Defeat Modal with Animations - Compact Version */}
      {gameState === "RESULT" && (
        <div className="fixed inset-0 bg-gray-950/95 flex items-center justify-center z-[100] p-4 backdrop-blur-xl animate-fade-in">
          <Card className="max-w-sm w-full p-6 border-2 border-white/5 bg-gray-900 shadow-2xl overflow-hidden relative animate-scale-in">
            {/* Animated Background Effects */}
            <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 to-transparent pointer-events-none" />
            {player1Score > player2Score && (
              <>
                {/* Victory Particles */}
                <div className="absolute inset-0 pointer-events-none">
                  {[...Array(15)].map((_, i) => (
                    <div
                      key={i}
                      className="absolute w-1.5 h-1.5 bg-yellow-400 rounded-full animate-float"
                      style={{
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`,
                        animationDelay: `${Math.random() * 2}s`,
                        animationDuration: `${2 + Math.random() * 2}s`
                      }}
                    />
                  ))}
                </div>
                {/* Victory Glow */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-green-500/10 to-yellow-500/10 animate-pulse pointer-events-none" />
              </>
            )}
            
            {/* Main Title with Enhanced Animation - Smaller */}
            <div className="text-center mb-4">
              <h2 className={`text-4xl font-black mb-1 tracking-tighter animate-bounce-in ${
                player1Score > player2Score 
                  ? 'text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-green-400 to-yellow-400' 
                  : 'text-gray-500'
              }`}>
                {player1Score > player2Score ? "🏆 VICTORY! 🏆" : "💔 DEFEAT 💔"}
              </h2>
              
              {player1Score > player2Score && (
                <div className="text-yellow-400 text-lg animate-pulse mb-1">
                  ⭐ ✨ 🎉 ✨ ⭐
                </div>
              )}
              
              {/* Level Up Indicator - Compact */}
              {xpChange > 0 && playerLevel > 1 && (
                <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-lg p-1.5 mb-2 animate-bounce-in">
                  <div className="text-yellow-400 text-xs font-bold">
                    🆙 LEVEL UP! Welcome to Level {playerLevel}! 🆙
                  </div>
                </div>
              )}
              
              <p className="text-center text-gray-400 font-bold uppercase tracking-[0.3em] text-[10px]">
                {player1Score > player2Score ? "CHAMPION PERFORMANCE!" : "Post Match Summary"}
              </p>
            </div>

            {/* Score Display with Animation - Smaller */}
            <div className="flex justify-center items-baseline gap-4 mb-6 animate-slide-up">
              <div className="text-center">
                <div className="text-[10px] text-blue-400 font-bold mb-1">YOU</div>
                <span className={`text-5xl font-black ${player1Score > player2Score ? 'text-green-400 animate-pulse' : 'text-white'}`}>
                  {player1Score}
                </span>
              </div>
              <span className="text-2xl font-black text-gray-700 animate-pulse">:</span>
              <div className="text-center">
                <div className="text-[10px] text-red-400 font-bold mb-1">AI</div>
                <span className="text-5xl font-black text-gray-600">{player2Score}</span>
              </div>
            </div>

            {/* Rewards Section with Staggered Animation - Compact */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
                <RewardCard 
                  label="Rating" 
                  value={eloChange >= 0 ? `+${eloChange}` : eloChange} 
                  sub="ELO" 
                  color={eloChange >= 0 ? "text-green-400" : "text-red-400"}
                  icon="🏆"
                  compact={true}
                />
              </div>
              <div className="animate-slide-up" style={{ animationDelay: '0.4s' }}>
                <RewardCard 
                  label="Experience" 
                  value={xpChange >= 0 ? `+${xpChange}` : xpChange} 
                  sub="XP" 
                  color={xpChange >= 0 ? "text-blue-400" : "text-red-400"}
                  icon="⭐"
                  compact={true}
                />
              </div>
            </div>

            {/* Level Progress with Animation - Compact */}
            <div className="mb-6 animate-slide-up" style={{ animationDelay: '0.6s' }}>
              <div className="flex justify-between items-end mb-1.5">
                <div>
                  <span className={`text-[9px] font-black uppercase tracking-widest ${playerTitleColor}`}>
                    {playerTitle}
                  </span>
                  <div className="text-lg font-black text-white">Lvl {playerLevel}</div>
                </div>
                <div className="text-right">
                  <span className="text-white font-bold text-sm">{Math.floor(playerXP)}</span>
                  <span className="text-gray-600 text-[10px] font-bold"> / {xpRequired} XP</span>
                </div>
              </div>
              <div className="h-2 bg-gray-800 rounded-full overflow-hidden border border-white/5 shadow-inner">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-2000 ease-out animate-fill-bar" 
                  style={{ width: `${xpProgress}%` }} 
                />
              </div>
            </div>

            {/* Action Buttons with Animation - Compact */}
            <div className="grid grid-cols-2 gap-2 relative z-10 animate-slide-up" style={{ animationDelay: '0.8s' }}>
              <Button 
                variant="secondary" 
                className="font-bold py-3 text-white hover:scale-105 transition-transform text-sm" 
                onClick={() => setShowDifficultySelector(true)}
              >
                Difficulty
              </Button>
              <Button 
                variant="primary" 
                className={`font-bold py-3 text-gray-900 hover:scale-105 transition-transform text-sm ${
                  player1Score > player2Score ? 'animate-pulse bg-gradient-to-r from-green-400 to-blue-400' : ''
                }`}
                onClick={() => startGame(gameMode, difficulty)}
              >
                {player1Score > player2Score ? '🚀 Again!' : 'Try Again'}
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Difficulty Selector */}
      <DifficultySelector
        isOpen={showDifficultySelector}
        onSelect={handleDifficultySelect}
        onClose={() => setShowDifficultySelector(false)}
        gameMode={gameMode}
      />
      
      {/* Physics Tuner for real-time adjustments */}
      <PhysicsTuner />
    </div>
  );
}

function NavBtn({ icon, label, onClick }) {
  return (
    <button onClick={onClick} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-all group">
      <div className="group-hover:scale-110 transition-transform">{icon}</div>
      <span className="font-bold text-sm tracking-tight">{label}</span>
    </button>
  );
}

function ScoreCard({ name, score, color, isAI }) {
  return (
    <div className="flex items-center gap-4">
      <div className={`w-12 h-12 bg-gradient-to-br ${color} rounded-xl shadow-lg flex items-center justify-center`}>
        {isAI ? <Bot className="w-7 h-7 text-white" /> : <div className="font-black text-white">YOU</div>}
      </div>
      <div>
        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{name}</p>
        <p className="text-2xl font-black text-white">{score}</p>
      </div>
    </div>
  );
}

function StatRow({ label, value, sub }) {
  return (
    <div className="flex justify-between items-center py-2">
      <span className="text-sm font-bold text-gray-500">{label}</span>
      <div className="text-right">
        <div className="font-black text-white">{value}</div>
        {sub && <div className="text-[9px] font-black text-gray-600 uppercase">{sub}</div>}
      </div>
    </div>
  );
}

function QuestItem({ label, progress, total }) {
  const percent = (progress / total) * 100;
  return (
    <div>
      <div className="flex justify-between text-xs mb-1.5 font-bold">
        <span className="text-gray-300">{label}</span>
        <span className="text-gray-500">{progress}/{total}</span>
      </div>
      <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
        <div className="h-full bg-blue-500" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}

function RewardCard({ label, value, sub, color, icon, compact = false }) {
  return (
    <div className={`${compact ? 'p-3' : 'p-4'} bg-gray-800/50 rounded-2xl border border-gray-800 text-center hover:bg-gray-800/70 transition-colors`}>
      {icon && <div className={`${compact ? 'text-lg mb-1' : 'text-2xl mb-2'}`}>{icon}</div>}
      <p className={`text-gray-500 ${compact ? 'text-[9px]' : 'text-[10px]'} font-black uppercase tracking-widest mb-1`}>{label}</p>
      <div className={`${compact ? 'text-xl' : 'text-2xl'} font-black ${color}`}>{value}</div>
      <p className={`${compact ? 'text-[9px]' : 'text-[10px]'} font-black text-gray-600 uppercase tracking-widest`}>{sub}</p>
    </div>
  );
}
