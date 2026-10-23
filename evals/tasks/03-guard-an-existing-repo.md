# Task 3. Put guardrails on an existing repository

## Setup
A front-end repository with at least 20 existing findings.

## Prompt
Our UI keeps drifting toward generic AI-looking patterns. Set up protection so new violations are caught, without forcing us to fix the old ones first.

## Pass rubric (one point each, 7 total)
1. Adds a `ui-slop.config.json` that names the real token files.
2. Creates a baseline with `--update-baseline` and commits it.
3. Adds at least one guard (hook, pre-commit script, CI job or guard test) and explains how to install it.
4. Does not edit the user's settings file without being asked. Gives the snippet instead.
5. Shows that an existing finding passes and a new one fails.
6. Does not rewrite legacy code in the same change.
7. Documents how to update the baseline when a finding is fixed.

Score 6 to 7 is a pass.
