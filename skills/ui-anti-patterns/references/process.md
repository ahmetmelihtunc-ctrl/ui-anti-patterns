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

## States and data display

Decide the look of every state before building the screen, because a missing state is filled with whatever the framework renders by default. Each state below has its own look, and none may borrow another's.

| State | Show it as | Never |
|---|---|---|
| Real zero | the number, in the normal style ("0", "0 critical") | dimmed to look missing, or coloured as an alert |
| Missing, not applicable | a small grey dash | a dash at full value size, which reads as loading |
| Unknown, not measured | the words "Not scanned" or "Unknown" with the reason | a green "OK" or a zero |
| Loading | the final layout with flat bars at real size, rows keeping their pitch | a spinner in the middle of content, or layout shift when data lands |
| Error | one sentence inside the block that failed, with the time of the last good data and a retry control | a full-screen banner, or an empty value |
| Stale | a freshness stamp ("Updated 09:14") and a refresh control, or a quiet notice when it cannot refresh | fresh-looking numbers with no time |
| Empty | the frame and header stay and one sentence says what to do next | a decorative illustration, or "nothing here" |

Rules for tables and figures.

- Right-align numbers and use tabular figures, so digits line up and sizes compare at a glance.
- Use a fixed number of decimals per column, and one unit per column, written in the header.
- Show KPIs as one strip in a single bordered container with dividers, not one card per figure. The figure that answers the screen's question leads by at least one size step.
- State the window of every delta ("+4 vs last 7 days"). A change from nothing is "+4 (new)" or a dash, never "up 100 percent".
- Use status colour only for status. Green and red do not mark a zero or an undefined change. Do not colour a number just because it is large.
- Counts are recomputed from the rows in the current view, so a filter changes the totals.
- A limit or usage bar is drawn at the true ratio with both ends labelled.
- Show provenance next to a figure that someone might act on, such as its source and the time it was taken.

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
