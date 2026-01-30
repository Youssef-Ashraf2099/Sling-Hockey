import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
// import { secureStorage } from "../../../core/security/encryption"; // Temporarily disabled

// Simple storage adapter for shop (no encryption) to fix freezing issue
const simpleStorageAdapter = {
  getItem: (name) => {
    try {
      const item = localStorage.getItem(name);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error('Shop storage getItem error:', error);
      return null;
    }
  },
  setItem: (name, value) => {
    try {
      localStorage.setItem(name, JSON.stringify(value));
    } catch (error) {
      console.error('Shop storage setItem error:', error);
    }
  },
  removeItem: (name) => {
    try {
      localStorage.removeItem(name);
    } catch (error) {
      console.error('Shop storage removeItem error:', error);
    }
  }
};

// Enhanced Puck skins data with more variety
export const PUCK_SKINS = {
  classic: {
    id: "classic",
    name: "Classic Puck",
    price: 0,
    requiredLevel: 1,
    isPremium: false,
    color: "#ffffff",
    texture: null,
    physics: { mass: 1.0, friction: 0.05, restitution: 0.8, frictionAir: 0.02 },
    description: "The standard puck. Balanced and reliable.",
  },
  heavy: {
    id: "heavy",
    name: "Heavy Puck",
    price: 0.99,
    requiredLevel: 2,
    isPremium: true,
    color: "#4a4a4a",
    texture: null,
    physics: { mass: 2.0, friction: 0.08, restitution: 0.6, frictionAir: 0.03 },
    description: "Double the mass. Devastating impacts.",
  },
  speedster: {
    id: "speedster",
    name: "Speedster",
    price: 0.99,
    requiredLevel: 3,
    isPremium: true,
    color: "#00ffff",
    texture: null,
    physics: { mass: 0.7, friction: 0.02, restitution: 0.9, frictionAir: 0.01 },
    description: "Fast and agile. Quick shots.",
  },
  neon: {
    id: "neon",
    name: "Neon Puck",
    price: 1.49,
    requiredLevel: 5,
    isPremium: true,
    color: "#ff00ff",
    texture: null,
    physics: { mass: 0.9, friction: 0.04, restitution: 0.85, frictionAir: 0.015 },
    description: "Glowing style. Stand out on the board.",
  },
  ice: {
    id: "ice",
    name: "Arctic Puck",
    price: 0.99,
    requiredLevel: 4,
    isPremium: true,
    color: "#a5f3fc",
    texture: null,
    physics: { mass: 0.8, friction: 0.01, restitution: 0.7, frictionAir: 0.01 },
    description: "Super low friction. Slides like a dream.",
  },
  magma: {
    id: "magma",
    name: "Magma Puck",
    price: 1.99,
    requiredLevel: 8,
    isPremium: true,
    color: "#f97316",
    texture: null,
    physics: { mass: 1.5, friction: 0.1, restitution: 0.9, frictionAir: 0.04 },
    description: "High bounce and heavy impact.",
  },
  gold: {
    id: "gold",
    name: "Pure Gold",
    price: 2.99,
    requiredLevel: 15,
    isPremium: true,
    color: "#eab308",
    texture: null,
    physics: { mass: 1.8, friction: 0.05, restitution: 0.75, frictionAir: 0.02 },
    description: "Luxury and prestige. Heavy and valuable.",
  },
  basketball: {
    id: "basketball",
    name: "Basketball",
    price: 1.49,
    requiredLevel: 7,
    isPremium: true,
    color: "#ff8c00",
    texture: "basketball",
    physics: { mass: 1.3, friction: 0.08, restitution: 0.9, frictionAir: 0.03 },
    description: "Bouncy like a real basketball. High rebound energy.",
  },
  football: {
    id: "football",
    name: "Football",
    price: 1.49,
    requiredLevel: 9,
    isPremium: true,
    color: "#8b4513",
    texture: "football",
    physics: { mass: 1.4, friction: 0.06, restitution: 0.7, frictionAir: 0.025 },
    description: "Aerodynamic shape. Stable flight patterns.",
  },
  volleyball: {
    id: "volleyball",
    name: "Volleyball",
    price: 1.49,
    requiredLevel: 6,
    isPremium: true,
    color: "#ffffff",
    texture: "volleyball",
    physics: { mass: 0.9, friction: 0.04, restitution: 0.85, frictionAir: 0.02 },
    description: "Light and bouncy. Perfect for quick plays.",
  },
  soccer: {
    id: "soccer",
    name: "Soccer Ball",
    price: 1.49,
    requiredLevel: 5,
    isPremium: true,
    color: "#ffffff",
    texture: "soccer",
    physics: { mass: 1.1, friction: 0.05, restitution: 0.8, frictionAir: 0.022 },
    description: "Classic soccer ball. Perfect control and balance.",
  },
  rainbow_ball: {
    id: "rainbow_ball",
    name: "Rainbow Ball",
    price: 2.99,
    requiredLevel: 12,
    isPremium: true,
    color: "#ff69b4",
    texture: "rainbow_ball",
    physics: { mass: 1.0, friction: 0.04, restitution: 0.85, frictionAir: 0.02 },
    description: "Colorful rainbow sphere. Brings joy to every match.",
  },
  disco_ball: {
    id: "disco_ball",
    name: "Disco Ball",
    price: 3.49,
    requiredLevel: 18,
    isPremium: true,
    color: "#cccccc",
    texture: "disco_ball",
    physics: { mass: 1.2, friction: 0.045, restitution: 0.82, frictionAir: 0.025 },
    description: "Sparkling mirror ball. Dance your way to victory.",
    animated: true
  },
  pulse_ball: {
    id: "pulse_ball",
    name: "Pulse Ball",
    price: 4.99,
    requiredLevel: 25,
    isPremium: true,
    color: "#00ffff",
    texture: "pulse_ball",
    physics: { mass: 0.9, friction: 0.03, restitution: 0.9, frictionAir: 0.015 },
    description: "Pulsing energy waves. Feel the rhythm of the game.",
    animated: true
  },
  orbit_ball: {
    id: "orbit_ball",
    name: "Orbit Ball",
    price: 5.99,
    requiredLevel: 30,
    isPremium: true,
    color: "#4444ff",
    texture: "orbit_ball",
    physics: { mass: 1.1, friction: 0.035, restitution: 0.88, frictionAir: 0.018 },
    description: "Satellite orbiting around. Cosmic precision control.",
    animated: true
  },
  // NEW ENHANCED PUCK SKINS
  diamond: {
    id: "diamond",
    name: "Diamond Puck",
    price: 4.99,
    requiredLevel: 25,
    isPremium: true,
    color: "#e0e7ff",
    texture: "diamond",
    physics: { mass: 1.2, friction: 0.01, restitution: 0.95, frictionAir: 0.005 },
    description: "Ultra-rare crystalline puck. Perfect bounce and minimal friction.",
  },
  plasma: {
    id: "plasma",
    name: "Plasma Core",
    price: 3.99,
    requiredLevel: 20,
    isPremium: true,
    color: "#8b5cf6",
    texture: "plasma",
    physics: { mass: 0.6, friction: 0.02, restitution: 1.0, frictionAir: 0.008 },
    description: "Energy-infused puck with perfect elasticity.",
  },
  stealth: {
    id: "stealth",
    name: "Shadow Puck",
    price: 2.49,
    requiredLevel: 12,
    isPremium: true,
    color: "#1f2937",
    texture: "stealth",
    physics: { mass: 0.9, friction: 0.03, restitution: 0.8, frictionAir: 0.015 },
    description: "Nearly invisible. Confuse your opponents.",
  },
  rainbow: {
    id: "rainbow",
    name: "Prismatic Puck",
    price: 1.99,
    requiredLevel: 10,
    isPremium: true,
    color: "#ff6b6b",
    texture: "rainbow",
    physics: { mass: 1.0, friction: 0.04, restitution: 0.85, frictionAir: 0.02 },
    description: "Color-shifting beauty. Changes hue as it moves.",
  },
  titanium: {
    id: "titanium",
    name: "Titanium Puck",
    price: 3.49,
    requiredLevel: 18,
    isPremium: true,
    color: "#6b7280",
    texture: "metal",
    physics: { mass: 2.5, friction: 0.06, restitution: 0.7, frictionAir: 0.025 },
    description: "Military-grade titanium. Unbreakable and heavy.",
  },
  cosmic: {
    id: "cosmic",
    name: "Cosmic Puck",
    price: 5.99,
    requiredLevel: 30,
    isPremium: true,
    color: "#1e1b4b",
    texture: "cosmic",
    physics: { mass: 1.1, friction: 0.02, restitution: 0.9, frictionAir: 0.01 },
    description: "Forged from stardust. Out of this world performance.",
  },
  // NEW CREATIVE SHAPES - Copyright Safe
  hexagon: {
    id: "hexagon",
    name: "Hex Puck",
    price: 1.29,
    requiredLevel: 4,
    isPremium: true,
    color: "#10b981",
    texture: "hexagon",
    shape: "hexagon",
    physics: { mass: 1.0, friction: 0.045, restitution: 0.82, frictionAir: 0.018 },
    description: "Six-sided precision. Unique angles create unpredictable bounces.",
  },
  triangle: {
    id: "triangle",
    name: "Delta Puck",
    price: 0.99,
    requiredLevel: 3,
    isPremium: true,
    color: "#f59e0b",
    texture: "triangle",
    shape: "triangle",
    physics: { mass: 0.8, friction: 0.06, restitution: 0.75, frictionAir: 0.025 },
    description: "Triangular design. Sharp angles for tactical plays.",
  },
  star: {
    id: "star",
    name: "Star Puck",
    price: 1.79,
    requiredLevel: 8,
    isPremium: true,
    color: "#fbbf24",
    texture: "star",
    shape: "star",
    physics: { mass: 0.9, friction: 0.05, restitution: 0.88, frictionAir: 0.02 },
    description: "Five-pointed star. Shine bright on the board.",
  },
  octagon: {
    id: "octagon",
    name: "Octo Puck",
    price: 1.99,
    requiredLevel: 11,
    isPremium: true,
    color: "#8b5cf6",
    texture: "octagon",
    shape: "octagon",
    physics: { mass: 1.1, friction: 0.04, restitution: 0.85, frictionAir: 0.019 },
    description: "Eight-sided perfection. Balanced geometry.",
  },
  gear: {
    id: "gear",
    name: "Gear Puck",
    price: 2.29,
    requiredLevel: 14,
    isPremium: true,
    color: "#6b7280",
    texture: "gear",
    shape: "gear",
    physics: { mass: 1.4, friction: 0.08, restitution: 0.7, frictionAir: 0.03 },
    description: "Mechanical gear design. Industrial strength.",
  },
  crystal: {
    id: "crystal",
    name: "Crystal Shard",
    price: 2.99,
    requiredLevel: 16,
    isPremium: true,
    color: "#06b6d4",
    texture: "crystal",
    shape: "crystal",
    physics: { mass: 1.2, friction: 0.02, restitution: 0.92, frictionAir: 0.012 },
    description: "Crystalline structure. Pure energy and precision.",
  },
  flower: {
    id: "flower",
    name: "Bloom Puck",
    price: 1.49,
    requiredLevel: 7,
    isPremium: true,
    color: "#ec4899",
    texture: "flower",
    shape: "flower",
    physics: { mass: 0.7, friction: 0.035, restitution: 0.87, frictionAir: 0.015 },
    description: "Floral design. Beauty meets performance.",
  },
  lightning: {
    id: "lightning",
    name: "Thunder Puck",
    price: 2.49,
    requiredLevel: 13,
    isPremium: true,
    color: "#eab308",
    texture: "lightning",
    shape: "lightning",
    physics: { mass: 0.6, friction: 0.025, restitution: 0.95, frictionAir: 0.01 },
    description: "Lightning bolt shape. Electric speed and power.",
  },
  spiral: {
    id: "spiral",
    name: "Vortex Puck",
    price: 1.89,
    requiredLevel: 9,
    isPremium: true,
    color: "#7c3aed",
    texture: "spiral",
    shape: "spiral",
    physics: { mass: 0.95, friction: 0.04, restitution: 0.83, frictionAir: 0.017 },
    description: "Spiral design creates mesmerizing spin effects.",
  },
  cross: {
    id: "cross",
    name: "Plus Puck",
    price: 1.19,
    requiredLevel: 5,
    isPremium: true,
    color: "#ef4444",
    texture: "cross",
    shape: "cross",
    physics: { mass: 1.0, friction: 0.05, restitution: 0.8, frictionAir: 0.02 },
    description: "Cross shape. Balanced in all directions.",
  },
  moon: {
    id: "moon",
    name: "Crescent Puck",
    price: 1.69,
    requiredLevel: 10,
    isPremium: true,
    color: "#f3f4f6",
    texture: "moon",
    shape: "crescent",
    physics: { mass: 0.85, friction: 0.03, restitution: 0.86, frictionAir: 0.016 },
    description: "Lunar crescent. Mysterious and elegant.",
  },
  arrow: {
    id: "arrow",
    name: "Arrow Puck",
    price: 1.39,
    requiredLevel: 6,
    isPremium: true,
    color: "#059669",
    texture: "arrow",
    shape: "arrow",
    physics: { mass: 0.9, friction: 0.04, restitution: 0.84, frictionAir: 0.018 },
    description: "Pointed arrow design. Always hits the mark.",
  },
  shield: {
    id: "shield",
    name: "Guardian Puck",
    price: 2.19,
    requiredLevel: 12,
    isPremium: true,
    color: "#1f2937",
    texture: "shield",
    shape: "shield",
    physics: { mass: 1.6, friction: 0.07, restitution: 0.72, frictionAir: 0.028 },
    description: "Shield-shaped defense. Sturdy and protective.",
  },
  heart: {
    id: "heart",
    name: "Love Puck",
    price: 1.99,
    requiredLevel: 14,
    isPremium: true,
    color: "#f43f5e",
    texture: "heart",
    shape: "heart",
    physics: { mass: 0.8, friction: 0.04, restitution: 0.89, frictionAir: 0.015 },
    description: "Heart-shaped charm. Play with passion.",
  },
  diamond_shape: {
    id: "diamond_shape",
    name: "Rhombus Puck",
    price: 1.59,
    requiredLevel: 8,
    isPremium: true,
    color: "#a855f7",
    texture: "diamond_shape",
    shape: "diamond",
    physics: { mass: 1.0, friction: 0.045, restitution: 0.85, frictionAir: 0.019 },
    description: "Diamond geometry. Sharp and precise angles.",
  },
  // NEON AND HACKING THEMED PUCKS
  neon_glow: {
    id: "neon_glow",
    name: "Neon Glow",
    price: 2.49,
    requiredLevel: 12,
    isPremium: true,
    color: "#00ffff",
    texture: "neon_glow",
    shape: "circle",
    physics: { mass: 0.8, friction: 0.02, restitution: 0.92, frictionAir: 0.01 },
    description: "Electric neon glow. Lights up the entire board.",
  },
  hacker: {
    id: "hacker",
    name: "Hacker Puck",
    price: 3.29,
    requiredLevel: 18,
    isPremium: true,
    color: "#00ff41",
    texture: "hacker",
    shape: "circle",
    physics: { mass: 0.9, friction: 0.025, restitution: 0.88, frictionAir: 0.012 },
    description: "Digital infiltration. Bypasses all defenses.",
  },
  matrix_code: {
    id: "matrix_code",
    name: "Code Puck",
    price: 2.99,
    requiredLevel: 15,
    isPremium: true,
    color: "#003300",
    texture: "matrix_code",
    shape: "circle",
    physics: { mass: 0.85, friction: 0.03, restitution: 0.9, frictionAir: 0.015 },
    description: "Flowing digital code. Reality is just data.",
  },
  // EMOJI THEMED PUCKS
  smiley: {
    id: "smiley",
    name: "Happy Face",
    price: 1.49,
    requiredLevel: 5,
    isPremium: true,
    color: "#fbbf24",
    texture: "smiley",
    emoji: "😊",
    shape: "circle",
    physics: { mass: 0.9, friction: 0.04, restitution: 0.85, frictionAir: 0.018 },
    description: "Always smiling. Spreads joy on the board.",
  },
  fire_emoji: {
    id: "fire_emoji",
    name: "Fire Puck",
    price: 1.79,
    requiredLevel: 9,
    isPremium: true,
    color: "#ef4444",
    texture: "fire_emoji",
    emoji: "🔥",
    shape: "circle",
    physics: { mass: 1.1, friction: 0.05, restitution: 0.87, frictionAir: 0.02 },
    description: "Hot and blazing. Burns through the competition.",
  },
  rocket_emoji: {
    id: "rocket_emoji",
    name: "Rocket Puck",
    price: 2.19,
    requiredLevel: 11,
    isPremium: true,
    color: "#6b7280",
    texture: "rocket_emoji",
    emoji: "🚀",
    shape: "circle",
    physics: { mass: 0.7, friction: 0.02, restitution: 0.95, frictionAir: 0.01 },
    description: "Blast off to victory. Maximum speed achieved.",
  },
  star_emoji: {
    id: "star_emoji",
    name: "Star Emoji",
    price: 1.99,
    requiredLevel: 8,
    isPremium: true,
    color: "#fbbf24",
    texture: "star_emoji",
    emoji: "⭐",
    shape: "circle",
    physics: { mass: 0.85, friction: 0.035, restitution: 0.88, frictionAir: 0.016 },
    description: "Shining bright. You're the star of the game.",
  },
  lightning_emoji: {
    id: "lightning_emoji",
    name: "Zap Puck",
    price: 2.09,
    requiredLevel: 10,
    isPremium: true,
    color: "#eab308",
    texture: "lightning_emoji",
    emoji: "⚡",
    shape: "circle",
    physics: { mass: 0.6, friction: 0.025, restitution: 0.93, frictionAir: 0.012 },
    description: "Electric energy. Lightning-fast reactions.",
  },
  gem_emoji: {
    id: "gem_emoji",
    name: "Gem Puck",
    price: 2.79,
    requiredLevel: 14,
    isPremium: true,
    color: "#06b6d4",
    texture: "gem_emoji",
    emoji: "💎",
    shape: "circle",
    physics: { mass: 1.3, friction: 0.02, restitution: 0.9, frictionAir: 0.013 },
    description: "Precious and rare. Diamond-level performance.",
  },
  crown_emoji: {
    id: "crown_emoji",
    name: "Royal Puck",
    price: 3.49,
    requiredLevel: 20,
    isPremium: true,
    color: "#fbbf24",
    texture: "crown_emoji",
    emoji: "👑",
    shape: "circle",
    physics: { mass: 1.4, friction: 0.04, restitution: 0.82, frictionAir: 0.022 },
    description: "Fit for royalty. Rule the board with authority.",
  },
  alien_emoji: {
    id: "alien_emoji",
    name: "Alien Puck",
    price: 2.29,
    requiredLevel: 13,
    isPremium: true,
    color: "#10b981",
    texture: "alien_emoji",
    emoji: "👽",
    shape: "circle",
    physics: { mass: 0.8, friction: 0.03, restitution: 0.89, frictionAir: 0.014 },
    description: "Out of this world. Alien technology at work.",
  },
  skull_emoji: {
    id: "skull_emoji",
    name: "Skull Puck",
    price: 1.89,
    requiredLevel: 12,
    isPremium: true,
    color: "#f3f4f6",
    texture: "skull_emoji",
    emoji: "💀",
    shape: "circle",
    physics: { mass: 1.0, friction: 0.045, restitution: 0.8, frictionAir: 0.019 },
    description: "Deadly precision. Strike fear into opponents.",
  },
  rainbow_emoji: {
    id: "rainbow_emoji",
    name: "Rainbow Puck",
    price: 2.49,
    requiredLevel: 16,
    isPremium: true,
    color: "#ec4899",
    texture: "rainbow_emoji",
    emoji: "🌈",
    shape: "circle",
    physics: { mass: 0.9, friction: 0.035, restitution: 0.86, frictionAir: 0.017 },
    description: "Colorful magic. Brings luck and joy to every shot.",
  },
  snowflake_emoji: {
    id: "snowflake_emoji",
    name: "Ice Puck",
    price: 1.69,
    requiredLevel: 7,
    isPremium: true,
    color: "#a5f3fc",
    texture: "snowflake_emoji",
    emoji: "❄️",
    shape: "circle",
    physics: { mass: 0.75, friction: 0.015, restitution: 0.85, frictionAir: 0.012 },
    description: "Frozen perfection. Glides like ice on the board.",
  },
};

// Enhanced Board themes with more variety
export const BOARD_THEMES = {
  birch: {
    id: "birch",
    name: "Classic Birch",
    price: 0,
    requiredLevel: 1,
    isPremium: false,
    backgroundColor: "#d2b48c",
    dividerColor: "#8b4513",
    wallColor: "#8b7355",
    description: "Traditional wooden board. Timeless and reliable.",
  },
  mahogany: {
    id: "mahogany",
    name: "Rich Mahogany",
    price: 1.99,
    requiredLevel: 5,
    isPremium: true,
    backgroundColor: "#8b4513",
    dividerColor: "#654321",
    wallColor: "#5d4e37",
    description: "Luxury hardwood. Elegant and sophisticated.",
  },
  marble: {
    id: "marble",
    name: "Marble Elegance",
    price: 2.99,
    requiredLevel: 8,
    isPremium: true,
    backgroundColor: "#f8f8ff",
    dividerColor: "#dcdcdc",
    wallColor: "#c0c0c0",
    description: "Polished marble surface. Smooth and pristine.",
  },
  cyber: {
    id: "cyber",
    name: "Cyber Grid",
    price: 2.49,
    requiredLevel: 10,
    isPremium: true,
    backgroundColor: "#0f172a",
    dividerColor: "#00ffff",
    wallColor: "#1e293b",
    description: "Futuristic neon grid. Enter the digital arena.",
  },
  arctic: {
    id: "arctic",
    name: "Arctic Ice",
    price: 1.99,
    requiredLevel: 6,
    isPremium: true,
    backgroundColor: "#f0f8ff",
    dividerColor: "#87ceeb",
    wallColor: "#b0e0e6",
    description: "Frozen battlefield. Slippery and challenging.",
  },
  stadium: {
    id: "stadium",
    name: "Pro Stadium",
    price: 3.49,
    requiredLevel: 15,
    isPremium: true,
    backgroundColor: "#228b22",
    dividerColor: "#ffffff",
    wallColor: "#006400",
    description: "Professional tournament board. Feel like a pro.",
  },
  volcano: {
    id: "volcano",
    name: "Volcanic Arena",
    price: 2.99,
    requiredLevel: 12,
    isPremium: true,
    backgroundColor: "#8b0000",
    dividerColor: "#ff4500",
    wallColor: "#a0522d",
    description: "Molten rock surface. Hot and intense gameplay.",
  },
  space: {
    id: "space",
    name: "Deep Space",
    price: 4.99,
    requiredLevel: 20,
    isPremium: true,
    backgroundColor: "#000000",
    dividerColor: "#9400d3",
    wallColor: "#191970",
    description: "Zero gravity arena. Cosmic gaming experience.",
  },
  // NEW ENHANCED BOARD THEMES
  neon: {
    id: "neon",
    name: "Neon Nights",
    price: 3.99,
    requiredLevel: 16,
    isPremium: true,
    backgroundColor: "#1a1a2e",
    dividerColor: "#ff006e",
    wallColor: "#16213e",
    description: "Synthwave aesthetic. Retro-futuristic vibes.",
  },
  forest: {
    id: "forest",
    name: "Enchanted Forest",
    price: 2.49,
    requiredLevel: 9,
    isPremium: true,
    backgroundColor: "#2d5016",
    dividerColor: "#8fbc8f",
    wallColor: "#556b2f",
    description: "Natural wood grain. Connect with nature.",
  },
  crystal: {
    id: "crystal",
    name: "Crystal Cave",
    price: 4.49,
    requiredLevel: 22,
    isPremium: true,
    backgroundColor: "#e6e6fa",
    dividerColor: "#da70d6",
    wallColor: "#dda0dd",
    description: "Crystalline formations. Magical and mystical.",
  },
  desert: {
    id: "desert",
    name: "Desert Oasis",
    price: 2.99,
    requiredLevel: 11,
    isPremium: true,
    backgroundColor: "#f4a460",
    dividerColor: "#daa520",
    wallColor: "#cd853f",
    description: "Sandy dunes. Warm and inviting atmosphere.",
  },
  ocean: {
    id: "ocean",
    name: "Ocean Depths",
    price: 3.49,
    requiredLevel: 14,
    isPremium: true,
    backgroundColor: "#006994",
    dividerColor: "#40e0d0",
    wallColor: "#4682b4",
    description: "Deep sea adventure. Dive into the blue.",
  },
  rainbow_board: {
    id: "rainbow_board",
    name: "Rainbow Paradise",
    price: 5.49,
    requiredLevel: 25,
    isPremium: true,
    backgroundColor: "#ff69b4",
    dividerColor: "#ffd700",
    wallColor: "#ff1493",
    description: "Vibrant rainbow colors. Pure joy and fun.",
  },
  steampunk: {
    id: "steampunk",
    name: "Steampunk Factory",
    price: 3.99,
    requiredLevel: 17,
    isPremium: true,
    backgroundColor: "#8b4513",
    dividerColor: "#b8860b",
    wallColor: "#a0522d",
    description: "Industrial Victorian. Gears and steam power.",
  },
  holographic: {
    id: "holographic",
    name: "Holographic Matrix",
    price: 6.99,
    requiredLevel: 35,
    isPremium: true,
    backgroundColor: "#000080",
    dividerColor: "#00ff00",
    wallColor: "#4169e1",
    description: "Ultimate tech board. Reality-bending visuals.",
  },
  // NEW CREATIVE BOARD THEMES - Copyright Safe
  galaxy: {
    id: "galaxy",
    name: "Spiral Galaxy",
    price: 4.99,
    requiredLevel: 28,
    isPremium: true,
    backgroundColor: "#0c0c0c",
    dividerColor: "#9333ea",
    wallColor: "#1e1b4b",
    description: "Swirling cosmic dust. Play among the stars.",
  },
  sunset: {
    id: "sunset",
    name: "Golden Sunset",
    price: 2.79,
    requiredLevel: 13,
    isPremium: true,
    backgroundColor: "#fbbf24",
    dividerColor: "#f97316",
    wallColor: "#ea580c",
    description: "Warm sunset hues. Peaceful and serene.",
  },
  matrix: {
    id: "matrix",
    name: "Code Matrix",
    price: 3.29,
    requiredLevel: 18,
    isPremium: true,
    backgroundColor: "#000000",
    dividerColor: "#00ff41",
    wallColor: "#003300",
    description: "Digital rain effect. Enter the code world.",
  },
  aurora: {
    id: "aurora",
    name: "Aurora Borealis",
    price: 3.79,
    requiredLevel: 21,
    isPremium: true,
    backgroundColor: "#1e3a8a",
    dividerColor: "#10b981",
    wallColor: "#1e40af",
    description: "Northern lights dance. Magical atmosphere.",
  },
  geometric: {
    id: "geometric",
    name: "Geometric Patterns",
    price: 2.99,
    requiredLevel: 15,
    isPremium: true,
    backgroundColor: "#f3f4f6",
    dividerColor: "#6366f1",
    wallColor: "#e5e7eb",
    description: "Abstract geometric design. Modern and clean.",
  },
  retro: {
    id: "retro",
    name: "Retro Arcade",
    price: 2.49,
    requiredLevel: 12,
    isPremium: true,
    backgroundColor: "#7c2d12",
    dividerColor: "#fbbf24",
    wallColor: "#92400e",
    description: "Classic arcade vibes. Nostalgic gaming feel.",
  },
  prism: {
    id: "prism",
    name: "Light Prism",
    price: 4.29,
    requiredLevel: 24,
    isPremium: true,
    backgroundColor: "#ffffff",
    dividerColor: "#ec4899",
    wallColor: "#f3f4f6",
    description: "Light refraction effects. Spectrum of colors.",
  },
  zen: {
    id: "zen",
    name: "Zen Garden",
    price: 2.99,
    requiredLevel: 16,
    isPremium: true,
    backgroundColor: "#f5f5dc",
    dividerColor: "#8b4513",
    wallColor: "#deb887",
    description: "Peaceful sand patterns. Find your inner calm.",
  },
  circuit: {
    id: "circuit",
    name: "Circuit Board",
    price: 3.49,
    requiredLevel: 19,
    isPremium: true,
    backgroundColor: "#065f46",
    dividerColor: "#10b981",
    wallColor: "#047857",
    description: "Electronic pathways. High-tech precision.",
  },
  nebula: {
    id: "nebula",
    name: "Cosmic Nebula",
    price: 5.29,
    requiredLevel: 30,
    isPremium: true,
    backgroundColor: "#581c87",
    dividerColor: "#a855f7",
    wallColor: "#6b21a8",
    description: "Stellar nursery. Where stars are born.",
  },
  tribal: {
    id: "tribal",
    name: "Tribal Patterns",
    price: 2.19,
    requiredLevel: 10,
    isPremium: true,
    backgroundColor: "#92400e",
    dividerColor: "#fbbf24",
    wallColor: "#b45309",
    description: "Ancient tribal art. Cultural heritage design.",
  },
  minimalist: {
    id: "minimalist",
    name: "Pure Minimalist",
    price: 1.99,
    requiredLevel: 8,
    isPremium: true,
    backgroundColor: "#ffffff",
    dividerColor: "#000000",
    wallColor: "#f9fafb",
    description: "Clean and simple. Less is more philosophy.",
  },
  // NEON AND HACKER THEMED BOARDS
  neon_city: {
    id: "neon_city",
    name: "Neon City",
    price: 3.99,
    requiredLevel: 17,
    isPremium: true,
    backgroundColor: "#0f0f23",
    dividerColor: "#00ffff",
    wallColor: "#1a1a2e",
    description: "Cyberpunk cityscape. Electric neon everywhere.",
  },
  hacker_terminal: {
    id: "hacker_terminal",
    name: "Hacker Terminal",
    price: 3.49,
    requiredLevel: 19,
    isPremium: true,
    backgroundColor: "#000000",
    dividerColor: "#00ff41",
    wallColor: "#001100",
    description: "Command line interface. Access granted.",
  },
  cyber_punk: {
    id: "cyber_punk",
    name: "Cyber Punk",
    price: 4.29,
    requiredLevel: 22,
    isPremium: true,
    backgroundColor: "#1a0033",
    dividerColor: "#ff00ff",
    wallColor: "#330066",
    description: "Dystopian future. High tech, low life.",
  },
  digital_void: {
    id: "digital_void",
    name: "Digital Void",
    price: 3.79,
    requiredLevel: 20,
    isPremium: true,
    backgroundColor: "#000011",
    dividerColor: "#0099ff",
    wallColor: "#001122",
    description: "Empty digital space. Pure data environment.",
  },
  neon_grid: {
    id: "neon_grid",
    name: "Neon Grid",
    price: 2.99,
    requiredLevel: 14,
    isPremium: true,
    backgroundColor: "#000000",
    dividerColor: "#ff0080",
    wallColor: "#110011",
    description: "Glowing grid lines. Tron-inspired aesthetics.",
  },
  // EMOJI THEMED BOARDS
  emoji_party: {
    id: "emoji_party",
    name: "Emoji Party",
    price: 2.49,
    requiredLevel: 11,
    isPremium: true,
    backgroundColor: "#fef3c7",
    dividerColor: "#f59e0b",
    wallColor: "#fbbf24",
    description: "Fun emoji celebration. Party time on the board!",
  },
  space_emoji: {
    id: "space_emoji",
    name: "Space Adventure",
    price: 3.29,
    requiredLevel: 16,
    isPremium: true,
    backgroundColor: "#0c0c0c",
    dividerColor: "#fbbf24",
    wallColor: "#1e1b4b",
    description: "Cosmic emoji journey. Stars and rockets everywhere.",
  },
};

// Enhanced shop store with secure storage
export const useShopStore = create(
  persist(
    (set, get) => ({
      // Current equipped items
      equippedSkin: "smiley", // Changed from "classic" to test visual system
      equippedTheme: "birch",
      
      // Purchased items
      purchasedSkins: ["classic", "smiley"], // Added smiley for testing
      purchasedThemes: ["birch"],
      
      // Premium status
      isPro: false,
      
      // Actions
      equipSkin: (skinId) => {
        const skin = PUCK_SKINS[skinId];
        if (!skin) return false;
        
        const { purchasedSkins, isPro } = get();
        if (!purchasedSkins.includes(skinId) && !isPro && skin.isPremium) {
          return false; // Not purchased
        }
        
        set({ equippedSkin: skinId });
        return true;
      },
      
      equipTheme: (themeId) => {
        const theme = BOARD_THEMES[themeId];
        if (!theme) return false;
        
        const { purchasedThemes, isPro } = get();
        if (!purchasedThemes.includes(themeId) && !isPro && theme.isPremium) {
          return false; // Not purchased
        }
        
        set({ equippedTheme: themeId });
        return true;
      },
      
      purchaseSkin: (skinId) => {
        const skin = PUCK_SKINS[skinId];
        if (!skin || !skin.isPremium) return false;
        
        const { purchasedSkins } = get();
        if (purchasedSkins.includes(skinId)) return false; // Already owned
        
        // In a real app, this would integrate with payment processing
        set({ 
          purchasedSkins: [...purchasedSkins, skinId],
          equippedSkin: skinId 
        });
        return true;
      },
      
      purchaseTheme: (themeId) => {
        const theme = BOARD_THEMES[themeId];
        if (!theme || !theme.isPremium) return false;
        
        const { purchasedThemes } = get();
        if (purchasedThemes.includes(themeId)) return false; // Already owned
        
        // In a real app, this would integrate with payment processing
        set({ 
          purchasedThemes: [...purchasedThemes, themeId],
          equippedTheme: themeId 
        });
        return true;
      },
      
      // Simulate ad unlock (for free-to-play model)
      unlockWithAd: async (itemId, itemType) => {
        // Simulate ad viewing delay
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        if (itemType === 'skin') {
          const { purchasedSkins } = get();
          if (!purchasedSkins.includes(itemId)) {
            set({ 
              purchasedSkins: [...purchasedSkins, itemId],
              equippedSkin: itemId 
            });
            return true;
          }
        } else if (itemType === 'theme') {
          const { purchasedThemes } = get();
          if (!purchasedThemes.includes(itemId)) {
            set({ 
              purchasedThemes: [...purchasedThemes, itemId],
              equippedTheme: itemId 
            });
            return true;
          }
        }
        return false;
      },
      
      // Get current skin data for physics
      getCurrentSkinData: () => {
        const { equippedSkin } = get();
        return PUCK_SKINS[equippedSkin] || PUCK_SKINS.classic;
      },
      
      // Get current theme data for rendering
      getCurrentThemeData: () => {
        const { equippedTheme } = get();
        return BOARD_THEMES[equippedTheme] || BOARD_THEMES.birch;
      },
      
      // Check if item is owned
      isOwned: (itemId, itemType) => {
        const { purchasedSkins, purchasedThemes, isPro } = get();
        if (isPro) return true;
        
        if (itemType === 'skin') {
          return purchasedSkins.includes(itemId);
        } else if (itemType === 'theme') {
          return purchasedThemes.includes(itemId);
        }
        return false;
      },
      
      // Get available items for current level
      getAvailableItems: (playerLevel) => {
        const availableSkins = Object.values(PUCK_SKINS).filter(
          skin => skin.requiredLevel <= playerLevel
        );
        const availableThemes = Object.values(BOARD_THEMES).filter(
          theme => theme.requiredLevel <= playerLevel
        );
        
        return { skins: availableSkins, themes: availableThemes };
      },
      
      // Unlock pro version
      unlockPro: () => {
        set({ isPro: true });
      },
      
      // Get shop statistics
      getShopStats: () => {
        const { purchasedSkins, purchasedThemes } = get();
        const totalSkins = Object.keys(PUCK_SKINS).length;
        const totalThemes = Object.keys(BOARD_THEMES).length;
        
        return {
          skinsOwned: purchasedSkins.length,
          totalSkins,
          themesOwned: purchasedThemes.length,
          totalThemes,
          completionPercentage: Math.round(
            ((purchasedSkins.length + purchasedThemes.length) / 
             (totalSkins + totalThemes)) * 100
          )
        };
      }
    }),
    {
      name: "sling-hockey-shop-simple", // Simple storage without encryption
      storage: createJSONStorage(() => simpleStorageAdapter),
    }
  )
);