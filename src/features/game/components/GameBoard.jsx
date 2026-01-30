import { useEffect, useState, useCallback, useRef } from "react";
import Matter from "matter-js";
import { useResponsiveCanvas } from "../hooks/useResponsiveCanvas";
import { usePhysicsEngine } from "../hooks/usePhysicsEngine";
import { useSlotAnimation } from "../../../core/physics/useSlotAnimation";
import { RenderSystem } from "../physics/RenderSystem";
import { AIController } from "../physics/AIController";
import { usePowerUps } from "../hooks/usePowerUps";
import { GAME_CONFIG } from "../../../core/config/gameConstants";
import { useGameStore } from "../store/gameStore";
import { soundManager } from "../../../core/audio/SoundManager";

export default function GameBoard({ theme }) {
  const { canvasRef, containerRef, dimensions, scale, screenToVirtual } =
    useResponsiveCanvas();
  const { engine, pucks, getPuckAtPosition, applyForce, checkSlotScoring, updateDivider, resetPucks, spawnPowerUp, scaleBody, setGhostMode } =
    usePhysicsEngine();
  
  const { gameState, activePowerUps } = useGameStore();
  const isGameActive = gameState === "PLAYING";
  const { playerSlotX, aiSlotX, slotOffsetX, isMoving } = useSlotAnimation(isGameActive, activePowerUps.slotFrozen);
  
  // Power-up spawning system
  usePowerUps(engine?.world, spawnPowerUp, scaleBody, setGhostMode);
  const slotOffsetRef = useRef(0);
  
  // Sync physics divider with slot animation
  useEffect(() => {
    slotOffsetRef.current = slotOffsetX;
    if (updateDivider) {
      updateDivider(slotOffsetX);
    }
  }, [slotOffsetX, updateDivider]);

  const {
    gameMode,
    difficulty,
    scorePoint,
    setAiThinking,
    updateTurnTime,
    hideRopeDuringPlay,
    isPlayerPlaying,
    isAIPlaying,
    setIsPlayerPlaying,
    setIsAIPlaying,
  } = useGameStore();

  const [dragState, setDragState] = useState({
    isDragging: false,
    activePuck: null,
    dragPosition: null, // Where player is dragging to
    stretching: false,
    reboundTime: 0, // For rope wobble animation
    reboundSide: "player",
  });

  const [allowPlayerShoot, setAllowPlayerShoot] = useState(true);
  const aiControllerRef = useRef(null);
  const winDetectedRef = useRef(false); // Prevent infinite loop on win

  // Watch for game start to reset board
  useEffect(() => {
    if (gameState === "PLAYING") {
      winDetectedRef.current = false;
      if (resetPucks) resetPucks();
    }
  }, [gameState, resetPucks]);

  // Initialize AI controller and update when difficulty changes
  useEffect(() => {
    if ((gameMode === "PVE" || gameMode === "PARTY") && difficulty) {
      aiControllerRef.current = new AIController(difficulty);
      console.log(`🤖 AI Controller initialized with difficulty: ${difficulty}`);
    }
  }, [gameMode, difficulty]); // Added difficulty to dependency array

  // Game loop with rendering
  useEffect(() => {
    if (!engine || !canvasRef.current || dimensions.width === 0) return;

    const canvas = canvasRef.current;
    const renderer = new RenderSystem(canvas, scale);
    let animationId;

    const gameLoop = () => {
      // Update physics
      Matter.Engine.update(engine, GAME_CONFIG.TIME_STEP);

      const bodies = Matter.Composite.allBodies(engine.world);
      bodies.forEach((body) => {
        if (body.label.startsWith("puck")) {
          // Wrap velocity clamp
          const speed = Math.sqrt(body.velocity.x ** 2 + body.velocity.y ** 2);
          if (speed > GAME_CONFIG.MAX_VELOCITY) {
            Matter.Body.setVelocity(body, {
              x: (body.velocity.x / speed) * GAME_CONFIG.MAX_VELOCITY,
              y: (body.velocity.y / speed) * GAME_CONFIG.MAX_VELOCITY,
            });
          }

          // ROPE BOUNCE LOGIC (for non-dragged pucks)
          if (dragState.activePuck !== body) {
            const { PLAYER_ROPE_Y, AI_ROPE_Y } = GAME_CONFIG;
            const buffer = 5;
            
            // Player side rope bounce
            if (body.position.y > PLAYER_ROPE_Y - buffer && body.velocity.y > 0) {
              Matter.Body.setVelocity(body, { x: body.velocity.x, y: -Math.abs(body.velocity.y) * 0.8 });
              // Simple visual trigger for wobble
              setDragState(prev => ({ ...prev, reboundTime: Date.now(), reboundSide: "player" }));
            }
            // AI side rope bounce
            if (body.position.y < AI_ROPE_Y + buffer && body.velocity.y < 0) {
              Matter.Body.setVelocity(body, { x: body.velocity.x, y: Math.abs(body.velocity.y) * 0.8 });
              setDragState(prev => ({ ...prev, reboundTime: Date.now(), reboundSide: "ai" }));
            }
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
      renderer.render(engine, dragState, theme, { 
        hideRope: hideRopeDuringPlay && isAIPlaying, 
        slotOffsetX: slotOffsetRef.current,
        activePowerUps
      });

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

  // Pointer down - grab puck (any puck in player's territory)
  const handlePointerDown = useCallback(
    (e) => {
      if (!engine || dragState.isDragging) return;
      if (activePowerUps.playerFrozen) return;

      const virtual = screenToVirtual(e.clientX, e.clientY);
      const isPlayerTerritory = virtual.y > GAME_CONFIG.SLOT_Y;
      
      if (!isPlayerTerritory) return;

      // Find closest puck (regardless of team)
      const bodies = Matter.Composite.allBodies(engine.world);
      let selectedPuck = null;
      let minDistance = 60;

      for (let body of bodies) {
        if (!body.label.startsWith("puck")) continue;

        const dx = body.position.x - virtual.x;
        const dy = body.position.y - virtual.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < minDistance) {
          minDistance = distance;
          selectedPuck = body;
        }
      }

      if (selectedPuck) {
        try {
          Matter.Body.setVelocity(selectedPuck, { x: 0, y: 0 });
          Matter.Body.setAngularVelocity(selectedPuck, 0);

          setDragState({
            isDragging: true,
            activePuck: selectedPuck,
            dragPosition: { x: selectedPuck.position.x, y: selectedPuck.position.y },
            stretching: false,
          });
        } catch (err) {
          console.error("Error grabbing puck:", err);
        }
      }
    },
    [engine, screenToVirtual, dragState.isDragging]
  );

  // AI Controller for opponent moves
  useEffect(() => {
    if (gameMode !== "PVE" && gameMode !== "PARTY") return;
    if (gameState !== "PLAYING") return;

    const interval = setInterval(() => {
      // AI stops shooting if frozen powerup is active
      if (activePowerUps.slotFrozen) return;

      if (aiControllerRef.current) {
        if (aiControllerRef.current.isShooting) {
          // Don't log this every time, it's too spammy
          return;
        }
        
        console.log("🤖 AI attempting to shoot...");
        
        // Get the current active puck ID and slot position at the time of shooting
        const currentActivePuckId = dragState.activePuck?.id;
        
        aiControllerRef.current.executeShot(pucks, engine, applyForce, currentActivePuckId, slotOffsetRef.current, isMoving)
          .then((shot) => {
            if (shot) {
              console.log("🤖 AI shot successful!");
              setDragState(prev => ({ 
                ...prev, 
                reboundTime: Date.now(), 
                reboundSide: "ai" 
              }));
            } else {
              // Don't log failed shots every time, it's too spammy
            }
          })
          .catch((error) => {
            console.error("🤖 AI shot error:", error);
          });
      } else {
        console.log("🤖 AI controller not initialized");
      }
    }, 500); // Reduced to 500ms for more responsive enhanced AI

    return () => clearInterval(interval);
  }, [gameMode, gameState, pucks, engine, applyForce, activePowerUps.slotFrozen]); // Removed dragState.activePuck dependency

  // Pointer move - free drag and rope collision check with resistance
  const handlePointerMove = useCallback(
    (e) => {
      if (!dragState.isDragging || !dragState.activePuck) return;

      const virtual = screenToVirtual(e.clientX, e.clientY);
      const puck = dragState.activePuck;
      const { PLAYER_ROPE_Y, MAX_STRETCH } = GAME_CONFIG;

      let targetX = virtual.x;
      let targetY = virtual.y;

      // Handle rope stretching with resistance
      const isStretching = targetY > PLAYER_ROPE_Y;
      
      // RESTRICT DRAGGING: Cannot drag past center line into opponent territory
      const minPadding = GAME_CONFIG.PUCK_RADIUS + 5;
      if (targetY < GAME_CONFIG.SLOT_Y + minPadding) {
        targetY = GAME_CONFIG.SLOT_Y + minPadding;
      }

      if (isStretching) {
        const rawStretchDist = targetY - PLAYER_ROPE_Y;
        
        // Resistance: logarithmic lag
        // This makes the puck feel like it's pulling against a heavy weight
        const logResistance = Math.log10(rawStretchDist / 10 + 1) * 120;
        const clampedStretch = Math.min(logResistance, MAX_STRETCH);
        targetY = PLAYER_ROPE_Y + clampedStretch;
      }

      try {
        Matter.Body.setPosition(puck, { x: targetX, y: targetY });
        Matter.Body.setVelocity(puck, { x: 0, y: 0 });
        
        setDragState((prev) => ({
          ...prev,
          dragPosition: { x: targetX, y: targetY },
          stretching: isStretching,
        }));
      } catch (err) {
        console.error("Error updating puck position:", err);
        setDragState({ isDragging: false, activePuck: null, dragPosition: null, stretching: false });
      }
    },
    [dragState, screenToVirtual]
  );

  // Pointer up - release rope and launch puck
  const handlePointerUp = useCallback(() => {
    if (!dragState.isDragging || !dragState.activePuck || !dragState.dragPosition) return;

    const puck = dragState.activePuck;
    const { PLAYER_ROPE_Y, FORCE_MULTIPLIER } = GAME_CONFIG;

    // Verify puck still exists in engine
    const bodies = Matter.Composite.allBodies(engine.world);
    if (!bodies.includes(puck)) {
      setDragState({ isDragging: false, activePuck: null, dragPosition: null, stretching: false });
      return;
    }

    // Launch if it was stretching the rope
    if (dragState.stretching) {
      const { x: px, y: py } = dragState.dragPosition;
      const stretchDistance = py - PLAYER_ROPE_Y;
      
      if (stretchDistance > 5) {
        // IMPROVED PHYSICS: More tactical and less aggressive
        // This creates proper slingshot physics with subtle horizontal control
        const ropeAnchorX = GAME_CONFIG.VIRTUAL_WIDTH / 2; // Center X position of rope
        const ropeAnchorY = PLAYER_ROPE_Y;
        
        // Calculate horizontal offset from center (for subtle angle control)
        const horizontalOffset = px - ropeAnchorX; // How far left/right from center
        
        // Vertical force is primary (based on stretch distance)
        const primaryForce = stretchDistance * FORCE_MULTIPLIER * stretchDistance * GAME_CONFIG.VERTICAL_FORCE_DOMINANCE;
        
        // Horizontal force is subtle and proportional to horizontal offset
        const maxHorizontalOffset = GAME_CONFIG.MAX_HORIZONTAL_OFFSET;
        const clampedHorizontalOffset = Math.max(-maxHorizontalOffset, Math.min(maxHorizontalOffset, horizontalOffset));
        const horizontalForce = -(clampedHorizontalOffset / maxHorizontalOffset) * primaryForce * GAME_CONFIG.HORIZONTAL_FORCE_MULTIPLIER;
        
        const force = { 
          x: horizontalForce, // Subtle horizontal force based on drag position
          y: -primaryForce    // Primary upward force (negative Y = upward)
        };

        // Debug log with more readable values
        console.log(`Physics Debug: Drag (${px.toFixed(0)}, ${py.toFixed(0)}), Offset: ${horizontalOffset.toFixed(0)}, Force (${force.x.toFixed(2)}, ${force.y.toFixed(2)})`);

        try {
          applyForce(puck, force);
          
          // Sound effect
          soundManager.playLaunch(stretchDistance / 100);

          // Trigger rebound animation
          setDragState(prev => ({ ...prev, isDragging: false, activePuck: null, dragPosition: null, stretching: false, reboundTime: Date.now(), reboundSide: "player" }));
          return;
        } catch (err) {
          console.error("Error applying force:", err);
        }
      }
    }

    setDragState({ isDragging: false, activePuck: null, dragPosition: null, stretching: false, reboundTime: 0 });
  }, [dragState, applyForce, gameMode, engine, pucks]);

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
