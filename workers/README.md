# Cloudflare Analytics Worker

Drains the portfolio's local analytics buffer to persistent KV storage when
deployed on GitHub Pages (where no SSR API routes exist).

## Why this exists

GitHub Pages serves only static files — no `/api/*` routes. The portfolio's
analytics buffer (in `localStorage`) needs somewhere to drain. On Vercel we
use `/api/analytics`. On GitHub Pages we point `NEXT_PUBLIC_ANALYTICS_ENDPOINT`
at this Worker instead.

| Endpoint | Where it lives | When it's the drain target |
|---|---|---|
| `POST /api/analytics` | Next.js route (Vercel SSR) | Vercel deployment |
| `POST /` (Worker) | Cloudflare Worker | GitHub Pages deployment |

## Files

| File | Purpose |
|---|---|
| `analytics-worker.js` | Worker source — POST drains events, GET reads aggregate |
| `wrangler.toml` | Cloudflare config (name, KV binding, observability) |
| `deploy.sh` | One-shot deploy script (login → KV create → deploy → print URL) |

## Deploy SOP (one-time, ~5 minutes)

> ⚠️ **Prerequisite**: a Cloudflare account (free tier is sufficient —
> Workers free tier includes 100k requests/day, KV free tier includes
> 100k reads/day + 1k writes/day; a personal portfolio uses <1% of this).

### 1. Install wrangler

```bash
npm install -g wrangler
# or: brew install cloudflare-wrangler
```

### 2. Authenticate

```bash
wrangler login
```

A browser window opens for OAuth. Approve → wrangler stores a token.

### 3. Deploy

From the repo root:

```bash
bun run worker:deploy
# equivalent to: cd workers && bash deploy.sh
```

The script:
1. Verifies wrangler is installed + logged in
2. Creates the `ANALYTICS_KV` namespace (or reuses it if it already exists)
3. Substitutes `${ANALYTICS_KV_ID}` in `wrangler.toml`
4. Runs `wrangler deploy`
5. Prints the Worker URL — e.g. `https://mark-tech-analytics.<your-sub>.workers.dev`

### 4. Wire the URL into GitHub Actions

In your GitHub repo:

1. **Settings → Secrets and variables → Actions → New repository secret**
2. Name: `NEXT_PUBLIC_ANALYTICS_ENDPOINT`
3. Value: `<the Worker URL printed in step 3>`
4. Add a second secret:
   - Name: `ANYTICS_KV_ID` (not yet used by CI, but useful for re-deploys)
   - Value: `<the KV namespace id printed in step 3>`

The `.github/workflows/deploy.yml` workflow already reads
`NEXT_PUBLIC_ANALYTICS_ENDPOINT` from secrets and passes it to `bun run build:static`
as an env var — so the next push to `main` will bake the Worker URL into the
static bundle, and the local buffer will drain to the Worker.

### 5. Verify

After the next GitHub Pages deploy completes:

1. Visit `https://marktantongco.github.io/mark-ai-creative-portfolio/`
2. Open browser DevTools → Network → filter `mark-tech-analytics`
3. Open any artifact (PDF, image, code file) — you should see a POST to the
   Worker URL with payload `{ events: [...] }` and a `200 OK` response
4. Visit the Worker URL directly in a new tab — you should see JSON with
   `total` events, `byMetric` counts, and `byExperiment` buckets

## Worker API

### `POST /`

Body: `{ events: AnalyticsEvent[] }`
Effect: appends events to the KV key `analytics-events` (capped at 10k, FIFO eviction).
Response: `{ ok: true, count: N, total: M }`

### `GET /`

Returns: `{ total, byMetric, byExperiment, lastEvent, source: 'cloudflare-workers-kv' }`

Where:
- `byMetric`: `Record<MetricName, number>` — event counts per metric
- `byExperiment`: `Record<"experiment|variant|outcome", number>` — A/B outcome counts

### `OPTIONS /`

CORS preflight — returns `204 No Content` with `Access-Control-Allow-*` headers.

## Failure modes

| Failure | Detection | Recovery |
|---|---|---|
| KV namespace doesn't exist | `wrangler deploy` fails with `ANALYTICS_KV not bound` | Re-run `bun run worker:deploy` — script auto-creates it |
| Worker URL not yet in GitHub Actions secrets | Build succeeds but `NEXT_PUBLIC_ANALYTICS_ENDPOINT` is empty → buffer stays local | Add the secret, re-push to main |
| Worker hits free-tier daily write limit (1k writes/day) | POST returns 5xx; buffer drains next day | Free tier is ~50x portfolio traffic; if exceeded, upgrade to Workers Paid ($5/mo) |
| KV read-modify-write race (two visitors POST simultaneously) | Last write wins — some events may be lost | Acceptable for a portfolio; for higher scale, switch to Workers Durable Objects or KV with timestamps + periodic compaction |
| KV eventual consistency (writes propagate within ~60s globally) | GET may show stale counts for ≤60s after a POST | Acceptable for analytics dashboards |

## Local development

To run the Worker locally:

```bash
cd workers
ANALYTICS_KV_ID=<your-id> wrangler dev
```

This starts a local Worker on `http://localhost:8787` with a local KV shim.
Point `NEXT_PUBLIC_ANALYTICS_ENDPOINT` at it for end-to-end testing.

## Cost projection

For a personal portfolio with ~100 visitors/day, each generating ~20 events:

| Metric | Daily usage | Free tier | Headroom |
|---|---|---|---|
| Worker requests | ~200/day (100 POSTs + 100 GETs) | 100k/day | 500x |
| KV reads | ~200/day | 100k/day | 500x |
| KV writes | ~100/day | 1k/day | 10x |
| KV storage | ~50KB/day (capped at 10k events × ~50 bytes) | 1GB | 20000x |

The Worker comfortably fits in the free tier for any personal portfolio.
