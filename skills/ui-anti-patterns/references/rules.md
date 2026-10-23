# Rule catalogue

Each rule has an id, a default severity, and a short entry. Ids are the names used in reports, in `ui-slop.config.json` and in ignore comments. Run `node scripts/ui-slop-lint.mjs --list-rules` for the live table.

Rules whose entry carries a **Profile** line are landing-page rules. They are switched off by the `operate` profile, which is meant for working screens such as consoles and dashboards. See the profile section of `SKILL.md`.

Terms used throughout. A **finding** is one reported problem at one location. A **rule** is one detection. The **baseline** is a file that records existing findings so only new ones fail. **Severity** is P0, P1 or P2.

## Colour

### default-indigo (P1)
**What.** The Tailwind indigo or violet defaults used as an accent (for example `#6366f1`, `#4f46e5`, `#8b5cf6`, `#7c3aed`, `#a855f7`) or the `indigo-*`, `violet-*`, `purple-*` utility classes.
**Why it reads as generated.** These are the most common accent in generated pages because they are the framework default. Seeing one tells the viewer that no colour decision was made.
**Detect.** Hex match outside files listed in `tokenFiles`, and utility-class match.
**Fix.** Define the product accent as a token and reference the token. Remove the default.
**Exceptions.** A third-party brand colour in a logo. Mark it with an ignore comment.

### two-stop-gradient (P1)
**What.** A gradient whose stops run between purple, blue, cyan or pink hues, in CSS or in Tailwind `from-*` and `to-*` classes.
**Why.** The purple-to-blue "trust" gradient is the signature of template output.
**Detect.** Parses each gradient, converts stops to hue, flags stops at least 20 degrees apart inside the 180 to 345 degree band. Same-hue tonal ramps pass.
**Fix.** Use a flat surface from the palette.
**Exceptions.** Gradients that encode a data scale in a chart or heat map.

### gradient-text (P1)
**What.** Text filled by a gradient (`bg-clip-text` with `text-transparent`, or `background-clip: text`).
**Why.** It is decoration on the one element that should be most legible.
**Fix.** Solid colour. Create emphasis with size and weight.
**Exceptions.** A loading shimmer on placeholder text. Mark it with a reason.

### cream-clay-palette (P2)
**What.** A warm off-white ground (hue 35 to 60, lightness 0.93 to 0.99, moderate saturation, for example `#faf7f2`) together with a terracotta or clay accent (hue 10 to 30, for example `#c2410c`) in the same file.
**Why.** Cream paper with a clay accent is the current editorial default of generated pages. Either colour alone is fine. The pair is the tell.
**Detect.** Both colours in one file. Neutral greys, amber tints, gold on a dark ground and print stylesheets pass.
**Fix.** Derive the ground and accent from the brand and the use case. Keep the pair only when the brand really is paper and clay, and mark it with a reason.
**Limit.** Token files that define the two colours in different files are not matched.

### default-chart-palette (P2)
**What.** Two or more colours from the default palettes of common chart libraries in one file, or a palette array of raw hex values outside a token file.
**Why.** Charts that keep library defaults look the same in every product and carry no meaning.
**Fix.** Map series colours to tokens with a stated meaning, either status or category.

### hex-excess (P2)
**What.** More than `maxHexPerFile` (default 12) raw hex literals in one file outside token files.
**Why.** It shows colours chosen ad hoc instead of from a system.
**Fix.** Move values to tokens. Allowlist theme files with `tokenFiles`.

### accent-overuse (P2)
**What.** An accent token (names set by `accentTokens`) used more than `maxAccentPerFile` times in one file.
**Why.** When everything is accented, nothing is.
**Fix.** Reserve the accent for the primary action and one status signal per view.

### low-contrast (P0)
**What.** A text colour and a background colour that are both literals on the same element or in the same rule, with a WCAG ratio below 4.5 (below 3 for large text). Checks CSS blocks, inline styles and Tailwind classes, including `dark:` pairs.
**Why.** Dark themes with grey-on-near-black text are a frequent generated default and fail readers in bright light.
**Detect.** Computes the ratio. Skips disabled controls. Placeholders drop to P2.
**Fix.** Raise the text colour until the ratio passes, in both themes.
**Exceptions.** Disabled controls and purely decorative text.

## Typography

### tiny-font (P1)
**What.** A font size below `minFontPx` (default 11).
**Why.** Dense dashboards drift to 9 and 10 pixel labels that are unreadable on phones.
**Fix.** Raise to the minimum or remove the text.

### default-font-only (P2)
**What.** Every font family in the project is a default (Inter, Roboto, system-ui, Arial and similar) and nothing defines a second role.
**Why.** A single default font with no type scale is the common baseline of generated pages.
**Detect.** Project-level. Any `var(--...)` family counts as a deliberate choice.
**Fix.** Choose a type pair with distinct roles and define a scale.

### serif-italic-emphasis (P2)
**What.** One word of a heading wrapped in `em`, `i` or an italic or serif span.
**Why.** Single-word emphasis in a headline is a stock flourish.
**Fix.** Keep the heading in one style and state the claim plainly.
**Profile.** Off in the `operate` profile.

### accent-word-heading (P2)
**What.** One or two words of a heading given their own colour, mono font or underline.
**Why.** Same flourish as above with colour instead of italics.
**Fix.** One colour per heading.
**Profile.** Off in the `operate` profile.

### mono-heading (P2)
**What.** Headings set in a monospace font.
**Why.** Mono makes a page look technical without saying anything. It is for identifiers, versions, hashes and code.
**Fix.** Use the sans or display role for headings.
**Profile.** Off in the `operate` profile.

### caps-tracked (P2, P1 above the limit)
**What.** Uppercase text with letter spacing, used as a label. Findings turn P1 when a file has more than `maxCapsLabels` (default 3).
**Why.** Tracked caps labels above every block are decoration, not structure.
**Fix.** Sentence case. Keep caps for real abbreviations.

### extreme-negative-tracking (P2)
**What.** Letter spacing below -0.05em, for example `letter-spacing: -0.08em`, `tracking-[-0.07em]` or `letterSpacing: "-0.1em"`. Pixel values count only when the same rule declares a pixel font size.
**Why.** Glyphs touch and merge, which slows reading and looks like a style applied without checking the result.
**Detect.** The standard `tracking-tight` (-0.025em) and `tracking-tighter` (-0.05em) pass, as does any value at or above -0.05em.
**Fix.** Use -0.02em to -0.04em on large display type and 0 on everything else.

### weak-hierarchy (P2)
**What.** A file with at least 12 text-size classes that uses two or fewer sizes and one weight.
**Why.** Without contrast between levels the reader cannot find the main point.
**Fix.** Give each level a distinct size and weight and enlarge the most important item.

## Components and layout

### focus-ring-removed (P0)
**What.** `outline: none`, `outline: 0`, `outline-none` or `focus:outline-none` with no replacement focus style.
**Why.** Keyboard users lose track of where they are. This is an access failure, so it is P0.
**Detect.** CSS rules and Tailwind class strings. A replacement is a box shadow, border or non-empty outline on a `:focus` or `:focus-visible` rule, or a `focus:ring`, `focus-visible:outline`, `focus:border` or `focus:bg` class within four lines, or any `focus-within:` class in the file. Elements with `tabIndex={-1}`, `:focus:not(:focus-visible)` rules and `outline-hidden` pass.
**Fix.** Replace it, never remove it. `focus-visible:ring-2 focus-visible:ring-offset-2`, or `:focus-visible { outline: 2px solid var(--focus); outline-offset: 2px; }`.
**Limit.** A global focus style defined in another file is not seen. In that case add an ignore comment with that reason, or lower the rule in the config.

### emoji-ui (P1)
**What.** Emoji inside headings, buttons, list items and labels, or label strings that start with an emoji.
**Why.** Emoji used as icons look different on every platform and signal a missing icon system.
**Detect.** Unicode emoji presentation characters. Plain symbols such as the check mark and copyright sign pass. Files in `emojiAllowFiles` are skipped.
**Fix.** Use the project icon set or no icon.
**Exceptions.** Emoji that are user data, for example a flag in a country list.

### frosted-glass (P1)
**What.** Backdrop blur on a surface (`backdrop-filter`, `backdrop-blur-*`).
**Why.** Glass cards cost contrast and performance and add nothing to the content.
**Fix.** Solid background.
**Exceptions.** Full-screen modal scrims, and `backdrop-filter: none` resets.

### side-border-accent (P1)
**What.** A thick coloured border on one side of a card or alert, on the left or on the right.
**Why.** It is the canonical generated dashboard tile. The right-hand version is the same habit mirrored.
**Detect.** A side border of 2 pixels or more in CSS, inline styles and Tailwind (`border-l-4`, `border-r-4`, `border-e-4`, `border-right: 3px solid`). Transparent borders and 1 pixel dividers pass.
**Fix.** Build hierarchy with spacing and type.
**Exceptions.** A border that encodes alert severity. Mark it with a reason.
**Alias.** Before version 0.2.0 this rule was called `left-border-accent`. The old id still works in ignore comments, in `rules` overrides and in existing baselines.

### heavy-shadow (P2, P1 above the limit)
**What.** Large shadows (blur of 24 pixels or more, offset of 12 or more, Tailwind `shadow-xl` and `shadow-2xl`). Findings turn P1 when a file has more than `maxHeavyShadows` (default 4).
**Why.** Soft heavy shadows on every card are a default of template kits.
**Fix.** Border or tonal step. Keep shadows for overlays.
**Exceptions.** Menus, popovers, dialogs and drawers.

### hard-offset-shadow (P2)
**What.** A shadow with no blur and an offset of 4 pixels or more on both axes, such as `6px 6px 0 #000`.
**Why.** It is the block shadow of one specific style, applied by reflex to every card. It reads as a costume.
**Detect.** Parses `box-shadow`, inline `boxShadow` and Tailwind `shadow-[...]`. Inset shadows, hairline offsets, one-axis bottom edges and focus rings pass.
**Fix.** A border, or no elevation at all.
**Exceptions.** A product whose brand is built on the style. Mark it with a reason.

### ghost-card (P2)
**What.** A resting card that has both a visible border and a wide soft shadow (blur of 16 pixels or more, or `shadow-lg`, `shadow-xl`, `shadow-2xl` next to a `border` class).
**Why.** Two elevation cues on one surface add weight without adding meaning. Declare elevation once.
**Detect.** A CSS rule with a solid border and a wide shadow, or a class string with both. Overlays (menus, dialogs, popovers, drawers) pass, as do small shadows and hover-only shadows.
**Fix.** Keep the border and drop the shadow. Keep shadows for things that float.

### neon-glow (P2)
**What.** A saturated coloured glow with no offset (box-shadow or Tailwind coloured shadow).
**Why.** Neon edges on dark backgrounds are a stock "futuristic" look.
**Fix.** Plain border and a solid focus ring.
**Exceptions.** Focus rings with zero blur radius pass.

### nested-cards (P2)
**What.** A card-like container inside another card-like container, or more than `maxCardsPerFile` (default 12) card-like containers in one file.
**Why.** Wrapping everything in a card removes the grouping signal that cards were meant to give.
**Detect.** Tag-stack parsing of JSX and HTML. Buttons, links, spans and padded callouts are not counted as cards.
**Fix.** Use whitespace, dividers and tables.

### uniform-radius (P2)
**What.** The whole project uses one large corner radius (8 pixels or more) in at least 8 places.
**Why.** One radius on every element removes the distinction between controls and containers.
**Detect.** Project-level.
**Fix.** At least two steps, a small one for controls and a larger one for containers, or tight corners everywhere.

### icon-card-row (P2)
**What.** Three sibling cards that each hold an icon, a title and a paragraph, or three data items with `icon`, `title` and `description`.
**Why.** The three-up feature row is the most common generated section.
**Fix.** State the real number of points, make the main one larger, drop icons that carry no meaning.
**Profile.** Off in the `operate` profile.

### missing-tabular-nums (P2, project level)
**What.** The project renders table cells that look numeric (right-aligned cells, digit-only cells, or cells filled by values named count, total, size, latency and similar) and no file sets tabular figures anywhere.
**Why.** Proportional digits make columns of numbers ragged, so the eye cannot compare them.
**Detect.** Reported once per project, at the first numeric table cell. Any `tabular-nums`, `font-variant-numeric`, `tnum` or `font-feature-settings` in the project clears it, as does a monospace face on the numeric cell or the option `figureFace` set to `mono`.
**Fix.** `font-variant-numeric: tabular-nums` on figures, plus right alignment and a fixed number of decimals.
**Limit.** A heuristic. It cannot tell whether the cell really holds a number or whether the inherited font already has fixed-width digits.

### kpi-card-row (P2)
**What.** Three or more sibling cards that each hold one large number and a small label, or KPI data items that carry value, label and delta.
**Why.** A card per figure spreads related numbers apart and makes the number the hero when it is not the answer.
**Fix.** One flat strip in a single bordered container, with dividers between figures and provenance beside the numbers. See `slop-vs-fixed-dashboard.md`.

### eyebrow-pill (P2)
**What.** A pill or "eyebrow" label placed directly above an `h1` or `h2`.
**Why.** A badge over the headline adds a second headline.
**Fix.** Lead with the heading. Fold real information into the heading or page chrome.
**Profile.** Off in the `operate` profile.

### small-touch-target (P2)
**What.** A button whose width and height are both determinable and both below `minTouchPx` (default 44).
**Why.** Small targets fail on phones.
**Fix.** Enlarge, or pad the hit area.

### off-scale-spacing (P2)
**What.** Arbitrary margin, padding or gap values that are not on the spacing scale (default 4, 8, 12, 16, 24, 32, 48, 64, plus multiples of 16 from 64 up, plus 0, 1 and 2).
**Why.** Uneven spacing is one of the strongest signals of unconsidered layout.
**Fix.** Use scale values or spacing tokens.

## Motion and finish

### scroll-entrance (P1 for framework triggers, P2 for class heuristics)
**What.** Sections that fade or slide in on scroll (`whileInView`, `data-aos`, `opacity-0` with `translate-y`, fade-in helpers).
**Why.** Entrance animation on every section delays content and signals a template.
**Fix.** Render in place. Animate only in response to a user action and honour `prefers-reduced-motion`.

### cursor-glow (P1)
**What.** A pointer-move handler that sets CSS variables used by a radial gradient.
**Fix.** Remove it. Use a visible focus ring and a real hover state.

### hover-opacity (P2)
**What.** A button whose only hover change is opacity.
**Why.** A fade is not a state change and gives no focus information.
**Fix.** Change background, border or underline and keep a visible focus style.

### floating-animation (P2)
**What.** Infinite float, bob or bounce animations, or keyframes that move an element up and down forever.
**Fix.** Remove ambient motion.
**Exceptions.** Spinners and skeleton pulses for loading.

### gradient-orb (P1)
**What.** Large blurred absolute elements used as glow backgrounds.
**Fix.** Flat surface behind application content.

### radial-glow-background (P2)
**What.** A radial gradient that fades a saturated colour into transparent, used as a page, section or hero background (CSS or a Tailwind arbitrary value).
**Why.** It is the spotlight wash behind a headline. It adds mood and no information. It sits next to `gradient-orb` (blurred elements) and `neon-glow` (shadows).
**Detect.** First stop saturated and visible, last stop transparent. Grey scrims, vignettes, two opaque stops and any file named like a chart, graph, heat map or map pass.
**Fix.** A flat page surface. Put the single accent on the one action that matters.

### grid-line-background (P2)
**What.** Blueprint grid lines as a background, made from two stacked 1 pixel linear gradients with a `background-size`, or a `bg-grid` utility.
**Why.** It is a stock "technical" texture that says nothing about the product.
**Detect.** Two or more `linear-gradient` layers with a 1 pixel stop and a pixel `background-size`. Files named like a canvas, graph, topology, blueprint, chart, editor or map pass, and so does a single ruled-line gradient.
**Fix.** A flat surface. Keep a grid only where the grid is the content.

### stripes-gradient (P2)
**What.** `repeating-linear-gradient` or `repeating-radial-gradient` used as a surface.
**Why.** Diagonal stripes and dot fields are decoration in the same family as grain and grid backgrounds.
**Detect.** Skipped when the nearby lines mention a progress bar, chart, legend, hatch, meter, skeleton or loading state.
**Fix.** A flat surface or a tonal step.

### grain-noise (P2)
**What.** Noise or grain textures (`feTurbulence`, noise images).
**Fix.** Flat surface.

### decorative-blob (P2)
**What.** References to, or files named like, blob or wave graphics.
**Fix.** Remove, or replace with a graphic that explains the product.

### pulsing-status-dot (P2)
**What.** A small rounded dot (12 pixels or less) that pulses or pings forever, such as `animate-ping` or `animate-pulse` on a `h-2 w-2 rounded-full` span, or a dot with an infinite pulse keyframe.
**Why.** A pulse that is not tied to a real signal is decoration that claims liveness. Constant motion also pulls the eye away from the data.
**Detect.** Small dot plus a ping or pulse animation. Skeleton bars, avatars, spinners and larger blocks pass.
**Fix.** A static dot with a text label such as "Connected", plus the time of the last update.
**Exceptions.** A heartbeat from a real feed. Mark it with a reason that names the data source.

### marquee (P2)
**What.** An auto-scrolling strip, such as the `marquee` element, an `animate-marquee` class, or a track that slides sideways forever with a linear keyframe.
**Why.** It hides most items most of the time, cannot be paused by default, and is the standard logo-strip filler.
**Detect.** The element, a class or animation named marquee, or keyframes that translate by half or all of the track and run linear infinite.
**Fix.** A static row or grid. If items must scroll, use a scrollable container that the user controls.

### transition-all (P2)
**What.** `transition: all`, `transition-property: all` or the Tailwind `transition-all` class.
**Why.** It animates every property that changes, including layout, and hides which change was intended.
**Fix.** Name the properties, for example `transition: opacity 150ms, transform 150ms`, or use `transition-colors` or `transition-opacity`.

### ease-in-ui (P2)
**What.** `ease-in` (not `ease-in-out`) on a transition, the matching Tailwind class, the curve `cubic-bezier(0.4, 0, 1, 1)`, or `ease: "easeIn"` in a motion library.
**Why.** A slow start makes a control feel late. Things that appear should decelerate.
**Detect.** Transitions only. An `animation` that exits with `ease-in` passes.
**Fix.** `ease-out` for entrances and state changes, `ease-in-out` for moves.

### scale-zero-entrance (P2)
**What.** An element that starts at `scale(0)`, `scale-0` or `scale: 0`.
**Why.** Growing from a point looks like a template popover. A small change in scale together with opacity feels natural.
**Fix.** Start at 0.95 to 0.98 with opacity 0, and anchor the transform origin to the trigger.
**Exceptions.** A progress bar that grows with `scale-x-0` is not flagged.

### bounce-easing (P2)
**What.** An overshoot curve, for example a cubic-bezier whose second or fourth value is outside 0 to 1, a back, elastic or bounce easing name, or a spring with a bounce of 0.4 or more. The `animate-bounce` utility is covered by `floating-animation`.
**Why.** Overshoot reads as playful. In a work tool it adds delay before the control settles.
**Fix.** An ease-out curve such as `cubic-bezier(0.16, 1, 0.3, 1)`, or a spring with zero bounce.

### placeholder-image (P1)
**What.** Images from placeholder hosts such as Unsplash, placehold.co or picsum.photos.
**Fix.** Ship real assets or draw an honest empty state.

## Copy

### em-dash (P1)
**What.** An em dash in interface text. Lone dashes used as an empty-value marker pass.
**Why.** Heavy em dash use is one of the most recognised marks of machine-written text.
**Fix.** Comma, colon or full stop. `--fix-safe` replaces a spaced em dash in text nodes with a comma.

### label-dash (P1)
**What.** A label in capitals followed by an em dash and a fragment.
**Fix.** A plain label. Put the second part in its own element.

### middle-dot (P2)
**What.** Meta text joined with middle dots.
**Fix.** Separate elements or labelled fields.

### arrow-suffix (P2)
**What.** An arrow glyph at the end of link or button text.
**Fix.** Write a verb phrase. The link style already says it is a link. `--fix-safe` removes the arrow from text nodes.

### placeholder-copy (P1)
**What.** Lorem ipsum, "feature one", "sample content", "your text here" and similar.
**Fix.** Write the real text. An empty state says what to do next.

### invented-metric (P1)
**What.** Marketing-style figures in UI text, such as "10x faster", "99.9% uptime", "trusted by 500 teams".
**Why.** Invented numbers are dishonest and are a top generated tell.
**Fix.** Show a number only when a real source backs it. Label sample data.

### aphoristic-cadence (P2)
**What.** Three or more short rebuttal pairs in one file of copy, such as "Not a X. A Y.", "No X. No Y.", "Less X. More Y." or "X. Just Y.".
**Why.** One such line can be sharp. A page of them is a rhythm that generated copy falls into.
**Detect.** Text nodes and string literals. Single uses, error text such as "Not found. Check the URL." and ordinary empty states pass.
**Fix.** Say what the product does in a plain sentence, with a concrete fact.
**Profile.** Off in the `operate` profile.

### placeholder-person-data (P2)
**What.** Textbook placeholders in UI text, such as John Doe, Jane Smith, Acme Inc, Firstname Lastname or 123 Main Street.
**Why.** They mark a screen whose sample data was never written. Varied, realistic values test a layout better.
**Detect.** Text nodes and string literals. Files under `fixtures`, `mocks` and `seeds` directories, input `placeholder` attributes and comments are skipped. Tests and stories are already outside the default scan.
**Fix.** Write realistic sample data, or label it as sample data.

### buzzword (P2)
**What.** Words such as seamless, robust, leverage, empower, game-changing, cutting-edge, supercharge. "Unlock" and "harness" only count in stock phrases such as "unlock your potential".
**Fix.** Say what the product does in plain words. Edit the list in `options.buzzwords` and `options.buzzwordsExclude`.

## Punctuation

People rarely use semicolons and colons in short everyday interface copy. Writers of generated text use them often, so a screen full of them reads as machine-written. These three rules apply to prose in text nodes, string literals and Markdown. They skip code, CSS, URLs, times, ports, ratios and JSON. Each rule is P2, and all findings of one rule in a file become P1 when the count exceeds `maxPunctPerFile` (default 6).

### punct-semicolon-in-copy (P2)
**What.** A semicolon inside a sentence of interface text.
**Fix.** Split into two sentences, or join the parts with a comma or a full stop.

### punct-colon-in-copy (P2)
**What.** A colon inside a sentence, or a label and value joined by a colon where the layout could carry the label.
**Detect.** Capitalised label followed by a colon and a value, or a colon inside a sentence of four or more words. Times like 12:30, host and port pairs, URLs, code, log calls and object keys pass.
**Fix.** Let the layout carry the label (a definition list, a table column, a field caption), or write a full sentence with a comma or a full stop.

### punct-dash-separator (P2)
**What.** A spaced hyphen or en dash used to separate two parts of a text, for example `Cluster - production`.
**Detect.** Skips numeric ranges, version ranges, negative numbers and compound words.
**Fix.** Comma, full stop, or two elements. Em dashes are covered by `em-dash`.

## Meta

### ignore-without-reason (P1)
**What.** A `ui-slop-ignore` comment with no reason after the colon. The ignore is not honoured.
**Fix.** State why the use is legitimate.

## Configuration options

| Option | Default | Used by |
|---|---|---|
| minFontPx | 11 | tiny-font |
| minTouchPx | 44 | small-touch-target |
| spacingScale | 4, 8, 12, 16, 24, 32, 48, 64 | off-scale-spacing |
| maxHexPerFile | 12 | hex-excess |
| maxCapsLabels | 3 | caps-tracked |
| maxAccentPerFile | 8 | accent-overuse |
| accentTokens | accent, brand, primary | accent-overuse |
| maxHeavyShadows | 4 | heavy-shadow |
| maxCardsPerFile | 12 | nested-cards |
| maxPunctPerFile | 6 | punctuation rules |
| emojiAllowFiles | none | emoji-ui |
| buzzwords, buzzwordsExclude | built-in list | buzzword |
| touchTargets | true | small-touch-target |
| profile | persuade (`operate` for working screens) | rules marked with a Profile line, and the caps limit |
| profileOverrides | none | per-path profile, see docs/README.md |
| figureFace | none (set `mono` when figures use a monospace face by design) | missing-tabular-nums |
