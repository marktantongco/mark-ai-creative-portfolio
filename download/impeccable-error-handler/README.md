# Impeccable Error Fix Handler

A three-tier defense system for deployment error prevention, detection, and recovery.

## Quick Start

```bash
# Full deployment with all pre-flight checks
./deploy.sh

# Skip pre-flight checks (NOT recommended)
./deploy.sh --skip-check

# Dry run — run checks only, no actual deployment
./deploy.sh --dry-run

# Force recovery mode — fix broken git state
./deploy.sh --recover

# Auto-fix mode — automatically resolve common issues
AUTO_FIX=1 ./deploy.sh --auto-fix
```

## Three-Tier Architecture

### Tier 1: Prevention — Pre-Flight Checks
Six automated checks run before any deployment:
1. Working tree clean (no uncommitted changes)
2. Branch up to date with remote
3. No git operation in progress (rebase/merge/cherry-pick)
4. No index.lock file
5. Required environment variables present
6. Build passes successfully

### Tier 2: Detection — Real-Time Monitoring
- Git state monitoring (.git directory watchers)
- Shell exit code monitoring on every command
- Build output parsing for common failure patterns
- Rolling error log (last 50 events) for pattern detection

### Tier 3: Recovery — Self-Healing Protocol
1. **Auto-Clean**: Abort in-progress operations, remove lock files
2. **Safe Reset**: Restore from .session-checkpoint.json
3. **Escalate**: Provide detailed diagnostic report with exact recovery commands

## Deployment with Failover

The script automatically deploys to multiple targets with failover:
- **Primary**: Vercel (`VERCEL_TOKEN` required)
- **Secondary**: GitHub Pages (`GITHUB_TOKEN` required)

If the primary target fails, the secondary is automatically attempted.

## Session Checkpointing

Before any risky operation (git rebase, deployment), the script creates a checkpoint file at `.session-checkpoint.json` containing:
- HEAD commit hash
- Current branch name
- Working tree cleanliness status
- Masked environment variable snapshot

On session restart, the checkpoint can be used to restore the exact state before the failure.

## Error Log

All errors are logged to `.deploy-errors.log` with timestamps and severity levels. The log is automatically trimmed to the last 50 entries to prevent unbounded growth.

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `VERCEL_TOKEN` | For Vercel deployment | Vercel API token |
| `GITHUB_TOKEN` | For GitHub push | GitHub personal access token |
| `AUTO_FIX` | Optional | Set to `1` to enable automatic resolution |

## Files

| File | Purpose |
|------|---------|
| `deploy.sh` | Main deployment script with three-tier defense |
| `.session-checkpoint.json` | Auto-generated session state checkpoint |
| `.deploy-errors.log` | Rolling error log (last 50 entries) |
