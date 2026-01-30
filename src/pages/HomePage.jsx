import { useNavigate } from "react-router-dom";
import { Bot, Trophy, Zap, Shield, Target, Info, Star, Flame, PartyPopper, TrendingUp } from "lucide-react";
import { Button } from "../shared/components/Button";
import { Card } from "../shared/components/Card";
import { useGameStore } from "../features/game/store/gameStore";
import { useShopStore } from "../features/shop/store/shopStore";
import Footer from "../components/layout/Footer";
import { TutorialModal } from "../features/game/components/TutorialModal";
import { useState } from "react";

export default function HomePage() {
  const navigate = useNavigate();
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);
  const { 
    gamesPlayed, 
    gamesWon, 
    playerELO, 
    currentStreak, 
    playerLevel, 
    playerXP,
    getXPRequired,
    getPlayerTitle,
    getPlayerTitleColor,
    setDifficulty,
    startGame
  } = useGameStore();
  const { isPro } = useShopStore();

  const handleStartGame = (mode = "PVE", difficulty = "MEDIUM") => {
    setDifficulty(difficulty);
    startGame(mode, difficulty);
    navigate(`/game/pve`);
  };

  const playerTitle = getPlayerTitle ? getPlayerTitle() : "Rookie";
  const playerTitleColor = getPlayerTitleColor ? getPlayerTitleColor() : "text-gray-400";

  const winRate = gamesPlayed > 0 ? Math.round((gamesWon / gamesPlayed) * 100) : 0;
  const xpRequired = getXPRequired();
  const xpProgress = (playerXP / xpRequired) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex flex-col">
      {/* Header */}
      <header className="border-b border-gray-700 bg-gray-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-blue-500 rounded-lg flex items-center justify-center">
              <Target className="w-7 h-7 text-white" />
            </div>
            <div className="hidden sm:block">
              <span className="text-2xl font-bold text-white tracking-tighter block">Sling Hockey</span>
              <p className={`text-[10px] font-black uppercase tracking-[0.2em] ${playerTitleColor}`}>{playerTitle}</p>
            </div>
          </div>

          <div className="flex-1 max-w-sm mx-12 hidden lg:block">
            <div className="flex justify-between text-[10px] mb-1 font-black uppercase tracking-widest">
              <span className="text-yellow-400">LEVEL {playerLevel}</span>
              <span className="text-gray-500">{Math.floor(playerXP)} / {xpRequired} XP</span>
            </div>
            <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden border border-white/5">
              <div 
                className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 transition-all duration-500" 
                style={{ width: `${xpProgress}%` }}
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Button
              variant="secondary"
              size="sm"
              className="hidden md:flex items-center gap-2 font-bold"
              onClick={() => setIsTutorialOpen(true)}
            >
              <Info className="w-4 h-4" />
              How to Play
            </Button>
            {isPro && (
              <div className="px-3 py-1 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full text-[10px] font-black text-gray-900">
                PRO
              </div>
            )}
            <Button
              variant="secondary"
              size="sm"
              className="font-bold"
              onClick={() => navigate("/shop")}
            >
              Shop
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 container mx-auto px-6 py-12">
        <div className="text-center mb-20 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 mb-8">
            <Trophy className="w-4 h-4 text-blue-400" />
            <span className="text-xs font-black text-blue-400 tracking-widest uppercase">The #1 Physics Board Game</span>
          </div>
          <h1 className="text-7xl md:text-9xl font-black italic tracking-tighter text-white mb-6 drop-shadow-2xl">
            SLING <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">PRO</span>
          </h1>
          <p className="text-gray-400 text-lg md:text-2xl max-w-2xl mx-auto font-medium leading-relaxed">
            Master the arena, collect power-ups, and dominate the rankings in the most advanced tabletop hockey experience.
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16 max-w-4xl mx-auto">
          <StatCard label="Rating" value={playerELO} color="text-green-400" icon={<Trophy className="w-4 h-4" />} />
          <StatCard label="Level" value={playerLevel} color="text-yellow-400" icon={<Star className="w-4 h-4" />} />
          <StatCard label="Win Rate" value={`${winRate}%`} color="text-blue-400" />
          <StatCard label="Streak" value={currentStreak} color="text-purple-400" />
        </div>

        {/* Game Modes */}
        <div className="flex flex-col md:flex-row gap-8 max-w-5xl mx-auto mb-24">
          <ModeCard 
            title="CLASSIC" 
            desc="The professional arena. Pure skill, strategy, and physics." 
            icon={Bot} 
            color="from-blue-600 to-indigo-700"
            buttonColor="bg-blue-400"
            onClick={() => handleStartGame("PVE", "MEDIUM")}
            badge="Standard"
          />
          <ModeCard 
            title="PARTY" 
            desc="Enter the chaos. Random power-ups, ghost pucks, and size shifts." 
            icon={PartyPopper} 
            color="from-purple-600 to-pink-700"
            buttonColor="bg-pink-400"
            onClick={() => handleStartGame("PARTY", "MEDIUM")}
            badge="New Mode"
          />
        </div>

        {/* Features Highlight */}
        <div className="max-w-5xl mx-auto mb-24">
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureItem 
              icon={<Zap className="w-6 h-6 text-purple-400" />}
              title="Skill-Based Progression"
              desc="Higher difficulty means higher rewards. Master the arena for maximum XP."
            />
            <FeatureItem 
              icon={<Shield className="w-6 h-6 text-blue-400" />}
              title="Secure Storage"
              desc="Your progression is obfuscated and protected. Play with peace of mind."
            />
            <FeatureItem 
              icon={<Flame className="w-6 h-6 text-orange-400" />}
              title="Global Rank"
              desc="Climb from Rookie to Sling Immortal. Every match counts towards your legend."
            />
          </div>
        </div>

        {/* SEO Content Section */}
        <section className="max-w-4xl mx-auto py-16 border-t border-white/5">
          <h2 className="text-3xl font-black text-white italic tracking-tight mb-8 text-center uppercase">
            Why Sling Hockey Pro?
          </h2>
          <div className="grid md:grid-cols-2 gap-12 text-gray-400">
            <div>
              <h3 className="text-white font-bold mb-3 flex items-center gap-2">
                <Target className="w-4 h-4 text-blue-400" /> Professional Tabletop Physics
              </h3>
              <p className="text-sm leading-relaxed font-medium">
                Sling Hockey Pro brings the fastest tabletop sport to your browser with high-precision physics. 
                Whether you call it <strong>Sling Hockey</strong>, <strong>Fastrack</strong>, or <strong>Pucket</strong>, 
                our platform delivers the most authentic slingshot mechanics and puck dynamics found online.
              </p>
            </div>
            <div>
              <h3 className="text-white font-bold mb-3 flex items-center gap-2">
                <PartyPopper className="w-4 h-4 text-pink-400" /> Interactive Party Mode
              </h3>
              <p className="text-sm leading-relaxed font-medium">
                Experience <strong>Party Mode</strong>, featuring dynamic power-ups like Mega Puck, Ghost Puck, and Freeze. 
                This variant adds a tactical layer to the classic tabletop game, making every match unpredictable 
                and high-stakes. Play for free on desktop or mobile.
              </p>
            </div>
          </div>
        </section>
      </main>

      <TutorialModal 
        isOpen={isTutorialOpen} 
        onClose={() => setIsTutorialOpen(false)} 
      />
      <Footer />
    </div>
  );
}

function ModeCard({ title, desc, icon: Icon, color, buttonColor, onClick, badge }) {
  return (
    <div className={`flex-1 p-1 rounded-[40px] bg-gradient-to-br ${color} shadow-2xl transition-transform hover:scale-[1.02] duration-300 group`}>
      <div className="h-full bg-gray-950/40 backdrop-blur-xl rounded-[38px] p-8 flex flex-col relative overflow-hidden">
        {badge && (
          <span className="absolute top-8 right-8 px-3 py-1 bg-white/10 rounded-full text-[10px] font-black uppercase tracking-widest text-white/60">
            {badge}
          </span>
        )}
        
        <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mb-8 border border-white/10 group-hover:scale-110 transition-transform">
          <Icon className="w-8 h-8 text-white" />
        </div>

        <h3 className="text-4xl font-black text-white italic tracking-tighter mb-2">{title}</h3>
        <p className="text-gray-400 font-bold text-sm leading-relaxed mb-10 flex-1">{desc}</p>

        <button 
          onClick={onClick}
          className={`w-full py-5 ${buttonColor} text-gray-950 font-black rounded-3xl text-sm uppercase tracking-[0.2em] shadow-lg hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-3`}
        >
          Enter Arena <TrendingUp className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

function StatCard({ label, value, color, icon }) {
  return (
    <div className="bg-gray-900/50 border border-gray-800 rounded-3xl p-8 text-center backdrop-blur-sm transition-all hover:border-gray-700 group">
      <div className={`text-3xl font-black ${color} mb-1 flex items-center justify-center gap-2 group-hover:scale-110 transition-transform`}>
        {icon}
        {value}
      </div>
      <div className="text-[10px] text-gray-500 font-black uppercase tracking-[0.2em]">{label}</div>
    </div>
  );
}

function FeatureItem({ icon, title, desc }) {
  return (
    <div className="text-center p-8 rounded-[32px] bg-gray-900/40 border border-gray-800/50 hover:bg-gray-900/60 transition-colors">
      <div className="w-16 h-16 bg-gray-800/40 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-gray-700/30">
        {icon}
      </div>
      <h4 className="font-black text-white italic tracking-tight mb-3 text-lg">{title}</h4>
      <p className="text-sm text-gray-500 leading-relaxed font-bold">{desc}</p>
    </div>
  );
}
