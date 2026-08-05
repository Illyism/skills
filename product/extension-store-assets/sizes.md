# Chrome Web Store asset sizes

## Promo images

| Asset | Size | Generate ratio | Resize |
|-------|------|----------------|--------|
| Small promo tile | **440×280** | 3:2 | cover → exact |
| Marquee promo tile | **1400×560** | 21:9 | cover → exact |

## Screenshots (at least 1, up to 5)

| Asset | Size | Generate ratio | Resize |
|-------|------|----------------|--------|
| Screenshot | **1280×800** or 640×400 | 16:9 | cover → exact (full bleed) |
| Screenshot (alt) | 640×400 | 16:9 | cover → exact (full bleed) |

**Composition:** background fills all edges; content uses multi-column layout with concrete UI widgets and sample data. See [prompts.md](prompts.md) per-slide templates. Quality reference: `public/mmp-store-assets/store/screenshot-03`–`05`.

640×400 = half of 1280×800. Batch-resize with sharp if needed.

## App icon (manifest)

| Size | Notes |
|------|-------|
| 128×128 | Chrome extension icon source |
| 48, 32, 16 | Export from 128 source |

Concept generation produces 1:1 JPG (~512px). Resize for manifest.

## Format

- JPEG or 24-bit PNG (no alpha) for store uploads
- Script outputs JPEG at quality 92
