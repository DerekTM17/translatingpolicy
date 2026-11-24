import { useState } from 'react';
import { CHECK_LABELS } from '../lib.js';

// One worry about the bill: who raises it, what they say, what it could mean in practice,
// the other side, and (behind the drawer) exactly what we could and could not confirm.
export default function ConcernCard({ concern: c }) {
  const [open, setOpen] = useState(false);
  return (
    <article id={`worried-${c.id}`} className="concern">
      <div className="tags">
        <span className="topic">{c.topic}</span>
        <span className="sec">{c.section}</span>
        <span className={`check check-${c.check}`}>{CHECK_LABELS[c.check]}</span>
      </div>
      <h3>{c.title}</h3>
      <p className="short">{c.short}</p>

      <p className="who"><span className="lbl">Raised by</span>
        {c.critics.map((p, i) => (
          <span key={p.who}>{i > 0 && ', '}<a className="src" href={p.url} target="_blank" rel="noreferrer">{p.who}</a></span>
        ))}
      </p>

      <div className="block">
        <h4>What critics say</h4>
        <p>{c.claim}</p>
      </div>

      {c.quote && (
        <blockquote>
          <p>&ldquo;{c.quote.text}&rdquo;</p>
          <footer><a className="src" href={c.quote.url} target="_blank" rel="noreferrer">{c.quote.who}</a></footer>
        </blockquote>
      )}

      <div className="block practice">
        <h4>What it could mean in practice</h4>
        <p>{c.practice}</p>
      </div>

      <div className="block reply">
        <h4>What supporters say</h4>
        {c.response ? (
          <p><b>{c.response.who}:</b> {c.response.claim} <a className="src" href={c.response.url} target="_blank" rel="noreferrer">Source</a></p>
        ) : (
          <p>{c.noResponse.text} <a className="src" href={c.noResponse.url} target="_blank" rel="noreferrer">Source</a></p>
        )}
        {c.concession && (
          <p className="dim">{c.concession.text} <a className="src" href={c.concession.url} target="_blank" rel="noreferrer">Source</a></p>
        )}
      </div>

      <button type="button" className="more" onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-controls={`${c.id}-solid`}>
        {open ? 'Hide how solid this is' : 'How solid is this?'}
      </button>
      {open && (
        <div id={`${c.id}-solid`} className="mech">
          <p><span className="lbl">Confirmed</span>{c.confirmed}</p>
          <p><span className="lbl">Not confirmed yet</span>{c.open}</p>
          <ul>
            {c.sources.map((s) => (
              <li key={s.label}>
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
