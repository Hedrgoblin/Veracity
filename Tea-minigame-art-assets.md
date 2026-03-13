# Tea Service Minigame — Art Assets List

All files are **PNG with RGBA (transparency)** unless noted otherwise.

---

## Already Exists

These assets are in `/public/assets/images/puzzles/tea/` and can be reused as-is (all 200×200px):

| File | Used For |
|---|---|
| `teacup_white.png` | Default teacup style |
| `teacup_metal.png` | Alternate teacup style |
| `teacup_floral.png` | Alternate teacup style |
| `tealeaves_01/02/03.png` | Black tea ingredient icon |
| `cream_01/02/03.png` | Cream ingredient icon |
| `lemon_slice.png` / `lemon_slice2.png` / `lemon_pile.png` | Lemon ingredient icon |
| `sugar_01/02/03.png` | Sugar ingredient icon |

The tea station background `puzzle_tea_01.png` in `/public/assets/images/puzzles/` (750×1624px) is already loaded and draws behind the tea minigame.

---

## Needs to Be Created

### Station Equipment
Location: `/public/assets/images/puzzles/tea/`
Size: **200×200px** each

| File | Description |
|---|---|
| `faucet_idle.png` | Faucet, no water flowing — steampunk pipe tap |
| `faucet_active.png` | Faucet with water stream — shown while teapot fills (3s fill animation) |
| `teapot_empty.png` | Teapot, empty — center station |
| `teapot_filling.png` | Teapot filling — shown during 3s fill; can omit if using `faucet_active` as cue |
| `teapot_hot_ready.png` | Teapot full of hot water — tappable, shows 🔥 label |
| `teapot_cold_ready.png` | Teapot full of cold water — tappable, shows ❄️ label |
| `ice_bucket.png` | Ice bucket — tap to toggle hot/cold for the next pour |
| `trash_bin.png` | Rubbish bin — tap to discard cup or exit serve mode |

---

### Teacup States
Location: `/public/assets/images/puzzles/tea/`
Size: **200×200px** each

Each teacup slot goes through these states (currently shown as a single ☕ emoji):

| File | State | Notes |
|---|---|---|
| `cup_empty.png` | Empty cup | Starting state; tap to open recipe popup |
| `cup_hot_water.png` | Cup with hot water | Poured from hot teapot |
| `cup_cold_water.png` | Cup with cold water | Poured from cold (ice) teapot |
| `cup_brewing.png` | Brewing in progress | Shows progress bar overlay; could have steam effect |
| `cup_ready_hot.png` | Finished hot drink | Tap to enter serve mode; shows 🔥 |
| `cup_ready_cold.png` | Finished cold drink | Tap to enter serve mode; shows ❄️ |

You could use a single base cup + colour overlays in code, but separate files give more visual character.

---

### Ingredient Icons (inventory bar)
Location: `/public/assets/images/puzzles/tea/`
Size: **200×200px** each

The following are currently shown as emoji (🍃🌿) and have no image files yet:

| File | Description |
|---|---|
| `black_tea.png` | Black tea leaves — darker, rolled leaves |
| `herbal.png` | Herbal blend — lighter, flowery leaves/petals |

> `cream`, `lemon`, and `sugar` are already covered by existing assets above.

---

### Customer Sprites
Location: `/public/assets/images/puzzles/tea/customers/`
Size: **120×200px** each (portrait orientation)

Customers have three happiness states. At minimum, create one character type; additional types add variety.

| File | Description |
|---|---|
| `customer_a_happy.png` | Customer type A, happy — seated, leaning forward, smiling |
| `customer_a_neutral.png` | Customer type A, neutral — patience at 50–75% |
| `customer_a_mad.png` | Customer type A, mad — patience below 25%; arms crossed or frowning |
| `customer_b_happy.png` | Customer type B (optional) |
| `customer_b_neutral.png` | Customer type B (optional) |
| `customer_b_mad.png` | Customer type B (optional) |
| `customer_c_happy.png` | Customer type C (optional) |
| `customer_c_neutral.png` | Customer type C (optional) |
| `customer_c_mad.png` | Customer type C (optional) |

The empty slot placeholder (currently 💺) could also be a simple chair or table sprite:

| File | Description |
|---|---|
| `customer_slot_empty.png` | Empty chair / table — shown when no customer is in the slot |

---

### Recipe Popup (optional but nice)
Location: `/public/assets/images/puzzles/tea/`
Size: **200×200px** each

Small icons shown next to each recipe name in the popup. These are optional — the popup currently uses text labels only.

| File | Recipe |
|---|---|
| `recipe_tea.png` | Plain tea — tea leaves only |
| `recipe_cream_tea.png` | Tea with cream |
| `recipe_lemon_tea.png` | Tea with lemon |
| `recipe_sweet_tea.png` | Tea with sugar |
| `recipe_herbal.png` | Herbal tea — herbal leaves only |
| `recipe_herbal_cream.png` | Herbal tea with cream |

---

### UI / HUD Elements (optional)
Location: `/public/assets/images/puzzles/tea/`

These are currently drawn with Phaser geometry (rectangles, text). Custom sprites would replace them:

| File | Size | Description |
|---|---|---|
| `timer_bar_bg.png` | 360×20px | Background track for the session countdown bar at top |
| `timer_bar_fill.png` | 360×20px | Coloured fill; code masks/scales width |
| `patience_bar_bg.png` | 200×12px | Background track for each customer's patience bar |
| `patience_bar_fill.png` | 200×12px | Coloured fill; code scales width |
| `order_bubble.png` | 160×80px | Speech-bubble background for customer order display |
| `summary_panel.png` | 700×900px @2x → **350×450pt** | End-of-session results panel background |

---

## Size Reference Summary

| Asset Type | Dimensions | Count |
|---|---|---|
| Equipment sprites | 200×200px | 8 |
| Teacup state sprites | 200×200px | 6 |
| Ingredient icons (new) | 200×200px | 2 |
| Customer sprites (min 1 type) | 120×200px | 3–9 |
| Empty slot placeholder | 120×200px | 1 |
| Recipe icons (optional) | 200×200px | 6 |
| UI / HUD (optional) | Various | 6 |

**Minimum to replace all emoji:** 17 new sprites (equipment + cups + 2 ingredient icons + 3 customer states + empty slot)

---

## Notes

- All assets use **RGBA PNG** (transparency required — no white backgrounds).
- The canvas renders at logical CSS pixels; sprites will display at a scaled size in-game. Source art at 200×200px will be crisp on all retina/non-retina displays at the sizes used (32–80px render target).
- Customer sprites at 120×200px match a roughly portrait character silhouette. If they feel cramped at 120px wide, 160×240px also works — the code scales dynamically.
- Steampunk aesthetic: brass, copper, dark wood, leather, rivets, gothic serif lettering — consistent with the rest of the game.
