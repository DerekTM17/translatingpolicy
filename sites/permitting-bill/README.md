# The Permitting Bill (BAAJA)

What the Senate-passed permitting overhaul would change for power lines, pipelines, mines and electric bills, where it stands, and how senators voted. Plain language first, mechanics second, and a source behind every number.

Planned home: `permittingbill.translatingpolicy.com` (not deployed yet; name open for Derek's call).

Status: v1, built November 23 to 24, 2026 at Derek's request, the same way as the nightly site-idea pages. Data last verified November 24, 2026.

## What is on the page

- Two tiles: the Senate vote (62 to 33, roll call 270) and the next step (House vote, no date set).
- Seven "what it would change for you" cards: agency decision deadlines, the 150-day lawsuit window, remand without vacatur, bad-faith suits by developers, the transmission backstop, data center ratepayer protection, and historic preservation and tribal consultation. Each card has a topic filter, the section number, a sourcing label, and a "How it works" drawer with sources.
- A status stepper from the original House bill to the President.
- A D3 chart and table of all seven Senate roll calls. Yea is filled and nay is outlined, so it reads without color. The final vote's party split is in the text.
- Supporters and opponents, three each, attributed.
- "Easy to get wrong" quick facts.
- Method, links to the bill, and a download of the companion spreadsheet.

## How firmly each fact is sourced

| Data | Status |
|---|---|
| All Senate vote counts and dates | senate.gov roll call records |
| Final passage party split | Counted from the senate.gov vote 270 name lists |
| House status | Two trackers updated Nov 23; congress.gov refuses automated reads |
| What the bill does | CRS R49506 (introduced text) plus a tracker quoting the Senate-passed text with Record pages. We could not read the passed text ourselves, so every card carries a label: "CRS and passed text agree", "CRS only", "tracker only" or "reported" |

Nothing is estimated. No power bill, jobs or deficit figures are shown, because no official estimate for the passed version was found.

## How to run

```bash
cd sites/permitting-bill
npm install
npm test         # data rules and vote math
npm run dev      # local dev server
npm run build    # checks the data, then builds to dist/
```

`npm run build` first runs `scripts/check-data.mjs`, which fails if a roll call does not add to 100, a party split does not match its totals, any change, number, step or claim lacks an https source, supporters and opponents are unequal in number, or the data has an em or en dash.

Rebuild the spreadsheet with `python3 data/build_xlsx.py` (needs `openpyxl`). It writes `data/permitting-bill_sources.xlsx` and copies it to `public/` for the download link.

## Design

Hub look (`docs/superpowers/specs/2026-10-25-translatingpolicy-hub-design.md`, "Look"): void background, scanlines, cursor glow on pointer devices, Chakra Petch, Inter and JetBrains Mono. `src/styles/tokens.css` is copied from the Funding Cliff page (same as the hub's tokens) so this folder builds on its own. The one new color is the project accent `--c-permit` (volt yellow, `#f2e94e`), kept clear of the hub's cyan, green, orange, amber and red and of the violet and magenta pages. Hover only on pointer devices; reduced motion turns off the pulse and blink.

## How to update

All content is in `src/data/bill.json`. When the House acts:

1. Mark the House step `done`, give it a date and a source, and update `statusNote` and `lastVerified`.
2. Add any House roll call to `votes` only if you also show House votes (v2).
3. If the House changes the text, re-check every card's mechanics.
4. Run `npm run build` and `python3 data/build_xlsx.py`.

## How to deploy as a subdomain (not done)

1. In Vercel, add a new project from the `translatingpolicy` repo with Root Directory `sites/permitting-bill` (Vite preset, also in `vercel.json`).
2. Check a preview deploy.
3. Add the chosen subdomain in the project's Domains settings and the CNAME in GoDaddy (Derek enters DNS).
4. Add a row to the hub's `src/data/projects.json` and a new accent in `src/lib/projects.ts` and the styles.

## Next steps (v2)

- Read the Senate-passed text for Secs. 1401, 1402, 2101, 2107 and Title III and upgrade the labels.
- How your senators voted: a state picker over the roll call 270 name list.
- House roll call once it happens.
- A CBO estimate for the substitute if one is published.
