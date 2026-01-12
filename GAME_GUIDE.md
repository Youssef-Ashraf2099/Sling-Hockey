# 🎯 Sling Hockey Pro - Complete Feature Guide

## Game Overview

Sling Hockey Pro is a 2D physics-based tabletop game inspired by Angry Birds and Chess.com's design philosophy. Players use elastic ropes to launch hockey pucks toward their opponent's zone.

---

## How to Play

### Starting the Game

1. **Go to**: http://localhost:3000/
2. **Select Mode**:
   - **PVP**: Local multiplayer (2 players on same device)
   - **PVE**: Play against AI with difficulty selection

### PVP Gameplay

| Player   | Side   | Pucks | Objective                        |
| -------- | ------ | ----- | -------------------------------- |
| Player 1 | Bottom | White | Launch white pucks toward top    |
| Player 2 | Top    | Black | Launch black pucks toward bottom |

**Continuous Play**: Both players can shoot simultaneously - no turn waiting!

### PVE Gameplay

| Player | Side   | Pucks | Mode                     |
| ------ | ------ | ----- | ------------------------ |
| You    | Bottom | White | Control with mouse/touch |
| AI     | Top    | Black | Automated responses      |

**AI Difficulty**:

- 🛡️ **EASY**: 3s delay, 60% accuracy
- ⚡ **MEDIUM**: 2s delay, 80% accuracy
- 🔥 **HARD**: 1s delay, 95% accuracy

---

## Rope Mechanics (Angry Birds Style)

### Visual Feedback

- **Black rope** (0-50% stretch): Relaxed state
- **Orange rope** (50-80% stretch): Medium tension
- **Red rope** (80-100% stretch): Maximum tension

### Launch Sequence

```
1. CLICK on a puck
   ↓
2. DRAG upward (or any direction)
   ↓
3. ROPE STRETCHES with visual feedback
   ↓
4. RELEASE mouse
   ↓
5. PUCK LAUNCHES with force = stretch distance
```

### Maximum Stretch

- **250 units** maximum pull distance
- Prevents overpowered shots
- Encourages skill-based aim

---

## Scoring System

### Point Calculation

- **Your puck passes center line to opponent zone** = +1 point for you
- **Opponent puck passes center line to your zone** = +1 point for opponent

### Win Condition

**FIRST TO 10 PUCKS WINS**

Examples of winning scenarios:

- Score all 5 white pucks + 5 black pucks = Win
- Score 7 white + 3 black pucks = Win
- Any combination totaling 10 = Victory

### Score Display

```
Player 1: 7/10  vs  Player 2: 3/10
→ Player 1 is closer to winning (only needs 3 more)
```

---

## Board Layout

```
┌─────────────────────────────────────┐
│  ⚫  ⚫     Center Slot     ⚫  ⚫     │  ← Player 2 (AI) - Black Pucks
│                                     │
│  ⚫  (empty area with lines)  ⚫     │
│                                     │
├─────────────────────────────────────┤  ← Scoring Zone: Pucks pass here
│                                     │
│            Playing Field             │
│                                     │
├─────────────────────────────────────┤  ← Your Zone: Defend here
│                                     │
│  ⚪  (empty area with lines)  ⚪     │
│                                     │
│  ⚪  ⚪     Rope Area      ⚪  ⚪     │  ← Player 1 (You) - White Pucks
└─────────────────────────────────────┘
```

### Key Zones

- **Rope Area**: Where you grab and pull pucks
- **Playing Field**: Main game area with walls
- **Scoring Zone**: Center divider - pucks pass here to score
- **Opponent Zone**: Where your pucks go to score points

---

## Physics & Collision

### Puck Properties

- **Size**: 30 units radius (scaled up for visibility)
- **Bounce**: 0.85 restitution (85% bounce back)
- **Friction**: Very low for smooth sliding
- **Max Speed**: 20 units/second (clamped)

### Collision Features

- ✅ Puck-to-wall collisions (bouncing)
- ✅ Puck-to-puck collisions (pushing)
- ✅ Smooth friction on board surface
- ✅ No rotation (pucks spin-free)
- ✅ Consistent physics on both sides

### What's Fixed

- **Player Side**: Collision bugs eliminated with explicit velocity control
- **AI Side**: Already working smoothly
- **Both Sides**: Now have identical physics behavior

---

## Controls

### Mouse/Trackpad

| Action         | Result              |
| -------------- | ------------------- |
| **Click puck** | Select for dragging |
| **Drag**       | Pull rope back      |
| **Release**    | Launch puck         |
| **Move away**  | Cancel drag         |

### Touch (Mobile)

| Action          | Result              |
| --------------- | ------------------- |
| **Tap puck**    | Select for dragging |
| **Drag finger** | Pull rope back      |
| **Release**     | Launch puck         |

---

## UI Elements

### Top Bar

- **Score Display**: `Player 1: X/10` vs `Player 2: Y/10`
- **Status**: "First to 10 pucks wins"
- **Mode**: PVP or PVE indicator

### Left Sidebar

- Home button
- Leaderboard access
- Shop access
- Settings
- Player profile with ELO rating

### Right Sidebar

- Ad space (if not Pro member)
- Game statistics
- Stats summary

---

## Game States

### HOME

- Main menu screen
- Mode selection (PVP/PVE)
- Stats overview
- Feature highlights

### MATCHMAKING (PVE Only)

- Difficulty selector modal
- EASY, MEDIUM, HARD options
- Skill descriptions

### PLAYING

- Active game in progress
- Real-time rope interaction
- Live scoring
- AI responding (in PVE)

### RESULT

- Game finished
- Final scores displayed
- ELO changes shown
- Play Again button
- Return to Home button

---

## Monetization Features

### Free Features

- PVP multiplayer
- PVE with AI
- Basic puck skins
- Basic board themes

### Pro Features (Shop)

- Ad-free experience
- Exclusive puck skins
- Exclusive board themes
- Premium cosmetics

---

## Known Features

✅ **Implemented**

- Rope physics (Angry Birds style)
- Continuous play (no turns)
- 10-puck win condition
- AI opponent with 3 difficulties
- Collision system on both sides
- Scoring detection
- Board visuals
- UI dashboard
- ELO tracking
- Shop system

🚧 **Planned (Phase 2)**

- Sound effects
- Particle effects
- Advanced replays
- Leaderboards
- Multiplayer networking
- Advanced AI strategies

---

## Troubleshooting

### Issue: Can't grab pucks on player side

**Solution**: Increased detection radius to 40 units - should work now

### Issue: Pucks falling through walls

**Solution**: Fixed collision system with proper physics values

### Issue: Rope not showing

**Solution**: Rope renders during drag - make sure you're pulling the puck

### Issue: Pucks not scoring

**Solution**: Pucks must pass center line. Check if they're entering opponent zone

### Issue: AI not responding

**Solution**:

- Check AI difficulty was selected
- Wait 1.5 seconds for puck to settle
- AI needs 1-3 more seconds to "think"

---

## Keyboard Shortcuts

_Coming in Phase 2_

---

## Browser Compatibility

| Browser       | Status  | Notes             |
| ------------- | ------- | ----------------- |
| Chrome        | ✅ Full | Best performance  |
| Firefox       | ✅ Full | Excellent support |
| Safari        | ✅ Full | Works great       |
| Edge          | ✅ Full | Chromium-based    |
| Mobile Chrome | ✅ Full | Touch support     |
| Mobile Safari | ✅ Full | Touch support     |

---

## Performance Tips

1. **Reduce particle effects** if lagging
2. **Close background tabs** for better performance
3. **Use Chrome** for best physics performance
4. **Fullscreen mode** for immersion

---

## Access

**Play Now**: http://localhost:3000/

**Select your mode and start playing!** 🎮

---

_Last Updated: January 2026_
