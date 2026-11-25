import { useState } from 'react';
import Checker from './components/Checker.jsx';
import CliffChart from './components/CliffChart.jsx';
import StateTable from './components/StateTable.jsx';
import TaxTime from './components/TaxTime.jsx';
import Mechanics from './components/Mechanics.jsx';
import Sources from './components/Sources.jsx';
import data from './data/states.json';

export default function App() {
  const [input, setInput] = useState({ state: 'PA', income: 63900, adultAges: [60], children: 0 });
  const state = data.states.find((s) => s.code === input.state);
  return (
    <>
      <header className="nav">
        <div className="wrap">
          <a href="https://translatingpolicy.com" className="brand focus-ring">Translating<span>/</span>Policy</a>
          <nav aria-label="Sections">
            <ul>
              <li><a href="#checker">Checker</a></li>
              <li><a href="#cliff">Cliff</a></li>
              <li className="hide-sm"><a href="#states">States</a></li>
              <li><a href="#sources">Sources</a></li>
            </ul>
          </nav>
        </div>
      </header>

      <div className="wrap pb-20">
        <main>
          <section className="pt-12">
            <p className="eyebrow">ACA premium check 2027</p>
            <h1 className="hero-h1">
              Marketplace health plans cost <em>13% more</em> in 2027, and above 400% of the poverty line you get no help at all.
            </h1>
            <p className="lede">
              The extra federal help that kept premiums low through 2025 is gone, and the benchmark silver plan rose again for 2027. Earn a dollar too much and the whole tax credit disappears. For a 60-year-old in Pennsylvania, $60 more in income can mean roughly $10,000 more a year in premiums. Check where you land before open enrollment closes.
            </p>
            <p className="label muted mt-4">Facts checked Nov 24, 2026 · Estimates, not a quote · Nothing you type leaves this page</p>
          </section>

          <Checker input={input} setInput={setInput} state={state} />
          <CliffChart input={input} state={state} />
          <TaxTime />
          <StateTable selected={input.state} />
          <Mechanics />
          <Sources />
        </main>

        <footer className="mt-16 border-t rule pt-6 font-mono text-xs muted">
          <p>
            Built by <a className="underline" href="https://translatingpolicy.com">translating.policy</a>. Version 1, Nov 24, 2026. This page estimates premiums from public averages. It is not tax or insurance advice. For a real quote, use HealthCare.gov or your state's marketplace.
          </p>
        </footer>
      </div>
    </>
  );
}
