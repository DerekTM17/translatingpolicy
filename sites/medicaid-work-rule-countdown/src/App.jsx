import Countdown from './components/Countdown.jsx';
import Checker from './components/Checker.jsx';
import StateMap from './components/StateMap.jsx';
import Timeline from './components/Timeline.jsx';
import Mechanics from './components/Mechanics.jsx';
import Sources from './components/Sources.jsx';

export default function App() {
  const now = new Date();
  return (
    <div className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
      <header className="flex items-center justify-between border-b rule py-4 text-sm">
        <a href="https://translatingpolicy.com" className="focus-ring font-bold tracking-tight">translating.policy</a>
        <nav className="flex gap-4 muted">
          <a href="#checker" className="focus-ring hover:underline">Checker</a>
          <a href="#states" className="focus-ring hover:underline">States</a>
          <a href="#timeline" className="focus-ring hover:underline">Timeline</a>
          <a href="#sources" className="focus-ring hover:underline">Sources</a>
        </nav>
      </header>

      <main>
        <section className="pt-10">
          <p className="text-sm font-semibold uppercase tracking-wide text-accent">Medicaid work rule countdown</p>
          <h1 className="mt-2 max-w-3xl font-serif text-4xl font-bold leading-tight sm:text-5xl">
            Starting January 1, adults on Medicaid in 43 states and DC have to prove they work, study, or volunteer.
          </h1>
          <p className="mt-4 max-w-2xl text-lg">
            Adults 19 to 64 who get Medicaid through the ACA expansion will need to show 80 hours a month of work, school, volunteering, or a job program, or about $580 a month in pay. Many people are excused. Some states will start cutting coverage right away. Others will wait until July.
          </p>
          <p className="mt-3 text-sm muted">Facts checked Nov 22, 2026. Not legal advice.</p>
          <Countdown now={now} />
        </section>

        <Checker />
        <StateMap />
        <Timeline now={now} />
        <Mechanics />
        <Sources />
      </main>

      <footer className="mt-16 border-t rule pt-6 text-sm muted">
        <p>
          Built by <a className="underline" href="https://translatingpolicy.com">translating.policy</a>. Version 1, Nov 22, 2026. This page explains public rules in plain language. It is not legal advice and does not store anything you enter.
        </p>
      </footer>
    </div>
  );
}
