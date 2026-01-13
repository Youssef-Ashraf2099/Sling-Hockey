import { useState, useEffect, useRef } from 'react';
import {
  GAME_CONFIG
} from '../config/gameConstants.js';

/**
 * Hook to manage dynamic slot movement
 * Slots start at center and oscillate left/right after delay
 * @param {boolean} isGameActive - Whether game is currently playing
 * @returns {Object} { playerSlotX, aiSlotX, isMoving }
 */
export function useSlotAnimation(isGameActive) {
  const [slotOffsetX, setSlotOffsetX] = useState(0);
  const [isMoving, setIsMoving] = useState(false);
  const animationStartTimeRef = useRef(null);
  const gameStartTimeRef = useRef(null);
  const animationFrameRef = useRef(null);
  const accumulatedMoveTimeRef = useRef(0);
  const lastFrameTimeRef = useRef(null);

  const BOARD_CENTER_X = GAME_CONFIG.VIRTUAL_WIDTH / 2;
  const { SLOT_WIDTH, SLOT_MOVE_DELAY, SLOT_MOVE_RANGE, ENABLE_MOVING_SLOT } = GAME_CONFIG;
  // Calculate slot positions based on offset
  const playerSlotX = BOARD_CENTER_X - SLOT_WIDTH / 2 + slotOffsetX;
  const aiSlotX = BOARD_CENTER_X - SLOT_WIDTH / 2 + slotOffsetX;

  useEffect(() => {
    if (!isGameActive || !ENABLE_MOVING_SLOT) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      setSlotOffsetX(0);
      setIsMoving(false);
      return;
    }

    // Game just started
    if (!gameStartTimeRef.current) {
      gameStartTimeRef.current = Date.now();
    }

    const INTERVAL = 5000; // 5 seconds

    const animate = () => {
      const now = Date.now();
      const elapsedSinceGameStart = now - gameStartTimeRef.current;

      // Check if we should start moving
      if (elapsedSinceGameStart >= SLOT_MOVE_DELAY) {
        // Calculate cycle phase
        // elapsedSinceMoveDelay / INTERVAL determines if we are in MOVE (even index) or PAUSE (odd index)
        const elapsedSinceMoveDelay = elapsedSinceGameStart - SLOT_MOVE_DELAY;
        const cycleIndex = Math.floor(elapsedSinceMoveDelay / INTERVAL);
        const isMovePhase = cycleIndex % 2 === 0;

        if (isMovePhase) {
          setIsMoving(true);

          if (!animationStartTimeRef.current) {
            animationStartTimeRef.current = now;
          }

          // We use accumulated move time to keep the sine wave continuous
          if (!lastFrameTimeRef.current) lastFrameTimeRef.current = now;
          const dt = now - lastFrameTimeRef.current;
          accumulatedMoveTimeRef.current += dt;
          
          const oscillation = Math.sin(accumulatedMoveTimeRef.current * (GAME_CONFIG.SLOT_MOVE_SPEED || 0.003)) * SLOT_MOVE_RANGE;
          setSlotOffsetX(oscillation);
        } else {
          // PAUSE phase - keep current slotOffsetX, reset animationStartTime for next movement
          setIsMoving(false);
          animationStartTimeRef.current = null;
        }
        
        lastFrameTimeRef.current = now;
      } else {
        setIsMoving(false);
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isGameActive]);

  // Reset when game ends
  useEffect(() => {
    if (!isGameActive) {
      gameStartTimeRef.current = null;
      animationStartTimeRef.current = null;
      accumulatedMoveTimeRef.current = 0;
      lastFrameTimeRef.current = null;
    }
  }, [isGameActive]);

  return {
    playerSlotX,
    aiSlotX,
    slotOffsetX,
    isMoving
  };
}
