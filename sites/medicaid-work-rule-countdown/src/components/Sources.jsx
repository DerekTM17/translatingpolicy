import sources from '../data/sources.json';
import { formatDate } from '../lib/dates.js';

const UNKNOWNS = [
  'Which states will use the grace period. CMS asked states to say by Dec 11, 2026, but has not said it will publish the list. This page shows only public statements.',
  'Whether CMS appeals the Oct 29 court ruling, and whether a higher court pauses it.',
  'How the Nov 5 lawsuit by Oregon, Minnesota, New Mexico and Washington turns out.',
  'Which Tennessee TennCare members are covered, and what replaces Georgia Pathways after its waiver ends in 2026.',
  'How many people are enrolled in the adult group in each state. We plan to add federal enrollment data in the next version.',
];

export default function Sources() {
  return (
    <section id="sources" aria-labelledby="sources-h" className="mt-16">
      <h2 id="sources-h" className="font-serif text-3xl font-bold">What we do not know yet</h2>
      <ul className="mt-4 max-w-3xl list-disc space-y-1 pl-5">
        {UNKNOWNS.map((u) => <li key={u}>{u}</li>)}
      </ul>

      <h2 className="mt-12 font-serif text-3xl font-bold">Sources and method</h2>
      <p className="mt-2 max-w-3xl muted">
        Rules come from federal primary sources first: the CMS rule and fact sheet, the Federal Register, and CMS guidance letters. State choices come from public statements by governors and state agencies as reported by news and trade outlets, each dated. When a state has said nothing public, we say so. Nothing on this page is estimated or invented. All facts checked Nov 22, 2026.
      </p>
      <p className="mt-3">
        {import.meta.env.VITE_NO_DOWNLOADS ? (
          <span className="muted">The data, sources and method workbook (.xlsx) ships with the site files and is linked on the live page.</span>
        ) : (
          <a className="focus-ring font-semibold text-accent underline underline-offset-4" href="medicaid-work-rule-countdown_sources.xlsx" download>
            Download the data, sources and method (.xlsx)
          </a>
        )}
      </p>
      <ol className="mt-6 space-y-3 text-sm">
        {sources.map((s) => (
          <li key={s.id} className="card p-3">
            <a className="font-semibold underline underline-offset-2" href={s.url} target="_blank" rel="noreferrer">{s.title}</a>
            <p className="muted">
              {s.publisher}, {s.date.length === 10 ? formatDate(s.date) : s.date} | {s.type}
            </p>
            <p className="mt-1">Used for: {s.usedFor}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
