#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════════
# Impeccable Error Fix Handler — Deployment Script
# Three-Tier Defense: PREVENT → DETECT → RECOVER
#
# Usage:
#   ./deploy.sh              # Full deployment with pre-flight checks
#   ./deploy.sh --skip-check # Skip pre-flight (NOT recommended)
#   ./deploy.sh --dry-run    # Run checks only, no actual deployment
#   ./deploy.sh --recover    # Force recovery mode (fix broken git state)
# ═══════════════════════════════════════════════════════════════════════
set -euo pipefail

# ── Configuration ──────────────────────────────────────────────────────
readonly SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
readonly PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
readonly CHECKPOINT_FILE="$SCRIPT_DIR/.session-checkpoint.json"
readonly ERROR_LOG="$SCRIPT_DIR/.deploy-errors.log"
readonly MAX_ERROR_LOG_LINES=50

# Colors
readonly RED='\033[0;31m'
readonly GREEN='\033[0;32m'
readonly YELLOW='\033[1;33m'
readonly CYAN='\033[0;36m'
readonly PURPLE='\033[0;35m'
readonly NC='\033[0m' # No Color

# ── Error Log ──────────────────────────────────────────────────────────
log_error() {
    local timestamp severity message
    timestamp="$(date -u '+%Y-%m-%dT%H:%M:%SZ')"
    severity="${1:-WARN}"
    message="${2:-}"
    echo "[$timestamp] [$severity] $message" >> "$ERROR_LOG"
    # Trim log to max lines
    if [ -f "$ERROR_LOG" ]; then
        tail -n "$MAX_ERROR_LOG_LINES" "$ERROR_LOG" > "$ERROR_LOG.tmp" 2>/dev/null && \
            mv "$ERROR_LOG.tmp" "$ERROR_LOG" || true
    fi
}

# ── Tier 1: PREVENTION — Pre-Flight Checks ─────────────────────────────
preflight_check() {
    echo -e "${CYAN}═══ TIER 1: Pre-Flight Checks ═══${NC}"
    local failures=0

    # Check 1: Working tree clean
    echo -n "  [1/6] Working tree clean... "
    if git diff --quiet && git diff --cached --quiet 2>/dev/null; then
        echo -e "${GREEN}OK${NC}"
    else
        echo -e "${YELLOW}DIRTY${NC}"
        log_error "WARN" "Working tree has uncommitted changes"
        if [ "${AUTO_FIX:-}" = "1" ]; then
            echo -e "        ${YELLOW}Auto-fix: stashing changes...${NC}"
            git stash push --include-untracked -m "auto-stash-before-deploy-$(date +%s)" 2>/dev/null || true
        else
            echo -e "        ${YELLOW}Fix: git stash --include-untracked${NC}"
            ((failures++)) || true
        fi
    fi

    # Check 2: Branch up to date with remote
    echo -n "  [2/6] Branch up to date with remote... "
    local current_branch
    current_branch="$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo 'unknown')"
    if [ "$current_branch" = "unknown" ]; then
        echo -e "${YELLOW}SKIP (detached HEAD)${NC}"
    else
        git fetch origin "$current_branch" 2>/dev/null || true
        local local_hash remote_hash
        local_hash="$(git rev-parse HEAD 2>/dev/null)"
        remote_hash="$(git rev-parse "origin/$current_branch" 2>/dev/null || echo '')"
        if [ "$local_hash" = "$remote_hash" ]; then
            echo -e "${GREEN}OK${NC}"
        else
            echo -e "${YELLOW}DIVERGED${NC}"
            log_error "WARN" "Local branch diverged from origin/$current_branch"
            if [ "${AUTO_FIX:-}" = "1" ]; then
                echo -e "        ${YELLOW}Auto-fix: pulling with ff-only...${NC}"
                git pull --ff-only origin "$current_branch" 2>/dev/null || {
                    echo -e "        ${RED}ff-only failed — manual resolution required${NC}"
                    ((failures++)) || true
                }
            else
                echo -e "        ${YELLOW}Fix: git pull --ff-only origin $current_branch${NC}"
                ((failures++)) || true
            fi
        fi
    fi

    # Check 3: No rebase/merge/cherry-pick in progress
    echo -n "  [3/6] No git operation in progress... "
    local git_ops=0
    if [ -d ".git/rebase-merge" ] || [ -d ".git/rebase-apply" ]; then
        echo -e "${RED}REBASE IN PROGRESS${NC}"
        log_error "CRITICAL" "Git rebase operation in progress"
        if [ "${AUTO_FIX:-}" = "1" ]; then
            echo -e "        ${YELLOW}Auto-fix: aborting rebase...${NC}"
            git rebase --abort 2>/dev/null || rm -rf .git/rebase-merge .git/rebase-apply 2>/dev/null || true
        else
            echo -e "        ${YELLOW}Fix: git rebase --abort${NC}"
            ((git_ops++)) || true
        fi
    elif [ -f ".git/MERGE_HEAD" ]; then
        echo -e "${RED}MERGE IN PROGRESS${NC}"
        log_error "CRITICAL" "Git merge operation in progress"
        if [ "${AUTO_FIX:-}" = "1" ]; then
            echo -e "        ${YELLOW}Auto-fix: aborting merge...${NC}"
            git merge --abort 2>/dev/null || rm -f .git/MERGE_HEAD .git/MERGE_MSG 2>/dev/null || true
        else
            echo -e "        ${YELLOW}Fix: git merge --abort${NC}"
            ((git_ops++)) || true
        fi
    elif [ -f ".git/CHERRY_PICK_HEAD" ]; then
        echo -e "${RED}CHERRY-PICK IN PROGRESS${NC}"
        log_error "CRITICAL" "Git cherry-pick operation in progress"
        if [ "${AUTO_FIX:-}" = "1" ]; then
            echo -e "        ${YELLOW}Auto-fix: aborting cherry-pick...${NC}"
            git cherry-pick --abort 2>/dev/null || rm -f .git/CHERRY_PICK_HEAD 2>/dev/null || true
        else
            echo -e "        ${YELLOW}Fix: git cherry-pick --abort${NC}"
            ((git_ops++)) || true
        fi
    else
        echo -e "${GREEN}OK${NC}"
    fi
    ((failures += git_ops)) || true

    # Check 4: No index.lock
    echo -n "  [4/6] No index.lock file... "
    if [ -f ".git/index.lock" ]; then
        echo -e "${RED}LOCKED${NC}"
        log_error "CRITICAL" "Git index.lock file exists"
        if [ "${AUTO_FIX:-}" = "1" ]; then
            echo -e "        ${YELLOW}Auto-fix: removing stale index.lock...${NC}"
            rm -f .git/index.lock
        else
            echo -e "        ${YELLOW}Fix: rm -f .git/index.lock${NC}"
            ((failures++)) || true
        fi
    else
        echo -e "${GREEN}OK${NC}"
    fi

    # Check 5: Required environment variables
    echo -n "  [5/6] Required environment variables... "
    local missing_env=0
    for var in VERCEL_TOKEN; do
        if [ -z "${!var:-}" ]; then
            echo -e "\n        ${YELLOW}Missing: $var${NC}"
            ((missing_env++)) || true
        fi
    done
    if [ "$missing_env" -eq 0 ]; then
        echo -e "${GREEN}OK${NC}"
    else
        log_error "WARN" "Missing $missing_env environment variable(s)"
        echo -e "        ${YELLOW}Set missing vars or use .env file${NC}"
        ((failures += missing_env)) || true
    fi

    # Check 6: Build passes
    echo -n "  [6/6] Build verification... "
    if npm run build > /dev/null 2>&1; then
        echo -e "${GREEN}OK${NC}"
    else
        echo -e "${RED}FAILED${NC}"
        log_error "CRITICAL" "Build failed — cannot deploy"
        echo -e "        ${RED}Fix: resolve build errors before deploying${NC}"
        ((failures++)) || true
    fi

    echo ""
    if [ "$failures" -gt 0 ]; then
        echo -e "${RED}  ✗ Pre-flight FAILED: $failures issue(s) found${NC}"
        echo -e "  Run with AUTO_FIX=1 to attempt automatic resolution"
        return 1
    else
        echo -e "${GREEN}  ✓ All pre-flight checks passed${NC}"
        return 0
    fi
}

# ── Tier 2: DETECTION — Real-Time Error Monitoring ─────────────────────
detect_git_state() {
    echo -e "${CYAN}═══ TIER 2: State Detection ═══${NC}"

    # Monitor git state
    local git_state="clean"
    [ -d ".git/rebase-merge" ] || [ -d ".git/rebase-apply" ] && git_state="rebase"
    [ -f ".git/MERGE_HEAD" ] && git_state="merge"
    [ -f ".git/CHERRY_PICK_HEAD" ] && git_state="cherry-pick"
    [ -f ".git/index.lock" ] && git_state="locked"
    [ -n "$(git status --porcelain 2>/dev/null)" ] && git_state="dirty"

    echo -n "  Git state: "
    case "$git_state" in
        clean)  echo -e "${GREEN}CLEAN${NC}" ;;
        dirty)  echo -e "${YELLOW}DIRTY (uncommitted changes)${NC}" ;;
        *)      echo -e "${RED}$git_state (CRITICAL)${NC}" ;;
    esac

    # Return error if critical state detected
    if [[ "$git_state" == "rebase" || "$git_state" == "merge" || "$git_state" == "cherry-pick" || "$git_state" == "locked" ]]; then
        return 1
    fi
    return 0
}

# ── Tier 3: RECOVERY — Self-Healing Protocol ───────────────────────────
recover() {
    echo -e "${PURPLE}═══ TIER 3: Self-Healing Recovery ═══${NC}"

    # Step 1: Auto-Clean
    echo -e "  ${CYAN}Step 1: Auto-Clean${NC}"

    # Abort any in-progress operations
    echo -n "    Aborting in-progress git operations... "
    git rebase --abort 2>/dev/null || true
    git merge --abort 2>/dev/null || true
    git cherry-pick --abort 2>/dev/null || true
    rm -rf .git/rebase-merge .git/rebase-apply 2>/dev/null || true
    rm -f .git/MERGE_HEAD .git/MERGE_MSG .git/CHERRY_PICK_HEAD 2>/dev/null || true
    rm -f .git/index.lock 2>/dev/null || true
    echo -e "${GREEN}done${NC}"

    # Step 2: Safe Reset
    echo -e "  ${CYAN}Step 2: Safe Reset${NC}"

    # Check for checkpoint
    if [ -f "$CHECKPOINT_FILE" ]; then
        local checkpoint_head
        checkpoint_head="$(python3 -c "import json; print(json.load(open('$CHECKPOINT_FILE'))['head_commit'])" 2>/dev/null || echo '')"
        if [ -n "$checkpoint_head" ]; then
            echo -n "    Restoring from checkpoint: ${checkpoint_head:0:8}... "
            git reset --hard "$checkpoint_head" 2>/dev/null && echo -e "${GREEN}OK${NC}" || echo -e "${RED}FAILED${NC}"
        fi
    else
        echo -e "    ${YELLOW}No checkpoint found — resetting to HEAD${NC}"
        git reset --hard HEAD 2>/dev/null || true
    fi

    # Step 3: Verify recovery
    echo -e "  ${CYAN}Step 3: Verification${NC}"
    if detect_git_state; then
        echo -e "${GREEN}  ✓ Recovery successful — git state is clean${NC}"
        return 0
    else
        echo -e "${RED}  ✗ Recovery failed — manual intervention required${NC}"
        echo -e ""
        echo -e "  Manual recovery commands:"
        echo -e "    cd $(pwd)"
        echo -e "    rm -f .git/index.lock"
        echo -e "    rm -rf .git/rebase-merge .git/rebase-apply"
        echo -e "    rm -f .git/MERGE_HEAD .git/MERGE_MSG .git/REBASE_HEAD"
        echo -e "    git reset --hard HEAD"
        echo -e "    git clean -fd"
        return 1
    fi
}

# ── Session Checkpoint ─────────────────────────────────────────────────
checkpoint_save() {
    echo -n "  Saving checkpoint... "
    python3 - "$PROJECT_DIR" "$CHECKPOINT_FILE" << 'PYEOF'
import json, os, subprocess, sys

project_dir = sys.argv[1]
checkpoint_file = sys.argv[2]

checkpoint = {
    "timestamp": subprocess.check_output(["date", "-u", "+%Y-%m-%dT%H:%M:%SZ"]).decode().strip(),
    "head_commit": subprocess.check_output(["git", "rev-parse", "HEAD"], cwd=project_dir).decode().strip(),
    "branch": subprocess.check_output(["git", "rev-parse", "--abbrev-ref", "HEAD"], cwd=project_dir).decode().strip(),
    "working_tree_clean": not bool(subprocess.check_output(["git", "status", "--porcelain"], cwd=project_dir).decode().strip()),
    "env_vars": {
        k: "***" + v[-4:] if len(v) > 8 else "***"
        for k, v in os.environ.items()
        if k in ("VERCEL_TOKEN", "GITHUB_TOKEN", "VERCEL_ORG_ID", "VERCEL_PROJECT_ID")
        and v
    }
}

with open(checkpoint_file, "w") as f:
    json.dump(checkpoint, f, indent=2)

print("saved")
PYEOF
    echo -e "${GREEN}OK${NC}"
}

# ── Deploy to Vercel ───────────────────────────────────────────────────
deploy_vercel() {
    echo -e "${CYAN}  Deploying to Vercel...${NC}"
    if [ -n "${VERCEL_TOKEN:-}" ]; then
        npx vercel --yes --prod --token "$VERCEL_TOKEN" 2>&1 | tail -5 || {
            log_error "CRITICAL" "Vercel deployment failed"
            echo -e "  ${RED}Vercel deployment failed${NC}"
            return 1
        }
        echo -e "  ${GREEN}Vercel deployment complete${NC}"
        return 0
    else
        echo -e "  ${YELLOW}Skipped (no VERCEL_TOKEN)${NC}"
        return 0
    fi
}

# ── Deploy to GitHub Pages ─────────────────────────────────────────────
deploy_github_pages() {
    echo -e "${CYAN}  Pushing to GitHub...${NC}"
    local current_branch
    current_branch="$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo 'main')"

    if [ -n "${GITHUB_TOKEN:-}" ]; then
        local remote_url
        remote_url="$(git remote get-url origin 2>/dev/null || echo '')"
        if echo "$remote_url" | grep -q "https://github.com"; then
            local repo_path
            repo_path="$(echo "$remote_url" | sed 's|.*https://github.com/||' | sed 's|\.git$||')"
            git push "https://${GITHUB_TOKEN}@github.com/${repo_path}" "$current_branch" --force 2>&1 | tail -3 || {
                log_error "CRITICAL" "GitHub push failed"
                echo -e "  ${RED}GitHub push failed${NC}"
                return 1
            }
        else
            git push origin "$current_branch" --force 2>&1 | tail -3 || {
                log_error "CRITICAL" "GitHub push failed"
                return 1
            }
        fi
        echo -e "  ${GREEN}GitHub push complete${NC}"
        return 0
    else
        echo -e "  ${YELLOW}Skipped (no GITHUB_TOKEN)${NC}"
        return 0
    fi
}

# ── Deployment with Failover ───────────────────────────────────────────
deploy_with_failover() {
    echo -e "${CYAN}═══ Deployment (with failover) ═══${NC}"

    local vercel_ok=0
    local github_ok=0

    # Primary: Vercel
    deploy_vercel && vercel_ok=1 || vercel_ok=0

    # Secondary: GitHub Pages
    deploy_github_pages && github_ok=1 || github_ok=0

    echo ""
    if [ "$vercel_ok" -eq 1 ] || [ "$github_ok" -eq 1 ]; then
        echo -e "${GREEN}  ✓ Deployment successful${NC}"
        [ "$vercel_ok" -eq 1 ] && echo -e "    Vercel: ${GREEN}LIVE${NC}" || echo -e "    Vercel: ${RED}FAILED${NC}"
        [ "$github_ok" -eq 1 ] && echo -e "    GitHub: ${GREEN}LIVE${NC}" || echo -e "    GitHub: ${RED}FAILED${NC}"
        return 0
    else
        echo -e "${RED}  ✗ All deployment targets failed${NC}"
        log_error "CRITICAL" "All deployment targets failed"
        return 1
    fi
}

# ── Main ────────────────────────────────────────────────────────────────
main() {
    local mode="deploy"

    # Parse arguments
    for arg in "$@"; do
        case "$arg" in
            --skip-check) SKIP_CHECK=1 ;;
            --dry-run)    DRY_RUN=1 ;;
            --recover)    mode="recover" ;;
            --auto-fix)   AUTO_FIX=1 ;;
        esac
    done

    cd "$PROJECT_DIR"

    echo ""
    echo -e "${PURPLE}╔══════════════════════════════════════════════════════╗${NC}"
    echo -e "${PURPLE}║  Impeccable Error Fix Handler — Deployment System  ║${NC}"
    echo -e "${PURPLE}╚══════════════════════════════════════════════════════╝${NC}"
    echo ""

    # Recovery mode
    if [ "$mode" = "recover" ]; then
        recover
        exit $?
    fi

    # Tier 1: Pre-Flight Checks
    if [ "${SKIP_CHECK:-0}" != "1" ]; then
        if ! preflight_check; then
            echo -e "\n${YELLOW}Pre-flight checks failed. Fix issues or run with --auto-fix${NC}"
            exit 1
        fi
    fi

    # Save checkpoint before deployment
    checkpoint_save

    # Dry run — stop here
    if [ "${DRY_RUN:-0}" = "1" ]; then
        echo -e "\n${YELLOW}Dry run complete — no deployments executed${NC}"
        exit 0
    fi

    # Tier 2: Detection (quick state check)
    detect_git_state

    # Deploy with failover
    deploy_with_failover

    echo ""
    echo -e "${PURPLE}══════════════════════════════════════════════════════${NC}"
    echo -e "${GREEN}  Deployment pipeline complete${NC}"
    echo -e "${PURPLE}══════════════════════════════════════════════════════${NC}"
}

main "$@"
