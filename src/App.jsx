import { Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import HomePage from "./pages/HomePage";
import GamePage from "./pages/GamePage";
import GameSettingsPage from "./pages/GameSettingsPage";
import ShopPage from "./pages/ShopPage";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import { useGameStore } from "./features/game/store/gameStore";
import { resetGameData } from "./utils/resetGame";
import "./utils/initializeApp"; // Initialize encryption system
import "./index.css";

function App() {
  const { setGameState, startGame } = useGameStore();

  useEffect(() => {
    // Add reset function to window for debugging
    window.resetGameData = resetGameData;
    
    // Electron integration
    if (window.electronAPI) {
      // Handle menu events
      window.electronAPI.onMenuNewGame(() => {
        setGameState("HOME");
      });

      window.electronAPI.onMenuSettings(() => {
        // Navigate to settings or open settings modal
        setGameState("SETTINGS");
      });

      window.electronAPI.onMenuShowTutorial(() => {
        // Show tutorial modal or navigate to tutorial
        setGameState("TUTORIAL");
      });

      // Request notification permission for desktop notifications
      window.electronAPI.requestNotificationPermission();

      // Cleanup listeners on unmount
      return () => {
        window.electronAPI.removeAllListeners('menu-new-game');
        window.electronAPI.removeAllListeners('menu-settings');
        window.electronAPI.removeAllListeners('menu-show-tutorial');
      };
    }
  }, [setGameState]);

  return (
    <div className="min-h-screen bg-gray-900">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/game/:mode" element={<GamePage />} />
        <Route path="/settings" element={<GameSettingsPage />} />
        <Route path="/shop" element={<ShopPage />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<TermsOfService />} />
      </Routes>
    </div>
  );
}

export default App;
