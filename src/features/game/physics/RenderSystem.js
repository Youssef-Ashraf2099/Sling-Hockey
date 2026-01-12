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

    // Draw rope anchors (slingshots for both players)
    this.drawRopeAnchor(ctx, "player");
    this.drawRopeAnchor(ctx, "ai");

    // Draw elastic band (rope) if dragging
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

  drawRopeAnchor(ctx, side = "player") {
    const { scale } = this;
    const {
      PLAYER_ROPE_ANCHOR_X,
      PLAYER_ROPE_ANCHOR_Y,
      AI_ROPE_ANCHOR_X,
      AI_ROPE_ANCHOR_Y,
      VIRTUAL_WIDTH,
    } = GAME_CONFIG;

    // Choose anchor position based on side
    const anchorX = side === "player" ? PLAYER_ROPE_ANCHOR_X : AI_ROPE_ANCHOR_X;
    const anchorY = side === "player" ? PLAYER_ROPE_ANCHOR_Y : AI_ROPE_ANCHOR_Y;

    const centerX = anchorX * scale.x;
    const centerY = anchorY * scale.y;

    // Slingshot width (distance between anchor points)
    const slingshotWidth = 200 * scale.x;
    const leftX = centerX - slingshotWidth / 2;
    const rightX = centerX + slingshotWidth / 2;

    // Slingshot anchor points (where the bands attach)
    const offset = side === "player" ? -20 : 20; // Player goes up, AI goes down
    const anchorPointY = centerY + offset * scale.y;

    ctx.save();

    // Draw left anchor post
    ctx.fillStyle = "rgba(139, 69, 19, 0.8)"; // Brown
    ctx.beginPath();
    ctx.arc(leftX, anchorPointY, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "rgba(0, 0, 0, 0.9)";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw right anchor post
    ctx.beginPath();
    ctx.arc(rightX, anchorPointY, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Removed resting band - only show when dragging

    ctx.restore();
  }

  drawElasticBand(ctx, dragState) {
    const { scale } = this;
    const { ropeAnchor, activePuck, dragPosition } = dragState;

    if (!ropeAnchor || !activePuck || !dragPosition) return;

    const centerX = ropeAnchor.x * scale.x;
    const centerY = ropeAnchor.y * scale.y;

    // Slingshot anchor points (matching drawRopeAnchor)
    const slingshotWidth = 200 * scale.x;
    const leftX = centerX - slingshotWidth / 2;
    const rightX = centerX + slingshotWidth / 2;
    const anchorY = centerY - 20 * scale.y;

    const px = dragPosition.x * scale.x;
    const py = dragPosition.y * scale.y;

    // Calculate distance for stretch feedback
    const dx = px - centerX;
    const dy = py - centerY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Stretch percentage for visual feedback
    const stretchPercent = Math.min(
      (distance / (GAME_CONFIG.MAX_STRETCH * scale.x)) * 100,
      100
    );

    // Color based on stretch
    let ropeColor = "#654321"; // Brown
    let ropeWidth = 4;

    if (stretchPercent > 80) {
      ropeColor = "#ef4444"; // Red at max stretch
      ropeWidth = 6;
    } else if (stretchPercent > 50) {
      ropeColor = "#fb923c"; // Orange at medium
      ropeWidth = 5;
    }

    ctx.save();
    ctx.strokeStyle = ropeColor;
    ctx.lineWidth = ropeWidth;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    // Draw LEFT band (from left anchor to ball)
    ctx.beginPath();
    ctx.moveTo(leftX, anchorY);
    ctx.lineTo(px, py);
    ctx.stroke();

    // Draw RIGHT band (from right anchor to ball)
    ctx.beginPath();
    ctx.moveTo(rightX, anchorY);
    ctx.lineTo(px, py);
    ctx.stroke();

    ctx.restore();

    // Draw ball highlight at drag position
    ctx.save();
    ctx.beginPath();
    ctx.arc(px, py, (GAME_CONFIG.PUCK_RADIUS + 3) * scale.x, 0, Math.PI * 2);
    ctx.strokeStyle = ropeColor;
    ctx.lineWidth = 3;
    ctx.globalAlpha = 0.5;
    ctx.stroke();
    ctx.restore();
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
