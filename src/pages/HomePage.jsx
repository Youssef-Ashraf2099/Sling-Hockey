import { useNavigate } from "react-router-dom";
import { Users, Bot, Trophy, Zap, Shield, Target } from "lucide-react";
import { Button } from "../shared/components/Button";
import { Card } from "../shared/components/Card";
import { useGameStore } from "../features/game/store/gameStore";
import { useShopStore } from "../features/shop/store/shopStore";
import Footer from "../components/layout/Footer";
import { TutorialModal } from "../features/game/components/TutorialModal";
import { Info } from "lucide-react";
import { useState } from "react";

export default function HomePage() {
  const navigate = useNavigate();
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);
  const { gamesPlayed, gamesWon, playerELO, currentStreak } = useGameStore();
  const { isPro } = useShopStore();

  const handleModeSelect = (mode) => {
    navigate(`/game/${mode.toLowerCase()}`);
  };

  const winRate =
    gamesPlayed > 0 ? Math.round((gamesWon / gamesPlayed) * 100) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex flex-col">
      {/* Header */}
      <header className="border-b border-gray-700 bg-gray-900/50 backdrop-blur-md">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-blue-500 rounded-lg flex items-center justify-center">
              <Target className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gradient">
                Sling Hockey Pro
              </h1>
              <p className="text-xs text-gray-400">
                Master the fastest tabletop sport
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Button
              variant="secondary"
              size="sm"
              className="hidden md:flex items-center gap-2"
              onClick={() => setIsTutorialOpen(true)}
            >
              <Info className="w-4 h-4" />
              How to Play
            </Button>
            {isPro && (
              <div className="px-3 py-1 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full text-sm font-bold text-white">
                PRO
              </div>
            )}
            <Button
              variant="secondary"
              size="sm"
              onClick={() => navigate("/shop")}
            >
              Shop
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 container mx-auto px-6 py-12">
        <div className="text-center mb-12 animate-fade-in">
          <h2 className="text-5xl md:text-6xl font-bold mb-4 text-gradient">
            Choose Your Battle
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Pull. Aim. Launch. Score your way to victory in the most addictive
            tabletop game online.
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12 max-w-4xl mx-auto">
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-green-400">{playerELO}</div>
            <div className="text-sm text-gray-400">ELO Rating</div>
          </div>
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-blue-400">
              {gamesPlayed}
            </div>
            <div className="text-sm text-gray-400">Games Played</div>
          </div>
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-yellow-400">{winRate}%</div>
            <div className="text-sm text-gray-400">Win Rate</div>
          </div>
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-purple-400">
              {currentStreak}
            </div>
            <div className="text-sm text-gray-400">Win Streak</div>
          </div>
        </div>

        {/* Game Mode Selection */}
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-12">
          {/* PVP Mode */}
          <Card
            hover
            onClick={() => handleModeSelect("PVP")}
            className="relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-green-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Users className="w-9 h-9 text-white" />
                </div>
                <div className="px-3 py-1 bg-green-600/20 text-green-400 rounded-full text-sm font-semibold">
                  Local Multiplayer
                </div>
              </div>

              <h3 className="text-2xl font-bold mb-2 text-white">
                Player vs Player
              </h3>
              <p className="text-gray-400 mb-6">
                Challenge a friend on the same device. Test your skills in
                head-to-head combat. Perfect for game nights and competitions.
              </p>

              <div className="space-y-2 mb-6">
                <div className="flex items-center gap-2 text-sm text-gray-300">
                  <Zap className="w-4 h-4 text-green-400" />
                  <span>Real-time competitive gameplay</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-300">
                  <Trophy className="w-4 h-4 text-green-400" />
                  <span>Local leaderboard tracking</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-300">
                  <Target className="w-4 h-4 text-green-400" />
                  <span>Best of 5 pucks wins</span>
                </div>
              </div>

              <Button className="w-full" variant="primary">
                Play Local PVP
              </Button>
            </div>
          </Card>

          {/* PVE Mode */}
          <Card
            hover
            onClick={() => handleModeSelect("PVE")}
            className="relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Bot className="w-9 h-9 text-white" />
                </div>
                <div className="px-3 py-1 bg-blue-600/20 text-blue-400 rounded-full text-sm font-semibold">
                  Single Player
                </div>
              </div>

              <h3 className="text-2xl font-bold mb-2 text-white">
                Player vs AI
              </h3>
              <p className="text-gray-400 mb-6">
                Practice against intelligent AI opponents. Choose from 3
                difficulty levels and improve your strategy.
              </p>

              <div className="space-y-2 mb-6">
                <div className="flex items-center gap-2 text-sm text-gray-300">
                  <Shield className="w-4 h-4 text-blue-400" />
                  <span>3 difficulty levels (Easy, Medium, Hard)</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-300">
                  <Trophy className="w-4 h-4 text-blue-400" />
                  <span>Earn ELO and climb rankings</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-300">
                  <Zap className="w-4 h-4 text-blue-400" />
                  <span>Perfect for solo practice</span>
                </div>
              </div>

              <Button className="w-full" variant="primary">
                Play vs AI
              </Button>
            </div>
          </Card>
        </div>

        {/* Features Highlight */}
        <div className="max-w-5xl mx-auto">
          <h3 className="text-2xl font-bold text-center mb-8 text-white">
            Why Players Love Sling Hockey Pro
          </h3>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="w-6 h-6 text-purple-400" />
              </div>
              <h4 className="font-bold text-white mb-2">Instant Action</h4>
              <p className="text-sm text-gray-400">
                Jump into matches instantly. No waiting, just pure gameplay.
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-pink-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trophy className="w-6 h-6 text-pink-400" />
              </div>
              <h4 className="font-bold text-white mb-2">
                Competitive Rankings
              </h4>
              <p className="text-sm text-gray-400">
                Climb the global leaderboard. Track your ELO and win streak.
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-orange-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="w-6 h-6 text-orange-400" />
              </div>
              <h4 className="font-bold text-white mb-2">Customization</h4>
              <p className="text-sm text-gray-400">
                Unlock premium puck skins and board themes in the shop.
              </p>
            </div>
          </div>
        </div>
      </main>

      <TutorialModal 
        isOpen={isTutorialOpen} 
        onClose={() => setIsTutorialOpen(false)} 
      />
      
      {/* Footer */}
      <Footer />
    </div>
  );
}
