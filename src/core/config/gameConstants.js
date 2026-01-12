export const GAME_CONFIG = {
  // Virtual coordinate system
  VIRTUAL_WIDTH: 1000,
  VIRTUAL_HEIGHT: 1800, // Increased from 1600 to give more space

  // Physics
  GRAVITY: { x: 0, y: 0 },
  TIME_STEP: 1000 / 60,

  // Puck properties (scaled up)
  PUCK_RADIUS: 30,
  PUCK_COUNT: 10, // 5 per player

  // Elastic band (Slingshot style) - FORCE REDUCED TO FIX COLLISIONS
  MAX_STRETCH: 400, // INCREASED for more drag space
  FORCE_MULTIPLIER: 0.00002, // REDUCED further for better control
  ELASTIC_STIFFNESS: 0.1,
  ELASTIC_DAMPING: 0.05,

  // Rope anchors (slingshots for player and AI) - moved away from edges
  PLAYER_ROPE_ANCHOR_Y: 1600, // Moved up from 1480 (away from bottom edge)
  PLAYER_ROPE_ANCHOR_X: 500, // Center of player area
  AI_ROPE_ANCHOR_Y: 200, // Moved down from 120 (away from top edge)
  AI_ROPE_ANCHOR_X: 500, // Center of AI area

  // Backward compatibility
  ROPE_ANCHOR_Y: 1600,
  ROPE_ANCHOR_X: 500,

  // Slot/Goal
  SLOT_WIDTH: 150,
  SLOT_Y: 900, // Center line - adjusted for new height
  CORNER_RADIUS: 15,
  DIVIDER_THICKNESS: 15,

  // Walls
  WALL_THICKNESS: 30,

  // Physics values (improved collision)
  PUCK_RESTITUTION: 0.85,
  PUCK_FRICTION: 0.03,
  PUCK_FRICTION_AIR: 0.001,
  PUCK_FRICTION_STATIC: 0.3,
  PUCK_DENSITY: 0.004,

  WALL_RESTITUTION: 0.95,
  WALL_FRICTION: 0.001,

  DIVIDER_RESTITUTION: 0.7,
  DIVIDER_FRICTION: 0.05,

  // Colors
  COLORS: {
    WOOD_BIRCH: "#d2b48c",
    WOOD_DARK: "#8b7355",
    WOOD_FRAME: "#5a4a3a",
    BAND_BLACK: "#000000",
    PUCK_WHITE: "#ffffff",
    PUCK_BLACK: "#1f1f1f",
    DIVIDER: "#8b4513",
  },

  // Game rules
  TURN_TIME: 30, // seconds per turn
  MAX_VELOCITY: 20, // clamp puck speed
  SLEEP_THRESHOLD: 0.5,
  STUCK_TIMEOUT: 180, // frames (3 seconds at 60fps)

  // AI difficulty settings
  AI_DIFFICULTY: {
    EASY: { delay: 1500, accuracy: 0.7, maxStretch: 200 },
    MEDIUM: { delay: 1000, accuracy: 0.85, maxStretch: 250 },
    HARD: { delay: 600, accuracy: 0.95, maxStretch: 300 },
  },
};

export const PLAYER_POSITIONS = {
  PLAYER_1: {
    // Bottom player (white pucks)
    pucks: [
      { x: 200, y: 1550 },
      { x: 400, y: 1550 },
      { x: 500, y: 1600 },
      { x: 600, y: 1550 },
      { x: 800, y: 1550 },
    ],
    anchorY: 1650,
    color: GAME_CONFIG.COLORS.PUCK_WHITE,
    team: "white",
  },
  PLAYER_2: {
    // Top player (black pucks)
    pucks: [
      { x: 200, y: 250 },
      { x: 400, y: 250 },
      { x: 500, y: 200 },
      { x: 600, y: 250 },
      { x: 800, y: 250 },
    ],
    anchorY: 150,
    color: GAME_CONFIG.COLORS.PUCK_BLACK,
    team: "black",
  },
};

export const COLLISION_CATEGORIES = {
  PUCK: 0x0001,
  WALL: 0x0002,
  DIVIDER: 0x0004,
  ELASTIC: 0x0008,
};
