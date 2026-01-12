# Elastic Band Rendering Guide

## The Challenge

In Sling Hockey, the elastic band is the core mechanic. Players drag a puck back, stretching an invisible "rubber band," then release to launch.

The challenge is that **Matter.js constraints are invisible**. A constraint is just a mathematical relationship between two bodies—it doesn't have a visual representation.

We need to create a **dual-layer system**:

1. **Physical Layer**: Matter.js constraint that applies force
2. **Visual Layer**: Custom Canvas 2D drawing that shows the "band"

---

## Physical Layer: Matter.Constraint

### Setup

```javascript
import Matter from "matter-js";

// Anchor point (fixed position on board)
const anchorPoint = { x: 500, y: 900 };

// Puck body
const puck = Matter.Bodies.circle(500, 850, 20, {
  restitution: 0.8,
  friction: 0.05,
});

// Create constraint
const elastic = Matter.Constraint.create({
  bodyA: null, // No bodyA = anchor to world
  pointA: anchorPoint, // Fixed anchor position
  bodyB: puck, // Attached to puck
  pointB: { x: 0, y: 0 }, // Center of puck
  stiffness: 0.1, // Spring strength
  damping: 0.05, // Energy loss
  length: 0, // Rest length (0 = always pulling)
  render: {
    visible: false, // Don't use Matter's renderer
  },
});

// Add to world
Matter.Composite.add(engine.world, [puck, elastic]);
```

### Collision Filter (Important!)

The elastic band should NOT collide with pucks or walls.

```javascript
elastic.collisionFilter = {
  category: 0x0002, // Elastic category
  mask: 0x0000, // Collides with nothing
};
```

### Drag Behavior

When user drags the puck, we temporarily disable the constraint or increase its length.

```javascript
let isDragging = false;

function onPointerDown(event) {
  const clickPos = getVirtualCoordinates(event);

  if (isPointInPuck(clickPos, puck)) {
    isDragging = true;

    // Option 1: Remove constraint while dragging
    Matter.Composite.remove(engine.world, elastic);

    // Option 2: Increase constraint length while dragging
    elastic.length = 999999;
  }
}

function onPointerMove(event) {
  if (!isDragging) return;

  const clickPos = getVirtualCoordinates(event);

  // Clamp to max stretch distance
  const distance = getDistance(clickPos, anchorPoint);
  if (distance > MAX_STRETCH) {
    const angle = Math.atan2(
      clickPos.y - anchorPoint.y,
      clickPos.x - anchorPoint.x
    );
    clickPos.x = anchorPoint.x + Math.cos(angle) * MAX_STRETCH;
    clickPos.y = anchorPoint.y + Math.sin(angle) * MAX_STRETCH;
  }

  // Move puck to mouse position
  Matter.Body.setPosition(puck, clickPos);
}

function onPointerUp() {
  if (!isDragging) return;

  isDragging = false;

  // Re-add constraint (it will snap puck back)
  Matter.Composite.add(engine.world, elastic);

  // Or apply manual force
  const force = calculateElasticForce(puck.position, anchorPoint);
  Matter.Body.applyForce(puck, puck.position, force);
}
```

---

## Visual Layer: Custom Canvas Drawing

### The Problem with Straight Lines

If you draw a straight line from anchor to puck, it looks stiff and mechanical:

```javascript
// ❌ BAD: Straight line (looks like a stick, not rubber)
ctx.beginPath();
ctx.moveTo(anchorX, anchorY);
ctx.lineTo(puckX, puckY);
ctx.strokeStyle = "#000000";
ctx.lineWidth = 3;
ctx.stroke();
```

Result: `━━━` (rigid, not elastic)

---

### The Solution: Quadratic Curve

Use `ctx.quadraticCurveTo()` to create a curved line that looks stretchy.

```javascript
// ✅ GOOD: Curved line (looks like stretched rubber)
function drawElasticBand(ctx, anchor, puck, scale) {
  // Convert virtual to screen coordinates
  const ax = anchor.x * scale.x;
  const ay = anchor.y * scale.y;
  const px = puck.position.x * scale.x;
  const py = puck.position.y * scale.y;

  // Calculate midpoint
  const mx = (ax + px) / 2;
  const my = (ay + py) / 2;

  // Calculate perpendicular offset for control point
  const dx = px - ax;
  const dy = py - ay;
  const distance = Math.sqrt(dx * dx + dy * dy);

  // Offset control point perpendicular to line
  const offset = distance * 0.2; // 20% of distance
  const perpX = -dy / distance; // Perpendicular X
  const perpY = dx / distance; // Perpendicular Y

  // Control point (creates the curve)
  const controlX = mx + perpX * offset;
  const controlY = my + perpY * offset;

  // Draw the band
  ctx.beginPath();
  ctx.moveTo(ax, ay);
  ctx.quadraticCurveTo(controlX, controlY, px, py);
  ctx.strokeStyle = "#000000";
  ctx.lineWidth = 3;
  ctx.lineCap = "round";
  ctx.stroke();
}
```

**Result**: `╱━╲` (curved, elastic look)

---

### Advanced: Dynamic Curve Depth

Make the curve more dramatic when stretched further:

```javascript
function drawElasticBand(ctx, anchor, puck, scale) {
  const ax = anchor.x * scale.x;
  const ay = anchor.y * scale.y;
  const px = puck.position.x * scale.x;
  const py = puck.position.y * scale.y;

  // Calculate distance
  const dx = px - ax;
  const dy = py - ay;
  const distance = Math.sqrt(dx * dx + dy * dy);

  // More stretch = deeper curve
  const stretchFactor = distance / 100; // Adjust denominator to tune
  const offset = Math.min(distance * 0.3, 80) * stretchFactor;

  // Perpendicular vector
  const perpX = -dy / distance;
  const perpY = dx / distance;

  // Control point
  const mx = (ax + px) / 2;
  const my = (ay + py) / 2;
  const controlX = mx + perpX * offset;
  const controlY = my + perpY * offset;

  // Draw with gradient for depth
  const gradient = ctx.createLinearGradient(ax, ay, px, py);
  gradient.addColorStop(0, "#000000");
  gradient.addColorStop(0.5, "#333333");
  gradient.addColorStop(1, "#000000");

  ctx.beginPath();
  ctx.moveTo(ax, ay);
  ctx.quadraticCurveTo(controlX, controlY, px, py);
  ctx.strokeStyle = gradient;
  ctx.lineWidth = 4;
  ctx.lineCap = "round";
  ctx.stroke();

  // Add shadow for 3D effect
  ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
  ctx.shadowBlur = 4;
  ctx.shadowOffsetY = 2;
  ctx.stroke();
  ctx.shadowColor = "transparent";
}
```

---

## Complete Implementation

### Full Render System

```javascript
// src/features/game/physics/RenderSystem.js
export class RenderSystem {
  constructor(canvas, engine, scale) {
    this.ctx = canvas.getContext("2d");
    this.engine = engine;
    this.scale = scale;
  }

  render(dragState) {
    const ctx = this.ctx;
    const bodies = Matter.Composite.allBodies(this.engine.world);

    // Clear canvas
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    // Draw board background
    ctx.fillStyle = "#d2b48c"; // Birch wood
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    // Draw walls and divider
    this.drawStatic(bodies);

    // Draw elastic band (if puck is being dragged)
    if (dragState.isDragging && dragState.activePuck) {
      this.drawElasticBand(dragState.anchorPoint, dragState.activePuck);
    }

    // Draw pucks
    this.drawPucks(bodies);
  }

  drawElasticBand(anchor, puck) {
    const ctx = this.ctx;
    const ax = anchor.x * this.scale.x;
    const ay = anchor.y * this.scale.y;
    const px = puck.position.x * this.scale.x;
    const py = puck.position.y * this.scale.y;

    // Calculate curve
    const dx = px - ax;
    const dy = py - ay;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Control point offset
    const offset = Math.min(distance * 0.25, 60);
    const perpX = -dy / distance;
    const perpY = dx / distance;

    const mx = (ax + px) / 2;
    const my = (ay + py) / 2;
    const cx = mx + perpX * offset;
    const cy = my + perpY * offset;

    // Draw band
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(ax, ay);
    ctx.quadraticCurveTo(cx, cy, px, py);
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 4;
    ctx.lineCap = "round";
    ctx.shadowColor = "rgba(0, 0, 0, 0.3)";
    ctx.shadowBlur = 6;
    ctx.shadowOffsetY = 3;
    ctx.stroke();
    ctx.restore();

    // Draw anchor point
    ctx.beginPath();
    ctx.arc(ax, ay, 6, 0, Math.PI * 2);
    ctx.fillStyle = "#000000";
    ctx.fill();
  }

  drawPucks(bodies) {
    const ctx = this.ctx;

    bodies.forEach((body) => {
      if (body.label === "puck") {
        const x = body.position.x * this.scale.x;
        const y = body.position.y * this.scale.y;
        const r = body.circleRadius * this.scale.x;

        // Shadow
        ctx.beginPath();
        ctx.arc(x + 2, y + 2, r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
        ctx.fill();

        // Puck
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fillStyle = body.render.fillStyle || "#ffffff";
        ctx.fill();
        ctx.strokeStyle = "#000000";
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    });
  }

  drawStatic(bodies) {
    // Draw walls, divider, etc.
  }
}
```

---

## Game Loop Integration

```javascript
// src/features/game/components/GameBoard.jsx
import { useEffect, useRef, useState } from "react";
import { RenderSystem } from "../physics/RenderSystem";

function GameBoard() {
  const canvasRef = useRef(null);
  const engineRef = useRef(null);
  const [dragState, setDragState] = useState({
    isDragging: false,
    activePuck: null,
    anchorPoint: null,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const engine = engineRef.current;
    const renderer = new RenderSystem(canvas, engine, scale);

    function gameLoop() {
      Matter.Engine.update(engine, 1000 / 60);
      renderer.render(dragState);
      requestAnimationFrame(gameLoop);
    }

    gameLoop();
  }, [dragState]);

  const handlePointerDown = (e) => {
    // Detect puck click
    const puck = getPuckAtPosition(virtualPos);
    if (puck) {
      setDragState({
        isDragging: true,
        activePuck: puck,
        anchorPoint: { x: puck.position.x, y: puck.position.y },
      });
    }
  };

  const handlePointerMove = (e) => {
    if (dragState.isDragging) {
      Matter.Body.setPosition(dragState.activePuck, virtualPos);
    }
  };

  const handlePointerUp = () => {
    if (dragState.isDragging) {
      // Apply force
      const force = calculateElasticForce(
        dragState.activePuck.position,
        dragState.anchorPoint
      );
      Matter.Body.applyForce(
        dragState.activePuck,
        dragState.activePuck.position,
        force
      );

      setDragState({
        isDragging: false,
        activePuck: null,
        anchorPoint: null,
      });
    }
  };

  return (
    <canvas
      ref={canvasRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    />
  );
}
```

---

## Visual Enhancements

### 1. Stretch Indicator

Show visual feedback of how far the puck is pulled:

```javascript
// Draw stretch percentage
const maxStretch = 150;
const currentStretch = getDistance(puck.position, anchor);
const stretchPercent = Math.min((currentStretch / maxStretch) * 100, 100);

// Color changes based on power
let color;
if (stretchPercent < 33) color = "#4ade80"; // Green (weak)
else if (stretchPercent < 66) color = "#fb923c"; // Orange (medium)
else color = "#ef4444"; // Red (max power)

// Draw power bar
ctx.fillStyle = color;
ctx.fillRect(10, 10, stretchPercent * 2, 20);
```

### 2. Pulsing Effect

Make the band pulse when at max stretch:

```javascript
if (currentStretch >= maxStretch) {
  const pulse = Math.sin(Date.now() / 100) * 0.5 + 0.5;
  ctx.lineWidth = 4 + pulse * 2;
  ctx.strokeStyle = `rgba(239, 68, 68, ${0.7 + pulse * 0.3})`;
}
```

### 3. Release Animation

Add a "snap" effect when releasing:

```javascript
function drawReleaseFlash(ctx, position, frame) {
  if (frame < 10) {
    const alpha = 1 - frame / 10;
    ctx.beginPath();
    ctx.arc(position.x, position.y, 30 + frame * 3, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
    ctx.lineWidth = 3;
    ctx.stroke();
  }
}
```

---

## Performance Optimization

### Only Draw When Visible

```javascript
if (dragState.isDragging) {
  this.drawElasticBand(anchor, puck);
}
// Don't waste CPU drawing invisible bands
```

### Throttle Curve Recalculation

```javascript
let lastCurveUpdate = 0;
const CURVE_UPDATE_INTERVAL = 16; // ~60fps

function updateCurve() {
  const now = Date.now();
  if (now - lastCurveUpdate < CURVE_UPDATE_INTERVAL) {
    return; // Skip this frame
  }
  lastCurveUpdate = now;

  // Recalculate control points
  calculateQuadraticCurve();
}
```

---

## Troubleshooting

### Problem: Band looks jagged

**Solution**: Increase `ctx.lineWidth` or add anti-aliasing:

```javascript
ctx.imageSmoothingEnabled = true;
ctx.imageSmoothingQuality = "high";
```

### Problem: Band doesn't match puck movement

**Solution**: Ensure you're using the same coordinate system (virtual → screen) for both.

### Problem: Curve is too shallow or too deep

**Solution**: Adjust the `offset` multiplier (try values between 0.1 and 0.5).

---

## Summary

1. **Physical**: Matter.Constraint with `stiffness: 0.1`, `damping: 0.05`
2. **Visual**: Canvas `quadraticCurveTo()` with perpendicular offset
3. **Integration**: Render band only when `isDragging === true`
4. **Enhancement**: Dynamic curve depth, color feedback, pulsing effects

---

**Document Version**: 1.0  
**Last Updated**: January 12, 2026  
**Status**: Production-ready implementation
