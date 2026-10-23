# Contributing

Thanks for helping. The linter is one dependency-free file, and the aim is to keep it that way.

## Setup

Node 20 or newer. There is nothing to install.

```
node --test
node evals/run-detection.mjs
npm run lint-self
```

All three must pass before you open a pull request.

## Adding or changing a rule

1. Add the rule object to the `RULES` table in `skills/ui-anti-patterns/scripts/ui-slop-lint.mjs`. Give it an id in kebab case, a severity, a title and a hint.
2. Add at least one positive and one hard negative to `evals/corpus/cases.mjs`. The test suite fails when a rule has neither.
3. Document the rule in `skills/ui-anti-patterns/references/rules.md` and add a recipe to `fixes.md` if it needs one.
4. Prefer P2 for heuristics. P0 and P1 need precision of at least 0.9 on the corpus and on real code.
5. When you fix a false positive, add the offending snippet as a hard negative first.

## Style for text in this repository

The repository follows its own rules.

- Short, plain sentences. One term per concept (finding, rule, severity, baseline).
- No em dashes. Avoid semicolons and colons in prose, and avoid spaced dashes as separators.
- No emoji and no marketing words.
- The only exception is the parody section of the front-page `README.md`.

`node --test` checks this for Markdown files.

## Pull requests

One theme per pull request. Use Conventional Commits for messages. Describe what you checked and what you did not.
