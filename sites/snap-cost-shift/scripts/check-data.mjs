// Fails the build if the state data drifts from the law's tier bands or loses rows.
import { readFileSync } from 'node:fs';
const rows = JSON.parse(readFileSync(new URL('../src/data/states.json', import.meta.url)));
const tier = (p) => (p < 6 ? 0 : p < 8 ? 5 : p < 10 ? 10 : 15);
let bad = 0;
if (rows.length !== 53) { console.error(`expected 53 rows, got ${rows.length}`); bad++; }
for (const r of rows) {
  if (tier(r.per) !== r.tier) { console.error(`${r.code}: tier ${r.tier} != ${tier(r.per)}`); bad++; }
  if ((r.per * 1.5 >= 20) !== r.delayFY2025) { console.error(`${r.code}: delay flag wrong`); bad++; }
  if (Math.abs(r.over + r.under - r.per) > 0.02) { console.error(`${r.code}: over+under != per`); bad++; }
  if (r.annualized !== r.aug2026 * 12) { console.error(`${r.code}: annualized wrong`); bad++; }
}
if (bad) process.exit(1);
console.log(`check-data: ${rows.length} rows ok`);
