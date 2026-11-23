import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { NATIONAL_PER } from '../lib.js';

// Every state's FY2025 error rate as a dot, on bands that show the share it would pay.
export default function RateChart({ rows, selected, onPick }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const draw = () => {
      const width = Math.max(320, el.clientWidth);
      const sorted = [...rows].sort((a, b) => a.per - b.per);
      const narrow = width < 640;
      const rowH = narrow ? 14 : 15;
      const margin = { top: 34, right: 54, bottom: 26, left: narrow ? 34 : 130 };
      const height = margin.top + margin.bottom + sorted.length * rowH;
      const x = d3.scaleLinear().domain([0, 24]).range([margin.left, width - margin.right]);
      const y = d3.scaleBand().domain(sorted.map((d) => d.code)).range([margin.top, height - margin.bottom]).padding(0.25);
      const svg = d3.select(el).selectAll('svg').data([null]).join('svg')
        .attr('viewBox', `0 0 ${width} ${height}`).attr('width', '100%').attr('height', height)
        .attr('role', 'img').attr('aria-label', 'FY2025 SNAP payment error rate by state, on cost-share bands');
      svg.selectAll('*').remove();
      const bands = [[0, 6, 't0', 'Pays 0%'], [6, 8, 't5', '5%'], [8, 10, 't10', '10%'], [10, 24, 't15', 'Pays 15%']];
      svg.append('g').selectAll('rect').data(bands).join('rect')
        .attr('class', (d) => `band ${d[2]}`).attr('x', (d) => x(d[0])).attr('width', (d) => x(d[1]) - x(d[0]))
        .attr('y', margin.top - 6).attr('height', height - margin.top - margin.bottom + 6);
      svg.append('g').selectAll('text').data(bands).join('text')
        .attr('class', (d) => `band-label ${d[2]}`).attr('x', (d) => (x(d[0]) + x(d[1])) / 2).attr('y', margin.top - 14)
        .attr('text-anchor', 'middle').text((d) => d[3]);
      svg.append('line').attr('class', 'delay').attr('x1', x(40 / 3)).attr('x2', x(40 / 3))
        .attr('y1', margin.top - 6).attr('y2', height - margin.bottom);
      svg.append('text').attr('class', 'delay-label').attr('x', x(40 / 3) + 4).attr('y', height - margin.bottom - 4)
        .text(narrow ? 'delay line' : 'delay line (13.33%)');
      svg.append('line').attr('class', 'nat').attr('x1', x(NATIONAL_PER)).attr('x2', x(NATIONAL_PER))
        .attr('y1', margin.top - 6).attr('y2', height - margin.bottom);
      svg.append('g').attr('class', 'axis').attr('transform', `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(x).ticks(narrow ? 6 : 12).tickFormat((d) => `${d}%`));
      const g = svg.append('g').selectAll('g').data(sorted).join('g')
        .attr('class', (d) => `row ${d.code === selected ? 'sel' : ''}`)
        .attr('transform', (d) => `translate(0,${y(d.code) + y.bandwidth() / 2})`)
        .style('cursor', 'pointer').on('click', (_, d) => onPick(d.code));
      g.append('text').attr('class', 'name').attr('x', margin.left - 8).attr('dy', '0.35em').attr('text-anchor', 'end')
        .text((d) => (narrow ? d.code : d.name));
      g.append('line').attr('class', 'stem').attr('x1', x(0)).attr('x2', (d) => x(d.per));
      g.append('circle').attr('class', (d) => `dot t${d.tier}`).attr('cx', (d) => x(d.per)).attr('r', (d) => (d.code === selected ? 6 : 4));
      g.append('text').attr('class', 'val').attr('x', (d) => x(d.per) + 9).attr('dy', '0.35em').text((d) => `${d.per.toFixed(2)}`);
      g.append('title').text((d) => `${d.name}: ${d.per.toFixed(2)}%`);
    };
    draw();
    const ro = new ResizeObserver(draw);
    ro.observe(el);
    return () => ro.disconnect();
  }, [rows, selected, onPick]);
  return <div className="chart" ref={ref} />;
}
