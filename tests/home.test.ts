import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { getProjects } from '../src/lib/projects';
import hero from '../src/data/hero.json';

// dist/ is built once by tests/global-setup.ts; never build here.
const html = readFileSync('dist/index.html', 'utf8');

/** All CSS the page ships: linked files in dist/_astro plus inline <style> blocks. */
function builtCss(): string {
  const parts: string[] = [];
  const dir = 'dist/_astro';
  if (existsSync(dir)) {
    for (const f of readdirSync(dir)) if (f.endsWith('.css')) parts.push(readFileSync(join(dir, f), 'utf8'));
  }
  for (const m of html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)) parts.push(m[1]);
  // Minifiers drop spaces ("(hover: hover)" -> "(hover:hover)"); compare without whitespace.
  return parts.join('\n').replace(/\s+/g, '');
}

/** Bodies of every `@media <query>{...}` block, found by brace matching. */
function mediaBlocks(css: string, query: string): { start: number; end: number; body: string }[] {
  const head = `@media${query}{`;
  const out: { start: number; end: number; body: string }[] = [];
  let i = css.indexOf(head);
  while (i !== -1) {
    let depth = 0;
    let j = i + head.length - 1;
    for (; j < css.length; j++) {
      if (css[j] === '{') depth++;
      else if (css[j] === '}' && --depth === 0) break;
    }
    out.push({ start: i, end: j + 1, body: css.slice(i + head.length, j) });
    i = css.indexOf(head, j);
  }
  return out;
}

/** Rule selector lists (the text before each `{`), excluding at-rule headers. */
function selectorLists(css: string): string[] {
  return [...css.matchAll(/([^{};]+)\{/g)].map((m) => m[1]).filter((s) => !s.startsWith('@'));
}

const css = builtCss();

describe('home page: menu', () => {
  it('links to #projects, #mission and #about', () => {
    const nav = html.match(/<nav\b[\s\S]*?<\/nav>/)?.[0] ?? '';
    for (const href of ['#projects', '#mission', '#about']) {
      expect(nav).toContain(`href="${href}"`);
    }
  });
});

describe('home page: hero', () => {
  it('has the headline', () => {
    const h1 = html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/)?.[1] ?? '';
    const text = h1.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
    expect(text).toBe('Government, in plain English.');
  });
  it('links the before/after example to its source', () => {
    const block = html.match(/<div\b[^>]*class="translate[^"]*"[\s\S]*?<\/figure>|<figure\b[^>]*class="translate[^"]*"[\s\S]*?<\/figure>/)?.[0] ?? '';
    expect(hero.before.sourceUrl).toMatch(/^https:\/\/www\.congress\.gov\//);
    expect(block).toContain(`href="${hero.before.sourceUrl}"`);
  });
});

describe('home page: project rows', () => {
  const rows = [...html.matchAll(/<a\b([^>]*\bclass="rowc"[^>]*)>/g)].map((m) => m[1]);
  it('renders exactly one row per project', () => {
    expect(rows).toHaveLength(4);
  });
  it('links rows to the project URLs in order, each with data-p', () => {
    const projects = getProjects();
    expect(rows).toHaveLength(projects.length);
    rows.forEach((attrs, i) => {
      expect(attrs).toContain(`href="${projects[i].url}"`);
      expect(attrs).toContain(`data-p="${projects[i].accent}"`);
    });
  });
  it('gives each row a spotlight span', () => {
    expect(html.match(/<span\b[^>]*class="spot"/g) ?? []).toHaveLength(4);
  });
});

describe('home page: about', () => {
  it('shows 3 principles', () => {
    const about = html.match(/<section\b[^>]*id="about"[\s\S]*?<\/section>/)?.[0] ?? '';
    const list = about.match(/<ul\b[^>]*class="principles"[\s\S]*?<\/ul>/)?.[0] ?? '';
    expect(list.match(/<li\b/g) ?? []).toHaveLength(3);
  });
});

describe('home page: motion and touch CSS', () => {
  it('has reduced-motion and hover:none media queries', () => {
    expect(css).toContain('@media(prefers-reduced-motion:reduce)');
    expect(css).toContain('@media(hover:none)');
  });
  it('keeps every .rowc:hover rule inside @media (hover: hover)', () => {
    const blocks = mediaBlocks(css, '(hover:hover)');
    expect(blocks.some((b) => b.body.includes('.rowc:hover'))).toBe(true);
    let outside = css;
    for (const b of [...blocks].reverse()) outside = outside.slice(0, b.start) + outside.slice(b.end);
    expect(outside).not.toContain('.rowc:hover');
  });
  it('pairs .rowc:focus-visible with .rowc:hover in the same rule', () => {
    const hoverRules = selectorLists(css).filter((s) => s.includes('.rowc:hover'));
    expect(hoverRules.length).toBeGreaterThan(0);
    for (const sel of hoverRules) expect(sel).toContain('.rowc:focus-visible');
  });
  it('plays the wave from the mockup', () => {
    expect(css).toMatch(/@keyframeswave\{/);
    expect(css).toMatch(/\.rowc::?after\{/); // minifier may write :after
  });
});
