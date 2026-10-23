# Rendered pass

The linter reads source text, so it cannot see what the page looks like. This pass is done by a person or an agent on screenshots. It catches the problems that only show up once the layout is on a screen.

## How to run it

1. Take screenshots at 1440 by 900 and at 390 by 844, in each theme the product ships. Capture the populated state and also the empty, loading, error and stale looks if the screen has them.
2. Go through the checks below in order. Write one line per check, either "ok" or what is wrong and where.
3. Fix the worst three, take new screenshots, and look again. Stop after three rounds. A fourth round rarely helps and usually means the brief is unclear.
4. Add the tells found to the count in `checklist.md`.

Thresholds are rules of thumb. A screen can break one on purpose, and then it deserves a note saying why.

## Layout

- [ ] **Shared edges.** Blocks share the same left and right edges. No orphan cell, no stray indent.
- [ ] **Ragged rows.** Peer cards in one row end at the same height. If they cannot, they should not look like peers.
- [ ] **Blank bands.** No empty band taller than about 40 pixels inside a card. A stretched card with a short body is the usual cause.
- [ ] **Dead canvas.** At 1100 pixels wide or more, no unused strip beside the content that takes more than about a tenth of the width.
- [ ] **Heading rhythm.** There is more space above a heading than below it, so the heading belongs to what follows.

## Numbers

- [ ] **Numeric alignment.** Columns of figures are right-aligned. If six or more numeric cells are left-aligned, fix it.
- [ ] **Tabular figures.** Digits have equal width, so columns line up. Look at a column of figures with different digits.
- [ ] **Fixed decimals.** Every figure in a column has the same number of decimals and the same unit.
- [ ] **Figures that repeat.** A number that appears twice on the screen shows the same value both times.

## Colour and charts

- [ ] **Chart hues.** No chart uses more than four hues. More than six is a defect.
- [ ] **Colour share.** Strong colour covers no more than about 12 percent of the first screen. Colour is on data, status and the one primary action.
- [ ] **Data has a hue.** A chart or timeline with no hue on its data cannot be read. Give the main series one.
- [ ] **Status on zero.** A zero or an undefined change is not green or red. See the state rules in `process.md`.
- [ ] **Heavy borders.** Three or more panel borders that are clearly darker than their ground make the page look boxed in. Soften them or remove some.
- [ ] **Radius mix.** Panels use no more than three radii, and controls and containers differ on purpose.
- [ ] **Icon chips.** Three or more icons in tinted squares or circles are decoration. Remove them or give them a meaning.

## Phones

- [ ] **Sidebar on a phone.** At 390 pixels the sidebar folds away. It does not take more than about 30 percent of the width.
- [ ] **Sideways scroll.** The page does not scroll sideways at 390 or 768 pixels. A wide table scrolls inside its own container.
- [ ] **Clipped text.** Text is not cut off or colliding with a neighbour without a truncation hint. Menus and popovers are not clipped by an ancestor.
- [ ] **Readable type.** No rendered text is smaller than 11 pixels, and not more than about 45 percent of the text is below 13 pixels.
- [ ] **Targets.** Controls are at least 44 pixels in each direction.

## States and access

- [ ] **States differ.** Empty, loading, error and stale looks all exist and are visibly different from each other and from the populated state.
- [ ] **Keyboard tour.** Tab through the page. Focus is visible on every control in every theme.
- [ ] **Nothing hidden at rest.** Large text is not still at opacity 0 or hidden after the page has loaded.
