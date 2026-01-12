import { useEffect, useRef, useState } from "react";
import { GAME_CONFIG } from "../../../core/config/gameConstants";

export function useResponsiveCanvas() {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [scale, setScale] = useState({ x: 1, y: 1 });

  useEffect(() => {
    const updateDimensions = () => {
      if (!containerRef.current) return;

      const container = containerRef.current;
      const containerWidth = container.clientWidth;
      const containerHeight = container.clientHeight;

      // Calculate dimensions maintaining 16:10 aspect ratio
      const aspectRatio =
        GAME_CONFIG.VIRTUAL_WIDTH / GAME_CONFIG.VIRTUAL_HEIGHT;

      let width = containerWidth;
      let height = width / aspectRatio;

      // If height exceeds container, scale by height
      if (height > containerHeight) {
        height = containerHeight;
        width = height * aspectRatio;
      }

      setDimensions({ width, height });

      // Calculate scale factors for coordinate mapping
      const scaleX = width / GAME_CONFIG.VIRTUAL_WIDTH;
      const scaleY = height / GAME_CONFIG.VIRTUAL_HEIGHT;
      setScale({ x: scaleX, y: scaleY });

      // Apply to canvas with device pixel ratio
      if (canvasRef.current) {
        const dpr = window.devicePixelRatio || 1;
        canvasRef.current.width = width * dpr;
        canvasRef.current.height = height * dpr;
        canvasRef.current.style.width = `${width}px`;
        canvasRef.current.style.height = `${height}px`;

        const ctx = canvasRef.current.getContext("2d");
        ctx.scale(dpr, dpr);
      }
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);

    // Use ResizeObserver for container changes
    const resizeObserver = new ResizeObserver(updateDimensions);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      window.removeEventListener("resize", updateDimensions);
      resizeObserver.disconnect();
    };
  }, []);

  // Helper to convert screen coordinates to virtual coordinates
  const screenToVirtual = (screenX, screenY) => {
    if (!canvasRef.current) return { x: 0, y: 0 };

    const rect = canvasRef.current.getBoundingClientRect();
    const x = (screenX - rect.left) / scale.x;
    const y = (screenY - rect.top) / scale.y;

    return { x, y };
  };

  // Helper to convert virtual coordinates to screen coordinates
  const virtualToScreen = (virtualX, virtualY) => {
    return {
      x: virtualX * scale.x,
      y: virtualY * scale.y,
    };
  };

  return {
    canvasRef,
    containerRef,
    dimensions,
    scale,
    screenToVirtual,
    virtualToScreen,
  };
}
