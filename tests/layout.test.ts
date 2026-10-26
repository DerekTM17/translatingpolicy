import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

// dist/ is built once by tests/global-setup.ts.
const html = readFileSync('dist/index.html', 'utf8');

describe('BaseLayout head', () => {
  it('has the site title', () => {
    expect(html).toMatch(/<title>[^<]*Translating Policy[^<]*<\/title>/);
  });
  it('loads the ATTRACTOR fonts', () => {
    expect(html).toContain('family=Chakra+Petch');
  });
  it('has the canonical link', () => {
    expect(html).toContain('<link rel="canonical" href="https://translatingpolicy.com/"');
  });
  it('has og:url', () => {
    expect(html).toMatch(/<meta property="og:url" content="https:\/\/translatingpolicy\.com\/"/);
  });
});
