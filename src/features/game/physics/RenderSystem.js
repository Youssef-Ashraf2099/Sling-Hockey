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
    this.activePowerUps = options.activePowerUps || {}; // Store for visuals

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

    // Draw power-ups
    this.drawPowerUps(engine);

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
      const baseR = GAME_CONFIG.PUCK_RADIUS;
      const rScale = body.customData?.scale || 1;
      const r = baseR * rScale * scale.x;
      const isGhost = body.customData?.isGhost || false;

      const skinId = body.customData?.skinId;
      const skinData = body.customData?.skinData;

      ctx.save();
      if (isGhost) {
        ctx.globalAlpha = 0.5;
        ctx.shadowBlur = 10;
        ctx.shadowColor = "cyan";
      }

      // Draw the puck based on its skin type
      this.drawPuckSkin(ctx, x, y, r, skinId, skinData, isGhost);

      // Draw team indicators for non-visual skins
      if (body.customData && !this.hasVisualDesign(skinId)) {
        if (body.customData.team === "player") {
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
      
      ctx.restore();
    });
  }

  hasVisualDesign(skinId) {
    const visualSkins = [
      'basketball', 'football', 'volleyball', 'soccer', 'rainbow_ball', 'disco_ball', 
      'pulse_ball', 'orbit_ball', 'smiley', 'fire_emoji', 'rocket_emoji',
      'star_emoji', 'lightning_emoji', 'gem_emoji', 'crown_emoji', 'alien_emoji',
      'skull_emoji', 'rainbow_emoji', 'snowflake_emoji', 'hexagon', 'triangle',
      'star', 'octagon', 'gear', 'crystal', 'flower', 'lightning', 'spiral',
      'cross', 'moon', 'arrow', 'shield', 'heart', 'diamond_shape', 'neon_glow',
      'hacker', 'matrix_code'
    ];
    return visualSkins.includes(skinId);
  }

  drawPuckSkin(ctx, x, y, r, skinId, skinData, isGhost) {
    // Draw shadow first
    ctx.beginPath();
    ctx.arc(x + 2, y + 2, r, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(0, 0, 0, 0.25)";
    ctx.fill();

    switch (skinId) {
      case 'basketball':
        this.drawBasketball(ctx, x, y, r);
        break;
      case 'football':
        this.drawFootball(ctx, x, y, r);
        break;
      case 'volleyball':
        this.drawVolleyball(ctx, x, y, r);
        break;
      case 'soccer':
        this.drawSoccer(ctx, x, y, r);
        break;
      case 'rainbow_ball':
        this.drawRainbowBall(ctx, x, y, r);
        break;
      case 'disco_ball':
        this.drawDiscoBall(ctx, x, y, r);
        break;
      case 'pulse_ball':
        this.drawPulseBall(ctx, x, y, r);
        break;
      case 'orbit_ball':
        this.drawOrbitBall(ctx, x, y, r);
        break;
      case 'smiley':
        this.drawSmiley(ctx, x, y, r);
        break;
      case 'fire_emoji':
        this.drawFireEmoji(ctx, x, y, r);
        break;
      case 'rocket_emoji':
        this.drawRocketEmoji(ctx, x, y, r);
        break;
      case 'star_emoji':
        this.drawStarEmoji(ctx, x, y, r);
        break;
      case 'lightning_emoji':
        this.drawLightningEmoji(ctx, x, y, r);
        break;
      case 'gem_emoji':
        this.drawGemEmoji(ctx, x, y, r);
        break;
      case 'crown_emoji':
        this.drawCrownEmoji(ctx, x, y, r);
        break;
      case 'alien_emoji':
        this.drawAlienEmoji(ctx, x, y, r);
        break;
      case 'skull_emoji':
        this.drawSkullEmoji(ctx, x, y, r);
        break;
      case 'rainbow_emoji':
        this.drawRainbowEmoji(ctx, x, y, r);
        break;
      case 'snowflake_emoji':
        this.drawSnowflakeEmoji(ctx, x, y, r);
        break;
      case 'hexagon':
        this.drawHexagon(ctx, x, y, r, skinData?.color);
        break;
      case 'triangle':
        this.drawTriangle(ctx, x, y, r, skinData?.color);
        break;
      case 'star':
        this.drawStar(ctx, x, y, r, skinData?.color);
        break;
      case 'octagon':
        this.drawOctagon(ctx, x, y, r, skinData?.color);
        break;
      case 'gear':
        this.drawGear(ctx, x, y, r, skinData?.color);
        break;
      case 'crystal':
        this.drawCrystal(ctx, x, y, r, skinData?.color);
        break;
      case 'flower':
        this.drawFlower(ctx, x, y, r, skinData?.color);
        break;
      case 'lightning':
        this.drawLightningBolt(ctx, x, y, r, skinData?.color);
        break;
      case 'spiral':
        this.drawSpiral(ctx, x, y, r, skinData?.color);
        break;
      case 'cross':
        this.drawCross(ctx, x, y, r, skinData?.color);
        break;
      case 'moon':
        this.drawCrescent(ctx, x, y, r, skinData?.color);
        break;
      case 'arrow':
        this.drawArrow(ctx, x, y, r, skinData?.color);
        break;
      case 'shield':
        this.drawShield(ctx, x, y, r, skinData?.color);
        break;
      case 'heart':
        this.drawHeart(ctx, x, y, r, skinData?.color);
        break;
      case 'diamond_shape':
        this.drawDiamond(ctx, x, y, r, skinData?.color);
        break;
      case 'neon_glow':
        this.drawNeonGlow(ctx, x, y, r);
        break;
      case 'hacker':
        this.drawHacker(ctx, x, y, r);
        break;
      case 'matrix_code':
        this.drawMatrixCode(ctx, x, y, r);
        break;
      default:
        // Default circular puck
        this.drawDefaultPuck(ctx, x, y, r, skinData?.color, isGhost);
        break;
    }
  }

  drawDefaultPuck(ctx, x, y, r, color = "#ffffff", isGhost) {
    // Puck body
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();

    // Puck outline
    ctx.strokeStyle = isGhost ? "cyan" : "#000000";
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  drawBasketball(ctx, x, y, r) {
    // Large emoji that fills the ball area
    ctx.font = `${r * 2.2}px Arial`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("🏀", x, y);
  }

  drawVolleyball(ctx, x, y, r) {
    // Large emoji that fills the ball area
    ctx.font = `${r * 2.2}px Arial`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("🏐", x, y);
  }

  drawFootball(ctx, x, y, r) {
    // Large emoji that fills the ball area
    ctx.font = `${r * 2.2}px Arial`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("🏈", x, y);
  }

  drawSoccer(ctx, x, y, r) {
    // Large emoji that fills the ball area
    ctx.font = `${r * 2.2}px Arial`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("⚽", x, y);
  }

  drawRainbowBall(ctx, x, y, r) {
    // Rainbow gradient ball
    const gradient = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, 0, x, y, r);
    gradient.addColorStop(0, "#ffffff");
    gradient.addColorStop(0.2, "#ff0000");
    gradient.addColorStop(0.35, "#ff8800");
    gradient.addColorStop(0.5, "#ffff00");
    gradient.addColorStop(0.65, "#00ff00");
    gradient.addColorStop(0.8, "#0088ff");
    gradient.addColorStop(1, "#8800ff");
    
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = gradient;
    ctx.fill();
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Highlight
    ctx.beginPath();
    ctx.arc(x - r * 0.3, y - r * 0.3, r * 0.2, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
    ctx.fill();
  }

  drawDiscoBall(ctx, x, y, r) {
    // Silver base
    const gradient = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, 0, x, y, r);
    gradient.addColorStop(0, "#ffffff");
    gradient.addColorStop(0.5, "#cccccc");
    gradient.addColorStop(1, "#666666");
    
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = gradient;
    ctx.fill();

    // Mirror tiles with sparkle effect
    const time = Date.now() * 0.005;
    for (let i = 0; i < 12; i++) {
      const angle = (i * Math.PI * 2) / 12;
      const tileX = x + Math.cos(angle) * r * 0.6;
      const tileY = y + Math.sin(angle) * r * 0.6;
      const sparkle = Math.sin(time + i) * 0.5 + 0.5;
      
      ctx.fillStyle = `rgba(255, 255, 255, ${0.5 + sparkle * 0.5})`;
      ctx.fillRect(tileX - 3, tileY - 3, 6, 6);
    }

    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  drawPulseBall(ctx, x, y, r) {
    const time = Date.now() * 0.003;
    const pulse = Math.sin(time) * 0.3 + 0.7;
    
    // Outer glow
    ctx.shadowBlur = 15 * pulse;
    ctx.shadowColor = "#00ffff";
    
    // Main ball
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, r);
    gradient.addColorStop(0, "#ffffff");
    gradient.addColorStop(0.3, "#00ffff");
    gradient.addColorStop(0.7, "#0088ff");
    gradient.addColorStop(1, "#000088");
    
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = gradient;
    ctx.fill();

    // Pulsing ring
    ctx.shadowBlur = 0;
    ctx.strokeStyle = `rgba(255, 255, 255, ${pulse})`;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(x, y, r * (0.3 + pulse * 0.5), 0, Math.PI * 2);
    ctx.stroke();
  }

  drawOrbitBall(ctx, x, y, r) {
    // Main ball
    const gradient = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, 0, x, y, r);
    gradient.addColorStop(0, "#ffffff");
    gradient.addColorStop(0.5, "#4444ff");
    gradient.addColorStop(1, "#000044");
    
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = gradient;
    ctx.fill();

    // Orbit ring
    ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(x, y, r * 0.8, 0, Math.PI * 2);
    ctx.stroke();

    // Orbiting satellite
    const time = Date.now() * 0.002;
    const orbitX = x + Math.cos(time) * r * 0.8;
    const orbitY = y + Math.sin(time) * r * 0.8;
    
    ctx.fillStyle = "#ffff00";
    ctx.beginPath();
    ctx.arc(orbitX, orbitY, 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  drawSmiley(ctx, x, y, r) {
    // Yellow background
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = "#fbbf24";
    ctx.fill();
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Eyes
    ctx.fillStyle = "#000000";
    ctx.beginPath();
    ctx.arc(x - r * 0.3, y - r * 0.2, r * 0.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x + r * 0.3, y - r * 0.2, r * 0.1, 0, Math.PI * 2);
    ctx.fill();

    // Smile
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(x, y + r * 0.1, r * 0.5, 0, Math.PI);
    ctx.stroke();
  }

  drawFireEmoji(ctx, x, y, r) {
    // Fire gradient background
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, r);
    gradient.addColorStop(0, "#ff4444");
    gradient.addColorStop(0.5, "#ff8800");
    gradient.addColorStop(1, "#ffaa00");
    
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = gradient;
    ctx.fill();
    
    // Fire flame shape overlay
    ctx.fillStyle = "#ff0000";
    ctx.beginPath();
    ctx.moveTo(x, y + r);
    ctx.quadraticCurveTo(x - r * 0.5, y, x, y - r * 0.8);
    ctx.quadraticCurveTo(x + r * 0.5, y, x, y + r);
    ctx.fill();
  }

  drawRocketEmoji(ctx, x, y, r) {
    // Space background
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = "#1a1a2e";
    ctx.fill();
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Rocket body
    ctx.fillStyle = "#cccccc";
    ctx.fillRect(x - r * 0.2, y - r * 0.6, r * 0.4, r * 1.2);
    
    // Rocket tip
    ctx.fillStyle = "#ff4444";
    ctx.beginPath();
    ctx.moveTo(x, y - r * 0.8);
    ctx.lineTo(x - r * 0.2, y - r * 0.6);
    ctx.lineTo(x + r * 0.2, y - r * 0.6);
    ctx.fill();
    
    // Flames
    ctx.fillStyle = "#ffaa00";
    ctx.beginPath();
    ctx.moveTo(x - r * 0.1, y + r * 0.6);
    ctx.lineTo(x, y + r * 0.9);
    ctx.lineTo(x + r * 0.1, y + r * 0.6);
    ctx.fill();
  }

  drawStarEmoji(ctx, x, y, r) {
    // Yellow background
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = "#fbbf24";
    ctx.fill();

    // 5-pointed star
    ctx.fillStyle = "#ffff00";
    ctx.beginPath();
    for (let i = 0; i < 5; i++) {
      const angle = (i * Math.PI * 2) / 5 - Math.PI / 2;
      const outerX = x + Math.cos(angle) * r * 0.7;
      const outerY = y + Math.sin(angle) * r * 0.7;
      const innerAngle = angle + Math.PI / 5;
      const innerX = x + Math.cos(innerAngle) * r * 0.3;
      const innerY = y + Math.sin(innerAngle) * r * 0.3;
      
      if (i === 0) ctx.moveTo(outerX, outerY);
      else ctx.lineTo(outerX, outerY);
      ctx.lineTo(innerX, innerY);
    }
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  drawLightningEmoji(ctx, x, y, r) {
    // Dark background
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = "#1a1a2e";
    ctx.fill();

    // Lightning bolt
    ctx.fillStyle = "#ffff00";
    ctx.beginPath();
    ctx.moveTo(x - r * 0.2, y - r * 0.7);
    ctx.lineTo(x + r * 0.3, y - r * 0.7);
    ctx.lineTo(x - r * 0.1, y);
    ctx.lineTo(x + r * 0.2, y);
    ctx.lineTo(x - r * 0.3, y + r * 0.7);
    ctx.lineTo(x + r * 0.1, y);
    ctx.lineTo(x - r * 0.2, y - r * 0.7);
    ctx.fill();
    
    // Glow effect
    ctx.shadowBlur = 10;
    ctx.shadowColor = "#ffff00";
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  drawGemEmoji(ctx, x, y, r) {
    // Create diamond/gem shape
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, r);
    gradient.addColorStop(0, "#ffffff");
    gradient.addColorStop(0.3, "#00ffff");
    gradient.addColorStop(1, "#0066cc");
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.moveTo(x, y - r * 0.8);
    ctx.lineTo(x + r * 0.6, y - r * 0.3);
    ctx.lineTo(x + r * 0.4, y + r * 0.8);
    ctx.lineTo(x - r * 0.4, y + r * 0.8);
    ctx.lineTo(x - r * 0.6, y - r * 0.3);
    ctx.closePath();
    ctx.fill();
    
    // Gem facets
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x, y - r * 0.8);
    ctx.lineTo(x, y + r * 0.2);
    ctx.moveTo(x - r * 0.6, y - r * 0.3);
    ctx.lineTo(x + r * 0.6, y - r * 0.3);
    ctx.stroke();
  }

  drawCrownEmoji(ctx, x, y, r) {
    // Gold background
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = "#fbbf24";
    ctx.fill();

    // Crown shape
    ctx.fillStyle = "#ffdd00";
    ctx.beginPath();
    ctx.moveTo(x - r * 0.6, y + r * 0.3);
    ctx.lineTo(x - r * 0.4, y - r * 0.2);
    ctx.lineTo(x - r * 0.2, y + r * 0.1);
    ctx.lineTo(x, y - r * 0.5);
    ctx.lineTo(x + r * 0.2, y + r * 0.1);
    ctx.lineTo(x + r * 0.4, y - r * 0.2);
    ctx.lineTo(x + r * 0.6, y + r * 0.3);
    ctx.lineTo(x - r * 0.6, y + r * 0.3);
    ctx.fill();
    
    // Crown jewels
    ctx.fillStyle = "#ff0000";
    ctx.beginPath();
    ctx.arc(x, y - r * 0.2, r * 0.1, 0, Math.PI * 2);
    ctx.fill();
  }

  drawAlienEmoji(ctx, x, y, r) {
    // Green background
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = "#10b981";
    ctx.fill();

    // Alien head (oval)
    ctx.fillStyle = "#00ff88";
    ctx.beginPath();
    ctx.ellipse(x, y - r * 0.1, r * 0.6, r * 0.8, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Large eyes
    ctx.fillStyle = "#000000";
    ctx.beginPath();
    ctx.ellipse(x - r * 0.2, y - r * 0.2, r * 0.15, r * 0.25, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(x + r * 0.2, y - r * 0.2, r * 0.15, r * 0.25, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  drawSkullEmoji(ctx, x, y, r) {
    // White skull
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = "#f3f4f6";
    ctx.fill();
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Eye sockets
    ctx.fillStyle = "#000000";
    ctx.beginPath();
    ctx.arc(x - r * 0.25, y - r * 0.2, r * 0.15, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x + r * 0.25, y - r * 0.2, r * 0.15, 0, Math.PI * 2);
    ctx.fill();
    
    // Nose
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x - r * 0.1, y + r * 0.2);
    ctx.lineTo(x + r * 0.1, y + r * 0.2);
    ctx.fill();
  }

  drawRainbowEmoji(ctx, x, y, r) {
    // Sky blue background
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = "#87ceeb";
    ctx.fill();

    // Rainbow arcs
    const colors = ["#ff0000", "#ff8800", "#ffff00", "#00ff00", "#0088ff", "#4400ff", "#8800ff"];
    ctx.lineWidth = r * 0.1;
    
    for (let i = 0; i < colors.length; i++) {
      ctx.strokeStyle = colors[i];
      ctx.beginPath();
      ctx.arc(x, y + r * 0.3, r * 0.8 - i * r * 0.08, Math.PI, 0);
      ctx.stroke();
    }
  }

  drawSnowflakeEmoji(ctx, x, y, r) {
    // Ice blue background
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = "#a5f3fc";
    ctx.fill();

    // Snowflake pattern
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 2;
    
    // 6 main spokes
    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI) / 3;
      const endX = x + Math.cos(angle) * r * 0.7;
      const endY = y + Math.sin(angle) * r * 0.7;
      
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(endX, endY);
      ctx.stroke();
      
      // Small branches
      const branchX = x + Math.cos(angle) * r * 0.4;
      const branchY = y + Math.sin(angle) * r * 0.4;
      ctx.beginPath();
      ctx.moveTo(branchX + Math.cos(angle + Math.PI/4) * r * 0.2, branchY + Math.sin(angle + Math.PI/4) * r * 0.2);
      ctx.lineTo(branchX, branchY);
      ctx.lineTo(branchX + Math.cos(angle - Math.PI/4) * r * 0.2, branchY + Math.sin(angle - Math.PI/4) * r * 0.2);
      ctx.stroke();
    }
  }

  // Geometric shapes
  drawHexagon(ctx, x, y, r, color = "#10b981") {
    ctx.fillStyle = color;
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI) / 3;
      const px = x + Math.cos(angle) * r * 0.8;
      const py = y + Math.sin(angle) * r * 0.8;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  drawTriangle(ctx, x, y, r, color = "#f59e0b") {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(x, y - r * 0.8);
    ctx.lineTo(x - r * 0.7, y + r * 0.4);
    ctx.lineTo(x + r * 0.7, y + r * 0.4);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  drawStar(ctx, x, y, r, color = "#fbbf24") {
    ctx.fillStyle = color;
    ctx.beginPath();
    for (let i = 0; i < 5; i++) {
      const angle = (i * Math.PI * 2) / 5 - Math.PI / 2;
      const outerX = x + Math.cos(angle) * r * 0.8;
      const outerY = y + Math.sin(angle) * r * 0.8;
      const innerAngle = angle + Math.PI / 5;
      const innerX = x + Math.cos(innerAngle) * r * 0.4;
      const innerY = y + Math.sin(innerAngle) * r * 0.4;
      
      if (i === 0) ctx.moveTo(outerX, outerY);
      else ctx.lineTo(outerX, outerY);
      ctx.lineTo(innerX, innerY);
    }
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  drawOctagon(ctx, x, y, r, color = "#8b5cf6") {
    ctx.fillStyle = color;
    ctx.beginPath();
    for (let i = 0; i < 8; i++) {
      const angle = (i * Math.PI) / 4;
      const px = x + Math.cos(angle) * r * 0.8;
      const py = y + Math.sin(angle) * r * 0.8;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  drawGear(ctx, x, y, r, color = "#6b7280") {
    ctx.fillStyle = color;
    
    // Outer gear teeth
    ctx.beginPath();
    for (let i = 0; i < 12; i++) {
      const angle = (i * Math.PI) / 6;
      const outerR = i % 2 === 0 ? r * 0.9 : r * 0.7;
      const px = x + Math.cos(angle) * outerR;
      const py = y + Math.sin(angle) * outerR;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();
    
    // Inner circle
    ctx.fillStyle = "#333333";
    ctx.beginPath();
    ctx.arc(x, y, r * 0.3, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  drawCrystal(ctx, x, y, r, color = "#06b6d4") {
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, r);
    gradient.addColorStop(0, "#ffffff");
    gradient.addColorStop(0.5, color);
    gradient.addColorStop(1, "#003366");
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.moveTo(x, y - r * 0.9);
    ctx.lineTo(x + r * 0.5, y - r * 0.3);
    ctx.lineTo(x + r * 0.3, y + r * 0.9);
    ctx.lineTo(x - r * 0.3, y + r * 0.9);
    ctx.lineTo(x - r * 0.5, y - r * 0.3);
    ctx.closePath();
    ctx.fill();
    
    // Crystal facets
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x, y - r * 0.9);
    ctx.lineTo(x, y + r * 0.3);
    ctx.moveTo(x - r * 0.5, y - r * 0.3);
    ctx.lineTo(x + r * 0.5, y - r * 0.3);
    ctx.stroke();
  }

  drawFlower(ctx, x, y, r, color = "#ec4899") {
    // Flower petals
    ctx.fillStyle = color;
    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI) / 3;
      const petalX = x + Math.cos(angle) * r * 0.5;
      const petalY = y + Math.sin(angle) * r * 0.5;
      ctx.beginPath();
      ctx.arc(petalX, petalY, r * 0.3, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // Center
    ctx.fillStyle = "#ffff00";
    ctx.beginPath();
    ctx.arc(x, y, r * 0.2, 0, Math.PI * 2);
    ctx.fill();
  }

  drawLightningBolt(ctx, x, y, r, color = "#eab308") {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(x - r * 0.3, y - r * 0.8);
    ctx.lineTo(x + r * 0.4, y - r * 0.8);
    ctx.lineTo(x - r * 0.2, y);
    ctx.lineTo(x + r * 0.3, y);
    ctx.lineTo(x - r * 0.4, y + r * 0.8);
    ctx.lineTo(x + r * 0.2, y);
    ctx.lineTo(x - r * 0.3, y - r * 0.8);
    ctx.fill();
    
    // Glow effect
    ctx.shadowBlur = 8;
    ctx.shadowColor = color;
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  drawSpiral(ctx, x, y, r, color = "#7c3aed") {
    ctx.strokeStyle = color;
    ctx.lineWidth = 4;
    ctx.beginPath();
    
    let angle = 0;
    let radius = 0;
    ctx.moveTo(x, y);
    
    while (radius < r * 0.8) {
      angle += 0.3;
      radius += 1;
      const px = x + Math.cos(angle) * radius;
      const py = y + Math.sin(angle) * radius;
      ctx.lineTo(px, py);
    }
    ctx.stroke();
  }

  drawCross(ctx, x, y, r, color = "#ef4444") {
    ctx.fillStyle = color;
    
    // Vertical bar
    ctx.fillRect(x - r * 0.15, y - r * 0.8, r * 0.3, r * 1.6);
    
    // Horizontal bar
    ctx.fillRect(x - r * 0.8, y - r * 0.15, r * 1.6, r * 0.3);
    
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 2;
    ctx.strokeRect(x - r * 0.15, y - r * 0.8, r * 0.3, r * 1.6);
    ctx.strokeRect(x - r * 0.8, y - r * 0.15, r * 1.6, r * 0.3);
  }

  drawCrescent(ctx, x, y, r, color = "#f3f4f6") {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, r * 0.8, 0, Math.PI * 2);
    ctx.fill();
    
    // Cut out part to make crescent
    ctx.fillStyle = "#000000";
    ctx.globalCompositeOperation = "destination-out";
    ctx.beginPath();
    ctx.arc(x + r * 0.3, y, r * 0.6, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalCompositeOperation = "source-over";
    
    // Outline
    ctx.strokeStyle = "#cccccc";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x, y, r * 0.8, 0, Math.PI * 2);
    ctx.stroke();
  }

  drawArrow(ctx, x, y, r, color = "#059669") {
    ctx.fillStyle = color;
    ctx.beginPath();
    
    // Arrow head
    ctx.moveTo(x + r * 0.8, y);
    ctx.lineTo(x + r * 0.2, y - r * 0.4);
    ctx.lineTo(x + r * 0.2, y - r * 0.2);
    ctx.lineTo(x - r * 0.8, y - r * 0.2);
    ctx.lineTo(x - r * 0.8, y + r * 0.2);
    ctx.lineTo(x + r * 0.2, y + r * 0.2);
    ctx.lineTo(x + r * 0.2, y + r * 0.4);
    ctx.closePath();
    ctx.fill();
    
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  drawShield(ctx, x, y, r, color = "#1f2937") {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(x, y - r * 0.8);
    ctx.quadraticCurveTo(x + r * 0.6, y - r * 0.8, x + r * 0.6, y - r * 0.2);
    ctx.quadraticCurveTo(x + r * 0.6, y + r * 0.4, x, y + r * 0.8);
    ctx.quadraticCurveTo(x - r * 0.6, y + r * 0.4, x - r * 0.6, y - r * 0.2);
    ctx.quadraticCurveTo(x - r * 0.6, y - r * 0.8, x, y - r * 0.8);
    ctx.fill();
    
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  drawHeart(ctx, x, y, r, color = "#f43f5e") {
    ctx.fillStyle = color;
    ctx.beginPath();
    
    // Left curve
    ctx.arc(x - r * 0.25, y - r * 0.25, r * 0.35, 0, Math.PI * 2);
    ctx.fill();
    
    // Right curve
    ctx.beginPath();
    ctx.arc(x + r * 0.25, y - r * 0.25, r * 0.35, 0, Math.PI * 2);
    ctx.fill();
    
    // Bottom point
    ctx.beginPath();
    ctx.moveTo(x - r * 0.5, y);
    ctx.quadraticCurveTo(x, y + r * 0.7, x, y + r * 0.7);
    ctx.quadraticCurveTo(x, y + r * 0.7, x + r * 0.5, y);
    ctx.fill();
  }

  drawDiamond(ctx, x, y, r, color = "#a855f7") {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(x, y - r * 0.8);
    ctx.lineTo(x + r * 0.6, y);
    ctx.lineTo(x, y + r * 0.8);
    ctx.lineTo(x - r * 0.6, y);
    ctx.closePath();
    ctx.fill();
    
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  drawNeonGlow(ctx, x, y, r) {
    // Neon glow effect
    ctx.shadowBlur = 20;
    ctx.shadowColor = "#00ffff";
    
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = "#00ffff";
    ctx.fill();
    
    // Inner glow
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(x, y, r * 0.6, 0, Math.PI * 2);
    ctx.fillStyle = "#ffffff";
    ctx.fill();
    
    ctx.shadowBlur = 0;
  }

  drawHacker(ctx, x, y, r) {
    // Dark background
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = "#000000";
    ctx.fill();
    
    // Matrix-style code
    ctx.fillStyle = "#00ff41";
    ctx.font = `${r * 0.3}px monospace`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    
    const code = ["01", "10", "11", "00"];
    for (let i = 0; i < 4; i++) {
      const angle = (i * Math.PI) / 2;
      const textX = x + Math.cos(angle) * r * 0.5;
      const textY = y + Math.sin(angle) * r * 0.5;
      ctx.fillText(code[i], textX, textY);
    }
    
    // Center symbol
    ctx.font = `${r * 0.6}px monospace`;
    ctx.fillText("$", x, y);
  }

  drawMatrixCode(ctx, x, y, r) {
    // Dark green background
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = "#003300";
    ctx.fill();
    
    // Flowing code effect
    ctx.fillStyle = "#00ff41";
    ctx.font = `${r * 0.2}px monospace`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    
    const chars = "01アイウエオカキクケコ";
    for (let i = 0; i < 8; i++) {
      const angle = (i * Math.PI) / 4;
      const textX = x + Math.cos(angle) * r * 0.6;
      const textY = y + Math.sin(angle) * r * 0.6;
      const char = chars[Math.floor(Math.random() * chars.length)];
      ctx.fillText(char, textX, textY);
    }
  }

  drawPowerUps(engine) {
    const ctx = this.ctx;
    const { scale } = this;
    const bodies = Matter.Composite.allBodies(engine.world);

    bodies.forEach((body) => {
      if (body.label !== "powerup") return;

      const x = body.position.x * scale.x;
      const y = body.position.y * scale.y;
      const type = body.customData?.type;

      const powerUpData = {
        MEGA: { icon: "🍄", color: "#ff6b6b", name: "MEGA" },
        GHOST: { icon: "👻", color: "#74c0fc", name: "GHOST" },
        FREEZE: { icon: "❄️", color: "#51cf66", name: "FREEZE" },
        SPEED: { icon: "⚡", color: "#ffd43b", name: "SPEED" },
        MULTI: { icon: "🎯", color: "#ff8cc8", name: "MULTI" },
        SHIELD: { icon: "🛡️", color: "#845ef7", name: "SHIELD" },
      };

      const powerUp = powerUpData[type] || { icon: "⭐", color: "#ffffff", name: "POWER" };

      // Enhanced floating animation
      const time = Date.now() * 0.003;
      const floatY = Math.sin(time + x * 0.01) * 8;
      const pulse = Math.sin(time * 2) * 0.3 + 0.7;
      const rotate = Math.sin(time * 0.5) * 0.2;

      ctx.save();
      
      // Outer glow ring
      ctx.shadowBlur = 25;
      ctx.shadowColor = powerUp.color;
      ctx.strokeStyle = powerUp.color;
      ctx.lineWidth = 4;
      ctx.globalAlpha = pulse * 0.6;
      ctx.beginPath();
      ctx.arc(x, y + floatY, 45 * scale.x, 0, Math.PI * 2);
      ctx.stroke();
      
      // Inner glow
      ctx.shadowBlur = 15;
      ctx.shadowColor = powerUp.color;
      ctx.globalAlpha = pulse * 0.8;
      ctx.beginPath();
      ctx.arc(x, y + floatY, 35 * scale.x, 0, Math.PI * 2);
      ctx.stroke();
      
      // Reset for icon
      ctx.shadowBlur = 20;
      ctx.shadowColor = powerUp.color;
      ctx.globalAlpha = 1;
      
      // Large, animated icon
      const iconSize = (50 + pulse * 10) * scale.x;
      ctx.font = `${iconSize}px Arial`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      
      // Slight rotation for dynamic feel
      ctx.translate(x, y + floatY);
      ctx.rotate(rotate);
      ctx.fillStyle = "#ffffff";
      ctx.fillText(powerUp.icon, 0, 0);
      ctx.rotate(-rotate);
      ctx.translate(-x, -(y + floatY));
      
      // Power-up name label
      ctx.shadowBlur = 5;
      ctx.shadowColor = "#000000";
      ctx.font = `bold ${12 * scale.x}px Arial`;
      ctx.fillStyle = powerUp.color;
      ctx.fillText(powerUp.name, x, y + floatY + 60 * scale.y);
      
      ctx.restore();
    });
  }

  drawSlotMarkers(ctx) {
    const { scale } = this;
    const { VIRTUAL_WIDTH, SLOT_Y, SLOT_WIDTH } = GAME_CONFIG;
    const slotOffsetX = this.slotOffsetX || 0;
    
    // Apply slot offset for moving animation
    const slotLeftX = (VIRTUAL_WIDTH - SLOT_WIDTH) / 2 + slotOffsetX;
    const slotCenterX = (VIRTUAL_WIDTH / 2) + slotOffsetX;
    const slotY = SLOT_Y;
    const isFrozen = this.activePowerUps?.slotFrozen;

    // Draw slot markers with offset
    ctx.save();
    if (isFrozen) {
      ctx.fillStyle = "#A5F3FC"; // Ice blue
      ctx.shadowBlur = 20;
      ctx.shadowColor = "cyan";
      ctx.font = "black 18px Inter";
    } else {
      ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
      ctx.font = "14px Inter";
    }
    
    ctx.textAlign = "center";
    ctx.fillText(isFrozen ? "❄️ FROZEN ❄️" : "⬇", slotCenterX * scale.x, (slotY - 30) * scale.y);
    ctx.fillText(isFrozen ? "❄️ FROZEN ❄️" : "⬆", slotCenterX * scale.x, (slotY + 40) * scale.y);
    ctx.restore();

    // Draw slot boundary (highlight moving slot)
    ctx.save();
    ctx.setLineDash([4, 4]);
    if (isFrozen) {
      ctx.strokeStyle = "rgba(34, 211, 238, 0.8)";
      ctx.lineWidth = 4;
      ctx.setLineDash([]); // No dashes for ice block
    } else {
      ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
      ctx.lineWidth = 2;
    }

    ctx.strokeRect(
      slotLeftX * scale.x,
      (slotY - 40) * scale.y,
      SLOT_WIDTH * scale.x,
      80 * scale.y
    );
    ctx.setLineDash([]); // Reset line dash
    ctx.restore();
  }
}
