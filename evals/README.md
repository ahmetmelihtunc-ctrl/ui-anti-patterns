# Evals

Three ways to measure the skill.

## 1. Detection corpus

```
node evals/run-detection.mjs
node evals/run-detection.mjs --json
node evals/run-detection.mjs --min-precision-high 0.95 --min-recall 0.9
```

`corpus/cases.mjs` holds small labelled snippets. A positive lists the rule and line that must be reported. A hard negative lists rules that must not fire, for example severity colours, data emoji, times and ports. Only the rules named in a case are scored for that case.

The script prints true positives, false positives, false negatives, precision, recall and F1 per rule, then the overall numbers. It exits 1 when precision falls below 0.9 for P0 and P1 rules, below 0.8 for P2 rules, or when recall falls below 0.8 for any rule. A rule with no case also fails.

Read the scores with care. The corpus was written by the same people who wrote the rules, so it measures regressions and known edge cases and not real-world accuracy. For that, review a sample of findings on real code and record the result in `docs/QUALITY.md`.

When a false positive turns up in real code, add the snippet as a hard negative first, then fix the rule.

## 2. Trigger queries

`trigger-queries.json` lists 20 prompts that should invoke the skill and 20 near misses that should not. Run each prompt in a fresh Claude Code session with the skill installed and record whether the skill loaded. Precision is the share of invocations that were correct. Recall is the share of the 20 positives that triggered. Adjust the `description` in `SKILL.md` when either is below 0.9, then run the list again.

## 3. Task evals

`tasks/*.md` are five realistic tasks with pass rubrics. Run each task twice in a fresh session, once with the skill installed and once without, then score both against the rubric. The skill earns its place when the with-skill score is higher on tasks 1 to 4 and equal on task 5. Record the two scores per task and the date.
