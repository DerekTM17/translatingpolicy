// Pure math for the page. No React here so tests can import it with plain Node.

/** Round to the cent. */
export const cents = (x) => Math.round(x * 100) / 100;

/**
 * Index of the years-of-service column for a member with `years` completed years.
 * Columns: "2 or less", then "Over 2", "Over 3", "Over 4", "Over 6", ... "Over 40".
 * A member with exactly 2 years is in "2 or less"; 2.01 to 3 is "Over 2", and so on.
 */
export function columnIndex(years, columns) {
  if (years <= 2) return 0;
  let idx = 0;
  for (let i = 1; i < columns.length; i++) {
    if (years > Number(columns[i])) idx = i;
  }
  return idx;
}

/**
 * 2027 monthly basic pay under a scenario. Officers O-6 and below are capped at
 * Executive Schedule Level V; we use the 2026 Level V rate because civilian
 * executive pay for 2027 is not yet set (see README open questions).
 */
export function pay2027(pay2026, ratePct, grade, cap) {
  if (pay2026 == null) return null;
  let v = pay2026 * (1 + ratePct / 100);
  if (grade.startsWith('O-') && cap != null) v = Math.min(v, Math.max(cap, pay2026));
  return cents(v);
}

/** Everything the page shows for one grade and years-of-service pick. */
export function compare(data, gradeName, years) {
  const g = data.grades.find((x) => x.grade === gradeName);
  if (!g) throw new Error(`unknown grade ${gradeName}`);
  const col = columnIndex(years, data.columns);
  const base = g.pay2026[col];
  if (base == null) return { grade: gradeName, col, base: null };
  const out = { grade: gradeName, col, base, basis: g.basis[col], scenarios: {} };
  for (const [key, s] of Object.entries(data.scenarios)) {
    const rate = s.rates[gradeName];
    const monthly = pay2027(base, rate, gradeName, data.levelVCap2026);
    out.scenarios[key] = { rate, monthly, raiseMonthly: cents(monthly - base), raiseYear: cents((monthly - base) * 12) };
  }
  const p = out.scenarios.president, s = out.scenarios.senate;
  out.gapMonthly = cents(p.monthly - s.monthly);
  out.gapYear = cents(out.gapMonthly * 12);
  return out;
}

/** First years-of-service value where a grade has a pay rate (E-8 and E-9 start later). */
export function firstYears(data, gradeName) {
  const g = data.grades.find((x) => x.grade === gradeName);
  const i = g.pay2026.findIndex((v) => v != null);
  return i === 0 ? 0 : Number(data.columns[i]) + 1;
}

export const usd = (x, digits = 2) =>
  x == null ? 'n/a' : x.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: digits, maximumFractionDigits: digits });
