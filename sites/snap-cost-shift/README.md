# SNAP Cost Shift (nightly v1, 2026-11-22)

**What it is.** A one-page dashboard: pick your state and see whether it will have to pay part of SNAP grocery benefits starting October 1, 2027 (FY2028) under P.L. 119-21 sec. 10105, which tier it lands in on its FY2025 payment error rate, whether the law's delay applies, and a rough yearly dollar scale. A short section covers what Congress is weighing in the farm bill (a one or two year delay).

Proposed subdomain: `snapcostshift.translatingpolicy.com`. Hub look (tokens from `src/styles/tokens.css`, Chakra Petch / Inter / JetBrains Mono, scanlines), project accent lime `#b8f53a`.

## Data sources
| Data | Source | Cadence |
|---|---|---|
| FY2025 state payment error rates (over, under, total) | USDA FNS, [FY 25 Payment Error Rates (PDF)](https://www.fna.usda.gov/sites/default/files/resource-files/snap-qcfy25-per.pdf), from [SNAP QC page](https://www.fns.usda.gov/snap/qc/per) | Annual, about June 30 |
| State SNAP benefits, Aug 2026 (initial) | USDA FNS, [State Level Participation by Benefits (PDF)](https://www.fna.usda.gov/sites/default/files/resource-files/snap-benefits-11.pdf), data as of Nov 13, 2026 | Monthly |
| Tiers, FY2028 start, FY2025/FY2026 election, delay test, admin share | CRS [R48552](https://www.congress.gov/crs_external_products/R/PDF/R48552/R48552.7.pdf) | Static (law) |
| Farm bill status | [Holland & Knight, Oct 2026](https://www.hklaw.com/en/insights/publications/2026/10/beyond-the-midterms-congress-faces-converging-year-end-deadlines) (secondary) | Check weekly |

All numbers are real public data, copied by hand into `data/per_fy2025.tsv`. No sample data. Raw data, formulas and methodology: `data/sources.xlsx`.

**Limits.** The dollar figure is Aug 2026 benefits x 12 x tier: a sense of scale, not a forecast. It ignores caseload change, the FY2026 rate election (FY2026 rates come out about June 2027) and any delay Congress passes. Guam and the Virgin Islands appear in USDA's table; whether the cost share applies to them is unverified and the page says so.

## Run
```
npm install
npm run dev        # local
npm run build      # runs scripts/check-data.mjs, then vite build to dist/
```
To refresh data: edit `data/per_fy2025.tsv`, then `python3 -I scripts/build-data.py` (needs openpyxl) to rewrite `src/data/states.json` and `data/sources.xlsx`.

## Deploy as a subdomain (not done; needs Derek's okay)
1. New Vercel project from this repo with Root Directory `sites/snap-cost-shift` (framework Vite; `vercel.json` sets build and output).
2. Add domain `snapcostshift.translatingpolicy.com` in Vercel, then a CNAME at GoDaddy.
3. Add an entry to `src/data/projects.json` plus an accent in `src/lib/projects.ts` and styles so the hub lists it.

Note: styling is plain CSS with the hub tokens, matching the Cliff Calendar build, rather than Tailwind.
