// Guard test for Vitest or Jest. Fails when the working tree has UI findings that are not in the baseline.
// Copy to your test folder and adjust the paths. Works in ESM projects; rename to .cjs and use require for CommonJS.
import { execFileSync } from 'node:child_process';
import { describe, it, expect } from 'vitest'; // or: import { describe, it, expect } from '@jest/globals';

const LINT = '.claude/skills/ui-anti-patterns/scripts/ui-slop-lint.mjs';

describe('ui anti-patterns', () => {
  it('adds no new P0 or P1 findings', () => {
    let out;
    try {
      out = execFileSync('node', [LINT, 'src', '--json', '--baseline', 'ui-slop.baseline.json', '--fail-on', 'none'], { encoding: 'utf8', maxBuffer: 32e6 });
    } catch (e) {
      throw new Error(`linter failed to run: ${e.message}`);
    }
    const report = JSON.parse(out);
    const blocking = report.findings.filter((f) => !f.baselined && (f.severity === 'P0' || f.severity === 'P1'));
    expect(blocking.map((f) => `${f.file}:${f.line} ${f.rule}`)).toEqual([]);
  });
});
