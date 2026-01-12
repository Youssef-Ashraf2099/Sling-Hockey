# Sling Hockey Pro

> A professional 2D sling hockey platform inspired by Chess.com's architecture. Pull, aim, and launch your way to victory!

## í¾® Features

### Core Gameplay
- **Physics-Based Mechanics**: Powered by Matter.js 2D physics engine
- **Elastic Band System**: Realistic slingshot mechanic with visual rubber band rendering
- **Dual Game Modes**: PVP (Local multiplayer) and PVE (vs AI)
- **Virtual Coordinate System**: Consistent physics across all devices
- **Responsive Canvas**: 16:10 aspect ratio with device pixel ratio support

### Professional UI
- **Chess.com-Style Dashboard**: 3-column layout
- **Dark Theme**: Modern gradient backgrounds
- **Mobile Responsive**: Works on all devices

### Shop & Customization
- **Puck Skins**: Classic, Heavy, Speedster, Neon
- **Board Themes**: Birch, Mahogany, Marble
- **Pro Subscription**: .99/month ad-free

## íº€ Quick Start

```bash
npm install
npm run dev
```

Visit http://localhost:3000

## í³ Project Structure

```
src/
â”œâ”€â”€ features/game/      # Game logic, physics, rendering
â”œâ”€â”€ features/shop/      # Shop system
â”œâ”€â”€ shared/             # Reusable UI components
â”œâ”€â”€ pages/              # HomePage, GamePage
â””â”€â”€ docs/               # Complete documentation
```

## í¾¯ Game Rules

1. Drag your puck back to stretch the elastic band
2. Release to launch toward opponent's goal
3. Score all 5 opponent pucks to win!

## Phase 1: COMPLETE âœ…

Built with React, Matter.js, Tailwind CSS, and Zustand.
