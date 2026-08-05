# Prompt patterns

## Phase 1 — concept icons (1:1)

Generate 4–6 **unrelated** brand worlds. Each prompt = one visual direction, not a literal feature diagram.

```
Square app icon, rounded corners. [Brand name] brand: [palette]. [Metaphor/visual]. 
Minimal, beautiful, no text, no words. NOT purple dev-tool clipboard cliché unless requested.
```

Good directions: sticker pop, warm ink, aurora glass, memphis candy, peel sticker, magnet picker.

After generation: `preview.html` grid for comparison. User picks one → delete others.

## Phase 2 — brand guide (16:9)

Use picked icon as `input_reference`.

```
Brand guide design cheat sheet poster for [Product]. Match attached app icon style: [palette].
Landscape board: wordmark, color swatches with hex, typography samples, dark UI component mocks,
icon at 128px + 24px toolbar glyph, brand voice tags. Figma brand board — no people, no desk.
```

## Phase 3 — promo tiles

**Small (440×280):** compact wordmark + hero visual + short tagline. Readable at thumbnail size.

**Marquee (1400×560):** wide cinematic — headline left, hero visual right. No fake browser frame.

## Phase 3 — store slides (1280×800)

### Full-bleed prefix (every slide)

```
Promotional marketing slide for Chrome Web Store — concept illustration explaining a benefit.
NOT a literal app screenshot, browser window, or extension popup mockup.
Full-bleed edge-to-edge composition filling the entire 16:9 frame — background color/texture extends to all four edges.
Multi-column editorial layout that fills the frame width — NOT a small centered island on empty background.
Concrete UI widgets with realistic sample data (prices, dates, names) — not abstract icon rows alone.
Keep headlines and key UI cards inset ~5% from edges; decorative elements (fabric, watermarks, footer bars) may bleed off edges.
```

Append brand prompt prefix + match attached icon style for slides 1–5.

### Per-slide composition (quality bar: MMP screenshot-03/04/05)

| Slide | Layout | Must include |
|-------|--------|--------------|
| **1 Hero** | Headline top + 3 benefit columns below | Product wordmark, serif headline, three icon columns with short copy — fill vertical space; optional edge props (cup, plant shadow) bleeding off sides |
| **2 How it works** | 3-step horizontal flow + bottom footer bar | Numbered step cards connected by arrows/dots; burgundy footer bar **touching bottom edge**; optional plant/trophy props |
| **3 Benefit** | Headline left + copy right \| two contrasting cards center \| 3 icons bottom | Gray "before" card vs red "after" card with **savings badge** overlapping corner; night-by-night data strip; connector between cards |
| **4 Feature depth** | 3 columns: value prop \| UI widget \| comparison card | Left: headline + bullet features. Center: **concrete planner widget** (calendar row, rate blocks, recommendation callout). Right: tier comparison card with VS and savings footer. Red fabric or texture **bleeding off left edge**; burgundy footer bar at bottom |
| **5 Compare/formats** | Headline top + two card tables + controls row + bottom banner | Side-by-side cards with contrasting headers (cash vs points); sample hotel rows with real-looking prices; sort pill buttons; export callout; watermark sketches **bleeding off left/right edges** |

### Slide prompt examples

**Slide 3 — benefit:**
```
[prefix]. Linen texture background to all edges. Headline left "See the difference" + supporting copy right with vertical divider. Two rate comparison cards center: gray Standard ($1,523 total, 7-night grid) vs maroon MMP ($963, savings badge "YOU SAVE $560"). Three icon columns bottom — savings, clarity, trust.
```

**Slide 4 — feature:**
```
[prefix]. Red fabric drapes off left edge, cream texture fills frame. Three columns: left value prop + feature bullets, center split-stay planner widget (calendar row, corp/standard night blocks, recommendation box), right tier comparison card (MMF vs MMP split, savings footer). Testimonial quote + burgundy footer bar touching bottom edge.
```

**Slide 5 — compare:**
```
[prefix]. Cream background with hotel sketch watermarks bleeding off left/right edges. Headline "See every option" top. Two card tables: Cash rates (sample hotels + $ prices) vs Bonvoy points (CPP values). Sort pill row below. Export-to-Markdown callout. Bottom tagline banner.
```

### Regenerate one slide

```bash
set -a && source .env && set +a && bun .cursor/skills/extension-store-assets/scripts/generate.ts \
  --config=public/mmp-store-assets/brand.config.json --phase=store --screenshots-only
```

Edit individual slide prompts in `brand.config.json` before re-running.
