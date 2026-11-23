import { useCallback, useMemo, useState } from 'react';
import rows from './data/states.json';
import RateChart from './components/RateChart.jsx';
import { NATIONAL_PER, SRC, TERRITORIES, tierLabel, usd } from './lib.js';

const byCode = Object.fromEntries(rows.map((r) => [r.code, r]));
const states = rows.filter((r) => !TERRITORIES.has(r.code));
const total = states.reduce((s, r) => s + r.shareEstimate, 0);
const paying = states.filter((r) => r.tier > 0).length;
const top15 = states.filter((r) => r.tier === 15).length;

function startLine(r) {
  if (r.tier === 0) return 'On its FY2025 rate, this state owes no share of benefits. A worse FY2026 rate cannot raise it for FY2028, because the state picks which year counts.';
  if (r.delayFY2025) return 'Its FY2025 rate is high enough to trigger the law’s delay: the benefit share starts in FY2029 (October 2028), not FY2028.';
  return 'Starts in FY2028, which begins October 1, 2027, unless a better FY2026 rate (out around June 2027) drops it to a lower tier.';
}

export default function App() {
  const [code, setCode] = useState(() => {
    try { return localStorage.getItem('snapcs-state') || 'PA'; } catch { return 'PA'; }
  });
  const pick = useCallback((c) => {
    setCode(c);
    try { localStorage.setItem('snapcs-state', c); } catch { /* storage blocked */ }
  }, []);
  const r = byCode[code] || byCode.PA;
  const ranked = useMemo(() => [...states].sort((a, b) => b.shareEstimate - a.shareEstimate), []);

  return (
    <>
      <header className="nav"><div className="wrap">
        <a className="brand" href="https://translatingpolicy.com">translating<span>.</span>policy</a>
        <span className="here">SNAP Cost Shift</span>
      </div></header>

      <main className="wrap">
        <section className="hero">
          <p className="eyebrow">Federal law P.L. 119-21 · Farm bill talks now</p>
          <h1>Your state may soon pay for <em>SNAP groceries</em></h1>
          <p className="lede">
            Starting October 2027, states with high SNAP payment error rates must cover up to 15% of grocery benefits that Washington paid in full until now.
            That money has to come out of state budgets. Congress is negotiating a one or two year delay in the farm bill right now.
          </p>
          <div className="tiles">
            <div className="tile"><span className="k">States that would pay something</span><div className="n">{paying}<small>of 51</small></div><p className="m">50 states plus DC, FY2025 rates</p></div>
            <div className="tile"><span className="k">At the top 15% tier</span><div className="n">{top15}</div><p className="m">error rate 10% or higher</p></div>
            <div className="tile"><span className="k">Rough yearly scale, all states</span><div className="n sm">{usd(total)}</div><p className="m">Aug 2026 benefits x 12 x tier. Not a forecast.</p></div>
          </div>
        </section>

        <section className="pick" aria-labelledby="pick-h">
          <div className="sec-title"><h2 id="pick-h">Your state</h2>
            <label className="state">State
              <select value={r.code} onChange={(e) => pick(e.target.value)}>
                {rows.map((s) => <option key={s.code} value={s.code}>{s.name}</option>)}
              </select>
            </label>
          </div>
          <article className={`result t${r.tier}`}>
            <p className="tag">{tierLabel(r.tier)} of SNAP benefits{r.delayFY2025 ? ' · delay applies' : ''}</p>
            <h3>{r.name}</h3>
            {r.tier > 0 ? (
              <p className="big"><b>{usd(r.shareEstimate)}</b><span>a year, at August 2026 benefit levels</span></p>
            ) : (
              <p className="big"><b>$0</b><span>on its FY2025 rate</span></p>
            )}
            <p>{startLine(r)}</p>
            <dl className="facts">
              <div><dt>FY2025 error rate</dt><dd>{r.per.toFixed(2)}%</dd></div>
              <div><dt>Overpaid / underpaid</dt><dd>{r.over.toFixed(2)}% / {r.under.toFixed(2)}%</dd></div>
              <div><dt>National rate</dt><dd>{NATIONAL_PER}%</dd></div>
              <div><dt>SNAP benefits, Aug 2026</dt><dd>{usd(r.aug2026)}</dd></div>
            </dl>
            {TERRITORIES.has(r.code) && <p className="note">USDA reports an error rate for {r.name}, but this page has not confirmed whether the state cost share applies to territories. Treat the figure as unverified.</p>}
            <p className="note">An error is a payment that was too big or too small when checked, not necessarily fraud. Underpayments count against a state too.</p>
          </article>
        </section>

        <section aria-labelledby="chart-h">
          <div className="sec-title"><h2 id="chart-h">Every state on the tiers</h2><small>FY2025 payment error rate · tap a state</small></div>
          <p className="sec-lede">The dashed line is the national rate. States to the right of the delay line (rate times 1.5 at or above 20) get an extra year before the benefit share starts.</p>
          <RateChart rows={rows} selected={r.code} onPick={pick} />
        </section>

        <section aria-labelledby="rank-h">
          <div className="sec-title"><h2 id="rank-h">Biggest bills</h2><small>Illustrative yearly share</small></div>
          <ol className="rank">
            {ranked.slice(0, 12).map((s) => (
              <li key={s.code} className={`t${s.tier}`}><button type="button" onClick={() => pick(s.code)}>
                <span className="nm">{s.name}</span><span className="tr">{s.tier}%{s.delayFY2025 ? ' · delayed' : ''}</span><span className="amt">{usd(s.shareEstimate)}</span>
              </button></li>
            ))}
          </ol>
        </section>

        <section aria-labelledby="cong-h">
          <div className="sec-title"><h2 id="cong-h">What Congress is weighing</h2><small>Lame duck, before early January</small></div>
          <ul className="offcal">
            <li><b>Farm bill delay</b><p>The House passed its farm bill April 30; the Senate Agriculture Committee reported its own on September 24. The main fight is how long to delay the state share: one year or two, according to a Holland &amp; Knight summary.</p><a className="src" href={SRC.hk}>Holland &amp; Knight, Oct 2026</a></li>
            <li><b>Paperwork costs already shifted</b><p>Since October 1, 2026 (FY2027), Washington covers 25% of what states spend running SNAP, down from half. That bill is already landing.</p><a className="src" href={SRC.crs}>CRS R48552, sec. 10106</a></li>
            <li><b>Which year counts</b><p>For FY2028, each state may use its FY2025 or FY2026 rate. From FY2029 on, USDA uses the rate from three years earlier.</p><a className="src" href={SRC.crs}>CRS R48552, sec. 10105</a></li>
            <li><b>New Congress</b><p>Republicans hold both chambers through the lame duck. If no deal passes, the cost share stays on the books for the new Congress to take up.</p></li>
          </ul>
        </section>

        <section className="method" aria-labelledby="m-h">
          <div className="sec-title"><h2 id="m-h">How this works</h2><small>Sources and limits</small></div>
          <p>Error rates are USDA's official FY2025 numbers (<a className="src" href={SRC.per}>FNS FY25 Payment Error Rates</a>). Tiers follow P.L. 119-21 sec. 10105 as summarized by the Congressional Research Service (<a className="src" href={SRC.crs}>R48552</a>): under 6% pays nothing, 6 to under 8 pays 5%, 8 to under 10 pays 10%, 10 and up pays 15%.</p>
          <p>The dollar figure is August 2026 benefits (<a className="src" href={SRC.benefits}>FNS state benefits, initial data as of Nov 13, 2026</a>) times 12 times the tier. It is a sense of scale, not a forecast: it ignores caseload changes, the FY2026 rate election, delays and anything Congress changes. Monthly data are preliminary and may include disaster aid.</p>
          <p>Raw data, formulas and source list ship with the page as sources.xlsx in the repo.</p>
        </section>
      </main>
      <footer className="wrap site-footer"><span>translating.policy · public data only</span><span>Data checked Nov 22, 2026</span></footer>
    </>
  );
}
