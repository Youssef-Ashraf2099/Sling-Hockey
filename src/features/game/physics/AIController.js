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
  calculateBestShot(pucksRef, engine) {
    const bodies = Matter.Composite.allBodies(engine.world);
    const centerY = GAME_CONFIG.VIRTUAL_HEIGHT / 2; // 900 with new height

    // AI should only play balls on its side (top half, y < centerY)
    const player2Pucks = bodies.filter(
      (b) =>
        b.label.startsWith("puck-p2") &&
        !b.customData?.scored &&
        b.position.y < centerY // Only balls on AI side (top)
    );

    if (player2Pucks.length === 0) {
      console.log("AI: No balls available to play");
      return null;
    }

    // Select a random available puck
    const puck = player2Pucks[Math.floor(Math.random() * player2Pucks.length)];
    console.log(
      `AI: Playing ball at (${Math.round(puck.position.x)}, ${Math.round(
        puck.position.y
      )})`
    );

    // AI rope anchor position (top center)
    const ropeAnchorX = GAME_CONFIG.AI_ROPE_ANCHOR_X;
    const ropeAnchorY = GAME_CONFIG.AI_ROPE_ANCHOR_Y;

    // Calculate target position (aim for opposite side - bottom)
    const targetY = GAME_CONFIG.VIRTUAL_HEIGHT * 0.8; // Aim towards bottom half
    const spreadFactor = 50 * (1 - this.accuracy); // Less accuracy = more spread

    const targetX =
      GAME_CONFIG.VIRTUAL_WIDTH / 2 + (Math.random() - 0.5) * spreadFactor;

    // Calculate force from ROPE ANCHOR to target (like player does)
    const dx = targetX - ropeAnchorX;
    const dy = targetY - ropeAnchorY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Clamp to max stretch
    let stretchDistance = Math.min(distance * 0.3, this.maxStretch);

    // Add some randomness based on difficulty
    if (this.difficulty === "EASY") {
      stretchDistance *= 0.6 + Math.random() * 0.4;
    } else if (this.difficulty === "HARD") {
      stretchDistance *= 0.9 + Math.random() * 0.1;
    } else {
      stretchDistance *= 0.75 + Math.random() * 0.25;
    }

    const forceMagnitude = stretchDistance * GAME_CONFIG.FORCE_MULTIPLIER;
    const force = {
      x: (dx / distance) * forceMagnitude * stretchDistance,
      y: (dy / distance) * forceMagnitude * stretchDistance,
    };

    return {
      puck,
      force,
      stretchDistance,
      targetX,
      targetY,
      ropeAnchorX,
      ropeAnchorY,
    };
  }

  /**
   * Execute AI shot with proper timing
   */
  async executeShot(pucksRef, engine, applyForce) {
    return new Promise((resolve) => {
      // Wait before thinking
      setTimeout(() => {
        const shot = this.calculateBestShot(pucksRef, engine);

        if (shot) {
          // Snap ball to rope anchor first (like player does)
          Matter.Body.setPosition(shot.puck, {
            x: shot.ropeAnchorX,
            y: shot.ropeAnchorY,
          });
          Matter.Body.setVelocity(shot.puck, { x: 0, y: 0 });
          Matter.Body.setAngularVelocity(shot.puck, 0);

          // Small delay to let physics settle
          setTimeout(() => {
            // Apply the force from rope anchor
            applyForce(shot.puck, shot.force);
            console.log(`AI: Shot applied from rope anchor`);
          }, 50);
        } else {
          console.log("AI: No valid shot found");
        }

        resolve(shot);
      }, this.delay);
    });
  }
}
