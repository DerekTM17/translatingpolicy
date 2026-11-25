import { useState } from 'react';
import { CHECK_LABELS } from '../lib.js';

export default function ChangeCard({ change }) {
  const [open, setOpen] = useState(false);
  return (
    <article id={change.id} className="card">
      <div className="tags">
        <span className="topic">{change.topic}</span>
        <span className="sec">{change.section}</span>
        <span className={`check check-${change.check}`}>{CHECK_LABELS[change.check]}</span>
      </div>
      <h3>{change.title}</h3>
      <p className="felt">{change.felt}</p>
      {change.numbers.length > 0 && (
        <div className="nums">
          {change.numbers.map((n) => (
            <p key={n.label} className="num">
              <a href={n.url} target="_blank" rel="noreferrer"><b>{n.value}</b></a>
              <span>{n.label}</span>
            </p>
          ))}
        </div>
      )}
      <p className="dim"><span className="lbl">Who notices</span>{change.who}</p>
      <button type="button" className="more" onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-controls={`${change.id}-mech`}>
        {open ? 'Hide how it works' : 'How it works'}
      </button>
      {open && (
        <div id={`${change.id}-mech`} className="mech">
          <p>{change.mechanics}</p>
          <ul>
            {change.sources.map((s) => (
              <li key={s.url}>
                <span className="kind">{s.kind}</span>
                <a className="src" href={s.url} target="_blank" rel="noreferrer">{s.label}</a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </article>
  );
}
