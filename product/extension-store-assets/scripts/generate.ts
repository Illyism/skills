/**
 * Extension store asset generator.
 *
 * Usage:
 *   bun skills/product/extension-store-assets/scripts/generate.ts --config=path/to/brand.config.json --phase=concepts
 *   bun ... --phase=brand-guide
 *   bun ... --phase=store [--screenshots-only|--promo-only]
 */
import { Buffer } from 'node:buffer'
import fs from 'node:fs/promises'
import path from 'node:path'

const TIMEOUT_MS = 180_000

type ImageResult = { bytes: Uint8Array; costUsd: number | null; latencyMs: number }

async function openRouterImage(body: Record<string, unknown>): Promise<ImageResult> {
  const apiKey = process.env.OPENROUTER_API_KEY || process.env.OPENROUTER_KEY
  if (!apiKey) throw new Error('OPENROUTER_API_KEY is required')

  const started = Date.now()
  const res = await fetch('https://openrouter.ai/api/v1/images', {
    method: 'POST',
    signal: AbortSignal.timeout(TIMEOUT_MS),
    headers: {
      authorization: `Bearer ${apiKey}`,
      'content-type': 'application/json',
      'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL ?? 'https://genppt.com',
      'X-Title': 'GenPPT',
    },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(`OpenRouter ${res.status}: ${await res.text().catch(() => '')}`)

  const json = (await res.json()) as {
    data?: Array<{ b64_json?: string }>
    usage?: { cost?: number; total_cost?: number }
  }
  const b64 = json.data?.[0]?.b64_json
  if (!b64) throw new Error('OpenRouter response missing image')

  const bytes = new Uint8Array(Buffer.from(b64, 'base64'))
  if (bytes.byteLength < 8_000) throw new Error('Generated image came back empty')

  const u = json.usage
  const costUsd = typeof u?.cost === 'number' ? u.cost : typeof u?.total_cost === 'number' ? u.total_cost : null
  return { bytes, costUsd, latencyMs: Date.now() - started }
}

type BrandConfig = {
  productName: string
  outputDir: string
  iconFile: string
  brand: {
    promptPrefix: string
    paddingColor: [number, number, number]
    paddingPercent: number
  }
  concepts?: Array<{ file: string; prompt: string }>
  brandGuide?: { file: string; prompt: string }
  store?: {
    promo?: Array<{ file: string; w: number; h: number; ratio: string; prompt: string }>
    screenshots?: Array<{ file: string; w: number; h: number; ratio: string; prompt: string }>
  }
}

function parseArgs(argv: string[]) {
  let configPath = ''
  let phase = 'store'
  let screenshotsOnly = false
  let promoOnly = false

  for (const arg of argv) {
    if (arg.startsWith('--config=')) configPath = arg.slice('--config='.length)
    else if (arg.startsWith('--phase=')) phase = arg.slice('--phase='.length)
    else if (arg === '--screenshots-only') screenshotsOnly = true
    else if (arg === '--promo-only') promoOnly = true
  }

  if (!configPath) throw new Error('--config=path/to/brand.config.json is required')
  return { configPath, phase, screenshotsOnly, promoOnly }
}

async function loadConfig(configPath: string): Promise<BrandConfig> {
  const raw = await fs.readFile(configPath, 'utf-8')
  return JSON.parse(raw) as BrandConfig
}

async function refDataUrl(filePath: string): Promise<string> {
  const bytes = await fs.readFile(filePath)
  const lower = filePath.toLowerCase()
  const contentType = lower.endsWith('.png') ? 'image/png' : 'image/jpeg'
  return `data:${contentType};base64,${Buffer.from(bytes).toString('base64')}`
}

async function generateImage(prompt: string, aspectRatio: string, ref?: string) {
  const body: Record<string, unknown> = {
    model: 'openai/gpt-image-2',
    prompt,
    aspect_ratio: aspectRatio,
    quality: 'high',
    n: 1,
    output_format: 'jpeg',
    output_compression: 92,
  }
  if (ref) {
    body.input_references = [{ type: 'image_url', image_url: { url: ref } }]
  }
  return openRouterImage(body)
}

async function saveJpeg(bytes: Uint8Array, outPath: string) {
  await fs.mkdir(path.dirname(outPath), { recursive: true })
  await fs.writeFile(outPath, bytes)
}

async function resizeCover(bytes: Uint8Array, w: number, h: number, outPath: string) {
  const sharp = (await import('sharp')).default
  await sharp(Buffer.from(bytes))
    .resize(w, h, { fit: 'cover', position: 'centre' })
    .jpeg({ quality: 92, mozjpeg: true })
    .toFile(outPath)
}

async function resizeWithPadding(
  bytes: Uint8Array,
  w: number,
  h: number,
  outPath: string,
  paddingColor: [number, number, number],
  paddingPercent: number
) {
  const sharp = (await import('sharp')).default
  const maxW = Math.round(w * (1 - paddingPercent * 2))
  const maxH = Math.round(h * (1 - paddingPercent * 2))
  const resized = await sharp(Buffer.from(bytes)).resize(maxW, maxH, { fit: 'inside' }).toBuffer()
  const meta = await sharp(resized).metadata()
  const actualW = meta.width ?? maxW
  const actualH = meta.height ?? maxH
  const left = Math.round((w - actualW) / 2)
  const top = Math.round((h - actualH) / 2)

  await sharp({
    create: {
      width: w,
      height: h,
      channels: 3,
      background: { r: paddingColor[0], g: paddingColor[1], b: paddingColor[2] },
    },
  })
    .composite([{ input: resized, left, top }])
    .jpeg({ quality: 92, mozjpeg: true })
    .toFile(outPath)
}

async function runConcepts(config: BrandConfig, outDir: string) {
  if (!config.concepts?.length) throw new Error('No concepts defined in config')
  for (const c of config.concepts) {
    process.stdout.write(`Concept ${c.file}…\n`)
    const result = await generateImage(c.prompt, '1:1')
    await saveJpeg(result.bytes, path.join(outDir, c.file))
    const cost = result.costUsd == null ? 'N/A' : `$${result.costUsd.toFixed(4)}`
    process.stdout.write(`✅ ${c.file} — ${result.latencyMs}ms ${cost}\n`)
  }
}

async function runBrandGuide(config: BrandConfig, outDir: string, iconPath: string) {
  if (!config.brandGuide) throw new Error('No brandGuide defined in config')
  const ref = await refDataUrl(iconPath)
  process.stdout.write(`Brand guide ${config.brandGuide.file}…\n`)
  const result = await generateImage(`${config.brand.promptPrefix} ${config.brandGuide.prompt}`, '16:9', ref)
  await saveJpeg(result.bytes, path.join(outDir, config.brandGuide.file))
  process.stdout.write(`✅ ${config.brandGuide.file}\n`)
}

async function runStore(
  config: BrandConfig,
  storeDir: string,
  iconPath: string,
  opts: { screenshotsOnly: boolean; promoOnly: boolean }
) {
  const ref = await refDataUrl(iconPath)
  const { paddingColor, paddingPercent, promptPrefix } = config.brand

  if (!opts.screenshotsOnly && config.store?.promo) {
    for (const p of config.store.promo) {
      process.stdout.write(`Promo ${p.file} (${p.w}×${p.h})…\n`)
      const result = await generateImage(`${promptPrefix} ${p.prompt}`, p.ratio, ref)
      await resizeCover(result.bytes, p.w, p.h, path.join(storeDir, p.file))
      process.stdout.write(`✅ ${p.file}\n`)
    }
  }

  if (!opts.promoOnly && config.store?.screenshots) {
    for (const s of config.store.screenshots) {
      process.stdout.write(`Slide ${s.file} (${s.w}×${s.h}, padded)…\n`)
      const result = await generateImage(`${promptPrefix} ${s.prompt}`, s.ratio, ref)
      await resizeWithPadding(result.bytes, s.w, s.h, path.join(storeDir, s.file), paddingColor, paddingPercent)
      process.stdout.write(`✅ ${s.file}\n`)
    }
  }
}

async function main() {
  const { configPath, phase, screenshotsOnly, promoOnly } = parseArgs(process.argv.slice(2))
  const config = await loadConfig(path.resolve(configPath))
  const outDir = path.resolve(config.outputDir)
  const iconPath = path.join(outDir, config.iconFile)
  const storeDir = path.join(outDir, 'store')

  await fs.mkdir(outDir, { recursive: true })

  if (phase === 'concepts') {
    await runConcepts(config, outDir)
  } else if (phase === 'brand-guide') {
    await runBrandGuide(config, outDir, iconPath)
  } else if (phase === 'store') {
    await runStore(config, storeDir, iconPath, { screenshotsOnly, promoOnly })
  } else if (phase === 'all') {
    if (config.concepts?.length) await runConcepts(config, outDir)
    if (config.brandGuide) await runBrandGuide(config, outDir, iconPath)
    await runStore(config, storeDir, iconPath, { screenshotsOnly: false, promoOnly: false })
  } else {
    throw new Error(`Unknown phase: ${phase}. Use concepts | brand-guide | store | all`)
  }

  process.stdout.write('ALL DONE\n')
}

main().catch(err => {
  process.stderr.write(`❌ ${err instanceof Error ? err.message : String(err)}\n`)
  process.exit(1)
})
