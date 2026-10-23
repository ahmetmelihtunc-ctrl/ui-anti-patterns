# Quality

How well the linter works, how that was measured, and what was not measured. Date of the measurements below is 2026-10-23, linter version 0.2.0.

## 1. Labelled corpus

Command `node evals/run-detection.mjs`. Corpus size is 372 cases (small tsx, css and html snippets), with 145 labelled expectations and 227 hard negatives such as severity colours, data emoji, times, ports, JSON in code, version ranges, overlays, loading animations, skeleton bars, ignore comments and chart files.

Overall precision 1.00, recall 1.00, F1 1.00 (true positives 145, false positives 0, false negatives 0), across 61 rules plus the ignore check.

These numbers describe regressions and known edge cases only. The corpus was written together with the rules, and several negatives were added after false positives were found in real code. A score of 1.00 here does not mean 1.00 on your code.

| Rule | Severity | TP | FP | FN | Precision | Recall | F1 |
|---|---|---|---|---|---|---|---|
| accent-overuse | P2 | 1 | 0 | 0 | 1.00 | 1.00 | 1.00 |
| accent-word-heading | P2 | 1 | 0 | 0 | 1.00 | 1.00 | 1.00 |
| aphoristic-cadence | P2 | 3 | 0 | 0 | 1.00 | 1.00 | 1.00 |
| arrow-suffix | P2 | 1 | 0 | 0 | 1.00 | 1.00 | 1.00 |
| bounce-easing | P2 | 4 | 0 | 0 | 1.00 | 1.00 | 1.00 |
| buzzword | P2 | 2 | 0 | 0 | 1.00 | 1.00 | 1.00 |
| caps-tracked | P2 | 2 | 0 | 0 | 1.00 | 1.00 | 1.00 |
| cream-clay-palette | P2 | 3 | 0 | 0 | 1.00 | 1.00 | 1.00 |
| cursor-glow | P1 | 1 | 0 | 0 | 1.00 | 1.00 | 1.00 |
| decorative-blob | P2 | 1 | 0 | 0 | 1.00 | 1.00 | 1.00 |
| default-chart-palette | P2 | 2 | 0 | 0 | 1.00 | 1.00 | 1.00 |
| default-font-only | P2 | 1 | 0 | 0 | 1.00 | 1.00 | 1.00 |
| default-indigo | P1 | 2 | 0 | 0 | 1.00 | 1.00 | 1.00 |
| ease-in-ui | P2 | 4 | 0 | 0 | 1.00 | 1.00 | 1.00 |
| em-dash | P1 | 3 | 0 | 0 | 1.00 | 1.00 | 1.00 |
| emoji-ui | P1 | 2 | 0 | 0 | 1.00 | 1.00 | 1.00 |
| extreme-negative-tracking | P2 | 4 | 0 | 0 | 1.00 | 1.00 | 1.00 |
| eyebrow-pill | P2 | 2 | 0 | 0 | 1.00 | 1.00 | 1.00 |
| floating-animation | P2 | 4 | 0 | 0 | 1.00 | 1.00 | 1.00 |
| focus-ring-removed | P0 | 5 | 0 | 0 | 1.00 | 1.00 | 1.00 |
| frosted-glass | P1 | 4 | 0 | 0 | 1.00 | 1.00 | 1.00 |
| ghost-card | P2 | 3 | 0 | 0 | 1.00 | 1.00 | 1.00 |
| gradient-orb | P1 | 2 | 0 | 0 | 1.00 | 1.00 | 1.00 |
| gradient-text | P1 | 2 | 0 | 0 | 1.00 | 1.00 | 1.00 |
| grain-noise | P2 | 2 | 0 | 0 | 1.00 | 1.00 | 1.00 |
| grid-line-background | P2 | 3 | 0 | 0 | 1.00 | 1.00 | 1.00 |
| hard-offset-shadow | P2 | 3 | 0 | 0 | 1.00 | 1.00 | 1.00 |
| heavy-shadow | P2 | 2 | 0 | 0 | 1.00 | 1.00 | 1.00 |
| hex-excess | P2 | 1 | 0 | 0 | 1.00 | 1.00 | 1.00 |
| hover-opacity | P2 | 2 | 0 | 0 | 1.00 | 1.00 | 1.00 |
| icon-card-row | P2 | 2 | 0 | 0 | 1.00 | 1.00 | 1.00 |
| ignore-without-reason | P1 | 1 | 0 | 0 | 1.00 | 1.00 | 1.00 |
| invented-metric | P1 | 2 | 0 | 0 | 1.00 | 1.00 | 1.00 |
| kpi-card-row | P2 | 2 | 0 | 0 | 1.00 | 1.00 | 1.00 |
| label-dash | P1 | 1 | 0 | 0 | 1.00 | 1.00 | 1.00 |
| low-contrast | P0 | 4 | 0 | 0 | 1.00 | 1.00 | 1.00 |
| marquee | P2 | 4 | 0 | 0 | 1.00 | 1.00 | 1.00 |
| middle-dot | P2 | 1 | 0 | 0 | 1.00 | 1.00 | 1.00 |
| missing-tabular-nums | P2 | 3 | 0 | 0 | 1.00 | 1.00 | 1.00 |
| mono-heading | P2 | 2 | 0 | 0 | 1.00 | 1.00 | 1.00 |
| neon-glow | P2 | 1 | 0 | 0 | 1.00 | 1.00 | 1.00 |
| nested-cards | P2 | 1 | 0 | 0 | 1.00 | 1.00 | 1.00 |
| off-scale-spacing | P2 | 2 | 0 | 0 | 1.00 | 1.00 | 1.00 |
| placeholder-copy | P1 | 2 | 0 | 0 | 1.00 | 1.00 | 1.00 |
| placeholder-image | P1 | 2 | 0 | 0 | 1.00 | 1.00 | 1.00 |
| placeholder-person-data | P2 | 4 | 0 | 0 | 1.00 | 1.00 | 1.00 |
| pulsing-status-dot | P2 | 4 | 0 | 0 | 1.00 | 1.00 | 1.00 |
| punct-colon-in-copy | P2 | 1 | 0 | 0 | 1.00 | 1.00 | 1.00 |
| punct-dash-separator | P2 | 1 | 0 | 0 | 1.00 | 1.00 | 1.00 |
| punct-semicolon-in-copy | P2 | 1 | 0 | 0 | 1.00 | 1.00 | 1.00 |
| radial-glow-background | P2 | 3 | 0 | 0 | 1.00 | 1.00 | 1.00 |
| scale-zero-entrance | P2 | 5 | 0 | 0 | 1.00 | 1.00 | 1.00 |
| scroll-entrance | P1 | 2 | 0 | 0 | 1.00 | 1.00 | 1.00 |
| serif-italic-emphasis | P2 | 1 | 0 | 0 | 1.00 | 1.00 | 1.00 |
| side-border-accent | P1 | 6 | 0 | 0 | 1.00 | 1.00 | 1.00 |
| small-touch-target | P2 | 1 | 0 | 0 | 1.00 | 1.00 | 1.00 |
| stripes-gradient | P2 | 3 | 0 | 0 | 1.00 | 1.00 | 1.00 |
| tiny-font | P1 | 2 | 0 | 0 | 1.00 | 1.00 | 1.00 |
| transition-all | P2 | 5 | 0 | 0 | 1.00 | 1.00 | 1.00 |
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

## 2b. The 0.2.0 rules on real code

The 17 rules added in 0.2.0 were run, read-only, on three internal Next.js apps (170 files, Tailwind classes and inline styles). Eleven of the 17 never fired there, so their only evidence is the corpus fixtures. The rest fired as follows after the fixes listed below.

| Rule | Findings | Read by hand | Result |
|---|---|---|---|
| transition-all | 105 | no, it is a mechanical match | not reviewed |
| focus-ring-removed | 29 | all matched lines, one input in full context | no false positive found. Several are search fields inside a styled wrapper, where a wrapper focus style might exist in a way the rule cannot see |
| pulsing-status-dot | 10 | all | one wrong match (`h-3.5` read as `h-3`), fixed. The rest are real pulses |
| scale-zero-entrance | 2 | all | the first pass also matched `scale(0)` as a chart function call (2 of 4 false), fixed |
| ghost-card | 1 | all | the first pass also flagged a toast (1 of 2 false), fixed |
| grid-line-background | 2 | all | both real grid backgrounds |

The right-hand half of side-border-accent found nothing new in this sample. The 11 silent rules are hard-offset-shadow, marquee, ease-in-ui, bounce-easing, extreme-negative-tracking, stripes-gradient, radial-glow-background, cream-clay-palette, aphoristic-cadence, placeholder-person-data and missing-tabular-nums. Their absence says the apps are clean of them, or that the rule is too narrow. This sample cannot tell which.

The sample is small, not random and from one team's habits. Treat the P2 rules as prompts and read focus-ring-removed findings before acting on them, because it is the only new P0 and it cannot see a global focus style defined in another file.

## 3. Not measured yet

- Trigger accuracy. `evals/trigger-queries.json` holds 46 prompts, but they have not been run against Claude Code.
- With-skill versus without-skill task scores. The five tasks in `evals/tasks` have not been run.
- Real Claude Code hook execution and SARIF upload to GitHub code scanning. Both were tested only through their interfaces (a simulated hook payload, a SARIF file checked for structure).
- Recall on real code. Only precision was reviewed there, so unknown misses exist. This applies even more to the 0.2.0 rules, most of which have only fixture evidence.
- The effect of the `operate` profile on real code. The profile is covered by unit tests and corpus cases, but nobody has measured how many findings it removes in a real console or how many real problems it hides.
- The rendered pass and the state guidance. They are review guidance written from the thresholds of other tools and were not validated against a panel of screens.

## How to update this file

Run the corpus and paste the table. When you review real code, record the sample size, the date and the false positives with their cause.
