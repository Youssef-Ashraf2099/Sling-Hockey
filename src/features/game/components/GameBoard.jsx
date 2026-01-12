import { useEffect, useState, useCallback } from "react";
import Matter from "matter-js";
import { useResponsiveCanvas } from "../hooks/useResponsiveCanvas";
import { usePhysicsEngine } from "../hooks/usePhysicsEngine";
import { RenderSystem } from "../physics/RenderSystem";
import { GAME_CONFIG } from "../../../core/config/gameConstants";
import { useGameStore } from "../store/gameStore";

export default function GameBoard({ theme }) {
  const { canvasRef, containerRef, dimensions, scale, screenToVirtual } =
    useResponsiveCanvas();
  const { engine, getPuckAtPosition, applyForce, checkSlotScoring } =
    usePhysicsEngine();

  const { currentPlayer, scorePoint, switchTurn, updateTurnTime } =
    useGameStore();

  const [dragState, setDragState] = useState({
    isDragging: false,
    activePuck: null,
    anchorPoint: null,
    startPosition: null,
  });

  // Game loop with rendering
  useEffect(() => {
    if (!engine || !canvasRef.current || dimensions.width === 0) return;

    const canvas = canvasRef.current;
    const renderer = new RenderSystem(canvas, scale);
    let animationId;

    const gameLoop = () => {
      // Update physics
      Matter.Engine.update(engine, GAME_CONFIG.TIME_STEP);

      // Clamp puck velocities
      const bodies = Matter.Composite.allBodies(engine.world);
      bodies.forEach((body) => {
        if (body.label.startsWith("puck")) {
          const speed = Math.sqrt(body.velocity.x ** 2 + body.velocity.y ** 2);
          if (speed > GAME_CONFIG.MAX_VELOCITY) {
            Matter.Body.setVelocity(body, {
              x: (body.velocity.x / speed) * GAME_CONFIG.MAX_VELOCITY,
              y: (body.velocity.y / speed) * GAME_CONFIG.MAX_VELOCITY,
            });
          }
        }
      });

      // Check for scoring
      const scored = checkSlotScoring();
      if (scored.length > 0) {
        scored.forEach(({ player }) => {
          scorePoint(player);
        });
      }

      // Render frame
      renderer.render(engine, dragState, theme);

      // Update turn timer
      updateTurnTime();

      animationId = requestAnimationFrame(gameLoop);
    };

    gameLoop();

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [
    engine,
    canvasRef,
    dimensions,
    scale,
    dragState,
    theme,
    checkSlotScoring,
    scorePoint,
    updateTurnTime,
  ]);

  // Pointer down - start drag
  const handlePointerDown = useCallback(
    (e) => {
      if (!engine) return;

      const virtual = screenToVirtual(e.clientX, e.clientY);
      const puck = getPuckAtPosition(virtual.x, virtual.y);

      if (puck && puck.customData) {
        // Check if it's the current player's puck
        if (puck.customData.player !== currentPlayer) {
          return; // Can't move opponent's puck
        }

        setDragState({
          isDragging: true,
          activePuck: puck,
          anchorPoint: { x: puck.position.x, y: puck.position.y },
          startPosition: { x: virtual.x, y: virtual.y },
        });

        // Make puck kinematic while dragging
        Matter.Body.setStatic(puck, true);
      }
    },
    [engine, screenToVirtual, getPuckAtPosition, currentPlayer]
  );

  // Pointer move - drag puck
  const handlePointerMove = useCallback(
    (e) => {
      if (
        !dragState.isDragging ||
        !dragState.activePuck ||
        !dragState.anchorPoint
      )
        return;

      const virtual = screenToVirtual(e.clientX, e.clientY);

      // Calculate distance from anchor
      const dx = virtual.x - dragState.anchorPoint.x;
      const dy = virtual.y - dragState.anchorPoint.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      // Clamp to max stretch
      if (distance > GAME_CONFIG.MAX_STRETCH) {
        const angle = Math.atan2(dy, dx);
        virtual.x =
          dragState.anchorPoint.x + Math.cos(angle) * GAME_CONFIG.MAX_STRETCH;
        virtual.y =
          dragState.anchorPoint.y + Math.sin(angle) * GAME_CONFIG.MAX_STRETCH;
      }

      // Move puck
      Matter.Body.setPosition(dragState.activePuck, virtual);
    },
    [dragState, screenToVirtual]
  );

  // Pointer up - release and apply force
  const handlePointerUp = useCallback(() => {
    if (
      !dragState.isDragging ||
      !dragState.activePuck ||
      !dragState.anchorPoint
    )
      return;

    const puck = dragState.activePuck;

    // Make puck dynamic again
    Matter.Body.setStatic(puck, false);

    // Calculate elastic force
    const dx = dragState.anchorPoint.x - puck.position.x;
    const dy = dragState.anchorPoint.y - puck.position.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Apply force proportional to stretch distance
    const forceMagnitude = distance * GAME_CONFIG.FORCE_MULTIPLIER;
    const force = {
      x: (dx / distance) * forceMagnitude * distance,
      y: (dy / distance) * forceMagnitude * distance,
    };

    applyForce(puck, force);

    // Clear drag state
    setDragState({
      isDragging: false,
      activePuck: null,
      anchorPoint: null,
      startPosition: null,
    });

    // Switch turn after a delay (allow physics to settle)
    setTimeout(() => {
      const bodies = Matter.Composite.allBodies(engine.world);
      const allSleeping = bodies
        .filter((b) => b.label.startsWith("puck"))
        .every((b) => b.isSleeping || b.speed < 0.5);

      if (allSleeping) {
        switchTurn();
      }
    }, 2000);
  }, [dragState, applyForce, engine, switchTurn]);

  // Cancel drag if pointer leaves
  const handlePointerLeave = useCallback(() => {
    if (dragState.isDragging && dragState.activePuck) {
      Matter.Body.setStatic(dragState.activePuck, false);
      setDragState({
        isDragging: false,
        activePuck: null,
        anchorPoint: null,
        startPosition: null,
      });
    }
  }, [dragState]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full flex items-center justify-center"
      style={{ touchAction: "none" }} // Prevent default touch behaviors
    >
      <canvas
        ref={canvasRef}
        className="game-canvas cursor-crosshair"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerLeave}
        style={{
          maxWidth: "100%",
          maxHeight: "100%",
          objectFit: "contain",
        }}
      />
    </div>
  );
}
