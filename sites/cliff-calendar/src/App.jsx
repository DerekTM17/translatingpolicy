import { useMemo, useState } from 'react';
import data from './data/deadlines.json';
import stateData from './data/states.json';
import Timeline from './components/Timeline.jsx';
import DeadlineCard from './components/DeadlineCard.jsx';
import { daysUntil, formatDate, fmt } from './lib.js';

const WHO = [
  { id: 'all', label: 'Everything' },
  { id: 'homeowners', label: 'Home buyers' },
  { id: 'families', label: 'Families' },
  { id: 'health', label: 'Patients and doctors' },
  { id: 'seniors', label: 'Seniors' },
  { id: 'workers', label: 'Workers and employers' },
  { id: 'farmers', label: 'Farmers' },
  { id: 'veterans', label: 'Veterans' },
  { id: 'local-government', label: 'Local government' },
];

const cliffTone = ['text-cliff11', 'text-cliff31'];

export default function App() {
  const [when, setWhen] = useState('all');
  const [who, setWho] = useState('all');
  const [stateCode, setStateCode] = useState('');

  const counts = useMemo(() => {
    const c = {};
    data.items.forEach((it) => { c[it.date] = (c[it.date] || 0) + 1; });
    return c;
  }, []);

  const stateRow = stateData.states.find((s) => s.code === stateCode) || null;
  const stateMeta = { healthCenterPatients2024: stateData.healthCenterPatients2024, nfipPolicies: stateData.nfipPolicies };

  const visible = data.items.filter((it) =>
    (when === 'all' || it.date === when) && (who === 'all' || it.tags.includes(who) || it.tags.includes('everyone')),
  );

  return (
    <div className="min-h-screen">
      <header className="bg-ink text-white">
        <div className="mx-auto max-w-5xl px-4 pb-10 pt-6 sm:px-6">
          <nav className="flex items-center justify-between text-sm text-slate-300">
            <a href="https://translatingpolicy.com" className="font-semibold text-white">translating.policy</a>
            <span>The Cliff Calendar</span>
          </nav>
          <h1 className="mt-10 text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
            Two deadlines. Three weeks.
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-slate-200">
            Here is what stops for you on December 11 and December 31 if Congress misses them. Every item links to the law or a Congressional Research Service report.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {data.cliffs.map((c, i) => {
              const d = daysUntil(c.date);
              return (
                <a key={c.date} href={`#cliff-${c.date}`} className="block rounded-2xl bg-white/5 p-5 ring-1 ring-white/10 transition hover:bg-white/10">
                  <p className={`text-sm font-semibold uppercase tracking-wide ${cliffTone[i]}`}>{c.label}</p>
                  <p className="mt-1 text-5xl font-extrabold tabular-nums">{d >= 0 ? d : 0}<span className="ml-2 text-xl font-semibold text-slate-300">{d === 1 ? 'day' : 'days'}</span></p>
                  <p className="mt-2 font-semibold">{c.headline}</p>
                  <p className="mt-1 text-sm text-slate-300">{counts[c.date]} items on this date</p>
                </a>
              );
            })}
          </div>

          <p className="mt-6 rounded-xl bg-emerald-400/10 px-4 py-3 text-sm text-emerald-100 ring-1 ring-emerald-300/20">
            <span className="font-semibold text-emerald-50">Status:</span> {data.statusNote} Last checked {formatDate(data.lastVerified)}.
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 sm:px-6">
        <section className="-mt-4 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200 sm:p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">The next six weeks</h2>
          <Timeline cliffs={data.cliffs} counts={counts} />
        </section>

        <section className="sticky top-0 z-10 -mx-4 mt-8 border-b border-slate-200 bg-paper/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6" aria-label="Filters">
          <div className="flex flex-wrap items-center gap-2">
            {[['all', 'Both dates'], ...data.cliffs.map((c) => [c.date, c.label])].map(([id, label]) => (
              <button key={id} type="button" onClick={() => setWhen(id)} aria-pressed={when === id}
                className={`rounded-full px-3 py-1.5 text-sm font-semibold ring-1 ${when === id ? 'bg-ink text-white ring-ink' : 'bg-white text-slate-700 ring-slate-300 hover:ring-slate-500'}`}>
                {label}
              </button>
            ))}
            <label className="ml-auto flex items-center gap-2 text-sm">
              <span className="font-semibold">Your state</span>
              <select value={stateCode} onChange={(e) => setStateCode(e.target.value)}
                className="rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-sm">
                <option value="">Pick one</option>
                {stateData.states.map((s) => <option key={s.code} value={s.code}>{s.name}</option>)}
              </select>
            </label>
          </div>
          <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
            {WHO.map((w) => (
              <button key={w.id} type="button" onClick={() => setWho(w.id)} aria-pressed={who === w.id}
                className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ring-1 ${who === w.id ? 'bg-slate-800 text-white ring-slate-800' : 'bg-white text-slate-600 ring-slate-300 hover:ring-slate-500'}`}>
                {w.label}
              </button>
            ))}
          </div>
        </section>

        {data.cliffs.map((c, i) => {
          const items = visible.filter((it) => it.date === c.date);
          if (!items.length) return null;
          return (
            <section key={c.date} id={`cliff-${c.date}`} className="mt-10 scroll-mt-28">
              <h2 className="text-2xl font-extrabold tracking-tight">
                <span className={cliffTone[i]}>{formatDate(c.date, { month: 'long', day: 'numeric' })}:</span> {c.headline}
              </h2>
              <p className="mt-1 max-w-3xl text-slate-700">{c.summary}</p>
              <p className="mt-1 text-xs text-slate-500">Set by {c.law}.</p>
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                {items.map((it) => (
                  <DeadlineCard key={it.id} item={it} lastVerified={data.lastVerified} stateRow={stateRow} stateMeta={stateMeta} />
                ))}
              </div>
            </section>
          );
        })}
        {!visible.length && <p className="mt-10 text-slate-600">Nothing matches those filters. Try Everything.</p>}

        <section className="mt-14">
          <h2 className="text-xl font-bold">Not on this calendar</h2>
          <p className="mt-1 text-slate-700">These come up in year-end coverage, but they do not end this December.</p>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {data.notOnCalendar.map((n) => (
              <li key={n.title} className="rounded-xl bg-white p-4 text-sm ring-1 ring-slate-200">
                <p className="font-semibold">{n.title}</p>
                <p className="mt-1 text-slate-700">{n.note}</p>
                {n.url && <a className="mt-1 inline-block text-xs text-slate-500 underline" href={n.url} target="_blank" rel="noreferrer">{n.sourceLabel}</a>}
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-14 rounded-2xl bg-white p-6 text-sm leading-relaxed text-slate-700 ring-1 ring-slate-200">
          <h2 className="text-lg font-bold text-slate-900">How we built this</h2>
          <p className="mt-2">
            We read the stopgap law and Congressional Research Service reports, then wrote each item in plain words. The countdown counts calendar days in Eastern time. A lapse starts at 12:01 a.m. Eastern the day after the deadline.
          </p>
          <p className="mt-2">
            Status is checked by hand for now. If Congress passes a new law, we update the cards. We do not predict what Congress will do.
          </p>
          <p className="mt-2">
            State counts: health center patients come from HRSA's 2024 state pages. In this first version we have loaded {stateData.states.filter((s) => s.healthCenterPatients2024 != null).length} states; the rest link to the official page. The national total is {fmt.format(stateData.healthCenterPatients2024.national)} patients. Flood policy counts by state are in FEMA's file and are not loaded yet.
          </p>
          <p className="mt-2">A spreadsheet with every item, date, source link and method ships with this page's code.</p>
        </section>
      </main>

      <footer className="mx-auto mt-12 max-w-5xl px-4 pb-12 text-xs text-slate-500 sm:px-6">
        <p>Made by translating.policy. Public sources only. Not legal advice.</p>
      </footer>
    </div>
  );
}
