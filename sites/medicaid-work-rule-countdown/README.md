# Medicaid Work Rule Countdown (v1)

A plain-language page for translatingpolicy.com that answers two questions about the new Medicaid work rule:

1. Does it apply to me?
2. Is my state cutting coverage on January 1, 2027, or waiting until July?

It has a countdown to the key dates, a private "Does this apply to me?" checker, a state tile map of each state's public position on the CMS grace period (the "hold harmless" option), a sourced timeline, a mechanics section for caseworkers and reporters, and a full source list.

Design: the translating.policy hub look (ATTRACTOR dark style, dark only): void background, cyan glow, faint scanlines, Chakra Petch / Inter / JetBrains Mono. Tokens are copied from the hub's `src/styles/tokens.css` into `src/index.css`. This page's project accent is magenta `--c-medicaid: #ff4fd8`. Respects `prefers-reduced-motion`; hover effects only on pointer devices.

Proposed subdomain: `medicaid.translatingpolicy.com` (see "Deploy" below). Status: v1 draft, not deployed.

## What is real and what is not

Everything shown is from a public source, checked Nov 22, 2026. Nothing is estimated.

- **Rule details** (who is covered, 80 hours, $580 a month, exemptions, hardship exceptions, 30 day notice, look-back): CMS fact sheet for CMS-2454-IFC, the Federal Register rule (FR Doc. 2026-11094), and CRS report R48755.
- **Which states must run it**: 43 states and DC (CMS). That is the 41 expansion jurisdictions plus waiver groups in Georgia, Tennessee and Wisconsin (KFF). The other 7 states are not covered.
- **Grace period dates**: CMS letter SMD 26-006 (Nov 13, 2026). Grace period runs through June 30, 2027. CMS asked states to say by Dec 11, 2026.
- **State positions**: only four states have public statements so far: New York (using it), Nebraska (not using it), Virginia (leaning yes, not formal), West Virginia (undecided). Every other covered state shows "No public decision yet". CMS has not said it will publish a list.
- **Early starts**: Nebraska (live since May 1, 2026). Montana, Iowa and Arkansas show planned dates from a June 2026 summary.
- **Not in v1**: state enrollment counts for the adult group. The federal data hosts (data.medicaid.gov, catalog.data.gov) could not be reached from the build environment. The page says so in "What we do not know yet".

## Data files

The JSON files in `src/data/` are the single source of truth:

- `states.json`: one row per state and DC: coverage, grace period position, early start, note, source IDs, date checked, and tile map position.
- `timeline.json`: dated milestones with source IDs.
- `sources.json`: every source with URL, publisher, date, type and what it supports.

The companion workbook `public/medicaid-work-rule-countdown_sources.xlsx` (raw data, sources with URLs, checker rules, methodology, and corrections to the mini-PRD) is built from these files:

```
npm run xlsx
```

Rerun it after any edit to `src/data/*.json`. It needs Python 3 with `openpyxl`.

## Run it

Needs Node 22 or newer.

```
cd sites/medicaid-work-rule-countdown
npm install
npm run dev      # local dev server
npm test         # checker logic and data checks (node:test)
npm run build    # production build to dist/
npm run preview  # serve the build
```

The build may print a warning about `astro/tsconfigs/strict`. That comes from the hub site's root `tsconfig.json` when the root's packages are not installed. It does not affect this build.

## Deploy as a subdomain (not done; needs Derek's okay)

This folder is a standalone Vite app, separate from the Astro hub at the repo root.

1. In Vercel, create a new project from this repo and set **Root Directory** to `sites/medicaid-work-rule-countdown`.
2. Framework preset: Vite. Build command `npm run build`. Output directory `dist`. Node 22.
3. Add the domain `medicaid.translatingpolicy.com` to that project and add the DNS record Vercel shows.
4. Optional: in the hub project, set an Ignored Build Step so changes under `sites/` do not rebuild the hub.

## Refresh plan

- Through Dec 11, 2026: recheck state positions weekly (governor and state Medicaid agency announcements, plus the Medicaid.gov community engagement page).
- After Dec 11: monthly, and whenever a court rules in Massachusetts v. Oz (appeal) or the Nov 5 Oregon case.
- Next version: add state adult group enrollment from data.medicaid.gov, plus a "Medicaid watch" trend once enforcement begins.

## Privacy

The checker runs entirely in the browser. No answers are stored, logged or sent. There are no analytics or third-party scripts.
