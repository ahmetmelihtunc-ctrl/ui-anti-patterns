# Fix recipes

Before and after patterns for the rules most often hit. Fix order that pays off most. Spacing, then buttons, then colour. Work by theme and commit each theme on its own.

## Spacing (off-scale-spacing)

```css
/* before */
.card { padding: 13px 22px; margin-bottom: 18px; }
/* after, with tokens on a 4-based scale */
:root { --space-2: 8px; --space-3: 12px; --space-4: 16px; --space-6: 24px; }
.card { padding: var(--space-3) var(--space-6); margin-bottom: var(--space-4); }
```

Tailwind. Replace `p-[13px]` with `p-3` or `p-4`.

## Buttons (hover-opacity, stock buttons)

```tsx
// before
<button className="bg-black text-white hover:opacity-80">Submit</button>
// after
<button className="rounded-md bg-blue-700 px-4 py-2 text-white hover:bg-blue-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 active:bg-blue-900">
  Save changes
</button>
```

Give the label a real verb phrase and a visible focus state.

## Colour (default-indigo, two-stop-gradient, gradient-text)

```css
/* before */
.hero { background: linear-gradient(135deg, #667eea, #764ba2); }
.hero h1 { background-clip: text; -webkit-background-clip: text; color: transparent; }
/* after */
.hero { background: var(--surface-subtle); }
.hero h1 { color: var(--text-strong); font-size: 2rem; font-weight: 600; }
```

Tailwind. Replace `bg-gradient-to-r from-purple-500 to-blue-500` with a token such as `bg-surface`. Replace `bg-clip-text text-transparent` with `text-strong`.

## Cards (nested-cards, left-border-accent, heavy-shadow, frosted-glass)

```tsx
// before
<div className="rounded-xl border-l-4 border-blue-500 bg-white/10 p-6 shadow-2xl backdrop-blur-md">
// after
<section className="border-t border-slate-200 pt-6">
```

Group with whitespace and a divider. If the card is needed, use a solid background, a 1 pixel border and a small radius. For severity use an icon with a text label next to the message, not a coloured edge.

## KPI cards (kpi-card-row)

```tsx
// before: one card per figure
<div className="grid grid-cols-3 gap-4">
  <div className="rounded-xl p-6 shadow-lg"><p className="text-4xl">42</p><p className="text-sm">Clusters</p></div>
  ...
</div>
// after: one strip with dividers and provenance
<dl className="grid grid-cols-3 divide-x divide-slate-200 rounded-md border border-slate-200">
  <div className="px-4 py-3"><dt className="text-sm text-slate-600">Clusters</dt><dd className="text-xl font-semibold tabular-nums">42</dd></div>
  ...
</dl>
<p className="mt-2 text-xs text-slate-600">Updated 4 minutes ago from the inventory service</p>
```

## Icon-card rows (icon-card-row)

Count the real points. If there are four, show four. Make the most important one larger. Remove icons that do not match what they label. A plain list with bold lead-ins often replaces the whole row.

## Eyebrow pills (eyebrow-pill)

```tsx
// before
<span className="rounded-full bg-blue-50 px-3 py-1 text-xs">New release</span>
<h1>Scans</h1>
// after
<h1>Scans</h1>
```

If the label is real information (a version), move it into the page header or next to the title as plain text.

## Emoji and icons (emoji-ui)

```tsx
// before
<h2>(rocket emoji) Features</h2>
// after
<h2>What it checks</h2>
```

Use the project icon set in `currentColor`, only when the icon matches its label.

## Motion (scroll-entrance, cursor-glow, floating-animation)

Delete the wrapper component and render the content directly. Keep motion that answers a click or a change of state, and wrap the rest in `@media (prefers-reduced-motion: no-preference)`.

```css
@media (prefers-reduced-motion: no-preference) {
  .drawer { transition: transform 160ms ease-out; }
}
```

## Contrast (low-contrast, tiny-font)

```css
/* before */
.meta { font-size: 10px; color: #999999; background: #ffffff; }
/* after, 12px at a ratio of 7.0 */
.meta { font-size: 12px; color: #595959; background: #ffffff; }
```

Check both themes. Do not rely on opacity to dim text.

## Charts (default-chart-palette)

```ts
// before
const colors = ["#36a2eb", "#ff6384", "#ffcd56", "#4bc0c0"];
// after, each colour has a stated meaning
const colors = { critical: tokens.sevCritical, high: tokens.sevHigh, medium: tokens.sevMedium, low: tokens.sevLow };
```

## Typography (default-font-only, mono-heading, accent-word-heading, caps-tracked)

Define roles once.

```css
:root {
  --font-display: "Your Display", serif;
  --font-body: "Your Body", sans-serif;
  --font-mono: "Your Mono", monospace;
}
h1, h2, h3 { font-family: var(--font-display); }
```

Use one colour and one style per heading. Replace tracked caps labels with sentence case at a readable size.

## Copy (em-dash, buzzword, invented-metric, placeholder-copy, punctuation rules)

| Before | After |
|---|---|
| `Fast and simple, no setup required` | `Starts scanning after you add one cluster` |
| `Supercharge your workflow` | `Block risky images before they deploy` |
| `10x faster scans` | `Scans 120 images in 4 minutes on the demo cluster` (state the real source) |
| `Scan finished; review the results below` | `Scan finished. Review the results below.` |
| `Status: ready to deploy` | Field caption "Status" with the value "Ready to deploy" |
| `Cluster - production` | `Production cluster` |
| `View all scans ->` | `View all scans` |

For empty states, name the next action. "No scans yet. Add a cluster to run the first one."

## Safe mechanical fixes

`--fix-safe` handles only two changes. A spaced em dash in a text node becomes a comma, and an arrow glyph at the end of a text node is removed. Both change copy only, never code or attributes. Review the diff, because tests that assert on the old text will need an update. Everything else needs judgement.
