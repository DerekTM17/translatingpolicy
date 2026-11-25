import data from '../data/states.json';

export default function StateTable({ selected }) {
  const rows = data.states
    .map((s) => ({ ...s, chg: ((s.b2027 - s.b2026) / s.b2026) * 100 }))
    .sort((a, b) => b.chg - a.chg);
  const max = Math.max(...rows.map((r) => Math.abs(r.chg)));
  const us = data.usAverage;
  return (
    <section id="states" className="mt-14">
      <h2 className="h2">Every state, 2026 to 2027</h2>
      <p className="muted max-w-3xl">
        Average monthly full price of the benchmark silver plan for a 40-year-old. Nationally it went from ${us.b2026} to ${us.b2027}. Sorted by the biggest increase.
      </p>
      <div className="card p-3 mt-4 overflow-x-auto">
        <table className="data">
          <thead>
            <tr><th>State</th><th>2026</th><th>2027</th><th>Change</th><th className="hidden sm:table-cell"><span className="sr-only">Bar</span></th></tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.code} style={r.code === selected ? { background: 'rgba(var(--c-aca-rgb), .08)' } : undefined}>
                <td>{r.name}</td>
                <td>${r.b2026}</td>
                <td>${r.b2027}</td>
                <td style={{ color: r.chg < 0 ? 'var(--c-state)' : 'var(--ink)' }}>{r.chg >= 0 ? '+' : ''}{r.chg.toFixed(1)}%</td>
                <td className="hidden sm:table-cell" style={{ width: '30%' }} aria-hidden="true">
                  <div style={{ height: 8, width: `${(Math.abs(r.chg) / max) * 100}%`, background: r.chg < 0 ? 'var(--c-state)' : 'var(--c-aca)', opacity: 0.8 }} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs muted mt-2">Source: KFF analysis of HealthCare.gov and state rate data, county values weighted by plan selections. 2027 figures updated Nov 6, 2026.</p>
    </section>
  );
}
