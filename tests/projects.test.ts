import { describe, expect, it } from 'vitest';
import { getProjects, validateProjects } from '../src/lib/projects';

const ACCENTS = ['congress', 'state', 'attractor', 'inflation', 'war'];

describe('projects data', () => {
  const projects = getProjects();
  it('has the five projects in order', () => {
    expect(projects.map((p) => p.id)).toEqual(['congress', 'statehouse', 'attractor', 'inflation', 'iranwar']);
  });
  it('uses translatingpolicy.com subdomain urls', () => {
    for (const p of projects) expect(p.url).toMatch(/^https:\/\/[a-z]+\.translatingpolicy\.com\/?$/);
  });
  it('uses an allowed accent', () => {
    for (const p of projects) expect(ACCENTS).toContain(p.accent);
  });
  it('throws when a description is missing', () => {
    const bad = [{ id: 'x', title: 'X', host: 'x.', url: 'https://x.translatingpolicy.com', status: 'Live', stat: 's', accent: 'congress' }];
    expect(() => validateProjects(bad)).toThrow(/description/);
  });
});
