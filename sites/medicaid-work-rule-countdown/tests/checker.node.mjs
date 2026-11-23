import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { evaluate } from '../src/lib/checker.js';
import { daysUntil } from '../src/lib/dates.js';

const states = JSON.parse(readFileSync(new URL('../src/data/states.json', import.meta.url)));
const base = { state: 'OH', age: '19to64', medicare: 'no', group: 'adult', exemptions: [], activities: [] };

test('incomplete answers', () => {
  assert.equal(evaluate({ ...base, age: '' }, states).code, 'incomplete');
});
test('non-covered state', () => {
  assert.equal(evaluate({ ...base, state: 'TX' }, states).code, 'not_applicable');
});
test('age outside 19 to 64', () => {
  assert.equal(evaluate({ ...base, age: '65plus' }, states).code, 'not_applicable');
  assert.equal(evaluate({ ...base, age: 'under19' }, states).code, 'not_applicable');
});
test('medicare and other group', () => {
  assert.equal(evaluate({ ...base, medicare: 'yes' }, states).code, 'not_applicable');
  assert.equal(evaluate({ ...base, group: 'other' }, states).code, 'not_applicable');
});
test('exemption wins over activities', () => {
  const r = evaluate({ ...base, exemptions: ['frail'], activities: ['hours'] }, states);
  assert.equal(r.code, 'exempt');
  assert.ok(r.steps.some((s) => s.includes('Oct 29, 2026')));
});
test('meets via income', () => {
  assert.equal(evaluate({ ...base, activities: ['income'] }, states).code, 'meets');
});
test('unsure leads to unclear', () => {
  assert.equal(evaluate({ ...base, activities: ['unsure'] }, states).code, 'unclear');
});
test('reported grace period separates checking from coverage loss in New York', () => {
  const r = evaluate({ ...base, state: 'NY' }, states);
  assert.equal(r.code, 'protected');
  assert.match(r.summary, /still check/);
  assert.match(r.summary, /solely.*June 30, 2027.*otherwise qualify/);
  assert.doesNotMatch(r.title, /losing coverage|at risk/);
});
test('a reported grace period with no end date does not invent one', () => {
  const r = evaluate(base, [{ code: 'OH', name: 'Ohio', coverage: 'expansion', holdHarmless: 'yes' }]);
  assert.equal(r.code, 'protected');
  assert.match(r.summary, /during its grace period/);
  assert.doesNotMatch(r.summary, /June|July|January/);
});
test('Nebraska does not promise a grace period or invent a January start', () => {
  const r = evaluate({ ...base, state: 'NE' }, states);
  assert.equal(r.code, 'at_risk');
  assert.match(r.summary, /Nebraska says it won’t use the grace period/);
  assert.match(r.summary, /application or renewal/);
  assert.doesNotMatch(r.summary, /January/);
});
test('unannounced, undecided and leaning states have unconfirmed timing', () => {
  for (const state of ['OH', 'WV', 'VA']) {
    const r = evaluate({ ...base, state }, states);
    assert.equal(r.code, 'timing_unknown');
    assert.match(r.title, /isn’t confirmed/);
    assert.match(r.summary, /Checking.*denying or ending coverage are separate/);
    assert.doesNotMatch(r.summary, /January|June|July/);
  }
});
test('waiver state adds caveat', () => {
  const r = evaluate({ ...base, state: 'WI' }, states);
  assert.equal(r.code, 'timing_unknown');
  assert.equal(r.caveats.length, 1);
});
test('state data has 51 jurisdictions and 44 covered', () => {
  assert.equal(states.length, 51);
  assert.equal(states.filter((s) => s.coverage !== 'none').length, 44);
  assert.equal(states.filter((s) => s.coverage === 'none').length, 7);
});
test('daysUntil counts calendar days', () => {
  assert.equal(daysUntil('2026-12-11', new Date(2026, 10, 22, 23, 0)), 19);
  assert.equal(daysUntil('2027-01-01', new Date(2026, 11, 31, 1, 0)), 1);
  assert.equal(daysUntil('2026-12-11', new Date(2026, 11, 12)), -1);
});
