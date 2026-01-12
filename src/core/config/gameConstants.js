export const GAME_CONFIG = {
  // Virtual coordinate system
  VIRTUAL_WIDTH: 1000,
  VIRTUAL_HEIGHT: 1600, // 16:10 aspect ratio for vertical board

  // Physics
  GRAVITY: { x: 0, y: 0 },
  TIME_STEP: 1000 / 60,

  // Puck properties
  PUCK_RADIUS: 20,
  PUCK_COUNT: 10, // 5 per player

  // Elastic band
  MAX_STRETCH: 150,
  FORCE_MULTIPLIER: 0.0003,
  ELASTIC_STIFFNESS: 0.1,
  ELASTIC_DAMPING: 0.05,

  // Slot/Goal
  SLOT_WIDTH: 100,
  SLOT_Y: 800, // Center line
  CORNER_RADIUS: 8,
  DIVIDER_THICKNESS: 10,

  // Walls
  WALL_THICKNESS: 20,

  // Physics values
  PUCK_RESTITUTION: 0.8,
  PUCK_FRICTION: 0.05,
  PUCK_FRICTION_AIR: 0.02,
  PUCK_FRICTION_STATIC: 0.5,
  PUCK_DENSITY: 0.001,

  WALL_RESTITUTION: 0.9,
  WALL_FRICTION: 0.01,

  DIVIDER_RESTITUTION: 0.6,
  DIVIDER_FRICTION: 0.1,

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
  MAX_VELOCITY: 15, // clamp puck speed
  SLEEP_THRESHOLD: 0.5,
  STUCK_TIMEOUT: 180, // frames (3 seconds at 60fps)
};

export const PLAYER_POSITIONS = {
  PLAYER_1: {
    // Bottom player (white pucks)
    pucks: [
      { x: 200, y: 1400 },
      { x: 400, y: 1400 },
      { x: 500, y: 1450 },
      { x: 600, y: 1400 },
      { x: 800, y: 1400 },
    ],
    anchorY: 1500,
    color: GAME_CONFIG.COLORS.PUCK_WHITE,
    team: "white",
  },
  PLAYER_2: {
    // Top player (black pucks)
    pucks: [
      { x: 200, y: 200 },
      { x: 400, y: 200 },
      { x: 500, y: 150 },
      { x: 600, y: 200 },
      { x: 800, y: 200 },
    ],
    anchorY: 100,
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
