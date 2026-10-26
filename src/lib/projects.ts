import raw from '../data/projects.json';

export type Accent = 'congress' | 'state' | 'attractor' | 'inflation';

export type Project = {
  id: string;
  title: string;
  /** Subdomain code shown on the row, e.g. "uscongress." */
  host: string;
  url: string;
  status: 'Live';
  statusNote?: string;
  description: string;
  stat: string;
  accent: Accent;
};

const ACCENTS: Accent[] = ['congress', 'state', 'attractor', 'inflation'];
const REQUIRED = ['id', 'title', 'host', 'url', 'description', 'stat'] as const;

/** Check the raw JSON and return typed projects in file order. Throws on bad data. */
export function validateProjects(data: unknown): Project[] {
  if (!Array.isArray(data)) throw new Error('projects: expected an array');
  return data.map((item, i) => {
    const p = item as Record<string, unknown>;
    for (const key of REQUIRED) {
      if (typeof p?.[key] !== 'string' || !(p[key] as string).trim()) {
        throw new Error(`projects[${i}]: missing or empty "${key}"`);
      }
    }
    if (p.status !== 'Live') throw new Error(`projects[${i}]: status must be "Live"`);
    if (!ACCENTS.includes(p.accent as Accent)) throw new Error(`projects[${i}]: bad accent "${p.accent}"`);
    if (p.statusNote !== undefined && typeof p.statusNote !== 'string') {
      throw new Error(`projects[${i}]: statusNote must be a string`);
    }
    return p as unknown as Project;
  });
}

export function getProjects(): Project[] {
  return validateProjects(raw);
}
