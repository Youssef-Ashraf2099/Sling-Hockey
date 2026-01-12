import * as THREE from "three";

// AI Configuration
export const AI_CONFIG = {
  easy: {
    reactionDelay: 1500,
    aimAccuracy: 0.4,
    powerMultiplier: 0.6,
    slotTargeting: 0.2,
  },
  medium: {
    reactionDelay: 800,
    aimAccuracy: 0.7,
    powerMultiplier: 0.8,
    slotTargeting: 0.5,
  },
  hard: {
    reactionDelay: 400,
    aimAccuracy: 0.95,
    powerMultiplier: 1.0,
    slotTargeting: 0.9,
  },
};

// Game Constants
export const GAME_CONFIG = {
  boardWidth: 12,
  boardLength: 20,
  boardHeight: 0.5,
  wallHeight: 1,
  wallThickness: 0.3,
  puckRadius: 0.4,
  puckHeight: 0.2,
  centerBarY: 0,
  slotWidth: 2.5,
  friction: 0.98,
  maxVelocity: 15,
  minVelocity: 0.1,
};

// Physics Helper Functions
export class PhysicsEngine {
  constructor() {
    this.friction = GAME_CONFIG.friction;
  }

  // Apply friction to velocity
  applyFriction(velocity) {
    velocity.x *= this.friction;
    velocity.z *= this.friction;

    // Stop if too slow
    if (Math.abs(velocity.x) < GAME_CONFIG.minVelocity) velocity.x = 0;
    if (Math.abs(velocity.z) < GAME_CONFIG.minVelocity) velocity.z = 0;

    return velocity;
  }

  // Check collision with walls
  checkWallCollision(position, velocity) {
    const halfWidth = GAME_CONFIG.boardWidth / 2 - GAME_CONFIG.puckRadius;
    const halfLength = GAME_CONFIG.boardLength / 2 - GAME_CONFIG.puckRadius;

    // Left/Right walls
    if (position.x < -halfWidth) {
      position.x = -halfWidth;
      velocity.x = -velocity.x * 0.8; // Bounce with energy loss
    } else if (position.x > halfWidth) {
      position.x = halfWidth;
      velocity.x = -velocity.x * 0.8;
    }

    // Top/Bottom walls
    if (position.z < -halfLength) {
      position.z = -halfLength;
      velocity.z = -velocity.z * 0.8;
    } else if (position.z > halfLength) {
      position.z = halfLength;
      velocity.z = -velocity.z * 0.8;
    }

    return { position, velocity };
  }

  // Check collision with center bar (with slot)
  checkCenterBarCollision(position, velocity) {
    const barThickness = 0.3;
    const slotHalfWidth = GAME_CONFIG.slotWidth / 2;
    const barY = GAME_CONFIG.centerBarY;

    // Check if near center bar
    if (
      Math.abs(position.z - barY) <
      GAME_CONFIG.puckRadius + barThickness / 2
    ) {
      // Check if NOT in the slot
      if (Math.abs(position.x) > slotHalfWidth) {
        // Collision with bar - bounce back
        velocity.z = -velocity.z * 0.7;
        // Push away from bar
        if (position.z > barY) {
          position.z = barY + GAME_CONFIG.puckRadius + barThickness / 2;
        } else {
          position.z = barY - GAME_CONFIG.puckRadius - barThickness / 2;
        }
      }
    }

    return { position, velocity };
  }

  // Check collision between two pucks
  checkPuckCollision(puck1, puck2) {
    const dx = puck2.position.x - puck1.position.x;
    const dz = puck2.position.z - puck1.position.z;
    const distance = Math.sqrt(dx * dx + dz * dz);
    const minDistance = GAME_CONFIG.puckRadius * 2;

    if (distance < minDistance && distance > 0) {
      // Normalize collision vector
      const nx = dx / distance;
      const nz = dz / distance;

      // Relative velocity
      const dvx = puck2.velocity.x - puck1.velocity.x;
      const dvz = puck2.velocity.z - puck1.velocity.z;

      // Relative velocity in collision normal direction
      const dvn = dvx * nx + dvz * nz;

      // Do not resolve if velocities are separating
      if (dvn < 0) return;

      // Collision impulse
      const impulse = dvn / 2; // Equal mass

      // Apply impulse
      puck1.velocity.x += impulse * nx;
      puck1.velocity.z += impulse * nz;
      puck2.velocity.x -= impulse * nx;
      puck2.velocity.z -= impulse * nz;

      // Separate pucks
      const overlap = minDistance - distance;
      const separationX = (overlap / 2) * nx;
      const separationZ = (overlap / 2) * nz;

      puck1.position.x -= separationX;
      puck1.position.z -= separationZ;
      puck2.position.x += separationX;
      puck2.position.z += separationZ;
    }
  }

  // Update all pucks physics
  updatePucks(pucks, deltaTime) {
    // Apply friction and movement
    pucks.forEach((puck) => {
      if (puck.velocity) {
        this.applyFriction(puck.velocity);

        // Update position
        puck.position.x += puck.velocity.x * deltaTime;
        puck.position.z += puck.velocity.z * deltaTime;

        // Check wall collisions
        const wallResult = this.checkWallCollision(
          puck.position,
          puck.velocity
        );
        puck.position = wallResult.position;
        puck.velocity = wallResult.velocity;

        // Check center bar collision
        const barResult = this.checkCenterBarCollision(
          puck.position,
          puck.velocity
        );
        puck.position = barResult.position;
        puck.velocity = barResult.velocity;
      }
    });

    // Check puck-to-puck collisions
    for (let i = 0; i < pucks.length; i++) {
      for (let j = i + 1; j < pucks.length; j++) {
        this.checkPuckCollision(pucks[i], pucks[j]);
      }
    }
  }
}

// AI Logic
export class AIController {
  constructor(difficulty = "medium") {
    this.difficulty = difficulty;
    this.config = AI_CONFIG[difficulty];
    this.lastAction = 0;
    this.targetPuck = null;
  }

  // Calculate trajectory to target through the slot
  calculateSlotTrajectory(puckPos, targetPos) {
    const slotCenter = new THREE.Vector3(0, 0, GAME_CONFIG.centerBarY);

    // Vector from puck to slot
    const toSlot = new THREE.Vector3()
      .subVectors(slotCenter, puckPos)
      .normalize();

    // Add randomness based on difficulty
    const accuracy = this.config.aimAccuracy;
    const randomAngle = (Math.random() - 0.5) * Math.PI * (1 - accuracy);

    const cos = Math.cos(randomAngle);
    const sin = Math.sin(randomAngle);

    const aimX = toSlot.x * cos - toSlot.z * sin;
    const aimZ = toSlot.x * sin + toSlot.z * cos;

    return new THREE.Vector3(aimX, 0, aimZ).normalize();
  }

  // Find best puck to shoot
  findBestPuck(aiPucks) {
    if (aiPucks.length === 0) return null;

    // Prefer pucks closer to the center slot
    let bestPuck = aiPucks[0];
    let minDistance = Infinity;

    aiPucks.forEach((puck) => {
      const distToSlot = Math.sqrt(
        puck.position.x * puck.position.x +
          Math.pow(puck.position.z - GAME_CONFIG.centerBarY, 2)
      );

      if (distToSlot < minDistance) {
        minDistance = distToSlot;
        bestPuck = puck;
      }
    });

    return bestPuck;
  }

  // Execute AI turn
  executeTurn(aiPucks, currentTime) {
    // Check if enough time has passed
    if (currentTime - this.lastAction < this.config.reactionDelay) {
      return null;
    }

    // Find pucks that can be shot (not moving)
    const stillPucks = aiPucks.filter((puck) => {
      const speed = Math.sqrt(puck.velocity.x ** 2 + puck.velocity.z ** 2);
      return speed < 0.5;
    });

    if (stillPucks.length === 0) return null;

    // Find best puck
    const targetPuck = this.findBestPuck(stillPucks);
    if (!targetPuck) return null;

    // Calculate shot direction and power
    const shouldTargetSlot = Math.random() < this.config.slotTargeting;
    let direction;

    if (shouldTargetSlot) {
      // Aim for the slot
      direction = this.calculateSlotTrajectory(
        targetPuck.position,
        new THREE.Vector3(0, 0, -GAME_CONFIG.boardLength / 4)
      );
    } else {
      // Random shot
      direction = new THREE.Vector3(
        (Math.random() - 0.5) * 2,
        0,
        -1
      ).normalize();
    }

    // Calculate power
    const power = (5 + Math.random() * 5) * this.config.powerMultiplier;

    // Apply velocity
    targetPuck.velocity.x = direction.x * power;
    targetPuck.velocity.z = direction.z * power;

    // Update last action time
    this.lastAction = currentTime;

    return {
      puck: targetPuck,
      direction,
      power,
    };
  }
}

// Game State Manager
export class GameStateManager {
  constructor() {
    this.player1Pucks = 5;
    this.player2Pucks = 5;
    this.winner = null;
  }

  // Update puck counts based on positions
  updatePuckCounts(pucks) {
    this.player1Pucks = pucks.filter((p) => p.side === "player1").length;
    this.player2Pucks = pucks.filter((p) => p.side === "player2").length;

    // Check win conditions
    if (this.player1Pucks === 0) {
      this.winner = "player2";
    } else if (this.player2Pucks === 0) {
      this.winner = "player1";
    }

    return this.winner;
  }

  // Remove pucks that cross to the other side completely
  checkPuckElimination(pucks) {
    return pucks.filter((puck) => {
      if (puck.side === "player1") {
        // Player 1's pucks eliminated if they cross far into player 2's side
        return puck.position.z > -GAME_CONFIG.boardLength / 3;
      } else {
        // Player 2's pucks eliminated if they cross far into player 1's side
        return puck.position.z < GAME_CONFIG.boardLength / 3;
      }
    });
  }

  reset() {
    this.player1Pucks = 5;
    this.player2Pucks = 5;
    this.winner = null;
  }
}

// Utility: Calculate elastic band points
export function calculateElasticBand(startPos, endPos, segments = 20) {
  const points = [];
  const distance = startPos.distanceTo(endPos);
  const midPoint = new THREE.Vector3()
    .addVectors(startPos, endPos)
    .multiplyScalar(0.5);

  // Add curve based on pull distance
  const curvature = Math.min(distance * 0.3, 2);

  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const point = new THREE.Vector3().lerpVectors(startPos, endPos, t);

    // Add sine wave for elastic effect
    const curve = Math.sin(t * Math.PI) * curvature;
    point.y += curve;

    points.push(point);
  }

  return points;
}

export default {
  PhysicsEngine,
  AIController,
  GameStateManager,
  AI_CONFIG,
  GAME_CONFIG,
  calculateElasticBand,
};
