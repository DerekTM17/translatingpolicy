import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { checkData, nextStep, voteTotal, yeaShare, formatDate } from '../src/lib.js';

const raw = readFileSync(new URL('../src/data/bill.json', import.meta.url), 'utf8');
const data = JSON.parse(raw);

test('shipped data passes every check', () => {
  assert.deepEqual(checkData(raw), []);
});

test('final passage matches the senate.gov record (roll call 270: 62 yea, 33 nay, 5 not voting)', () => {
  const v = data.votes.find((x) => x.roll === 270);
  assert.equal(v.date, '2026-11-19');
  assert.deepEqual([v.yea, v.nay, v.notVoting], [62, 33, 5]);
  assert.equal(voteTotal(v), 100);
  assert.equal(yeaShare(v), 65);
});

test('the page never says the bill is law: the next step is the House vote', () => {
  const next = nextStep(data.steps);
  assert.match(next.label, /House/);
  assert.equal(next.done, false);
  assert.match(data.statusNote, /not law/i);
});

test('check catches bad data', () => {
  const bad = structuredClone(data);
  bad.votes[0].yea += 1;
  bad.changes[0].sources = [];
  bad.sides.support.pop();
  bad.myths[0].fact = 'A fact — with a dash';
  const errors = checkData(JSON.stringify(bad));
  assert.ok(errors.some((e) => e.includes('add to 101')));
  assert.ok(errors.some((e) => e.includes('no sources')));
  assert.ok(errors.some((e) => e.includes('balance rule')));
  assert.ok(errors.some((e) => e.includes('dash')));
});

test('a finished step without a source is rejected', () => {
  const bad = structuredClone(data);
  bad.steps[0].source = { label: 'x', url: 'http://insecure' };
  assert.ok(checkData(JSON.stringify(bad)).some((e) => e.includes('https source')));
});

test('dates format in UTC so they never shift a day', () => {
  assert.equal(formatDate('2026-11-19'), 'November 19, 2026');
});

test('Who’s worried section: tribes first, every worry sourced and answered', () => {
  const d = JSON.parse(raw);
  assert.ok(d.concerns.length >= 5);
  assert.equal(d.concerns[0].id, 'tribes-106');
  for (const c of d.concerns) {
    assert.ok(c.critics.length > 0, `${c.id} names who raises it`);
    assert.ok(c.response || c.noResponse, `${c.id} shows the other side or says none was found`);
  }
  // Only items we read in the bill text may carry the "text" label.
  const textIds = d.concerns.filter((c) => c.check === 'text').map((c) => c.id).sort();
  assert.deepEqual(textIds, ['courts', 'less-review']);
});

test('checkData rejects a worry with no supporter response and no note', () => {
  const d = JSON.parse(raw);
  delete d.concerns[1].response;
  delete d.concerns[1].noResponse;
  const errs = checkData(JSON.stringify(d));
  assert.ok(errs.some((e) => e.includes('supporter response')), errs.join('; '));
});
