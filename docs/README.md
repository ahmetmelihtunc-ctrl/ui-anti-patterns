# ui-anti-patterns documentation

A Claude Code skill and a linter that find the habits that make an interface look generated, help remove them, and keep them from coming back.

The tool has three parts.

- A **skill** (`skills/ui-anti-patterns`) that tells Claude when and how to check, fix and guard UI work.
- A **linter** (`scripts/ui-slop-lint.mjs`) with 61 rules. It needs Node 20 or newer and has no dependencies.
- **Guards** in `hooks/`. A Claude Code hook, a git pre-commit script, a GitHub Action and a test snippet.

## Install as a Claude Code skill

Copy the skill folder into your skills directory.

```
mkdir -p ~/.claude/skills
cp -R skills/ui-anti-patterns ~/.claude/skills/ui-anti-patterns
```

For a single project, copy it to `.claude/skills/ui-anti-patterns` inside that project instead. The repository also contains `.claude-plugin/plugin.json` with a `skills/` folder, so it can be loaded as a plugin from a marketplace or a local path. That layout follows the format of other installed plugins but has not been tested in every Claude Code version.

Claude loads the skill when your request matches the description in `SKILL.md`, for example "review this UI for AI slop".

## Use the linter

```
node ~/.claude/skills/ui-anti-patterns/scripts/ui-slop-lint.mjs src
```

Common options.

| Option | Meaning |
|---|---|
| `--config <file>` | Config file. Default is `ui-slop.config.json` in the root. |
| `--root <dir>` | Base for relative paths in reports. Default is the current directory. |
| `--json`, `--sarif` | Machine-readable output. |
| `--fail-on P0\|P1\|P2\|none` | Lowest severity that fails the run. Default is P1. |
| `--baseline <file>` | Ignore findings recorded in the baseline. Fail only on new ones. |
| `--update-baseline` | Write all current findings to the baseline file. |
| `--show-baselined` | Also print baselined findings. |
| `--fix-safe` | Show mechanical text fixes. Add `--write` to apply them. |
| `--list-rules` | Print the rule table. |

Exit codes. 0 means clean. 1 means findings at or above `--fail-on`. 2 means a usage or config error.

The linter scans `tsx`, `jsx`, `vue`, `svelte`, `html`, `htm`, `css` and `scss`. Markdown is scanned only for paths listed under `markdown` in the config. It skips `node_modules`, build folders, minified files, tests and stories.

## Configuration

`ui-slop.config.json` in the project root.

```json
{
  "tokenFiles": ["src/styles/tokens.css", "src/lib/theme.ts"],
  "ignore": [{ "path": "src/legacy/**", "reason": "scheduled for removal" }],
  "markdown": ["docs/**/*.md"],
  "rules": { "buzzword": "P1", "uniform-radius": "off" },
  "options": { "minFontPx": 12, "accentTokens": ["accent"], "emojiAllowFiles": ["src/data/flags.tsx"] },
  "baseline": "ui-slop.baseline.json",
  "failOn": "P1"
}
```

- `profile` is `persuade` (default, every rule) or `operate` (working screens, see below).
- `tokenFiles` are the only places where raw hex colours are allowed.
- Every `ignore` object needs a reason.
- `rules` values can be `off`, `P0`, `P1` or `P2`.
- The full option list is in `skills/ui-anti-patterns/references/rules.md`.

### Profiles for working screens and landing pages

A console and a landing page have different jobs, so they need different rules. `operate` is for screens people work in. `persuade` is for pages that argue for something.

```json
{
  "profile": "operate",
  "profileOverrides": [{ "paths": ["app/(marketing)/**", "site/**"], "profile": "persuade" }]
}
```

- `persuade` is the default and runs every rule. Existing projects behave as in 0.1.0 unless they opt in.
- `operate` switches off the rules that only make sense for landing pages (`eyebrow-pill`, `serif-italic-emphasis`, `accent-word-heading`, `icon-card-row`, `mono-heading`, `aphoristic-cadence`) and raises the tracked-caps limit from 3 to 8. An explicit `options.maxCapsLabels` always wins.
- Every other rule stays on, including honesty, access, motion, colour and finish rules.
- `profileOverrides` entries are matched in order by glob. The first match decides.
- `--profile operate` on the command line overrides the config for one run. List the rules with `--list-rules`. Those that the `operate` profile switches off are marked.
- The rule set has no checks for oversized page headings, numbered section labels or heading line length, so the profile has nothing to relax there.

Pick `operate` for a product repo and `persuade` for a marketing site. The default stays strict on purpose, because a missing profile should never hide findings.

### Ignore comments

A legitimate use is marked in place and must carry a reason.

```
/* ui-slop-ignore side-border-accent: encodes alert severity */
{/* ui-slop-ignore frosted-glass: sticky overlay over a map */}
<!-- ui-slop-ignore-file emoji-ui: country names with flags -->
```

The comment covers its own line and the next one. The `-file` form covers the whole file. A comment without a reason is reported as `ignore-without-reason` and is not honoured.

## Baseline workflow

Adopt the linter on a codebase that already has findings without fixing them first.

```
node scripts/ui-slop-lint.mjs src --baseline ui-slop.baseline.json --update-baseline
git add ui-slop.baseline.json
```

From then on, run with `--baseline ui-slop.baseline.json`. Existing findings pass. A new finding fails. When you fix old findings, run `--update-baseline` again so the file shrinks. Findings are matched by rule, file and the text of the line, so moving code does not create new findings, and editing a flagged line does.

## Guards

All guards are examples. None of them changes your settings on its own.

### Claude Code hook

`hooks/ui-slop-hook.mjs` runs after every `Edit`, `Write` or `MultiEdit`. It lints only the changed file and exits with code 2 when the edit adds a new P0 or P1 finding, which sends the message back to Claude so it fixes the code. A finding is new when it is not in the baseline and not already present at git HEAD.

Install by adding this to `~/.claude/settings.json` (all projects) or `.claude/settings.json` (one project). You paste it yourself.

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write|MultiEdit",
        "hooks": [
          { "type": "command", "command": "node \"$HOME/.claude/skills/ui-anti-patterns/hooks/ui-slop-hook.mjs\"" }
        ]
      }
    ]
  }
}
```

The same snippet is in `hooks/claude-code-hook.example.json`. If you merge it into an existing `hooks` object, keep your other entries.

### Pre-commit

```
cp skills/ui-anti-patterns/hooks/pre-commit.sh .git/hooks/pre-commit
chmod +x .git/hooks/pre-commit
```

Set `UI_SLOP_LINT` when the linter is not under `~/.claude/skills`.

### GitHub Action

Copy `hooks/github-action/ui-slop.yml` to `.github/workflows/ui-slop.yml` and adjust the linter path. It uploads a SARIF report to code scanning and fails the job on new P0 or P1 findings.

### Test guard

`hooks/guard.test.example.mjs` is a Vitest or Jest test that fails when the working tree has findings outside the baseline.

## Compatibility with other design skills

This skill can sit next to other design skills and checkers. A few facts decide how to combine them.

- Claude Code runs every hook that matches an event at the same time, and the order is not guaranteed. Two hooks on `PostToolUse` for `Edit` and `Write` will both run on the same edit, and their messages can arrive in either order.
- A hook that exits with code 2 sends its message back to Claude and asks for a fix. Two blocking hooks can give two different instructions for the same change.
- Suppression comments belong to one tool. A comment that silences a finding here does not silence the same finding in another tool, so a deliberate exception may need one comment per tool.

What to do.

1. Keep exactly one blocking hook. Use this skill's hook for that, and treat any other hook as advisory or leave it off.
2. Do not enable another pack's hooks before you have read what they run. Check which commands they start, whether they download or update anything, whether they contact a network address, which files they write into the project, and how long they may run. A hook is code that runs on every edit, so it deserves the same review as any dependency.
3. Do not copy hook settings from a third party into your user settings without reading them. Merge entries by hand and keep your existing ones.
4. If two tools report the same problem, fix it once and use `references/vocabulary.md` to match the names. It lists common names for visual problems next to the rule ids in this skill.
5. Guidance-only skills that contain no scripts and no hooks are the safest to install together. Make it clear in your project notes which skill runs first. For slop, run this skill first, then read the other guidance for the deeper design question.
6. Where another tool reports a rule that is wrong for your product, such as a monospace heading for a resource name, silence that one rule in that tool's own config rather than turning the whole tool off.

## Safe fixes

`--fix-safe` changes text only. It replaces a spaced em dash in a JSX or HTML text node with a comma, and removes a trailing arrow glyph from a text node. It never edits string literals, attributes, CSS or code. It is a dry run until you add `--write`. Read the diff, because tests that assert the old wording will need an update and a comma can create a run-on sentence.

## Rules

61 rules in six groups. Details, detection and fixes are in `skills/ui-anti-patterns/references/rules.md`.

| Group | Rules |
|---|---|
| Colour | default-indigo, two-stop-gradient, gradient-text, default-chart-palette, hex-excess, accent-overuse, low-contrast, cream-clay-palette |
| Type | tiny-font, default-font-only, serif-italic-emphasis, accent-word-heading, mono-heading, caps-tracked, weak-hierarchy, extreme-negative-tracking |
| Components | emoji-ui, frosted-glass, side-border-accent, heavy-shadow, neon-glow, nested-cards, uniform-radius, icon-card-row, kpi-card-row, eyebrow-pill, small-touch-target, off-scale-spacing, hard-offset-shadow, ghost-card, focus-ring-removed, missing-tabular-nums |
| Motion and finish | scroll-entrance, cursor-glow, hover-opacity, floating-animation, gradient-orb, grain-noise, decorative-blob, placeholder-image, pulsing-status-dot, marquee, transition-all, ease-in-ui, scale-zero-entrance, bounce-easing, radial-glow-background, grid-line-background, stripes-gradient |
| Copy | em-dash, label-dash, middle-dot, arrow-suffix, placeholder-copy, invented-metric, buzzword, aphoristic-cadence, placeholder-person-data |
| Punctuation | punct-semicolon-in-copy, punct-colon-in-copy, punct-dash-separator |

## Limits and false-positive policy

- The linter reads text. It does not render pages, so it cannot judge composition, contrast over images or whether an icon matches its label.
- P0 and P1 rules aim for precision of at least 0.9. P2 rules are heuristics and may be wrong more often. Treat them as prompts for review.
- Some patterns carry information (severity colours, chart gradients, data emoji). Mark them with an ignore comment and a reason instead of turning the rule off.
- When you find a false positive, report the snippet in an issue. It becomes a hard negative in the corpus before the rule changes.
- Quality numbers and how they were measured are in `docs/QUALITY.md`.

## Credits and references

The seven-pattern core list is adapted and condensed from the open-design project, under the Apache License 2.0. See `NOTICE`. The ideas were also shaped by two articles, read as references only.

- "20 signs a website was made by AI" (scalr.sg blog)
- "How to de-slopify your designs" (UX Collective)

## Licence

Apache License 2.0. See `LICENSE` and `NOTICE`.
