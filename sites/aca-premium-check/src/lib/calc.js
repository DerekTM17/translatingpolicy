// Pure estimate logic for the ACA Premium Check. No DOM, no network.
// Every constant comes from src/data/rules.json and src/data/states.json.

export function povertyLine(rules, region, size) {
  const t = rules.fpl[region] || rules.fpl.US48;
  const n = Math.max(1, Math.floor(size));
  if (n <= t.base.length) return t.base[n - 1];
  return t.base[t.base.length - 1] + (n - t.base.length) * t.each;
}

// Applicable percentage (share of income expected toward the benchmark), as a percent.
// Returns null when the household is outside the 100% to 400% band (no tax credit).
export function applicablePct(rules, fplPct) {
  const a = rules.applicable;
  if (fplPct < a.floorPct || fplPct > a.ceilingPct) return null;
  for (const b of a.bands) {
    const last = b.to === a.ceilingPct;
    if (fplPct >= b.from && (fplPct < b.to || (last && fplPct <= b.to))) {
      if (b.start === b.end) return b.start;
      const share = (fplPct - b.from) / (b.to - b.from);
      return b.start + share * (b.end - b.start);
    }
  }
  return null;
}

export function ageRatio(rules, age) {
  const r = rules.ageCurve.ratios;
  const a = Math.max(0, Math.floor(age));
  if (a <= 14) return r['0-14'];
  if (a >= 64) return r['64'];
  return r[String(a)];
}

// Monthly benchmark (second lowest silver) for the household, scaled from the
// state's 40-year-old average with the federal default age curve.
export function householdBenchmark(rules, state, adultAges, children, year = 2027) {
  const base40 = year === 2026 ? state.b2026 : state.b2027;
  const ref = rules.ageCurve.reference40;
  const rated = Math.min(Math.max(0, Math.floor(children)), rules.ageCurve.maxChildrenRated);
  const ratio = (age) => (state.ageRating === 'none' ? ref : ageRatio(rules, age));
  let total = 0;
  for (const age of adultAges) total += base40 * (ratio(age) / ref);
  for (let i = 0; i < rated; i++) total += base40 * (ratio(10) / ref);
  return total;
}

export function estimate(rules, state, { income, adultAges, children = 0 }) {
  const size = adultAges.length + Math.max(0, Math.floor(children));
  const fpl = povertyLine(rules, state.fplRegion, size);
  const fplPct = (income / fpl) * 100;
  const benchmark = householdBenchmark(rules, state, adultAges, children, 2027);
  const benchmark2026 = householdBenchmark(rules, state, adultAges, children, 2026);
  const pct = applicablePct(rules, fplPct);
  const ceilingIncome = fpl * (rules.applicable.ceilingPct / 100);

  let status;
  if (state.medicaidExpansion && fplPct < 138) status = 'medicaid';
  else if (fplPct < rules.applicable.floorPct) status = 'gap';
  else if (pct === null) status = 'cliff';
  else status = 'credit';

  const contribution = pct === null ? null : (income * (pct / 100)) / 12;
  const credit = status === 'credit' ? Math.max(0, benchmark - contribution) : 0;
  const youPay = status === 'credit' ? benchmark - credit : status === 'cliff' ? benchmark : null;

  return {
    size, fpl, fplPct, ceilingIncome, benchmark, benchmark2026,
    benchmarkChangePct: ((benchmark - benchmark2026) / benchmark2026) * 100,
    applicablePct: pct, contribution, credit, youPay, status,
    approximateAge: state.ageRating === 'own',
  };
}

// Points for the cliff chart: monthly cost of the benchmark plan across incomes.
export function cliffSeries(rules, state, adultAges, children, maxPct = 600, step = 5) {
  const size = adultAges.length + Math.max(0, Math.floor(children));
  const fpl = povertyLine(rules, state.fplRegion, size);
  const pts = [];
  for (let p = 100; p <= maxPct; p += step) {
    const income = (fpl * p) / 100;
    const e = estimate(rules, { ...state, medicaidExpansion: false }, { income, adultAges, children });
    pts.push({ pct: p, income, youPay: e.youPay });
  }
  return pts;
}
