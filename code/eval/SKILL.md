---
name: eval
description: Build, run, or update minimal evaluation benchmarks for AI prompts, LLM calls, multi-model comparisons, and core functions. Use when creating new eval scripts, comparing models side-by-side, filtering specific candidate models, running benchmarks, or inspecting eval.md output artifacts.
metadata:
  version: 1.0.0
  author: illyism
  source: https://il.ly/skills/eval
---

# Eval System

A clean, minimal benchmark system that runs production code against test cases and writes results to a co-located markdown artifact (`eval.md`). The `eval.md` is a **judgment surface**: it exists so a strong external model or a human can read the real outputs and judge quality, not so the eval can auto-declare a winner.

---

## Core Principles & Rules

### 1. Import Production Logic Directly
- **ALWAYS** import and invoke the actual production function, prompt constants, and schemas from the feature file.
- **NEVER** duplicate prompts, system messages, or JSON schemas inside `eval.ts`.
- *Why:* Re-implementing prompts in the eval causes prompt drift. When production changes, a duplicated eval becomes a false benchmark testing obsolete behavior.

### 2. Benchmark Real Runs — Never Estimate
- **ALWAYS** execute every candidate model to capture ground-truth latency, tokens, and cost.
- **NEVER** estimate or hallucinate latency, token counts, or pricing in a report without running the models.
- *Why:* Models cannot predict real streaming latency, throughput, or cost. Only direct execution records the truth.

### 3. "Passed" (✅) Means Schema Valid — NOT High Quality
- **ALWAYS** treat the status column as execution correctness (did the call succeed and conform to the Zod schema?).
- **NEVER** assume a "Passed" status implies the output is accurate, relevant, or good.
- *Why:* A model can return 100% valid JSON conforming to a schema while outputting completely wrong or noisy content.

### 4. Never Self-Score Quality — Surface Raw Outputs for Independent Judgment
- **NEVER** put the generating model's own relevance/quality/confidence score — or a count derived from it (e.g. "candidates scored 80+") — in the summary as if it were a quality metric.
- **ALWAYS** render each model's full raw output verbatim so quality can be judged from the output itself, not from the model's self-assessment.
- *Why:* A model scoring its own output rewards quantity and confidence, not correctness. A model that emits 7 loosely-relevant items looks like it "beats" one that emits 4 precise ones, when the opposite is true. Self-scores are biased and not comparable across models. Real quality only emerges when a strong external judge (or human) reads the actual outputs side-by-side.

### 5. Summary Table = Objective Machine Metrics Only
- **ALWAYS** limit the summary table to metrics the machine measures directly: latency, input/output tokens, cost, and pass/fail (schema/execution status).
- **ALWAYS** caption any raw output count (e.g. "Items") as a count, never as "Relevant", "Quality", or "Score".
- *Why:* Objective metrics are trustworthy and comparable; quality labels sneak the model's biased self-judgment back into the leaderboard.

### 6. Control Output Constraints for Fair Comparison
- **ALWAYS** enforce identical output constraints (e.g. `top_k`, length limits, schema bounds) across candidate models when benchmarking.
- *Why:* Unconstrained models that generate 1,500 tokens of verbose fluff will appear unfairly slow and expensive compared to concise models emitting 100 tokens, distorting latency and cost comparisons.

### 7. Track Real Billed Costs (Including Reasoning Tokens)
- **ALWAYS** calculate cost using total billed tokens from API response metadata, including hidden reasoning/thinking completion tokens.
- *Why:* Modern reasoning models (e.g., Gemini Flash thinking or OpenAI o-series) consume reasoning tokens that don't show up in visible text length but directly impact API billing.

### 8. Support Model Selection & Filtering
- **ALWAYS** support running the production model only by default, all candidates via `--matrix`, or a subset via `--models=a,b`.
- *Why:* Running the full suite on every iteration wastes time and API credits when a developer only needs 2–3 target models.

### 9. Output to Co-located Markdown (`eval.md`)
- **ALWAYS** compile output into a string buffer and write to `path.join(__dirname, 'eval.md')`.
- **NEVER** output results exclusively to stdout or an external database.
- *Why:* Co-located `eval.md` files diff cleanly in git, render in the editor, and persist benchmark history with zero infrastructure.

### 10. Direct Terminal Progress
- **ALWAYS** log progress lines during the run, prefix success with `✅` and failure with `❌`, and log the final `eval.md` path.
- *Why:* CLI feedback tells the developer whether the run worked without tailing files mid-execution.

---

## Decision Flowchart: Eval Workflow

```
Are you creating or running an evaluation?
├── Running an existing eval?
│   ├── Production model only: `bun path/to/eval.ts`
│   ├── All candidates:        `bun path/to/eval.ts --matrix`
│   └── Specific models only:  `bun path/to/eval.ts --models=model-a,model-b`
└── Creating a new eval?
    ├── Does an eval file exist in the target module folder?
    │   ├── Yes → Edit `TEST_CASES` / `CANDIDATE_MODELS` in existing `eval.ts`
    │   └── No  → Identify evaluation target type:
    │       ├── AI / LLM feature (single or multi-model) → Pattern A
    │       ├── Automated quality scoring needed         → Pattern B (independent judge)
    │       └── Sync / async utility function            → Pattern C
```

**One file per feature.** Keep a single `eval.ts` that runs the production model by default and expands to a matrix via flags — do not split into `eval.ts` + `eval.matrix.ts`. One script and one `eval.md` keeps test cases in a single source of truth and stops agents guessing which file to run.

---

## Implementation Patterns

### Pattern A: AI Feature Evaluation (`eval.ts`)

Default runs the production model; `--matrix` runs all candidates; `--models=` runs a subset. The summary table stays objective; raw outputs carry the quality signal.

```typescript
import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'
import { calculateModelCost } from '../client'
import { FEATURE_MODEL, runProductionFeature } from './generate-feature'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const TEST_CASES = [
  { name: 'TestCase1', input: { /* production function params */ } },
]

// Production default first, then comparison candidates
const CANDIDATE_MODELS = [
  FEATURE_MODEL,
  'google/gemini-3.6-flash',
  'openai/gpt-5.6-luna',
]

// Flags: --matrix (all candidates) | --models=a,b (subset) | none (production only)
const isMatrix = process.argv.includes('--matrix')
const requested = process.argv.find(a => a.startsWith('--models='))
  ?.split('=')[1]?.split(',').map(m => m.trim().toLowerCase())

const TEST_MODELS = requested
  ? CANDIDATE_MODELS.filter(m => requested.some(r => m.toLowerCase().includes(r)))
  : isMatrix
    ? CANDIDATE_MODELS
    : [FEATURE_MODEL]

interface ResultRow {
  model: string
  caseName: string
  timeMs: number
  cost: number
  inputTokens?: number
  outputTokens?: number
  itemCount?: number
  error?: string
  output?: string
}

async function runEval() {
  console.log(`Running evaluation across ${TEST_MODELS.length} model(s)...\n`)
  const results: ResultRow[] = []

  for (const model of TEST_MODELS) {
    for (const testCase of TEST_CASES) {
      const start = Date.now()
      try {
        const result = await runProductionFeature(testCase.input, { model })
        const timeMs = Date.now() - start
        results.push({
          model,
          caseName: testCase.name,
          timeMs,
          cost: calculateModelCost(model, result.usage),
          inputTokens: result.usage?.inputTokens,
          outputTokens: result.usage?.outputTokens,
          itemCount: Array.isArray(result.data) ? result.data.length : undefined,
          output: JSON.stringify(result.data, null, 2),
        })
        console.log(`✅ ${model} — ${testCase.name} (${timeMs}ms)`)
      } catch (err) {
        results.push({
          model,
          caseName: testCase.name,
          timeMs: Date.now() - start,
          cost: 0,
          error: err instanceof Error ? err.message : String(err),
        })
        console.log(`❌ ${model} — ${testCase.name}: ${err}`)
      }
    }
  }

  const md: string[] = []
  md.push('# Multi-Model Comparison Evaluation\n')

  // Summary: objective machine metrics ONLY. "Items" is a raw count, not a quality score.
  md.push('## Summary (objective metrics — judge quality from the raw outputs below)\n')
  md.push('| Model | Test Case | Latency (ms) | Tokens (In/Out) | Cost ($) | Items | Status |')
  md.push('| :--- | :--- | ---: | ---: | ---: | ---: | :--- |')
  results.forEach(r => {
    const tokens = r.inputTokens !== undefined ? `${r.inputTokens} / ${r.outputTokens}` : 'N/A'
    const items = r.itemCount !== undefined ? String(r.itemCount) : '—'
    md.push(`| \`${r.model}\` | ${r.caseName} | ${r.timeMs} | ${tokens} | $${r.cost.toFixed(5)} | ${items} | ${r.error ? '❌' : '✅'} |`)
  })

  // Raw outputs grouped by test case so models sit side-by-side for independent judgment.
  md.push('\n## Raw Outputs\n')
  for (const testCase of TEST_CASES) {
    md.push(`## ${testCase.name}\n`)
    results.filter(r => r.caseName === testCase.name).forEach(r => {
      md.push(`### \`${r.model}\` — ${r.timeMs}ms, $${r.cost.toFixed(5)}`)
      md.push(r.error ? `\n**Error**: ${r.error}\n` : '\n```json\n' + r.output + '\n```\n')
    })
    md.push('---\n')
  }

  const outputPath = path.join(__dirname, 'eval.md')
  await fs.writeFile(outputPath, md.join('\n'), 'utf-8')
  console.log(`\n✅ Results written to ${outputPath}`)
}

runEval().catch(console.error)
```

### Pattern B: Independent Judge (optional, for automated quality scoring)

Only when you need a repeatable quality number. Run a SEPARATE strong judge model that reads all candidate outputs against a rubric. The judge must never be the model that generated the output.

```typescript
import { generateObject } from 'ai'
import { z } from 'zod'
import { getModel } from '../client'

const JUDGE_MODEL = 'openai/gpt-5.6-sol' // strong model, distinct from candidates

// `outputs` = the raw candidate outputs collected in Pattern A
async function judge(testCasePrompt: string, outputs: { model: string; output: string }[]) {
  const { object } = await generateObject({
    model: getModel(JUDGE_MODEL),
    schema: z.object({
      rankings: z.array(z.object({
        model: z.string(),
        score: z.number().min(0).max(10),
        precision: z.string(),  // are the items directly relevant, not just plausible?
        rationale: z.string(),
      })),
    }),
    // Include the rubric: reward precision, directness, ranking quality; penalize
    // broad/redundant/wrong items. Do NOT reward emitting more candidates.
    prompt: `Task prompt:\n${testCasePrompt}\n\nCandidate outputs:\n${JSON.stringify(outputs, null, 2)}`,
  })
  return object.rankings
}
```

### Pattern C: Pure Function / Utility Evaluation (`eval.ts`)

For algorithms, parsers, formatters, throughput, or accuracy assertions.

```typescript
import fs from 'fs'
import path from 'path'
import { productionUtility } from './index'

const TEST_INPUT = 'example-input'
const ITERATIONS = 100_000

function runEval() {
  console.log('Running utility evaluation...\n')
  let md = `# Utility Evaluation\n\n`

  const actual = productionUtility(TEST_INPUT)
  const expected = 'expected-output'
  if (actual !== expected) {
    console.error(`❌ Assertion failed: expected '${expected}', got '${actual}'`)
    process.exit(1)
  }
  console.log('✅ Correctness assertions passed')

  const start = performance.now()
  for (let i = 0; i < ITERATIONS; i++) productionUtility(TEST_INPUT)
  const totalMs = performance.now() - start
  const perCallMs = totalMs / ITERATIONS

  md += `Total time: ${totalMs.toFixed(2)}ms\n`
  md += `Time per call: ${perCallMs.toFixed(6)}ms\n`
  md += `Calls per second: ${(1000 / perCallMs).toFixed(0)}\n`
  md += `Sample Output: '${actual}'\n`

  const outputPath = path.join(__dirname, 'eval.md')
  fs.writeFileSync(outputPath, md, 'utf-8')
  console.log(`\n✅ Results written to ${outputPath}`)
}

runEval()
```

---

## Execution Checklist

1. Production model only: `bun <path-to-module>/eval.ts`.
2. Full matrix: `bun <path-to-module>/eval.ts --matrix`.
3. Specific candidates: `bun <path-to-module>/eval.ts --models=gemini-3.6-flash,gpt-5.6-luna`.
4. Read the **raw outputs** in `eval.md` (or run Pattern B's judge) to assess quality — never rank models by their own self-reported scores.
5. Inspect `git diff <path-to-module>/eval.md` to review latency, cost, and output changes before committing.
