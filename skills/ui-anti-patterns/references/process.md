# Process

Visual slop and process slop have the same cause. Output was accepted without anyone being able to explain it. These habits keep both out.

## Plan first

Before any markup is written, put these on one page.

1. The tokens. Colours with roles, type roles and a scale, a spacing scale, radius steps.
2. A named reference screen in the same product that the new work should resemble.
3. The expected files and commits.
4. The tells that must not appear. Link the rule list.

For a real product, design from a wireframe and the design system first, then build from that reference. Telling a model to "make it less vibecoded" does not work. Name the concrete elements to remove or change instead.

## Three levels of effort

| Level | Action | Use when |
|---|---|---|
| 1. Clean up | Remove fluff and decoration first, then be specific about colour, fonts, icons and graphics | A quick pass on a page that mostly works |
| 2. Define the aesthetic | Give a reference such as a palette, a type pairing and a described style instead of defaults | The product has no look yet |
| 3. Build from a system | Start from wireframes and a design system, then generate against that | A real product with many screens |

Structured, digital styles are easy to produce. Organic ones are not, so do not promise them.

## Small commits

- One theme per commit (spacing, buttons, colour, copy, motion).
- Commit early. Make a work-in-progress commit before a long verification run, then refine.
- Never bundle a visual cleanup with a behaviour change.
- Re-run the linter before each commit. A commit that adds findings needs a reason in the message.

## Two-attempt rule

If a second attempt at the same piece of work does not clearly improve it, stop. Rework it by hand, change the brief, or use a different tool. A third attempt on the same prompt rarely helps and hides the real problem, which is usually an unclear brief.

## Review rules

- Do not accept output nobody can explain.
- Large generated bundles are rejected. Split them first.
- A reviewer who did not write the code runs the checklist and counts the tells.
- The review states which tells were removed and which remain, each with a reason.

## Test copy against a competitor

Could a competitor paste this sentence unchanged? If yes, rewrite it with something only this product can say.
