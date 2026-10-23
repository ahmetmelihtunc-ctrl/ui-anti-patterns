#!/usr/bin/env node
// Claude Code PostToolUse hook. Reads the hook JSON from stdin, lints the file that was just
// edited, and exits 2 with the findings on stderr when the edit introduced a new P0 or P1 finding.
// "New" means not in the baseline file and not already present in the version at git HEAD.
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { lintText, loadConfig, collectFiles, applyBaseline, findingKey } from '../scripts/ui-slop-lint.mjs';

const RANK = { P0: 0, P1: 1, P2: 2 };

function readStdin() {
  try { return JSON.parse(fs.readFileSync(0, 'utf8') || '{}'); } catch { return {}; }
}

function findRoot(start) {
  for (let d = start; ; d = path.dirname(d)) {
    if (fs.existsSync(path.join(d, 'ui-slop.config.json'))) return d;
    if (path.dirname(d) === d) break;
  }
  try { return execFileSync('git', ['rev-parse', '--show-toplevel'], { cwd: start, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim(); } catch { return start; }
}

function headVersion(root, rel) {
  try { return execFileSync('git', ['show', `HEAD:${rel}`], { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], maxBuffer: 8e6 }); } catch { return ''; }
}

function main() {
  const input = readStdin();
  const file = input.tool_input?.file_path || input.tool_response?.filePath;
  if (!file || !fs.existsSync(file)) return 0;
  const abs = fs.realpathSync(path.resolve(input.cwd || process.cwd(), file));
  const root = findRoot(path.dirname(abs));
  const cfg = loadConfig(root);
  if (!collectFiles([abs], root, cfg).length) return 0;
  const rel = path.relative(root, abs).split(path.sep).join('/');

  let findings = lintText(rel, fs.readFileSync(abs, 'utf8'), cfg).findings;
  const basePath = path.resolve(root, cfg.baseline || 'ui-slop.baseline.json');
  if (fs.existsSync(basePath)) applyBaseline(findings, JSON.parse(fs.readFileSync(basePath, 'utf8')));
  findings = findings.filter((f) => !f.baselined);

  const before = new Map();
  for (const f of lintText(rel, headVersion(root, rel), cfg).findings) before.set(findingKey(f), (before.get(findingKey(f)) || 0) + 1);
  const fresh = findings.filter((f) => {
    const n = before.get(findingKey(f)) || 0;
    if (n > 0) { before.set(findingKey(f), n - 1); return false; }
    return true;
  });

  const limit = RANK[cfg.failOn] ?? RANK.P1;
  const blocking = fresh.filter((f) => RANK[f.severity] <= limit);
  if (!blocking.length) return 0;
  const lines = blocking.map((f) => `  ${rel}:${f.line} ${f.severity} ${f.rule}: ${f.message}. ${f.hint}`);
  process.stderr.write(`ui-slop-lint found ${blocking.length} new finding${blocking.length === 1 ? '' : 's'} in ${rel}.\n${lines.join('\n')}\nFix them. If a use is legitimate, add a comment such as "ui-slop-ignore ${blocking[0].rule}: <reason>".\n`);
  return 2;
}

process.exitCode = main();
