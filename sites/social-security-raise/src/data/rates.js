// Every figure here comes from a primary federal source listed in SOURCES below.
// Check with: npm run check-data (also runs before every build).

export const COLA_2027 = 0.036; // SSA press release, Oct 14, 2026

export const PART_B = {
  2026: { standard: 202.9, deductible: 283 },
  2027: { standard: 209.4, deductible: 292 },
};

// Income-related monthly adjustment amount (IRMAA) tiers, total monthly Part B premium.
// MAGI is from the tax return two years earlier (2024 return for 2026, 2025 return for 2027).
// Upper bounds are inclusive except the tier below $500,000 / $750,000, which is "less than".
export const IRMAA = {
  2026: [
    { single: 109000, joint: 218000, total: 202.9 },
    { single: 137000, joint: 274000, total: 284.1 },
    { single: 171000, joint: 342000, total: 405.8 },
    { single: 205000, joint: 410000, total: 527.5 },
    { single: 500000, joint: 750000, total: 649.2 },
    { single: Infinity, joint: Infinity, total: 689.9 },
  ],
  2027: [
    { single: 112000, joint: 224000, total: 209.4 },
    { single: 141000, joint: 282000, total: 293.1 },
    { single: 177000, joint: 354000, total: 418.8 },
    { single: 212000, joint: 424000, total: 544.4 },
    { single: 500000, joint: 750000, total: 670.0 },
    { single: Infinity, joint: Infinity, total: 711.8 },
  ],
};

export const SOURCES = [
  { id: 'ssa-cola', label: 'SSA press release: 3.6 percent benefit increase for 2027 (Oct 14, 2026)', url: 'https://www.ssa.gov/news/en/press/releases/2026-10-14.html' },
  { id: 'ssa-cola-fs', label: 'SSA 2027 COLA fact sheet: average benefits before and after the raise', url: 'https://www.ssa.gov/news/en/cola/factsheets/2027.html' },
  { id: 'ssa-blog', label: 'SSA blog: COLA timing, notices, taxable maximum (Oct 14, 2026)', url: 'https://www.ssa.gov/blog/en/posts/2026-10-14.html' },
  { id: 'cms-2027', label: 'CMS notice CMS-8094-N: Part B premium, deductible and income tiers for 2027 (Federal Register, Nov 19, 2026)', url: 'https://www.federalregister.gov/documents/2026/11/19/2026-23601/medicare-program-medicare-part-b-monthly-actuarial-rates-premium-rates-and-annual-deductible' },
  { id: 'cms-2027-fs', label: 'CMS fact sheet: 2027 Medicare Parts A and B premiums and deductibles (Nov 17, 2026)', url: 'https://www.cms.gov/newsroom/fact-sheets/2027-medicare-parts-b-premiums-deductibles' },
  { id: 'cms-2026', label: 'CMS fact sheet: 2026 Medicare Parts A and B premiums and deductibles', url: 'https://www.cms.gov/newsroom/fact-sheets/2026-medicare-parts-b-premiums-deductibles' },
  { id: 'poms-irmaa', label: 'SSA POMS HI 01101.031: how the income-related premium is calculated', url: 'https://secure.ssa.gov/poms.nsf/lnx/0601101031' },
];
