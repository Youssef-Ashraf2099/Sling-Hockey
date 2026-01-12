# Physics Rules for Sling Hockey Pro

## Overview

This document defines the exact physics parameters and behaviors for Sling Hockey Pro. These values ensure consistent, skill-based gameplay that feels polished and professional.

---

## World Configuration

### Gravity

```javascript
engine.gravity = {
  x: 0,
  y: 0,
  scale: 0.001,
};
```

**Rationale**: Sling Hockey is a top-down tabletop game. Zero gravity simulates a flat surface where pucks slide rather than fall.

### Time Scale

- **Fixed timestep**: 1000 / 60 = 16.67ms (60fps)
- **Delta multiplier**: 1.0 (real-time, no slow-motion)

---

## Puck Properties

### Standard Puck (Classic Skin)

```javascript
{
  radius: 20,              // Virtual units
  mass: 1.0,              // Base mass
  density: 0.001,         // Auto-calculates mass if not set
  restitution: 0.8,       // Bounciness (0 = no bounce, 1 = perfect bounce)
  friction: 0.05,         // Surface friction
  frictionAir: 0.02,      // Air resistance / drag
  frictionStatic: 0.5,    // Static friction (prevents sliding when still)
  slop: 0.05,             // Collision tolerance
  inertia: Infinity       // Rotational resistance (Infinity = no rotation)
}
```

### Physics Explanation

**Restitution (0.8)**

- 80% energy retention on collision
- Creates realistic bouncing without excessive ping-pong effect
- Allows for ricochets but energy dissipates naturally

**Friction (0.05)**

- Low surface friction = smooth sliding
- Pucks gradually slow down (realistic wood surface)
- Skilled shots can travel across board

**FrictionAir (0.02)**

- Slight air resistance
- Prevents infinite sliding
- Pucks come to rest naturally within 3-5 seconds

**Inertia (Infinity)**

- Pucks don't rotate when moving
- Simplifies physics calculations
- Maintains clean, predictable trajectories

---

## Elastic Band (Sling Constraint)

### Physical Constraint

```javascript
Matter.Constraint.create({
  bodyA: puck,
  pointB: anchorPoint, // Fixed anchor on board
  stiffness: 0.1, // Spring strength (lower = more stretchy)
  damping: 0.05, // Energy loss (higher = less oscillation)
  length: 0, // Rest length (0 = pulls to anchor)
  render: {
    visible: false, // Don't use Matter's renderer
  },
});
```

### Physics Explanation

**Stiffness (0.1)**

- Low stiffness = stretchy, elastic feel
- Allows dramatic pull-back
- Creates satisfying slingshot effect

**Damping (0.05)**

- Low damping = slight bounce-back
- Prevents excessive oscillation
- Band settles quickly after release

### Force Calculation on Release

```javascript
// Calculate force based on distance pulled
const dx = anchorPoint.x - puck.position.x;
const dy = anchorPoint.y - puck.position.y;
const distance = Math.sqrt(dx * dx + dy * dy);

// Clamp to max stretch distance
const maxStretch = 150; // Virtual units
const clampedDistance = Math.min(distance, maxStretch);

// Apply force proportional to distance
const forceMagnitude = clampedDistance * 0.0003;
const force = {
  x: dx * forceMagnitude,
  y: dy * forceMagnitude,
};

Matter.Body.applyForce(puck, puck.position, force);
```

**Max Stretch (150 units)**

- Prevents unrealistic super-shots
- Creates skill ceiling (aiming vs. power)
- Ensures balanced gameplay

**Force Multiplier (0.0003)**

- Tuned for realistic shot speeds
- Max shot travels ~800 units
- Average shot travels ~400 units

---

## Wall Properties

### Boundary Walls

```javascript
{
  isStatic: true,          // Immovable
  restitution: 0.9,        // High bounce to keep pucks in play
  friction: 0.01,          // Low friction for clean bounces
  render: {
    fillStyle: '#8b7355',  // Wood color
    strokeStyle: '#5a4a3a',
    lineWidth: 2
  }
}
```

**High Restitution (0.9)**

- Wall bounces retain 90% energy
- Encourages bank shots and angles
- Reduces "dead" pucks stuck in corners

---

## Center Divider & Slot

### Divider Properties

```javascript
{
  isStatic: true,
  restitution: 0.6,        // Moderate bounce
  friction: 0.1,           // Slightly higher friction
  render: {
    fillStyle: '#8b4513',  // Darker wood
    strokeStyle: '#000000',
    lineWidth: 3
  }
}
```

### Slot Dimensions

- **Slot width**: 100 units (2.5x puck diameter)
- **Divider thickness**: 10 units
- **Corner radius**: 8 units (rounded to prevent sticking)

### Corner Circles

```javascript
// Small static circles at slot entrance corners
{
  radius: 8,
  isStatic: true,
  restitution: 0.8,
  friction: 0.05,
  render: {
    fillStyle: '#8b4513'
  }
}
```

**Purpose**: Prevents pucks from getting caught on sharp corners at slot entrance. Creates smooth entry into goal area.

---

## Collision Filters

### Puck-to-Puck Collisions

```javascript
// Allow all puck-puck collisions
puck.collisionFilter = {
  category: 0x0001, // Puck category
  mask: 0xffff, // Collides with everything
};
```

**Rationale**: Skill-based gameplay includes using your own pucks to block or redirect.

### Elastic Band Collision Filter

```javascript
// Band should NOT collide with pucks
constraint.collisionFilter = {
  category: 0x0002, // Band category
  mask: 0x0000, // Collides with nothing
};
```

**Rationale**: Band is visual/physical force only, not a solid barrier.

---

## Velocity & Force Limits

### Maximum Velocity

```javascript
// Clamp puck velocity each frame
const maxSpeed = 15; // Virtual units per frame
const velocity = puck.velocity;
const speed = Math.sqrt(velocity.x ** 2 + velocity.y ** 2);

if (speed > maxSpeed) {
  Matter.Body.setVelocity(puck, {
    x: (velocity.x / speed) * maxSpeed,
    y: (velocity.y / speed) * maxSpeed,
  });
}
```

**Purpose**: Prevents physics engine instability from extreme speeds.

### Minimum Velocity (Sleep Threshold)

```javascript
engine.sleepThreshold = 0.5; // Auto-sleep if speed < 0.5 units/frame
```

**Purpose**: Pucks automatically "sleep" when nearly stopped, improving performance.

---

## Collision Response

### Puck-Puck Collision

- Energy distributed based on mass ratio
- Angle of incidence = angle of reflection
- Small amount of energy lost to friction

### Puck-Wall Collision

- Clean bounce with 90% energy retention
- No spin applied (inertia = Infinity)
- Slight position correction to prevent tunneling

### Puck-Divider Collision

- Medium bounce (60% energy)
- Slightly higher friction creates "dead zones" near divider
- Encourages strategic positioning

---

## Special Cases

### Puck in Slot Detection

```javascript
function isInSlot(puck, slotCenter, slotWidth) {
  const distanceX = Math.abs(puck.position.x - slotCenter.x);
  const distanceY = Math.abs(puck.position.y - slotCenter.y);

  return distanceX < slotWidth / 2 && distanceY < 20; // Divider thickness + buffer
}
```

### Puck Stuck Detection

```javascript
// If puck velocity < 0.1 for 3 seconds, consider stuck
if (puck.speed < 0.1 && puck.stuckTimer > 180) {
  // Reset puck to starting position or end turn
}
```

---

## Tuning Parameters for Shop Skins

### Heavy Puck

```javascript
{
  mass: 2.0,              // 2x standard
  friction: 0.08,         // Higher friction
  restitution: 0.6,       // Less bouncy
  frictionAir: 0.03       // More drag
}
```

**Gameplay**: Harder to move, but powerful impacts. Good for defensive play.

### Speedster Puck

```javascript
{
  mass: 0.7,              // 0.7x standard
  friction: 0.02,         // Lower friction
  restitution: 0.9,       // Very bouncy
  frictionAir: 0.01       // Less drag
}
```

**Gameplay**: Fast and agile, but light impacts. Good for quick scoring.

### Balanced Puck (Default)

```javascript
{
  mass: 1.0,
  friction: 0.05,
  restitution: 0.8,
  frictionAir: 0.02
}
```

---

## Testing Checklist

### Physics Validation

- [ ] Pucks slide smoothly without jitter
- [ ] Elastic band feels responsive (not too stiff or loose)
- [ ] Collisions produce realistic bounces
- [ ] Pucks come to rest naturally (no perpetual motion)
- [ ] No tunneling through walls at high speeds
- [ ] Slot detection is 100% accurate
- [ ] Different skins feel noticeably different

### Performance Validation

- [ ] Maintains 60fps with 10 active pucks
- [ ] No frame drops during heavy collisions
- [ ] Physics calculations < 5ms per frame
- [ ] Memory usage stable (no leaks)

---

## Debug Mode

### Visual Debug Overlays

```javascript
// Show collision boundaries
render.options.showCollisions = true;

// Show velocity vectors
render.options.showVelocity = true;

// Show center of mass
render.options.showPositions = true;
```

### Console Logging

```javascript
// Log physics values every 60 frames
if (frameCount % 60 === 0) {
  console.log("Puck velocity:", puck.velocity);
  console.log("Puck position:", puck.position);
  console.log("Elastic stretch:", elasticDistance);
}
```

---

**Document Version**: 1.0  
**Last Updated**: January 12, 2026  
**Tuning Status**: Initial values (subject to playtesting adjustments)
