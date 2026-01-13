import { create } from "zustand";
import { persist } from "zustand/middleware";

// Puck skins data
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
    description: "The ultimate status symbol. Heavy and prestigious.",
  },
  basketball: {
    id: "basketball",
    name: "Hoops Master",
    price: 1.49,
    requiredLevel: 6,
    isPremium: true,
    color: "#ea580c",
    texture: "basketball",
    physics: { mass: 0.9, friction: 0.06, restitution: 1.2, frictionAir: 0.02 },
    description: "High bounce performance. Perfect for bank shots.",
  },
  football: {
    id: "football",
    name: "Gridiron",
    price: 1.49,
    requiredLevel: 7,
    isPremium: true,
    color: "#451a03",
    texture: "football",
    physics: { mass: 1.4, friction: 0.1, restitution: 0.5, frictionAir: 0.04 },
    description: "Heavy and grounded. Hard to push back.",
  },
  volleyball: {
    id: "volleyball",
    name: "Beach Spike",
    price: 1.49,
    requiredLevel: 4,
    isPremium: true,
    color: "#fde047",
    texture: "volleyball",
    physics: { mass: 0.6, friction: 0.03, restitution: 1.1, frictionAir: 0.06 },
    description: "Lightweight and floaty. Unpredictable speed.",
  },
};

export const BOARD_THEMES = {
  birch: {
    id: "birch",
    name: "Birch Wood",
    price: 0,
    requiredLevel: 1,
    isPremium: false,
    backgroundColor: "#d2b48c",
    dividerColor: "#8b4513",
    wallColor: "#8b7355",
    description: "Classic light wood finish.",
  },
  mahogany: {
    id: "mahogany",
    name: "Mahogany",
    price: 1.49,
    requiredLevel: 3,
    isPremium: true,
    backgroundColor: "#7b3f00",
    dividerColor: "#4a2511",
    wallColor: "#5a2f1a",
    description: "Rich dark wood. Premium look.",
  },
  marble: {
    id: "marble",
    name: "Marble Luxury",
    price: 1.99,
    requiredLevel: 6,
    isPremium: true,
    backgroundColor: "#e8e8e8",
    dividerColor: "#8b8b8b",
    wallColor: "#a8a8a8",
    description: "Elegant stone surface.",
  },
  cyber: {
    id: "cyber",
    name: "Cyber Grid",
    price: 2.49,
    requiredLevel: 10,
    isPremium: true,
    backgroundColor: "#0f172a",
    dividerColor: "#38bdf8",
    wallColor: "#1e293b",
    description: "Futuristic neon aesthetics.",
  },
  arctic: {
    id: "arctic",
    name: "Freezing Point",
    price: 1.49,
    requiredLevel: 5,
    isPremium: true,
    backgroundColor: "#f0f9ff",
    dividerColor: "#7dd3fc",
    wallColor: "#bae6fd",
    description: "Cool and calm ice rink.",
  },
  stadium: {
    id: "stadium",
    name: "Neon Stadium",
    price: 2.99,
    requiredLevel: 12,
    isPremium: true,
    backgroundColor: "#020617",
    dividerColor: "#22c55e",
    wallColor: "#1e293b",
    description: "High stakes under the bright lights.",
  },
  volcano: {
    id: "volcano",
    name: "Lava Pit",
    price: 2.99,
    requiredLevel: 15,
    isPremium: true,
    backgroundColor: "#450a0a",
    dividerColor: "#ef4444",
    wallColor: "#1a0404",
    description: "Hot competition in a volcanic arena.",
  },
  space: {
    id: "space",
    name: "Galactic Rift",
    price: 2.99,
    requiredLevel: 20,
    isPremium: true,
    backgroundColor: "#0f172a",
    dividerColor: "#8b5cf6",
    wallColor: "#020617",
    description: "Play amongst the stars.",
  },
};

export const useShopStore = create(
  persist(
    (set, get) => ({
      isPro: false,
      purchasedSkins: ["classic"],
      purchasedThemes: ["birch"],
      currentSkin: "classic",
      currentTheme: "birch",
      totalSpent: 0,

      unlockWithAd: (itemId, type) => {
        return new Promise((resolve) => {
          setTimeout(() => {
            if (type === "puck") {
              set((state) => ({ purchasedSkins: [...state.purchasedSkins, itemId] }));
            } else {
              set((state) => ({ purchasedThemes: [...state.purchasedThemes, itemId] }));
            }
            resolve(true);
          }, 2000);
        });
      },

      equipSkin: (skinId) => {
        if (get().purchasedSkins.includes(skinId)) set({ currentSkin: skinId });
      },

      equipTheme: (themeId) => {
        if (get().purchasedThemes.includes(themeId)) set({ currentTheme: themeId });
      },

      upgradeToPro: () => {
        set({
          isPro: true,
          purchasedSkins: Object.keys(PUCK_SKINS),
          purchasedThemes: Object.keys(BOARD_THEMES),
        });
      },

      getCurrentSkinData: () => PUCK_SKINS[get().currentSkin],
      getCurrentThemeData: () => BOARD_THEMES[get().currentTheme],
      isItemOwned: (itemId) => get().purchasedSkins.includes(itemId) || get().purchasedThemes.includes(itemId),
    }),
    {
      name: "shop-storage",
      version: 1,
    }
  )
);
