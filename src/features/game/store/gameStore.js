import { create } from "zustand";

export const useGameStore = create((set, get) => ({
  // Game state
  gameState: "HOME", // 'HOME', 'MATCHMAKING', 'PLAYING', 'RESULT'
  gameMode: null, // 'PVP', 'PVE'
  difficulty: "MEDIUM", // 'EASY', 'MEDIUM', 'HARD' for PVE

  // Player info
  player1Score: 0, // Number of pucks scored
  player2Score: 0, // Number of pucks scored
  player1Name: "Player 1",
  player2Name: "AI Opponent",
  pucksCaught: { player1: 0, player2: 0 }, // Track which pucks have reached opponent side

  // Game state (CONTINUOUS PLAY - NO TURNS)
  aiThinking: false, // AI is calculating next move

  // Game stats
  gamesPlayed: 0,
  gamesWon: 0,
  gamesLost: 0,
  currentStreak: 0,
  bestStreak: 0,
  totalPucksScored: 0,

  // ELO rating (mock for now)
  playerELO: 1200,
  eloChange: 0,

  // Match history (last 10 games)
  matchHistory: [],

  // Actions
  setGameState: (state) => set({ gameState: state }),

  setGameMode: (mode) => set({ gameMode: mode }),

  setDifficulty: (difficulty) => set({ difficulty }),

  startGame: (mode, difficulty = "MEDIUM") => {
    set({
      gameState: "PLAYING",
      gameMode: mode,
      difficulty,
      player1Score: 0,
      player2Score: 0,
      pucksCaught: { player1: 0, player2: 0 },
      aiThinking: false,
    });
  },

  // Set AI thinking state
  setAiThinking: (thinking) => set({ aiThinking: thinking }),

  // No turns - continuous play - fastest player wins
  switchTurn: () => {
    // DISABLED - Game is continuous, fastest player to score 10 wins
  },

  scorePoint: (player) => {
    const state = get();

    // In the new system, scoring means winning (all balls on opponent side)
    // So we immediately end the game
    if (player === 1) {
      set((s) => ({
        player1Score: 5, // Set to max to indicate win
        totalPucksScored: s.totalPucksScored + 5,
      }));
    } else {
      set((s) => ({
        player2Score: 5, // Set to max to indicate win
        totalPucksScored: s.totalPucksScored + 5,
      }));
    }

    // Immediately end game - player has won
    const newState = get();
    newState.endGame();
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

    // Add to match history
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

    const newHistory = [match, ...matchHistory].slice(0, 10); // Keep last 10

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
      turnStartTime: null,
      turnTimeRemaining: 30,
      eloChange: 0,
      aiThinking: false,
    });
  },

  updateTurnTime: () => {
    // DISABLED - No turn system, continuous play only
  },

  // Stats getters
  getWinRate: () => {
    const { gamesPlayed, gamesWon } = get();
    return gamesPlayed > 0 ? Math.round((gamesWon / gamesPlayed) * 100) : 0;
  },
}));
