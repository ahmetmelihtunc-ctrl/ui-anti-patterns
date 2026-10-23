# Two dashboards compared

This is a prose description of a generic generated dashboard and a cleaned-up version of the same page. It describes common patterns. It does not reproduce any published image or text.

## The generated version

The page opens with a greeting that carries an emoji and the user's first name. Under it sits a row of rounded cards, one per key figure. Each card repeats the same parts. A very large number, a small grey label, a tiny sparkline and a pill showing the change since last week in green or red. The cards have soft deep shadows and sit on a faint tinted background.

The charts use a purple gradient for their bars. A link under the chart reads "View pipeline" with an arrow glyph. Every panel is a card with the same large radius, and some are cards inside cards. Spacing differs from one panel to the next.

Rules involved are `emoji-ui`, `kpi-card-row`, `heavy-shadow`, `nested-cards`, `uniform-radius`, `two-stop-gradient`, `default-chart-palette`, `arrow-suffix`, `off-scale-spacing`.

## The fixed version

A breadcrumb shows where the page sits, and the title states what the page covers. Next to it, a line reads "Updated 4 min ago" with the source of the data.

The key figures sit in one flat strip inside a single bordered container, separated by thin dividers. A figure may hold a small progress bar when the value is a share of a limit. The number is large only where it is the answer. Changes use one restrained highlight colour, and only when they matter.

The container has a small radius. A single accent colour marks the main action. The chart colours come from tokens with a stated meaning. Below the strip, a real table lists items with right-aligned numeric columns so digits line up. The page is dense but ordered, and spacing follows one scale.

## What changed and why

| Aspect | Generated | Fixed |
|---|---|---|
| Key figures | A card each, with sparkline and pill | One strip with dividers |
| Provenance | None | Source and update time next to the numbers |
| Surfaces | Deep shadows, large radius, cards in cards | Borders, small radius, flat |
| Colour | Gradient bars, several accents | One accent, token-mapped chart colours |
| Detail | Charts only | A table with aligned numbers |
| Navigation | Greeting and arrow links | Breadcrumb and plain link text |

The test is simple. Cover the logo. If the page could belong to any product, it still has slop.
