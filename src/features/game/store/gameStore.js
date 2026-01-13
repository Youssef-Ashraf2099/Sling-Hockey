import { create } from "zustand";
import { persist } from "zustand/middleware";
import { soundManager } from "../../../core/audio/SoundManager";

export const useGameStore = create(
  persist(
    (set, get) => ({
      // Game state
      gameState: "HOME", // 'HOME', 'MATCHMAKING', 'PLAYING', 'RESULT'
      gameMode: null, // 'PVP', 'PVE'
      difficulty: "MEDIUM", // 'EASY', 'MEDIUM', 'HARD' for PVE
      
      // Game rules
      gameRule: "OWN_BALLS",
      hideRopeDuringPlay: true,

      // Player info
      player1Score: 0,
      player2Score: 0,
      player1Name: "Player 1",
      player2Name: "AI Opponent",
      pucksCaught: { player1: 0, player2: 0 },

      // AI/Player states
      aiThinking: false,
      isPlayerPlaying: false,
      isAIPlaying: false,

      // Game stats
      gamesPlayed: 0,
      gamesWon: 0,
      gamesLost: 0,
      currentStreak: 0,
      bestStreak: 0,
      totalPucksScored: 0,

      // ELO rating
      playerELO: 1200,
      eloChange: 0,

      // Match history
      matchHistory: [],

      // Actions
      setGameState: (state) => set({ gameState: state }),
      setGameMode: (mode) => set({ gameMode: mode }),
      setDifficulty: (difficulty) => set({ difficulty }),
      setGameRule: (rule) => set({ gameRule: rule }),
      setHideRopeDuringPlay: (hide) => set({ hideRopeDuringPlay: hide }),
      setIsPlayerPlaying: (playing) => set({ isPlayerPlaying: playing }),
      setIsAIPlaying: (playing) => set({ isAIPlaying: playing }),

      startGame: (mode, difficulty = "MEDIUM", rule = "OWN_BALLS") => {
        set({
          gameState: "PLAYING",
          gameMode: mode,
          difficulty,
          gameRule: rule,
          player1Score: 0,
          player2Score: 0,
          pucksCaught: { player1: 0, player2: 0 },
          aiThinking: false,
          isPlayerPlaying: false,
          isAIPlaying: false,
        });
      },

      setAiThinking: (thinking) => set({ aiThinking: thinking }),

      scorePoint: (player) => {
        const state = get();
        if (player === 1) {
          set((s) => ({
            player1Score: 10, // Indicated win
            totalPucksScored: s.totalPucksScored + 10,
          }));
        } else {
          set((s) => ({
            player2Score: 10,
            totalPucksScored: s.totalPucksScored + 10,
          }));
        }

        // Play win sound
        soundManager.playWin();
        get().endGame();
      },

      endGame: () => {
        const {
          player1Score,
          player2Score,
          playerELO,
          currentStreak,
          bestStreak,
          matchHistory,
          gameMode,
        } = get();

        const playerWon = player1Score > player2Score;
        const eloChange = playerWon
          ? Math.floor(Math.random() * 15 + 10)
          : -Math.floor(Math.random() * 15 + 5);
        const newELO = Math.max(0, playerELO + eloChange);
        const newStreak = playerWon ? currentStreak + 1 : 0;

        const match = {
          id: Date.now(),
          date: new Date().toISOString(),
          mode: gameMode,
          player1Score,
          player2Score,
          result: playerWon ? "WIN" : "LOSS",
          eloChange,
          eloBefore: playerELO,
          eloAfter: newELO,
        };

        const newHistory = [match, ...matchHistory].slice(0, 10);

        set({
          gameState: "RESULT",
          gamesPlayed: get().gamesPlayed + 1,
          gamesWon: playerWon ? get().gamesWon + 1 : get().gamesWon,
          gamesLost: !playerWon ? get().gamesLost + 1 : get().gamesLost,
          playerELO: newELO,
          eloChange,
          currentStreak: newStreak,
          bestStreak: Math.max(bestStreak, newStreak),
          matchHistory: newHistory,
        });
      },

      resetGame: () => {
        set({
          gameState: "HOME",
          gameMode: null,
          player1Score: 0,
          player2Score: 0,
          pucksCaught: { player1: 0, player2: 0 },
          eloChange: 0,
          aiThinking: false,
        });
      },

      updateTurnTime: () => {
        // No-op in continuous play mode
      },

      // Stats getters
      getWinRate: () => {
        const { gamesPlayed, gamesWon } = get();
        return gamesPlayed > 0 ? Math.round((gamesWon / gamesPlayed) * 100) : 0;
      },
    }),
    {
      name: "game-storage",
    }
  )
);
