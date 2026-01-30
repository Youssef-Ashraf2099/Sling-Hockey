import { useState } from 'react';
import { GAME_CONFIG } from '../core/config/gameConstants';

export default function PhysicsTuner() {
  const [isOpen, setIsOpen] = useState(false);
  const [settings, setSettings] = useState({
    horizontalForceMultiplier: GAME_CONFIG.HORIZONTAL_FORCE_MULTIPLIER || 0.3,
    maxHorizontalOffset: GAME_CONFIG.MAX_HORIZONTAL_OFFSET || 200,
    verticalForceDominance: GAME_CONFIG.VERTICAL_FORCE_DOMINANCE || 4.0,
    forceMultiplier: GAME_CONFIG.FORCE_MULTIPLIER || 0.00002,
  });

  const updateSetting = (key, value) => {
    const newSettings = { ...settings, [key]: parseFloat(value) };
    setSettings(newSettings);
    
    // Update the global config (this is a hack for real-time tuning)
    GAME_CONFIG.HORIZONTAL_FORCE_MULTIPLIER = newSettings.horizontalForceMultiplier;
    GAME_CONFIG.MAX_HORIZONTAL_OFFSET = newSettings.maxHorizontalOffset;
    GAME_CONFIG.VERTICAL_FORCE_DOMINANCE = newSettings.verticalForceDominance;
    GAME_CONFIG.FORCE_MULTIPLIER = newSettings.forceMultiplier;
    
    console.log('Physics updated:', newSettings);
  };

  const resetToDefaults = () => {
    const defaults = {
      horizontalForceMultiplier: 0.3,
      maxHorizontalOffset: 200,
      verticalForceDominance: 4.0,
      forceMultiplier: 0.00002,
    };
    setSettings(defaults);
    Object.keys(defaults).forEach(key => {
      const configKey = key.toUpperCase().replace(/([A-Z])/g, '_$1');
      GAME_CONFIG[configKey] = defaults[key];
    });
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-20 right-4 z-50">
        <button
          onClick={() => setIsOpen(true)}
          className="bg-purple-600 text-white px-3 py-2 rounded text-xs font-bold"
        >
          PHYSICS
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-20 right-4 z-50 bg-black/90 text-white p-4 rounded-lg max-w-sm text-xs">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-purple-400">Physics Tuner</h3>
        <button
          onClick={() => setIsOpen(false)}
          className="text-red-400 hover:text-red-300"
        >
          ✕
        </button>
      </div>
      
      <div className="space-y-3">
        <div>
          <label className="block text-yellow-400 mb-1">Horizontal Force (0.1-1.0)</label>
          <input
            type="range"
            min="0.1"
            max="1.0"
            step="0.1"
            value={settings.horizontalForceMultiplier}
            onChange={(e) => updateSetting('horizontalForceMultiplier', e.target.value)}
            className="w-full"
          />
          <span className="text-gray-400">{settings.horizontalForceMultiplier}</span>
        </div>

        <div>
          <label className="block text-blue-400 mb-1">Max Horizontal Range (100-400)</label>
          <input
            type="range"
            min="100"
            max="400"
            step="50"
            value={settings.maxHorizontalOffset}
            onChange={(e) => updateSetting('maxHorizontalOffset', e.target.value)}
            className="w-full"
          />
          <span className="text-gray-400">{settings.maxHorizontalOffset}</span>
        </div>

        <div>
          <label className="block text-green-400 mb-1">Vertical Dominance (2.0-8.0)</label>
          <input
            type="range"
            min="2.0"
            max="8.0"
            step="0.5"
            value={settings.verticalForceDominance}
            onChange={(e) => updateSetting('verticalForceDominance', e.target.value)}
            className="w-full"
          />
          <span className="text-gray-400">{settings.verticalForceDominance}</span>
        </div>

        <div>
          <label className="block text-orange-400 mb-1">Overall Force (0.00001-0.0001)</label>
          <input
            type="range"
            min="0.00001"
            max="0.0001"
            step="0.00001"
            value={settings.forceMultiplier}
            onChange={(e) => updateSetting('forceMultiplier', e.target.value)}
            className="w-full"
          />
          <span className="text-gray-400">{settings.forceMultiplier.toFixed(5)}</span>
        </div>

        <div className="pt-2 space-y-2">
          <button
            onClick={resetToDefaults}
            className="w-full bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 rounded text-xs font-bold"
          >
            Reset to Defaults
          </button>
          
          <div className="text-xs text-gray-400">
            <div>• Lower Horizontal Force = Less aggressive angles</div>
            <div>• Higher Vertical Dominance = More straight shots</div>
            <div>• Adjust in real-time while playing!</div>
          </div>
        </div>
      </div>
    </div>
  );
}