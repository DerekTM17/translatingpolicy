// Guards the hand-curated data before every build:
// every item needs a date that matches a cliff, plain-language text, and at least one https source.
// Fails on em dashes or en dashes anywhere in the data (house style).
import { readFileSync } from 'node:fs';

const raw = readFileSync(new URL('../src/data/deadlines.json', import.meta.url), 'utf8');
const data = JSON.parse(raw);
const errors = [];

if (/[\u2013\u2014]/.test(raw)) errors.push('deadlines.json contains an en dash or em dash');
const cliffDates = new Set(data.cliffs.map((c) => c.date));
const ids = new Set();
for (const it of data.items) {
  if (ids.has(it.id)) errors.push(`duplicate id ${it.id}`);
  ids.add(it.id);
  if (!cliffDates.has(it.date)) errors.push(`${it.id}: date ${it.date} is not a cliff date`);
  for (const f of ['title', 'whatStops', 'whoFeelsIt', 'mechanics', 'citation']) {
    if (!it[f]) errors.push(`${it.id}: missing ${f}`);
  }
  if (!it.sources?.length) errors.push(`${it.id}: no sources`);
  for (const s of it.sources || []) if (!s.url?.startsWith('https://')) errors.push(`${it.id}: source not https`);
}

if (errors.length) {
  console.error('Data check failed:\n' + errors.map((e) => `  - ${e}`).join('\n'));
  process.exit(1);
}
console.log(`Data check passed: ${data.items.length} items across ${data.cliffs.length} deadlines.`);
