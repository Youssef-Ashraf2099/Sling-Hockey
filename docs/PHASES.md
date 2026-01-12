# Sling Hockey Pro - Development Phases

## Overview

This document outlines the 5-phase development roadmap for Sling Hockey Pro, a professional 2D tabletop game platform inspired by Chess.com's architecture.

---

## Phase 1: Foundation ✅ (Week 1-2)

### Objectives

Establish the technical foundation with proper architecture, physics engine, and core rendering system.

### Key Deliverables

- ✅ **Project Setup**

  - Feature-folder architecture (`src/features/`)
  - Updated dependencies (Matter.js, Zustand, React Router)
  - Vite build configuration
  - Professional package.json

- ✅ **Layout & Dashboard**

  - 3-column responsive grid (240px sidebar | fluid center | 320px right panel)
  - Left sidebar with navigation and profile
  - Center canvas with 16:9 aspect ratio lock
  - Right panel for ads and leaderboard

- ✅ **Matter.js Physics Engine**

  - Virtual coordinate system (1000x1000 units)
  - Zero gravity configuration (`gravity: { x: 0, y: 0 }`)
  - Static wall boundaries
  - Center divider with slot and rounded corners
  - Puck bodies with proper friction/restitution

- ✅ **Custom Canvas 2D Renderer**

  - RenderSystem.js for manual drawing
  - Birch wood background (#d2b48c)
  - Coordinate mapping (virtual → screen)
  - Device pixel ratio support

- ✅ **Elastic Band System**

  - Physical constraints with Matter.Constraint
  - Visual quadratic curve rendering
  - Unified pointer event handlers
  - Collision filtering (band doesn't collide with pucks)

- ✅ **Documentation**
  - PHASES.md (this file)
  - PHYSICS_RULES.md
  - COORDINATE_SYSTEM.md
  - MONETIZATION_SPECS.md
  - ELASTIC_RENDERING.md

### Success Criteria

- Game board renders at consistent 60fps
- Pucks slide smoothly with realistic physics
- Elastic bands stretch and snap back properly
- Layout responsive across desktop/tablet/mobile

---

## Phase 2: Core Game Loop (Week 3-4)

### Objectives

Implement complete gameplay mechanics, scoring system, and turn-based logic.

### Key Deliverables

- **Sling Mechanics**

  - Drag puck to pull elastic band
  - Release to launch puck
  - Force calculation based on distance/angle
  - Max stretch limit (150 units)

- **Collision System**

  - Puck-to-puck collisions
  - Puck-to-wall bouncing
  - Puck-to-divider interactions
  - Slot detection (goal scoring)

- **Scoring Logic**

  - Track pucks passing through slot
  - Win condition (all opponent pucks scored)
  - Score display UI
  - Round timer

- **Turn Management**

  - Player turn indicators
  - Auto-switch after puck stops moving
  - Undo/reset functionality
  - Game state persistence

- **Sound Effects**
  - Puck launch sound
  - Collision sounds
  - Goal scoring celebration
  - Background ambient audio

### Success Criteria

- Complete game can be played start to finish
- Scoring works accurately
- Turn-based flow feels natural
- Sound effects enhance experience

---

## Phase 3: Monetization & Shop (Week 5)

### Objectives

Build the in-app purchase system and ad placement infrastructure.

### Key Deliverables

- **Shop UI**

  - Modal/sidebar shop interface
  - Grid of purchasable items
  - Puck skin cards with previews
  - Board theme cards
  - Purchase confirmation modals

- **Puck Customization**

  - Dynamic skin system
  - Physics property modifications (mass, friction)
  - Visual texture/color changes
  - Preview in shop before purchase

- **Ad Integration**

  - Right sidebar ad slot (300x250)
  - Interstitial ad after 3 games (free users)
  - Ad-free for Pro subscribers
  - AdSense placeholder components

- **IAP Tiers**

  - Free tier (ads enabled)
  - Pro tier ($5/mo - no ads, premium skins)
  - Individual skins ($0.99 each)
  - LocalStorage persistence for purchases

- **Shop Store (Zustand)**
  - `currentSkin` state
  - `purchasedSkins` array
  - `applyPuckSkin()` action
  - `persist` middleware for LocalStorage

### Success Criteria

- Shop interface is intuitive and attractive
- Purchases persist across sessions
- Skins visually modify pucks in-game
- Ad placements don't disrupt gameplay

---

## Phase 4: PVP & PVE (Week 6-7)

### Objectives

Implement AI opponent for single-player and local 2-player mode.

### Key Deliverables

- **AI Controller**

  - Geometry-based decision making
  - 3 difficulty levels:
    - Easy: 40% accuracy, random mistakes
    - Medium: 70% accuracy, basic strategy
    - Hard: 95% accuracy, optimal angles
  - Target selection algorithm
  - Shot power calculation

- **Game Modes**

  - PVE: Player vs AI
  - PVP: Local 2-player (hot seat)
  - Practice mode (no opponent)

- **Win/Loss Overlays**

  - Victory screen with confetti animation
  - Defeat screen with encouragement
  - ELO rating change display (+20/-15)
  - Rematch and main menu buttons

- **AI Logic**

  - Analyze board state
  - Calculate best target puck
  - Aim for slot opening
  - Consider defensive blocks
  - Difficulty-based accuracy variance

- **Match History**
  - Store last 10 games in LocalStorage
  - Display in right sidebar
  - Show opponent, result, ELO change
  - Replay button (future feature)

### Success Criteria

- AI provides engaging challenge at all levels
- Win/loss screens feel rewarding
- Match history accurately tracks games
- PVP mode works smoothly for 2 players

---

## Phase 5: Polish & SEO (Week 8)

### Objectives

Optimize performance, add visual polish, and implement SEO best practices.

### Key Deliverables

- **Performance Optimization**

  - Object pooling for pucks
  - Offscreen canvas for static elements
  - Throttle physics updates if needed
  - Lazy load components

- **Visual Effects**

  - Puck trails during movement
  - Impact flash on collisions
  - Slot glow when puck passes through
  - Board edge shadows
  - Particle effects for goals

- **Sound Enhancement**

  - Howler.js integration
  - Spatial audio (panning based on position)
  - Volume controls in settings
  - Music on/off toggle

- **SEO Optimization**

  - Meta tags for social sharing
  - Open Graph images
  - Structured data (JSON-LD)
  - Sitemap.xml
  - Robots.txt

- **Footer Content**

  - "Sling Hockey Rules" page
  - "Pro Tips & Strategy" guide
  - "Global Rankings" leaderboard
  - Privacy Policy
  - Terms of Service
  - Contact form

- **Accessibility**

  - ARIA labels for game elements
  - Keyboard navigation
  - Screen reader support for menus
  - High contrast mode option

- **Analytics**
  - Google Analytics integration
  - Event tracking (games played, purchases)
  - Heatmap for user interactions
  - Performance monitoring

### Success Criteria

- Game runs at 60fps on mid-range devices
- Visual effects enhance immersion
- SEO score >90 on Lighthouse
- Footer provides valuable content
- Accessible to users with disabilities

---

## Post-Launch Roadmap

### Future Enhancements

- **Online Multiplayer**

  - WebSocket server (Socket.io)
  - Real-time synchronization
  - Matchmaking system
  - Ranked competitive mode

- **Tournament System**

  - Bracket generation
  - Scheduled events
  - Prize pools
  - Spectator mode

- **Social Features**

  - Friend system
  - Chat messaging
  - Profile customization
  - Achievement badges

- **Advanced AI**

  - Machine learning opponent
  - Neural network training
  - Adaptive difficulty
  - Replay analysis

- **Mobile Apps**
  - React Native port
  - iOS App Store
  - Google Play Store
  - Touch optimizations

---

## Phase Transitions

### Definition of Done (DoD) per Phase

Each phase must meet these criteria before moving to the next:

1. All deliverables completed and tested
2. No critical bugs in new features
3. Code reviewed and documented
4. Performance benchmarks met
5. User testing feedback incorporated

### Review Process

- End-of-phase demo
- QA testing checklist
- Performance profiling
- User acceptance testing
- Documentation update

---

## Team Roles

- **Developer**: Full-stack implementation
- **Designer**: UI/UX and visual assets
- **QA**: Testing and bug reporting
- **AI (GitHub Copilot)**: Code assistance and context

---

## Risk Management

### Technical Risks

- **Physics instability**: Mitigation via extensive testing and Matter.js configuration tuning
- **Performance on mobile**: Mitigation via progressive enhancement and feature detection
- **Browser compatibility**: Mitigation via polyfills and fallback rendering

### Business Risks

- **Low user retention**: Mitigation via engaging AI and progression systems
- **Ad revenue insufficient**: Mitigation via IAP focus and premium tier
- **Competition**: Mitigation via unique features and polish

---

## Success Metrics

### Phase 1

- Build completes without errors
- Canvas renders at 60fps
- Physics feels realistic

### Phase 2

- Game completable end-to-end
- Average game duration 3-5 minutes
- <1% crash rate

### Phase 3

- > 10% conversion to Pro tier
- > 5% purchase individual skins
- Average revenue per user (ARPU) >$0.50

### Phase 4

- AI difficulty ratings accurate
- > 60% of players try PVE mode
- Average session length >15 minutes

### Phase 5

- Lighthouse score >90
- Page load time <2 seconds
- Accessibility score >95

---

**Document Version**: 1.0  
**Last Updated**: January 12, 2026  
**Next Review**: After Phase 1 completion
