import test from 'node:test';
import assert from 'node:assert/strict';
import { lintText, finalizeProject, RULES, RULE_IDS, parseColor, contrastRatio, globToRegex, safeFix, buildBaseline, applyBaseline } from '../skills/ui-anti-patterns/scripts/ui-slop-lint.mjs';
import fs from 'node:fs';
import { cases } from '../evals/corpus/cases.mjs';

function run(c) {
  const files = c.files || [{ name: c.file, code: c.code }];
  const state = {}, found = [];
  for (const f of files) found.push(...lintText(f.name, f.code, c.config || {}, state).findings);
  if (c.files) found.push(...finalizeProject(state, c.config || {}));
  return found;
}

for (const c of cases) {
  test(`corpus ${c.id}`, () => {
    const found = run(c);
    for (const [rule, line] of c.expect) assert.ok(found.some((f) => f.rule === rule && f.line === +line), `expected ${rule} on line ${line}, got ${found.map((f) => f.rule + ':' + f.line).join(', ')}`);
    for (const rule of c.forbid) assert.equal(found.filter((f) => f.rule === rule).length, 0, `${rule} must not fire`);
  });
}

test('every rule has at least one positive and one negative case', () => {
  for (const r of RULES) {
    assert.ok(cases.some((c) => c.expect.some((e) => e[0] === r.id)), `${r.id} has no positive case`);
    assert.ok(cases.some((c) => c.forbid.includes(r.id)), `${r.id} has no negative case`);
  }
});

test('every rule has an id, a severity, a title and a hint', () => {
  const ids = new Set();
  for (const r of RULES) {
    assert.match(r.id, /^[a-z]+(-[a-z]+)*$/);
    assert.ok(['P0', 'P1', 'P2'].includes(r.severity));
    assert.ok(r.title && r.hint && !ids.has(r.id));
    ids.add(r.id);
  }
});

test('contrast maths matches known WCAG values', () => {
  assert.equal(contrastRatio(parseColor('#000'), parseColor('#fff')).toFixed(1), '21.0');
  assert.equal(contrastRatio(parseColor('#767676'), parseColor('#fff')).toFixed(2), '4.54');
});

test('ignore comment needs a reason and then suppresses the next line', () => {
  const ok = lintText('a.css', '/* ui-slop-ignore default-indigo: brand colour of a third party logo */\n.a { color: #6366f1; }');
  assert.equal(ok.findings.length, 0);
  assert.equal(ok.suppressed, 1);
  const bad = lintText('a.css', '/* ui-slop-ignore default-indigo */\n.a { color: #6366f1; }');
  assert.ok(bad.findings.some((f) => f.rule === 'ignore-without-reason'));
  assert.ok(bad.findings.some((f) => f.rule === 'default-indigo'));
});

test('ignore-file suppresses a rule for the whole file', () => {
  const r = lintText('a.css', '/* ui-slop-ignore-file frosted-glass: overlay only */\n.a { backdrop-filter: blur(4px); }\n.b { backdrop-filter: blur(4px); }');
  assert.equal(r.findings.length, 0);
});

test('rule overrides change or disable severity', () => {
  const off = lintText('a.css', '.a { backdrop-filter: blur(4px); }', { rules: { 'frosted-glass': 'off' } });
  assert.equal(off.findings.length, 0);
  const p2 = lintText('a.css', '.a { backdrop-filter: blur(4px); }', { rules: { 'frosted-glass': 'P2' } });
  assert.equal(p2.findings[0].severity, 'P2');
});

test('glob matching works on suffixes', () => {
  assert.ok(globToRegex('app/lib/tokens.ts').test('web/app/lib/tokens.ts'));
  assert.ok(globToRegex('**/*.test.*').test('a/b/x.test.tsx'));
  assert.ok(!globToRegex('tokens.ts').test('app/nottokens.ts'));
});

test('baseline absorbs existing findings and exposes new ones', () => {
  const a = lintText('a.css', '.a { backdrop-filter: blur(4px); }').findings;
  const base = buildBaseline(a);
  const next = lintText('a.css', '.a { backdrop-filter: blur(4px); }\n.b { backdrop-filter: blur(8px); }').findings;
  applyBaseline(next, base);
  assert.deepEqual(next.map((f) => f.baselined), [true, false]);
});

test('safe fixes only touch text nodes', () => {
  const src = 'const t = "Fast \u2014 simple";\nconst a = <p>Fast \u2014 simple</p>;\nconst b = <a href="/x">View all →</a>;\n';
  const r = safeFix('a.tsx', src);
  assert.equal(r.text, 'const t = "Fast \u2014 simple";\nconst a = <p>Fast, simple</p>;\nconst b = <a href="/x">View all</a>;\n');
  assert.equal(r.changes.length, 2);
});

test('safe fixes leave a clean file unchanged', () => {
  const src = 'const a = <p>Fast, simple</p>;\n';
  assert.equal(safeFix('a.tsx', src).text, src);
});

test('the old left-border-accent id still works in config and baselines', () => {
  const src = 'const a = <div className="border-l-4 border-red-500" />;';
  assert.equal(lintText('a.tsx', src, { rules: { 'left-border-accent': 'off' } }).findings.length, 0);
  assert.equal(lintText('a.tsx', src, { rules: { 'left-border-accent': 'P2' } }).findings[0].severity, 'P2');
  const found = lintText('a.tsx', src).findings;
  const old = { findings: [{ key: found[0] && `left-border-accent|a.tsx|${found[0].snippet}`, count: 1 }] };
  assert.equal(applyBaseline(found, old)[0].baselined, true);
});

test('operate profile relaxes the tracked caps limit, persuade keeps the default', () => {
  const src = Array.from({ length: 5 }, (_, i) => `const l${i} = <div className="text-xs uppercase tracking-wider">Label ${i}</div>;`).join('\n');
  const sev = (cfg) => lintText('a.tsx', src, cfg).findings.filter((f) => f.rule === 'caps-tracked').map((f) => f.severity);
  assert.ok(sev({}).includes('P1'));
  assert.ok(sev({ profile: 'persuade' }).includes('P1'));
  assert.ok(!sev({ profile: 'operate' }).includes('P1'));
  assert.ok(sev({ profile: 'operate' }).length > 0, 'individual labels are still reported');
  assert.ok(sev({ profile: 'operate', options: { maxCapsLabels: 2 } }).includes('P1'), 'an explicit option wins over the profile');
});

test('only rules marked landing are skipped by the operate profile', () => {
  const landing = RULES.filter((r) => r.landing).map((r) => r.id).sort();
  assert.deepEqual(landing, ['accent-word-heading', 'aphoristic-cadence', 'eyebrow-pill', 'icon-card-row', 'mono-heading', 'serif-italic-emphasis']);
});

test('rule ids named in vocabulary.md exist', () => {
  const text = fs.readFileSync(new URL('../skills/ui-anti-patterns/references/vocabulary.md', import.meta.url), 'utf8');
  const allowed = new Set(RULE_IDS);
  const unknown = [...text.matchAll(/`([a-z]+(?:-[a-z]+)+)`/g)].map((m) => m[1]).filter((id) => !allowed.has(id));
  assert.deepEqual([...new Set(unknown)], []);
});
