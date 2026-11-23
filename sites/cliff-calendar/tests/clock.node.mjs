import assert from 'node:assert/strict';
import { test } from 'node:test';
import * as clock from '../src/lib.js';

const at = (iso) => new Date(iso);

test('Eastern calendar date rolls over at Eastern midnight, not UTC midnight', () => {
  assert.equal(clock.todayInEastern(at('2026-11-23T04:59:59.999Z')), '2026-11-22');
  assert.equal(clock.todayInEastern(at('2026-11-23T05:00:00.000Z')), '2026-11-23');
  assert.equal(clock.todayInEastern(at('2026-07-02T03:59:59.999Z')), '2026-07-01');
  assert.equal(clock.todayInEastern(at('2026-07-02T04:00:00.000Z')), '2026-07-02');
});

test('one Eastern date drives both deadline counts and day-of/past states', () => {
  assert.deepEqual(['2026-12-11', '2026-12-31'].map((date) => clock.daysBetween('2026-11-23', date)), [18, 38]);
  assert.equal(clock.countdownText(clock.daysBetween('2026-12-10', '2026-12-11')), '1 day left');
  assert.equal(clock.countdownText(clock.daysBetween('2026-12-11', '2026-12-11')), 'Today');
  assert.equal(clock.countdownText(clock.daysBetween('2026-12-12', '2026-12-11')), 'Deadline passed');
  assert.equal(clock.daysBetween('2026-12-31', '2027-01-01'), 1);
});

test('clock subscription checks open tabs and resumes promptly; unsubscribing cleans up', () => {
  const win = new EventTarget();
  const doc = new EventTarget();
  let tick;
  let cleared;
  win.setInterval = (callback, delay) => { assert.equal(delay, 15_000); tick = callback; return 42; };
  win.clearInterval = (id) => { cleared = id; };
  let checks = 0;
  const unsubscribe = clock.subscribeToEasternDay(() => { checks += 1; }, win, doc);
  tick();
  win.dispatchEvent(new Event('focus'));
  win.dispatchEvent(new Event('pageshow'));
  doc.dispatchEvent(new Event('visibilitychange'));
  assert.equal(checks, 4);
  unsubscribe();
  assert.equal(cleared, 42);
  win.dispatchEvent(new Event('focus'));
  win.dispatchEvent(new Event('pageshow'));
  doc.dispatchEvent(new Event('visibilitychange'));
  assert.equal(checks, 4);
});
