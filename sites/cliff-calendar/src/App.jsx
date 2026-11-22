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
    <>
      <header className="nav">
        <div className="wrap">
          <a className="brand" href="https://translatingpolicy.com">Translating<span>/</span>Policy</a>
          <span className="here">Funding Cliff Calendar</span>
        </div>
      </header>

      <div className="wrap">
        <section className="hero">
          <p className="eyebrow">Congress, year-end deadlines</p>
          <h1>Two deadlines. <em>Three weeks.</em></h1>
          <p className="lede">
            Here is what stops for you on December 11 and December 31 if Congress misses them. Every item links to the law or a Congressional Research Service report.
          </p>

          <div className="tiles">
            {data.cliffs.map((c, i) => {
              const d = daysUntil(c.date);
              return (
                <a key={c.date} href={`#cliff-${c.date}`} className={`tile d${i}`}>
                  <span className="k">{c.label}</span>
                  <div className="n">{d >= 0 ? d : 0}<small>{d === 1 ? 'day' : 'days'}</small></div>
                  <p className="h">{c.headline}</p>
                  <p className="m">{counts[c.date]} items on this date</p>
                </a>
              );
            })}
          </div>

          <p className="status"><b>Status</b>{data.statusNote} Last checked {formatDate(data.lastVerified)}.</p>
        </section>

        <div className="sec-title"><h2>The next six weeks</h2><small>Today to Jan 8</small></div>
        <Timeline cliffs={data.cliffs} counts={counts} />
      </div>

      <section className="filters" aria-label="Filters">
        <div className="wrap">
          <div className="row">
            {[['all', 'Both dates'], ...data.cliffs.map((c) => [c.date, c.label])].map(([id, label]) => (
              <button key={id} type="button" className="chip" onClick={() => setWhen(id)} aria-pressed={when === id}>{label}</button>
            ))}
            <label className="state" htmlFor="state-select">
              <span>Your state</span>
              <select id="state-select" value={stateCode} onChange={(e) => setStateCode(e.target.value)}>
                <option value="">Pick one</option>
                {stateData.states.map((s) => <option key={s.code} value={s.code}>{s.name}</option>)}
              </select>
            </label>
          </div>
          <div className="chips">
            {WHO.map((w) => (
              <button key={w.id} type="button" className="chip" onClick={() => setWho(w.id)} aria-pressed={who === w.id}>{w.label}</button>
            ))}
          </div>
        </div>
      </section>

      <main className="wrap">
        {data.cliffs.map((c, i) => {
          const items = visible.filter((it) => it.date === c.date);
          if (!items.length) return null;
          return (
            <section key={c.date} id={`cliff-${c.date}`} className={`d${i}`}>
              <div className="sec-title">
                <h2><span className="tone">{formatDate(c.date, { month: 'short', day: 'numeric' })}</span> {c.headline}</h2>
                <small>{items.length} {items.length === 1 ? 'item' : 'items'}</small>
              </div>
              <p className="sec-lede">{c.summary}</p>
              <p className="law">Set by {c.law}.</p>
              <div className="cards">
                {items.map((it) => (
                  <DeadlineCard key={it.id} item={it} lastVerified={data.lastVerified} stateRow={stateRow} stateMeta={stateMeta} />
                ))}
              </div>
            </section>
          );
        })}
        {!visible.length && <p className="empty">Nothing matches those filters. Try Everything.</p>}

        <div className="sec-title"><h2>Not on this calendar</h2><small>Later deadlines</small></div>
        <p className="sec-lede">These come up in year-end coverage, but they do not end this December.</p>
        <ul className="offcal">
          {data.notOnCalendar.map((n) => (
            <li key={n.title}>
              <b>{n.title}</b>
              <p>{n.note}</p>
              {n.url && <a className="src" href={n.url} target="_blank" rel="noreferrer">{n.sourceLabel}</a>}
            </li>
          ))}
        </ul>

        <div className="sec-title"><h2>How we built this</h2><small>Method</small></div>
        <div className="method">
          <p>
            We read the stopgap law and Congressional Research Service reports, then wrote each item in plain words. The countdown counts calendar days in Eastern time. A lapse starts at 12:01 a.m. Eastern the day after the deadline.
          </p>
          <p>
            Status is checked by hand for now. If Congress passes a new law, we update the cards. We do not predict what Congress will do.
          </p>
          <p>
            State counts: health center patients come from HRSA's 2024 state pages. In this first version we have loaded {stateData.states.filter((s) => s.healthCenterPatients2024 != null).length} states; the rest link to the official page. The national total is {fmt.format(stateData.healthCenterPatients2024.national)} patients. Flood policy counts by state are in FEMA's file and are not loaded yet.
          </p>
          <p>A spreadsheet with every item, date, source link and method ships with this page's code.</p>
        </div>

        <footer className="site-footer">
          <span>Made by Translating Policy. Public sources only. Not legal advice.</span>
          <a href="https://translatingpolicy.com">&larr; Translating Policy</a>
        </footer>
      </main>
    </>
  );
}
