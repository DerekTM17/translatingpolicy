import { useSyncExternalStore } from 'react';
import Countdown from './components/Countdown.jsx';
import Checker from './components/Checker.jsx';
import StateMap from './components/StateMap.jsx';
import Timeline from './components/Timeline.jsx';
import Mechanics from './components/Mechanics.jsx';
import Sources from './components/Sources.jsx';
import { localDayKey, subscribeToLocalDay } from './lib/dates.js';

export default function App() {
  const today = useSyncExternalStore(subscribeToLocalDay, localDayKey);
  return (
    <>
      <header className="nav">
        <div className="wrap">
          <a href="https://translatingpolicy.com" className="brand focus-ring">Translating<span>/</span>Policy</a>
          <nav aria-label="Sections">
            <ul>
              <li><a href="#checker">Checker</a></li>
              <li><a href="#states">States</a></li>
              <li className="hide-sm"><a href="#timeline">Timeline</a></li>
              <li><a href="#sources">Sources</a></li>
            </ul>
          </nav>
        </div>
      </header>

      <div className="wrap pb-20">
      <main>
        <section className="pt-12">
          <p className="eyebrow">Medicaid work rule countdown</p>
          <h1 className="hero-h1">
            Starting January 1, adults on Medicaid in <em>43 states and DC</em> have to prove they work, study, or volunteer.
          </h1>
          <p className="lede">
            Adults 19 to 64 who get Medicaid through the ACA expansion will need to show 80 hours a month of work, school, volunteering, or a job program, or about $580 a month in pay. Many people are excused. Some states will start cutting coverage right away. Others will wait until July.
          </p>
          <p className="label muted mt-4">Facts checked Nov 22, 2026 · Not legal advice</p>
          <Countdown today={today} />
        </section>

        <Checker />
        <StateMap />
        <Timeline today={today} />
        <Mechanics />
        <Sources />
      </main>

      <footer className="mt-16 border-t rule pt-6 font-mono text-xs muted">
        <p>
          Built by <a className="underline" href="https://translatingpolicy.com">translating.policy</a>. Version 1, Nov 22, 2026. This page explains public rules in plain language. It is not legal advice and does not store anything you enter.
        </p>
      </footer>
      </div>
    </>
  );
}
