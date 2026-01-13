export const GAME_CONFIG = {
  // Virtual coordinate system
  VIRTUAL_WIDTH: 1200, // Increased from 1000 to use more horizontal space
  VIRTUAL_HEIGHT: 1800,

  // Physics
  GRAVITY: { x: 0, y: 0 },
  TIME_STEP: 1000 / 60,

  // Puck properties (scaled up)
  PUCK_RADIUS: 40,
  PUCK_COUNT: 10, // 5 per player

  // Elastic band (Slingshot style) - FORCE REDUCED TO FIX COLLISIONS
  MAX_STRETCH: 400, // INCREASED for more drag space
  FORCE_MULTIPLIER: 0.00002, // REDUCED further for better control
  ELASTIC_STIFFNESS: 0.1,
  ELASTIC_DAMPING: 0.05,

  // Rope anchors (horizontal red lines) - moved towards center for more pull space
  PLAYER_ROPE_Y: 1450, // Moved up from 1650 to give 350 units of pull space
  AI_ROPE_Y: 350,   // Moved down from 150 to give 350 units of pull space
  ROPE_STIFFNESS: 0.1,

  // Backward compatibility
  ROPE_ANCHOR_Y: 1600,
  ROPE_ANCHOR_X: 500,

  // Slot/Goal
  SLOT_WIDTH: 150,
  SLOT_Y: 900, // Center line - adjusted for new height
  CORNER_RADIUS: 15,
  DIVIDER_THICKNESS: 15,
  
  // Dynamic slot movement (challenge feature)
  ENABLE_MOVING_SLOT: true, // Enable/disable slot movement
  SLOT_MOVE_DELAY: 5000, // Reduced from 10000 to start moving sooner (set to 5s)
  SLOT_MOVE_RANGE: 400, // Increased from 200 for more challenge
  SLOT_MOVE_SPEED: 0.004, // Used as frequency in sine wave

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
    ROPE: "#ff0000", // Red rope as requested
  },

  // Game rules
  TURN_TIME: 30, // seconds per turn
  MAX_VELOCITY: 20, // clamp puck speed
  SLEEP_THRESHOLD: 0.5,
  STUCK_TIMEOUT: 180, // frames (3 seconds at 60fps)

  // AI difficulty settings
  AI_DIFFICULTY: {
    EASY: { delay: 0, accuracy: 0.7, maxStretch: 200 },
    MEDIUM: { delay: 0, accuracy: 0.85, maxStretch: 250 },
    HARD: { delay: 0, accuracy: 0.95, maxStretch: 300 },
  },
};

export const PLAYER_POSITIONS = {
  PLAYER_1: {
    // Bottom player (white pucks)
    pucks: [
      { x: 300, y: 1300 },
      { x: 500, y: 1300 },
      { x: 600, y: 1350 },
      { x: 700, y: 1300 },
      { x: 900, y: 1300 },
    ],
    anchorY: 1500,
    color: GAME_CONFIG.COLORS.PUCK_WHITE,
    team: "white",
  },
  PLAYER_2: {
    // Top player (black pucks)
    pucks: [
      { x: 300, y: 500 },
      { x: 500, y: 500 },
      { x: 600, y: 450 },
      { x: 700, y: 500 },
      { x: 900, y: 500 },
    ],
    anchorY: 300,
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
