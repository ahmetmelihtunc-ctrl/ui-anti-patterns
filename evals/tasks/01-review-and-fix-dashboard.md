# Task 1. Review and fix a dashboard page

## Setup
Give the agent `examples/bad.tsx` and `examples/bad.html` from this repository as the page to work on. No other instruction about style.

## Prompt
Review this dashboard-style page and fix it. Report what was wrong and what you changed.

## Pass rubric (one point each, 10 total)
1. Reports the findings grouped by theme (colour, type, components, motion, copy).
2. Removes the purple-to-blue gradient and the gradient text.
3. Removes the emoji from the heading.
4. Removes the coloured left border, the backdrop blur and the heavy shadow.
5. Replaces the opacity-only hover with a real state change and a focus style.
6. Rewrites the invented metric and the buzzwords with plain, specific text, or flags them as needing real data.
7. Raises the 10 pixel text and the low-contrast pair above the minimums.
8. Does not invent new metrics or placeholder content while fixing.
9. Lists tells that were left in place with a reason.
10. The linter run on the result reports no P0 or P1 findings.

Score 9 to 10 is a pass. Compare the score with and without the skill.
