// Pure helpers, shared by the app and the node tests.

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** Dollars per household if `passThrough` (0 to 1) of the tariff bill reached shoppers. */
export function perHousehold(totalBillions, householdsThousands, passThrough) {
  if (!(householdsThousands > 0)) throw new Error('households must be positive');
  const p = Math.min(1, Math.max(0, Number(passThrough) || 0));
  return (totalBillions * 1e9 * p) / (householdsThousands * 1e3);
}

/** Share of the collected total that has gone back, 0 to 1. */
export function shareReturned(returnedBillions, collectedBillions) {
  if (!(collectedBillions > 0)) return 0;
  return Math.min(1, Math.max(0, returnedBillions / collectedBillions));
}

/** Whole days from `from` to an ISO date (date only, local midnight). Negative if past. */
export function daysUntil(iso, from = new Date()) {
  const [y, m, d] = iso.split('-').map(Number);
  const target = new Date(y, m - 1, d);
  const start = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  return Math.round((target - start) / 86400000);
}

export function fmtDate(iso, approx = false) {
  const [y, m, d] = iso.split('-').map(Number);
  return approx ? `${MONTHS[m - 1]} ${y}` : `${MONTHS[m - 1]} ${d}, ${y}`;
}

export function fmtUsd(n) {
  return '$' + Math.round(n).toLocaleString('en-US');
}

export function fmtBillions(n) {
  return '$' + (Number.isInteger(n) ? n : n.toFixed(1)) + 'B';
}

/** Latest milestone by date. */
export function latest(milestones) {
  return [...milestones].sort((a, b) => a.date.localeCompare(b.date)).at(-1);
}
