import { useState } from 'react';
import data from './data/bill.json';
import Stepper from './components/Stepper.jsx';
import ChangeCard from './components/ChangeCard.jsx';
import ConcernCard from './components/ConcernCard.jsx';
import VoteChart from './components/VoteChart.jsx';
import { CHECK_LABELS, formatDate, nextStep } from './lib.js';

const final = data.votes.find((v) => v.roll === 270);
const topics = ['All', ...new Set(data.changes.map((c) => c.topic))];

export default function App() {
  const [topic, setTopic] = useState('All');
  const next = nextStep(data.steps);
  const shown = data.changes.filter((c) => topic === 'All' || c.topic === topic);

  return (
    <>
      <header className="nav">
        <div className="wrap">
          <a className="brand" href="https://translatingpolicy.com">Translating<span>/</span>Policy</a>
          <span className="here">The Permitting Bill</span>
        </div>
      </header>

      <div className="wrap">
        <section className="hero">
          <p className="eyebrow">Congress · {data.short} · H.R. 2347</p>
          <h1>Faster permits. <em>Less time to sue.</em> Who pays for the grid.</h1>
          <p className="lede">
            The Senate passed a big rewrite of how the federal government approves power lines, pipelines, mines and other projects. Here is what it would change for you, where it stands, and how senators voted. Every number links to its source.
          </p>

          <div className="tiles">
            <a className="tile" href="#votes">
              <span className="k">Senate, {formatDate(final.date, { month: 'short', day: 'numeric' })}</span>
              <div className="n">{final.yea}<small>to</small>{final.nay}</div>
              <p className="h">Passed the Senate</p>
              <p className="m">Roll call {final.roll}, {final.notVoting} not voting</p>
            </a>
            <a className="tile next" href="#status">
              <span className="k">Next step</span>
              <div className="n n-status">House vote</div>
              <p className="h">{next ? next.label : 'Done'}</p>
              <p className="m">No date set as of Nov 23</p>
            </a>
          </div>

          <p className="status"><b>Not law yet</b>{data.statusNote} Sources last checked <time dateTime={data.lastVerified}>{formatDate(data.lastVerified)}</time>.</p>
          <a className="callout" href="#worried">
            <b>Who&rsquo;s worried and why</b>
            Tribal nations, environmental groups and some state and local officials say parts of this bill go well beyond speed. See {data.concerns.length} specific worries, how solid each one is, and what supporters say back.
          </a>
        </section>

        <div className="sec-title"><h2>What it would change for you</h2><small>{data.changes.length} changes</small></div>
        <p className="sec-lede">Plain words first. Open "How it works" for the section number, the mechanics and the sources. Each card says how firmly it is sourced.</p>
        <div className="chips" role="group" aria-label="Filter by topic">
          {topics.map((t) => (
            <button key={t} type="button" className="chip" onClick={() => setTopic(t)} aria-pressed={topic === t}>{t}</button>
          ))}
        </div>
        <div className="cards">
          {shown.map((c) => <ChangeCard key={c.id} change={c} />)}
        </div>

        <section id="worried">
          <div className="sec-title"><h2>Who&rsquo;s worried and why</h2><small>{data.concerns.length} worries</small></div>
          <p className="sec-lede">{data.concernsIntro}</p>
          <ol className="glance" aria-label="Worries at a glance">
            {data.concerns.map((c) => (
              <li key={c.id}>
                <a href={`#worried-${c.id}`}>{c.title}</a>
                <span className={`check check-${c.check}`}>{CHECK_LABELS[c.check]}</span>
              </li>
            ))}
          </ol>
          <div className="concerns">
            {data.concerns.map((c) => <ConcernCard key={c.id} concern={c} />)}
          </div>
        </section>

        <section id="status">
          <div className="sec-title"><h2>Where it stands</h2><small>Senate done, House next</small></div>
          <p className="sec-lede">The Senate moved BAAJA by putting its text into H.R. 2347, a bill the House had already passed on another subject. That means the House needs only one more vote to send it to the President.</p>
          <Stepper steps={data.steps} />
        </section>

        <section id="votes">
          <div className="sec-title"><h2>How the Senate voted</h2><small>7 roll calls</small></div>
          <p className="sec-lede">
            Final passage drew {final.parties.Republican.yea} Republicans, {final.parties.Democrat.yea} Democrats and {final.parties.Independent.yea} independent in favor; {final.parties.Republican.nay} Republicans, {final.parties.Democrat.nay} Democrats and {final.parties.Independent.nay} independent voted no.{' '}
            <a className="src" href={final.url} target="_blank" rel="noreferrer">See every senator&rsquo;s vote on senate.gov</a>.
          </p>
          <VoteChart votes={data.votes} />
        </section>

        <div className="sec-title"><h2>Who backs it, who opposes it</h2><small>Claims, not findings</small></div>
        <p className="sec-lede">These are what each side says. We list the same number on each side and do not rate the claims.</p>
        <div className="sides">
          {[['support', 'Supporters say'], ['oppose', 'Opponents say']].map(([k, label]) => (
            <div key={k} className={`side side-${k}`}>
              <h3>{label}</h3>
              <ul>
                {data.sides[k].map((p) => (
                  <li key={p.who}>
                    <b>{p.who}</b>
                    <p>{p.claim}</p>
                    <a className="src" href={p.url} target="_blank" rel="noreferrer">Source</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="sec-title"><h2>Easy to get wrong</h2><small>Quick facts</small></div>
        <ul className="myths">
          {data.myths.map((m) => (
            <li key={m.claim}>
              <b>&ldquo;{m.claim}&rdquo;</b>
              <p>{m.fact}</p>
              <a className="src" href={m.url} target="_blank" rel="noreferrer">Source</a>
            </li>
          ))}
        </ul>

        <div className="sec-title"><h2>How we built this</h2><small>Method</small></div>
        <div className="method">
          <p>
            Vote counts come from senate.gov roll call records. For what the bill does, we read the first 96 pages of the sponsors&rsquo; November 7 substitute text, which covers the environmental review and lawsuit changes and was offered on the floor as amendment 6883. The rest of that text was out of our reach, so for the other parts we rely on Congressional Research Service reports on the bill as introduced, a public tracker&rsquo;s reading of the passed text, and analyses by tribal organizations, advocates, law firms and think tanks. Every card and worry says which of these back it. Floor changes made November 17 and 18 are not checked line by line.
          </p>
          <p>
            In &ldquo;Who&rsquo;s worried and why,&rdquo; the critics&rsquo; claims are theirs, quoted and linked. &ldquo;What it could mean in practice&rdquo; is our plain explanation of how the mechanics would play out, not a prediction. Every worry shows a supporter&rsquo;s answer, or says that we found none.
          </p>
          <p>
            We do not show estimates of power bills, jobs or the federal deficit, because no official estimate for the passed version was available. Status is checked by hand. When the House acts, we update this page.
          </p>
          <p className="links">
            Read it yourself:{' '}
            {data.billLinks.map((l, i) => (
              <span key={l.url}>{i > 0 && ' · '}<a className="src" href={l.url} target="_blank" rel="noreferrer">{l.label}</a></span>
            ))}
          </p>
          <p><a className="src" href="/permitting-bill_sources.xlsx" download>Download the spreadsheet</a> with every vote count, source link, fact check and the method.</p>
        </div>

        <footer className="site-footer">
          <span>Made by Translating Policy. Public sources only. Not legal advice.</span>
          <a href="https://translatingpolicy.com">&larr; Translating Policy</a>
        </footer>
      </div>
    </>
  );
}
