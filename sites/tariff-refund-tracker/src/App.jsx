import { useMemo, useState } from 'react';
import data from './data/refunds.json';
import RefundChart from './RefundChart.jsx';
import { perHousehold, shareReturned, daysUntil, fmtDate, fmtUsd, fmtBillions, latest } from './lib.js';

const src = Object.fromEntries(data.sources.map((s) => [s.id, s]));

function Cite({ id }) {
  const s = src[id];
  if (!s) return null;
  return <a href={s.url} target="_blank" rel="noreferrer" className="text-xs font-mono ml-1 align-super" title={s.name}>[src]</a>;
}

function Stat({ value, label, tone = 'glow', children }) {
  const color = tone === 'refund' ? 'var(--c-refund)' : tone === 'war' ? 'var(--c-war)' : 'var(--glow)';
  return (
    <div className="panel rounded-lg p-4">
      <div className="font-display text-3xl font-bold" style={{ color }}>{value}</div>
      <div className="text-sm ink-dim mt-1">{label}{children}</div>
    </div>
  );
}

export default function App() {
  const t = data.totals;
  const last = latest(data.milestones);
  const next = data.timeline.find((e) => e.status === 'next');
  const days = next ? daysUntil(next.date) : null;
  const [pass, setPass] = useState(50);
  const share = useMemo(() => perHousehold(t.ieepaCollectedBillions, t.householdsThousands, pass / 100), [pass, t]);
  const pct = Math.round(shareReturned(last.billions, t.ieepaCollectedBillions) * 100);

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      <header className="mb-10">
        <a href="https://translatingpolicy.com" className="font-mono text-xs tracking-widest uppercase no-underline ink-dim">translating.policy</a>
        <h1 className="font-display text-4xl sm:text-5xl font-bold mt-3 leading-tight">
          The tariffs were illegal. <span style={{ color: 'var(--c-refund)' }}>The refunds are going to importers.</span>
        </h1>
        <p className="text-lg mt-4 ink-dim max-w-2xl">
          The Supreme Court struck down the emergency tariffs. Businesses that paid them at the border are getting about {fmtBillions(t.ieepaCollectedBillions)} back.
          If you paid higher prices at the register, there is no refund line for you.
        </p>
      </header>

      <section className="grid sm:grid-cols-3 gap-3 mb-10" aria-label="Key numbers">
        <Stat value={fmtBillions(t.ieepaCollectedBillions)} label="emergency tariffs paid, Feb 2025 to Feb 2026 (est.)" tone="refund"><Cite id={t.ieepaCollectedSource} /></Stat>
        <Stat value={`~${fmtBillions(last.billions)}`} label={`sent back toward importers as of ${fmtDate(last.date)}, about ${pct}%`}><Cite id={last.source} /></Stat>
        <Stat value={next ? (days > 0 ? `${days} days` : days === 0 ? 'Today' : 'Passed') : 'TBD'} label={next ? `until ${next.label.toLowerCase()} (${fmtDate(next.date)})` : ''} tone="war"><Cite id={next?.source} /></Stat>
      </section>

      <section className="panel rounded-lg p-5 sm:p-6 mb-10">
        <h2 className="font-display text-2xl font-semibold">What it may have cost your household</h2>
        <p className="ink-dim mt-2 text-sm">
          Nobody knows exactly how much of the tariff bill stores passed on to shoppers. Slide to pick a share. We split the total evenly across {(t.householdsThousands / 1000).toFixed(1)} million US households ({t.householdsYear}).<Cite id={t.householdsSource} />
        </p>
        <label className="block mt-5">
          <span className="font-mono text-sm">Share passed on to shoppers: <strong style={{ color: 'var(--c-refund)' }}>{pass}%</strong></span>
          <input type="range" min="0" max="100" step="5" value={pass} onChange={(e) => setPass(Number(e.target.value))} className="w-full mt-2" aria-label="Share of tariffs passed on to shoppers, percent" />
        </label>
        <div className="mt-4 flex flex-wrap items-baseline gap-x-3">
          <span className="font-display text-4xl font-bold" style={{ color: 'var(--c-refund)' }}>{fmtUsd(share)}</span>
          <span className="ink-dim">per household, spread over about a year of tariffs. Your refund route for it: none.</span>
        </div>
        <p className="text-xs ink-dim mt-3">This is an even split for illustration, not an estimate of your own spending. Households that buy more imported goods paid more.</p>
      </section>

      <section className="mb-10">
        <h2 className="font-display text-2xl font-semibold mb-2">Where the money stands</h2>
        <p className="ink-dim text-sm mb-4">Reported refunds against the estimated total. Each bar is a different snapshot from a different report, so the measures differ slightly.</p>
        <div className="panel rounded-lg p-4"><RefundChart collected={t.ieepaCollectedBillions} milestones={data.milestones} /></div>
        <ul className="text-xs ink-dim mt-3 space-y-1">
          {data.milestones.map((m) => <li key={m.date}><span className="font-mono">{m.label}:</span> {m.qualifier} {fmtBillions(m.billions)}, {m.measure.toLowerCase()}.<Cite id={m.source} /></li>)}
          <li>The court's rough estimate of money that would otherwise stay with the government: about {fmtBillions(t.mayStayWithGovernmentBillions)}.<Cite id={t.mayStaySource} /></li>
          <li>On hold because the importer gave CBP no bank details: {data.capeSnapshot.onHoldNoBankInfoCount.toLocaleString('en-US')} refunds worth {fmtBillions(data.capeSnapshot.onHoldNoBankInfoBillions)} (September).<Cite id={data.capeSnapshot.source} /></li>
        </ul>
      </section>

      <section className="mb-10">
        <h2 className="font-display text-2xl font-semibold mb-4">What about shoppers?</h2>
        <div className="panel rounded-lg p-5">
          <p>{data.consumerRoute.summary}<Cite id={data.consumerRoute.source} /></p>
          <ul className="list-disc pl-5 mt-3 ink-dim text-sm space-y-1">{data.consumerRoute.examples.map((e) => <li key={e}>{e}</li>)}</ul>
        </div>
      </section>

      <section className="mb-10">
        <h2 className="font-display text-2xl font-semibold mb-4">How we got here, and what is next</h2>
        <ol className="border-l rule pl-5 space-y-5">
          {data.timeline.map((e) => (
            <li key={e.date} className="relative">
              <span className="absolute -left-[27px] top-1.5 w-3 h-3 rounded-full" style={{ background: e.status === 'next' ? 'var(--c-war)' : 'var(--glow)' }} />
              <div className="font-mono text-xs ink-dim">{fmtDate(e.date, e.approxDate)}{e.status === 'next' ? '  NEXT' : ''}</div>
              <div className="font-semibold">{e.label}<Cite id={e.source} /></div>
              <div className="text-sm ink-dim">{e.detail}</div>
            </li>
          ))}
        </ol>
      </section>

      <section className="mb-10 grid sm:grid-cols-2 gap-3">
        <div className="panel rounded-lg p-4">
          <h3 className="font-display text-lg font-semibold" style={{ color: 'var(--glow)' }}>Refunded</h3>
          <ul className="text-sm mt-2 space-y-1">{data.covered.map((c) => <li key={c}>{c}</li>)}</ul>
        </div>
        <div className="panel rounded-lg p-4">
          <h3 className="font-display text-lg font-semibold" style={{ color: 'var(--c-war)' }}>Still in place, not refunded<Cite id={data.coverageSource} /></h3>
          <ul className="text-sm mt-2 space-y-1">{data.notCovered.map((c) => <li key={c}>{c}</li>)}</ul>
        </div>
      </section>

      <footer className="border-t rule pt-6 text-xs ink-dim">
        <p className="mb-2">Figures as of {fmtDate(data.asOf)}. Most refund figures come from news and trade reports that cite court filings and CBP data; we link each one. Dates marked with month only are approximate.</p>
        <ul className="space-y-1">{data.sources.map((s) => <li key={s.id}><a href={s.url} target="_blank" rel="noreferrer">{s.name}</a> <span className="font-mono">({s.kind})</span></li>)}</ul>
        <p className="mt-4"><a href="https://uscongress.translatingpolicy.com">Follow tariff bills on the Congressional Dashboard</a></p>
      </footer>
    </main>
  );
}
