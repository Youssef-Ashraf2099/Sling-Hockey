import { create } from "zustand";

export const useGameStore = create((set, get) => ({
  // Game state
  gameState: "HOME", // 'HOME', 'MATCHMAKING', 'PLAYING', 'RESULT'
  gameMode: null, // 'PVP', 'PVE'
  difficulty: "MEDIUM", // 'EASY', 'MEDIUM', 'HARD' for PVE

  // Player info
  currentPlayer: 1, // 1 or 2
  player1Score: 0,
  player2Score: 0,
  player1Name: "Player 1",
  player2Name: "Player 2",

  // Turn management
  turnStartTime: null,
  turnTimeRemaining: 30,

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
      currentPlayer: 1,
      player1Score: 0,
      player2Score: 0,
      turnStartTime: Date.now(),
      turnTimeRemaining: 30,
    });
  },

  switchTurn: () => {
    const current = get().currentPlayer;
    set({
      currentPlayer: current === 1 ? 2 : 1,
      turnStartTime: Date.now(),
      turnTimeRemaining: 30,
    });
  },

  scorePoint: (player) => {
    if (player === 1) {
      set((state) => ({
        player1Score: state.player1Score + 1,
        totalPucksScored: state.totalPucksScored + 1,
      }));
    } else {
      set((state) => ({
        player2Score: state.player2Score + 1,
        totalPucksScored: state.totalPucksScored + 1,
      }));
    }

    // Check for win condition
    const { player1Score, player2Score } = get();
    if (player1Score >= 5 || player2Score >= 5) {
      get().endGame();
    }
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
      currentPlayer: 1,
      player1Score: 0,
      player2Score: 0,
      turnStartTime: null,
      turnTimeRemaining: 30,
      eloChange: 0,
    });
  },

  updateTurnTime: () => {
    const { turnStartTime, turnTimeRemaining } = get();
    if (turnStartTime) {
      const elapsed = Math.floor((Date.now() - turnStartTime) / 1000);
      const remaining = Math.max(0, 30 - elapsed);

      if (remaining !== turnTimeRemaining) {
        set({ turnTimeRemaining: remaining });

        // Auto-switch turn if time runs out
        if (remaining === 0) {
          get().switchTurn();
        }
      }
    }
  },

  // Stats getters
  getWinRate: () => {
    const { gamesPlayed, gamesWon } = get();
    return gamesPlayed > 0 ? Math.round((gamesWon / gamesPlayed) * 100) : 0;
  },
}));
