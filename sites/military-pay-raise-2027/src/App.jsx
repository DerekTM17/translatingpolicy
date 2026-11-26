import { useMemo, useState } from 'react';
import data from './data/pay.json';
import { compare, firstYears, usd } from './lib.js';
import RaiseChart from './RaiseChart.jsx';

const GRADES = data.grades.map((g) => g.grade);
const AS_OF = 'November 25, 2026';

export default function App() {
  const [grade, setGrade] = useState('E-4');
  const [years, setYears] = useState(3);
  const minYears = firstYears(data, grade);
  const y = Math.max(years, minYears);
  const r = useMemo(() => compare(data, grade, y), [grade, y]);
  const p = r.scenarios?.president;
  const s = r.scenarios?.senate;

  return (
    <main className="mx-auto max-w-5xl px-4 pb-16 pt-8 sm:px-6">
      <header className="border-b rule pb-6">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-pay">translating.policy · military pay</p>
        <h1 className="mt-2 font-display text-3xl font-bold leading-tight sm:text-5xl">7% or 3.6%? Your January raise is still being decided.</h1>
        <p className="mt-4 max-w-3xl text-lg">
          On January 1, 2027, basic pay goes up. Under the President's plan, junior enlisted get 7%, mid grades 6% and senior officers 5%.
          The Senate's defense bill would give everyone 3.6% instead. Congress settles it in the final defense bill this December.
        </p>
      </header>

      <section className="panel mt-8 rounded-lg p-5" aria-labelledby="pick">
        <h2 id="pick" className="font-display text-xl font-semibold">Pick your grade and years of service</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="font-mono text-xs uppercase ink-dim">Pay grade</span>
            <select className="mt-1 w-full rounded px-3 py-2 text-lg" value={grade} onChange={(e) => setGrade(e.target.value)}>
              {GRADES.map((g) => <option key={g} value={g}>{g}</option>)}
            </select>
          </label>
          <label className="block">
            <span className="font-mono text-xs uppercase ink-dim">Years of service: {y}</span>
            <input className="mt-3 w-full accent-[#7dd87a]" type="range" min={minYears} max={40} step={1} value={y}
              onChange={(e) => setYears(Number(e.target.value))} aria-valuetext={`${y} years`} />
          </label>
        </div>

        {r.base == null ? (
          <p className="mt-6">There is no {grade} rate at {y} years of service.</p>
        ) : (
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <Stat label="Your 2026 basic pay" value={usd(r.base)} note="per month" />
            <Stat label={`President's plan: +${p.rate}%`} value={usd(p.monthly)} note={`+${usd(p.raiseMonthly)} a month`} accent="text-pay" />
            <Stat label={`Senate NDAA: +${s.rate}%`} value={usd(s.monthly)} note={`+${usd(s.raiseMonthly)} a month`} accent="text-glow" />
          </div>
        )}
        {r.base != null && (
          <p className="mt-5 text-lg">
            The difference for a {grade} at {y} years: <strong className="text-pay">{usd(r.gapMonthly)} a month</strong>, or about{' '}
            <strong className="text-pay">{usd(r.gapYear, 0)} over 2027</strong> in basic pay before taxes.
          </p>
        )}
        {r.basis === 'computed_2025x1.038' && (
          <p className="mt-2 text-sm ink-dim">This 2026 rate is computed from the official April 2025 table times the 3.8% January 2026 raise. It can differ from the official 2026 table by about 10 cents.</p>
        )}
      </section>

      <section className="mt-10" aria-labelledby="chart">
        <h2 id="chart" className="font-display text-xl font-semibold">Monthly raise by grade at {y} years</h2>
        <p className="ink-dim text-sm">
          <span className="text-pay">■</span> President's plan (7/6/5) &nbsp; <span className="text-glow">■</span> Senate NDAA (3.6%)
        </p>
        <div className="panel mt-3 rounded-lg p-3"><RaiseChart data={data} years={y} selected={grade} /></div>
      </section>

      <section className="mt-10 grid gap-6 sm:grid-cols-2" aria-labelledby="how">
        <div>
          <h2 id="how" className="font-display text-xl font-semibold">How this gets decided</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5">
            <li>The pay law sets an automatic raise tied to private sector wage growth: 3.6% for 2027 (37 U.S.C. 1009(c)).</li>
            <li>On August 26, 2026 the President used his authority to set a different raise: 7% for E-1 to E-5, 6% for E-6 to O-3, 5% for O-4 and above (House Document 119-189).</li>
            <li>That plan takes effect January 1 unless a law says otherwise. The House defense bill (H.R. 8800, passed 216 to 212) matches it. The Senate committee bill (S. 4784) sets 3.6% for everyone.</li>
            <li>House and Senate negotiators are writing the final defense bill in the December lame duck session. The final number may land between the two.</li>
          </ul>
        </div>
        <div>
          <h2 className="font-display text-xl font-semibold">What this page does not count</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5">
            <li>Housing (BAH) and food (BAS) allowances, special pays and bonuses. Only basic pay is shown.</li>
            <li>Taxes. Figures are before federal and state income tax.</li>
            <li>Grades above O-6 and warrant officers (planned for a later version).</li>
            <li>Officers with more than 4 years of prior enlisted service (O-1E to O-3E) have their own table.</li>
          </ul>
        </div>
      </section>

      <footer className="mt-12 border-t rule pt-6 text-sm ink-dim">
        <p>Data as of {AS_OF}. Sources: DFAS 2026 officer basic pay table; DFAS enlisted table effective April 1, 2025, raised 3.8%; Military.com 2026 enlisted chart for checking; CRS Insight IN12706; MOAA (Oct. 7, 2026); House Document 119-189. Full source list and method in the README and the sources workbook.</p>
        <p className="mt-2">translating.policy · <a href="https://translatingpolicy.com">translatingpolicy.com</a></p>
      </footer>
    </main>
  );
}

function Stat({ label, value, note, accent = '' }) {
  return (
    <div className="rounded border rule p-4">
      <p className="font-mono text-xs uppercase ink-dim">{label}</p>
      <p className={`mt-1 font-display text-2xl font-bold ${accent}`}>{value}</p>
      <p className="text-sm ink-dim">{note}</p>
    </div>
  );
}
