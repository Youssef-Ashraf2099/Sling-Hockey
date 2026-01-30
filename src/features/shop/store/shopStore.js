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
};

// Enhanced shop store with secure storage
export const useShopStore = create(
  persist(
    (set, get) => ({
      // Current equipped items
      equippedSkin: "classic",
      equippedTheme: "birch",
      
      // Purchased items
      purchasedSkins: ["classic"],
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