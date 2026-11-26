import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { usd } from './lib.js';

// Waterfall: December 2026 deposit, plus the raise, minus the Medicare change, equals the January 2027 deposit.
// The y axis is zoomed (it does not start at $0) so a $70 change on a $2,000 check is visible; the page says so.
export default function Waterfall({ r, deducted }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    const W = el.clientWidth || 640, H = 280, m = { t: 28, r: 8, b: 44, l: 8 };
    const steps = deducted
      ? [
          { k: 'Dec 2026', a: 0, b: r.net26, cls: 'base' },
          { k: 'Raise', a: r.net26, b: r.net26 + r.raise, cls: 'up' },
          { k: 'Medicare', a: r.net26 + r.raise, b: r.net27, cls: r.premiumChange > 0 ? 'down' : 'up' },
          { k: 'Jan 2027', a: 0, b: r.net27, cls: 'base' },
        ]
      : [
          { k: 'Dec 2026', a: 0, b: r.g26, cls: 'base' },
          { k: 'Raise', a: r.g26, b: r.g27, cls: 'up' },
          { k: 'Jan 2027', a: 0, b: r.g27, cls: 'base' },
        ];
    const top = Math.max(1, ...steps.map((s) => Math.max(s.a, s.b)));
    const low = Math.min(...steps.map((s) => (s.cls === 'base' ? s.b : Math.min(s.a, s.b))));
    const floor = Math.max(0, low - Math.max(top - low, 1) * 2.5);
    const x = d3.scaleBand().domain(steps.map((s) => s.k)).range([m.l, W - m.r]).padding(0.28);
    const y = d3.scaleLinear().domain([floor, top + (top - floor) * 0.04]).range([H - m.b, m.t]);
    const svg = d3.select(el).selectAll('svg').data([0]).join('svg')
      .attr('viewBox', `0 0 ${W} ${H}`).attr('width', '100%').attr('role', 'img')
      .attr('aria-label', steps.map((s) => `${s.k}: ${s.cls === 'base' ? usd(s.b) : usd(s.b - s.a)}`).join('; '));
    svg.selectAll('g.bar').data(steps, (d) => d.k).join(
      (enter) => {
        const g = enter.append('g');
        g.append('rect');
        g.append('text').attr('class', 'val').attr('text-anchor', 'middle');
        g.append('text').attr('class', 'lab').attr('text-anchor', 'middle');
        return g;
      },
    ).attr('class', (d) => `bar ${d.cls}`).each(function (d) {
      const g = d3.select(this);
      const lo = Math.max(floor, Math.min(d.a, d.b)), hi = Math.max(d.a, d.b);
      const cx = x(d.k) + x.bandwidth() / 2;
      g.select('rect').attr('x', x(d.k)).attr('width', x.bandwidth()).attr('y', y(hi)).attr('height', Math.max(2, y(lo) - y(hi)));
      g.select('.val').attr('x', cx).attr('y', y(hi) - 8)
        .text(d.cls === 'base' ? usd(d.b) : `${d.b >= d.a ? '+' : '-'}${usd(Math.abs(d.b - d.a))}`);
      g.select('.lab').attr('x', cx).attr('y', H - m.b + 22).text(d.k);
    });
    svg.selectAll('line.rail').data([0]).join('line').attr('class', 'rail')
      .attr('x1', m.l).attr('x2', W - m.r).attr('y1', H - m.b).attr('y2', H - m.b);
  }, [r, deducted]);
  return <div className="waterfall" ref={ref} />;
}
