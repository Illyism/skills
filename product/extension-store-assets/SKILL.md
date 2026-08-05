---
name: extension-store-assets
description: Generates browser extension brand icons, Chrome Web Store promo tiles, promotional screenshots, brand guides, and listing copy. Uses OpenRouter gpt-image-2. Use when creating extension branding, Chrome Web Store assets, app icon concepts, store descriptions, or /extension-store-assets workflows.
metadata:
  version: 1.0.0
  author: illyism
  source: https://il.ly/skills/extension-store-assets
disable-model-invocation: true
---

# Extension store assets

Three-phase workflow for extension branding + Chrome Web Store listing. Self-contained script uses OpenRouter `gpt-image-2` directly (no blog-image-generator dependency).

## Phases

| Phase | Goal | Output |
|-------|------|--------|
| **1. Concepts** | Explore 4–6 unrelated brand directions | `concept-*.jpg` (1:1) + `preview.html` |
| **2. Pick + refine** | User picks one; delete losers; optional brand guide | `app-icon.jpg`, `brand-guide.jpg` |
| **3. Store** | Promo tiles, promo slides, listing copy | `store/*` |

Do **not** skip phase 1. Do **not** generate literal UI screenshots for store slides — use **promotional concept slides** that explain benefits.

## Setup

1. Copy [brand.config.example.json](brand.config.example.json) → `{outputDir}/brand.config.json`
2. Fill in product name, brand prompt prefix, colors, concept prompts, store slide prompts
3. Run from repo root with `OPENROUTER_API_KEY` in env

## Commands

```bash
set -a && source .env && set +a

# Phase 1 — concept icons
bun skills/product/extension-store-assets/scripts/generate.ts \
  --config=public/_static/my-extension/brand.config.json --phase=concepts

# Phase 2 — brand guide (after picking iconFile in config)
bun skills/product/extension-store-assets/scripts/generate.ts \
  --config=public/_static/my-extension/brand.config.json --phase=brand-guide

# Phase 3 — promo tiles + store slides + listing copy
bun skills/product/extension-store-assets/scripts/generate.ts \
  --config=public/_static/my-extension/brand.config.json --phase=store

# Regenerate slides or promos only
bun skills/product/extension-store-assets/scripts/generate.ts \
  --config=public/_static/my-extension/brand.config.json --phase=store --screenshots-only
```

After phase 1, user picks a concept → set `iconFile` in config to that filename → delete other concepts → run phase 2 and 3.

When installed via `npx skills add Illyism/skills --skill extension-store-assets`, adjust the script path to your install location (often `.cursor/skills/extension-store-assets/scripts/generate.ts`).

## Store asset rules

See [sizes.md](sizes.md) for exact dimensions.

**Promo tiles** — generate at closest aspect ratio, `fit: cover` to exact size.

**Store screenshots (1280×800)** — promotional benefit slides, NOT fake browser/extension UI mocks. Generate at 16:9, scale with `fit: inside` to ~80% of canvas, center on brand background color (default 10% padding). Prevents edge cropping.

**Listing copy** — write `store/product-details.md` using [product-details-template.md](product-details-template.md). Short description ≤132 chars.

## Prompt patterns

See [prompts.md](prompts.md) for phase templates **and prompt tips** (4-block structure, negatives, iteration).

**Concept icons:** distinct visual worlds — not literal clipboard/marquee dev-tool clichés unless requested. Fun, beautiful, readable at 16px.

**Brand guide:** 16:9 cheat sheet — palette, typography, UI components, icon usage. Use picked icon as `input_reference`.

**Store slides (5 max):** hero value prop → how it works → key benefit → feature depth → format/compare. Concept illustration only.

## Do not

- Edit `lib/blog-image-generator/generate.ts`
- Use blog `_references/` style refs (raw prompts only)
- Generate literal screenshots for Chrome store slides
- Crop with `fit: cover` on 1280×800 slides (use padding)
- Skip visual review before shipping

## Paths

| Item | Path |
|------|------|
| Generator script | `product/extension-store-assets/scripts/generate.ts` |
| Example config | `product/extension-store-assets/brand.config.example.json` |
| Size reference | `product/extension-store-assets/sizes.md` |
| Copy template | `product/extension-store-assets/product-details-template.md` |
| Prompt patterns | `product/extension-store-assets/prompts.md` |
| Peel UI example | `public/_static/copy-ui-icons/brand.config.json` |
| MMP example | `public/_static/mmp-store-assets/brand.config.json` |

## Worked examples

**Peel UI** (`public/_static/copy-ui-icons/`) — dev tool, neon magenta + cyan, sticker-peel metaphor. [Chrome Web Store listing](https://chromewebstore.google.com/) (pending).

**Marriott MMP Rate Compare** (`public/_static/mmp-store-assets/`) — hospitality palette, calendar + rate comparison metaphor. [Live on Chrome Web Store](https://chromewebstore.google.com/detail/marriott-mmp-rate-compare/dcddpmkodggbfokgblhapcacabkghoof).
