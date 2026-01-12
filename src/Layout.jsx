import React from "react";
import { Settings, Trophy, Zap, Target } from "lucide-react";

const Layout = ({
  children,
  gameState,
  onStartGame,
  onRestart,
  mode,
  setMode,
  difficulty,
  setDifficulty,
  winner,
  showSettings,
  setShowSettings,
}) => {
  return (
    <div className="relative w-full h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* SEO Optimized Header */}
      <header className="absolute top-0 left-0 right-0 z-10 p-4 bg-gradient-to-b from-black/60 to-transparent">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold text-white text-center font-game tracking-wider drop-shadow-lg">
            🏒 3D Sling Hockey
          </h1>
          <h2 className="text-sm md:text-base text-gray-300 text-center mt-1 drop-shadow">
            Online Pucket Game • Physics-Based 3D Hockey Challenge
          </h2>
        </div>
      </header>

      {/* Settings Button */}
      {gameState === "playing" && (
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="absolute top-20 right-4 z-20 p-3 bg-white/10 backdrop-blur-md rounded-full hover:bg-white/20 transition-all"
        >
          <Settings className="w-6 h-6 text-white" />
        </button>
      )}

      {/* Main Game Canvas */}
      <main className="relative w-full h-full">{children}</main>

      {/* Homepage Overlay */}
      {gameState === "home" && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-8 rounded-2xl shadow-2xl max-w-md w-full mx-4 border border-white/10">
            <div className="text-center mb-8">
              <Trophy className="w-16 h-16 text-yellow-400 mx-auto mb-4 animate-pulse" />
              <h3 className="text-2xl font-bold text-white mb-2">
                Choose Game Mode
              </h3>
              <p className="text-gray-400 text-sm">Clear your side to win!</p>
            </div>

            {/* Mode Selection */}
            <div className="space-y-4 mb-6">
              <button
                onClick={() => setMode("pvp")}
                className={`w-full p-4 rounded-xl transition-all flex items-center justify-between ${
                  mode === "pvp"
                    ? "bg-gradient-to-r from-blue-600 to-blue-700 shadow-lg scale-105"
                    : "bg-slate-700 hover:bg-slate-600"
                }`}
              >
                <span className="text-white font-semibold flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  Player vs Player
                </span>
                {mode === "pvp" && (
                  <div className="w-3 h-3 bg-white rounded-full"></div>
                )}
              </button>

              <button
                onClick={() => setMode("pve")}
                className={`w-full p-4 rounded-xl transition-all flex items-center justify-between ${
                  mode === "pve"
                    ? "bg-gradient-to-r from-red-600 to-red-700 shadow-lg scale-105"
                    : "bg-slate-700 hover:bg-slate-600"
                }`}
              >
                <span className="text-white font-semibold flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Player vs AI
                </span>
                {mode === "pve" && (
                  <div className="w-3 h-3 bg-white rounded-full"></div>
                )}
              </button>
            </div>

            {/* AI Difficulty Selection */}
            {mode === "pve" && (
              <div className="mb-6 p-4 bg-slate-700/50 rounded-xl">
                <label className="block text-white text-sm font-semibold mb-3">
                  AI Difficulty
                </label>
                <div className="flex gap-2">
                  {["easy", "medium", "hard"].map((level) => (
                    <button
                      key={level}
                      onClick={() => setDifficulty(level)}
                      className={`flex-1 py-2 px-3 rounded-lg text-sm font-semibold transition-all ${
                        difficulty === level
                          ? "bg-gradient-to-r from-green-600 to-green-700 text-white shadow-lg scale-105"
                          : "bg-slate-600 text-gray-300 hover:bg-slate-500"
                      }`}
                    >
                      {level.charAt(0).toUpperCase() + level.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Start Button */}
            <button
              onClick={onStartGame}
              className="w-full py-4 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-xl hover:scale-105"
            >
              START GAME
            </button>

            {/* AdSense Banner Placeholder */}
            <div className="mt-6 p-4 bg-gray-800/50 rounded-lg text-center border border-dashed border-gray-600">
              <p className="text-gray-500 text-xs">AdSense Banner 300x250</p>
            </div>
          </div>
        </div>
      )}

      {/* Game Over Modal */}
      {gameState === "gameover" && winner && (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/80 backdrop-blur-md animate-in fade-in duration-500">
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-10 rounded-2xl shadow-2xl max-w-lg w-full mx-4 border-2 border-yellow-400/50">
            <div className="text-center">
              <Trophy className="w-20 h-20 text-yellow-400 mx-auto mb-6 animate-bounce" />
              <h3 className="text-4xl font-black text-white mb-2">
                {winner === "player1"
                  ? "🎉 Player 1 Wins!"
                  : winner === "player2"
                  ? "🎉 Player 2 Wins!"
                  : winner === "ai"
                  ? "🤖 AI Wins!"
                  : "🏆 You Win!"}
              </h3>
              <p className="text-gray-400 mb-8">
                All pucks cleared from your side!
              </p>

              {/* AdSense Banner Placeholder */}
              <div className="mb-6 p-8 bg-gray-800/50 rounded-lg border border-dashed border-gray-600">
                <p className="text-gray-500 text-sm">AdSense Banner 300x250</p>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={onRestart}
                  className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-xl hover:scale-105"
                >
                  Play Again
                </button>
                <button
                  onClick={() => window.location.reload()}
                  className="flex-1 py-3 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-500 hover:to-gray-600 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-xl hover:scale-105"
                >
                  Main Menu
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Settings Panel */}
      {showSettings && gameState === "playing" && (
        <div className="absolute top-32 right-4 z-30 bg-slate-800/95 backdrop-blur-md p-6 rounded-xl shadow-2xl border border-white/10 min-w-[250px]">
          <h4 className="text-white font-bold mb-4 flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Settings
          </h4>
          <div className="space-y-3">
            <div className="text-sm">
              <p className="text-gray-400">
                Mode:{" "}
                <span className="text-white font-semibold">
                  {mode === "pvp" ? "PVP" : "PVE"}
                </span>
              </p>
              {mode === "pve" && (
                <p className="text-gray-400">
                  Difficulty:{" "}
                  <span className="text-white font-semibold capitalize">
                    {difficulty}
                  </span>
                </p>
              )}
            </div>
            <button
              onClick={onRestart}
              className="w-full py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-lg transition-all"
            >
              Restart Game
            </button>
          </div>
        </div>
      )}

      {/* Footer with SEO Content */}
      <footer className="absolute bottom-0 left-0 right-0 z-10 p-2 bg-gradient-to-t from-black/60 to-transparent">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-xs text-gray-400">
            3D Sling Hockey © 2026 | Play the best online Pucket game with
            realistic physics
          </p>
        </div>

        {/* Bottom AdSense Banner Placeholder */}
        <div className="mt-2 mx-auto max-w-[728px] p-3 bg-gray-900/50 rounded-lg text-center border border-dashed border-gray-700">
          <p className="text-gray-600 text-xs">AdSense Banner 728x90</p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
