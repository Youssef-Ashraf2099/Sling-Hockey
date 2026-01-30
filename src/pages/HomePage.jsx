import { useNavigate } from "react-router-dom";
import { Bot, Trophy, Zap, Shield, Target, Info, Star, Flame, PartyPopper, TrendingUp, User, Github, Linkedin, Heart, Code, Coffee, Edit3, Check, X, Crown, Gamepad2, Rocket, Skull, Smile, Zap as ZapIcon } from "lucide-react";
import { Button } from "../shared/components/Button";
import { Card } from "../shared/components/Card";
import { useGameStore } from "../features/game/store/gameStore";
import { useShopStore } from "../features/shop/store/shopStore";
import Footer from "../components/layout/Footer";
import { TutorialModal } from "../features/game/components/TutorialModal";
import DebugPanel from "../components/DebugPanel";
import PhysicsTuner from "../components/PhysicsTuner";
import { useState } from "react";

export default function HomePage() {
  const navigate = useNavigate();
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [isSelectingAvatar, setIsSelectingAvatar] = useState(false);
  const [tempName, setTempName] = useState("");
  
  const { 
    gamesPlayed, 
    gamesWon, 
    playerELO, 
    currentStreak, 
    playerLevel, 
    playerXP,
    playerName,
    playerAvatar,
    getXPRequired,
    getPlayerTitle,
    getPlayerTitleColor,
    setDifficulty,
    setPlayerName,
    setPlayerAvatar,
    startGame
  } = useGameStore();
  const { isPro } = useShopStore();

  const handleStartGame = (mode = "PVE", difficulty = "MEDIUM") => {
    setDifficulty(difficulty);
    startGame(mode, difficulty);
    navigate(`/game/pve`);
  };

  const handleEditName = () => {
    setTempName(playerName);
    setIsEditingName(true);
  };

  const handleSaveName = () => {
    if (tempName.trim()) {
      setPlayerName(tempName.trim());
    }
    setIsEditingName(false);
  };

  const handleCancelEdit = () => {
    setTempName("");
    setIsEditingName(false);
  };

  // Available avatar icons
  const avatarIcons = {
    user: { icon: User, color: "from-blue-500 to-purple-600", name: "Default" },
    crown: { icon: Crown, color: "from-yellow-500 to-orange-500", name: "Royal" },
    gamepad: { icon: Gamepad2, color: "from-green-500 to-blue-500", name: "Gamer" },
    rocket: { icon: Rocket, color: "from-purple-500 to-pink-500", name: "Space" },
    skull: { icon: Skull, color: "from-gray-600 to-gray-800", name: "Skull" },
    smile: { icon: Smile, color: "from-yellow-400 to-orange-400", name: "Happy" },
    zap: { icon: ZapIcon, color: "from-yellow-500 to-red-500", name: "Electric" },
    trophy: { icon: Trophy, color: "from-yellow-600 to-yellow-400", name: "Champion" },
    target: { icon: Target, color: "from-red-500 to-pink-500", name: "Sniper" },
    star: { icon: Star, color: "from-purple-400 to-blue-400", name: "Star" },
    flame: { icon: Flame, color: "from-orange-500 to-red-600", name: "Fire" },
    shield: { icon: Shield, color: "from-blue-600 to-indigo-600", name: "Guardian" }
  };

  const handleSelectAvatar = (avatarKey) => {
    setPlayerAvatar(avatarKey);
    setIsSelectingAvatar(false);
  };

  const currentAvatarIcon = avatarIcons[playerAvatar] || avatarIcons.user;

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
            <Button
              variant="secondary"
              size="sm"
              className="flex items-center gap-2 font-bold"
              onClick={() => document.getElementById('profile-section').scrollIntoView({ behavior: 'smooth' })}
            >
              <User className="w-4 h-4" />
              Profile
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

        {/* Profile Section */}
        <section id="profile-section" className="max-w-4xl mx-auto mb-24">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-black text-white italic tracking-tight mb-4 uppercase">
              Player Profile
            </h2>
            <p className="text-gray-400 font-medium">Track your journey to becoming a Sling Hockey legend</p>
          </div>
          
          <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-xl rounded-[32px] border border-gray-700/50 p-8 shadow-2xl">
            <div className="flex flex-col md:flex-row items-center gap-8">
              {/* Avatar & Basic Info */}
              <div className="flex flex-col items-center text-center">
                {/* Avatar with Selection */}
                <div className="relative group mb-4">
                  <div className={`w-24 h-24 bg-gradient-to-br ${currentAvatarIcon.color} rounded-full flex items-center justify-center shadow-lg cursor-pointer transition-transform hover:scale-105`}
                       onClick={() => setIsSelectingAvatar(!isSelectingAvatar)}>
                    <currentAvatarIcon.icon className="w-12 h-12 text-white" />
                  </div>
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-gray-700 hover:bg-gray-600 rounded-full flex items-center justify-center cursor-pointer transition-colors border-2 border-gray-800"
                       onClick={() => setIsSelectingAvatar(!isSelectingAvatar)}>
                    <Edit3 className="w-4 h-4 text-white" />
                  </div>
                </div>

                {/* Avatar Selection Grid */}
                {isSelectingAvatar && (
                  <div className="absolute z-10 bg-gray-800 rounded-2xl p-4 shadow-2xl border border-gray-700 mb-4">
                    <div className="grid grid-cols-4 gap-3 mb-3">
                      {Object.entries(avatarIcons).map(([key, avatar]) => (
                        <button
                          key={key}
                          onClick={() => handleSelectAvatar(key)}
                          className={`w-12 h-12 bg-gradient-to-br ${avatar.color} rounded-lg flex items-center justify-center hover:scale-110 transition-transform ${
                            playerAvatar === key ? 'ring-2 ring-white' : ''
                          }`}
                          title={avatar.name}
                        >
                          <avatar.icon className="w-6 h-6 text-white" />
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={() => setIsSelectingAvatar(false)}
                      className="w-full py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white text-sm font-bold transition-colors"
                    >
                      Close
                    </button>
                  </div>
                )}
                
                {/* Editable Player Name */}
                <div className="mb-2">
                  {isEditingName ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={tempName}
                        onChange={(e) => setTempName(e.target.value)}
                        className="bg-gray-800 text-white px-3 py-1 rounded-lg text-xl font-black text-center border border-gray-600 focus:border-blue-500 focus:outline-none"
                        placeholder="Enter your name"
                        maxLength={20}
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveName();
                          if (e.key === 'Escape') handleCancelEdit();
                        }}
                      />
                      <button
                        onClick={handleSaveName}
                        className="p-1 bg-green-600 hover:bg-green-700 rounded text-white transition-colors"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="p-1 bg-red-600 hover:bg-red-700 rounded text-white transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 group">
                      <h3 className="text-2xl font-black text-white">{playerName}</h3>
                      <button
                        onClick={handleEditName}
                        className="p-1 opacity-0 group-hover:opacity-100 hover:bg-gray-700 rounded transition-all"
                      >
                        <Edit3 className="w-4 h-4 text-gray-400 hover:text-white" />
                      </button>
                    </div>
                  )}
                </div>
                
                <p className={`text-sm font-black uppercase tracking-widest ${playerTitleColor} mb-2`}>
                  {playerTitle}
                </p>
                <div className="px-4 py-2 bg-gray-800/50 rounded-full">
                  <span className="text-yellow-400 font-black text-lg">Level {playerLevel}</span>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="flex-1 grid grid-cols-2 md:grid-cols-3 gap-4">
                <ProfileStat label="ELO Rating" value={playerELO} color="text-green-400" />
                <ProfileStat label="Games Played" value={gamesPlayed} color="text-blue-400" />
                <ProfileStat label="Games Won" value={gamesWon} color="text-purple-400" />
                <ProfileStat label="Win Rate" value={`${winRate}%`} color="text-orange-400" />
                <ProfileStat label="Current Streak" value={currentStreak} color="text-pink-400" />
                <ProfileStat label="Experience" value={Math.floor(playerXP)} color="text-yellow-400" />
              </div>
            </div>

            {/* XP Progress Bar */}
            <div className="mt-8 pt-6 border-t border-gray-700/50">
              <div className="flex justify-between text-sm font-black uppercase tracking-widest mb-3">
                <span className="text-gray-400">Progress to Level {playerLevel + 1}</span>
                <span className="text-gray-400">{Math.floor(playerXP)} / {xpRequired} XP</span>
              </div>
              <div className="h-3 bg-gray-800 rounded-full overflow-hidden border border-gray-700/50">
                <div 
                  className="h-full bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 transition-all duration-1000 shadow-lg" 
                  style={{ width: `${xpProgress}%` }}
                />
              </div>
            </div>
          </div>
        </section>

        {/* About Us Section */}
        <section className="max-w-4xl mx-auto mb-24">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-black text-white italic tracking-tight mb-4 uppercase">
              About the Game
            </h2>
            <p className="text-gray-400 font-medium">Crafted with passion by a solo developer</p>
          </div>
          
          <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-xl rounded-[32px] border border-gray-700/50 p-8 shadow-2xl">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Game Info */}
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-blue-500 rounded-lg flex items-center justify-center">
                    <Target className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-white">Sling Hockey Pro</h3>
                    <p className="text-gray-400 text-sm font-medium">Physics-Based Tabletop Game</p>
                  </div>
                </div>
                
                <p className="text-gray-300 leading-relaxed mb-6 font-medium">
                  Sling Hockey Pro is a modern take on the classic tabletop slingshot game. Built with cutting-edge 
                  web technologies, it features realistic physics, progressive gameplay, and stunning visuals. 
                  Whether you're a casual player or competitive gamer, experience the thrill of precision and strategy.
                </p>

              </div>

              {/* Developer Info */}
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                    <Code className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-white">Solo Developer</h3>
                    <p className="text-gray-400 text-sm font-medium">Youssef Ashraf</p>
                  </div>
                </div>
                
                <p className="text-gray-300 leading-relaxed mb-6 font-medium">
                  Developed entirely by one passionate developer who loves creating engaging gaming experiences. 
                  From concept to deployment, every line of code was crafted with attention to detail and 
                  player experience in mind.
                </p>

                <div className="flex gap-4">
                  <a 
                    href="https://www.linkedin.com/in/youssef-ashraf-5a3167261/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors text-white font-bold text-sm"
                  >
                    <Linkedin className="w-4 h-4" />
                    LinkedIn
                  </a>
                  <a 
                    href="https://github.com/Youssef-Ashraf2099" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors text-white font-bold text-sm"
                  >
                    <Github className="w-4 h-4" />
                    GitHub
                  </a>
                </div>

                <div className="mt-6 p-4 bg-gray-800/50 rounded-lg border border-gray-700/50">
                  <div className="flex items-center gap-2 text-pink-400 mb-2">
                    <Heart className="w-4 h-4" />
                    <span className="font-black text-sm">Made with passion</span>
                  </div>
                  <p className="text-gray-400 text-xs font-medium">
                    Countless hours of development, testing, and refinement went into creating this game. 
                    Thank you for playing and supporting indie game development!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

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
      <DebugPanel />
      <PhysicsTuner />
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

function ProfileStat({ label, value, color }) {
  return (
    <div className="bg-gray-800/30 rounded-lg p-4 text-center border border-gray-700/30">
      <div className={`text-2xl font-black ${color} mb-1`}>{value}</div>
      <div className="text-[10px] text-gray-500 font-black uppercase tracking-[0.2em]">{label}</div>
    </div>
  );
}

function TechBadge({ children }) {
  return (
    <span className="px-3 py-1 bg-gray-700/50 text-gray-300 rounded-full text-xs font-bold border border-gray-600/50">
      {children}
    </span>
  );
}
