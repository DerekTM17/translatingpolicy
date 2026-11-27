import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { fmtBillions } from './lib.js';

// Horizontal bars: total collected (outline), then each reported refund milestone.
export default function RefundChart({ collected, milestones }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const draw = () => {
      const width = el.clientWidth || 640;
      const rows = [{ label: 'Collected (est.)', billions: collected, kind: 'total' }, ...milestones.map((m) => ({ label: m.label, billions: m.billions, kind: 'paid', qualifier: m.qualifier, measure: m.measure }))];
      const rowH = 46;
      const m = { top: 8, right: 64, bottom: 28, left: Math.min(130, width * 0.3) };
      const height = m.top + m.bottom + rows.length * rowH;
      const x = d3.scaleLinear().domain([0, collected]).range([m.left, width - m.right]);
      const y = d3.scaleBand().domain(rows.map((r) => r.label)).range([m.top, height - m.bottom]).padding(0.32);

      const svg = d3.select(el).selectAll('svg').data([null]).join('svg')
        .attr('width', width).attr('height', height).attr('role', 'img')
        .attr('aria-label', `Of an estimated ${fmtBillions(collected)} in IEEPA tariffs, refunds reported: ` + milestones.map((r) => `${r.label} ${r.qualifier} ${fmtBillions(r.billions)}`).join('; '));
      svg.selectAll('*').remove();

      svg.append('g').attr('transform', `translate(0,${height - m.bottom})`)
        .call(d3.axisBottom(x).ticks(width < 480 ? 4 : 6).tickFormat((v) => `$${v}B`).tickSizeOuter(0))
        .call((g) => g.selectAll('text').attr('fill', 'var(--ink-dim)').style('font-family', 'var(--f-mono)').style('font-size', '11px'))
        .call((g) => g.selectAll('line,path').attr('stroke', 'var(--line)'));

      const g = svg.append('g');
      g.selectAll('rect.track').data(rows).join('rect')
        .attr('x', x(0)).attr('y', (r) => y(r.label)).attr('height', y.bandwidth())
        .attr('width', x(collected) - x(0)).attr('fill', 'rgba(255,255,255,0.03)');
      g.selectAll('rect.bar').data(rows).join('rect')
        .attr('x', x(0)).attr('y', (r) => y(r.label)).attr('height', y.bandwidth())
        .attr('width', (r) => x(r.billions) - x(0))
        .attr('fill', (r) => (r.kind === 'total' ? 'rgba(var(--c-refund-rgb),0.18)' : 'rgba(var(--glow-rgb),0.55)'))
        .attr('stroke', (r) => (r.kind === 'total' ? 'var(--c-refund)' : 'var(--glow)'));
      g.selectAll('text.lab').data(rows).join('text')
        .attr('x', m.left - 10).attr('y', (r) => y(r.label) + y.bandwidth() / 2).attr('dy', '0.35em')
        .attr('text-anchor', 'end').attr('fill', 'var(--ink)').style('font-size', '12px').text((r) => r.label);
      g.selectAll('text.val').data(rows).join('text')
        .attr('x', (r) => x(r.billions) + 6).attr('y', (r) => y(r.label) + y.bandwidth() / 2).attr('dy', '0.35em')
        .attr('fill', (r) => (r.kind === 'total' ? 'var(--c-refund)' : 'var(--glow)'))
        .style('font-family', 'var(--f-mono)').style('font-size', '12px')
        .text((r) => (r.qualifier === 'more than' ? '>' : r.qualifier === 'about' ? '~' : '') + fmtBillions(r.billions));
    };
    draw();
    const ro = new ResizeObserver(draw);
    ro.observe(el);
    return () => ro.disconnect();
  }, [collected, milestones]);

  return <div ref={ref} className="w-full" />;
}
