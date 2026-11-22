import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { todayInEastern, formatDate } from '../lib.js';

// A simple strip from mid-November to early January with today and both cliffs.
export default function Timeline({ cliffs, counts }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;

    const draw = () => {
      const width = Math.max(320, el.clientWidth);
      const height = 132;
      const margin = { top: 34, right: 24, bottom: 30, left: 24 };
      const parse = d3.utcParse('%Y-%m-%d');
      const today = parse(todayInEastern());
      const start = d3.min([parse('2026-11-16'), today]);
      const end = d3.max([parse('2027-01-08'), today]);

      const x = d3.scaleUtc().domain([start, end]).range([margin.left, width - margin.right]);
      const y = margin.top + 30;

      const svg = d3.select(el).selectAll('svg').data([null]).join('svg')
        .attr('viewBox', `0 0 ${width} ${height}`)
        .attr('width', '100%')
        .attr('height', height)
        .attr('role', 'img')
        .attr('aria-label', `Timeline: today, then ${cliffs.map((c) => formatDate(c.date, { month: 'long', day: 'numeric' })).join(' and ')}`);
      svg.selectAll('*').remove();

      // Band between today and the last cliff.
      const last = parse(cliffs[cliffs.length - 1].date);
      if (today < last) {
        svg.append('rect')
          .attr('x', x(today)).attr('y', y - 10)
          .attr('width', Math.max(0, x(last) - x(today))).attr('height', 20)
          .attr('rx', 10).attr('fill', '#e2e8f0');
      }

      svg.append('line')
        .attr('x1', margin.left).attr('x2', width - margin.right)
        .attr('y1', y).attr('y2', y)
        .attr('stroke', '#94a3b8').attr('stroke-width', 2);

      const axis = d3.axisBottom(x)
        .ticks(d3.utcWeek.every(width < 520 ? 2 : 1))
        .tickFormat(d3.utcFormat('%b %-d'))
        .tickSizeOuter(0);
      svg.append('g').attr('class', 'timeline-axis')
        .attr('transform', `translate(0, ${height - margin.bottom})`)
        .call(axis);

      // Today marker.
      svg.append('line')
        .attr('x1', x(today)).attr('x2', x(today))
        .attr('y1', y - 22).attr('y2', y + 22)
        .attr('stroke', '#0f172a').attr('stroke-width', 2).attr('stroke-dasharray', '3 3');
      svg.append('text')
        .attr('x', x(today)).attr('y', y - 26)
        .attr('text-anchor', 'middle').attr('font-size', 12).attr('font-weight', 600).attr('fill', '#0f172a')
        .text('Today');

      const colors = ['#f59e0b', '#e11d48'];
      const r = d3.scaleSqrt().domain([0, d3.max(cliffs, (c) => counts[c.date] || 0)]).range([6, 18]);
      cliffs.forEach((c, i) => {
        const cx = x(parse(c.date));
        svg.append('circle')
          .attr('cx', cx).attr('cy', y).attr('r', r(counts[c.date] || 0))
          .attr('fill', colors[i % colors.length]).attr('stroke', '#fff').attr('stroke-width', 2);
        svg.append('text')
          .attr('x', cx).attr('y', y - 26)
          .attr('text-anchor', 'middle').attr('font-size', 12).attr('font-weight', 700).attr('fill', colors[i % colors.length])
          .text(`${formatDate(c.date, { month: 'short', day: 'numeric' })}: ${counts[c.date] || 0} items`);
      });
    };

    draw();
    const ro = new ResizeObserver(draw);
    ro.observe(el);
    return () => ro.disconnect();
  }, [cliffs, counts]);

  return <div ref={ref} className="w-full" />;
}
