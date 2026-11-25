import rules from '../data/rules.json';

export default function Mechanics() {
  const bands = rules.applicable.bands;
  return (
    <section className="mt-14">
      <h2 className="h2">How the estimate works</h2>
      <div className="grid gap-6 md:grid-cols-2 mt-4">
        <div className="card p-5 text-sm">
          <p className="mt-0"><strong>1. Full price.</strong> We start from your state's average benchmark (second lowest cost silver) premium for a 40-year-old and scale it by age with the federal default age curve (age 21 = 1.000, 40 = 1.278, 64 and older = 3.000). Up to three children under 21 are priced at the child rate. New York and Vermont do not vary by age. Alabama, DC, Massachusetts, Minnesota, Mississippi, Oregon and Utah use their own curves, so results there are approximate.</p>
          <p><strong>2. Income.</strong> Household income is compared with the 2026 federal poverty guidelines, which set 2027 tax credits (higher in Alaska and Hawaii).</p>
          <p className="mb-0"><strong>3. Credit.</strong> The credit is the benchmark price minus your expected share of income, from the IRS table. Above 400% the credit is zero. Below 100% there is no credit; in expansion states most adults under 138% go to Medicaid.</p>
        </div>
        <div className="card p-5">
          <p className="label muted mt-0">Expected share of income, 2027 (Rev. Proc. 2026-26)</p>
          <table className="data">
            <thead><tr><th>Income, % of poverty line</th><th>Share of income</th></tr></thead>
            <tbody>
              {bands.map((b) => (
                <tr key={b.from}>
                  <td>{b.from === 0 ? `Under ${b.to}%` : b.to === 400 ? `${b.from}% to 400%` : `${b.from}% to under ${b.to}%`}</td>
                  <td>{b.start === b.end ? `${b.start}%` : `${b.start}% to ${b.end}%`}</td>
                </tr>
              ))}
              <tr><td>Over 400%</td><td>No credit</td></tr>
            </tbody>
          </table>
          <p className="text-xs muted mt-3 mb-0">Not modeled in v1: county prices, cost sharing reductions, state top-up subsidies (for example California, New Jersey, New Mexico, Rhode Island, Virginia), employer coverage offers, and immigration status limits that start in 2027.</p>
        </div>
      </div>
    </section>
  );
}
