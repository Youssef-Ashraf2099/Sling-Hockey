import { create } from "zustand";
import { persist } from "zustand/middleware";

// Puck skins data
export const PUCK_SKINS = {
  classic: {
    id: "classic",
    name: "Classic Puck",
    price: 0,
    isPremium: false,
    color: "#ffffff",
    texture: null,
    physics: {
      mass: 1.0,
      friction: 0.05,
      restitution: 0.8,
      frictionAir: 0.02,
    },
    description: "The standard puck. Balanced and reliable.",
  },
  heavy: {
    id: "heavy",
    name: "Heavy Puck",
    price: 0.99,
    isPremium: true,
    color: "#4a4a4a",
    texture: null,
    physics: {
      mass: 2.0,
      friction: 0.08,
      restitution: 0.6,
      frictionAir: 0.03,
    },
    description: "Double the mass. Devastating impacts.",
  },
  speedster: {
    id: "speedster",
    name: "Speedster",
    price: 0.99,
    isPremium: true,
    color: "#00ffff",
    texture: null,
    physics: {
      mass: 0.7,
      friction: 0.02,
      restitution: 0.9,
      frictionAir: 0.01,
    },
    description: "Fast and agile. Quick shots.",
  },
  neon: {
    id: "neon",
    name: "Neon Puck",
    price: 1.49,
    isPremium: true,
    color: "#ff00ff",
    texture: null,
    physics: {
      mass: 1.0,
      friction: 0.05,
      restitution: 0.8,
      frictionAir: 0.02,
    },
    description: "Glowing style. Stand out on the board.",
  },
};

export const BOARD_THEMES = {
  birch: {
    id: "birch",
    name: "Birch Wood",
    price: 0,
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
    isPremium: true,
    backgroundColor: "#e8e8e8",
    dividerColor: "#8b8b8b",
    wallColor: "#a8a8a8",
    description: "Elegant stone surface.",
  },
};

export const useShopStore = create(
  persist(
    (set, get) => ({
      // User subscription status
      isPro: false,
      proExpiresAt: null,

      // Purchased items
      purchasedSkins: ["classic"], // Default free skin
      purchasedThemes: ["birch"], // Default free theme

      // Active selections
      currentSkin: "classic",
      currentTheme: "birch",

      // Purchase stats
      totalSpent: 0,

      // Actions
      unlockSkin: (skinId) => {
        const { purchasedSkins } = get();
        if (!purchasedSkins.includes(skinId)) {
          const skin = PUCK_SKINS[skinId];
          set((state) => ({
            purchasedSkins: [...state.purchasedSkins, skinId],
            totalSpent: state.totalSpent + (skin?.price || 0),
          }));
        }
      },

      unlockTheme: (themeId) => {
        const { purchasedThemes } = get();
        if (!purchasedThemes.includes(themeId)) {
          const theme = BOARD_THEMES[themeId];
          set((state) => ({
            purchasedThemes: [...state.purchasedThemes, themeId],
            totalSpent: state.totalSpent + (theme?.price || 0),
          }));
        }
      },

      equipSkin: (skinId) => {
        const { purchasedSkins } = get();
        if (purchasedSkins.includes(skinId)) {
          set({ currentSkin: skinId });
        }
      },

      equipTheme: (themeId) => {
        const { purchasedThemes } = get();
        if (purchasedThemes.includes(themeId)) {
          set({ currentTheme: themeId });
        }
      },

      upgradeToPro: () => {
        // Unlock all items
        const allSkinIds = Object.keys(PUCK_SKINS);
        const allThemeIds = Object.keys(BOARD_THEMES);

        const expiresAt = new Date();
        expiresAt.setMonth(expiresAt.getMonth() + 1); // 1 month from now

        set({
          isPro: true,
          proExpiresAt: expiresAt.toISOString(),
          purchasedSkins: allSkinIds,
          purchasedThemes: allThemeIds,
          totalSpent: get().totalSpent + 4.99,
        });
      },

      cancelPro: () => {
        set({
          isPro: false,
          proExpiresAt: null,
        });
      },

      // Getters
      getCurrentSkinData: () => {
        return PUCK_SKINS[get().currentSkin];
      },

      getCurrentThemeData: () => {
        return BOARD_THEMES[get().currentTheme];
      },

      isItemOwned: (itemId) => {
        const { purchasedSkins, purchasedThemes } = get();
        return (
          purchasedSkins.includes(itemId) || purchasedThemes.includes(itemId)
        );
      },
    }),
    {
      name: "shop-storage", // LocalStorage key
      version: 1,
    }
  )
);
