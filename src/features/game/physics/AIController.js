import Matter from "matter-js";
import { GAME_CONFIG } from "../../../core/config/gameConstants";

export class AIController {
  constructor(difficulty = "MEDIUM") {
    this.difficulty = difficulty;
    const settings =
      GAME_CONFIG.AI_DIFFICULTY[difficulty] || GAME_CONFIG.AI_DIFFICULTY.MEDIUM;
    this.delay = settings.delay;
    this.accuracy = settings.accuracy;
    this.maxStretch = settings.maxStretch;
  }

  /**
   * Calculate the best shot for AI
   * @param {Object} state - Game state with pucks and board info
   * @returns {Object} - { puck, force, targetX, targetY }
   */
  calculateBestShot(pucksRef, engine, activePuckId = null) {
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

    // Select a random available puck
    const puck = player2Pucks[Math.floor(Math.random() * player2Pucks.length)];

    // AI rope position (top line)
    const ropeY = GAME_CONFIG.AI_ROPE_Y;

    // Calculate target position (aim for opposite side - bottom)
    const targetY = GAME_CONFIG.VIRTUAL_HEIGHT * 0.8;
    const spreadFactor = 200 * (1 - this.accuracy);

    const targetX =
      GAME_CONFIG.VIRTUAL_WIDTH / 2 + (Math.random() - 0.5) * spreadFactor;

    // For AI (top), pushing against rope means moving it UP (y < AI_ROPE_Y).
    const stretchDistance = this.maxStretch * (0.6 + Math.random() * 0.4);
    let pushY = ropeY - stretchDistance;
    
    // CLAMP pushY to ensure ball doesn't go through top wall or out of bounds
    const minPadding = GAME_CONFIG.PUCK_RADIUS + 10;
    if (pushY < minPadding) {
      pushY = minPadding;
    }

    const forceMagnitude = stretchDistance * GAME_CONFIG.FORCE_MULTIPLIER;
    // Force direction: pushing UP -> launches DOWN (positive Y)
    // We use a slight angle towards center of board if ball is on edges
    const centerX = GAME_CONFIG.VIRTUAL_WIDTH / 2;
    const dx = (centerX - puck.position.x) * 0.1;
    
    const force = {
      x: dx * 0.0001, // Slight correction towards center
      y: stretchDistance * GAME_CONFIG.FORCE_MULTIPLIER * stretchDistance * 1.5, // Increased force for more "pop"
    };

    return {
      puck,
      force,
      ropeY,
      pushY,
      targetX,
    };
  }

  /**
   * Execute AI shot with proper timing
   */
  async executeShot(pucksRef, engine, applyForce, activePuckId = null) {
    if (this.isShooting) return null;
    this.isShooting = true;

    return new Promise((resolve) => {
      // 1. Brief pause to "think"
      const thinkTime = 200 + Math.random() * 500; // Randomize reaction speed
      
      setTimeout(() => {
        const shot = this.calculateBestShot(pucksRef, engine, activePuckId);

        if (shot) {
          // 2. Move puck to rope first
          try {
            Matter.Body.setPosition(shot.puck, {
              x: shot.puck.position.x,
              y: shot.ropeY,
            });
            Matter.Body.setVelocity(shot.puck, { x: 0, y: 0 });

            // 3. Small delay to simulate "pushing"
            setTimeout(() => {
              try {
                Matter.Body.setPosition(shot.puck, {
                  x: shot.puck.position.x,
                  y: shot.pushY,
                });
                
                // 4. Release and apply force
                setTimeout(() => {
                  try {
                    applyForce(shot.puck, shot.force);
                    this.isShooting = false;
                    resolve(shot);
                  } catch (e) {
                    this.isShooting = false;
                    resolve(null);
                  }
                }, 150);
              } catch (e) {
                this.isShooting = false;
                resolve(null);
              }
            }, 300);
          } catch (e) {
            this.isShooting = false;
            resolve(null);
          }
        } else {
          this.isShooting = false;
          resolve(null);
        }
      }, thinkTime);
    });
  }
}
