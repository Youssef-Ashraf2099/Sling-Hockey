import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Home, Settings, Trophy, ShoppingBag, Menu } from "lucide-react";
import GameBoard from "../features/game/components/GameBoard";
import DifficultySelector from "../features/game/components/DifficultySelector";
import { useGameStore } from "../features/game/store/gameStore";
import { useShopStore } from "../features/shop/store/shopStore";
import { Button } from "../shared/components/Button";
import { Card } from "../shared/components/Card";

export default function GamePage() {
  const { mode } = useParams();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showDifficultySelector, setShowDifficultySelector] = useState(false);

  const {
    gameState,
    player1Score,
    player2Score,
    turnTimeRemaining,
    playerELO,
    startGame,
    setDifficulty,
    resetGame,
    eloChange,
    player1Name,
    player2Name,
  } = useGameStore();

  const { isPro, getCurrentThemeData } = useShopStore();

  useEffect(() => {
    if (mode && gameState === "HOME") {
      // For PVE, show difficulty selector first
      if (mode.toUpperCase() === "PVE") {
        setShowDifficultySelector(true);
      } else {
        // For PVP, start immediately
        startGame(mode.toUpperCase());
      }
    }
  }, [mode, gameState, startGame]);

  const handleDifficultySelect = (difficulty) => {
    setDifficulty(difficulty);
    setShowDifficultySelector(false);
    startGame(mode.toUpperCase(), difficulty);
  };

  const handleBackHome = () => {
    resetGame();
    navigate("/");
  };

  const themeData = getCurrentThemeData();

  return (
    <div className="h-screen bg-gray-900 overflow-hidden">
      {/* 3-Column Dashboard Layout */}
      <div className="h-full grid grid-cols-1 lg:grid-cols-[240px_1fr_320px]">
        {/* Left Sidebar - Navigation */}
        <aside
          className={`bg-gray-900 border-r border-gray-800 p-4 flex flex-col lg:flex ${
            sidebarOpen ? "block" : "hidden lg:block"
          }`}
        >
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-500 rounded-lg flex items-center justify-center">
              <Trophy className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-white">Sling Hockey</h2>
              <p className="text-xs text-gray-400">
                {mode?.toUpperCase()} Mode
              </p>
            </div>
          </div>

          <nav className="space-y-2 flex-1">
            <button
              onClick={handleBackHome}
              className="sidebar-nav-item w-full"
            >
              <Home className="w-5 h-5" />
              <span>Home</span>
            </button>

            <button
              onClick={() => navigate("/leaderboard")}
              className="sidebar-nav-item w-full"
            >
              <Trophy className="w-5 h-5" />
              <span>Leaderboard</span>
            </button>

            <button
              onClick={() => navigate("/shop")}
              className="sidebar-nav-item w-full"
            >
              <ShoppingBag className="w-5 h-5" />
              <span>Shop</span>
            </button>

            <button className="sidebar-nav-item w-full">
              <Settings className="w-5 h-5" />
              <span>Settings</span>
            </button>
          </nav>

          {/* Player Profile */}
          <div className="mt-auto pt-4 border-t border-gray-800">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold">
                P1
              </div>
              <div>
                <div className="font-semibold text-white">{player1Name}</div>
                <div className="text-sm text-gray-400">ELO: {playerELO}</div>
              </div>
            </div>

            {isPro && (
              <div className="mt-3 px-3 py-2 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/50 rounded-lg text-center">
                <div className="text-xs font-bold text-yellow-400">
                  PRO MEMBER
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* Center - Game Board */}
        <main className="bg-gray-800 flex flex-col">
          {/* Mobile Header */}
          <div className="lg:hidden flex items-center justify-between p-4 border-b border-gray-700">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-gray-700 rounded-lg"
            >
              <Menu className="w-6 h-6 text-gray-300" />
            </button>
            <div className="text-white font-bold">
              {mode?.toUpperCase()} Mode
            </div>
            <button
              onClick={handleBackHome}
              className="p-2 hover:bg-gray-700 rounded-lg"
            >
              <Home className="w-6 h-6 text-gray-300" />
            </button>
          </div>

          {/* Game Info Bar */}
          <div className="flex items-center justify-between px-6 py-3 bg-gray-900/50 border-b border-gray-700">
            <div className="flex items-center gap-4">
              <div className="px-4 py-2 rounded-lg bg-green-600">
                <div className="text-white font-bold">
                  {player1Name}: {player1Score}/10
                </div>
              </div>
              <div className="text-gray-400">vs</div>
              <div className="px-4 py-2 rounded-lg bg-gray-700">
                <div className="text-white font-bold">
                  {player2Name}: {player2Score}/10
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="text-sm text-gray-400">
                  First to 10 pucks wins
                </div>
              </div>
            </div>
          </div>

          {/* Game Canvas Container */}
          <div className="flex-1 flex items-center justify-center p-4 md:p-8">
            <GameBoard theme={themeData} />
          </div>
        </main>

        {/* Right Sidebar - Stats & Ads */}
        <aside className="hidden lg:block bg-gray-900 border-l border-gray-800 p-4 overflow-y-auto">
          {/* Ad Space (if not Pro) */}
          {!isPro && (
            <Card className="mb-4 text-center">
              <div className="w-full h-[250px] bg-gray-700 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-600">
                <div>
                  <div className="text-gray-400 text-sm mb-2">
                    Advertisement
                  </div>
                  <div className="text-gray-500 text-xs">300x250</div>
                </div>
              </div>
              <Button
                variant="secondary"
                size="sm"
                className="w-full mt-4"
                onClick={() => navigate("/shop")}
              >
                Remove Ads - Go Pro
              </Button>
            </Card>
          )}

          {/* Live Stats */}
          <Card className="mb-4">
            <h3 className="font-bold text-white mb-4 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-400" />
              Game Stats
            </h3>

            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">Game Type:</span>
                <span className="text-white font-semibold">
                  {mode?.toUpperCase() === "PVE" ? "vs AI" : "vs Player"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Mode:</span>
                <span className="text-white font-semibold">
                  {mode?.toUpperCase()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Your ELO:</span>
                <span className="text-green-400 font-semibold">
                  {playerELO}
                </span>
              </div>
            </div>
          </Card>

          {/* Quick Actions */}
          <Card>
            <h3 className="font-bold text-white mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <Button
                variant="secondary"
                size="sm"
                className="w-full"
                onClick={handleBackHome}
              >
                Exit Game
              </Button>
              <Button
                variant="secondary"
                size="sm"
                className="w-full"
                onClick={() => navigate("/shop")}
              >
                Visit Shop
              </Button>
            </div>
          </Card>

          {/* Leaderboard Preview */}
          <Card className="mt-4">
            <h3 className="font-bold text-white mb-4">Top Players</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center text-xs font-bold">
                    1
                  </div>
                  <span className="text-white">ProGamer</span>
                </div>
                <span className="text-gray-400">2450</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-gray-400 rounded-full flex items-center justify-center text-xs font-bold">
                    2
                  </div>
                  <span className="text-white">SlingStar</span>
                </div>
                <span className="text-gray-400">2380</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-orange-600 rounded-full flex items-center justify-center text-xs font-bold">
                    3
                  </div>
                  <span className="text-white">PuckMaster</span>
                </div>
                <span className="text-gray-400">2310</span>
              </div>
            </div>
          </Card>
        </aside>
      </div>

      {/* Result Modal */}
      {gameState === "RESULT" && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <Card className="max-w-md w-full text-center">
            <h2 className="text-3xl font-bold mb-4 text-white">
              {player1Score > player2Score ? "🎉 Victory!" : "😔 Defeat"}
            </h2>

            <div className="text-6xl font-bold mb-4">
              <span className="text-green-400">{player1Score}</span>
              <span className="text-gray-400 mx-3">-</span>
              <span className="text-red-400">{player2Score}</span>
            </div>

            <div
              className={`text-2xl font-bold mb-6 ${
                eloChange > 0 ? "text-green-400" : "text-red-400"
              }`}
            >
              {eloChange > 0 ? "+" : ""}
              {eloChange} ELO
            </div>

            <div className="text-gray-400 mb-6">
              New Rating:{" "}
              <span className="text-white font-bold">{playerELO}</span>
            </div>

            <div className="flex gap-3">
              <Button
                variant="secondary"
                className="flex-1"
                onClick={handleBackHome}
              >
                Main Menu
              </Button>
              <Button
                variant="primary"
                className="flex-1"
                onClick={() => {
                  resetGame();
                  // Forcing a small delay or navigation if needed, 
                  // but resetGame() setting state to HOME will trigger the start useEffect
                }}
              >
                Play Again
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Difficulty Selector Modal */}
      <DifficultySelector
        isOpen={showDifficultySelector}
        onSelect={handleDifficultySelect}
        gameMode={mode?.toUpperCase()}
      />
    </div>
  );
}
