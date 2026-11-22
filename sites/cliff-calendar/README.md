# The Cliff Calendar

Two deadlines, three weeks. This page shows what stops on **December 11, 2026** and **December 31, 2026** if Congress misses them, in plain language first and the legal mechanics second. Every item links to the statute section and a Congressional Research Service report or bill text.

Planned home: `deadlines.translatingpolicy.com` (not deployed yet).

Status: v1, built from the nightly site idea of November 21, 2026. Data last verified November 21, 2026 (Eastern).

## What is on the page

- Two countdown tiles (calendar days, Eastern time) and a D3 timeline strip.
- 19 deadline cards: 12 on December 11 (the stopgap, P.L. 119-103) and 7 on December 31 (health and family programs set by P.L. 119-75 and earlier laws).
- Each card: what stops, who feels it, a sourced reach figure where one exists, and a "How it works" drawer with the statute, sources and last-checked date.
- Filters by date and by who is affected.
- A state picker. It shows 2024 health center patients for the states loaded so far and links every other state to its official HRSA page.
- A "Not on this calendar" list for items people often confuse with these deadlines (telehealth, hospital at home, ambulance add-ons, Medicaid DSH cuts, debt limit).

## Real data vs not yet loaded

| Data | Status |
|---|---|
| All 19 deadline dates and statute citations | Real, from CRS reports and bill text |
| NFIP: nearly 4.5 million policies, $30.425B to $1B borrowing, 2010 closings estimate | Real, CRS IN10835 |
| Health center patients, national 2024 (32,387,774) | Real, HRSA |
| Health center patients by state | Real for 5 states (AL, CA, HI, NY, OK). Others show "not loaded" with a link to the official page |
| TANF families (about 1 million, FY2024) and $16.4B grant | Real, CRS R48413 |
| CFTC whistleblower awards ($430M since 2014) | Real, CRS R49353 |
| NFIP policies by state | Not loaded. FEMA publishes them in an Excel file that the build environment could not download |
| Status chips | Set by hand ("Pending in Congress"). No automated check yet |

Nothing on the page is invented or estimated. Items without a sourced figure show none.

## Sources

Primary:
- CRS R49353, Overview of Continuing Appropriations for FY2027 (Division A of P.L. 119-103), Sept 17, 2026: https://www.everycrsreport.com/reports/R49353.html
- Senate text of the extension divisions (Divisions B to D), Aug 2, 2026: https://www.appropriations.senate.gov/imo/media/doc/extensions_divisions_authorizing_committees2.pdf
- H.R. 6500, Senate-passed text (govinfo): https://www.govinfo.gov/app/details/BILLS-119hr6500eas
- White House signing notice, Sept 2, 2026: https://www.whitehouse.gov/briefings-statements/2026/09/congressional-bill-h-r-6500/
- CRS IN10835, National Flood Insurance Program, Sept 11, 2026: https://www.everycrsreport.com/files/2026-09-11_IN10835_1177d2de1e2916fd50e80100ff618a10dbb6bb04.html
- CRS R49126, Expiring Health Provisions: CY2026 and CY2027, Aug 11, 2026: https://www.everycrsreport.com/files/2026-08-11_R49126_dbcd2fa217db25aee152d1965bb084ff0b692177.html
- CRS R48413, TANF Block Grant: A Primer, May 4, 2026: https://www.everycrsreport.com/files/2026-05-04_R48413_304caf380913f930b9369cb24ecce9ebb73927ca.html
- HRSA Uniform Data System, national and state pages: https://data.hrsa.gov/topics/healthcenters/uds/overview/national

Secondary (labeled on the page): Holland & Knight, Oct 9, 2026, for the telehealth and hospital-at-home end dates only.

The full list, every item, the state table and a fact-check of the original plan are in `data/cliff-calendar_sources.xlsx`. Rebuild it from the page data with `python3 data/build_xlsx.py` (needs `openpyxl`).

## How to run

```bash
cd sites/cliff-calendar
npm install
npm run dev      # local dev server
npm run build    # checks the data, then builds to dist/
npm run preview  # serves the built site
```

`npm run build` first runs `scripts/check-data.mjs`, which fails the build if any item lacks a date, text or an https source, or if the data contains an em dash or en dash.

## How to update

All content lives in `src/data/deadlines.json` (items, dates, sources, status note) and `src/data/states.json` (state counts). When Congress acts:

1. Change `statusNote` and `lastVerified`.
2. For an item that gets extended, change its `date` (add a new cliff entry if it is a new date) and its `mechanics` and `sources`.
3. Run `npm run build` and `python3 data/build_xlsx.py`.

## How to deploy as a subdomain (not done)

This folder is a standalone Vite app. To put it at `deadlines.translatingpolicy.com` on Vercel:

1. In Vercel, add a new project from the `translatingpolicy` repo.
2. Set Root Directory to `sites/cliff-calendar`. Framework preset: Vite (also set in `vercel.json`). Build command `npm run build`, output `dist`.
3. Deploy a preview and check it.
4. In the project's Domains settings, add `deadlines.translatingpolicy.com`, then add the CNAME record Vercel shows at the DNS host for translatingpolicy.com.

The hub site at the repo root (Astro) does not build or read this folder.

## Next steps (v2)

- Load NFIP policies in force for every state from FEMA's "Policy Information by State" file, and health center patients for every state from HRSA's data download.
- Poll Congress.gov daily for a new funding or extender law and flip the status chips.
- Share images per card for TikTok, Instagram and Threads.
- Add TANF families by state once the ACF caseload file is confirmed.
