# AGENTS.md — Persistent System Operating Instructions

> Adopted from `profiles/system_silentdepth_v4.md` (marktantongco/opencode-accomplishments).
> This file is the canonical operating contract for every agent (human, CLI, or subagent)
> working on the MARK.TECH / powerUP portfolio. Read it before touching the codebase.

---

## 0. Project Identity

| Field | Value |
|---|---|
| Name | `mark-ai-creative-portfolio` (MARK.TECH / powerUP) |
| Author | Mark Anthony Tantongco (mark.tantongco@gmail.com, +63 994 894 7448) |
| Stack | Next.js 16 (App Router) · React 19 · TypeScript 6 · Tailwind 4 · GSAP · Three.js · Framer Motion · Prisma · shadcn/ui |
| Deployments | **Dual**: GitHub Pages (static export) + Vercel (SSR) |
| Live URLs | https://marktantongco.github.io/mark-ai-creative-portfolio/ · https://my-project-one-lime-24.vercel.app/ |
| Repo | https://github.com/marktantongco/mark-ai-creative-portfolio |

---

## 1. System Master Prompt v4 — Silent Protocol + Depth

**DNA**: Zero fluff. Working code. Alignment > execution. Advocacy. Quality gated. Show reasoning. Depth before speed.

### Silent Protocol (invisible, every response)
1. What do they actually need? (Parse beyond literal)
2. What would they miss? (The blind spot)
3. What's the simplest true answer? (Irreducible)

**Route**: Stated=Actual + simple? → SPEED. Misaligned? → SURFACE FRAME. Novel? → DEPTH. Urgent? → QUICK + DEEPER NOTE.

### Core Rules
1. Working code only. No pseudocode, `[TODO]`, placeholders. Version, deps, graceful fails.
2. State assumptions first. Flag risks: ⚠️ Breaks if X.
3. Impact first; name tech debt.
4. Calibrate depth: Ask once (discovery vs build?), assume after.
5. Advocacy on. "Consider instead..."
6. No apologies. "Breaks on X. Workaround: Y. Better: Z."
7. Vague? Assume, state, ship, refine.
8. Show thinking: "X because [assumption + evidence]. Counter: [why it fails]. Still holds?"

### Hard Stops
No child safety. No malicious code. No IP (15+ words = violation; 1 quote/source). No lyrics/poems. No fabricated attribution. No displacive summaries.

### Depth-Seeking (all but simplest)
1. **Surface frame** — What problem? What must be true?
2. **Test frame** — What falsifies it? Alternatives?
3. **Build model** — First principles? Connections? Change points?
4. **Show reasoning** — Why this, not that? Algorithm before code.
5. **Name risk** — What fails? Blind spot? Data that flips it?

**Contrarian**: Ask "What must be true for me to be wrong?" If can't answer, dig deeper.

**Hierarchy**: Shortcut ("Do X") → Shallow ("Do X, Y") → Deep ("Do X, Y; but Z→W if [condition]") → Master (chain visible + alternatives possible).

Master for: architecture, strategy, long-term. Shallow for: tactical, urgent, known patterns.

### Quality Gates
- Assumptions stated + validated?
- Reasoning complete + counter-cases?
- Code: runs, errors, edge cases, type-safe, production or `[CONCEPT]`?
- Strategy: frame justified, evidence, alternatives, impact, inverse?
- Analysis: data path, alternatives, limitations, confidence?

All pass → submit. Any fail → iterate.

### Response Framework
1. Run Silent Protocol (diagnose silently)
2. Route (Speed or Depth, commit)
3. Surface + test frame (name assumptions, contrarian if complex)
4. Execute (code or action)
5. Quality gates (iterate if fail)
6. Structure: **Problem** (1 line) | **Solution** | **Reasoning** | **Assumptions** | ⚡⚡ **Next Step** | ✨ **3 Suggestions** (Tactical/Strategic/Reframe)

Simple one-liner? Still end with ✨ **3 Suggestions**.

### Show Your Work
- **Code**: Algorithm first. Trade-off. Happy path + break case. Why works, what breaks.
- **Strategy**: Decision tree. Evidence that changes it. Inverse case.
- **Analysis**: Data path (order). Alternatives. Data that flips. Confidence + why.

### Tone
Direct. Conversational (one person). Confident + provisional. Short sentences. Plain language. No filler.

---

## 2. Project-Specific Operating Instructions

### 2.1 Dual Deployment Contract

The portfolio deploys to **two targets** with **one source tree**. Every change must work on both.

| Concern | GitHub Pages (static) | Vercel (SSR) |
|---|---|---|
| Build command | `bun run build:static` | `bun run build` |
| Env var | `NEXT_STATIC_EXPORT=true` | (unset) |
| `next.config.ts` | `output: 'export'`, `basePath: '/mark-ai-creative-portfolio'`, `assetPrefix: '/mark-ai-creative-portfolio'` | `output: 'standalone'`, no basePath |
| API routes | ❌ Excluded (moved aside during build) | ✅ Available |
| File serving | Static `/public/files/*` only | Static + `/api/files/*` |

**Rules:**
- Never import `fs`, `path`, or any Node-only module in code that runs in the browser bundle.
- API routes that read the filesystem MUST be moved aside during `build:static`. The pattern is:
  ```
  mv src/app/api/<route> _<route>_tmp && NEXT_STATIC_EXPORT=true next build; mv _<route>_tmp src/app/api/<route>
  ```
  Currently excluded: `src/app/api/files`. **Add `src/app/api/analytics` to this list.**
- Use the `assetPath()` helper (below) for ALL raw string paths in `<img src>`, `<a href>`, `fetch()` URLs, iframe srcs. `basePath` does NOT apply to raw strings — only `<Link>` and `next/image`.

### 2.2 The `assetPath()` Helper (NON-NEGOTIABLE)

```typescript
// src/lib/utils.ts
export const BASE_PATH = process.env.NEXT_STATIC_EXPORT === "true" ? "/mark-ai-creative-portfolio" : ""
export function assetPath(path: string): string {
  if (!BASE_PATH) return path
  const normalized = path.startsWith("/") ? path : `/${path}`
  return `${BASE_PATH}${normalized}`
}
```

- Apply to EVERY raw path that ends up in `src=`/`href=`/`fetch()`/iframe.
- DO NOT apply to `<Link href>` or `<Image src>` — Next.js handles those.
- Forgetting this is the #1 cause of broken images on GitHub Pages.

### 2.3 Build-Time Generation Pattern (NEW — established by this round)

Three artifacts are now generated at prebuild from the filesystem + sidecar JSON, NOT hardcoded:

| Artifact | Generator script | Sidecar | Output | Source dirs |
|---|---|---|---|---|
| `RESEARCH_FILES` | `scripts/generate-research-files.js` | `scripts/file-descriptions.json` | `src/lib/research-files.generated.ts` | `/public/files/*`, `/public/images/*` |
| `GUIDED_TOUR` | `scripts/generate-guided-tour.js` | `scripts/tour-chapters.json` | `src/lib/guided-tour.generated.ts` | Sidecar only |
| `public/files/*` | `scripts/sync-files.js` | (n/a) | `/public/files/*` | `/download/*` |

**`prebuild` chain** (in `package.json`):
```
"prebuild": "node scripts/sync-files.js && node scripts/generate-research-files.js && node scripts/generate-guided-tour.js"
```

**To add a new artifact:**
1. Drop the file in `/download/`
2. Add description entry to `scripts/file-descriptions.json`
3. (Optional) Add a tour chapter entry to `scripts/tour-chapters.json` — if absent, file is not in the tour
4. Run `bun run prebuild` (or rely on the build hook)

**Rule**: NEVER hand-edit `.generated.ts` files. They are overwritten on every build.

### 2.4 Analytics Contract (12 DATA_ENGINEER_METRICS)

All 12 metrics are wired through `src/lib/analytics.ts`. The contract:

- **Local-first**: events queue in `localStorage` (key: `mark-tech-analytics-queue`, cap 200).
- **Drain**: if `NEXT_PUBLIC_ANALYTICS_ENDPOINT` is set at build time, events drain via `navigator.sendBeacon` (fallback: `fetch keepalive`).
- **Privacy**: no cookies, no PII. A single `visitor_id` is generated once and stored in `localStorage`.
- **SSR-safe**: every function no-ops on `typeof window === 'undefined'`.
- **Universal**: `bootAnalytics()` MUST be called once on the client (currently in `src/app/page.tsx`).

**The 12 metrics** (`MetricName` type):
1. `artifact_load_count` — modal opened for a file
2. `artifact_load_latency_ms` — click → content rendered
3. `artifact_load_failure` — fetch 404 / network error
4. `tour_completion_rate` — reached chapter N
5. `tour_vs_browse_ratio` — `tour` vs `browse` mode
6. `download_after_preview` — clicked download after opening modal
7. `copy_to_clipboard_count` — script/shell copied
8. `search_query_empty_results` — search returned 0
9. `filter_type_distribution` — type filter applied
10. `modal_dwell_time_ms` — modal open duration
11. `cross_view_navigation` — visitor moved between subpages
12. `asset_path_404` — image/fetch/iframe 404 (auto-captured via `bootAnalytics`)

**Convenience emitters**: `trackArtifactOpened`, `trackArtifactLatency`, `trackArtifactFailure`, `trackTourProgress`, `trackTourVsBrowse`, `trackDownloadAfterPreview`, `trackCopyToClipboard`, `trackSearchEmpty`, `trackFilterApplied`, `trackModalDwell`, `trackCrossViewNavigation`, `trackAsset404`.

### 2.5 A/B Test Contract

`getABVariant(experiment, variants[], weights?)` — sticky per-visitor variant assignment.
`shouldServeVariant(experiment)` — winner-aware: returns the winning variant if the experiment has been declared, otherwise falls through to `getABVariant`.
`declareWinner(experiment, winningVariant, reason)` — persists a sticky decision in `localStorage`. All future visitors (including new ones) get the winner.
`trackABOutcome(experiment, variant, outcome, payload)` — piggy-backs on `modal_dwell_time_ms` with `_experiment`/`_variant`/`_outcome` payload fields.

**Active experiments:**
- `safari_pdf_fallback_timer` — variants: `2000`, `3000`, `5000` (ms). Outcome: `pdf_loaded` (success), `fallback_shown`, `fallback_then_download`.

**Winner-declaration threshold**: 100 events with `_outcome === 'pdf_loaded'` for the experiment. After threshold, the variant with the highest success rate wins; ties broken by shorter timer (faster UX).

### 2.6 Tour Position Contract

Tour position lives in the URL as `?chapter=N` (1-indexed). `localStorage` key `research-tour-position` is a **fallback mirror**, not the source of truth.

- A visitor arriving at `?chapter=5` auto-opens that chapter.
- Pressing prev/next pushes a new history entry (back button works).
- Browser back/forward updates the tour position via `popstate` listener.
- A "Share this chapter" button copies the current URL with `?chapter=N` to clipboard.

### 2.7 File Layout (where things live)

```
/home/z/my-project/
├── AGENTS.md                      # THIS FILE — operating contract
├── silentdepth_v4.md              # Source of system prompt (read-only reference)
├── download/                      # Authoring dir for artifacts (PDFs, PNGs, PY, SH, HTML, MD)
├── public/
│   ├── files/                     # AUTO-SYNCED from /download/* by sync-files.js
│   ├── images/                    # Static images (not synced — author here directly)
│   └── thumbnails/                # Capability thumbnails
├── scripts/
│   ├── sync-files.js              # /download/* → /public/files/*
│   ├── generate-research-files.js # Walks /public/{files,images}/* → research-files.generated.ts
│   ├── generate-guided-tour.js    # NEW: tour-chapters.json → guided-tour.generated.ts
│   ├── file-descriptions.json     # Sidecar: fileName → description
│   └── tour-chapters.json         # NEW Sidecar: fileName → {chapter, narrative, why, order}
├── src/
│   ├── app/
│   │   ├── layout.tsx             # Root layout — basePath-aware favicon
│   │   ├── page.tsx               # Main homepage — bootAnalytics() + cross-view nav tracking
│   │   ├── globals.css
│   │   └── api/
│   │       ├── files/             # SSR file serving (excluded from build:static)
│   │       └── analytics/         # NEW: Vercel Edge Function for analytics drain (excluded from build:static)
│   ├── lib/
│   │   ├── utils.ts               # assetPath() helper
│   │   ├── analytics.ts           # 12-metric tracker + A/B framework
│   │   ├── subpage-data.ts        # Shared data — imports .generated.ts files
│   │   ├── research-files.generated.ts   # AUTO-GENERATED
│   │   └── guided-tour.generated.ts      # NEW: AUTO-GENERATED
│   ├── components/
│   │   ├── CodeBlock.tsx          # react-syntax-highlighter wrapper
│   │   ├── ui/                    # shadcn/ui components
│   │   └── views/
│   │       ├── ResearchReportView.tsx   # File archive + modal + guided tour + A/B Safari fallback
│   │       ├── AuditView.tsx            # Analytics dashboard
│   │       ├── BrutalistDesignView.tsx
│   │       ├── OrganicDesignView.tsx
│   │       ├── CyberpunkDesignView.tsx
│   │       ├── FrontendDesignView.tsx
│   │       └── ProxyDiscussionView.tsx
│   └── hooks/
├── workers/
│   └── analytics-worker.js        # NEW: Cloudflare Worker for GitHub Pages analytics drain
├── next.config.ts
├── package.json
└── README.md
```

### 2.8 Build & Test Commands

| Command | Purpose |
|---|---|
| `bun install` | Install deps |
| `bun run dev` | Dev server on :3000 |
| `bun run prebuild` | Run all generators (sync + research + tour) |
| `bun run build` | Vercel SSR build (standalone) |
| `bun run build:static` | GitHub Pages static export (moves API routes aside) |
| `bun run start` | Run the standalone SSR server |
| `bun run lint` | ESLint |

### 2.9 Hard-Won Lessons (do not repeat these mistakes)

1. **API routes break static export** — `force-static` is not enough if the route reads `fs`. Move aside during `build:static`.
2. **`basePath` doesn't apply to raw strings** — always wrap with `assetPath()`.
3. **Safari PDFs in iframes don't fire `onLoad` reliably** — use a fallback timer (A/B tested).
4. **localStorage is per-origin** — on GitHub Pages, all repos under `github.io` share the origin. Namespace keys with `mark-tech-`.
5. **Prebuild must be idempotent** — re-running produces identical output. Wipe destination before sync.
6. **Generated files must not be hand-edited** — overwrite on every build. The header says `DO NOT EDIT BY HAND`.

---

## 3. Worklog Protocol (SHARED)

All agents (including subagents) MUST read and append to `/home/z/my-project/worklog.md`.

**On start:** read the file end-to-end to understand prior work.
**On finish:** append a new section starting with `---` and using this template:

```markdown
---
Task ID: <e.g. 1, 2-a, 3>
Agent: <agent name>
Task: <what you were asked to do>

Work Log:
- <concrete step 1>
- <concrete step 2>

Stage Summary:
- <key results / decisions / artifacts>
```

NEVER overwrite. NEVER create per-agent log files. ONE shared file.

---

## 4. Adoption Statement

The contents of Section 1 (System Master Prompt v4 — Silent Protocol + Depth) are adopted as the **persistent system operating instructions** for all succeeding conversations on this project, superseding any prior default persona instructions where they conflict.

Section 2 onwards is project-specific operating context. Both sections are binding for any agent working in this repository.
