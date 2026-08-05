---
name: extension-store-assets
description: Generates browser extension brand icons, Chrome Web Store promo tiles, promotional screenshots, brand guides, and listing copy. Uses OpenRouter gpt-image-2 via lib/blog-image-generator. Use when creating extension branding, Chrome Web Store assets, app icon concepts, store descriptions, or /extension-store-assets workflows.
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
3. Run from repo root with env loaded

## Commands

```bash
set -a && source .env && set +a && bun .cursor/skills/extension-store-assets/scripts/generate.ts --config=public/_static/copy-ui-icons/brand.config.json --phase=concepts

set -a && source .env && set +a && bun .cursor/skills/extension-store-assets/scripts/generate.ts --config=public/_static/copy-ui-icons/brand.config.json --phase=brand-guide

set -a && source .env && set +a && bun .cursor/skills/extension-store-assets/scripts/generate.ts --config=public/_static/copy-ui-icons/brand.config.json --phase=store

set -a && source .env && set +a && bun .cursor/skills/extension-store-assets/scripts/generate.ts --config=public/_static/copy-ui-icons/brand.config.json --phase=store --screenshots-only
```

After phase 1, user picks a concept → set `iconFile` in config to that filename → delete other concepts → run phase 2 and 3.

## Store asset rules

See [sizes.md](sizes.md) for exact dimensions.

**Promo tiles** — generate at closest aspect ratio, `fit: cover` to exact size.

**Store screenshots (1280×800)** — promotional benefit slides, NOT fake browser/extension UI mocks. Generate at 16:9, scale with `fit: cover` to exact size (full bleed). Set `paddingPercent: 0` in config (default).

**What makes slides look store-ready** (see `public/_static/copy-ui-icons/store/`):

- Background color/texture fills all four edges — no letterbox margin
- Decorative elements (glows, class pills, footer bars) bleed off canvas edges
- Content uses **multi-column editorial layout** that fills the frame — not a small centered island
- **Concrete UI widgets with sample data** (class names, code snippets, button states) — not abstract icon rows alone
- Contrasting card pairs (before vs after, format A vs format B)
- Bottom footer bar or three-icon feature row anchors the composition

See [prompts.md](prompts.md) for per-slide composition templates.

**Listing copy** — write `store/product-details.md` using [product-details-template.md](product-details-template.md). Short description ≤132 chars.

## Prompt patterns

See [prompts.md](prompts.md).

**Concept icons:** distinct visual worlds — not literal clipboard/marquee dev-tool clichés unless requested. Fun, beautiful, readable at 16px.

**Brand guide:** 16:9 cheat sheet — palette, typography, UI components, icon usage. Use picked icon as `input_reference`.

**Store slides (5 max):** hero value prop → how it works → key benefit → feature depth → format/compare. Concept illustration only.

## Do not

- Edit `lib/blog-image-generator/generate.ts`
- Use blog `_references/` style refs (raw prompts only)
- Generate literal screenshots for Chrome store slides
- Letterbox 1280×800 slides unless `paddingPercent > 0` is explicitly set
- Center small content on a large empty background — use multi-column layouts that fill the frame
- Abstract icon-only slides with no sample data or UI widgets
- Skip visual review before shipping

## Paths

| Item | Path |
|------|------|
| Generator script | `.cursor/skills/extension-store-assets/scripts/generate.ts` |
| Example config | `.cursor/skills/extension-store-assets/brand.config.example.json` |
| Size reference | `.cursor/skills/extension-store-assets/sizes.md` |
| Copy template | `.cursor/skills/extension-store-assets/product-details-template.md` |
| Prompt patterns | `.cursor/skills/extension-store-assets/prompts.md` |
| Peel UI example | `public/_static/copy-ui-icons/brand.config.json` |

## Peel UI reference

Worked example in `public/_static/copy-ui-icons/` — neon magenta + cyan, sticker-peel metaphor. Store slides: `store/screenshot-01-hero` through `screenshot-05-formats`.
