# Monetization Specifications

## Overview

Sling Hockey Pro uses a freemium model with in-app purchases (IAP) and advertising. This document defines the complete monetization strategy, ad placements, pricing tiers, and technical implementation details.

---

## Revenue Streams

### 1. Advertising (Free Users)

- **Display Ads**: Persistent sidebar placements
- **Interstitial Ads**: Full-screen between games
- **Rewarded Video**: Optional ads for in-game rewards

### 2. In-App Purchases (IAP)

- **Pro Subscription**: Monthly premium tier
- **Cosmetic Items**: Individual puck skins and board themes
- **One-Time Purchases**: Remove ads forever, unlock all skins

### 3. Future Revenue (Post-Launch)

- **Tournament Entry Fees**: Competitive events
- **Gift System**: Send skins to friends
- **Season Pass**: Quarterly exclusive content

---

## Ad Strategy

### Sidebar Ad (Right Panel)

**Placement**

- Right sidebar, top section
- Size: 300x250 (Medium Rectangle)
- Always visible during gameplay (desktop only)
- Hidden on mobile (below 768px)

**Implementation**

```jsx
// src/features/ads/components/SidebarAd.jsx
import { useStore } from "@/features/shop/store/shopStore";

function SidebarAd() {
  const { isPro } = useStore((state) => state.user);

  // Don't show ads to Pro users
  if (isPro) return null;

  return (
    <div className="w-[300px] h-[250px] bg-gray-800 rounded-lg border border-gray-700 flex items-center justify-center">
      <div className="text-gray-400 text-sm">Ad Space 300x250</div>
      {/* Replace with AdSense code in production */}
    </div>
  );
}
```

**Ad Provider**: Google AdSense (initial), migrate to custom ad network later

**Frequency**: Persistent (always visible)

**Revenue Estimate**: $0.50 - $2.00 CPM (cost per 1000 impressions)

---

### Interstitial Ad (Between Games)

**Trigger Conditions**

- After every 3 completed games (for free users)
- After user loses a ranked match
- Never during active gameplay

**Implementation**

```jsx
// src/features/ads/hooks/useInterstitialAd.js
import { useEffect } from "react";
import { useStore } from "@/features/game/store/gameStore";

export function useInterstitialAd() {
  const { gamesPlayed, isPro } = useStore();

  useEffect(() => {
    // Show ad every 3 games
    if (!isPro && gamesPlayed > 0 && gamesPlayed % 3 === 0) {
      showInterstitial();
    }
  }, [gamesPlayed, isPro]);
}

function showInterstitial() {
  // Full-screen modal with 5-second timer
  // User can skip after 5 seconds
  // Closes automatically after 30 seconds
}
```

**User Experience**

- 5-second countdown before "Skip" button appears
- "Continue to Game" button after countdown
- Closeable with X button after 5 seconds
- Darkened overlay to focus attention

**Revenue Estimate**: $2.00 - $5.00 CPM

---

### Rewarded Video Ad (Optional)

**Trigger Conditions**

- User clicks "Watch Ad for Bonus" button
- Offers: +50 coins, unlock daily challenge, revive in tournament

**Implementation**

```jsx
// Opt-in only, user-initiated
function RewardButton() {
  const handleWatchAd = () => {
    showRewardedVideo().then((watched) => {
      if (watched) {
        grantReward(50); // 50 coins
      }
    });
  };

  return (
    <button onClick={handleWatchAd} className="btn-secondary">
      Watch Ad for +50 Coins
    </button>
  );
}
```

**Revenue Estimate**: $10.00 - $25.00 CPM (highest eCPM)

---

## IAP Tiers

### Free Tier

**Features**

- ✅ Unlimited gameplay (PVP and PVE)
- ✅ 1 standard puck skin (Classic)
- ✅ 1 board theme (Birch Wood)
- ✅ Access to leaderboards
- ✅ Daily challenges
- ❌ Ads enabled (sidebar + interstitial every 3 games)
- ❌ No game analysis tools
- ❌ No premium skins

**User Journey**

- Download and play immediately
- Exposed to ads to monetize free users
- Encouraged to upgrade via in-game prompts
- Can purchase individual items à la carte

---

### Pro Tier ($4.99/month or $49.99/year)

**Features**

- ✅ **Ad-Free Experience**: No sidebar or interstitial ads
- ✅ **All Puck Skins Unlocked**: Heavy, Speedster, Neon, Crystal, etc.
- ✅ **All Board Themes**: Mahogany, Marble, Neon Arena, Ice Rink
- ✅ **Game Analysis**: Review past matches with replay system
- ✅ **Pro Badge**: Display on profile and leaderboard
- ✅ **Priority Matchmaking**: Faster queue times
- ✅ **Exclusive Tournaments**: Pro-only events with prizes
- ✅ **Early Access**: New features 1 week before free users

**Pricing Strategy**

- Monthly: $4.99 (impulse purchase price point)
- Yearly: $49.99 (2 months free, encourages commitment)
- 7-day free trial (requires payment method, auto-renews)

**Implementation**

```javascript
// src/features/shop/data/subscriptions.json
{
  "pro_monthly": {
    "id": "pro_monthly",
    "name": "Pro Monthly",
    "price": 4.99,
    "currency": "USD",
    "interval": "month",
    "features": [
      "Ad-free experience",
      "All skins and themes",
      "Game analysis tools",
      "Pro badge",
      "Priority matchmaking"
    ]
  },
  "pro_yearly": {
    "id": "pro_yearly",
    "name": "Pro Yearly",
    "price": 49.99,
    "currency": "USD",
    "interval": "year",
    "discount": "Save 17%",
    "features": ["All Pro Monthly features", "Best value!"]
  }
}
```

**Conversion Goal**: 5-10% of active users upgrade to Pro

---

### Individual Skins (À La Carte)

**Puck Skins**

| Skin Name | Price | Physics Modifier          | Description                       |
| --------- | ----- | ------------------------- | --------------------------------- |
| Classic   | Free  | Standard                  | Default white puck                |
| Heavy     | $0.99 | +100% mass, +50% friction | Powerful impacts, slower movement |
| Speedster | $0.99 | -30% mass, -50% friction  | Fast and agile, light impacts     |
| Neon      | $1.49 | Standard                  | Glowing trail effect              |
| Crystal   | $1.49 | +20% restitution          | Extra bouncy, ricochet master     |
| Stealth   | $1.99 | Standard                  | Dark texture, harder to track     |
| Golden    | $2.99 | Standard                  | Premium look, status symbol       |

**Board Themes**

| Theme Name | Price | Description                 |
| ---------- | ----- | --------------------------- |
| Birch Wood | Free  | Classic light wood          |
| Mahogany   | $1.49 | Rich dark wood              |
| Marble     | $1.99 | Luxury stone texture        |
| Neon Arena | $2.49 | Glowing cyberpunk aesthetic |
| Ice Rink   | $1.49 | Frozen hockey surface       |
| Retro      | $1.99 | Vintage 80s style           |

**Bundle Deals**

- **Starter Pack**: 3 puck skins + 1 board theme = $3.99 (save 20%)
- **Ultimate Pack**: All skins + all themes = $9.99 (save 50%)

**Implementation**

```javascript
// src/features/shop/data/pucks.json
{
  "pucks": [
    {
      "id": "classic",
      "name": "Classic Puck",
      "price": 0,
      "currency": "USD",
      "isPremium": false,
      "texture": "/assets/pucks/classic.png",
      "physics": {
        "mass": 1.0,
        "friction": 0.05,
        "restitution": 0.8,
        "frictionAir": 0.02
      },
      "description": "The standard puck. Balanced and reliable."
    },
    {
      "id": "heavy",
      "name": "Heavy Puck",
      "price": 0.99,
      "currency": "USD",
      "isPremium": true,
      "texture": "/assets/pucks/heavy.png",
      "physics": {
        "mass": 2.0,
        "friction": 0.08,
        "restitution": 0.6,
        "frictionAir": 0.03
      },
      "description": "Double the mass. Devastating impacts."
    }
    // ... more skins
  ]
}
```

---

## Purchase Flow

### Step 1: User Browses Shop

```jsx
// src/features/shop/components/ShopModal.jsx
function ShopModal() {
  const { purchasedSkins } = useStore();

  return (
    <Modal title="Shop">
      <Tabs>
        <Tab label="Puck Skins">
          <Grid>
            {pucks.map((puck) => (
              <PuckCard
                key={puck.id}
                puck={puck}
                owned={purchasedSkins.includes(puck.id)}
              />
            ))}
          </Grid>
        </Tab>

        <Tab label="Board Themes">{/* Similar grid */}</Tab>

        <Tab label="Pro Subscription">
          <ProUpgradeCard />
        </Tab>
      </Tabs>
    </Modal>
  );
}
```

### Step 2: User Clicks "Buy"

```jsx
function PuckCard({ puck, owned }) {
  const handlePurchase = async () => {
    if (puck.price === 0) {
      // Free item, just unlock
      unlockItem(puck.id);
    } else {
      // Paid item, initiate payment
      const result = await initiatePayment(puck);
      if (result.success) {
        unlockItem(puck.id);
        showToast("Purchase successful!");
      }
    }
  };

  return (
    <div className="card">
      <img src={puck.texture} alt={puck.name} />
      <h3>{puck.name}</h3>
      <p>{puck.description}</p>
      {owned ? (
        <button disabled>Owned</button>
      ) : (
        <button onClick={handlePurchase}>
          {puck.price === 0 ? "Unlock" : `Buy $${puck.price}`}
        </button>
      )}
    </div>
  );
}
```

### Step 3: Payment Processing

**Phase 1 (MVP)**: LocalStorage simulation

- No real payment processing
- Purchases stored locally
- For development and testing

**Phase 2 (Production)**: Stripe integration

```javascript
// src/features/shop/api/stripe.js
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe("pk_live_...");

export async function initiatePurchase(item) {
  const stripe = await stripePromise;

  // Create checkout session
  const response = await fetch("/api/create-checkout-session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      itemId: item.id,
      price: item.price,
    }),
  });

  const session = await response.json();

  // Redirect to Stripe Checkout
  const result = await stripe.redirectToCheckout({
    sessionId: session.id,
  });

  return result;
}
```

### Step 4: Unlock Item

```javascript
// src/features/shop/store/shopStore.js
import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useShopStore = create(
  persist(
    (set, get) => ({
      purchasedSkins: ["classic"], // Default free skin
      currentSkin: "classic",
      isPro: false,

      unlockSkin: (skinId) => {
        set((state) => ({
          purchasedSkins: [...state.purchasedSkins, skinId],
        }));
      },

      equipSkin: (skinId) => {
        const { purchasedSkins } = get();
        if (purchasedSkins.includes(skinId)) {
          set({ currentSkin: skinId });
        }
      },

      upgradeToPro: () => {
        set({ isPro: true });
        // Unlock all skins
        const allSkinIds = pucks.map((p) => p.id);
        set({ purchasedSkins: allSkinIds });
      },
    }),
    {
      name: "shop-storage", // LocalStorage key
    }
  )
);
```

---

## Data Persistence

### LocalStorage Structure

```javascript
// Key: 'shop-storage'
{
  "state": {
    "purchasedSkins": ["classic", "heavy", "speedster"],
    "currentSkin": "heavy",
    "purchasedThemes": ["birch_wood", "mahogany"],
    "currentTheme": "mahogany",
    "isPro": false,
    "proExpiresAt": null,
    "totalSpent": 2.98
  },
  "version": 1
}
```

### Backend Sync (Future)

When user creates account, sync purchases to database:

```javascript
// POST /api/purchases/sync
{
  "userId": "user_123",
  "purchases": [
    { "itemId": "heavy", "purchasedAt": "2026-01-12T10:30:00Z" },
    { "itemId": "speedster", "purchasedAt": "2026-01-12T11:45:00Z" }
  ],
  "subscription": {
    "tier": "pro_monthly",
    "startedAt": "2026-01-12T12:00:00Z",
    "expiresAt": "2026-02-12T12:00:00Z"
  }
}
```

---

## Conversion Tactics

### 1. Shop Prompts (Non-Intrusive)

**After losing 3 games in a row**

```
"Struggling? Try the Heavy Puck for more powerful shots!"
[View in Shop] [Dismiss]
```

**After winning 5 games with default skin**

```
"You're on fire! 🔥 Celebrate with the Neon Puck!"
[Unlock for $1.49] [Maybe Later]
```

### 2. Limited-Time Offers

**Weekend Sale**

```
🎉 Weekend Special: 50% off all puck skins!
Ends in: 23:45:12
[Shop Now]
```

**New User Discount**

```
Welcome! Get the Starter Pack for just $1.99 (60% off)
First purchase only. Offer expires in 24 hours.
```

### 3. Pro Trial Reminder

**After 10 games played**

```
"Enjoying Sling Hockey? Try Pro FREE for 7 days!"
✓ No ads
✓ All skins unlocked
✓ Game analysis tools
[Start Free Trial] [No Thanks]
```

### 4. Ad Removal Prompt

**After user sees 5 interstitial ads**

```
"Tired of ads? Upgrade to Pro or purchase individual skins."
[Go Ad-Free ($4.99/mo)] [Buy Skins] [Close]
```

---

## Analytics & Metrics

### Key Performance Indicators (KPIs)

1. **Conversion Rate**: % of users who make a purchase

   - Target: 3-5% for any purchase
   - Target: 5-10% for Pro subscription

2. **Average Revenue Per User (ARPU)**

   - Target: $0.50 - $1.00 per user

3. **Ad Revenue Per User**

   - Free users: $0.20 - $0.40 per month

4. **Lifetime Value (LTV)**

   - Free user: $2.00 - $5.00
   - Paying user: $15.00 - $50.00

5. **Churn Rate** (Pro subscribers)
   - Target: <10% monthly churn

### Tracking Events

```javascript
// src/utils/analytics.js
export function trackEvent(event, data) {
  // Google Analytics
  gtag("event", event, data);

  // Custom analytics
  fetch("/api/analytics", {
    method: "POST",
    body: JSON.stringify({ event, data, timestamp: Date.now() }),
  });
}

// Usage
trackEvent("shop_opened", { source: "sidebar" });
trackEvent("item_purchased", { itemId: "heavy", price: 0.99 });
trackEvent("pro_subscribed", { plan: "monthly", trial: true });
trackEvent("ad_viewed", { type: "interstitial", gamesPlayed: 6 });
```

---

## A/B Testing

### Test 1: Pro Pricing

- Group A: $4.99/month
- Group B: $3.99/month
- Group C: $5.99/month

**Hypothesis**: Lower price increases conversion more than it decreases revenue.

### Test 2: Shop Placement

- Group A: Shop in sidebar (always visible)
- Group B: Shop in modal (click to open)

**Hypothesis**: Always-visible shop increases conversion.

### Test 3: Interstitial Frequency

- Group A: Every 3 games
- Group B: Every 5 games
- Group C: Only on loss

**Hypothesis**: Less frequent ads reduce churn.

---

## Legal & Compliance

### Required Disclosures

1. **Pricing Transparency**

   - All prices displayed in user's local currency
   - Taxes added at checkout
   - Subscription auto-renewal clearly stated

2. **Refund Policy**

   - Digital goods generally non-refundable
   - Pro subscription refundable within 48 hours
   - Exceptions for technical issues

3. **Privacy Policy**

   - How purchase data is stored
   - Third-party payment processors
   - Data retention policies

4. **Terms of Service**
   - User rights to purchased items
   - Account termination consequences
   - Item transferability (none)

### GDPR Compliance (Europe)

- User consent for tracking
- Right to data export
- Right to data deletion
- Cookie consent banner

---

## Future Monetization

### Phase 6+

1. **Cosmetic Bundles**: Seasonal theme packs
2. **Battle Pass**: Quarterly progression rewards
3. **Tournaments**: Entry fees with prize pools
4. **Gifting**: Send skins to friends
5. **Referral Program**: Earn coins for invites
6. **Cryptocurrency**: Optional crypto payments
7. **NFT Skins**: Limited edition blockchain items

---

**Document Version**: 1.0  
**Last Updated**: January 12, 2026  
**Revenue Target**: $5,000/month by end of Q2 2026
