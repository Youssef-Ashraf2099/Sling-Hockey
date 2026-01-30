import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { soundManager } from "../../../core/audio/SoundManager";
// import { secureStorage } from "../../../core/security/encryption"; // Temporarily disabled

// Simple storage adapter (no encryption) to fix freezing issue
const simpleStorageAdapter = {
  getItem: (name) => {
    try {
      const item = localStorage.getItem(name);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error('Storage getItem error:', error);
      return null;
    }
  },
  setItem: (name, value) => {
    try {
      localStorage.setItem(name, JSON.stringify(value));
    } catch (error) {
      console.error('Storage setItem error:', error);
    }
  },
  removeItem: (name) => {
    try {
      localStorage.removeItem(name);
    } catch (error) {
      console.error('Storage removeItem error:', error);
    }
  }
};

// Enhanced ELO system with proper rating calculations
const ELO_CONFIG = {
  BASE_RATING: 1200,
  K_FACTOR: {
    EASY: { win: 15, loss: 10 },
    MEDIUM: { win: 25, loss: 20 },
    HARD: { win: 40, loss: 35 }
  },
  RATING_RANGES: {
    BRONZE: { min: 0, max: 1199, title: "Bronze", color: "#cd7f32" },
    SILVER: { min: 1200, max: 1399, title: "Silver", color: "#c0c0c0" },
    GOLD: { min: 1400, max: 1599, title: "Gold", color: "#ffd700" },
    PLATINUM: { min: 1600, max: 1799, title: "Platinum", color: "#e5e4e2" },
    DIAMOND: { min: 1800, max: 1999, title: "Diamond", color: "#b9f2ff" },
    MASTER: { min: 2000, max: 2199, title: "Master", color: "#ff6b6b" },
    GRANDMASTER: { min: 2200, max: 2399, title: "Grandmaster", color: "#8b5cf6" },
    LEGEND: { min: 2400, max: 9999, title: "Legend", color: "#fbbf24" }
  }
};

// Calculate ELO change based on result and difficulty
const calculateEloChange = (currentElo, won, difficulty) => {
  const kFactor = ELO_CONFIG.K_FACTOR[difficulty];
  const change = won ? kFactor.win : -kFactor.loss;
  
  // Adjust based on current rating (higher rated players lose more, gain less)
  const ratingMultiplier = currentElo > 1600 ? 0.8 : 1.0;
  
  return Math.round(change * ratingMultiplier);
};

// Get rank info from ELO rating
const getRankFromElo = (elo) => {
  for (const [rank, config] of Object.entries(ELO_CONFIG.RATING_RANGES)) {
    if (elo >= config.min && elo <= config.max) {
      return { rank, ...config };
    }
  }
  return ELO_CONFIG.RATING_RANGES.BRONZE;
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
        console.log('🎮 endGame() called');
        
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
          gamesPlayed,
          gamesWon,
          gamesLost,
        } = get();

        console.log('📊 Game state:', { player1Score, player2Score, playerELO, playerLevel });

        const playerWon = player1Score > player2Score;
        console.log('🏆 Player won:', playerWon);
        
        // Enhanced ELO calculation
        const eloChange = calculateEloChange(playerELO, playerWon, difficulty);
        const newELO = Math.max(0, playerELO + eloChange);
        console.log('📈 ELO change:', eloChange, 'New ELO:', newELO);
        
        // Enhanced XP calculation with level scaling
        const baseXP = {
          EASY: { win: 50, loss: -10 },
          MEDIUM: { win: 100, loss: -30 },
          HARD: { win: 200, loss: -60 }
        };
        
        const xpConfig = baseXP[difficulty] || baseXP.MEDIUM;
        const levelMultiplier = 1 + (playerLevel - 1) * 0.1; // More XP needed at higher levels
        const xpDelta = Math.round((playerWon ? xpConfig.win : xpConfig.loss) * levelMultiplier);
        let newXP = Math.max(0, playerXP + xpDelta); // Changed to let
        console.log('⭐ XP change:', xpDelta, 'New XP:', newXP);

        // Level progression
        let newLevel = playerLevel;
        let leveledUp = false;
        const getXPForLevel = (lvl) => Math.round(100 * Math.pow(1.5, lvl - 1));
        
        while (newXP >= getXPForLevel(newLevel)) {
          console.log('🆙 Level up! From', newLevel, 'to', newLevel + 1);
          newXP -= getXPForLevel(newLevel);
          newLevel++;
          leveledUp = true;
        }

        // Play level-up sound if player leveled up
        if (leveledUp) {
          setTimeout(() => soundManager.playLevelUp(), 1000); // Delay for dramatic effect
        }

        // Streak calculation
        const newStreak = playerWon ? currentStreak + 1 : 0;
        const newBestStreak = Math.max(bestStreak, newStreak);
        console.log('🔥 Streak:', newStreak, 'Best:', newBestStreak);

        // Match history entry
        const matchEntry = {
          id: Date.now(),
          date: new Date().toISOString(),
          difficulty,
          playerScore: player1Score,
          aiScore: player2Score,
          won: playerWon,
          xpChange: xpDelta,
          eloChange,
          newELO,
          newLevel,
          streak: newStreak
        };

        // Keep only last 20 matches
        const updatedHistory = [matchEntry, ...matchHistory].slice(0, 20);
        console.log('📚 Match history updated, entries:', updatedHistory.length);

        // Get rank info
        const rankInfo = getRankFromElo(newELO);
        console.log('🏅 New rank:', rankInfo.title);

        console.log('💾 Updating game state...');
        
        try {
          set({
            gameState: "RESULT", // Changed from GAME_OVER to RESULT to show victory modal
            playerXP: newXP,
            playerELO: newELO,
            playerLevel: newLevel,
            currentStreak: newStreak,
            bestStreak: newBestStreak,
            xpChange: xpDelta,
            eloChange,
            gamesPlayed: gamesPlayed + 1,
            gamesWon: playerWon ? gamesWon + 1 : gamesWon,
            gamesLost: playerWon ? gamesLost : gamesLost + 1,
            matchHistory: updatedHistory,
            currentRank: rankInfo
          });
          
          console.log('✅ Game state updated successfully');
        } catch (error) {
          console.error('❌ Error updating game state:', error);
        }

        soundManager.playWin();
        console.log('🎮 endGame() completed');
      },

      // Get current rank information
      getCurrentRank: () => {
        const { playerELO } = get();
        return getRankFromElo(playerELO);
      },

      // Get XP needed for next level
      getXPForNextLevel: () => {
        const { playerLevel } = get();
        return Math.round(100 * Math.pow(1.5, playerLevel - 1));
      },

      // Alias for getXPForNextLevel (for compatibility)
      getXPRequired: () => {
        const { playerLevel } = get();
        return Math.round(100 * Math.pow(1.5, playerLevel - 1));
      },

      // Reset progress (for testing or new game+)
      resetProgress: () => {
        set({
          playerLevel: 1,
          playerXP: 0,
          playerELO: ELO_CONFIG.BASE_RATING,
          gamesPlayed: 0,
          gamesWon: 0,
          gamesLost: 0,
          currentStreak: 0,
          bestStreak: 0,
          totalPucksScored: 0,
          matchHistory: [],
          xpChange: 0,
          eloChange: 0
        });
      },
      updateTurnTime: () => {},

      getWinRate: () => {
        const { gamesPlayed, gamesWon } = get();
        return gamesPlayed > 0 ? Math.round((gamesWon / gamesPlayed) * 100) : 0;
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
    }),
    {
      name: "sling-hockey-game-simple", // New storage key without encryption
      storage: createJSONStorage(() => simpleStorageAdapter),
    }
  )
);
