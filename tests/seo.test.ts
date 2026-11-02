import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

// dist/ is built once by tests/global-setup.ts.
const html = readFileSync('dist/index.html', 'utf8');

function meta(attr: 'property' | 'name', key: string): string | undefined {
  const re = new RegExp(`<meta ${attr}="${key.replace(/[:.]/g, '\\$&')}" content="([^"]*)"`);
  return html.match(re)?.[1];
}

describe('SEO head tags', () => {
  it('has a descriptive <title>', () => {
    expect(html).toContain(
      '<title>Translating Policy: free tools that turn public policy into plain facts</title>',
    );
  });
  it('keeps the short name for og:title and og:site_name', () => {
    expect(meta('property', 'og:title')).toBe('Translating Policy');
    expect(meta('property', 'og:site_name')).toBe('Translating Policy');
  });
  it('has og:image with size and alt text', () => {
    expect(meta('property', 'og:image')).toBe('https://translatingpolicy.com/og-image.png');
    expect(meta('property', 'og:image:width')).toBe('1200');
    expect(meta('property', 'og:image:height')).toBe('630');
    expect(meta('property', 'og:image:alt')).toBeTruthy();
  });
  it('has the Twitter large-image card', () => {
    expect(meta('name', 'twitter:card')).toBe('summary_large_image');
    expect(meta('name', 'twitter:title')).toBe('Translating Policy');
    expect(meta('name', 'twitter:description')).toBe(meta('property', 'og:description'));
    expect(meta('name', 'twitter:image')).toBe('https://translatingpolicy.com/og-image.png');
  });
  it('links the apple-touch-icon', () => {
    expect(html).toContain('<link rel="apple-touch-icon" href="/apple-touch-icon.png"');
  });
});

describe('JSON-LD', () => {
  const block = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
  const data = JSON.parse(block?.[1] ?? '[]') as Record<string, unknown>[];

  it('describes the WebSite', () => {
    expect(data).toContainEqual(
      expect.objectContaining({
        '@type': 'WebSite',
        name: 'Translating Policy',
        url: 'https://translatingpolicy.com/',
      }),
    );
  });
  it('describes the Person from about.json', () => {
    const about = JSON.parse(readFileSync('src/data/about.json', 'utf8'));
    expect(data).toContainEqual(
      expect.objectContaining({ '@type': 'Person', name: about.name, jobTitle: about.title }),
    );
  });
});

describe('static SEO files in the build', () => {
  it('ships robots.txt pointing at the sitemap', () => {
    const robots = readFileSync('dist/robots.txt', 'utf8');
    expect(robots).toMatch(/^User-agent: \*$/m);
    expect(robots).toMatch(/^Allow: \/$/m);
    expect(robots).toContain('Sitemap: https://translatingpolicy.com/sitemap-index.xml');
  });
  it('ships a sitemap that lists the home page', () => {
    expect(readFileSync('dist/sitemap-index.xml', 'utf8')).toContain('sitemap-0.xml');
    expect(readFileSync('dist/sitemap-0.xml', 'utf8')).toContain(
      '<loc>https://translatingpolicy.com/</loc>',
    );
  });
  it('ships the og-image and the apple-touch-icon', () => {
    expect(existsSync('dist/og-image.png')).toBe(true);
    expect(existsSync('dist/apple-touch-icon.png')).toBe(true);
  });
});
