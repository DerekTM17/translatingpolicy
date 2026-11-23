import assert from 'node:assert/strict';
import { test } from 'node:test';
import * as dates from '../src/lib/dates.js';

test('milestone countdown advances at the viewer’s local midnight, including the deadline day', () => {
  const before = new Date(2026, 11, 10, 23, 59, 59);
  const midnight = new Date(2026, 11, 11);
  const after = new Date(2026, 11, 12);
  assert.deepEqual([before, midnight, after].map(dates.localDayKey), ['2026-12-10', '2026-12-11', '2026-12-12']);
  assert.deepEqual([before, midnight, after].map((date) => dates.daysUntil('2026-12-11', dates.toDate(dates.localDayKey(date)))), [1, 0, -1]);
  assert.equal(dates.localDayKey(new Date(2027, 0, 1)), '2027-01-01');
});

test('open and resumed tabs check the current local date, with listener cleanup', () => {
  const win = new EventTarget();
  const doc = new EventTarget();
  let tick;
  let cleared;
  win.setInterval = (callback, ms) => { assert.equal(ms, 15_000); tick = callback; return 12; };
  win.clearInterval = (id) => { cleared = id; };
  let checks = 0;
  const stop = dates.subscribeToLocalDay(() => { checks += 1; }, win, doc);
  tick();
  win.dispatchEvent(new Event('focus'));
  win.dispatchEvent(new Event('pageshow'));
  doc.dispatchEvent(new Event('visibilitychange'));
  assert.equal(checks, 4);
  stop();
  assert.equal(cleared, 12);
  win.dispatchEvent(new Event('focus'));
  win.dispatchEvent(new Event('pageshow'));
  doc.dispatchEvent(new Event('visibilitychange'));
  assert.equal(checks, 4);
});
