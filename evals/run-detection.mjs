#!/usr/bin/env node
// Scores the linter against the labelled corpus. Prints precision, recall and F1 per rule.
// Usage: node evals/run-detection.mjs [--json] [--min-precision-high 0.9] [--min-precision 0.8] [--min-recall 0.8] [-v]
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { cases } from './corpus/cases.mjs';
import { lintText, finalizeProject, RULES } from '../skills/ui-anti-patterns/scripts/ui-slop-lint.mjs';

const argv = process.argv.slice(2);
const opt = (name, d) => { const i = argv.indexOf(name); return i >= 0 ? parseFloat(argv[i + 1]) : d; };
const T = { precHigh: opt('--min-precision-high', 0.9), prec: opt('--min-precision', 0.8), recall: opt('--min-recall', 0.8) };
const verbose = argv.includes('-v');

const sev = new Map(RULES.map((r) => [r.id, r.severity]));
sev.set('ignore-without-reason', 'P1');
const stats = new Map();
const stat = (r) => { if (!stats.has(r)) stats.set(r, { tp: 0, fp: 0, fn: 0 }); return stats.get(r); };
const misses = [];

for (const c of cases) {
  const files = c.files || [{ name: c.file, code: c.code }];
  const state = {}, found = [];
  for (const f of files) found.push(...lintText(f.name, f.code, c.config || {}, state).findings);
  if (c.files) found.push(...finalizeProject(state, c.config || {}));
  const scope = new Set([...c.expect.map((e) => e[0]), ...c.forbid]);
  const expected = new Set(c.expect.map(([r, l]) => `${r}:${l}`));
  const got = new Set(found.filter((f) => scope.has(f.rule)).map((f) => `${f.rule}:${f.line}`));
  for (const e of expected) { if (got.has(e)) stat(e.split(':')[0]).tp++; else { stat(e.split(':')[0]).fn++; misses.push(`MISS ${c.id}: expected ${e}`); } }
  for (const g of got) if (!expected.has(g)) { stat(g.split(':')[0]).fp++; misses.push(`FALSE POSITIVE ${c.id}: ${g}`); }
}

const rows = [...stats].map(([rule, s]) => ({
  rule, severity: sev.get(rule) || '?', ...s,
  precision: s.tp + s.fp ? s.tp / (s.tp + s.fp) : 1,
  recall: s.tp + s.fn ? s.tp / (s.tp + s.fn) : 1,
})).map((r) => ({ ...r, f1: r.precision + r.recall ? (2 * r.precision * r.recall) / (r.precision + r.recall) : 0 })).sort((a, b) => a.rule.localeCompare(b.rule));
const sum = (k) => rows.reduce((a, r) => a + r[k], 0);
const tp = sum('tp'), fp = sum('fp'), fn = sum('fn');
const overall = { tp, fp, fn, precision: tp / (tp + fp || 1), recall: tp / (tp + fn || 1) };
overall.f1 = (2 * overall.precision * overall.recall) / (overall.precision + overall.recall || 1);
const untested = RULES.map((r) => r.id).filter((id) => !stats.has(id));

const failures = [];
for (const r of rows) {
  const need = r.severity === 'P2' ? T.prec : T.precHigh;
  if (r.precision < need) failures.push(`${r.rule}: precision ${r.precision.toFixed(2)} below ${need}`);
  if (r.recall < T.recall) failures.push(`${r.rule}: recall ${r.recall.toFixed(2)} below ${T.recall}`);
}
for (const id of untested) failures.push(`${id}: no corpus case`);

if (argv.includes('--json')) {
  console.log(JSON.stringify({ cases: cases.length, rules: rows, overall, failures }, null, 2));
} else {
  const f = (n) => n.toFixed(2);
  console.log(`corpus: ${cases.length} cases, ${rows.length} rules scored\n`);
  console.log('rule'.padEnd(26) + 'sev  ' + 'TP  FP  FN  ' + 'prec  recall  F1');
  for (const r of rows) console.log(r.rule.padEnd(26) + r.severity.padEnd(5) + String(r.tp).padEnd(4) + String(r.fp).padEnd(4) + String(r.fn).padEnd(4) + f(r.precision).padEnd(6) + f(r.recall).padEnd(8) + f(r.f1));
  console.log(`\noverall: precision ${f(overall.precision)}, recall ${f(overall.recall)}, F1 ${f(overall.f1)} (TP ${tp}, FP ${fp}, FN ${fn})`);
  if (verbose || misses.length) for (const m of misses) console.log(m);
  for (const m of failures) console.log('FAIL ' + m);
}
process.exitCode = failures.length ? 1 : 0;
void fileURLToPath; void path;
