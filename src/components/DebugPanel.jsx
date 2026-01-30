import { useState } from 'react';
import { useGameStore } from '../features/game/store/gameStore';
import { useShopStore } from '../features/shop/store/shopStore';
import { resetGameData } from '../utils/resetGame';

export default function DebugPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const gameStore = useGameStore();
  const shopStore = useShopStore();

  if (!isOpen) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setIsOpen(true)}
          className="bg-red-600 text-white px-3 py-2 rounded text-xs font-bold"
        >
          DEBUG
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-black/90 text-white p-4 rounded-lg max-w-md max-h-96 overflow-y-auto text-xs">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold">Debug Panel</h3>
        <button
          onClick={() => setIsOpen(false)}
          className="text-red-400 hover:text-red-300"
        >
          ✕
        </button>
      </div>
      
      <div className="space-y-4">
        <div>
          <h4 className="font-semibold text-yellow-400">Game Store:</h4>
          <div className="pl-2 space-y-1">
            <div>Level: {gameStore.playerLevel}</div>
            <div>XP: {gameStore.playerXP}</div>
            <div>ELO: {gameStore.playerELO}</div>
            <div>Games: {gameStore.gamesPlayed}</div>
            <div>Wins: {gameStore.gamesWon}</div>
            <div>Current Rank: {gameStore.getCurrentRank?.()?.title || 'N/A'}</div>
          </div>
        </div>

        <div>
          <h4 className="font-semibold text-blue-400">Shop Store:</h4>
          <div className="pl-2 space-y-1">
            <div>Equipped Skin: {shopStore.equippedSkin}</div>
            <div>Equipped Theme: {shopStore.equippedTheme}</div>
            <div>Purchased Skins: {shopStore.purchasedSkins?.length || 0}</div>
            <div>Purchased Themes: {shopStore.purchasedThemes?.length || 0}</div>
            <div>Is Pro: {shopStore.isPro ? 'Yes' : 'No'}</div>
          </div>
        </div>

        <div>
          <h4 className="font-semibold text-green-400">Storage Keys:</h4>
          <div className="pl-2 space-y-1">
            {Object.keys(localStorage).filter(key => 
              key.includes('sling') || key.includes('game') || key.includes('shop')
            ).map(key => (
              <div key={key} className="text-xs break-all">
                {key}: {localStorage.getItem(key)?.length || 0} chars
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <button
            onClick={() => {
              // Clear ALL localStorage data
              localStorage.clear();
              console.log('All localStorage cleared');
              window.location.reload();
            }}
            className="w-full bg-red-800 hover:bg-red-900 text-white px-3 py-2 rounded text-xs font-bold"
          >
            CLEAR ALL & RELOAD
          </button>
          
          <button
            onClick={resetGameData}
            className="w-full bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded text-xs font-bold"
          >
            Reset All Data
          </button>
          
          <button
            onClick={() => {
              // Clear encryption keys and reset
              localStorage.removeItem('sling_hockey_key_material');
              resetGameData();
            }}
            className="w-full bg-red-800 hover:bg-red-900 text-white px-3 py-2 rounded text-xs font-bold"
          >
            Reset + Clear Encryption
          </button>
          
          <button
            onClick={() => {
              gameStore.resetProgress();
              console.log('Progress reset');
            }}
            className="w-full bg-orange-600 hover:bg-orange-700 text-white px-3 py-2 rounded text-xs font-bold"
          >
            Reset Progress Only
          </button>

          <button
            onClick={() => {
              // Test ELO system
              gameStore.endGame();
              console.log('Test game ended');
            }}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-xs font-bold"
          >
            Test End Game
          </button>

          <button
            onClick={() => {
              // Test encryption
              import('../core/security/encryption').then(({ gameEncryption }) => {
                gameEncryption.encrypt({ test: 'data' }).then(encrypted => {
                  console.log('Encryption test:', encrypted);
                  gameEncryption.decrypt(encrypted).then(decrypted => {
                    console.log('Decryption test:', decrypted);
                  });
                });
              });
            }}
            className="w-full bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded text-xs font-bold"
          >
            Test Encryption
          </button>
        </div>
      </div>
    </div>
  );
}