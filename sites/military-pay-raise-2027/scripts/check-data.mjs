// Build gate: fails the build if the pay data is malformed or a scenario is missing a grade.
import { readFileSync } from 'node:fs';
const data = JSON.parse(readFileSync(new URL('../src/data/pay.json', import.meta.url)));
const fail = (m) => { console.error(`check-data: ${m}`); process.exit(1); };
if (data.columns.length !== 22) fail('expected 22 years-of-service columns');
for (const g of data.grades) {
  if (g.pay2026.length !== 22) fail(`${g.grade}: expected 22 values`);
  let prev = 0;
  for (const v of g.pay2026) {
    if (v == null) continue;
    if (typeof v !== 'number' || v < 2000 || v > 20000) fail(`${g.grade}: odd value ${v}`);
    if (v < prev) fail(`${g.grade}: pay falls with service (${v} after ${prev})`);
    prev = v;
  }
  for (const k of Object.keys(data.scenarios)) {
    if (typeof data.scenarios[k].rates[g.grade] !== 'number') fail(`${k} has no rate for ${g.grade}`);
  }
}
console.log(`check-data: ${data.grades.length} grades OK`);
