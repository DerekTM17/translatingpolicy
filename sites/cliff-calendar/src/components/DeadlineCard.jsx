import { useState } from 'react';
import { daysUntil, countdownText, formatDate } from '../lib.js';

const tone = {
  '2026-12-11': { bar: 'bg-cliff11', chip: 'bg-amber-100 text-amber-900', ring: 'ring-amber-200' },
  '2026-12-31': { bar: 'bg-cliff31', chip: 'bg-rose-100 text-rose-900', ring: 'ring-rose-200' },
};

export default function DeadlineCard({ item, lastVerified, stateRow, stateMeta }) {
  const [open, setOpen] = useState(false);
  const days = daysUntil(item.date);
  const t = tone[item.date] || tone['2026-12-11'];
  const passed = days < 0;

  let stateLine = null;
  if (stateRow && item.reach?.stateKey) {
    const key = item.reach.stateKey;
    const value = stateRow[key];
    const meta = stateMeta[key];
    if (value != null) {
      stateLine = (
        <p className="mt-2 rounded-lg bg-slate-50 px-3 py-2 text-sm">
          <span className="font-semibold">{stateRow.name}:</span> {value.toLocaleString('en-US')} {meta.label.toLowerCase()}.
        </p>
      );
    } else {
      const href = key === 'healthCenterPatients2024' ? stateRow.healthCenterUrl : meta.nationalUrl;
      stateLine = (
        <p className="mt-2 rounded-lg border border-dashed border-slate-300 px-3 py-2 text-sm text-slate-600">
          We have not loaded {stateRow.name}'s count yet.{' '}
          <a className="underline" href={href} target="_blank" rel="noreferrer">See the official number</a>.
        </p>
      );
    }
  }

  return (
    <article id={item.id} className={`relative overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ${t.ring} scroll-mt-24`}>
      <div className={`absolute inset-y-0 left-0 w-1.5 ${t.bar}`} aria-hidden="true" />
      <div className="p-5 pl-6">
        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
          <span className={`rounded-full px-2.5 py-1 ${t.chip}`}>{formatDate(item.date, { month: 'short', day: 'numeric' })}</span>
          <span className="rounded-full bg-slate-900 px-2.5 py-1 text-white">{countdownText(days)}</span>
          <span className={`rounded-full px-2.5 py-1 ${passed ? 'bg-slate-200 text-slate-700' : 'bg-emerald-50 text-emerald-800'}`}>
            {passed ? 'Check status' : 'Pending in Congress'}
          </span>
        </div>

        <h3 className="mt-3 text-lg font-bold leading-snug">{item.title}</h3>

        <p className="mt-2 text-[15px] leading-relaxed">
          <span className="font-semibold">What stops: </span>{item.whatStops}
        </p>
        <p className="mt-1.5 text-[15px] leading-relaxed text-slate-700">
          <span className="font-semibold text-slate-900">Who feels it: </span>{item.whoFeelsIt}
        </p>

        {item.reach && (
          <p className="mt-3 flex flex-wrap items-baseline gap-x-2">
            <span className="text-2xl font-extrabold tracking-tight">{item.reach.value}</span>
            <span className="text-sm text-slate-600">{item.reach.label}</span>
          </p>
        )}
        {item.extra && <p className="mt-1 text-sm text-slate-600">{item.extra}</p>}
        {stateLine}

        {item.list && (
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-slate-700">
            {item.list.map((li) => <li key={li}>{li}</li>)}
          </ul>
        )}

        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-controls={`${item.id}-mech`}
          className="mt-4 text-sm font-semibold text-slate-900 underline decoration-slate-300 underline-offset-4 hover:decoration-slate-900"
        >
          {open ? 'Hide how it works' : 'How it works'}
        </button>
        {open && (
          <div id={`${item.id}-mech`} className="mt-3 space-y-2 rounded-xl bg-slate-50 p-4 text-sm">
            <p className="leading-relaxed">{item.mechanics}</p>
            <p><span className="font-semibold">Law:</span> {item.citation}</p>
            <ul className="space-y-1">
              {item.sources.map((s) => (
                <li key={s.url}>
                  <span className="mr-1 rounded bg-white px-1.5 py-0.5 text-xs font-semibold text-slate-600 ring-1 ring-slate-200">{s.kind}</span>
                  <a className="underline" href={s.url} target="_blank" rel="noreferrer">{s.label}</a>
                </li>
              ))}
            </ul>
            <p className="text-xs text-slate-500">Last checked {formatDate(lastVerified)}.</p>
          </div>
        )}
      </div>
    </article>
  );
}
