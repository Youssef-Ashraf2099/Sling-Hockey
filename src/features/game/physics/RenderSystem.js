import Matter from "matter-js";
import { GAME_CONFIG } from "../../../core/config/gameConstants";

export class RenderSystem {
  constructor(canvas, scale) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.scale = scale;
    this.frame = 0;
  }

  render(engine, dragState = null, theme = null, options = {}) {
    if (!engine || !this.ctx) return;

    const ctx = this.ctx;
    const { COLORS } = GAME_CONFIG;
    const bgColor = theme?.backgroundColor || COLORS.WOOD_BIRCH;
    const { hideRope = false, slotOffsetX = 0 } = options; // Hide rope when opponent plays, slot offset for animation

    this.frame++;
    this.slotOffsetX = slotOffsetX; // Store for use in drawSlotMarkers

    // Clear and draw background
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw board decorations
    this.drawBoardLines(ctx);

    // Draw all static bodies (walls, divider)
    this.drawStaticBodies(engine, theme);

    // Draw rope anchors (horizontal red lines)
    if (!hideRope) {
      // Only draw wobble/resting line if NOT stretching on that side
      const playerStretching = dragState && dragState.isDragging && (dragState.dragPosition.y > GAME_CONFIG.PLAYER_ROPE_Y);
      const aiStretching = dragState && dragState.isDragging && (dragState.dragPosition.y < GAME_CONFIG.AI_ROPE_Y);
      
      if (!playerStretching) this.drawRopeWithWobble(ctx, "player", dragState);
      if (!aiStretching) this.drawRopeWithWobble(ctx, "ai", dragState);
    }

    // Draw elastic band (rope) if dragging
    if (dragState && dragState.isDragging && !hideRope) {
      this.drawElasticBand(ctx, dragState);
    }

    // Draw all pucks
    this.drawPucks(engine);

    // Draw slot markers with animation
    this.drawSlotMarkers(ctx);
  }

  drawBoardLines(ctx) {
    const { scale } = this;
    const { VIRTUAL_WIDTH, VIRTUAL_HEIGHT, SLOT_Y } = GAME_CONFIG;

    ctx.strokeStyle = "rgba(0, 0, 0, 0.1)";
    ctx.lineWidth = 2;

    // Horizontal decorative lines (matching the image)
    const lineCount = 6;
    for (let i = 0; i < lineCount; i++) {
      const y = (VIRTUAL_HEIGHT / (lineCount + 1)) * (i + 1);
      if (Math.abs(y - SLOT_Y) > 100) {
        // Don't draw over center divider
        ctx.beginPath();
        ctx.moveTo(0, y * scale.y);
        ctx.lineTo(VIRTUAL_WIDTH * scale.x, y * scale.y);
        ctx.stroke();
      }
    }
  }

  drawStaticBodies(engine, theme) {
    const ctx = this.ctx;
    const { scale } = this;
    const bodies = Matter.Composite.allBodies(engine.world);
    const { COLORS } = GAME_CONFIG;
    const dividerColor = theme?.dividerColor || COLORS.DIVIDER;
    const wallColor = theme?.wallColor || COLORS.WOOD_DARK;

    bodies.forEach((body) => {
      if (!body.isStatic) return;

      const vertices = body.vertices;

      ctx.beginPath();
      ctx.moveTo(vertices[0].x * scale.x, vertices[0].y * scale.y);

      for (let i = 1; i < vertices.length; i++) {
        ctx.lineTo(vertices[i].x * scale.x, vertices[i].y * scale.y);
      }

      ctx.closePath();

      // Color based on type
      if (body.label.startsWith("divider") || body.label.startsWith("corner")) {
        ctx.fillStyle = dividerColor;
      } else {
        ctx.fillStyle = wallColor;
      }

      ctx.fill();
      ctx.strokeStyle = "rgba(0, 0, 0, 0.3)";
      ctx.lineWidth = 2;
      ctx.stroke();
    });
  }

  drawRopeWithWobble(ctx, side = "player", dragState = null) {
    const { scale } = this;
    const { PLAYER_ROPE_Y, AI_ROPE_Y, VIRTUAL_WIDTH, COLORS } = GAME_CONFIG;

    const y = side === "player" ? PLAYER_ROPE_Y : AI_ROPE_Y;
    const canvasY = y * scale.y;
    const vw = VIRTUAL_WIDTH * scale.x;

    let wobbleY = 0;

    // Check if we are in a rebound state
    if (dragState && dragState.reboundTime > 0 && dragState.reboundSide === side) {
      const elapsed = Date.now() - dragState.reboundTime;
      const duration = 1000;

      if (elapsed < duration) {
        const amplitude = 50 * (1 - elapsed / duration) * scale.y;
        const frequency = 0.05;
        wobbleY = Math.sin(elapsed * frequency) * amplitude;
      }
    }

    ctx.save();
    ctx.strokeStyle = COLORS.ROPE;
    ctx.lineWidth = 10 * scale.x; // Match base stretched thickness
    ctx.lineCap = "round";
    
    if (Math.abs(wobbleY) > 0.1) {
      ctx.beginPath();
      ctx.moveTo(0, canvasY);
      ctx.quadraticCurveTo(vw / 2, canvasY + wobbleY, vw, canvasY);
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.moveTo(0, canvasY);
      ctx.lineTo(vw, canvasY);
      ctx.stroke();
    }
    
    ctx.restore();
  }

  drawElasticBand(ctx, dragState) {
    const { scale } = this;
    const { activePuck, dragPosition } = dragState;

    if (!activePuck || !dragPosition) return;

    const { PLAYER_ROPE_Y, AI_ROPE_Y, VIRTUAL_WIDTH, COLORS, PUCK_RADIUS } = GAME_CONFIG;
    
    // Determine which side we're on based on position
    const isPlayerSide = dragPosition.y > GAME_CONFIG.SLOT_Y;
    const ropeY = isPlayerSide ? PLAYER_ROPE_Y : AI_ROPE_Y;
    
    const px = dragPosition.x * scale.x;
    const py = dragPosition.y * scale.y;
    const r = PUCK_RADIUS * scale.x;
    const ry = ropeY * scale.y;
    const vw = VIRTUAL_WIDTH * scale.x;

    // Only draw stretch if puck is pushing against the rope
    const stretchDist = isPlayerSide ? (dragPosition.y - ropeY) : (ropeY - dragPosition.y);
    const isStretching = stretchDist > 0;

    if (isStretching) {
      // Dynamic thickness: decreases slightly as stretch increases
      const baseWidth = 10 * scale.x;
      const thickness = Math.max(4, baseWidth * (1 - (stretchDist / 1200)));

      ctx.save();
      ctx.strokeStyle = COLORS.ROPE;
      ctx.lineWidth = thickness;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      // Draw the rope as two straight segments to the puck for a "normal" tension feel
      ctx.beginPath();
      ctx.moveTo(0, ry);
      
      // We go to the edge of the puck to make it look like it's wrapping
      ctx.lineTo(px, py);
      ctx.lineTo(vw, ry);
      
      ctx.stroke();
      ctx.restore();

      // Draw puck highlight
      ctx.save();
      ctx.beginPath();
      ctx.arc(px, py, (PUCK_RADIUS + 2) * scale.x, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.restore();
    }
  }

  drawPucks(engine) {
    const ctx = this.ctx;
    const { scale } = this;
    const bodies = Matter.Composite.allBodies(engine.world);

    bodies.forEach((body) => {
      if (!body.label.startsWith("puck")) return;

      const x = body.position.x * scale.x;
      const y = body.position.y * scale.y;
      const r = GAME_CONFIG.PUCK_RADIUS * scale.x;

      const skinId = body.customData?.skinId;
      const isSport = ["basketball", "football", "volleyball"].includes(skinId);

      // Only draw background circle and outline if NOT a sport skin
      if (!isSport) {
        // Shadow
        ctx.beginPath();
        ctx.arc(x + 2, y + 2, r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(0, 0, 0, 0.25)";
        ctx.fill();

        // Puck body
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fillStyle = body.render.fillStyle || "#ffffff";
        ctx.fill();

        // Puck outline
        ctx.strokeStyle = "#000000";
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      // Draw icons or team indicators
      if (body.customData) {
        const icons = {
          basketball: "🏀",
          football: "🏈",
          volleyball: "🏐",
          gold: "✨",
        };
        
        if (icons[skinId]) {
          // Draw icon larger to fill the shape
          const fontSize = isSport ? r * 2.2 : r;
          ctx.font = `${fontSize}px Inter`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          
          // Draw a subtle shadow for sports emojis to make them pop
          if (isSport) {
            ctx.shadowColor = "rgba(0,0,0,0.5)";
            ctx.shadowBlur = 10;
            ctx.shadowOffsetX = 2;
            ctx.shadowOffsetY = 2;
          }
          
          ctx.fillText(icons[skinId], x, y);
          
          // Reset shadow
          ctx.shadowBlur = 0;
          ctx.shadowOffsetX = 0;
          ctx.shadowOffsetY = 0;
        } else if (body.customData.team === "player") {
          // Default player highlight
          ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
          ctx.beginPath();
          ctx.arc(x, y, r * 0.4, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Opponent indicator
          ctx.font = `${r * 0.8}px Inter`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillStyle = "white";
          ctx.fillText("AI", x, y);
        }
      }
    });
  }

  drawSlotMarkers(ctx) {
    const { scale } = this;
    const { VIRTUAL_WIDTH, SLOT_Y, SLOT_WIDTH } = GAME_CONFIG;
    const slotOffsetX = this.slotOffsetX || 0;

    // Apply slot offset for moving animation
    const slotLeftX = (VIRTUAL_WIDTH - SLOT_WIDTH) / 2 + slotOffsetX;
    const slotRightX = (VIRTUAL_WIDTH + SLOT_WIDTH) / 2 + slotOffsetX;
    const slotCenterX = (VIRTUAL_WIDTH / 2) + slotOffsetX;
    const slotY = SLOT_Y;

    // Draw slot markers with offset
    ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
    ctx.font = "14px Inter";
    ctx.textAlign = "center";
    ctx.fillText("⬇", slotCenterX * scale.x, (slotY - 30) * scale.y);
    ctx.fillText("⬆", slotCenterX * scale.x, (slotY + 40) * scale.y);

    // Draw slot boundary (highlight moving slot)
    ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 4]);
    ctx.strokeRect(
      slotLeftX * scale.x,
      (slotY - 40) * scale.y,
      SLOT_WIDTH * scale.x,
      80 * scale.y
    );
    ctx.setLineDash([]); // Reset line dash
  }
}
