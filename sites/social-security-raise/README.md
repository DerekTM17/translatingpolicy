# Social Security Raise 2027

Social Security checks rise 3.6% in January 2027. The Medicare Part B premium that comes out of most checks rises $6.50, to $209.40 a month. This page lets someone type in their check and see what actually lands in their account, plain language first and the mechanics second.

Planned home: `socialsecurityraise.translatingpolicy.com` (not deployed).

Status: v1 from the nightly site idea of November 23, 2026. Figures checked against primary sources on November 23, 2026 (Eastern), and rechecked on November 24, 2026 against the SSA 2027 COLA release, blog and fact sheet and the CMS 2027 and 2026 Part B fact sheets. Every rate, deductible and income tier matched.

## What is on the page

- Two hero tiles: +3.6% raise (SSA) and +$6.50 Part B (CMS).
- Calculator: monthly benefit before deductions; whether Part B is taken from the check, not, or paid by the state; optional income entry for the higher-income tiers (2024 return sets 2026, 2025 return sets 2027; single or joint).
- Result: change in the monthly deposit, a D3 waterfall (December deposit, raise, Medicare change, January deposit), and plain facts including the hold-harmless protection and the deductible rising $283 to $292.
- A D3 line chart: share of the raise the flat $6.50 increase takes, by check size, with "your check" marked.
- How it works, what is not covered, and sources.

## Real data vs not

Every figure is real and from a primary federal source. Nothing is sample data. The calculator output is an estimate (within about $1) because SSA applies the COLA to the primary insurance amount, which most people do not know, then rounds down.

| Data | Source |
|---|---|
| 3.6% COLA, start dates, about $75 average retiree raise ($2,095 to $2,170) | SSA press release, blog and 2027 COLA fact sheet, Oct 14, 2026 |
| 2027 premium $209.40, deductible $292, income tiers | CMS 2027 fact sheet (Nov 17, 2026); CMS-8094-N, Federal Register, Nov 19, 2026 |
| 2026 premium $202.90, deductible $283, income tiers | CMS 2026 fact sheet |
| Two-year income lookback | SSA POMS HI 01101.031 |

Full list, rates, tier tables and methodology: `data/social-security-raise_sources.xlsx` and `data/sources.csv`. Rebuild with `python3 data/build_xlsx.py` (needs `openpyxl`).

## How to run

```bash
cd sites/social-security-raise
npm install
npm test         # calculator tests (rounding, hold harmless, tiers)
npm run dev
npm run build    # runs scripts/check-data.mjs, then vite build to dist/
npm run preview
```

## Deploy as a subdomain (only on Derek's go-ahead)

1. In Vercel, create a project from this repo with Root Directory `sites/social-security-raise`. `vercel.json` sets the Vite build and `dist` output.
2. Add the domain `socialsecurityraise.translatingpolicy.com` to that project.
3. At GoDaddy, add a CNAME for `socialsecurityraise` pointing to the value Vercel shows.
4. To list it on the hub: add an entry to `src/data/projects.json`, an accent in `src/lib/projects.ts`, and styles (accent `#c6ff3d`).

## Design

Hub look (ATTRACTOR dark: void blue, cyan glow, Chakra Petch / Inter / JetBrains Mono, scanlines), tokens copied unchanged from `src/styles/tokens.css`. One new accent: lime `#c6ff3d`. Decreases use the hub's red. Plain CSS like the other `sites/` projects, not Tailwind, to match the existing pages.

## Not covered yet

Medicare Advantage plans that pay back part of the premium, Part D premiums, tax withholding, married filing separately (has its own tiers), late enrollment penalties, SSI-only recipients (no Part B deduction logic needed, but no SSI payment standard shown).
