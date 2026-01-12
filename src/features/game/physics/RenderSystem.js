import Matter from "matter-js";
import { GAME_CONFIG } from "../../../core/config/gameConstants";

export class RenderSystem {
  constructor(canvas, scale) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.scale = scale;
    this.frame = 0;
  }

  render(engine, dragState = null, theme = null) {
    if (!engine || !this.ctx) return;

    const ctx = this.ctx;
    const { COLORS } = GAME_CONFIG;
    const bgColor = theme?.backgroundColor || COLORS.WOOD_BIRCH;

    this.frame++;

    // Clear and draw background
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw board decorations
    this.drawBoardLines(ctx);

    // Draw all static bodies (walls, divider)
    this.drawStaticBodies(engine, theme);

    // Draw elastic band if dragging
    if (dragState && dragState.isDragging) {
      this.drawElasticBand(ctx, dragState);
    }

    // Draw all pucks
    this.drawPucks(engine);

    // Draw slot markers
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

  drawElasticBand(ctx, dragState) {
    const { scale } = this;
    const { anchorPoint, activePuck } = dragState;

    if (!anchorPoint || !activePuck) return;

    const ax = anchorPoint.x * scale.x;
    const ay = anchorPoint.y * scale.y;
    const px = activePuck.position.x * scale.x;
    const py = activePuck.position.y * scale.y;

    // Calculate distance for dynamic curve
    const dx = px - ax;
    const dy = py - ay;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Control point for quadratic curve
    const offset = Math.min(distance * 0.25, 60);
    const perpX = -dy / (distance || 1);
    const perpY = dx / (distance || 1);

    const mx = (ax + px) / 2;
    const my = (ay + py) / 2;
    const cx = mx + perpX * offset;
    const cy = my + perpY * offset;

    // Stretch percentage for color
    const stretchPercent = Math.min(
      (distance / (GAME_CONFIG.MAX_STRETCH * scale.x)) * 100,
      100
    );
    let bandColor = "#000000";
    if (stretchPercent > 80) {
      bandColor = "#ef4444"; // Red at max stretch
    } else if (stretchPercent > 50) {
      bandColor = "#fb923c"; // Orange at medium
    }

    // Draw band with shadow
    ctx.save();
    ctx.shadowColor = "rgba(0, 0, 0, 0.4)";
    ctx.shadowBlur = 6;
    ctx.shadowOffsetY = 3;

    ctx.beginPath();
    ctx.moveTo(ax, ay);
    ctx.quadraticCurveTo(cx, cy, px, py);
    ctx.strokeStyle = bandColor;
    ctx.lineWidth = 4;
    ctx.lineCap = "round";
    ctx.stroke();

    ctx.restore();

    // Draw anchor point
    ctx.beginPath();
    ctx.arc(ax, ay, 6, 0, Math.PI * 2);
    ctx.fillStyle = "#000000";
    ctx.fill();
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

      // Optional: draw team indicator
      if (body.customData) {
        ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
        ctx.beginPath();
        ctx.arc(x, y, r * 0.4, 0, Math.PI * 2);
        ctx.fill();
      }
    });
  }

  drawSlotMarkers(ctx) {
    const { scale } = this;
    const { VIRTUAL_WIDTH, SLOT_Y, SLOT_WIDTH } = GAME_CONFIG;

    const slotLeftX = (VIRTUAL_WIDTH - SLOT_WIDTH) / 2;
    const slotRightX = (VIRTUAL_WIDTH + SLOT_WIDTH) / 2;
    const slotY = SLOT_Y;

    // Draw subtle slot markers
    ctx.fillStyle = "rgba(255, 255, 255, 0.2)";
    ctx.font = "14px Inter";
    ctx.textAlign = "center";
    ctx.fillText("⬇", (VIRTUAL_WIDTH / 2) * scale.x, (slotY - 30) * scale.y);
    ctx.fillText("⬆", (VIRTUAL_WIDTH / 2) * scale.x, (slotY + 40) * scale.y);
  }
}
