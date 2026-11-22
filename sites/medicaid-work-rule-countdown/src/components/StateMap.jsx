import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import states from '../data/states.json';
import sources from '../data/sources.json';
import { formatDate } from '../lib/dates.js';

export const HH_LABELS = {
  yes: 'Using the grace period',
  leaning: 'Leaning toward the grace period',
  no: 'Not using the grace period',
  undecided: 'Has not decided',
  not_announced: 'No public decision yet',
  'n/a': 'Rule does not apply',
};

const ORDER = ['yes', 'leaning', 'undecided', 'not_announced', 'no', 'n/a'];
const COLOR_VAR = {
  yes: 'var(--hh-yes)',
  leaning: 'var(--hh-leaning)',
  no: 'var(--hh-no)',
  undecided: 'var(--hh-undecided)',
  not_announced: 'var(--hh-not-announced)',
  'n/a': 'var(--hh-none)',
};
const TEXT_ON = { yes: 'var(--on-strong)', no: 'var(--on-strong)' };

const srcById = Object.fromEntries(sources.map((s) => [s.id, s]));
const COLS = 12;
const ROWS = 8;
const CELL = 46;
const GAP = 4;

function SourceLinks({ ids }) {
  return (
    <ul className="mt-2 space-y-1 text-sm">
      {ids.map((id) => {
        const s = srcById[id];
        if (!s) return null;
        return (
          <li key={id}>
            <a className="underline underline-offset-2" href={s.url} target="_blank" rel="noreferrer">{s.publisher}</a>
            <span className="muted">: {s.title}</span>
          </li>
        );
      })}
    </ul>
  );
}

export default function StateMap() {
  const svgRef = useRef(null);
  const [selected, setSelected] = useState('NY');
  const [showTable, setShowTable] = useState(false);
  const sel = states.find((s) => s.code === selected);

  useEffect(() => {
    const x = d3.scaleLinear().domain([0, COLS]).range([0, COLS * (CELL + GAP)]);
    const y = d3.scaleLinear().domain([0, ROWS]).range([0, ROWS * (CELL + GAP)]);
    const svg = d3.select(svgRef.current);
    const g = svg
      .selectAll('g.tile')
      .data(states, (d) => d.code)
      .join((enter) => {
        const t = enter.append('g').attr('class', 'tile').attr('role', 'button').attr('tabindex', 0);
        t.append('rect').attr('rx', 7);
        t.append('text').attr('class', 'abbr');
        t.append('circle').attr('class', 'early');
        t.append('title');
        return t;
      });

    g.attr('transform', (d) => 'translate(' + x(d.col) + ',' + y(d.row) + ')')
      .attr('aria-label', (d) => d.name + ': ' + HH_LABELS[d.holdHarmless] + (d.early ? '. ' + d.early : ''))
      .attr('aria-pressed', (d) => (d.code === selected ? 'true' : 'false'))
      .style('cursor', 'pointer')
      .on('click', (_, d) => setSelected(d.code))
      .on('keydown', (e, d) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          setSelected(d.code);
        }
      });

    g.select('rect')
      .attr('width', CELL)
      .attr('height', CELL)
      .attr('fill', (d) => COLOR_VAR[d.holdHarmless])
      .attr('stroke', (d) => (d.code === selected ? 'var(--text)' : d.coverage === 'none' ? 'var(--line)' : 'none'))
      .attr('stroke-width', (d) => (d.code === selected ? 3 : 1))
      .attr('stroke-dasharray', (d) => (d.coverage === 'none' && d.code !== selected ? '4 3' : null));

    g.select('text.abbr')
      .attr('x', CELL / 2)
      .attr('y', CELL / 2 + 5)
      .attr('text-anchor', 'middle')
      .attr('font-size', 14)
      .attr('font-weight', 700)
      .attr('fill', (d) => TEXT_ON[d.holdHarmless] || 'var(--text)')
      .attr('opacity', (d) => (d.coverage === 'none' ? 0.55 : 1))
      .text((d) => d.code);

    g.select('circle.early')
      .attr('cx', CELL - 9)
      .attr('cy', 9)
      .attr('r', (d) => (d.early ? 4.5 : 0))
      .attr('fill', 'var(--color-danger)');

    g.select('title').text((d) => d.name + ': ' + HH_LABELS[d.holdHarmless]);
  }, [selected]);

  const counts = d3.rollup(states, (v) => v.length, (d) => d.holdHarmless);

  return (
    <section id="states" aria-labelledby="states-h" className="mt-16">
      <h2 id="states-h" className="font-serif text-3xl font-bold">Is your state waiting until July?</h2>
      <p className="mt-2 max-w-2xl muted">
        43 states and DC have to run the rule. CMS lets each one keep checking from January but hold off on cutting coverage until July 1, 2027. CMS asked states to decide by Dec 11, 2026, and has not said it will publish their answers, so we track public statements state by state.
      </p>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,620px)_1fr]">
        <div className="card overflow-x-auto p-4">
          <svg
            ref={svgRef}
            viewBox={'0 0 ' + COLS * (CELL + GAP) + ' ' + ROWS * (CELL + GAP)}
            className="h-auto w-full min-w-[480px]"
            role="group"
            aria-label="Tile map of states by hold harmless status. Select a state for details."
          />
          <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-sm">
            {ORDER.map((k) => (
              <li key={k} className="flex items-center gap-2">
                <span
                  className="inline-block h-4 w-4 rounded"
                  style={{ background: COLOR_VAR[k], border: k === 'n/a' ? '1px dashed var(--line)' : '1px solid var(--line)' }}
                />
                {HH_LABELS[k]} ({counts.get(k) || 0})
              </li>
            ))}
            <li className="flex items-center gap-2">
              <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: 'var(--color-danger)' }} />
              Started or planned early
            </li>
          </ul>
        </div>

        {sel && (
          <div className="card p-5 lg:self-start" aria-live="polite">
            <p className="text-xs font-semibold uppercase tracking-wide muted">Checked {formatDate(sel.checked)}</p>
            <h3 className="mt-1 text-2xl font-bold">{sel.name}</h3>
            <p className="mt-1 font-semibold text-accent">{HH_LABELS[sel.holdHarmless]}</p>
            <p className="mt-2">{sel.note}</p>
            {sel.early && <p className="mt-2 font-semibold">{sel.early}</p>}
            <p className="mt-4 text-xs font-semibold uppercase tracking-wide muted">Sources</p>
            <SourceLinks ids={sel.sources} />
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={() => setShowTable((v) => !v)}
        className="focus-ring mt-4 text-sm font-semibold text-accent underline underline-offset-4"
        aria-expanded={showTable}
      >
        {showTable ? 'Hide the table' : 'Show every state as a table'}
      </button>
      {showTable && (
        <div className="card mt-3 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b rule">
                <th className="p-3">State</th>
                <th className="p-3">Must run the rule?</th>
                <th className="p-3">Grace period</th>
                <th className="p-3">Early start</th>
              </tr>
            </thead>
            <tbody>
              {[...states].sort((a, b) => a.name.localeCompare(b.name)).map((s) => (
                <tr key={s.code} className="border-b rule align-top">
                  <td className="p-3 font-semibold">{s.name}</td>
                  <td className="p-3">{s.coverage === 'none' ? 'No' : s.coverage === 'waiver' ? 'Yes, waiver group only' : 'Yes'}</td>
                  <td className="p-3">{HH_LABELS[s.holdHarmless]}</td>
                  <td className="p-3">{s.early || ''}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
