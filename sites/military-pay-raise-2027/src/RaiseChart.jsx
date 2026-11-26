import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { compare, usd } from './lib.js';

// Grouped bars: monthly raise for every grade at the chosen years of service,
// President's plan (green) next to the Senate NDAA (blue). Grades with no rate
// at that service length (E-8, E-9 early on) are left empty and labeled.
export default function RaiseChart({ data, years, selected }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const draw = () => {
      const rows = data.grades.map((g) => compare(data, g.grade, years));
      const width = Math.max(320, el.clientWidth);
      const height = 300;
      const m = { top: 16, right: 8, bottom: 40, left: 52 };
      const svg = d3.select(el).selectAll('svg').data([null]).join('svg')
        .attr('viewBox', `0 0 ${width} ${height}`).attr('width', '100%').attr('height', height)
        .attr('role', 'img')
        .attr('aria-label', `Monthly raise by grade at ${years} years of service under both plans`);
      svg.selectAll('*').remove();
      const x0 = d3.scaleBand().domain(rows.map((r) => r.grade)).range([m.left, width - m.right]).padding(0.18);
      const x1 = d3.scaleBand().domain(['president', 'senate']).range([0, x0.bandwidth()]).padding(0.08);
      const max = d3.max(rows, (r) => (r.base == null ? 0 : r.scenarios.president.raiseMonthly)) || 1;
      const y = d3.scaleLinear().domain([0, max * 1.08]).nice().range([height - m.bottom, m.top]);

      svg.append('g').attr('transform', `translate(${m.left},0)`)
        .call(d3.axisLeft(y).ticks(5).tickFormat((d) => `$${d}`).tickSize(-(width - m.left - m.right)))
        .call((g) => g.select('.domain').remove())
        .call((g) => g.selectAll('line').attr('stroke', 'rgba(0,180,255,0.12)'))
        .call((g) => g.selectAll('text').attr('fill', 'rgba(150,200,235,0.75)').attr('font-family', 'JetBrains Mono').attr('font-size', 10));
      svg.append('g').attr('transform', `translate(0,${height - m.bottom})`)
        .call(d3.axisBottom(x0).tickSize(0).tickPadding(8))
        .call((g) => g.select('.domain').attr('stroke', 'rgba(0,180,255,0.3)'))
        .call((g) => g.selectAll('text')
          .attr('fill', (d) => (d === selected ? '#7dd87a' : 'rgba(150,200,235,0.85)'))
          .attr('font-weight', (d) => (d === selected ? 700 : 400))
          .attr('font-family', 'JetBrains Mono').attr('font-size', width < 520 ? 8 : 10));

      const color = { president: '#7dd87a', senate: '#00b4ff' };
      const grp = svg.append('g').selectAll('g').data(rows).join('g')
        .attr('transform', (r) => `translate(${x0(r.grade)},0)`);
      grp.filter((r) => r.base != null).selectAll('rect')
        .data((r) => ['president', 'senate'].map((k) => ({ k, r, v: r.scenarios[k].raiseMonthly })))
        .join('rect')
        .attr('x', (d) => x1(d.k)).attr('width', x1.bandwidth())
        .attr('y', (d) => y(d.v)).attr('height', (d) => y(0) - y(d.v))
        .attr('fill', (d) => color[d.k])
        .attr('opacity', (d) => (d.r.grade === selected ? 1 : 0.55))
        .append('title').text((d) => `${d.r.grade}: ${usd(d.v)} a month (${data.scenarios[d.k].label})`);
      grp.filter((r) => r.base == null).append('text')
        .attr('x', x0.bandwidth() / 2).attr('y', y(0) - 6).attr('text-anchor', 'middle')
        .attr('fill', 'rgba(150,200,235,0.5)').attr('font-size', 9).attr('font-family', 'JetBrains Mono').text('n/a');
    };
    draw();
    const ro = new ResizeObserver(draw);
    ro.observe(el);
    return () => ro.disconnect();
  }, [data, years, selected]);

  return <div ref={ref} className="w-full" />;
}
