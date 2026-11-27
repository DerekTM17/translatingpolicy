# Tariff Refund Tracker

Proposed subdomain: `tariffrefunds.translatingpolicy.com`

The Supreme Court struck down the emergency (IEEPA) tariffs in *Learning Resources v. Trump* (2026). Importers of record are getting roughly $166 billion back through CBP's CAPE refund portal. Shoppers who paid higher prices have no refund route. This page shows where the money stands, what an even household share of the tariff bill could have been under a pass-through share the reader chooses, what is still in place, and the next court date (DOJ's Dec 9, 2026 response in *Freestyle World v. United States*).

Nightly v1, built 2026-11-26. Hub look (`src/styles/tokens.css` copied unchanged from the repo root) plus one new accent, `--c-refund`.

## Data sources

All figures live in `src/data/refunds.json`, each with a source id. Full list in `data/sources.csv` and `data/tariff-refund-tracker_sources.xlsx` (raw data, timeline, sources, methodology).

- Forbes, Nov 20, 2026 (cites the CIT class certification order, CBP CAPE data through Oct 2, ProPublica's refund database)
- Fortune, Nov 12, 2026 (cites CIT orders, the government's appeal, Treasury Monthly Statement)
- C.H. Robinson advisory, Sep 17, 2026 (relays CBP's declaration to the CIT)
- Rep. Joaquin Castro fact sheet (CAPE process, coverage)
- Cornell LII entry for *Learning Resources v. Trump*, 607 U.S. 229 (2026)
- FRED TTLHH (Census Bureau households)

Most refund figures are secondary. Before launch, replace them with the primary CBP declarations, CIT orders and the Treasury Monthly Statement customs line (fiscaldata.treasury.gov was unreachable from the build environment). Update cadence: after each CBP filing to the CIT and after Dec 9.

## Run

```
npm install
npm test          # node tests for the math and data integrity
npm run dev
npm run build     # runs scripts/check-data.mjs, then vite build
```

Rebuild the workbook after editing the JSON: `python3 data/build_xlsx.py`.

## Deploy as a subdomain

1. New Vercel project from this repo, root directory `sites/tariff-refund-tracker` (vercel.json sets the Vite build).
2. Add the domain `tariffrefunds.translatingpolicy.com` in Vercel and a CNAME at the DNS host.
3. Add an entry to the hub's `src/data/projects.json` plus an accent in `src/lib/projects.ts`.

Nothing here deploys or changes DNS by itself.
