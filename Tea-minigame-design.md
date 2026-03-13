# Tea Minigame — Design Document


---

## 1. High-Level Overview

This is a **timed service minigame** where the player make tea, preparing and serving drinks to a queue of customers before time runs out.

**Core loop:**

```
Customers appear → They show an order (recipe + water type)
→ Player fills teapot with water → Pours into teacup
→ Selects a recipe (consuming ingredients) → Tea brews for N seconds
→ Player drags finished tea to the correct customer → teacups earned
→ Repeat until timer expires
```

**Key tensions:**
- Multiple customers waiting simultaneously (up to 3) — each with a patience timer.
- Brewing takes real time — the player must juggle multiple teacups in parallel.
- Ingredients are finite — harvested from a garden between sessions.
- Serving the right order earns rewards; serving the wrong one loses a customer.

---

## 2. Full Gameplay Flow

### Phase 1: Pre-Service (Preparation)

1. **Recipe Selection** — The player picks which recipes to bring (up to a configurable max, e.g., 4 slots). Only recipes for which the player has sufficient ingredients are selectable.

2. **Session starts** — The timer begins.

### Phase 2: Service (Core Gameplay)

The core gameplay loop runs for the duration of the session timer (default: **120 seconds**).

```
┌─────────────────────────────────────────────────────┐
│                    SESSION ACTIVE                     │
│                                                       │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐       │
│  │ Slot 1   │    │ Slot 2   │    │ Slot 3   │       │
│  │ Customer │    │ Customer │    │ (empty)  │       │
│  │ [Order]  │    │ [Order]  │    │          │       │
│  └──────────┘    └──────────┘    └──────────┘       │
│                                                       │
│  ┌────────┐  ┌────────┐  ┌────────┐                 │
│  │Teacup 1│  │Teacup 2│  │Teacup 3│  (1-3 slots)   │
│  └────────┘  └────────┘  └────────┘                 │
│                                                       │
│  [Faucet/Water]   [Teapot]   [Ice Bucket]   [Trash] │
└─────────────────────────────────────────────────────┘
```

**Step-by-step tea preparation:**

| Step | Action | Time Cost |
|------|--------|-----------|
| 1 | Tap the **faucet** — hot water starts filling the **teapot** | `TeapotWaterFillTimeSeconds` (3s) |
| 2 | *(Optional)* Drag the **ice bucket** onto the teapot to switch to **cold water** | Instant |
| 3 | Drag the **teapot** onto an empty **teacup** to pour water | Instant |
| 4 | Tap the **teacup** (now containing water) to open the **recipe selection popup** | — |
| 5 | Select a recipe — ingredients are consumed from inventory | Instant |
| 6 | The teacup enters a **brewing state** with a progress bar | `RecipeConfig.ProductionTime` (6-12s) |
| 7 | When brewing completes, the teacup shows the finished drink | — |
| 8 | Drag the **ready teacup** to a **customer** whose order matches | Instant |

**Parallel workflow:** The player typically has 1–3 teacups and should be filling/brewing multiple at once while waiting for timers to complete.

### Phase 3: Summary (Post-Service)

When the session ends (timer, manual close, or out of ingredients), a summary screen shows:

- Total teas MadCustomersServed (Great / Good / Bad breakdown).
- Total coins earned.
- Total reputation earned.
- Familiar XP earned (if applicable).
- **Session grade** (S / A / B / C / D).
---

## 3. Customer System

### Spawning

- **3 customer slots** — left, center, right positions.
- Customers spawn into empty slots at random intervals.
- There is a brief delay before the first customer (`InitialCustomerSpawnTime`: 5s).
- Subsequent customers spawn after a random delay between `MinCustomerSpawnTimeSeconds` (7s) and `MaxCustomerSpawnTimeSeconds` (9s).
- Spawning stops `NoSpawnTimeOffsetSeconds` (15s) before the session ends.
- Each customer type has a `SpawnWeight` that affects how likely they are to appear.

### Orders

Each customer requests:
- **One recipe** — randomly chosen from the recipes the player brought to this session.
- **One water type** — Hot or Cold (random).

The order is displayed in a **speech bubble** above the customer, showing:
- The recipe icon.
- A hot/cold water indicator (steam icon vs. ice icon).

Only recipes the player can actually craft (has ingredients for) are assigned to customers.

### Patience & Happiness

Each customer has a **patience timer** (default: 120 seconds per customer). As patience decreases, the customer's mood shifts through three states:

| Happiness State | When | Visual | Reward Multiplier |
|-----------------|------|--------|-------------------|
| **Happy** 😊 | 0% – 33% of patience consumed | Happy sprite | ×1.5 |
| **Neutral** 😐 | 33% – 66% of patience consumed | Neutral sprite | ×1.0 |
| **Mad** 😠 | 66% – 100% of patience consumed | Mad sprite | ×0.5 |

- If patience hits **0**, the customer leaves angry — **no reward**, counts as a failed order.
- Serving a **wrong order** (wrong recipe or wrong water type) — the customer leaves angry immediately with a ×0.25 penalty multiplier.

### Special Customer Types

**VIP Customers** *(optional feature)*:
- Special named NPCs that appear with dialogue.
- Their patience does **not** decrease (no time pressure).
- Order is revealed after dialogue completes.
- Appear based on narrative triggers.

**Tutorial Customers** (FTUE):
- Patience does not decrease.
- Fixed order from a tutorial config.
- Used only during the first-time user experience.

---

## 4. Tea Preparation Mechanics

### Equipment

| Item | Purpose | Interaction |
|------|---------|-------------|
| **Faucet** | Produces hot water | Tap to start filling the teapot |
| **Teapot** | Holds water (hot or cold) | Drag onto teacup to pour; drag to trash to discard |
| **Ice Bucket** | Converts hot water to cold | Drag onto teapot |
| **Teacups** (1–3) | Brewing stations | Tap to select recipe; drag to customer to serve; drag to trash to discard |
| **Trash Zone** | Discards unwanted items | Drop target for teapot or teacup |

### Teacup States

```
Empty → WithWater → Producing → Ready
  │                      │
  └──────── Trash ◄──────┘ (returns ingredients if recipe was selected)
```

| State | Description | Visual |
|-------|-------------|--------|
| **Empty** | No water, ready to receive | Empty cup sprite |
| **WithWater** | Water added, waiting for recipe selection | Cup with water, can be tapped |
| **Producing** | Recipe selected, brewing in progress | Progress bar filling up |
| **Ready** | Tea finished, ready to serve | Finished drink sprite, can be dragged |

### Water Types

| Type | How to get | Visual Indicator |
|------|-----------|------------------|
| **Hot** | Fill teapot from faucet (default) | Steam particles |
| **Cold** | Fill teapot, then drag ice bucket onto it | Ice/frost particles |

The water type **must match** what the customer ordered, or it counts as a wrong order.

### Trash / Discard

- Dragging the **teapot** to trash → empties the teapot, resets it to unfilled.
- Dragging a **teacup** (WithWater or Ready) to trash → resets the teacup to Empty. If a recipe was already applied (Producing or Ready state), **ingredients are returned** to inventory.

---

## 5. Serving & Feedback

### Correct Order

When the player drags a Ready teacup to a customer and the recipe **and** water type match:

1. Customer plays a happy/satisfied animation.
2. Floating text shows reward earned.
3. Feedback type is determined:
   - **"Great!"** — The recipe uses the customer's **favorite ingredient**. Awards teacup.
   - **"Good!"** — The recipe is correct but doesn't use the favorite ingredient.
4. Customer are awarded (modified by happiness multiplier).
5. The customer leaves satisfied.
6. The teacup resets to Empty.

### Wrong Order

If the recipe or water type does **not** match:

1. Customer shows a displeased animation.
2. **"Bad!"** feedback appears.
3. Customer leaves angry.
4. Happiness multiplier drops to ×0.25.
5. The teacup is NOT reset — the drink is wasted.

---

## 7. Currency & Rewards

### Currencies

| Currency | Earned From | Used For |
|----------|-------------|----------|
| **teacups** | Serving customers | unlocking recipe slots, Unlocking new recipes |

---

## 8. Timer Mechanics

| Timer | Duration | Purpose |
|-------|----------|---------|
| **Session Timer** | 120 seconds (configurable) | Total time for the service session |
| **Customer Patience** | 120 seconds per customer | Time before customer leaves angry |
| **Teapot Fill** | 3 seconds | Time to fill teapot with water from faucet |
| **Recipe Production** | 6–12 seconds (per recipe) | Brewing time after recipe is selected |
| **Customer Spawn Delay** | 7–9 seconds (random) | Gap between customer arrivals |
| **Initial Spawn Delay** | 5 seconds | Delay before first customer appears |

### Session End Conditions

The session ends when **any** of these occur:
1. **Timer expires** — the 120-second session clock runs out.
2. **Manual close** — the player taps the close button and confirms.
3. **Out of ingredients** — no teacups are in production, no servable teas are ready, and no active customers have a craftable recipe remaining.

When ending due to ingredients, remaining customers all leave sad, and an "Out of Ingredients" popup is shown before the summary.

---

---

## 10. Recipes & Ingredients

### Ingredients (9 types)

| Ingredient | Max Stack |
|------------|-----------|
| Water | 300 |
| Black Tea| 100 |
| Herbal | 100 |
| Cream | 50 |
| Lemon | 50 |
| Sugar | 50 |

Ingredients: give the player a starting inventory.

### Recipes (15 total)

| Recipe | Brew Time | Ingredients |
|--------|-----------|-------------|
| Tea | 6s | 1× Black Tea, 1× Water |
| Cream Tea | 8s | 1× Black Tea, 1× Cream, 1× Water |
| Tea with Lemon | 6s | 1× Black Tea, 1× Water, 1× Lemon |
| Sweet Tea | 6s | 1× Black Tea, 1× Water, 1× Sugar  |
| Sweet Cream Tea | 8s | 1× Black Tea, 1× Cream, 1× Water, 1× Sugar  |
| Sweet Tea with Lemon| 6s | 1× Black Tea, 1× Water, 1× Lemon, 1× Sugar  |
| Herbal Tea | 6s | 1× Herbal, 1× Water |
| Herbal Cream Tea | 8s | 1× Herbal, 1× Cream, 1× Water |
| Herbal Tea with Lemon | 6s | 1× Herbal, 1× Water, 1× Lemon |
| Sweet Herbal Tea | 6s | 1× Black Tea, 1× Water, 1× Sugar  |
| Sweet Herbal Cream Tea | 8s | 1× Black Tea, 1× Cream, 1× Water, 1× Sugar  |
| Sweet Herbal Tea with Lemon| 6s | 1× Black Tea, 1× Water, 1× Lemon, 1× Sugar  |



**Pattern:** Simple starter recipes brew faster (6–10s); complex recipes take longer (12s) but are worth more

---

## 11. Difficulty & Progression


### Teacup Unlocking

- Players start with **1 teacup**.
- Additional teacups (up to **3 total**) unlock as the player progresses.
- More teacups = more drinks brewing simultaneously = higher throughput.

### Recipe Unlocking

- Players start with 1 recipe (Tea).
- New recipes unlock each chapter.
- More recipes = more variety of customer orders.

---

## 12. UI Elements & Layout

### During Service (Main Gameplay Screen)

```
┌─────────────────────────────────────────────────────────┐
│  [teacups: 1,250]    [═══════Timer Bar═══════]    [✕]    │  ← HUD
│                                                         │
│    ┌─────────┐   ┌─────────┐   ┌─────────┐            │
│    │ Customer│   │ Customer│   │ (empty) │            │  ← Customer Slots
│    │  💬☕🔥 │   │  💬🍵❄ │   │         │            │
│    │ ████░░░ │   │ ██████░ │   │         │            │  ← Patience Bars
│    └─────────┘   └─────────┘   └─────────┘            │
│                                                         │
│  ┌──────────────────────────────────────────────────┐  │
│  │                   Tea Station                  │  │
│  │                                                    │  │
│  │   🚰          🫖           🧊                     │  │  ← Faucet, Teapot, Ice
│  │  Faucet     Teapot     Ice Bucket                 │  │
│  │                                                    │  │
│  │   ☕          ☕          ☕                        │  │  ← Teacups (1-3)
│  │  Cup 1      Cup 2      Cup 3                      │  │
│  │                                                    │  │
│  │              🗑️ Trash                              │  │  ← Trash Zone
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

### Order Bubble (per customer)

Shows above each customer:
- **Recipe icon** — which drink they want.
- **Water type indicator** — flame/steam for hot, snowflake/ice for cold.
- **Patience bar** — colored bar that depletes over time (green → yellow → red).

### Recipe Selection Popup

Opens when tapping a teacup with water:
- Scrollable list of available recipes.
- Each recipe shows: icon, name, ingredient requirements (with current stock in green/red).
- Disabled recipes (not enough ingredients) are grayed out and sorted to the bottom.

### Summary Screen

Shown after the session ends:
- **Teacups** amoubt if teacups made
- **"Continue" button** to exit.

---

## 13. State Diagram

### Session States

```
Inactive → PreService → Running → Summary
                ↑                     │
                └─────────────────────┘
```

| State | Description |
|-------|-------------|
| **Inactive** | Teashop is not open |
| **Running** | Active gameplay session with timer |
| **Summary** | Results screen after session ends |

### Teacup State Machine

```
       ┌──────────┐
       │  Empty   │◄──────────────────────────┐
       └────┬─────┘                            │
            │ Pour water from teapot           │
            ▼                                  │
       ┌──────────┐                            │
       │WithWater │──── Drag to Trash ─────────┤
       └────┬─────┘                            │
            │ Select recipe                    │
            ▼                                  │
       ┌──────────┐                            │
       │Producing │──── Drag to Trash ─────────┤
       └────┬─────┘    (ingredients returned)  │
            │ Brewing complete                 │
            ▼                                  │
       ┌──────────┐                            │
       │  Ready   │──── Drag to Trash ─────────┘
       └────┬─────┘    (ingredients returned)
            │ Drag to correct customer
            ▼
       Customer Served → Teacup resets to Empty
```

### Customer Lifecycle

```
       Spawned (Happy)
            │
            │ Patience decreases...
            ▼
     ┌──── Happy ────┐
     │   (0-33%)     │
     │               ▼
     │         Neutral
     │        (33-66%)
     │               │
     │               ▼
     │           Mad
     │        (66-100%)
     │               │
     │               ▼
     │        Patience = 0 → Leave Angry (no reward)
     │
     └──── Served correctly → Leave Happy (reward given)
              │
              └── Wrong order → Leave Angry (0.25x reward)
```

---

## 14. Balance Reference Tables

### Core Timing

| Parameter | Value | Notes |
|-----------|-------|-------|
| Session Duration | 120s | Total minigame length |
| Customer Patience | 120s | Per customer |
| Teapot Fill Time | 3s | Water filling |
| Initial Spawn Delay | 5s | Before first customer |
| Spawn Interval (min) | 7s | Between customers |
| Spawn Interval (max) | 9s | Between customers |
| No-Spawn Buffer | 15s | Stops spawning this many seconds before session end |
| Simplest Recipe Brew | 6s | Classic Eterni-Tea |
| Complex Recipe Brew | 12s | Most advanced recipes |

### Happiness Thresholds

| Transition | % of Patience Consumed |
|-----------|------------------------|
| Happy → Neutral | 33% |
| Neutral → Mad | 66% |
| Mad → Left | 100% |

### Reward Multipliers

| Scenario | Multiplier |
|----------|-----------|
| Served while Happy | ×1.5 |
| Served while Neutral | ×1.0 |
| Served while Mad | ×0.5 |
| Wrong order | ×0.25 |

### Grade Weights & Thresholds

| Component | Weight |
|-----------|--------|
| Completion | 0.45 |
| Speed | 0.30 |
| Satisfaction | 0.25 |


---

## Adaptation Notes for Interactive Fiction

If you're adapting this for an interactive fiction game, consider:

1. **Simplify the real-time drag-and-drop** — Replace with choice-based actions ("Pour water → Select recipe → Serve to Customer A") or a simpler click-based interface.
2. **The recipe matching is the puzzle** — Remembering which customer wants which recipe (and hot/cold) is the mental challenge.
3. **Scale complexity gradually** — Start with 1 teacup and 1 recipe, then unlock more. The juggling increases naturally.
