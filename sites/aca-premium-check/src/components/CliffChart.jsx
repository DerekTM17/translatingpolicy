import { useEffect, useMemo, useRef } from 'react';
import * as d3 from 'd3';
import rules from '../data/rules.json';
import { cliffSeries, estimate } from '../lib/calc.js';
import { usd } from '../lib/format.js';

export default function CliffChart({ input, state }) {
  const ref = useRef(null);
  const pts = useMemo(() => cliffSeries(rules, state, input.adultAges, input.children), [state, input.adultAges, input.children]);
  const me = estimate(rules, { ...state, medicaidExpansion: false }, input);
  const at400 = pts.find((p) => p.pct === 400);
  const jump = (pts.find((p) => p.pct === 405).youPay - at400.youPay) * 12;

  useEffect(() => {
    const el = ref.current;
    const W = el.clientWidth || 640, H = 300, m = { t: 16, r: 16, b: 40, l: 56 };
    const x = d3.scaleLinear().domain(d3.extent(pts, (p) => p.income)).range([m.l, W - m.r]);
    const y = d3.scaleLinear().domain([0, d3.max(pts, (p) => p.youPay) * 1.1]).nice().range([H - m.b, m.t]);
    d3.select(el).selectAll('svg').data([]).exit().remove();
    const svg = d3.select(el).append('svg').attr('viewBox', `0 0 ${W} ${H}`).attr('class', 'chart').attr('role', 'img')
      .attr('aria-label', `Monthly cost of the benchmark plan by income. At 400% of the poverty line, ${usd(at400.income)}, the cost jumps to full price.`);
    svg.append('g').attr('transform', `translate(0,${H - m.b})`).call(d3.axisBottom(x).ticks(6).tickFormat((d) => `$${d / 1000}k`));
    svg.append('g').attr('transform', `translate(${m.l},0)`).call(d3.axisLeft(y).ticks(5).tickFormat((d) => `$${d}`));
    svg.append('line').attr('x1', x(at400.income)).attr('x2', x(at400.income)).attr('y1', m.t).attr('y2', H - m.b)
      .attr('stroke', 'var(--c-war)').attr('stroke-dasharray', '4 4');
    svg.append('text').attr('x', x(at400.income) + 6).attr('y', m.t + 12).text('400% cliff').style('fill', 'var(--c-war)');
    const line = d3.line().x((p) => x(p.income)).y((p) => y(p.youPay)).curve(d3.curveStepAfter);
    svg.append('path').datum(pts).attr('d', line).attr('fill', 'none').attr('stroke', 'var(--c-aca)').attr('stroke-width', 2.5)
      .style('filter', 'drop-shadow(0 0 6px rgba(198,255,61,.45))');
    if (me.youPay != null && me.fplPct >= 100 && me.fplPct <= 600) {
      svg.append('circle').attr('cx', x(input.income)).attr('cy', y(me.youPay)).attr('r', 6).attr('fill', 'var(--void)').attr('stroke', 'var(--glow)').attr('stroke-width', 2.5);
      svg.append('text').attr('x', x(input.income)).attr('y', y(me.youPay) - 12).attr('text-anchor', 'middle').text('you').style('fill', 'var(--glow)');
    }
  }, [pts, me.youPay, me.fplPct, input.income, at400]);

  return (
    <section id="cliff" className="mt-14">
      <h2 className="h2">The cliff, for your household</h2>
      <p className="muted max-w-3xl">
        What the benchmark silver plan costs you each month as income rises, from 100% to 600% of the poverty line. Below 400% the bill grows slowly with income. One dollar past {usd(at400.income)}, it jumps to full price: about <strong style={{ color: 'var(--c-war)' }}>{usd(jump)} more a year</strong> for this household in {state.name}.
      </p>
      <div ref={ref} className="card p-3 mt-4" style={{ minHeight: 300 }} />
    </section>
  );
}
