// Fails production builds while "[DEREK:" placeholders remain in src/.
// Usage: node scripts/check-placeholders.mjs [--strict] [dir]   (dir defaults to src/)
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const args = process.argv.slice(2);
const strict = args.includes('--strict') || process.env.VERCEL_ENV === 'production';
const root = args.find((a) => !a.startsWith('--')) ?? 'src';
const MARKER = '[DEREK:';

function* walk(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) yield* walk(p);
    else yield p;
  }
}

const hits = [];
for (const file of walk(root)) {
  readFileSync(file, 'utf8').split('\n').forEach((line, i) => {
    if (line.includes(MARKER)) hits.push(`${file}:${i + 1}`);
  });
}

if (hits.length) {
  const list = hits.map((h) => `  ${h}`).join('\n');
  if (strict) {
    console.error(`ERROR: ${hits.length} "${MARKER}" placeholder(s) remain:\n${list}`);
    process.exit(1);
  }
  console.warn(`Warning: ${hits.length} "${MARKER}" placeholder(s) remain (production builds will fail):\n${list}`);
}
