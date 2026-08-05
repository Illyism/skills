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

Always prefix with:

```
Promotional marketing slide for Chrome Web Store — concept illustration explaining a benefit.
NOT a literal app screenshot, browser window, or extension popup mockup.
Clean centered composition with generous empty margins; no text or graphics touching edges.
```

| Slide | Focus |
|-------|-------|
| 1 | Hero value prop + 3 benefit icons |
| 2 | How it works (3-step infographic) |
| 3 | Problem/benefit (before vs after concept) |
| 4 | Key feature depth (output format, speed, etc.) |
| 5 | Comparison or formats (two cards side by side) |

Append brand prompt prefix + match attached icon style for slides 1–5.

---

## Prompt tips

### 4-block structure

Every prompt should hit these in order:

1. **Format** — "Square 1:1 app icon" / "Promotional marketing slide 16:9"
2. **Brand anchor** — palette with hex + one metaphor ("sticker peel", "glass lozenge")
3. **Hero content** — one focal object, one headline idea, max 3 supporting elements
4. **Avoid** — "NOT a browser screenshot", "no text touching edges", "no clipboard cliché"

### Sell the benefit, not the UI

| Bad | Good |
|-----|------|
| "Extension popup with Tailwind toggle and Plain CSS card" | "Slide 3 — Stop rebuilding from screenshots. Grey sad screenshot vs glowing peeled button with class pills" |
| "Marquee selection + clipboard + copy arrow" | "Peel sticker revealing `</>` underneath" |

One slide = one idea. Don't combine hero + picker + code panel + export in one image.

### Negative prompts matter

Models default to generic SaaS purple + clipboard icons. Always ban what you don't want:

```
NOT a literal app screenshot, browser window, or extension popup mockup.
NOT purple dev-tool clipboard cliché unless requested.
No text or graphics touching edges.
```

### Palette

- **3 colors max** with hex: primary, accent, background
- One **material word**: "glossy 3D sticker", "matte washi paper", "iridescent glass"
- Once picked, reuse the **same palette string** in every phase-2/3 prompt

### Reference images

| Phase | Reference? |
|-------|------------|
| Concepts | No — want divergence |
| Brand guide + store | Yes — pass picked icon as `input_reference` |
| Wording | "Match attached app icon style" — don't re-describe the whole icon |

### Size-aware prompting

| Asset | Optimize for |
|-------|--------------|
| 440×280 small promo | Bold wordmark + one icon, readable at thumbnail |
| 1400×560 marquee | Wide layout: headline left, visual right |
| 1280×800 slides | Poster / infographic / comparison — not dense UI |

Script adds 10% padding on slides — still ask for margins in the prompt.

### Text in images

- **Short labels only** — "Tailwind v4", "Picker on", "3 steps"
- Avoid paragraphs; models mangle long copy
- Exact text needed? Overlay in Figma after generation

### Iteration

1. Generate **4–6 wild concepts** (unrelated directions)
2. Pick one → delete losers → **lock palette + metaphor**
3. Regenerate weak slides **one at a time** — batch of 5 often has 1–2 misses
4. Tweak **one variable** per retry (headline, layout, or color — not all three)

### Store slide template

```
Promotional Chrome Web Store slide. NOT a literal screenshot.
[Brand]: neon magenta #FF2D8A, cyan #00E5FF, charcoal #0A0A0F, sticker-peel style.
Slide [N] — [one benefit]. [Visual: 2–3 elements max].
Centered composition, wide margins, no edge cropping.
Match attached app icon style.
```
