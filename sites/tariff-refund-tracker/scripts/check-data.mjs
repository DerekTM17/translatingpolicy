// Fails the build if the data file is internally inconsistent.
import { readFileSync } from 'node:fs';

const d = JSON.parse(readFileSync(new URL('../src/data/refunds.json', import.meta.url)));
const errs = [];
const ids = new Set(d.sources.map((s) => s.id));
const need = (id, where) => { if (!ids.has(id)) errs.push(`${where}: unknown source ${id}`); };

need(d.totals.ieepaCollectedSource, 'totals.collected');
need(d.totals.mayStaySource, 'totals.mayStay');
need(d.totals.householdsSource, 'totals.households');
need(d.capeSnapshot.source, 'capeSnapshot');
need(d.coverageSource, 'coverage');
need(d.consumerRoute.source, 'consumerRoute');

let prev = '';
for (const m of d.milestones) {
  need(m.source, `milestone ${m.date}`);
  if (m.date <= prev) errs.push(`milestones out of order at ${m.date}`);
  if (m.billions > d.totals.ieepaCollectedBillions) errs.push(`milestone ${m.date} exceeds total collected`);
  prev = m.date;
}
prev = '';
for (const t of d.timeline) {
  need(t.source, `timeline ${t.date}`);
  if (t.date <= prev) errs.push(`timeline out of order at ${t.date}`);
  prev = t.date;
}
for (const s of d.sources) if (!/^https:\/\//.test(s.url)) errs.push(`source ${s.id} url not https`);
const text = readFileSync(new URL('../src/data/refunds.json', import.meta.url), 'utf8');
if (/[\u2013\u2014]/.test(text)) errs.push('data contains an en or em dash');

if (errs.length) { console.error(errs.join('\n')); process.exit(1); }
console.log(`check-data: ok (${d.milestones.length} milestones, ${d.timeline.length} timeline events, ${d.sources.length} sources)`);
