import { useEffect, useRef, useCallback } from "react";
import Matter from "matter-js";
import { useGameStore } from "../store/gameStore";
import { GAME_CONFIG } from "../../../core/config/gameConstants";
import { soundManager } from "../../../core/audio/SoundManager";

const POWERUP_TYPES = ["MEGA", "GHOST", "FREEZE"];
const SPAWN_INTERVAL = 15000; // 15 seconds
const EFFECT_DURATION = 8000;  // 8 seconds

export function usePowerUps(world, spawnPowerUp, scaleBody, setGhostMode) {
  const { gameMode, gameState, setPowerUp } = useGameStore();
  const activePowerUpsRef = useRef([]);
  const lastSideRef = useRef(0); // Alternates sides

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
      
      default:
        break;
    }
  }, [scaleBody, setGhostMode, setPowerUp]);

  const spawnRandom = useCallback(() => {
    if (gameState !== "PLAYING" || gameMode !== "PARTY") return;

    const side = lastSideRef.current;
    lastSideRef.current = side === 0 ? 1 : 0;

    const x = Math.random() * (GAME_CONFIG.VIRTUAL_WIDTH - 200) + 100;
    // Playable area: AI (450-850), Player (950-1350)
    const y = side === 0 
      ? Math.random() * 400 + 450 
      : Math.random() * 400 + 950;
    
    const type = POWERUP_TYPES[Math.floor(Math.random() * POWERUP_TYPES.length)];

    const powerupBody = spawnPowerUp(x, y, type, (puck) => {
      applyEffect(type, puck);
      Matter.Composite.remove(world, powerupBody);
      activePowerUpsRef.current = activePowerUpsRef.current.filter(p => p !== powerupBody);
    });

    if (powerupBody) {
      activePowerUpsRef.current.push(powerupBody);
      // Auto-remove after some time if not collected
      setTimeout(() => {
        if (activePowerUpsRef.current.includes(powerupBody)) {
          Matter.Composite.remove(world, powerupBody);
          activePowerUpsRef.current = activePowerUpsRef.current.filter(p => p !== powerupBody);
        }
      }, 10000);
    }
  }, [gameState, gameMode, spawnPowerUp, world, applyEffect]);

  useEffect(() => {
    if (gameMode !== "PARTY" || gameState !== "PLAYING") return;

    const interval = setInterval(spawnRandom, SPAWN_INTERVAL);
    return () => clearInterval(interval);
  }, [gameMode, gameState, spawnRandom]);

  return activePowerUpsRef.current;
}
