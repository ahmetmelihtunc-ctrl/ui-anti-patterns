#!/bin/sh
# Git pre-commit hook. Lints the staged UI files and blocks the commit on new P0 or P1 findings.
# Install: cp pre-commit.sh .git/hooks/pre-commit && chmod +x .git/hooks/pre-commit
# Set UI_SLOP_LINT when the skill lives somewhere else.
LINT="${UI_SLOP_LINT:-$HOME/.claude/skills/ui-anti-patterns/scripts/ui-slop-lint.mjs}"
[ -f "$LINT" ] || { echo "ui-slop: linter not found at $LINT (set UI_SLOP_LINT)" >&2; exit 0; }

ROOT=$(git rev-parse --show-toplevel) || exit 0
cd "$ROOT" || exit 0
BASE=""
[ -f ui-slop.baseline.json ] && BASE="--baseline ui-slop.baseline.json"

git diff --cached --name-only --diff-filter=ACM -z \
  | grep -z -E '\.(tsx|jsx|vue|svelte|html|htm|css|scss)$' \
  | xargs -0 node "$LINT" --fail-on P1 $BASE
STATUS=$?
[ "$STATUS" -eq 0 ] && exit 0
echo "ui-slop: commit blocked. Fix the findings above or record them with --update-baseline." >&2
exit 1
