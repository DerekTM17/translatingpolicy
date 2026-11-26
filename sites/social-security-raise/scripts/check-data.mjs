// Guards against typos in src/data/rates.js. Each assertion matches a sentence in a primary source.
import assert from 'node:assert/strict';
import { COLA_2027, PART_B, IRMAA } from '../src/data/rates.js';

assert.equal(COLA_2027, 0.036, 'SSA: 3.6 percent COLA for 2027');
assert.equal(PART_B[2027].standard, 209.4, 'CMS: $209.40 standard premium 2027');
assert.equal(PART_B[2026].standard, 202.9, 'CMS: $202.90 standard premium 2026');
assert.equal(Math.round((PART_B[2027].standard - PART_B[2026].standard) * 100) / 100, 6.5, 'CMS: $6.50 higher');
assert.equal(PART_B[2027].deductible, 292);
assert.equal(PART_B[2026].deductible, 283);
for (const y of [2026, 2027]) {
  assert.equal(IRMAA[y][0].total, PART_B[y].standard, `${y} tier 0 equals standard premium`);
  for (let i = 1; i < IRMAA[y].length; i++) {
    assert.ok(IRMAA[y][i].total > IRMAA[y][i - 1].total, `${y} tiers rise`);
    assert.ok(IRMAA[y][i].single >= IRMAA[y][i - 1].single, `${y} brackets rise`);
  }
}
console.log('check-data: rates match the cited sources');
