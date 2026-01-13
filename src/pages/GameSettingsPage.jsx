import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGameStore } from "../features/game/store/gameStore";

export default function GameSettingsPage() {
  const navigate = useNavigate();
  const { setGameMode, setDifficulty, setGameRule, setHideRopeDuringPlay } = useGameStore();
  const [gameMode, setLocalGameMode] = useState("PVE");
  const [difficulty, setLocalDifficulty] = useState("MEDIUM");
  const [gameRule, setLocalGameRule] = useState("OWN_BALLS");
  const [hideRope, setLocalHideRope] = useState(true);

  const handleStartGame = () => {
    setGameMode(gameMode);
    setDifficulty(difficulty);
    setGameRule(gameRule);
    setHideRopeDuringPlay(hideRope);
    navigate("/game");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-2xl shadow-2xl p-8 max-w-md w-full">
        <h1 className="text-4xl font-bold text-white mb-8 text-center">Game Settings</h1>

        {/* Game Mode */}
        <div className="mb-8">
          <label className="block text-white font-semibold mb-3">Game Mode</label>
          <div className="space-y-2">
            {["PVE", "PVP"].map((mode) => (
              <button
                key={mode}
                onClick={() => setLocalGameMode(mode)}
                className={`w-full py-2 px-4 rounded-lg font-semibold transition ${
                  gameMode === mode
                    ? "bg-green-600 text-white"
                    : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                }`}
              >
                {mode === "PVE" ? "vs AI" : "vs Player"}
              </button>
            ))}
          </div>
        </div>

        {/* Difficulty (only for PVE) */}
        {gameMode === "PVE" && (
          <div className="mb-8">
            <label className="block text-white font-semibold mb-3">AI Difficulty</label>
            <div className="space-y-2">
              {["EASY", "MEDIUM", "HARD"].map((level) => (
                <button
                  key={level}
                  onClick={() => setLocalDifficulty(level)}
                  className={`w-full py-2 px-4 rounded-lg font-semibold transition ${
                    difficulty === level
                      ? "bg-blue-600 text-white"
                      : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Game Rule */}
        <div className="mb-8">
          <label className="block text-white font-semibold mb-3">Win Condition</label>
          <div className="space-y-2">
            <button
              onClick={() => setLocalGameRule("OWN_BALLS")}
              className={`w-full py-3 px-4 rounded-lg font-semibold transition text-left ${
                gameRule === "OWN_BALLS"
                  ? "bg-purple-600 text-white"
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              }`}
            >
              <div className="font-bold">Move All Your Balls</div>
              <div className="text-xs">Get all 5 of your balls to opponent side</div>
            </button>
            <button
              onClick={() => setLocalGameRule("ALL_BALLS")}
              className={`w-full py-3 px-4 rounded-lg font-semibold transition text-left ${
                gameRule === "ALL_BALLS"
                  ? "bg-purple-600 text-white"
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              }`}
            >
              <div className="font-bold">Collect All Balls</div>
              <div className="text-xs">Get all 10 balls to your side (both colors)</div>
            </button>
          </div>
        </div>

        {/* Hide Rope During Play */}
        <div className="mb-8">
          <label className="block text-white font-semibold mb-3">Rope Visibility</label>
          <button
            onClick={() => setLocalHideRope(!hideRope)}
            className={`w-full py-3 px-4 rounded-lg font-semibold transition ${
              hideRope
                ? "bg-red-600 text-white"
                : "bg-green-600 text-white"
            }`}
          >
            {hideRope ? "Hide rope when opponent plays" : "Show rope always"}
          </button>
        </div>

        {/* Start Button */}
        <button
          onClick={handleStartGame}
          className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-bold py-3 px-6 rounded-lg transition transform hover:scale-105"
        >
          Start Game
        </button>

        {/* Back Button */}
        <button
          onClick={() => navigate("/")}
          className="w-full mt-4 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-6 rounded-lg transition"
        >
          Back
        </button>
      </div>
    </div>
  );
}
