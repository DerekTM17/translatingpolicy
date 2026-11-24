import { useMemo, useState } from 'react';
import { compare, tierFor, usd } from './lib.js';
import { COLA_2027, PART_B, SOURCES } from './data/rates.js';
import Waterfall from './Waterfall.jsx';
import ShareChart from './ShareChart.jsx';

const TIER_LABELS = ['Standard (most people)', 'Tier 1', 'Tier 2', 'Tier 3', 'Tier 4', 'Top tier'];

export default function App() {
  const [gross, setGross] = useState('2000');
  const [deducted, setDeducted] = useState(true);
  const [statePays, setStatePays] = useState(false);
  const [filing, setFiling] = useState('single');
  const [income, setIncome] = useState('standard'); // 'standard' or 'enter'
  const [magi24, setMagi24] = useState('');
  const [magi25, setMagi25] = useState('');

  const tier2026 = income === 'enter' && magi24 !== '' ? tierFor(2026, Number(magi24), filing) : 0;
  const tier2027 = income === 'enter' && magi25 !== '' ? tierFor(2027, Number(magi25), filing) : 0;
  const r = useMemo(
    () => compare({ gross2026: gross, deducted, statePays, tier2026, tier2027 }),
    [gross, deducted, statePays, tier2026, tier2027],
  );
  const valid = r.g26 > 0;

  return (
    <>
      <header className="nav">
        <div className="wrap">
          <a className="brand" href="https://translatingpolicy.com">translating<span>.</span>policy</a>
          <span className="here">Social Security raise</span>
        </div>
      </header>

      <main className="wrap">
        <section className="hero">
          <p className="eyebrow">January 2027 checks</p>
          <h1>Your raise, <em>after Medicare</em></h1>
          <p className="lede">
            Social Security checks go up 3.6% in January. The Medicare Part B premium that comes out of most checks goes up
            too, by $6.50 a month. Type in your check to see what actually lands in your account.
          </p>
          <div className="tiles">
            <div className="tile">
              <span className="k">Social Security raise</span>
              <div className="n">+{(COLA_2027 * 100).toFixed(1)}%</div>
              <p className="m">About $75 a month for the average retiree (SSA)</p>
            </div>
            <div className="tile minus">
              <span className="k">Medicare Part B premium</span>
              <div className="n">+$6.50</div>
              <p className="m">{usd(PART_B[2026].standard)} to {usd(PART_B[2027].standard)} a month (CMS)</p>
            </div>
          </div>
        </section>

        <section aria-labelledby="calc">
          <div className="sec-title"><h2 id="calc">Your check</h2><small>Estimate, within about $1</small></div>
          <div className="calc">
            <form className="inputs" onSubmit={(e) => e.preventDefault()}>
              <label className="field">
                <span>Your monthly Social Security benefit now, before Medicare is taken out</span>
                <div className="money">
                  <b>$</b>
                  <input inputMode="decimal" value={gross} onChange={(e) => setGross(e.target.value.replace(/[^0-9.]/g, ''))} aria-describedby="gross-help" />
                </div>
                <small id="gross-help">On your 2026 benefit letter or my Social Security, look for the amount before deductions.</small>
              </label>

              <fieldset className="field">
                <legend>Is your Medicare Part B premium taken out of your check?</legend>
                <div className="seg">
                  <button type="button" aria-pressed={deducted && !statePays} onClick={() => { setDeducted(true); setStatePays(false); }}>Yes</button>
                  <button type="button" aria-pressed={!deducted} onClick={() => { setDeducted(false); setStatePays(false); }}>No or not on Medicare</button>
                  <button type="button" aria-pressed={statePays} onClick={() => { setDeducted(true); setStatePays(true); }}>My state pays it</button>
                </div>
              </fieldset>

              {deducted && !statePays && (
                <fieldset className="field">
                  <legend>Income</legend>
                  <div className="seg">
                    <button type="button" aria-pressed={income === 'standard'} onClick={() => setIncome('standard')}>Under $112,000 single or $224,000 joint</button>
                    <button type="button" aria-pressed={income === 'enter'} onClick={() => setIncome('enter')}>Higher, let me enter it</button>
                  </div>
                  {income === 'enter' && (
                    <div className="magi">
                      <div className="seg small">
                        <button type="button" aria-pressed={filing === 'single'} onClick={() => setFiling('single')}>Single</button>
                        <button type="button" aria-pressed={filing === 'joint'} onClick={() => setFiling('joint')}>Married filing jointly</button>
                      </div>
                      <label>Modified adjusted gross income on your 2024 tax return (sets 2026)
                        <input inputMode="numeric" value={magi24} onChange={(e) => setMagi24(e.target.value.replace(/[^0-9]/g, ''))} />
                      </label>
                      <label>On your 2025 tax return (sets 2027)
                        <input inputMode="numeric" value={magi25} onChange={(e) => setMagi25(e.target.value.replace(/[^0-9]/g, ''))} />
                      </label>
                      <small>Medicare looks back two years. Married filing separately has its own tiers and is not covered here yet.</small>
                    </div>
                  )}
                </fieldset>
              )}
            </form>

            <div className="result" aria-live="polite">
              {valid ? (
                <>
                  <p className="big">
                    {deducted ? 'Your deposit goes ' : 'Your check goes '}
                    <b className={r.netChange >= 0 ? 'up' : 'down'}>{r.netChange >= 0 ? 'up' : 'down'} {usd(Math.abs(r.netChange))}</b> a month
                  </p>
                  <p className="sub">
                    {deducted
                      ? `From about ${usd(r.net26)} in December to about ${usd(r.net27)} in January.`
                      : `From ${usd(r.g26)} to about ${usd(r.g27)}.`}
                  </p>
                  <Waterfall r={r} deducted={deducted} />
                  <ul className="facts">
                    <li><b>Raise:</b> {usd(r.raise, false)} a month ({usd(r.raise * 12, false)} a year).</li>
                    {deducted && !statePays && (
                      <li><b>Medicare Part B:</b> {usd(r.p26)} now, {usd(r.p27)} in 2027
                        {tier2026 || tier2027 ? ` (${TIER_LABELS[tier2026]} to ${TIER_LABELS[tier2027]})` : ''}.</li>
                    )}
                    {r.heldHarmless && (
                      <li><b>Protected:</b> your raise is smaller than the premium increase, so the law caps your premium increase at {usd(r.premiumChange)}. Your deposit does not drop.</li>
                    )}
                    {statePays && <li><b>State pays:</b> through a Medicare Savings Program, so the whole raise lands.</li>}
                    {deducted && !statePays && r.shareEaten != null && !r.heldHarmless && (
                      <li><b>Share eaten:</b> Medicare takes {Math.round(r.shareEaten * 100)}% of your raise.</li>
                    )}
                    {deducted && !statePays && (
                      <li><b>Deductible:</b> you pay the first {usd(PART_B[2027].deductible, false)} of Part B costs in 2027, up from {usd(PART_B[2026].deductible, false)}.</li>
                    )}
                  </ul>
                  <p className="axis-note">Bars start above $0 so a small change is visible.</p>
                </>
              ) : (
                <p className="sub">Enter your monthly benefit to see your number.</p>
              )}
            </div>
          </div>
        </section>

        <section aria-labelledby="who">
          <div className="sec-title"><h2 id="who">Smaller checks lose more of the raise</h2><small>Standard premium</small></div>
          <p className="sec-lede">
            The raise is a percentage. The Medicare increase is a flat $6.50. So on a small check, Medicare takes a bigger
            bite. Below about $195 a month the law steps in so the deposit does not shrink.
          </p>
          <ShareChart mine={valid && deducted && !statePays && !tier2026 && !tier2027 ? r : null} />
        </section>

        <section aria-labelledby="how">
          <div className="sec-title"><h2 id="how">How this works</h2></div>
          <ol className="how">
            <li>Social Security raises benefits each January by the cost-of-living adjustment. For 2027 it is 3.6%, set from the
              government's inflation index for wage earners. SSA rounds the monthly benefit down to the whole dollar, so this page does too.</li>
            <li>Medicare sets the Part B premium each year at about a quarter of the program's cost for people 65 and over. For 2027 it is
              {' '}{usd(PART_B[2027].standard)}, up from {usd(PART_B[2026].standard)}. People with higher incomes pay more, based on their tax return from two years earlier.</li>
            <li>A "hold harmless" rule protects people whose premium is taken from their check and who pay no income-related amount:
              their premium cannot rise by more than their raise. It does not protect higher-income people or new enrollees.</li>
            <li>Raised SSI payments start December 31, 2026. Social Security raises start with January 2027 payments.</li>
          </ol>
          <p className="limits">
            Not covered: Medicare Advantage plans that pay part of the Part B premium, Part D drug plan premiums, income tax withholding,
            married filing separately, and late enrollment penalties. For your exact figure, see your COLA notice in my Social Security.
          </p>
        </section>

        <section aria-labelledby="src">
          <div className="sec-title"><h2 id="src">Sources</h2><small>Primary federal sources only</small></div>
          <ul className="sources">
            {SOURCES.map((s) => <li key={s.id}><a href={s.url} target="_blank" rel="noreferrer">{s.label}</a></li>)}
          </ul>
        </section>
      </main>

      <footer className="foot">
        <div className="wrap">translating.policy · Estimates only, not benefit advice · Built from public SSA and CMS data</div>
      </footer>
    </>
  );
}
