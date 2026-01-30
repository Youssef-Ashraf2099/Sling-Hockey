import Matter from "matter-js";
import { GAME_CONFIG } from "../../../core/config/gameConstants";

export class AIController {
  constructor(difficulty = "MEDIUM") {
    this.difficulty = difficulty;
    const settings =
      GAME_CONFIG.AI_DIFFICULTY[difficulty] || GAME_CONFIG.AI_DIFFICULTY.MEDIUM;
    this.delay = settings.delay;
    this.forceError = settings.forceError; // How much the AI miscalculates force
    this.timingError = settings.timingError; // How much the AI mistimes shots
    this.positionError = settings.positionError; // How much the AI misjudges positions
    this.maxStretch = settings.maxStretch;
    this.cooldown = settings.cooldown;
    this.isShooting = false;
    this.lastShotTime = 0;
    this.shotCount = 0;
  }

  /**
   * Calculate the best shot for AI with perfect targeting but execution errors
   * @param {Object} state - Game state with pucks and board info
   * @returns {Object} - { puck, force, targetX, targetY }
   */
  calculateBestShot(pucksRef, engine, activePuckId = null, slotOffsetX = 0, isSlotMoving = false) {
    const bodies = Matter.Composite.allBodies(engine.world);
    const centerY = GAME_CONFIG.VIRTUAL_HEIGHT / 2;

    // AI should play ANY ball on its side (top half)
    const player2Pucks = bodies.filter(
      (b) =>
        b.label.startsWith("puck") &&
        !b.customData?.scored &&
        b.position.y < centerY &&
        b.id !== activePuckId // Don't grab what the player is holding
    );

    if (player2Pucks.length === 0) return null;

    // ENHANCED STRATEGIC PUCK SELECTION with multiple factors
    const slotCenterX = GAME_CONFIG.VIRTUAL_WIDTH / 2 + slotOffsetX; // Account for moving slot!
    const slotY = GAME_CONFIG.SLOT_Y;
    
    let bestPuck = null;
    let bestScore = -1;
    
    for (const puck of player2Pucks) {
      // Factor 1: Distance to current slot position
      const distanceToSlot = Math.sqrt(
        Math.pow(puck.position.x - slotCenterX, 2) + 
        Math.pow(puck.position.y - slotY, 2)
      );
      
      // Factor 2: Angle to slot (straighter shots are better)
      const angleToSlot = Math.abs(Math.atan2(slotY - puck.position.y, slotCenterX - puck.position.x));
      
      // Factor 3: Puck velocity (prefer stationary pucks for easier targeting)
      const puckSpeed = Math.sqrt(puck.velocity.x ** 2 + puck.velocity.y ** 2);
      const velocityBonus = puckSpeed < 1 ? 2 : 1; // Bonus for stationary pucks
      
      // Factor 4: Strategic positioning (prefer pucks that can create bank shots)
      const edgeDistance = Math.min(
        puck.position.x, 
        GAME_CONFIG.VIRTUAL_WIDTH - puck.position.x
      );
      const edgeBonus = edgeDistance < 100 ? 1.5 : 1; // Bonus for edge pucks (bank shots)
      
      // Factor 5: Difficulty-based intelligence
      let difficultyMultiplier = 1;
      if (this.difficulty === "HARD") {
        // Hard AI considers player puck positions for blocking
        const playerPucks = bodies.filter(b => 
          b.label.startsWith("puck") && b.position.y > centerY
        );
        const nearPlayerPucks = playerPucks.filter(p => 
          Math.abs(p.position.x - slotCenterX) < 100
        ).length;
        difficultyMultiplier = nearPlayerPucks > 0 ? 1.3 : 1; // Bonus for defensive plays
      }
      
      // Combined scoring with all factors
      const distanceScore = 1000 / (distanceToSlot + 50);
      const angleScore = 1 / (angleToSlot + 0.1);
      const score = (distanceScore + angleScore) * velocityBonus * edgeBonus * difficultyMultiplier;
      
      if (score > bestScore) {
        bestScore = score;
        bestPuck = puck;
      }
    }

    const puck = bestPuck;
    if (!puck) return null;

    // AI rope position (top line)
    const ropeY = GAME_CONFIG.AI_ROPE_Y;
    const ropeAnchorX = GAME_CONFIG.VIRTUAL_WIDTH / 2; // Same as player - center X position of rope

    // PERFECT TARGETING - AI always aims for the exact center of the slot
    let targetX = slotCenterX;
    let targetY = slotY;
    
    // Predictive targeting for moving slot (AI always tries to be perfect)
    if (isSlotMoving) {
      // Estimate time for puck to reach slot
      const distanceToSlot = Math.sqrt(
        Math.pow(slotCenterX - puck.position.x, 2) + 
        Math.pow(slotY - puck.position.y, 2)
      );
      const estimatedTravelTime = distanceToSlot / 15; // Rough estimate based on typical puck speed
      
      // All difficulties try to predict, but execution varies
      const predictedOffset = slotOffsetX; // Could be enhanced with velocity prediction
      targetX = GAME_CONFIG.VIRTUAL_WIDTH / 2 + predictedOffset;
    }

    // EXECUTION ERRORS - This is where difficulty matters (but much smaller now)
    // Position Error: AI slightly misjudges the slot position
    const positionErrorX = (Math.random() - 0.5) * GAME_CONFIG.SLOT_WIDTH * this.positionError;
    const positionErrorY = (Math.random() - 0.5) * 20 * this.positionError; // Reduced Y error
    
    targetX += positionErrorX;
    targetY += positionErrorY;

    // NEW ROPE PHYSICS SYSTEM - Same as player!
    // Calculate where AI needs to position the puck to aim at target
    
    // Step 1: Calculate horizontal offset from rope center to target
    const targetHorizontalOffset = targetX - ropeAnchorX;
    
    // Step 2: Calculate required stretch distance based on target distance
    const distanceToTarget = Math.sqrt(
      Math.pow(targetX - puck.position.x, 2) + 
      Math.pow(targetY - puck.position.y, 2)
    );
    
    // AI calculates stretch distance based on target distance (with some error)
    let stretchDistance = Math.min(this.maxStretch, distanceToTarget * 0.3);
    
    // Force Error: AI slightly miscalculates the required stretch (much smaller errors now)
    const forceErrorMultiplier = 1 + (Math.random() - 0.5) * this.forceError;
    stretchDistance *= forceErrorMultiplier;
    
    // Step 3: Position the puck for the shot (same as player system)
    // AI positions puck at rope line first
    const aimPositionX = puck.position.x; // Keep current X position initially
    const aimPositionY = ropeY;
    
    // Then AI "drags" the puck to create the stretch
    const dragPositionX = ropeAnchorX + targetHorizontalOffset * (this.positionError > 0 ? (1 + (Math.random() - 0.5) * this.positionError) : 1);
    const dragPositionY = ropeY + stretchDistance;
    
    // Step 4: Calculate force using the SAME physics as player
    const horizontalOffset = dragPositionX - ropeAnchorX;
    
    // Vertical force is primary (based on stretch distance) - SAME AS PLAYER
    const primaryForce = stretchDistance * GAME_CONFIG.FORCE_MULTIPLIER * stretchDistance * GAME_CONFIG.VERTICAL_FORCE_DOMINANCE;
    
    // Horizontal force is subtle and proportional to horizontal offset - SAME AS PLAYER
    const maxHorizontalOffset = GAME_CONFIG.MAX_HORIZONTAL_OFFSET;
    const clampedHorizontalOffset = Math.max(-maxHorizontalOffset, Math.min(maxHorizontalOffset, horizontalOffset));
    const horizontalForce = -(clampedHorizontalOffset / maxHorizontalOffset) * primaryForce * GAME_CONFIG.HORIZONTAL_FORCE_MULTIPLIER;
    
    // For AI (shooting downward), we need to flip the Y direction
    const force = {
      x: horizontalForce, // Same horizontal calculation as player
      y: primaryForce     // Positive Y for AI (shooting downward), negative Y for player (shooting upward)
    };

    // Position the puck for the shot (pull it back from the rope)
    let pushY = ropeY - stretchDistance;
    
    // CLAMP pushY to ensure ball doesn't go through top wall
    const minPadding = GAME_CONFIG.PUCK_RADIUS + 10;
    if (pushY < minPadding) {
      pushY = minPadding;
      stretchDistance = ropeY - pushY;
    }

    this.shotCount++;
    
    // Log the AI's intention vs execution
    const intentionAccuracy = Math.sqrt(positionErrorX * positionErrorX + positionErrorY * positionErrorY);
    const forceAccuracy = Math.abs(forceErrorMultiplier - 1) * 100;
    
    console.log(`🤖 AI Shot #${this.shotCount} (${this.difficulty}): Target (${slotCenterX.toFixed(0)}, ${slotY}) → Executed (${targetX.toFixed(0)}, ${targetY.toFixed(0)})`);
    console.log(`   Position Error: ${intentionAccuracy.toFixed(1)}px, Force Error: ${forceAccuracy.toFixed(1)}%, Moving: ${isSlotMoving}`);

    return {
      puck,
      force,
      ropeY,
      pushY,
      targetX,
      targetY,
    };
  }

  /**
   * Execute AI shot with timing errors based on difficulty
   */
  async executeShot(pucksRef, engine, applyForce, activePuckId = null, slotOffsetX = 0, isSlotMoving = false) {
    const now = Date.now();
    
    // Difficulty-based cooldown
    if (this.lastShotTime && (now - this.lastShotTime) < this.cooldown) {
      return null; // Still in cooldown
    }
    
    // Reset shooting state if it's been stuck for too long (safety mechanism)
    if (this.isShooting && (now - this.lastShotTime) > 8000) {
      console.log("🤖 AI was stuck shooting, resetting...");
      this.isShooting = false;
    }
    
    if (this.isShooting) return null;
    
    this.isShooting = true;
    this.lastShotTime = now;

    return new Promise((resolve) => {
      // Base thinking time with timing errors
      let thinkTime = this.delay;
      
      // Timing Error: AI sometimes hesitates or rushes
      const timingErrorMs = (Math.random() - 0.5) * this.timingError * 1000; // Convert to milliseconds
      thinkTime += timingErrorMs;
      
      // Ensure minimum thinking time
      thinkTime = Math.max(thinkTime, 10);
      
      setTimeout(() => {
        const shot = this.calculateBestShot(pucksRef, engine, activePuckId, slotOffsetX, isSlotMoving);

        if (shot) {
          console.log(`🤖 AI executing shot with ${this.difficulty} difficulty (${this.cooldown}ms cooldown, ${timingErrorMs.toFixed(0)}ms timing error)`);
          
          // NEW ROPE PHYSICS SIMULATION - Same as player!
          
          // Step 1: Move puck to rope line (like player grabbing the puck)
          try {
            Matter.Body.setPosition(shot.puck, {
              x: shot.puck.position.x,
              y: shot.ropeY,
            });
            Matter.Body.setVelocity(shot.puck, { x: 0, y: 0 });

            // Step 2: "Drag" the puck to stretch the rope (like player dragging)
            let setupTime = this.difficulty === "HARD" ? 60 : this.difficulty === "MEDIUM" ? 80 : 120;
            
            // Setup Timing Error: AI might rush or delay the setup
            const setupTimingError = (Math.random() - 0.5) * this.timingError * setupTime;
            setupTime += setupTimingError;
            setupTime = Math.max(setupTime, 20); // Minimum setup time
            
            setTimeout(() => {
              try {
                // Calculate the drag position (where AI "drags" the puck to)
                const ropeAnchorX = GAME_CONFIG.VIRTUAL_WIDTH / 2;
                const targetHorizontalOffset = shot.targetX - ropeAnchorX;
                
                // AI positions puck as if dragging it (with some error)
                const dragPositionX = ropeAnchorX + targetHorizontalOffset * (1 + (Math.random() - 0.5) * this.positionError);
                const dragPositionY = shot.pushY; // This is ropeY + stretchDistance
                
                Matter.Body.setPosition(shot.puck, {
                  x: dragPositionX,
                  y: dragPositionY,
                });
                
                // Step 3: Release the puck (like player releasing)
                let releaseTime = this.difficulty === "HARD" ? 30 : this.difficulty === "MEDIUM" ? 50 : 80;
                
                // Release Timing Error: AI might release too early or too late
                const releaseTimingError = (Math.random() - 0.5) * this.timingError * releaseTime;
                releaseTime += releaseTimingError;
                releaseTime = Math.max(releaseTime, 10); // Minimum release time
                
                setTimeout(() => {
                  try {
                    // Apply the force using the new rope physics
                    applyForce(shot.puck, shot.force);
                    
                    console.log(`🤖 AI Rope Physics: Drag (${dragPositionX.toFixed(0)}, ${dragPositionY.toFixed(0)}), Target (${shot.targetX.toFixed(0)}, ${shot.targetY.toFixed(0)}), Force (${shot.force.x.toFixed(3)}, ${shot.force.y.toFixed(3)})`);
                    
                    // Reset shooting state immediately after shot
                    this.isShooting = false;
                    
                    resolve(shot);
                  } catch (e) {
                    console.error("AI force application error:", e);
                    this.isShooting = false;
                    resolve(null);
                  }
                }, releaseTime);
              } catch (e) {
                console.error("AI positioning error:", e);
                this.isShooting = false;
                resolve(null);
              }
            }, setupTime);
          } catch (e) {
            console.error("AI rope positioning error:", e);
            this.isShooting = false;
            resolve(null);
          }
        } else {
          console.log("🤖 AI found no valid shots");
          this.isShooting = false;
          resolve(null);
        }
      }, thinkTime);
    });
  }
}
