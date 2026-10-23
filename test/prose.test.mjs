import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { lintText, RULE_IDS } from '../skills/ui-anti-patterns/scripts/ui-slop-lint.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const walk = (d, out = []) => {
  for (const n of fs.readdirSync(d)) {
    if (['.git', 'node_modules'].includes(n)) continue;
    const p = path.join(d, n);
    fs.statSync(p).isDirectory() ? walk(p, out) : out.push(p);
  }
  return out;
};
const files = walk(root).filter((f) => /\.(md|mjs|json|yml|yaml|html|tsx|sh)$/.test(f) || /NOTICE$/.test(f));
const JOKE = new Set(['README.md']);
const BAD_FIXTURES = new Set(['examples/bad.html', 'examples/bad.tsx']);

test('no em dashes or emoji in the repository (the parody README is exempt)', () => {
  for (const f of files) {
    const rel = path.relative(root, f);
    if (JOKE.has(rel) || BAD_FIXTURES.has(rel)) continue;
    const text = fs.readFileSync(f, 'utf8');
    assert.doesNotMatch(text, /\u2014/, `em dash in ${rel}`);
    assert.doesNotMatch(text, /\p{Emoji_Presentation}|\p{Extended_Pictographic}️/u, `emoji in ${rel}`);
  }
});

test('prose files pass the punctuation and copy rules of the linter itself', () => {
  const allow = new Set(['punct-semicolon-in-copy', 'punct-colon-in-copy', 'punct-dash-separator', 'middle-dot', 'arrow-suffix', 'em-dash']);
  const rules = Object.fromEntries(RULE_IDS.filter((r) => !allow.has(r)).map((r) => [r, 'off']));
  const bad = [];
  for (const f of files.filter((f) => f.endsWith('.md'))) {
    const rel = path.relative(root, f);
    if (JOKE.has(rel)) continue;
    const { findings } = lintText(rel, fs.readFileSync(f, 'utf8'), { rules });
    for (const x of findings) bad.push(`${rel}:${x.line} ${x.rule}`);
  }
  assert.deepEqual(bad, []);
});
