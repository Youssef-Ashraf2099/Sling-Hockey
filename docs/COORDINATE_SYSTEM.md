# Coordinate System for Sling Hockey Pro

## The Problem

When building a canvas-based game, you face a fundamental challenge:

**Different devices have different screen resolutions.**

- A phone might render at 750x1334 (iPhone 6/7/8)
- A tablet at 1536x2048 (iPad Pro)
- A 4K monitor at 3840x2160

If you hard-code physics calculations to pixel coordinates, the game will feel completely different across devices:

- On a small screen, pucks move too fast (fewer pixels to travel)
- On a large screen, pucks move too slow (more pixels to travel)
- Force magnitudes become unpredictable
- Gameplay is inconsistent and unbalanced

---

## The Solution: Virtual Coordinate Space

### Concept

We define a **fixed, abstract coordinate system** that's independent of the actual screen size. All physics calculations happen in this virtual space, then we map (scale) the coordinates to the actual canvas dimensions only during rendering.

### Our Virtual Space

```javascript
const VIRTUAL_WIDTH = 1000;
const VIRTUAL_HEIGHT = 1000;
```

**Why 1000x1000?**

- Easy to reason about (whole numbers, base 10)
- Provides sufficient precision for physics
- Scales cleanly to any screen size
- Simple mental model for developers

---

## Implementation

### Step 1: Create Physics World in Virtual Space

```javascript
import Matter from "matter-js";

// Create engine
const engine = Matter.Engine.create();
engine.gravity = { x: 0, y: 0 };

// All bodies use virtual coordinates
const puck = Matter.Bodies.circle(
  500, // X: center of virtual space
  500, // Y: center of virtual space
  20 // Radius: 20 virtual units
);

// Walls at virtual boundaries
const walls = [
  Matter.Bodies.rectangle(500, 0, 1000, 20, { isStatic: true }), // Top
  Matter.Bodies.rectangle(500, 1000, 1000, 20, { isStatic: true }), // Bottom
  Matter.Bodies.rectangle(0, 500, 20, 1000, { isStatic: true }), // Left
  Matter.Bodies.rectangle(1000, 500, 20, 1000, { isStatic: true }), // Right
];
```

### Step 2: Calculate Scale Factor

```javascript
function useVirtualCanvas(canvasRef) {
  const [scale, setScale] = useState({ x: 1, y: 1 });

  useEffect(() => {
    const updateScale = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      // Get actual canvas dimensions (in pixels)
      const actualWidth = canvas.width;
      const actualHeight = canvas.height;

      // Calculate scale factors
      const scaleX = actualWidth / VIRTUAL_WIDTH;
      const scaleY = actualHeight / VIRTUAL_HEIGHT;

      setScale({ x: scaleX, y: scaleY });
    };

    updateScale();
    window.addEventListener("resize", updateScale);

    return () => window.removeEventListener("resize", updateScale);
  }, [canvasRef]);

  return scale;
}
```

### Step 3: Map Virtual → Screen Coordinates (Rendering)

```javascript
function renderPuck(ctx, puck, scale) {
  // Puck position in virtual space
  const virtualX = puck.position.x;
  const virtualY = puck.position.y;
  const virtualRadius = puck.circleRadius;

  // Convert to screen space
  const screenX = virtualX * scale.x;
  const screenY = virtualY * scale.y;
  const screenRadius = virtualRadius * scale.x; // Use X scale for circles

  // Draw on actual canvas
  ctx.beginPath();
  ctx.arc(screenX, screenY, screenRadius, 0, Math.PI * 2);
  ctx.fillStyle = "#ffffff";
  ctx.fill();
}
```

### Step 4: Map Screen → Virtual Coordinates (Input)

```javascript
function handlePointerDown(event, canvas, scale) {
  // Get click position in screen space
  const rect = canvas.getBoundingClientRect();
  const screenX = event.clientX - rect.left;
  const screenY = event.clientY - rect.top;

  // Convert to virtual space
  const virtualX = screenX / scale.x;
  const virtualY = screenY / scale.y;

  // Check if click hit a puck (using virtual coordinates)
  const clickedPuck = findPuckAt(virtualX, virtualY);
}
```

---

## Complete Coordinate Flow

```
User Input (Mouse/Touch)
   ↓
Screen Coordinates (pixels)
   ↓
Convert to Virtual (divide by scale)
   ↓
Physics Engine (Matter.js in virtual space)
   ↓
Physics Update (forces, velocities in virtual units)
   ↓
Virtual Coordinates Updated
   ↓
Convert to Screen (multiply by scale)
   ↓
Render on Canvas (pixels)
```

---

## Example: Complete Game Loop

```javascript
import { useEffect, useRef, useState } from "react";
import Matter from "matter-js";

const VIRTUAL_WIDTH = 1000;
const VIRTUAL_HEIGHT = 1000;

function GameCanvas() {
  const canvasRef = useRef(null);
  const engineRef = useRef(null);
  const [scale, setScale] = useState({ x: 1, y: 1 });

  // Initialize physics engine
  useEffect(() => {
    const engine = Matter.Engine.create();
    engine.gravity = { x: 0, y: 0 };
    engineRef.current = engine;

    // Create puck in virtual space
    const puck = Matter.Bodies.circle(500, 500, 20, {
      restitution: 0.8,
      friction: 0.05,
    });

    Matter.Composite.add(engine.world, puck);

    return () => {
      Matter.Engine.clear(engine);
    };
  }, []);

  // Calculate scale on resize
  useEffect(() => {
    const updateScale = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const scaleX = canvas.width / VIRTUAL_WIDTH;
      const scaleY = canvas.height / VIRTUAL_HEIGHT;
      setScale({ x: scaleX, y: scaleY });
    };

    updateScale();
    window.addEventListener("resize", updateScale);
    return () => window.removeEventListener("resize", updateScale);
  }, []);

  // Game loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const engine = engineRef.current;

    function gameLoop() {
      // Update physics (in virtual space)
      Matter.Engine.update(engine, 1000 / 60);

      // Clear canvas
      ctx.fillStyle = "#d2b48c"; // Birch wood
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Render all bodies (convert virtual → screen)
      const bodies = Matter.Composite.allBodies(engine.world);
      bodies.forEach((body) => {
        // Virtual coordinates
        const vx = body.position.x;
        const vy = body.position.y;

        // Screen coordinates
        const sx = vx * scale.x;
        const sy = vy * scale.y;

        // Draw
        if (body.circleRadius) {
          const sr = body.circleRadius * scale.x;
          ctx.beginPath();
          ctx.arc(sx, sy, sr, 0, Math.PI * 2);
          ctx.fillStyle = "#ffffff";
          ctx.fill();
        }
      });

      requestAnimationFrame(gameLoop);
    }

    gameLoop();
  }, [scale]);

  // Handle input (screen → virtual)
  const handlePointerDown = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();

    // Screen coordinates
    const screenX = e.clientX - rect.left;
    const screenY = e.clientY - rect.top;

    // Virtual coordinates
    const virtualX = screenX / scale.x;
    const virtualY = screenY / scale.y;

    console.log(`Clicked at virtual: (${virtualX}, ${virtualY})`);
  };

  return (
    <canvas
      ref={canvasRef}
      width={800}
      height={800}
      onPointerDown={handlePointerDown}
      style={{ width: "100%", height: "100%" }}
    />
  );
}
```

---

## Benefits of Virtual Coordinates

### 1. **Consistent Physics**

Forces, velocities, and collisions feel identical on all devices.

**Example:**

```javascript
// This force always moves the puck the same distance
// in virtual space, regardless of screen size
Matter.Body.applyForce(puck, puck.position, { x: 0.001, y: 0 });
```

### 2. **Predictable Gameplay**

A shot that travels 600 virtual units on a phone will travel 600 virtual units on a 4K monitor, even though the pixel distances differ.

### 3. **Easy Tuning**

Adjust physics parameters once in virtual space, works everywhere.

```javascript
const maxStretch = 150; // Always 150 virtual units
const forceMagnitude = 0.0003; // Always same force
```

### 4. **Simplified Debugging**

Console logs show virtual coordinates, which are consistent and meaningful.

```javascript
console.log("Puck at:", puck.position); // { x: 750, y: 500 }
// This is the same on every device
```

### 5. **Responsive Design**

Canvas can be any size, physics just works.

```javascript
// 400x400 mobile
<canvas width={400} height={400} />

// 1200x1200 desktop
<canvas width={1200} height={1200} />

// Physics identical in both cases
```

---

## Common Pitfalls

### ❌ Wrong: Hard-coding Pixel Coordinates

```javascript
// BAD: Physics uses actual canvas pixels
const puck = Matter.Bodies.circle(
  canvas.width / 2, // Different on every device
  canvas.height / 2,
  20
);
```

### ✅ Correct: Using Virtual Coordinates

```javascript
// GOOD: Physics uses virtual space
const puck = Matter.Bodies.circle(
  VIRTUAL_WIDTH / 2, // Always 500
  VIRTUAL_HEIGHT / 2, // Always 500
  20
);
```

### ❌ Wrong: Applying Forces in Screen Space

```javascript
// BAD: Force magnitude depends on canvas size
const force = {
  x: (mouseX - puckX) * 0.001,
  y: (mouseY - puckY) * 0.001,
};
```

### ✅ Correct: Applying Forces in Virtual Space

```javascript
// GOOD: Convert mouse to virtual first
const virtualMouseX = mouseX / scale.x;
const virtualMouseY = mouseY / scale.y;

const force = {
  x: (virtualMouseX - puck.position.x) * 0.001,
  y: (virtualMouseY - puck.position.y) * 0.001,
};
```

---

## Aspect Ratio Handling

### Challenge

What if the canvas isn't square? (e.g., 16:9 aspect ratio)

### Solution 1: Maintain Square Virtual Space

Keep 1000x1000 virtual, but canvas might be 1600x900. This creates letterboxing.

```javascript
// Calculate uniform scale (maintains aspect ratio)
const scaleX = canvas.width / VIRTUAL_WIDTH;
const scaleY = canvas.height / VIRTUAL_HEIGHT;
const uniformScale = Math.min(scaleX, scaleY);

// Center the virtual space
const offsetX = (canvas.width - VIRTUAL_WIDTH * uniformScale) / 2;
const offsetY = (canvas.height - VIRTUAL_HEIGHT * uniformScale) / 2;
```

### Solution 2: Non-Square Virtual Space

Match virtual aspect ratio to canvas aspect ratio.

```javascript
const VIRTUAL_WIDTH = 1600;
const VIRTUAL_HEIGHT = 900; // 16:9 aspect ratio

// Physics world matches canvas shape
const engine = Matter.Engine.create();
// Walls at 0, 0, 1600, 900
```

**Recommendation**: Use Solution 2 for Sling Hockey (board is rectangular).

---

## Testing the System

### Test 1: Consistent Physics

1. Open game on phone (750x1334)
2. Shoot puck with specific force
3. Measure time to cross board
4. Open game on desktop (1920x1080)
5. Shoot puck with same force
6. Time should be identical ✓

### Test 2: Input Accuracy

1. Click exact center of canvas
2. Virtual coordinates should be (500, 500) regardless of canvas size ✓

### Test 3: Visual Consistency

1. Puck should appear same relative size across devices
2. Proportions should match ✓

---

## Performance Considerations

### Scale Calculation

Only recalculate on resize, not every frame.

```javascript
// ✓ Good: Calculate once
const [scale, setScale] = useState({ x: 1, y: 1 });

// ✗ Bad: Calculate every frame
const scale = canvas.width / VIRTUAL_WIDTH;
```

### Batch Coordinate Conversions

Convert once per frame, not per body.

```javascript
// ✓ Good: Pre-calculate scale in game loop
bodies.forEach((body) => {
  const sx = body.position.x * scaleX;
  const sy = body.position.y * scaleY;
});
```

---

## Summary

1. **Define virtual space**: 1000x1000 units (or 1600x900 for 16:9)
2. **Physics in virtual**: All Matter.js calculations use virtual coordinates
3. **Scale on render**: Multiply by scale factor when drawing
4. **Scale on input**: Divide by scale factor when handling clicks/touches
5. **Benefit**: Consistent gameplay across all devices

---

**Document Version**: 1.0  
**Last Updated**: January 12, 2026  
**Implementation Status**: Core system ready for integration
