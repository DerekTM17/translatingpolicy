# Military Pay Raise 2027

Proposed subdomain: **militarypayraise.translatingpolicy.com**

Pick a pay grade and years of service and see your January 2027 monthly basic pay under the two raises Congress is choosing between:

- **President's plan (default on Jan 1):** 7% for E-1 to E-5, 6% for E-6 to O-3, 5% for O-4 and above (House Document 119-189, Aug 26, 2026, under 37 U.S.C. 1009(e)). The House NDAA, H.R. 8800, matches it.
- **Senate NDAA, S. 4784:** 3.6% for everyone, the automatic wage-index raise under 37 U.S.C. 1009(c).

The final FY2027 NDAA, being negotiated in the December 2026 lame duck session, decides which applies.

## Data sources
See `data/sources.csv`, `data/methodology.md` and the companion workbook `data/military-pay-raise-2027_sources.xlsx` (sources, full 2026 table, per-cell basis, scenario rates, method). Data as of Nov 25, 2026. Update when the NDAA is enacted and when DFAS posts the 2027 tables (usually late January).

Known limit: the DFAS enlisted page served on Nov 25, 2026 still showed the April 2025 table, so 54 enlisted cells are computed (2025 x 1.038) and may be off by about $0.10. The page tells the reader when a computed cell is shown.

## Run
```
npm install
npm test          # unit tests for the math
npm run build     # data check + Vite build into dist/
npm run dev
```

## Deploy as a subdomain (not done; needs Derek's go-ahead)
1. New Vercel project from this repo with Root Directory `sites/military-pay-raise-2027` (vercel.json is included; framework Vite, output `dist`).
2. Add domain `militarypayraise.translatingpolicy.com` in Vercel, then a CNAME at GoDaddy pointing to Vercel.
3. To list it on the hub: add an entry to `src/data/projects.json` plus an accent in `src/lib/projects.ts` and styles.

## Out of scope for v1
Allowances (BAH, BAS), special pays, taxes, warrant officers, O-7 and above, O-1E to O-3E, reserve drill pay.

## Open questions
- Final NDAA conference raise (may land between 3.6% and 7/6/5).
- Whether the 2027 Executive Schedule Level V cap rises (affects O-6 at 30+ years); v1 holds it at the 2026 rate.
- Replace computed enlisted cells with the official DFAS 2026 enlisted table once a readable copy is reached.
- Confirm H.R. 8800 and S. 4784 text on congress.gov (status figures come from MOAA).
