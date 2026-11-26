# ACA Premium Check 2027 (v1)

A plain-language page for translatingpolicy.com that answers one question during 2027 open enrollment: **what would a marketplace health plan cost me in 2027, and am I near the subsidy cliff?**

Benchmark silver premiums rose about 13% for 2027 (KFF), the enhanced tax credits expired at the end of 2025, and households above 400% of the poverty line get no help at all. Starting with 2026 income, there is also no cap on paying back an overpaid credit at tax time.

Sections: a private household checker (state, income, ages, children), a D3 chart of the 400% cliff for that household, a "tax time catch" panel, a sortable state table of 2026 vs 2027 benchmark prices, a mechanics section with the IRS table, and a full source list.

Design: the translating.policy hub look (ATTRACTOR dark style): void background, cyan glow, scanlines, Chakra Petch / Inter / JetBrains Mono, tokens copied from the hub's `src/styles/tokens.css`. Project accent: lime `--c-aca: #c6ff3d`, clear of the other project colors.

Proposed subdomain: `acapremiums.translatingpolicy.com`. Status: v1 draft, not deployed.

## What is real and what is estimated

All inputs are public figures, checked Nov 24, 2026:

- **State benchmark premiums, 2026 and 2027, age 40**: KFF State Health Facts (analysis of HealthCare.gov and state rate data; 2027 updated Nov 6, 2026).
- **2027 applicable percentages and 10.22% required contribution**: IRS Rev. Proc. 2026-26.
- **2026 poverty guidelines** (used for 2027 credits): Federal Register FR Doc. 2026-00755.
- **Age curve**: CMS federal default standard age curve (2016 guidance). States with their own curves (AL, DC, MA, MN, MS, OR, UT) are flagged as approximate; NY and VT have no age rating (CMS Market Rating Reforms table).
- **Medicaid expansion status**: reused from this repo's Medicaid Work Rule Countdown data file (KFF).
- **Repayment cap removal, 13% benchmark increase, open enrollment dates**: KFF and healthinsurance.org.

The household result is an **estimate**: it scales a state average, so county prices differ. Not modeled in v1: cost sharing reductions, state top-up subsidies, employer coverage offers, immigration status limits, and children aged 15 to 20 (all priced at the 0-14 rate).

## Data files

`src/data/` is the single source of truth: `states.json` (benchmarks, expansion, age rating, poverty table region), `rules.json` (poverty lines, applicable % bands, age curve, deadlines), `sources.json`. The companion workbook `public/aca-premium-check_sources.xlsx` (raw data, sources, methodology) is built from them:

```
npm run xlsx
```

## Run it

Needs Node 22 or newer.

```
cd sites/aca-premium-check
npm install
npm run dev      # local dev server
npm test         # estimate logic and data checks (node:test)
npm run build    # production build to dist/
```

## Deploy as a subdomain (not done; needs Derek's okay)

1. In Vercel, create a new project from this repo with **Root Directory** `sites/aca-premium-check`.
2. Framework preset Vite, build `npm run build`, output `dist`, Node 22.
3. Add the domain `acapremiums.translatingpolicy.com` and the DNS record Vercel shows (GoDaddy CNAME).
4. To list it on the hub: add an entry to `src/data/projects.json` and an accent in `src/lib/projects.ts` and styles.

## Refresh plan

Weekly through Jan 15, 2027 (end of open enrollment in HealthCare.gov states), and whenever Congress acts on marketplace tax credits. Next version: county-level benchmarks from the CMS plan year 2027 landscape files, and state top-up subsidies.
