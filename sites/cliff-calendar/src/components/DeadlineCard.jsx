import { useState } from 'react';
import { countdownText, formatDate } from '../lib.js';

const dateClass = { '2026-12-11': 'd0', '2026-12-31': 'd1' };

export default function DeadlineCard({ item, days, lastVerified, stateRow, stateMeta }) {
  const [open, setOpen] = useState(false);
  const passed = days < 0;

  let stateLine = null;
  if (stateRow && item.reach?.stateKey) {
    const key = item.reach.stateKey;
    const value = stateRow[key];
    const meta = stateMeta[key];
    if (value != null) {
      stateLine = (
        <p className="stateline"><b>{stateRow.name}:</b> {value.toLocaleString('en-US')} {meta.label.toLowerCase()}.</p>
      );
    } else {
      const href = key === 'healthCenterPatients2024' ? stateRow.healthCenterUrl : meta.nationalUrl;
      stateLine = (
        <p className="stateline missing">
          We have not loaded {stateRow.name}'s count yet.{' '}
          <a className="src" href={href} target="_blank" rel="noreferrer">See the official number</a>.
        </p>
      );
    }
  }

  return (
    <article id={item.id} className={`card ${dateClass[item.date] || 'd0'}`}>
      <div className="tags">
        <span className="when">{formatDate(item.date, { month: 'short', day: 'numeric' })}</span>
        <span className="count">{countdownText(days)}</span>
        <span className={passed ? 'pending passed' : 'pending'}>{passed ? 'Check status' : 'Pending in Congress'}</span>
      </div>

      <h3>{item.title}</h3>

      <p><span className="lbl">What stops</span>{item.whatStops}</p>
      <p className="dim"><span className="lbl">Who feels it</span>{item.whoFeelsIt}</p>

      {item.reach && (
        <p className="reach"><b>{item.reach.value}</b><span>{item.reach.label}</span></p>
      )}
      {item.extra && <p className="small">{item.extra}</p>}
      {stateLine}

      {item.list && (
        <ul className="list">
          {item.list.map((li) => <li key={li}>{li}</li>)}
        </ul>
      )}

      <button type="button" className="more" onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-controls={`${item.id}-mech`}>
        {open ? 'Hide how it works' : 'How it works'}
      </button>
      {open && (
        <div id={`${item.id}-mech`} className="mech">
          <p>{item.mechanics}</p>
          <p><span className="lbl">Law</span>{item.citation}</p>
          <ul>
            {item.sources.map((s) => (
              <li key={s.url}>
                <span className="kind">{s.kind}</span>
                <a className="src" href={s.url} target="_blank" rel="noreferrer">{s.label}</a>
              </li>
            ))}
          </ul>
          <p className="checked">Last checked {formatDate(lastVerified)}.</p>
        </div>
      )}
    </article>
  );
}
