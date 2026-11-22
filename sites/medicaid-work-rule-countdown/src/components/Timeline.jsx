import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import events from '../data/timeline.json';
import sources from '../data/sources.json';
import { formatDate, toDate } from '../lib/dates.js';

const KIND_COLOR = {
  law: 'var(--text)',
  federal: 'var(--color-accent)',
  court: 'var(--court)',
  state: 'var(--color-warn)',
  deadline: 'var(--color-danger)',
};
const KIND_LABEL = { law: 'Congress', federal: 'Federal agency', court: 'Courts', state: 'States', deadline: 'Deadline' };
const srcById = Object.fromEntries(sources.map((s) => [s.id, s]));

const W = 900;
const H = 150;
const M = { left: 20, right: 20 };

export default function Timeline({ now }) {
  const ref = useRef(null);

  useEffect(() => {
    const x = d3
      .scaleTime()
      .domain([new Date(2025, 5, 1), new Date(2029, 0, 31)])
      .range([M.left, W - M.right]);
    const svg = d3.select(ref.current);
    svg.selectAll('*').remove();

    const axisY = 95;
    svg
      .append('g')
      .attr('transform', 'translate(0,' + axisY + ')')
      .call(d3.axisBottom(x).ticks(d3.timeMonth.every(6)).tickFormat(d3.timeFormat('%b %Y')))
      .call((g) => g.selectAll('text').attr('fill', 'var(--muted)').attr('font-size', 12))
      .call((g) => g.selectAll('line,path').attr('stroke', 'var(--line)'));

    const today = now || new Date();
    svg
      .append('line')
      .attr('x1', x(today))
      .attr('x2', x(today))
      .attr('y1', 18)
      .attr('y2', axisY)
      .attr('stroke', 'var(--text)')
      .attr('stroke-dasharray', '3 3');
    svg
      .append('text')
      .attr('x', x(today))
      .attr('y', 12)
      .attr('text-anchor', 'middle')
      .attr('font-size', 12)
      .attr('font-weight', 700)
      .attr('fill', 'var(--text)')
      .text('Today');

    svg
      .append('g')
      .selectAll('circle')
      .data(events)
      .join('circle')
      .attr('cx', (d) => x(toDate(d.date)))
      .attr('cy', (d, i) => axisY - 18 - (i % 3) * 16)
      .attr('r', 6)
      .attr('fill', (d) => KIND_COLOR[d.kind])
      .attr('stroke', 'var(--surface)')
      .attr('stroke-width', 2)
      .append('title')
      .text((d) => formatDate(d.date) + ': ' + d.label);
  }, [now]);

  return (
    <section id="timeline" aria-labelledby="timeline-h" className="mt-16">
      <h2 id="timeline-h" className="h2">How we got here, and what comes next</h2>
      <div className="card mt-6 overflow-x-auto p-4">
        <svg ref={ref} viewBox={'0 0 ' + W + ' ' + H} className="h-auto w-full min-w-[640px]" role="img" aria-label="Timeline of the Medicaid work rule from July 2025 to December 2028. The same events are listed below." />
        <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm">
          {Object.entries(KIND_LABEL).map(([k, label]) => (
            <li key={k} className="flex items-center gap-2">
              <span className="inline-block h-3 w-3 rounded-full" style={{ background: KIND_COLOR[k] }} />
              {label}
            </li>
          ))}
        </ul>
      </div>
      <ol className="mt-6 space-y-4 border-l-2 rule pl-5">
        {events.map((e) => (
          <li key={e.date + e.label} className="relative">
            <span className="absolute -left-[27px] top-1.5 h-3 w-3 rounded-full" style={{ background: KIND_COLOR[e.kind] }} aria-hidden="true" />
            <p className="label muted">{formatDate(e.date)}</p>
            <p className="font-semibold">{e.label}</p>
            <p className="max-w-2xl">{e.detail}</p>
            <p className="mt-1 text-sm muted">
              Source:{' '}
              {e.sources.map((id, i) => (
                <span key={id}>
                  {i > 0 && ', '}
                  <a className="underline underline-offset-2" href={srcById[id].url} target="_blank" rel="noreferrer">{srcById[id].publisher}</a>
                </span>
              ))}
            </p>
          </li>
        ))}
      </ol>
    </section>
  );
}
