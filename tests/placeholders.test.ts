import { describe, it, expect } from 'vitest';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, mkdirSync, cpSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const script = 'scripts/check-placeholders.mjs';

function fixture(content: string) {
  const dir = mkdtempSync(join(tmpdir(), 'placeholders-'));
  mkdirSync(join(dir, 'data'));
  writeFileSync(join(dir, 'data', 'about.json'), content);
  return dir;
}

function run(args: string[], env: Record<string, string> = {}) {
  const base = { ...process.env };
  delete base.VERCEL_ENV;
  return spawnSync('node', [script, ...args], {
    encoding: 'utf8',
    env: { ...base, ...env },
  });
}

describe('check-placeholders', () => {
  it('--strict exits 1 on a dir with a placeholder and prints file:line', () => {
    const dir = fixture('{\n  "bio": "[DEREK: x]"\n}\n');
    const r = run(['--strict', dir]);
    expect(r.status).toBe(1);
    expect(r.stderr + r.stdout).toContain('about.json:2');
  });

  it('without --strict exits 0 and warns', () => {
    const dir = fixture('{"bio": "[DEREK: x]"}');
    const r = run([dir]);
    expect(r.status).toBe(0);
    expect((r.stderr + r.stdout).toLowerCase()).toContain('warning');
  });

  it('VERCEL_ENV=production exits 1 without --strict', () => {
    const dir = fixture('{"bio": "[DEREK: x]"}');
    expect(run([dir], { VERCEL_ENV: 'production' }).status).toBe(1);
  });

  it('--strict exits 0 on a clean dir', () => {
    const dir = fixture('{"bio": "all good"}');
    expect(run(['--strict', dir]).status).toBe(0);
  });

  it('real src/ passes --strict once about.json placeholders are filled in', () => {
    const dir = mkdtempSync(join(tmpdir(), 'src-copy-'));
    cpSync('src', dir, { recursive: true });
    const f = join(dir, 'data', 'about.json');
    writeFileSync(f, readFileSync(f, 'utf8').replace(/\[DEREK:[^\]]*\]/g, 'Real text'));
    const r = run(['--strict', dir]);
    expect(r.stderr + r.stdout).not.toContain('[DEREK:');
    expect(r.status).toBe(0);
  });
});
