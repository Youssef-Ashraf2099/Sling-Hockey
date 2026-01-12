import { useEffect, useState, useCallback, useRef } from "react";
import Matter from "matter-js";
import { useResponsiveCanvas } from "../hooks/useResponsiveCanvas";
import { usePhysicsEngine } from "../hooks/usePhysicsEngine";
import { RenderSystem } from "../physics/RenderSystem";
import { AIController } from "../physics/AIController";
import { GAME_CONFIG } from "../../../core/config/gameConstants";
import { useGameStore } from "../store/gameStore";

export default function GameBoard({ theme }) {
  const { canvasRef, containerRef, dimensions, scale, screenToVirtual } =
    useResponsiveCanvas();
  const { engine, pucks, getPuckAtPosition, applyForce, checkSlotScoring } =
    usePhysicsEngine();

  const {
    gameMode,
    difficulty,
    scorePoint,
    setAiThinking,
    aiShoot,
    updateTurnTime,
  } = useGameStore();

  const [dragState, setDragState] = useState({
    isDragging: false,
    activePuck: null,
    ropeAnchor: {
      x: GAME_CONFIG.PLAYER_ROPE_ANCHOR_X,
      y: GAME_CONFIG.PLAYER_ROPE_ANCHOR_Y,
    }, // Fixed rope anchor for player
    dragPosition: null, // Where player is dragging to
  });

  const [allowPlayerShoot, setAllowPlayerShoot] = useState(true);
  const aiControllerRef = useRef(null);
  const winDetectedRef = useRef(false); // Prevent infinite loop on win

  // Initialize AI controller
  useEffect(() => {
    if (gameMode === "PVE" && difficulty) {
      aiControllerRef.current = new AIController(difficulty);
    }
  }, [gameMode, difficulty]);

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

      // Check for territory win condition
      const scored = checkSlotScoring();
      if (scored.length > 0 && !winDetectedRef.current) {
        // A player has won - all their balls are on opponent side
        winDetectedRef.current = true; // Prevent re-triggering

        scored.forEach(({ player, ballsOnOpponentSide }) => {
          console.log(
            `Player ${player} wins! All ${ballsOnOpponentSide} balls on opponent side!`
          );
          // Trigger immediate win
          if (player === 1) {
            scorePoint(1); // Trigger win for player 1
          } else {
            scorePoint(2); // Trigger win for player 2
          }
        });

        // Stop the game loop
        return;
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

  // Pointer down - grab puck and snap to rope anchor
  const handlePointerDown = useCallback(
    (e) => {
      if (!engine || dragState.isDragging) return;

      const virtual = screenToVirtual(e.clientX, e.clientY);

      // Find closest player 1 puck
      const bodies = Matter.Composite.allBodies(engine.world);
      let selectedPuck = null;
      let minDistance = 60;

      for (let body of bodies) {
        if (!body.label.startsWith("puck-p1")) continue;

        const dx = body.position.x - virtual.x;
        const dy = body.position.y - virtual.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < minDistance) {
          minDistance = distance;
          selectedPuck = body;
        }
      }

      if (selectedPuck && dragState.ropeAnchor) {
        // Move puck to rope anchor position
        const anchorPos = {
          x: dragState.ropeAnchor.x,
          y: dragState.ropeAnchor.y,
        };
        try {
          Matter.Body.setPosition(selectedPuck, anchorPos);
          Matter.Body.setVelocity(selectedPuck, { x: 0, y: 0 });
          Matter.Body.setAngularVelocity(selectedPuck, 0);

          setDragState((prev) => ({
            ...prev,
            isDragging: true,
            activePuck: selectedPuck,
            dragPosition: { x: anchorPos.x, y: anchorPos.y },
          }));
        } catch (err) {
          console.error("Error setting puck position:", err);
        }
      }
    },
    [engine, screenToVirtual, dragState.isDragging, dragState.ropeAnchor]
  );

  // Pointer move - show rope pull
  const handlePointerMove = useCallback(
    (e) => {
      if (!dragState.isDragging || !dragState.activePuck) return;

      const virtual = screenToVirtual(e.clientX, e.clientY);

      // Calculate distance from rope anchor
      const dx = virtual.x - dragState.ropeAnchor.x;
      const dy = virtual.y - dragState.ropeAnchor.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      // Clamp to max stretch
      let targetX = virtual.x;
      let targetY = virtual.y;

      if (distance > GAME_CONFIG.MAX_STRETCH) {
        const angle = Math.atan2(dy, dx);
        targetX =
          dragState.ropeAnchor.x + Math.cos(angle) * GAME_CONFIG.MAX_STRETCH;
        targetY =
          dragState.ropeAnchor.y + Math.sin(angle) * GAME_CONFIG.MAX_STRETCH;
      }

      // Update puck position and drag position for rope visual
      if (dragState.activePuck) {
        try {
          Matter.Body.setPosition(dragState.activePuck, {
            x: targetX,
            y: targetY,
          });
          Matter.Body.setVelocity(dragState.activePuck, { x: 0, y: 0 });
        } catch (err) {
          console.error("Error updating puck position during drag:", err);
          // If puck is invalid, stop dragging
          setDragState((prev) => ({
            ...prev,
            isDragging: false,
            activePuck: null,
            dragPosition: null,
          }));
          return;
        }
      }

      // Update drag position for rope visual
      setDragState((prev) => ({
        ...prev,
        dragPosition: { x: targetX, y: targetY },
      }));
    },
    [dragState, screenToVirtual]
  );

  // Pointer up - release rope and launch puck
  const handlePointerUp = useCallback(() => {
    if (
      !dragState.isDragging ||
      !dragState.activePuck ||
      !dragState.dragPosition
    )
      return;

    const puck = dragState.activePuck;

    // Verify puck still exists in engine (check both player arrays)
    const allPucks = [...(pucks.player1 || []), ...(pucks.player2 || [])];
    if (!allPucks.includes(puck)) {
      setDragState((prev) => ({
        ...prev,
        isDragging: false,
        activePuck: null,
        dragPosition: null,
      }));
      return;
    }

    // Calculate elastic force from rope anchor to current drag position
    const dx = dragState.ropeAnchor.x - dragState.dragPosition.x;
    const dy = dragState.ropeAnchor.y - dragState.dragPosition.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > 5) {
      // Apply force proportional to stretch distance (with reduced multiplier)
      const forceMagnitude = distance * GAME_CONFIG.FORCE_MULTIPLIER;
      const force = {
        x: (dx / distance) * forceMagnitude * distance,
        y: (dy / distance) * forceMagnitude * distance,
      };

      try {
        applyForce(puck, force);
      } catch (err) {
        console.error("Error applying force to puck:", err);
      }

      // If PVE mode, trigger AI response (non-blocking)
      if (
        gameMode === "PVE" &&
        aiControllerRef.current &&
        !aiControllerRef.current.isShooting
      ) {
        // AI plays asynchronously without blocking player
        setTimeout(async () => {
          try {
            aiControllerRef.current.isShooting = true;
            await aiControllerRef.current.executeShot(
              pucks,
              engine,
              applyForce
            );
          } catch (error) {
            console.error("AI shot error:", error);
          } finally {
            aiControllerRef.current.isShooting = false;
          }
        }, 800); // Faster AI response
      }
    }

    // Clear drag state immediately - don't wait for AI
    setDragState((prev) => ({
      ...prev,
      isDragging: false,
      ...prev,
      isDragging: false,
      activePuck: null,
      dragPosition: null,
    }));
  }, [dragState, applyForce, gameMode, engine, pucks, setAiThinking]);

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
