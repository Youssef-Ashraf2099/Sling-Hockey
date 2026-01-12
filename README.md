# 3D Sling Hockey Game 🏒

A high-fidelity 3D Sling Hockey (Pucket) game built with React, Three.js (React Three Fiber), and Tailwind CSS.

## Features ✨

- **Stunning 3D Graphics**: Realistic walnut wood board with physical center bar and slot
- **Two Game Modes**:
  - **PVP**: Local multiplayer (2 players on same device)
  - **PVE**: Play against AI with 3 difficulty levels
- **Realistic Physics**:
  - 3D collision detection
  - Friction and velocity simulation
  - Elastic band visualization when pulling pucks
- **AI Opponents**:
  - **Easy**: Slow response, 40% accuracy
  - **Medium**: Faster firing, 70% accuracy
  - **Hard**: Aggressive play, 95% accuracy with slot targeting
- **Advanced Visuals**:
  - PerspectiveCamera with tilted 3D view
  - Soft SpotLights with real-time shadows
  - Environment mapping for reflections
  - MeshPhysicalMaterial for polished puck appearance
- **Responsive UI**: Beautiful Tailwind CSS interface with game controls
- **SEO Optimized**: Semantic HTML structure with meta tags
- **Monetization Ready**: AdSense banner placeholders included

## Project Structure 📁

```
src/
├── App.js              # Entry point - manages global state
├── Layout.jsx          # SEO & Monetization layer with UI overlays
├── SlingHockey.jsx     # Main 3D scene with physics-enabled pucks
├── GameLogic.js        # AI controller & physics engine
├── main.jsx            # React entry point
└── index.css           # Global styles with Tailwind
```

## Installation 🚀

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

## How to Play 🎮

1. **Choose Mode**: Select PVP (local 2-player) or PVE (vs AI)
2. **Select Difficulty** (PVE only): Easy, Medium, or Hard
3. **Start Game**: Click "START GAME"
4. **Gameplay**:
   - Drag pucks with mouse/touch
   - Pull back to create elastic tension
   - Release to shoot through the center slot
   - Goal: Clear all your pucks to the opponent's side
5. **Win**: First player to clear their side wins!

## Technical Details 🔧

### Technologies Used

- **React 18**: UI framework
- **@react-three/fiber**: React renderer for Three.js
- **@react-three/drei**: Useful helpers for R3F
- **@react-three/cannon**: Physics engine
- **Three.js**: 3D graphics library
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Icon library
- **Vite**: Build tool

### Key Components

#### Layout.jsx

- SEO-optimized semantic HTML
- Homepage overlay with mode selection
- Game over modal with winner announcement
- AdSense banner placeholders
- Settings panel

#### SlingHockey.jsx

- 3D hockey board with walnut texture
- Physics-enabled pucks (cylinders)
- 3D raycasting for drag interaction
- Elastic band visualization
- Camera shake on game over
- Real-time shadow rendering

#### GameLogic.js

- `PhysicsEngine`: Handles collisions, friction, and movement
- `AIController`: Three difficulty levels with vector-based aiming
- `GameStateManager`: Win condition detection
- `calculateElasticBand`: Creates visual elastic effect

#### App.js

- Global state management
- AI controller initialization
- Game flow orchestration
- Camera shake triggering

## Customization 🎨

### Adjust Game Physics

Edit values in `GameLogic.js`:

```javascript
export const GAME_CONFIG = {
  boardWidth: 12,
  boardLength: 20,
  puckRadius: 0.4,
  friction: 0.98,
  maxVelocity: 15,
  // ... more settings
};
```

### Modify AI Difficulty

Adjust AI behavior in `GameLogic.js`:

```javascript
export const AI_CONFIG = {
  easy: {
    reactionDelay: 1500,
    aimAccuracy: 0.4,
    // ...
  },
};
```

### Change Colors

Update Tailwind config in `tailwind.config.js`:

```javascript
colors: {
  'hockey-blue': '#1e40af',
  'hockey-red': '#dc2626',
  // ... add more
}
```

## Performance Tips ⚡

- The game uses optimized physics calculations
- Shadows are limited to key elements
- Textures are procedurally generated to reduce load times
- Camera controls allow zoom but prevent excessive panning

## Browser Support 🌐

- Chrome/Edge (recommended)
- Firefox
- Safari
- Mobile browsers with WebGL support

## Credits 👏

Built with modern web technologies for an immersive 3D gaming experience.

## License 📄

MIT License - feel free to use and modify for your projects!

---

**Enjoy playing 3D Sling Hockey!** 🏒🎉
