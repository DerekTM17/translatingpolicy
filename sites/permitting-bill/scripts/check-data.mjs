// Guards the hand-curated data before every build. See checkData in src/lib.js for the rules:
// votes add to 100, every change and claim has an https source, supporters and opponents are balanced,
// and no em or en dashes (house style).
import { readFileSync } from 'node:fs';
import { checkData } from '../src/lib.js';

const raw = readFileSync(new URL('../src/data/bill.json', import.meta.url), 'utf8');
const errors = checkData(raw);
if (errors.length) {
  console.error('Data check failed:\n' + errors.map((e) => `  - ${e}`).join('\n'));
  process.exit(1);
}
const data = JSON.parse(raw);
console.log(`Data check passed: ${data.changes.length} changes, ${(data.concerns || []).length} concerns, ${data.votes.length} roll calls, ${data.steps.length} steps.`);
