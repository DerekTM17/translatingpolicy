import { formatDate, nextStep } from '../lib.js';

// Where the bill stands: finished steps, the next one, and what comes after.
export default function Stepper({ steps }) {
  const next = nextStep(steps);
  return (
    <ol className="stepper">
      {steps.map((s) => {
        const state = s.done ? 'done' : s === next ? 'next' : 'later';
        return (
          <li key={s.label} className={`step ${state}`}>
            <span className="mark" aria-hidden="true" />
            <div className="step-body">
              <span className="when">
                {s.date ? formatDate(s.date, { month: 'short', day: 'numeric', year: 'numeric' }) : state === 'next' ? 'Next' : 'After that'}
              </span>
              <h3>{s.label}</h3>
              <p>{s.detail}</p>
              <a className="src" href={s.source.url} target="_blank" rel="noreferrer">{s.source.label}</a>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
