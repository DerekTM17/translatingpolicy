import { daysUntil, formatDate, toDate } from '../lib/dates.js';

const MILESTONES = [
  { date: '2026-12-11', label: 'States tell CMS if they will wait', note: 'CMS asked states to say by this date whether they will use the grace period.' },
  { date: '2027-01-01', label: 'The rule starts', note: 'Every covered state must be checking work, school, or income by now.' },
  { date: '2027-06-30', label: 'The grace period ends', note: 'In states that took it, coverage can be cut for this rule after this day.' },
];

export default function Countdown({ today }) {
  const now = toDate(today);
  return (
    <section aria-labelledby="countdown-h" className="mt-8">
      <h2 id="countdown-h" className="sr-only">Countdown</h2>
      <ol className="grid gap-3 sm:grid-cols-3">
        {MILESTONES.map((m) => {
          const d = daysUntil(m.date, now);
          return (
            <li key={m.date} className="card p-4 card-hot">
              <p className="label text-accent">{formatDate(m.date)}</p>
              <p className="big-num mt-1 text-4xl">
                {d > 0 ? d : d === 0 ? 'Today' : 'Passed'}
                {d > 0 && <span className="ml-1 text-base font-normal muted">{d === 1 ? 'day' : 'days'}</span>}
              </p>
              <p className="mt-1 font-semibold">{m.label}</p>
              <p className="mt-1 text-sm muted">{m.note}</p>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
