import { useEffect, useRef, useCallback } from "react";
import Matter from "matter-js";
import { useGameStore } from "../store/gameStore";
import { GAME_CONFIG } from "../../../core/config/gameConstants";
import { soundManager } from "../../../core/audio/SoundManager";

const POWERUP_TYPES = ["MEGA", "GHOST", "FREEZE", "SPEED", "MULTI", "SHIELD"];
const SPAWN_INTERVAL = 8000; // Reduced from 15s to 8s for more frequent spawns
const EFFECT_DURATION = 10000;  // Increased from 8s to 10s for longer effects

export function usePowerUps(world, spawnPowerUp, scaleBody, setGhostMode) {
  const { gameMode, gameState, setPowerUp } = useGameStore();
  const activePowerUpsRef = useRef([]);
  const lastSideRef = useRef(0); // Alternates sides
  const worldRef = useRef(world); // Add world reference
  
  // Update world reference when it changes
  useEffect(() => {
    worldRef.current = world;
  }, [world]);

  const applyEffect = useCallback((type, puck) => {
    soundManager.playGoal(); // Play a nice sound for collection

    switch (type) {
      case "MEGA":
        scaleBody(puck, 2);
        setPowerUp("megaPuckId", puck.id);
        setTimeout(() => {
          scaleBody(puck, 0.5);
          setPowerUp("megaPuckId", null);
        }, EFFECT_DURATION);
        break;

      case "GHOST":
        setGhostMode(puck, true);
        setPowerUp("ghostPuckId", puck.id);
        setTimeout(() => {
          setGhostMode(puck, false);
          setPowerUp("ghostPuckId", null);
        }, EFFECT_DURATION);
        break;

      case "FREEZE":
        const collectorTeam = puck.customData?.team;
        setPowerUp("slotFrozen", true);
        
        if (collectorTeam === "player") {
          // AI is already stopped by slotFrozen in GameBoard
        } else {
          setPowerUp("playerFrozen", true);
        }

        setTimeout(() => {
          setPowerUp("slotFrozen", false);
          setPowerUp("playerFrozen", false);
        }, EFFECT_DURATION);
        break;

      case "SPEED":
        // Boost puck velocity
        const currentVel = puck.velocity;
        Matter.Body.setVelocity(puck, {
          x: currentVel.x * 1.5,
          y: currentVel.y * 1.5
        });
        // Reduce friction temporarily
        puck.frictionAir = 0.005;
        setTimeout(() => {
          puck.frictionAir = 0.02; // Reset to normal
        }, EFFECT_DURATION);
        break;

      case "MULTI":
        // Create 2 additional pucks for chaos
        const team = puck.customData?.team;
        if (team && worldRef.current) {
          for (let i = 0; i < 2; i++) {
            const angle = (Math.PI * 2 * i) / 2;
            const offsetX = Math.cos(angle) * 100;
            const offsetY = Math.sin(angle) * 100;
            
            // This would need to be implemented in the physics engine
            // For now, just add visual effect
            setPowerUp("multiEffect", true);
            setTimeout(() => setPowerUp("multiEffect", false), 3000);
          }
        }
        break;

      case "SHIELD":
        // Make puck immune to other pucks for a while
        const originalMask = puck.collisionFilter.mask;
        puck.collisionFilter.mask = GAME_CONFIG.COLLISION_CATEGORIES?.WALL || 0x0001;
        if (puck.customData) {
          puck.customData.shielded = true;
        }
        
        setTimeout(() => {
          puck.collisionFilter.mask = originalMask;
          if (puck.customData) {
            puck.customData.shielded = false;
          }
        }, EFFECT_DURATION);
        break;
      
      default:
        break;
    }
  }, [scaleBody, setGhostMode, setPowerUp]);

  const spawnRandom = useCallback(() => {
    if (gameState !== "PLAYING" || gameMode !== "PARTY") return;

    // Spawn 1-2 power-ups at once for more chaos
    const spawnCount = Math.random() < 0.3 ? 2 : 1;
    
    for (let i = 0; i < spawnCount; i++) {
      const side = lastSideRef.current;
      lastSideRef.current = side === 0 ? 1 : 0;

      const x = Math.random() * (GAME_CONFIG.VIRTUAL_WIDTH - 300) + 150;
      // Expanded playable area for more coverage
      const y = side === 0 
        ? Math.random() * 500 + 400  // AI side: 400-900
        : Math.random() * 500 + 900; // Player side: 900-1400
      
      const type = POWERUP_TYPES[Math.floor(Math.random() * POWERUP_TYPES.length)];

      const powerupBody = spawnPowerUp(x, y, type, (puck) => {
        applyEffect(type, puck);
        Matter.Composite.remove(world, powerupBody);
        activePowerUpsRef.current = activePowerUpsRef.current.filter(p => p !== powerupBody);
      });

      if (powerupBody) {
        activePowerUpsRef.current.push(powerupBody);
        // Auto-remove after longer time for more availability
        setTimeout(() => {
          if (activePowerUpsRef.current.includes(powerupBody)) {
            Matter.Composite.remove(world, powerupBody);
            activePowerUpsRef.current = activePowerUpsRef.current.filter(p => p !== powerupBody);
          }
        }, 15000); // Increased from 10s to 15s
      }
    }
  }, [gameState, gameMode, spawnPowerUp, world, applyEffect]);

  useEffect(() => {
    if (gameMode !== "PARTY" || gameState !== "PLAYING") return;

    const interval = setInterval(spawnRandom, SPAWN_INTERVAL);
    return () => clearInterval(interval);
  }, [gameMode, gameState, spawnRandom]);

  return activePowerUpsRef.current;
}
