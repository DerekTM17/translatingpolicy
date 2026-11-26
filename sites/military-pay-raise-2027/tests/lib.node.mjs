import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { columnIndex, compare, pay2027, firstYears } from '../src/lib.js';

const data = JSON.parse(readFileSync(new URL('../src/data/pay.json', import.meta.url)));

test('years map to the right column', () => {
  const c = data.columns;
  assert.equal(columnIndex(0, c), 0);
  assert.equal(columnIndex(2, c), 0);
  assert.equal(columnIndex(3, c), 1); // Over 2
  assert.equal(columnIndex(4, c), 2); // Over 3
  assert.equal(columnIndex(5, c), 3); // Over 4
  assert.equal(columnIndex(40, c), 20); // Over 38
  assert.equal(columnIndex(41, c), 21); // Over 40
});

test('O-1 under 2 years matches the DFAS 2026 table', () => {
  assert.equal(compare(data, 'O-1', 1).base, 4150.2);
});

test('published 2026 enlisted cells are used where available', () => {
  const r = compare(data, 'E-1', 1);
  assert.equal(r.base, 2407.2);
  assert.equal(r.basis, 'published_2026');
});

test('E-4 gets 7% vs 3.6%', () => {
  const r = compare(data, 'E-4', 1);
  assert.equal(r.scenarios.president.rate, 7);
  assert.equal(r.scenarios.senate.rate, 3.6);
  assert.equal(r.scenarios.president.monthly, 3362.15); // 3142.20 * 1.07
  assert.equal(r.scenarios.senate.monthly, 3255.32); // 3142.20 * 1.036
});

test('O-6 is held at the Level V cap', () => {
  assert.equal(pay2027(15408.3, 5, 'O-6', 15408.3), 15408.3);
  assert.equal(pay2027(5000, 5, 'O-6', 15408.3), 5250);
});

test('E-9 has no rate before 10 years', () => {
  assert.equal(compare(data, 'E-9', 5).base, null);
  assert.equal(firstYears(data, 'E-9'), 11);
});
