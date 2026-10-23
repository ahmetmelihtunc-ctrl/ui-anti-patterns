---
name: ui-anti-patterns
description: Checks, fixes and guards against generic generated-looking UI ("AI slop"). Use when building, reviewing or polishing a front end, when the user mentions AI slop, a vibecoded or templated look, a design review, or asks to remove gradients, emoji icons, glass cards, eyebrow pills, icon-card rows, invented metrics or buzzword copy, or to add guardrails so they do not come back.
license: Apache-2.0
---

# UI anti-patterns

This skill finds the visual and copy habits that make an interface look generated, helps remove them, and keeps them out of later changes. It ships a dependency-free linter, a rule catalogue and review checklists.

Slop is not a matter of who made the page. It is the statistical centre of a thousand good decisions applied without thought about this product. The cure is specificity. Use the product's real colours, real data, real words and the one thing it does that others do not.

## When to use

- Building a new page or component. Plan tokens first, then run GUARD.
- Reviewing or polishing existing UI. Run CHECK, then FIX.
- A user says the UI "looks AI-made", asks for a design review, or wants a cleanup pass.
- Setting up a project so later work cannot reintroduce the tells.

Do not use it for backend work, logos, illustration, brand strategy or accessibility audits beyond contrast, type size and target size.

## Modes

**CHECK** reports what is wrong and how bad it is. Run the linter, read the report, add a manual pass with `references/checklist.md`, and count the tells per screen. About three tells is normal. Eight or more reads as generic.

**FIX** removes findings. Work by theme, not by file. Use the recipes in `references/fixes.md`. Commit one theme at a time. Safe mechanical text fixes are available through `--fix-safe`.

**GUARD** stops regressions. Write the plan before coding, record legacy findings in a baseline, and install the hook, pre-commit script, CI job or guard test from `hooks/`. Only new findings block.

## Severity

| Level | Meaning | Default effect |
|---|---|---|
| P0 | Breaks legibility or access, for example text below the contrast minimum | Fails the run |
| P1 | A clear tell or a dishonest claim | Fails the run |
| P2 | Heuristic or soft tell | Reported, does not fail |

Change the threshold with `--fail-on`. Override a single rule in `ui-slop.config.json`.

## Workflow

1. **Plan tokens first.** Write down colours, type roles, a type scale, a spacing scale and radius steps. Name one reference screen the work should resemble. Do this before generating markup.
2. **Run the linter.** `node scripts/ui-slop-lint.mjs <dir>` from the project root. Add a config file that marks token files as the only place raw hex colours may live.
3. **Read the report.** Group findings by theme (colour, type, components, motion, finish, copy). Fix in this order. Spacing, then buttons, then colour, then everything else.
4. **Fix by theme in small commits.** One theme per commit. Re-run the linter after each one.
5. **Review a screenshot.** The linter cannot judge composition. Look at the rendered page at desktop and phone width and go through the checklist.
6. **Record the baseline** if legacy findings remain, so new work is held to the full standard: `--update-baseline`.
7. **Install a guard.** Pick the hook, pre-commit script, CI job or guard test that fits the project.

If a second attempt at the same piece of work does not clearly improve it, stop. Rework it by hand or change the brief. See `references/process.md`.

## Honest copy and metrics

- Every number on screen comes from a real source, or is labelled as sample data.
- Never claim coverage, compliance, safety or "not affected" without evidence. Show provenance next to the figure (source, time of last update).
- Write plain, specific text from the user's point of view. A competitor should not be able to paste a sentence unchanged.
- An empty state says what the user can do next. It is not filler.
- Use commas and full stops. Avoid em dashes, semicolons and colons in short interface copy. Let layout carry labels.

## Legitimate exceptions

Some patterns carry information. A coloured border that encodes alert severity, a gradient in a chart that encodes a scale, an emoji that is user data, and uppercase for a real abbreviation are fine. Keep them, and mark the line with a reason.

```
/* ui-slop-ignore left-border-accent: encodes alert severity */
```

An ignore comment without a reason is itself a finding.

## References

- `references/rules.md` for every rule with what, why, detection, fix and exceptions.
- `references/fixes.md` for before and after recipes in CSS, Tailwind and React.
- `references/process.md` for plan-first work, small commits and the two-attempt rule.
- `references/checklist.md` for the reviewer checklist and tell count.
- `references/slop-vs-fixed-dashboard.md` for a worked comparison of two dashboards.
- `scripts/ui-slop-lint.mjs` is the linter. Run it with `--help` for options, `--list-rules` for the table.
- `hooks/` holds the Claude Code hook, the pre-commit script, a GitHub Action and a guard test.

## Linter limits

The linter reads text. It cannot see rendered contrast over images, composition, or whether an icon matches its label. P2 rules are heuristics, so treat them as prompts for review. The linter never rewrites code beyond the fixes listed under `--fix-safe`.
