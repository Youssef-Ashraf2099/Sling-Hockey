import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { soundManager } from "../../../core/audio/SoundManager";

// Simple Obfuscation to prevent easy "progress theft"
const SALT = "sling_hockey_secret_2024";
const obfuscate = (str) => {
  return btoa(str.split('').map((char, i) => 
    String.fromCharCode(char.charCodeAt(0) ^ SALT.charCodeAt(i % SALT.length))
  ).join(''));
};

const deobfuscate = (str) => {
  try {
    const decoded = atob(str);
    return decoded.split('').map((char, i) => 
      String.fromCharCode(char.charCodeAt(0) ^ SALT.charCodeAt(i % SALT.length))
    ).join('');
  } catch (e) {
    return "{}";
  }
};

const encryptedStorage = {
  getItem: (name) => {
    const val = localStorage.getItem(name);
    return val ? JSON.parse(deobfuscate(val)) : null;
  },
  setItem: (name, value) => {
    localStorage.setItem(name, obfuscate(JSON.stringify(value)));
  },
  removeItem: (name) => localStorage.removeItem(name),
};

export const useGameStore = create(
  persist(
    (set, get) => ({
      // Game state
      gameState: "HOME",
      gameMode: "PVE", // 'PVE', 'PARTY'
      difficulty: "MEDIUM",
      
      // Game rules
      gameRule: "OWN_BALLS",
      hideRopeDuringPlay: true,

      // Power-up state
      activePowerUps: {
        slotFrozen: false,
        megaPuckId: null,
        ghostPuckId: null,
        playerFrozen: false,
      },

      // Match info
      player1Score: 0,
      player2Score: 0,
      player1Name: "Player 1",
      player2Name: "AI Opponent",

      // AI/Player states
      aiThinking: false,
      isPlayerPlaying: false,
      isAIPlaying: false,

      // Progression Stats
      playerLevel: 1,
      playerXP: 0,
      playerELO: 1200,
      
      // Last match changes
      xpChange: 0,
      eloChange: 0,

      // Lifetime stats
      gamesPlayed: 0,
      gamesWon: 0,
      gamesLost: 0,
      currentStreak: 0,
      bestStreak: 0,
      totalPucksScored: 0,

      // Match history
      matchHistory: [],

      // Actions
      setGameState: (state) => set({ gameState: state }),
      setDifficulty: (difficulty) => set({ difficulty }),
      setHideRopeDuringPlay: (hide) => set({ hideRopeDuringPlay: hide }),
      setIsPlayerPlaying: (playing) => set({ isPlayerPlaying: playing }),
      setIsAIPlaying: (playing) => set({ isAIPlaying: playing }),

      startGame: (mode = "PVE", difficulty = "MEDIUM") => {
        set({
          gameState: "PLAYING",
          gameMode: mode,
          difficulty,
          player1Score: 0,
          player2Score: 0,
          aiThinking: false,
          isPlayerPlaying: false,
          isAIPlaying: false,
          xpChange: 0,
          eloChange: 0,
          activePowerUps: {
            slotFrozen: false,
            megaPuckId: null,
            ghostPuckId: null,
            playerFrozen: false,
          },
        });
      },

      setPowerUp: (key, value) => {
        set((state) => ({
          activePowerUps: {
            ...state.activePowerUps,
            [key]: value
          }
        }));
      },

      setAiThinking: (thinking) => set({ aiThinking: thinking }),

      scorePoint: (player) => {
        if (player === 1) {
          set((s) => ({
            player1Score: 10,
            totalPucksScored: s.totalPucksScored + 10,
          }));
        } else {
          set((s) => ({
            player2Score: 10,
          }));
        }

        soundManager.playWin();
        get().endGame();
      },

      endGame: () => {
        const {
          player1Score,
          player2Score,
          playerELO,
          playerXP,
          playerLevel,
          difficulty,
          currentStreak,
          bestStreak,
          matchHistory,
        } = get();

        const playerWon = player1Score > player2Score;
        
        // Difficulty Multipliers
        const diffConfig = {
          EASY: { win: { xp: 50, elo: 10 }, loss: { xp: -10, elo: -5 } },
          MEDIUM: { win: { xp: 100, elo: 20 }, loss: { xp: -30, elo: -15 } },
          HARD: { win: { xp: 200, elo: 40 }, loss: { xp: -60, elo: -30 } },
        };

        const config = diffConfig[difficulty] || diffConfig.MEDIUM;
        const xpDelta = playerWon ? config.win.xp : config.loss.xp;
        const eloDelta = playerWon ? config.win.elo : config.loss.elo;

        // Calc new stats
        let newXP = Math.max(0, playerXP + xpDelta);
        let newELO = Math.max(0, playerELO + eloDelta);
        let newLevel = playerLevel;
        const newStreak = playerWon ? currentStreak + 1 : 0;

        // Check for Level Up
        const getXPForLevel = (lvl) => 100 * Math.pow(1.5, lvl - 1);
        while (newXP >= getXPForLevel(newLevel)) {
          newXP -= getXPForLevel(newLevel);
          newLevel++;
          // Optional: Add level up sound?
        }

        const match = {
          id: Date.now(),
          date: new Date().toISOString(),
          mode: get().gameMode,
          difficulty,
          player1Score,
          player2Score,
          result: playerWon ? "WIN" : "LOSS",
          eloChange: eloDelta,
          xpChange: xpDelta,
          eloAfter: newELO,
        };

        const newHistory = [match, ...matchHistory].slice(0, 10);

        set({
          gameState: "RESULT",
          gamesPlayed: get().gamesPlayed + 1,
          gamesWon: playerWon ? get().gamesWon + 1 : get().gamesWon,
          gamesLost: !playerWon ? get().gamesLost + 1 : get().gamesLost,
          playerELO: newELO,
          playerXP: newXP,
          playerLevel: newLevel,
          eloChange: eloDelta,
          xpChange: xpDelta,
          currentStreak: newStreak,
          bestStreak: Math.max(bestStreak, newStreak),
          matchHistory: newHistory,
        });
      },

      resetGame: () => {
        set({
          gameState: "HOME",
          player1Score: 0,
          player2Score: 0,
          eloChange: 0,
          xpChange: 0,
          aiThinking: false,
          activePowerUps: {
            slotFrozen: false,
            megaPuckId: null,
            ghostPuckId: null,
            playerFrozen: false,
          }
        });
      },

      updateTurnTime: () => {},

      getWinRate: () => {
        const { gamesPlayed, gamesWon } = get();
        return gamesPlayed > 0 ? Math.round((gamesWon / gamesPlayed) * 100) : 0;
      },

      getXPRequired: () => {
        return Math.floor(100 * Math.pow(1.5, get().playerLevel - 1));
      },

      getPlayerTitle: () => {
        const level = get().playerLevel;
        if (level >= 50) return "Sling Immortal";
        if (level >= 40) return "Sling God";
        if (level >= 35) return "Legend";
        if (level >= 30) return "Grandmaster";
        if (level >= 25) return "Master";
        if (level >= 20) return "Elite";
        if (level >= 15) return "Professional";
        if (level >= 10) return "Semi-Pro";
        if (level >= 5) return "Amateur";
        return "Rookie";
      },

      getPlayerTitleColor: () => {
        const level = get().playerLevel;
        if (level >= 50) return "text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]"; // Immortal
        if (level >= 40) return "text-purple-400 drop-shadow-[0_0_8px_rgba(192,38,211,0.8)]"; // God
        if (level >= 35) return "text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.8)]"; // Legend
        if (level >= 30) return "text-red-400"; // Grandmaster
        if (level >= 25) return "text-orange-400"; // Master
        if (level >= 20) return "text-indigo-400"; // Elite
        if (level >= 15) return "text-blue-400"; // Professional
        if (level >= 10) return "text-emerald-400"; // Semi-Pro
        if (level >= 5) return "text-green-400"; // Amateur
        return "text-gray-400"; // Rookie
      }
    }),
    {
      name: "game-storage-secure", // New name to avoid collision with old data
      storage: encryptedStorage,
    }
  )
);
