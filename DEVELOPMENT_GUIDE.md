# Sling Hockey Pro - Development Guide

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Development Mode
```bash
# Web version
npm run dev

# Electron desktop app
npm run electron-dev
```

### 3. Build for Production
```bash
# Web build
npm run build

# Desktop builds
npm run dist-win    # Windows
npm run dist-mac    # macOS
npm run dist-linux  # Linux
npm run dist        # All platforms

# itch.io distribution
node scripts/build-for-itch.js
```

## ✅ Completed Improvements

### 1. Physics Fix ✅
- **Issue**: Balls launched forward when pulled to sides
- **Fix**: Corrected force vector calculation in `GameBoard.jsx`
- **Result**: Proper slingshot physics - balls launch opposite to drag direction

### 2. Enhanced ELO System ✅
- **Added**: Chess-style ranking with 8 tiers (Bronze → Legend)
- **Features**: Difficulty-based multipliers, proper K-factor calculations
- **Location**: `src/features/game/store/gameStore.js`

### 3. Secure Encryption ✅
- **Upgraded**: From simple XOR to AES-256-GCM encryption
- **Features**: Integrity verification, fallback encryption, secure key derivation
- **Location**: `src/core/security/encryption.js`

### 4. Expanded Shop ✅
- **Added**: 6 new puck skins (Diamond, Plasma, Stealth, Rainbow, Titanium, Cosmic)
- **Added**: 8 new board themes (Neon, Forest, Crystal, Desert, Ocean, Rainbow, Steampunk, Holographic)
- **Features**: Unique physics properties per skin, level-based unlocks
- **Location**: `src/features/shop/store/shopStore.js`

### 5. AI Removal ✅
- **Removed**: AI behavior from balls
- **Converted**: AI balls to purely cosmetic skins with physics variants
- **Location**: `src/features/game/components/GameBoard.jsx`

### 6. Electron Desktop App ✅
- **Added**: Cross-platform desktop wrapper
- **Features**: Native menus, keyboard shortcuts, auto-updater ready
- **Files**: `electron/main.js`, `electron/preload.js`

## 🎮 Game Features

### Physics System
- **Virtual Coordinates**: 1200x1800 device-independent system
- **Slingshot Mechanics**: Realistic elastic band physics
- **Collision Detection**: Puck-to-puck, puck-to-wall interactions
- **Performance**: 60fps with velocity clamping

### Progression System
- **Levels**: 50+ levels with exponential XP requirements
- **ELO Rating**: 1200 base with difficulty-based changes
- **Titles**: From "Rookie" to "Sling Immortal"
- **Match History**: Last 20 games with detailed stats

### Customization
- **12 Puck Skins**: Each with unique physics (mass, friction, restitution)
- **16 Board Themes**: Visual variety with different color schemes
- **Physics Variants**: Gameplay changes based on equipped skin

### Security
- **AES-256 Encryption**: Military-grade data protection
- **Local Storage**: No external data transmission
- **Integrity Checks**: Hash-based corruption detection

## 🔧 Configuration

### Game Constants
Edit `src/core/config/gameConstants.js`:
```javascript
// Physics parameters
FORCE_MULTIPLIER: 0.00002,
MAX_STRETCH: 400,
PUCK_RADIUS: 40,

// Board dimensions
VIRTUAL_WIDTH: 1200,
VIRTUAL_HEIGHT: 1800,

// Rope positions
PLAYER_ROPE_Y: 1450,
AI_ROPE_Y: 350,
```

### Electron Settings
Edit `electron/main.js`:
```javascript
// Window configuration
width: 1200,
height: 800,
minWidth: 800,
minHeight: 600,

// Security settings
nodeIntegration: false,
contextIsolation: true,
```

## 🎨 Adding Content

### New Puck Skin
```javascript
// In src/features/shop/store/shopStore.js
newSkin: {
  id: "newSkin",
  name: "New Skin",
  price: 1.99,
  requiredLevel: 10,
  isPremium: true,
  color: "#ff0000",
  texture: "custom",
  physics: { 
    mass: 1.2, 
    friction: 0.03, 
    restitution: 0.85, 
    frictionAir: 0.015 
  },
  description: "Custom skin description.",
}
```

### New Board Theme
```javascript
// In src/features/shop/store/shopStore.js
newTheme: {
  id: "newTheme",
  name: "New Theme",
  price: 2.99,
  requiredLevel: 15,
  isPremium: true,
  backgroundColor: "#1a1a1a",
  dividerColor: "#ff6600",
  wallColor: "#333333",
  description: "Custom theme description.",
}
```

## 🚀 Deployment

### itch.io Publishing
1. Run build script: `node scripts/build-for-itch.js`
2. Zip `itch-distribution` folder contents
3. Upload to itch.io with platform tags
4. Set pricing and availability
5. Add screenshots and description

### Distribution Files
- **Windows**: `.exe` installer with NSIS
- **macOS**: `.dmg` disk image (Universal Binary)
- **Linux**: `.AppImage` portable executable

## 🐛 Troubleshooting

### Common Issues

**"getXPRequired is not a function"**
- ✅ Fixed: Added missing function to game store

**Physics feels wrong**
- Check `FORCE_MULTIPLIER` in game constants
- Verify drag vector calculation in GameBoard.jsx

**Encryption errors**
- Fallback to enhanced XOR if Web Crypto API unavailable
- Check browser compatibility

**Build fails**
- Ensure all dependencies installed: `npm install`
- Check platform-specific requirements
- Verify Node.js version compatibility

### Debug Mode
```bash
# Enable development tools
npm run dev          # Web with hot reload
npm run electron-dev # Electron with DevTools
```

## 📊 Performance

### Optimization Features
- Canvas-based rendering (no DOM manipulation)
- Object pooling for physics bodies
- Efficient collision detection
- Memory leak prevention
- 60fps target with frame limiting

### System Requirements
- **Minimum**: 4GB RAM, DirectX 11 compatible graphics
- **Recommended**: 8GB RAM, dedicated graphics card
- **Storage**: 200MB available space

## 🎯 Ready for Publishing

Your Sling Hockey Pro game is now ready for itch.io publishing with:

✅ Fixed physics mechanics
✅ Enhanced ELO ranking system  
✅ Secure data encryption
✅ Expanded shop content
✅ Desktop application wrapper
✅ Professional game architecture

**Next Steps:**
1. Test the game thoroughly
2. Create screenshots and promotional materials
3. Run the build script for distribution
4. Upload to itch.io and set up your game page
5. Launch your game to the world!

🏒 **Good luck with your game launch!**