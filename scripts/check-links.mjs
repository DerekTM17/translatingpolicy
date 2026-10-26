// Pre-launch link checker: every project URL plus the apex must answer 2xx.
// Redirects are followed; a non-2xx status, timeout, or TLS error is a FAIL.
import { readFileSync } from 'node:fs';

const projects = JSON.parse(readFileSync(new URL('../src/data/projects.json', import.meta.url), 'utf8'));
const urls = [...projects.map((p) => p.url), 'https://translatingpolicy.com/'];

async function check(url) {
  try {
    const res = await fetch(url, { redirect: 'follow', signal: AbortSignal.timeout(15000) });
    return res.status >= 200 && res.status < 300
      ? { ok: true, detail: String(res.status) }
      : { ok: false, detail: String(res.status) };
  } catch (err) {
    const cause = err?.cause?.code ?? err?.cause?.message ?? err?.name ?? err?.message;
    return { ok: false, detail: String(cause) };
  }
}

const results = await Promise.all(urls.map(check));
let failed = 0;
urls.forEach((url, i) => {
  if (results[i].ok) console.log(`OK ${url}`);
  else {
    failed++;
    console.log(`FAIL ${url} ${results[i].detail}`);
  }
});
process.exit(failed ? 1 : 0);
