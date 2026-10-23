# Changelog

## 0.2.0

- 17 new rules, 61 in total.
  - Surfaces are hard-offset-shadow, ghost-card, radial-glow-background, grid-line-background and stripes-gradient.
  - Motion is pulsing-status-dot, marquee, transition-all, ease-in-ui, scale-zero-entrance and bounce-easing.
  - Type, access and figures are extreme-negative-tracking, focus-ring-removed (P0) and missing-tabular-nums.
  - Palette and copy are cream-clay-palette, aphoristic-cadence and placeholder-person-data.
- left-border-accent is now side-border-accent and also flags right and end borders. The old id still works in ignore comments, config overrides and existing baselines.
- New `profile` config key and `--profile` flag. `operate` switches off six landing-page rules and raises the tracked-caps limit from 3 to 8. `persuade` is the default and keeps the 0.1.0 behaviour. `profileOverrides` sets a profile per path.
- New `figureFace` option for projects whose figures use a monospace face by design.
- Two new references, `vocabulary.md` (named problems and design moves mapped to rule ids) and `rendered-pass.md` (24 screenshot checks). State vocabulary and data display rules added to `process.md` and `checklist.md`.
- Corpus grew from 184 to 372 cases. See `docs/QUALITY.md` for the numbers and the caveats.
- Documentation on running this skill next to other design skills.
- The linter reports version 0.2.0.

## 0.1.0

First release.

- Linter with 44 rules in colour, type, components, motion, copy and punctuation groups.
- Severity model P0, P1 and P2, ignore comments that need a reason, rule overrides, token file allowlist.
- Baseline support so only new findings fail.
- JSON and SARIF output. Dry-run safe fixes with `--write` to apply.
- Claude Code PostToolUse hook, pre-commit script, GitHub Action and guard test examples.
- Skill with check, fix and guard modes, rule catalogue, fix recipes, process notes and reviewer checklist.
- Evals. A labelled detection corpus, trigger queries and task rubrics.
