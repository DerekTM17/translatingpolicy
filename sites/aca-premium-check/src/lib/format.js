export const usd = (n) => (n == null ? '' : n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }));
export const pct = (n, d = 0) => `${n.toFixed(d)}%`;
