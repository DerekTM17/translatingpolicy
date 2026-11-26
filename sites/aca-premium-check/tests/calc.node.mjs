import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { povertyLine, applicablePct, ageRatio, householdBenchmark, estimate, cliffSeries } from '../src/lib/calc.js';

const rules = JSON.parse(readFileSync(new URL('../src/data/rules.json', import.meta.url)));
const data = JSON.parse(readFileSync(new URL('../src/data/states.json', import.meta.url)));
const st = (c) => data.states.find((s) => s.code === c);

test('data has 50 states plus DC and 41 expansion jurisdictions', () => {
  assert.equal(data.states.length, 51);
  assert.equal(data.states.filter((s) => s.medicaidExpansion).length, 41);
  for (const s of data.states) assert.ok(s.b2026 > 0 && s.b2027 > 0, s.code);
});

test('2026 poverty lines match the Federal Register', () => {
  assert.equal(povertyLine(rules, 'US48', 1), 15960);
  assert.equal(povertyLine(rules, 'US48', 4), 33000);
  assert.equal(povertyLine(rules, 'US48', 9), 55720 + 5680);
  assert.equal(povertyLine(rules, 'AK', 1), 19950);
  assert.equal(povertyLine(rules, 'HI', 2), 24890);
});

test('applicable percentages follow Rev. Proc. 2026-26', () => {
  assert.equal(applicablePct(rules, 120), 2.15);
  assert.equal(applicablePct(rules, 133), 3.23);
  assert.ok(Math.abs(applicablePct(rules, 175) - 5.54) < 1e-9);
  assert.equal(applicablePct(rules, 300), 10.22);
  assert.equal(applicablePct(rules, 400), 10.22);
  assert.equal(applicablePct(rules, 400.01), null);
  assert.equal(applicablePct(rules, 99), null);
});

test('age curve anchors', () => {
  assert.equal(ageRatio(rules, 21), 1.0);
  assert.equal(ageRatio(rules, 40), 1.278);
  assert.equal(ageRatio(rules, 70), 3.0);
  assert.equal(ageRatio(rules, 5), 0.765);
});

test('a 40-year-old pays the state average benchmark', () => {
  assert.equal(householdBenchmark(rules, st('VA'), [40], 0), 549);
  assert.equal(householdBenchmark(rules, st('NY'), [64], 0), 1041); // no age rating
});

test('single 60-year-old just over the cliff pays full price', () => {
  const s = st('PA');
  const under = estimate(rules, s, { income: 63840, adultAges: [60] }); // exactly 400%
  const over = estimate(rules, s, { income: 63900, adultAges: [60] });
  assert.equal(under.status, 'credit');
  assert.equal(over.status, 'cliff');
  assert.ok(over.youPay - under.youPay > 500, 'the cliff should be large for a 60-year-old');
  assert.ok(Math.abs(under.youPay - (63840 * 0.1022) / 12) < 1e-6);
});

test('expansion vs non-expansion below 138%', () => {
  assert.equal(estimate(rules, st('VA'), { income: 15000, adultAges: [30] }).status, 'medicaid');
  assert.equal(estimate(rules, st('TX'), { income: 12000, adultAges: [30] }).status, 'gap');
  assert.equal(estimate(rules, st('TX'), { income: 18000, adultAges: [30] }).status, 'credit');
});

test('cliff series drops to full price after 400%', () => {
  const pts = cliffSeries(rules, st('GA'), [55], 0);
  const at400 = pts.find((p) => p.pct === 400).youPay;
  const at405 = pts.find((p) => p.pct === 405).youPay;
  assert.ok(at405 > at400);
});
