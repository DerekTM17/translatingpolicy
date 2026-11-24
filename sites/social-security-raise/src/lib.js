import { COLA_2027, PART_B, IRMAA } from './data/rates.js';

export const round2 = (n) => Math.round(n * 100) / 100;

/** Tier index (0 = standard) for a MAGI under a year's table. */
export function tierFor(year, magi, filing = 'single') {
  const t = IRMAA[year];
  const key = filing === 'joint' ? 'joint' : 'single';
  for (let i = 0; i < t.length; i++) {
    const cap = t[i][key];
    // the second-to-last tier's cap is "less than", all others "less than or equal"
    const ok = i === t.length - 2 ? magi < cap : magi <= cap;
    if (ok) return i;
  }
  return t.length - 1;
}

/** Estimated 2027 gross: SSA pays whole dollars, rounded down. Within about $1 of the real figure. */
export function gross2027(gross2026) {
  return Math.floor(gross2026 * (1 + COLA_2027) + 1e-9);
}

/**
 * Compare a monthly check in Dec 2026 vs Jan 2027.
 * opts: { gross2026, deducted (Part B taken from check), statePays (Medicare Savings Program), tier2026, tier2027 }
 */
export function compare({ gross2026, deducted = true, statePays = false, tier2026 = 0, tier2027 = 0 }) {
  const g26 = Math.max(0, Number(gross2026) || 0);
  const g27 = gross2027(g26);
  const raise = g27 - g26;
  let p26 = statePays ? 0 : IRMAA[2026][tier2026].total;
  let p27 = statePays ? 0 : IRMAA[2027][tier2027].total;
  let heldHarmless = false;
  // Hold harmless (Social Security Act sec. 1839(f)): if the premium is taken from the check and the person
  // pays no income-related amount, the premium increase cannot exceed the dollar raise.
  if (deducted && !statePays && tier2027 === 0 && tier2026 === 0 && p27 - p26 > raise) {
    p27 = p26 + raise;
    heldHarmless = true;
  }
  const premiumChange = round2(p27 - p26);
  const net26 = deducted ? round2(g26 - p26) : g26;
  const net27 = deducted ? round2(g27 - p27) : g27;
  return {
    g26, g27, raise, p26: round2(p26), p27: round2(p27), premiumChange,
    net26, net27, netChange: round2(net27 - net26), heldHarmless,
    shareEaten: raise > 0 ? Math.min(1, Math.max(0, premiumChange / raise)) : null,
  };
}

export const usd = (n, cents = true) =>
  n.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: cents ? 2 : 0, maximumFractionDigits: cents ? 2 : 0 });
