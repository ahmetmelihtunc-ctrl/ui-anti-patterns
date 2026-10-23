# Vocabulary

Vague requests such as "make it feel more designed" or "it looks AI-made" cannot be acted on. A name for the exact problem can. Use this file to turn a loose complaint into one element, one rule or check, and one fix. Name the element, say which rule applies, and change that one thing.

Many of these names are shared across design tools and critique writing. They are mapped here onto this skill's rule ids, so a report from any source can be turned into work with `rules.md` and `fixes.md`. See `NOTICE` for the sources whose ideas shaped the list.

## Loose requests and the mode that answers them

| The request sounds like | Mode | What to do |
|---|---|---|
| critique, review, audit | CHECK | Run the linter, then the rendered pass in `rendered-pass.md`, then `checklist.md` |
| polish, tidy, quieter, clearer, tighten the type, fix the layout, fix the colour | FIX | Pick the theme, use `fixes.md`, one theme per commit |
| plan the screen, name its one question | plan first | `process.md`, then write tokens and a reference screen |
| keep it from coming back | GUARD | The hooks and baseline described in `docs/README.md` |
| make it bolder, add delight, add effects, animate it | not a slop fix | Decide the intent first. On working screens, see the last section |

## Named problems and the rule that covers them

A dash means no static rule exists. The rendered pass (`rendered-pass.md`) or the checklist covers it, and the second column says which.

### Colour

| Named problem | Plain description | Rule or check |
|---|---|---|
| AI palette, purple | violet, indigo or cyan on dark as the accent | `default-indigo`, `two-stop-gradient` |
| Cream palette | warm off-white ground with a clay accent used by reflex | `cream-clay-palette` |
| Glow, halo, spotlight | coloured shadows or radial washes behind content | `neon-glow`, `gradient-orb`, `radial-glow-background` |
| Colour sprawl | strong colour covers more than a small share of the first screen | `accent-overuse`, rendered pass (colour share) |
| Rainbow chart | more than four series hues, a hue per bar | `default-chart-palette`, rendered pass (chart hues) |
| Framework default colours | stock blue, green, red and amber hexes as status colours | `hex-excess`, `default-chart-palette` |
| Grey on colour | grey text on a tinted or coloured surface | `low-contrast`. Use a darker shade of the surface hue |
| Accent on chrome | accent used for nav rows, tabs and every button | `accent-overuse` |
| Status colour on zero | a green "+0" or red "0.00%" for no change | rendered pass (status colour on zero) |

### Type

| Named problem | Plain description | Rule or check |
|---|---|---|
| Flat hierarchy | adjacent sizes too close to tell roles apart | `weak-hierarchy` |
| Default font only | the framework default face with no role scale | `default-font-only` |
| Mono as costume | monospace used to look technical instead of for identifiers | `mono-heading`. Mono is right for digests, ids, versions and code |
| Accent word | one word in a headline given another colour, italic or face | `serif-italic-emphasis`, `accent-word-heading` |
| Kicker, eyebrow | tiny tracked caps label above a heading | `eyebrow-pill`, `caps-tracked` |
| Tracked caps | letter-spaced uppercase labels scattered around | `caps-tracked` |
| Crushed tracking | letter spacing so tight that glyphs merge | `extreme-negative-tracking` |
| Tiny text | text below the floor | `tiny-font`, rendered pass (tiny text) |
| Straggler | one word alone on the last line | none. Use `text-wrap: pretty` or `balance` |
| Numerals that do not line up | proportional digits in a column of figures | `missing-tabular-nums`, rendered pass (numeric alignment) |

### Components and layout

| Named problem | Plain description | Rule or check |
|---|---|---|
| Side tab, border accent | thick coloured border on one side of a card | `side-border-accent` |
| Icon tile stack | icon in a tinted square above a heading, or on every KPI | `icon-card-row`, rendered pass (icon chips) |
| Hero-metric template, KPI card row | big number, small label, sparkline, delta pill, one card per figure | `kpi-card-row` |
| Nested cards | a card inside a card | `nested-cards` |
| Identical card grids | same-size cards as the page structure | `icon-card-row`, `nested-cards` |
| Ghost card | hairline border plus wide soft shadow | `ghost-card`, `heavy-shadow` |
| Block shadow | hard offset shadow with no blur | `hard-offset-shadow` |
| Grid wallpaper | blueprint lines behind the page | `grid-line-background` |
| Stripe wallpaper | diagonal stripes or dot fields as a surface | `stripes-gradient` |
| Ragged row | peer cards in one row end at different heights | rendered pass (ragged rows) |
| Panel void | a blank band inside a stretched card | rendered pass (blank bands) |
| Unused canvas | a dead strip beside the content | rendered pass (dead canvas) |
| Uniform radius | one medium radius on every element | `uniform-radius`, rendered pass (radius mix) |
| Monotonous spacing | one spacing value everywhere | `off-scale-spacing` covers off-scale values only. The checklist asks for rhythm |
| Heading rhythm | a heading closer to the block above than to its own content | rendered pass (heading rhythm) |
| Modal by reflex | a dialog for a task that needs no interruption | checklist |
| Clipped overlay | a dropdown cut off by an `overflow` ancestor | rendered pass (clipped overlays) |
| Focus removed | the keyboard focus indicator taken away | `focus-ring-removed` |

### Motion

| Named problem | Plain description | Rule or check |
|---|---|---|
| Scroll entrance, section fade | every block fades in on scroll | `scroll-entrance` |
| Content hidden at rest | text stays at opacity 0 when the reveal fails | `scroll-entrance` (partly), rendered pass (content hidden) |
| Bounce, elastic easing | curves that overshoot | `bounce-easing`, `floating-animation` |
| Pulsing dot | a decorative "live" pulse | `pulsing-status-dot` |
| Marquee | an auto-scrolling strip | `marquee` |
| Animate everything | `transition: all`, slow-start easing, scale from zero | `transition-all`, `ease-in-ui`, `scale-zero-entrance` |
| Cursor glow | light that follows the pointer | `cursor-glow` |
| Hover is only a fade | no real state change | `hover-opacity` |

### Copy

| Named problem | Plain description | Rule or check |
|---|---|---|
| Buzzword | genre verbs and adjectives | `buzzword` |
| Aphoristic cadence | "Not X. Y." and "No X. No Y." endings repeated across sections | `aphoristic-cadence` |
| Invented proof | made-up customers, logos, numbers | `invented-metric`, `placeholder-copy` |
| Textbook sample data | John Doe, Acme Inc, 123 Main Street | `placeholder-person-data` |
| Performative labels | "field notes", "quietly trusted by" | `buzzword` (partly) |
| Dash habit | a dash used for cadence | `em-dash`, `label-dash`, `punct-dash-separator` |
| Generic button label | "Get started", "Learn more", "Submit" | checklist (buttons name the action) |

## Design moves

Use these names in briefs and reviews. Each is a move that changes one thing.

| Move | Meaning | Where it lives here |
|---|---|---|
| Squint test | blur your attention and see whether primary, secondary and groups still read in order | rendered pass |
| Proximity before containers | group by closeness first, add a card or border only if closeness fails | `nested-cards`, `fixes.md` |
| Rhythm | tight inside groups, generous between them, more space above a heading than below | `off-scale-spacing`, rendered pass |
| Elevation declared once | an element has a border or a shadow, not both. Overlays float, resting things do not | `ghost-card`, `heavy-shadow` |
| One authored moment | at most one deliberate piece of motion per surface, the rest answers actions | `scroll-entrance`, `floating-animation` |
| Placed space versus leftover space | emptiness from a grid and repeated gaps reads as calm, emptiness from mismatch reads as unfinished | rendered pass |
| The screen's one question | name the question the screen answers and make the biggest block answer it | `process.md` |
| The one finding | the single fact in today's data that needs attention, shown where it is read first | `process.md` |
| Answer figure leads | the number that answers the title sits at least a step above sibling figures | `checklist.md` |
| Density is three settings | row pitch, padding and type size move together | `checklist.md` |
| Competitor test | paste a rival's name into the sentence and rewrite it if it still works | `process.md` |
| Cover the logo | would the screenshot be mistaken for another product | `checklist.md` |
| Narrowest ignore | prefer an ignore for one value on one line, with a reason | `ui-slop-ignore <rule>: reason` |

## State vocabulary

The states of a data screen are described in `process.md`. Use the names exactly. They are real zero, missing, unknown, loading, error, stale and empty. Each has its own look and none may borrow another's.

## Working screens versus persuasive pages

Some tells are only tells on a landing page. A tracked label above a heading may be real navigation in a console, a monospace heading may be a resource name, and tight leading is normal in a table. The `operate` profile in `SKILL.md` encodes that. Keep these cautions in mind when reading advice written for public pages.

- Line length rules apply to prose, not to tables or log lines.
- Picture quotas, motion quotas, "fullness" checks and headline line limits are landing page rules.
- A tracked caps label or a side border that encodes real information is allowed. Mark it with a reason.
- A pulsing dot is allowed when it is tied to a real heartbeat or live feed. Mark it with a reason.
- "Security theater" and similar terms of art are domain words. Do not flag them as buzzwords.
- Do not replace the product's own typeface because a rule calls it common.
- Effects that add expression without information (bolder passes, parallax, scroll scenes) are a decision for the owner of the product, not a cleanup.
