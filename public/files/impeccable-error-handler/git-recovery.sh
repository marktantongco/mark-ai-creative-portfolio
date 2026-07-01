#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════════
# Git State Recovery Script
# Standalone utility to recover from broken git states without needing
# a full deploy. Use when the persistent shell session is locked.
#
# Usage:
#   ./git-recovery.sh          # Auto-detect and fix git issues
#   ./git-recovery.sh --check  # Only check, don't fix
#   ./git-recovery.sh --force  # Force reset to HEAD
# ═══════════════════════════════════════════════════════════════════════
set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

CHECK_ONLY=0
FORCE_RESET=0

for arg in "$@"; do
    case "$arg" in
        --check) CHECK_ONLY=1 ;;
        --force) FORCE_RESET=1 ;;
    esac
done

echo ""
echo -e "${CYAN}╔══════════════════════════════════════╗${NC}"
echo -e "${CYAN}║  Git State Recovery Utility          ║${NC}"
echo -e "${CYAN}╚══════════════════════════════════════╝${NC}"
echo ""

# Check 1: Rebase in progress
if [ -d ".git/rebase-merge" ] || [ -d ".git/rebase-apply" ]; then
    echo -e "${RED}✗ Rebase operation in progress${NC}"
    if [ "$CHECK_ONLY" -eq 0 ]; then
        echo -e "  ${YELLOW}Fixing: aborting rebase...${NC}"
        git rebase --abort 2>/dev/null || rm -rf .git/rebase-merge .git/rebase-apply 2>/dev/null
        echo -e "  ${GREEN}✓ Rebase aborted${NC}"
    else
        echo -e "  ${YELLOW}Fix: git rebase --abort${NC}"
    fi
else
    echo -e "${GREEN}✓ No rebase in progress${NC}"
fi

# Check 2: Merge in progress
if [ -f ".git/MERGE_HEAD" ]; then
    echo -e "${RED}✗ Merge operation in progress${NC}"
    if [ "$CHECK_ONLY" -eq 0 ]; then
        echo -e "  ${YELLOW}Fixing: aborting merge...${NC}"
        git merge --abort 2>/dev/null || rm -f .git/MERGE_HEAD .git/MERGE_MSG 2>/dev/null
        echo -e "  ${GREEN}✓ Merge aborted${NC}"
    else
        echo -e "  ${YELLOW}Fix: git merge --abort${NC}"
    fi
else
    echo -e "${GREEN}✓ No merge in progress${NC}"
fi

# Check 3: Cherry-pick in progress
if [ -f ".git/CHERRY_PICK_HEAD" ]; then
    echo -e "${RED}✗ Cherry-pick operation in progress${NC}"
    if [ "$CHECK_ONLY" -eq 0 ]; then
        echo -e "  ${YELLOW}Fixing: aborting cherry-pick...${NC}"
        git cherry-pick --abort 2>/dev/null || rm -f .git/CHERRY_PICK_HEAD 2>/dev/null
        echo -e "  ${GREEN}✓ Cherry-pick aborted${NC}"
    else
        echo -e "  ${YELLOW}Fix: git cherry-pick --abort${NC}"
    fi
else
    echo -e "${GREEN}✓ No cherry-pick in progress${NC}"
fi

# Check 4: Index lock
if [ -f ".git/index.lock" ]; then
    echo -e "${RED}✗ Index lock file exists${NC}"
    # Check if another git process is running
    if pgrep -f "git " > /dev/null 2>&1; then
        echo -e "  ${YELLOW}Warning: Another git process may be running${NC}"
        echo -e "  ${YELLOW}Fix: Wait for the other process, then: rm -f .git/index.lock${NC}"
    else
        if [ "$CHECK_ONLY" -eq 0 ]; then
            echo -e "  ${YELLOW}Fixing: removing stale index.lock...${NC}"
            rm -f .git/index.lock
            echo -e "  ${GREEN}✓ Index lock removed${NC}"
        else
            echo -e "  ${YELLOW}Fix: rm -f .git/index.lock${NC}"
        fi
    fi
else
    echo -e "${GREEN}✓ No index lock file${NC}"
fi

# Check 5: REBASE_HEAD
if [ -f ".git/REBASE_HEAD" ]; then
    echo -e "${RED}✗ REBASE_HEAD exists (incomplete rebase)${NC}"
    if [ "$CHECK_ONLY" -eq 0 ]; then
        rm -f .git/REBASE_HEAD
        echo -e "  ${GREEN}✓ REBASE_HEAD removed${NC}"
    else
        echo -e "  ${YELLOW}Fix: rm -f .git/REBASE_HEAD${NC}"
    fi
else
    echo -e "${GREEN}✓ No REBASE_HEAD${NC}"
fi

# Force reset
if [ "$FORCE_RESET" -eq 1 ]; then
    echo ""
    echo -e "${YELLOW}Force reset requested — resetting to HEAD${NC}"
    git reset --hard HEAD 2>/dev/null
    git clean -fd 2>/dev/null
    echo -e "${GREEN}✓ Reset complete${NC}"
fi

# Final verification
echo ""
echo -e "${CYAN}Final git status:${NC}"
if git diff --quiet && git diff --cached --quiet 2>/dev/null; then
    echo -e "${GREEN}✓ Working tree is clean${NC}"
else
    echo -e "${YELLOW}⚠ Working tree has changes${NC}"
    git status --short 2>/dev/null || echo "  Unable to determine status"
fi

echo ""
echo -e "${GREEN}Recovery complete.${NC}"
