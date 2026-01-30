// Utility to reset game data and clear cache
export const resetGameData = () => {
  // Clear all localStorage data
  const keysToRemove = [
    'game-storage-secure',
    'sling-hockey-secure-v2',
    'sling-hockey-shop-secure',
    'shop-storage',
    'sling_hockey_key_material'
  ];
  
  keysToRemove.forEach(key => {
    localStorage.removeItem(key);
    localStorage.removeItem(key + '_hash');
  });
  
  console.log('Game data reset complete. Please refresh the page.');
  
  // Force page reload
  window.location.reload();
};

// Add to window for easy access in console
if (typeof window !== 'undefined') {
  window.resetGameData = resetGameData;
}