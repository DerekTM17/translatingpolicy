export const TERRITORIES = new Set(['GU', 'VI']);
export const NATIONAL_PER = 10.62; // USDA FNS FY2025 national payment error rate
export const SRC = {
  per: 'https://www.fna.usda.gov/sites/default/files/resource-files/snap-qcfy25-per.pdf',
  perPage: 'https://www.fns.usda.gov/snap/qc/per',
  benefits: 'https://www.fna.usda.gov/sites/default/files/resource-files/snap-benefits-11.pdf',
  crs: 'https://www.congress.gov/crs_external_products/R/PDF/R48552/R48552.7.pdf',
  hk: 'https://www.hklaw.com/en/insights/publications/2026/10/beyond-the-midterms-congress-faces-converging-year-end-deadlines',
};
export const usd = (n) => {
  if (n >= 1e9) return `$${(n / 1e9).toFixed(2)} billion`;
  if (n >= 1e6) return `$${Math.round(n / 1e6).toLocaleString('en-US')} million`;
  return `$${Math.round(n).toLocaleString('en-US')}`;
};
export const tierLabel = (t) => (t === 0 ? 'Pays nothing' : `Pays ${t}%`);
export const tierClass = (t) => `t${t}`;
