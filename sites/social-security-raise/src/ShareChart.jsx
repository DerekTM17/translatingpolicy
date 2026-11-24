import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { compare } from './lib.js';

// Share of the raise taken by the standard Part B increase, by monthly check size ($100 to $4,000).
export default function ShareChart({ mine }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    const W = el.clientWidth || 640, H = 220, m = { t: 16, r: 14, b: 34, l: 46 };
    const pts = d3.range(100, 4001, 10).map((g) => ({ g, s: compare({ gross2026: g }).shareEaten ?? 0 }));
    const x = d3.scaleLinear().domain([100, 4000]).range([m.l, W - m.r]);
    const y = d3.scaleLinear().domain([0, 1]).range([H - m.b, m.t]);
    const svg = d3.select(el).selectAll('svg').data([0]).join('svg')
      .attr('viewBox', `0 0 ${W} ${H}`).attr('width', '100%').attr('role', 'img')
      .attr('aria-label', 'Share of the raise taken by the Medicare increase. It is all of the raise for very small checks and falls as checks get larger.');
    svg.selectAll('g.ax').data(['x', 'y']).join('g').attr('class', 'ax axis').each(function (k) {
      const g = d3.select(this);
      if (k === 'x') g.attr('transform', `translate(0,${H - m.b})`).call(d3.axisBottom(x).ticks(5).tickFormat((d) => `$${d3.format(',')(d)}`));
      else g.attr('transform', `translate(${m.l},0)`).call(d3.axisLeft(y).ticks(4).tickFormat(d3.format('.0%')));
    });
    svg.selectAll('path.line').data([pts]).join('path').attr('class', 'line')
      .attr('d', d3.line().x((d) => x(d.g)).y((d) => y(d.s)));
    const show = mine && mine.g26 >= 100 && mine.g26 <= 4000 && mine.shareEaten != null;
    const me = show ? [mine] : [];
    svg.selectAll('circle.me').data(me).join('circle').attr('class', 'me')
      .attr('cx', (d) => x(d.g26)).attr('cy', (d) => y(d.shareEaten)).attr('r', 5);
    svg.selectAll('text.me-label').data(me).join('text').attr('class', 'me-label')
      .attr('x', (d) => x(d.g26) + 8).attr('y', (d) => y(d.shareEaten) - 8).text('your check');
  }, [mine]);
  return <div className="share" ref={ref} />;
}
