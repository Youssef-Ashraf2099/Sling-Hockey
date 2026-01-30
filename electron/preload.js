const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // App info
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  
  // File operations
  showSaveDialog: () => ipcRenderer.invoke('show-save-dialog'),
  showOpenDialog: () => ipcRenderer.invoke('show-open-dialog'),
  
  // Menu events
  onMenuNewGame: (callback) => ipcRenderer.on('menu-new-game', callback),
  onMenuSettings: (callback) => ipcRenderer.on('menu-settings', callback),
  onMenuShowTutorial: (callback) => ipcRenderer.on('menu-show-tutorial', callback),
  
  // Remove listeners
  removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel),
  
  // Platform info
  platform: process.platform,
  
  // Game-specific features
  isElectron: true,
  
  // Notification support
  showNotification: (title, body) => {
    if (Notification.permission === 'granted') {
      new Notification(title, { body });
    }
  },
  
  // Request notification permission
  requestNotificationPermission: async () => {
    return await Notification.requestPermission();
  }
});

// Security: Remove node integration
delete window.require;
delete window.exports;
delete window.module;