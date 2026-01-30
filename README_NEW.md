# Sling Hockey Pro

A competitive slingshot hockey game with ELO ranking system, built with React, Matter.js, and Electron.

## 🚀 Quick Start

### Development Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm run dev
   ```

3. **Run Electron in Development**
   ```bash
   npm run electron-dev
   ```

### Building for Production

1. **Build Web Version**
   ```bash
   npm run build
   ```

2. **Build Desktop Apps**
   ```bash
   # Windows
   npm run dist-win
   
   # macOS (requires macOS)
   npm run dist-mac
   
   # Linux
   npm run dist-linux
   
   # All platforms
   npm run dist
   ```

3. **Build for itch.io Distribution**
   ```bash
   node scripts/build-for-itch.js
   ```

## 🎮 Game Features

### ✅ Implemented Features

- **Fixed Physics**: Proper slingshot mechanics - balls now launch opposite to pull direction
- **Enhanced ELO System**: Chess-style ranking with 8 tiers (Bronze → Legend)
- **Secure Encryption**: AES-256 encryption for player progress and shop data
- **Expanded Shop**: 12 puck skins + 16 board themes with unique physics
- **AI Removed**: Balls are now purely cosmetic skins, no AI behavior
- **Electron Desktop App**: Cross-platform native application
- **Advanced Progression**: 50+ levels with XP, streaks, and match history

### 🎯 Key Improvements Made

1. **Physics Fix**: Corrected ball launching direction - now launches opposite to drag direction
2. **ELO Enhancement**: Proper rating calculations with difficulty-based multipliers
3. **Security Upgrade**: Replaced simple XOR with AES-256-GCM encryption
4. **Market Expansion**: Added 6 new puck skins and 8 new board themes
5. **AI Removal**: Converted AI balls to visual skins with physics variants
6. **Desktop Wrapper**: Full Electron integration with native menus and shortcuts

## 🏗️ Architecture

### Core Technologies
- **React 18**: Modern UI framework
- **Matter.js**: 2D physics engine
- **Zustand**: State management with persistence
- **Electron**: Desktop application wrapper
- **Vite**: Fast build tool and dev server
- **Tailwind CSS**: Utility-first styling

### Security Features
- **AES-256-GCM Encryption**: Military-grade data protection
- **Integrity Verification**: Hash-based corruption detection
- **Fallback Encryption**: Enhanced XOR for unsupported browsers
- **Local Storage Only**: No external data transmission

### Physics System
- **Virtual Coordinates**: Device-independent 1200x1800 coordinate system
- **Realistic Slingshot**: Proper force vectors and elastic mechanics
- **Collision Detection**: Puck-to-puck, puck-to-wall, and boundary interactions
- **Performance Optimized**: 60fps with velocity clamping and sleep states

## 📁 Project Structure

```
sling-hockey-pro/
├── electron/                 # Electron main process
│   ├── main.js              # Main Electron process
│   └── preload.js           # Secure IPC bridge
├── src/
│   ├── core/
│   │   ├── audio/           # Sound management
│   │   ├── config/          # Game constants
│   │   ├── physics/         # Physics utilities
│   │   └── security/        # Encryption system
│   ├── features/
│   │   ├── game/            # Game logic and components
│   │   └── shop/            # Shop system and skins
│   ├── pages/               # Route components
│   └── shared/              # Reusable components
├── scripts/
│   └── build-for-itch.js    # itch.io build script
└── docs/                    # Game documentation
```

## 🔧 Configuration

### Game Constants
Edit `src/core/config/gameConstants.js` to adjust:
- Physics parameters (friction, restitution, force multipliers)
- Board dimensions and virtual coordinates
- AI difficulty settings
- Visual styling constants

### Electron Settings
Modify `electron/main.js` for:
- Window size and behavior
- Menu structure
- Security policies
- Auto-updater configuration

## 🎨 Customization

### Adding New Puck Skins
1. Add skin data to `PUCK_SKINS` in `src/features/shop/store/shopStore.js`
2. Include unique physics properties (mass, friction, restitution)
3. Set price, level requirement, and description

### Adding New Board Themes
1. Add theme data to `BOARD_THEMES` in the shop store
2. Define colors for background, divider, and walls
3. Set unlock requirements and pricing

### Custom Physics
Each puck skin can have unique physics:
- **mass**: Weight affects momentum and collision impact
- **friction**: Surface resistance (lower = more sliding)
- **restitution**: Bounciness (0 = no bounce, 1 = perfect bounce)
- **frictionAir**: Air resistance (affects deceleration)

## 🚀 Deployment

### itch.io Publishing
1. Run the build script: `node scripts/build-for-itch.js`
2. Zip the `itch-distribution` folder contents
3. Upload to itch.io with proper platform tags
4. Set pricing and availability
5. Add screenshots and game description

### Distribution Files
- **Windows**: `.exe` installer with NSIS
- **macOS**: `.dmg` disk image (Universal Binary)
- **Linux**: `.AppImage` portable executable

## 🔒 Security Notes

### Data Protection
- All player progress encrypted with AES-256
- No external network requests (fully offline)
- Integrity verification prevents save tampering
- Secure key derivation with PBKDF2

### Electron Security
- Context isolation enabled
- Node integration disabled
- Content Security Policy enforced
- External link protection

## 🐛 Troubleshooting

### Common Issues

**Physics feels wrong**
- Check `FORCE_MULTIPLIER` in game constants
- Verify virtual coordinate scaling
- Ensure proper drag vector calculation

**Encryption errors**
- Fallback to enhanced XOR if Web Crypto API unavailable
- Check browser compatibility
- Verify localStorage permissions

**Electron build fails**
- Ensure all dependencies installed
- Check platform-specific requirements
- Verify code signing certificates (for distribution)

### Debug Mode
Enable development tools:
```bash
# Web version
npm run dev

# Electron with DevTools
npm run electron-dev
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

## 🎯 Future Enhancements

### Planned Features
- Online multiplayer with matchmaking
- Tournament system with brackets
- Replay system for match analysis
- User-generated content (custom themes)
- Achievement system with rewards
- Statistics dashboard with analytics

### Technical Improvements
- WebGL renderer for better performance
- Advanced particle effects
- Dynamic lighting system
- Audio engine with 3D positioning
- Cloud save synchronization

## 📝 License

This project is proprietary software intended for commercial distribution on itch.io.

## 🤝 Contributing

This is a commercial project. For bug reports or feature suggestions, please use the itch.io comment system.

---

**Ready to dominate the Sling Hockey arena? Build, deploy, and let the competition begin!** 🏒