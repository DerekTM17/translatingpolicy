import data from '../data/states.json';
import rules from '../data/rules.json';
import { estimate } from '../lib/calc.js';
import { usd, pct } from '../lib/format.js';

const clampAge = (v) => Math.min(99, Math.max(0, Number(v) || 0));

export default function Checker({ input, setInput, state }) {
  const e = estimate(rules, state, input);
  const set = (k, v) => setInput({ ...input, [k]: v });
  const setAdult = (i, v) => { const a = [...input.adultAges]; a[i] = clampAge(v); set('adultAges', a); };

  return (
    <section id="checker" className="mt-14">
      <h2 className="h2">What would you pay?</h2>
      <div className="grid gap-6 md:grid-cols-2 mt-6">
        <form className="card p-5 grid gap-4" onSubmit={(ev) => ev.preventDefault()} aria-label="Your household">
          <label className="grid gap-1">
            <span className="label muted">State</span>
            <select value={input.state} onChange={(ev) => set('state', ev.target.value)}>
              {data.states.map((s) => <option key={s.code} value={s.code}>{s.name}</option>)}
            </select>
          </label>
          <label className="grid gap-1">
            <span className="label muted">Expected 2027 household income (MAGI), per year</span>
            <input type="number" min="0" step="500" inputMode="numeric" value={input.income}
              onChange={(ev) => set('income', Math.max(0, Number(ev.target.value) || 0))} />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="grid gap-1">
              <span className="label muted">Your age</span>
              <input type="number" min="0" max="99" value={input.adultAges[0]} onChange={(ev) => setAdult(0, ev.target.value)} />
            </label>
            <label className="grid gap-1">
              <span className="label muted">Partner's age (optional)</span>
              <input type="number" min="0" max="99" placeholder="none" value={input.adultAges[1] ?? ''}
                onChange={(ev) => set('adultAges', ev.target.value === '' ? [input.adultAges[0]] : [input.adultAges[0], clampAge(ev.target.value)])} />
            </label>
          </div>
          <label className="grid gap-1">
            <span className="label muted">Children under 21 on the plan</span>
            <input type="number" min="0" max="10" value={input.children} onChange={(ev) => set('children', Math.min(10, Math.max(0, Number(ev.target.value) || 0)))} />
          </label>
          <p className="text-xs muted m-0">Household size {e.size} · 100% of the poverty line is {usd(e.fpl)} · 400% is {usd(e.ceilingIncome)}</p>
        </form>

        <div className={`card p-5 border-l-4 tone-${e.status}`} aria-live="polite">
          <Result e={e} state={state} />
        </div>
      </div>
    </section>
  );
}

function Result({ e, state }) {
  const head = {
    credit: 'You qualify for a tax credit.',
    cliff: 'You are over the cliff. No tax credit.',
    medicaid: 'You may qualify for Medicaid instead.',
    gap: 'You may fall in the coverage gap.',
  }[e.status];
  return (
    <>
      <p className="label muted m-0">Your income is {pct(e.fplPct)} of the poverty line</p>
      <p className="big-num text-2xl mt-2 mb-4">{head}</p>
      {(e.status === 'credit' || e.status === 'cliff') && (
        <dl className="grid grid-cols-2 gap-x-4 gap-y-3 m-0">
          <dt className="muted text-sm">Benchmark silver plan, full price</dt>
          <dd className="big-num text-xl m-0">{usd(e.benchmark)}<span className="text-sm muted">/mo</span></dd>
          <dt className="muted text-sm">Tax credit</dt>
          <dd className="big-num text-xl m-0">{usd(e.credit)}<span className="text-sm muted">/mo</span></dd>
          <dt className="muted text-sm">You pay for that plan</dt>
          <dd className="big-num text-3xl m-0" style={{ color: 'var(--c-aca)' }}>{usd(e.youPay)}<span className="text-sm muted">/mo</span></dd>
          <dt className="muted text-sm">Full price change from 2026</dt>
          <dd className="big-num text-xl m-0">{e.benchmarkChangePct >= 0 ? '+' : ''}{pct(e.benchmarkChangePct, 1)}</dd>
        </dl>
      )}
      {e.status === 'credit' && e.applicablePct != null && (
        <p className="text-sm muted mt-4">The law expects you to put {pct(e.applicablePct, 2)} of income toward the benchmark plan ({usd(e.contribution)} a month). The credit covers the rest. A cheaper bronze plan can cost less; a gold plan more.</p>
      )}
      {e.status === 'cliff' && (
        <p className="text-sm muted mt-4">Above 400% of the poverty line the credit is zero, at any price. The extra help that removed this cliff expired at the end of 2025. If your 2027 income ends up under 400%, you can claim the credit when you file.</p>
      )}
      {e.status === 'medicaid' && (
        <p className="text-sm muted mt-4">{state.name} expanded Medicaid, which covers most adults under 138% of the poverty line. Apply through your state or HealthCare.gov. Starting in 2027, people removed from Medicaid only for missing the new work rule cannot get marketplace tax credits.</p>
      )}
      {e.status === 'gap' && (
        <p className="text-sm muted mt-4">{state.name} did not fully expand Medicaid. Below 100% of the poverty line there is no marketplace tax credit, and adult Medicaid is limited. Check your state's Medicaid rules.</p>
      )}
      {e.approximateAge && <p className="text-xs mt-4" style={{ color: 'var(--c-inflation)' }}>{state.name} uses its own age curve, so this age adjustment is approximate.</p>}
      {state.ageRating === 'none' && <p className="text-xs muted mt-4">{state.name} does not charge more by age, so every adult pays the same base price.</p>}
      <p className="text-xs muted mt-4">Estimate from the state average benchmark for a 40-year-old ({state.name}: ${state.b2027}/mo in 2027), scaled by age. Your county can be higher or lower.</p>
    </>
  );
}
