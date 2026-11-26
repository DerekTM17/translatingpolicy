import test from 'node:test';
import assert from 'node:assert/strict';
import { compare, tierFor, gross2027 } from '../src/lib.js';

test('typical check: $2,000 rises $72, premium up $6.50', () => {
  const r = compare({ gross2026: 2000 });
  assert.equal(r.g27, 2072);
  assert.equal(r.raise, 72);
  assert.equal(r.premiumChange, 6.5);
  assert.equal(r.netChange, 65.5);
  assert.equal(r.heldHarmless, false);
});

test('hold harmless caps the premium rise for a small check', () => {
  const r = compare({ gross2026: 150 });
  assert.equal(r.raise, 5);
  assert.equal(r.heldHarmless, true);
  assert.equal(r.premiumChange, 5);
  assert.equal(r.netChange, 0);
});

test('state-paid premium: full raise lands', () => {
  const r = compare({ gross2026: 1000, statePays: true });
  assert.equal(r.netChange, 36);
});

test('income tiers', () => {
  assert.equal(tierFor(2027, 112000), 0);
  assert.equal(tierFor(2027, 112001), 1);
  assert.equal(tierFor(2027, 499999), 4);
  assert.equal(tierFor(2027, 500000), 5);
  assert.equal(tierFor(2026, 110000), 1);
  assert.equal(tierFor(2027, 110000), 0, 'a $110k earner drops back to standard as brackets rise');
  assert.equal(tierFor(2027, 300000, 'joint'), 2);
});

test('rounding down to whole dollars', () => {
  assert.equal(gross2027(1999.99), 2071);
});
