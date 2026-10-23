# Quality

How well the linter works, how that was measured, and what was not measured. Date of the measurements below is 2026-10-23, linter version 0.1.0.

## 1. Labelled corpus

Command `node evals/run-detection.mjs`. Corpus size is 184 cases (small tsx, css and html snippets), with 77 labelled expectations and the rest hard negatives such as severity colours, data emoji, times, ports, JSON in code, version ranges, overlays and loading animations.

Overall precision 1.00, recall 1.00, F1 1.00 (true positives 77, false positives 0, false negatives 0).

These numbers describe regressions and known edge cases only. The corpus was written together with the rules, and several negatives were added after false positives were found in real code. A score of 1.00 here does not mean 1.00 on your code.

| Rule | Severity | TP | FP | FN | Precision | Recall | F1 |
|---|---|---|---|---|---|---|---|
| accent-overuse | P2 | 1 | 0 | 0 | 1.00 | 1.00 | 1.00 |
| accent-word-heading | P2 | 1 | 0 | 0 | 1.00 | 1.00 | 1.00 |
| arrow-suffix | P2 | 1 | 0 | 0 | 1.00 | 1.00 | 1.00 |
| buzzword | P2 | 2 | 0 | 0 | 1.00 | 1.00 | 1.00 |
| caps-tracked | P2 | 2 | 0 | 0 | 1.00 | 1.00 | 1.00 |
| cursor-glow | P1 | 1 | 0 | 0 | 1.00 | 1.00 | 1.00 |
| decorative-blob | P2 | 1 | 0 | 0 | 1.00 | 1.00 | 1.00 |
| default-chart-palette | P2 | 2 | 0 | 0 | 1.00 | 1.00 | 1.00 |
| default-font-only | P2 | 1 | 0 | 0 | 1.00 | 1.00 | 1.00 |
| default-indigo | P1 | 2 | 0 | 0 | 1.00 | 1.00 | 1.00 |
| em-dash | P1 | 3 | 0 | 0 | 1.00 | 1.00 | 1.00 |
| emoji-ui | P1 | 2 | 0 | 0 | 1.00 | 1.00 | 1.00 |
| eyebrow-pill | P2 | 1 | 0 | 0 | 1.00 | 1.00 | 1.00 |
| floating-animation | P2 | 4 | 0 | 0 | 1.00 | 1.00 | 1.00 |
| frosted-glass | P1 | 4 | 0 | 0 | 1.00 | 1.00 | 1.00 |
| gradient-orb | P1 | 2 | 0 | 0 | 1.00 | 1.00 | 1.00 |
| gradient-text | P1 | 2 | 0 | 0 | 1.00 | 1.00 | 1.00 |
| grain-noise | P2 | 2 | 0 | 0 | 1.00 | 1.00 | 1.00 |
| heavy-shadow | P2 | 2 | 0 | 0 | 1.00 | 1.00 | 1.00 |
| hex-excess | P2 | 1 | 0 | 0 | 1.00 | 1.00 | 1.00 |
| hover-opacity | P2 | 2 | 0 | 0 | 1.00 | 1.00 | 1.00 |
| icon-card-row | P2 | 2 | 0 | 0 | 1.00 | 1.00 | 1.00 |
| ignore-without-reason | P1 | 1 | 0 | 0 | 1.00 | 1.00 | 1.00 |
| invented-metric | P1 | 2 | 0 | 0 | 1.00 | 1.00 | 1.00 |
| kpi-card-row | P2 | 2 | 0 | 0 | 1.00 | 1.00 | 1.00 |
| label-dash | P1 | 1 | 0 | 0 | 1.00 | 1.00 | 1.00 |
| side-border-accent | P1 | 2 | 0 | 0 | 1.00 | 1.00 | 1.00 |
| low-contrast | P0 | 4 | 0 | 0 | 1.00 | 1.00 | 1.00 |
| middle-dot | P2 | 1 | 0 | 0 | 1.00 | 1.00 | 1.00 |
| mono-heading | P2 | 2 | 0 | 0 | 1.00 | 1.00 | 1.00 |
| neon-glow | P2 | 1 | 0 | 0 | 1.00 | 1.00 | 1.00 |
| nested-cards | P2 | 1 | 0 | 0 | 1.00 | 1.00 | 1.00 |
| off-scale-spacing | P2 | 2 | 0 | 0 | 1.00 | 1.00 | 1.00 |
| placeholder-copy | P1 | 2 | 0 | 0 | 1.00 | 1.00 | 1.00 |
| placeholder-image | P1 | 2 | 0 | 0 | 1.00 | 1.00 | 1.00 |
| punct-colon-in-copy | P2 | 1 | 0 | 0 | 1.00 | 1.00 | 1.00 |
| punct-dash-separator | P2 | 1 | 0 | 0 | 1.00 | 1.00 | 1.00 |
| punct-semicolon-in-copy | P2 | 1 | 0 | 0 | 1.00 | 1.00 | 1.00 |
| scroll-entrance | P1 | 2 | 0 | 0 | 1.00 | 1.00 | 1.00 |
| serif-italic-emphasis | P2 | 1 | 0 | 0 | 1.00 | 1.00 | 1.00 |
| small-touch-target | P2 | 1 | 0 | 0 | 1.00 | 1.00 | 1.00 |
| tiny-font | P1 | 2 | 0 | 0 | 1.00 | 1.00 | 1.00 |
| two-stop-gradient | P1 | 2 | 0 | 0 | 1.00 | 1.00 | 1.00 |
| uniform-radius | P2 | 1 | 0 | 0 | 1.00 | 1.00 | 1.00 |
| weak-hierarchy | P2 | 1 | 0 | 0 | 1.00 | 1.00 | 1.00 |

## 2. Real code review

The linter was run, read-only, on two production Next.js dashboards (137 files in total, Tailwind classes and inline styles, about 1460 findings). About 110 findings were read by hand across all rules that fired.

On the first pass, nine rules had clear false positives. They are listed here with the cause, and each cause was fixed and turned into a hard negative in the corpus.

| Rule | First pass | Cause |
|---|---|---|
| decorative-blob | 5 of 5 false | the word "blob" in `createObjectURL(blob)` |
| punct-dash-separator | 5 of 6 false | arithmetic in code lines read as prose |
| punct-colon-in-copy | about 4 of 6 false | object keys and ternaries read as labels |
| nested-cards | 4 of 5 false | buttons and padded callouts counted as cards |
| em-dash | about half false | a lone dash used as an empty-value marker |
| frosted-glass | 3 of 7 false | `backdrop-filter: none`, `@supports`, full-screen scrims |
| heavy-shadow | 3 of 7 false | dropdowns, popovers and dialogs |
| side-border-accent | 2 of 8 false | transparent borders |
| icon-card-row | 1 of 1 false | TypeScript interface fields |

After the fixes, the re-read sample had no remaining false positives for these rules, and the other rules had none on first read. The sample is small and was not random, so treat this as a rough estimate. Heuristic rules (weak-hierarchy, hex-excess) have low confidence, and hex-excess reports theme files unless they are listed in `tokenFiles`.

## 3. Not measured yet

- Trigger accuracy. `evals/trigger-queries.json` holds 40 prompts, but they have not been run against Claude Code.
- With-skill versus without-skill task scores. The five tasks in `evals/tasks` have not been run.
- Real Claude Code hook execution and SARIF upload to GitHub code scanning. Both were tested only through their interfaces (a simulated hook payload, a SARIF file checked for structure).
- Recall on real code. Only precision was reviewed there, so unknown misses exist.

## How to update this file

Run the corpus and paste the table. When you review real code, record the sample size, the date and the false positives with their cause.
