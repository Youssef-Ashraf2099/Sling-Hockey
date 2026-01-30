import { useState, useEffect, useRef } from 'react';
import {
  GAME_CONFIG
} from '../config/gameConstants.js';

/**
 * Hook to manage dynamic slot movement
 * Slots start at center and move randomly with 5-second cooldown
 * @param {boolean} isGameActive - Whether game is currently playing
 * @returns {Object} { playerSlotX, aiSlotX, isMoving }
 */
export function useSlotAnimation(isGameActive, isFrozen = false) {
  const [slotOffsetX, setSlotOffsetX] = useState(0);
  const [isMoving, setIsMoving] = useState(false);
  const gameStartTimeRef = useRef(null);
  const nextMoveTimeRef = useRef(null);
  const animationFrameRef = useRef(null);
  const targetOffsetRef = useRef(0);
  const startOffsetRef = useRef(0); // Track starting position for interpolation
  const moveStartTimeRef = useRef(null);
  const moveDurationRef = useRef(1000);

  const BOARD_CENTER_X = GAME_CONFIG.VIRTUAL_WIDTH / 2;
  const { SLOT_WIDTH, SLOT_MOVE_DELAY, SLOT_MOVE_RANGE, ENABLE_MOVING_SLOT } = GAME_CONFIG;
  
  // Calculate slot positions based on offset
  const playerSlotX = BOARD_CENTER_X - SLOT_WIDTH / 2 + slotOffsetX;
  const aiSlotX = BOARD_CENTER_X - SLOT_WIDTH / 2 + slotOffsetX;

  // Generate random target position
  const generateRandomTarget = () => {
    return (Math.random() - 0.5) * SLOT_MOVE_RANGE * 2; // Random position within range
  };

  // Generate random move duration
  const generateRandomDuration = () => {
    return 1000 + Math.random() * 1500; // Between 1 and 2.5 seconds
  };

  // Fixed 5-second cooldown as requested
  const SLOT_COOLDOWN = 5000; // 5 seconds between movements

  useEffect(() => {
    if (!isGameActive || !ENABLE_MOVING_SLOT || isFrozen) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      if (!isFrozen) {
        setSlotOffsetX(0);
        setIsMoving(false);
      }
      return;
    }

    // Game just started - initialize timing
    if (!gameStartTimeRef.current) {
      gameStartTimeRef.current = Date.now();
      nextMoveTimeRef.current = Date.now() + SLOT_MOVE_DELAY; // Initial delay before first move
      console.log(`🎯 Slot animation initialized. First move in ${SLOT_MOVE_DELAY}ms`);
    }

    // Prevent multiple animation loops
    if (animationFrameRef.current) {
      return;
    }

    const animate = () => {
      const now = Date.now();

      // Check if it's time to start a new move
      if (now >= nextMoveTimeRef.current && !isMoving) {
        // Start new random movement
        setIsMoving(true);
        startOffsetRef.current = slotOffsetX; // Store current position as start
        targetOffsetRef.current = generateRandomTarget();
        moveStartTimeRef.current = now;
        moveDurationRef.current = generateRandomDuration();
        
        console.log(`🎯 Slot moving from ${startOffsetRef.current.toFixed(0)} to ${targetOffsetRef.current.toFixed(0)} over ${moveDurationRef.current}ms`);
      }

      // Handle ongoing movement
      if (isMoving && moveStartTimeRef.current) {
        const moveElapsed = now - moveStartTimeRef.current;
        const moveProgress = Math.min(moveElapsed / moveDurationRef.current, 1);
        
        // Smooth easing function (ease-in-out)
        const easedProgress = moveProgress < 0.5 
          ? 2 * moveProgress * moveProgress 
          : 1 - Math.pow(-2 * moveProgress + 2, 2) / 2;
        
        // Interpolate from start position to target position
        const newOffset = startOffsetRef.current + (targetOffsetRef.current - startOffsetRef.current) * easedProgress;
        setSlotOffsetX(newOffset);

        // Check if movement is complete
        if (moveProgress >= 1) {
          setIsMoving(false);
          setSlotOffsetX(targetOffsetRef.current);
          
          // Schedule next move with 5-second cooldown
          nextMoveTimeRef.current = now + SLOT_COOLDOWN;
          
          console.log(`🎯 Slot movement complete at offset ${targetOffsetRef.current.toFixed(0)}. Next move in ${SLOT_COOLDOWN}ms (5 seconds)`);
        }
      }

      // Continue animation loop
      if (isGameActive && ENABLE_MOVING_SLOT && !isFrozen) {
        animationFrameRef.current = requestAnimationFrame(animate);
      } else {
        animationFrameRef.current = null;
      }
    };

    // Start the animation loop
    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, [isGameActive, isFrozen, ENABLE_MOVING_SLOT]); // Removed slotOffsetX from dependencies to prevent loop recreation

  // Reset when game ends
  useEffect(() => {
    if (!isGameActive) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      gameStartTimeRef.current = null;
      nextMoveTimeRef.current = null;
      moveStartTimeRef.current = null;
      targetOffsetRef.current = 0;
      startOffsetRef.current = 0;
      setSlotOffsetX(0);
      setIsMoving(false);
      console.log(`🎯 Slot animation reset - game ended`);
    }
  }, [isGameActive]);

  // Debug logging for slot state
  useEffect(() => {
    if (isGameActive && ENABLE_MOVING_SLOT) {
      console.log(`🎯 Slot state: offset=${slotOffsetX.toFixed(1)}, moving=${isMoving}, frozen=${isFrozen}`);
    }
  }, [slotOffsetX, isMoving, isGameActive, isFrozen]);

  return {
    playerSlotX,
    aiSlotX,
    slotOffsetX,
    isMoving
  };
}
