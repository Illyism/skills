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
Concrete UI widgets with realistic sample data (class names, code snippets, button labels) — not abstract icon rows alone.
Keep headlines and key UI cards inset ~5% from edges; decorative elements (glows, class pills, footer bars) may bleed off edges.
```

Append brand prompt prefix + match attached icon style for slides 1–5.

### Per-slide composition

| Slide | Layout | Must include |
|-------|--------|--------------|
| **1 Hero** | Headline top + 3 benefit columns below | Product wordmark, headline, three icon columns with short copy — fill vertical space; optional edge props bleeding off sides |
| **2 How it works** | 3-step horizontal flow + bottom footer bar | Numbered step cards connected by arrows/dots; footer bar **touching bottom edge** |
| **3 Benefit** | Headline left + copy right \| two contrasting cards center \| 3 icons bottom | Gray "before" card vs glowing "after" card; sample data strip; connector between cards |
| **4 Feature depth** | 3 columns: value prop \| UI widget \| comparison card | Left: headline + bullet features. Center: **concrete widget** (picker highlight, class output, copy button). Right: format comparison card. Texture **bleeding off left edge**; footer bar at bottom |
| **5 Compare/formats** | Headline top + two card panels + controls row + bottom banner | Side-by-side cards with contrasting headers (Tailwind vs CSS); sample class strings; toggle or export callout; decorative elements **bleeding off left/right edges** |

### Slide prompt examples (Peel UI)

**Slide 3 — benefit:**
```
[prefix]. Charcoal background to all edges. Headline left "Stop rebuilding from screenshots" + supporting copy right. Two cards center: gray sad screenshot with crop handles vs glowing peeled button with Tailwind class pills (px-6, rounded-2xl, bg-pink-500). Three icon columns bottom — speed, accuracy, copy-ready.
```

**Slide 4 — feature:**
```
[prefix]. Cyan glow off left edge, dark charcoal fills frame. Three columns: left value prop + feature bullets, center element picker widget with dashed highlight and className output panel, right Tailwind v4 vs Plain CSS comparison card. Magenta footer bar touching bottom edge.
```

**Slide 5 — compare:**
```
[prefix]. Dark background with code bracket watermarks bleeding off left/right edges. Headline "Your format. Your stack." top. Two card panels: Tailwind v4 (class pills: px-4, rounded-xl, bg-cyan-500) vs Plain CSS (property blocks). Export callout. Bottom tagline banner.
```

### Regenerate one slide

```bash
set -a && source .env && set +a && bun .cursor/skills/extension-store-assets/scripts/generate.ts \
  --config=public/_static/copy-ui-icons/brand.config.json --phase=store --screenshots-only
```

Edit individual slide prompts in `brand.config.json` before re-running.
