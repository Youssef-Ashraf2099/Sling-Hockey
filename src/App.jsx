import React, { useState, useRef } from 'react';
import Layout from './Layout';
import SlingHockey from './SlingHockey';
import { AIController } from './GameLogic';
import './index.css';

function App() {
  const [gameState, setGameState] = useState('home'); // 'home', 'playing', 'gameover'
  const [mode, setMode] = useState('pvp'); // 'pvp' or 'pve'
  const [difficulty, setDifficulty] = useState('medium'); // 'easy', 'medium', 'hard'
  const [winner, setWinner] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const aiControllerRef = useRef(null);

  const handleStartGame = () => {
    setGameState('playing');
    setWinner(null);
    setShowSettings(false);
    
    // Initialize AI controller if PVE mode
    if (mode === 'pve') {
      aiControllerRef.current = new AIController(difficulty);
    } else {
      aiControllerRef.current = null;
    }
  };

  const handleGameOver = (winnerName) => {
    setWinner(winnerName);
    setGameState('gameover');
  };

  const handleRestart = () => {
    setGameState('home');
    setWinner(null);
    setShowSettings(false);
  };

  return (
    <Layout
      gameState={gameState}
      onStartGame={handleStartGame}
      onRestart={handleRestart}
      mode={mode}
      setMode={setMode}
      difficulty={difficulty}
      setDifficulty={setDifficulty}
      winner={winner}
      showSettings={showSettings}
      setShowSettings={setShowSettings}
    >
      {gameState === 'playing' && (
        <SlingHockey
          onGameOver={handleGameOver}
          mode={mode}
          difficulty={difficulty}
          aiController={aiControllerRef.current}
        />
      )}
    </Layout>
  );
}

export default App;
