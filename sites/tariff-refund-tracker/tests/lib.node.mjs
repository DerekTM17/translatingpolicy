import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { perHousehold, shareReturned, daysUntil, fmtDate, fmtUsd, latest } from '../src/lib.js';

const data = JSON.parse(readFileSync(new URL('../src/data/refunds.json', import.meta.url)));

test('perHousehold at full pass-through matches hand math', () => {
  // 166e9 / 134,790,000 = 1231.54...
  const v = perHousehold(166, 134790, 1);
  assert.ok(Math.abs(v - 1231.54) < 0.01, String(v));
});

test('perHousehold scales and clamps pass-through', () => {
  assert.equal(perHousehold(166, 134790, 0), 0);
  assert.ok(Math.abs(perHousehold(166, 134790, 0.5) - perHousehold(166, 134790, 1) / 2) < 1e-9);
  assert.equal(perHousehold(166, 134790, 2), perHousehold(166, 134790, 1));
  assert.throws(() => perHousehold(166, 0, 1));
});

test('shareReturned', () => {
  assert.ok(Math.abs(shareReturned(126, 166) - 0.759) < 0.001);
  assert.equal(shareReturned(200, 166), 1);
  assert.equal(shareReturned(10, 0), 0);
});

test('daysUntil counts calendar days', () => {
  assert.equal(daysUntil('2026-12-09', new Date(2026, 10, 26, 21, 0)), 13);
  assert.equal(daysUntil('2026-11-26', new Date(2026, 10, 26, 23, 59)), 0);
  assert.equal(daysUntil('2026-11-25', new Date(2026, 10, 26)), -1);
});

test('formatters', () => {
  assert.equal(fmtDate('2026-12-09'), 'Dec 9, 2026');
  assert.equal(fmtDate('2026-03-15', true), 'Mar 2026');
  assert.equal(fmtUsd(1231.54), '$1,232');
});

test('latest milestone is Oct 2 and every source id resolves', () => {
  assert.equal(latest(data.milestones).date, '2026-10-02');
  const ids = new Set(data.sources.map((s) => s.id));
  const refs = [
    data.totals.ieepaCollectedSource, data.totals.mayStaySource, data.totals.householdsSource,
    data.capeSnapshot.source, data.coverageSource, data.consumerRoute.source,
    ...data.milestones.map((m) => m.source), ...data.timeline.map((t) => t.source),
  ];
  for (const r of refs) assert.ok(ids.has(r), `missing source ${r}`);
});
