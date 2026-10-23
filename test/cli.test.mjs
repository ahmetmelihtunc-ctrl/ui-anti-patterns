import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const LINT = path.join(root, 'skills/ui-anti-patterns/scripts/ui-slop-lint.mjs');
const HOOK = path.join(root, 'skills/ui-anti-patterns/hooks/ui-slop-hook.mjs');
const run = (args, opts = {}) => spawnSync('node', [LINT, ...args], { encoding: 'utf8', ...opts });
const tmp = () => fs.mkdtempSync(path.join(os.tmpdir(), 'slop-'));
const EMPTY = path.join(tmp(), 'empty.json');
fs.writeFileSync(EMPTY, '{}');

test('exit 0 on the fixed example, 1 on the bad example, 2 on bad usage', () => {
  assert.equal(run(['examples/fixed', '--fail-on', 'P2'], { cwd: root }).status, 0);
  assert.equal(run(['examples/bad.html', '--config', EMPTY], { cwd: root }).status, 1);
  assert.equal(run(['--nope'], { cwd: root }).status, 2);
  assert.equal(run(['--fail-on', 'P9'], { cwd: root }).status, 2);
});

test('--fail-on controls which severities fail the run', () => {
  const d = tmp();
  fs.writeFileSync(path.join(d, 'a.tsx'), 'const a = <div className="animate-bounce">x</div>;\n');
  assert.equal(run([d, '--root', d], {}).status, 0);
  assert.equal(run([d, '--root', d, '--fail-on', 'P2']).status, 1);
  assert.equal(run([d, '--root', d, '--fail-on', 'none']).status, 0);
});

test('--json and --sarif produce valid documents', () => {
  const j = JSON.parse(run(['examples/bad.tsx', '--json', '--config', EMPTY], { cwd: root }).stdout);
  assert.ok(j.findings.length > 5 && j.counts['gradient-text'] === 1);
  const s = JSON.parse(run(['examples/bad.tsx', '--sarif', '--config', EMPTY], { cwd: root }).stdout);
  assert.equal(s.version, '2.1.0');
  assert.ok(s.runs[0].results.length > 5 && s.runs[0].results[0].locations[0].physicalLocation.region.startLine > 0);
});

test('baseline: legacy findings pass, a new finding fails', () => {
  const d = tmp();
  const f = path.join(d, 'a.css');
  fs.writeFileSync(f, '.a { backdrop-filter: blur(4px); }\n');
  const b = path.join(d, 'base.json');
  assert.equal(run([d, '--root', d, '--baseline', b, '--update-baseline']).status, 0);
  assert.equal(run([d, '--root', d, '--baseline', b]).status, 0);
  fs.appendFileSync(f, '.b { border-left: 4px solid #3b82f6; }\n');
  const r = run([d, '--root', d, '--baseline', b]);
  assert.equal(r.status, 1);
  assert.match(r.stdout, /left-border-accent/);
  assert.doesNotMatch(r.stdout, /frosted-glass/);
  assert.equal(run([d, '--root', d, '--baseline', path.join(d, 'missing.json')]).status, 2);
});

test('config: token files, ignore globs and rule overrides', () => {
  const d = tmp();
  fs.mkdirSync(path.join(d, 'lib'));
  fs.writeFileSync(path.join(d, 'lib/tokens.css'), ':root { --a: #6366f1; }\n');
  fs.writeFileSync(path.join(d, 'skip.css'), '.a { backdrop-filter: blur(4px); }\n');
  fs.writeFileSync(path.join(d, 'ui-slop.config.json'), JSON.stringify({ tokenFiles: ['lib/tokens.css'], ignore: [{ path: 'skip.css', reason: 'test' }] }));
  assert.equal(run([d, '--root', d]).status, 0);
  fs.writeFileSync(path.join(d, 'ui-slop.config.json'), JSON.stringify({ ignore: [{ path: 'skip.css' }] }));
  assert.equal(run([d, '--root', d]).status, 2);
});

test('--fix-safe is a dry run until --write, and the result is behaviour neutral', () => {
  const d = tmp();
  const f = path.join(d, 'a.tsx');
  const src = 'const t = "Fast \u2014 simple";\nexport const A = () => <p>Fast \u2014 simple <a href="/x">More →</a></p>;\n';
  fs.writeFileSync(f, src);
  const dry = run([f, '--root', d, '--fix-safe']);
  assert.equal(dry.status, 0);
  assert.equal(fs.readFileSync(f, 'utf8'), src);
  run([f, '--root', d, '--fix-safe', '--write']);
  const out = fs.readFileSync(f, 'utf8');
  assert.match(out, /const t = "Fast \u2014 simple"/);
  assert.match(out, /<p>Fast, simple <a href="\/x">More<\/a><\/p>/);
  assert.equal(out.split('\n').length, src.split('\n').length);
});

test('hook exits 2 with findings for a new violation and 0 for clean or legacy code', () => {
  const d = tmp();
  spawnSync('git', ['init', '-q'], { cwd: d });
  spawnSync('git', ['-c', 'user.name=t', '-c', 'user.email=t@t', 'commit', '--allow-empty', '-qm', 'init'], { cwd: d });
  const f = path.join(d, 'a.css');
  fs.writeFileSync(f, '.a { color: #111; }\n');
  spawnSync('git', ['add', '.'], { cwd: d });
  spawnSync('git', ['-c', 'user.name=t', '-c', 'user.email=t@t', 'commit', '-qm', 'base'], { cwd: d });
  const hook = (p) => spawnSync('node', [HOOK], { cwd: d, input: JSON.stringify({ tool_name: 'Edit', cwd: d, tool_input: { file_path: p } }), encoding: 'utf8' });
  assert.equal(hook(f).status, 0);
  fs.writeFileSync(f, '.a { color: #111; }\n.b { background: linear-gradient(135deg, #667eea, #764ba2); }\n');
  const bad = hook(f);
  assert.equal(bad.status, 2);
  assert.match(bad.stderr, /two-stop-gradient/);
  spawnSync('git', ['add', '.'], { cwd: d });
  spawnSync('git', ['-c', 'user.name=t', '-c', 'user.email=t@t', 'commit', '-qm', 'legacy'], { cwd: d });
  assert.equal(hook(f).status, 0, 'findings already in HEAD are not new');
  assert.equal(hook(path.join(d, 'notes.txt')).status, 0, 'unsupported files are skipped');
});
