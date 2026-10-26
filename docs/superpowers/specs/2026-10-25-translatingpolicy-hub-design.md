# translatingpolicy.com hub site: design

Date: 2026-10-25 · Owner: Derek Miller · Status: draft for approval

## Intent

translatingpolicy.com becomes the front door for Derek's public policy tools. Its mission:
**take dense government material (bills, budgets, legislative records) and make it readable
for ordinary people.** The audience is anyone interested in policy, politics and government.

It is **separate from Derek's personal portfolio site** (a different, paused project). The
portfolio will link here later; this site is not a résumé.

## Goals

1. One home page that states the mission and sends visitors to each tool.
2. Every tool lives on a `translatingpolicy.com` subdomain.
3. Every tool links back to the home page, so the family of sites feels like one place.
4. Easy to add a new project later: adding one is a new row, nothing more.

## Non-goals (for now)

- Per-project detail pages. The home-page row is enough.
- LinkHub. It comes off the domain; Derek will revisit it later.
- Virginia Development Tracker. Not listed until it exists.
- Newsletter, analytics, search, or any server-side features.
- Moving DNS to Cloudflare. DNS stays on GoDaddy (switching later stays easy; see DNS).

## Anti-goals (a failure even if it works)

- Reads like a generic tech landing page instead of Attractor's world.
- Jargon or dense prose. Derek's plain-language standard applies (8th-grade target, as on ATTRACTOR).
- Breaking any existing tool or its current `*.up.railway.app` / Vercel / GitHub Pages URL.

## Addresses

| Address | What | Host |
|---|---|---|
| `translatingpolicy.com` | this hub site | Vercel |
| `www.translatingpolicy.com` | same hub site (Vercel redirects to the bare domain or serves it; builder's call) | Vercel |
| `uscongress.translatingpolicy.com` | Congressional Dashboard | Railway (custom domain already created) |
| `statehouses.translatingpolicy.com` | State Legislature Dashboard | Railway (custom domain already created) |
| `attractor.translatingpolicy.com` | ATTRACTOR | Vercel (domain not yet added) |
| `inflation.translatingpolicy.com` | Inflation Reality | GitHub Pages (subdomain name is Claude's call) |

## The home page (approved from the clickable mockup, option C)

Mockup: https://claude.ai/artifact/HBDF9mDHBw7EYUnqJHyJf7 (option C is the approved one;
A and B were rejected alternatives). A copy of the mockup HTML (`2026-10-25-translatingpolicy-hub-mockup.html`) gets committed next to this spec when the new repo is created.

Top to bottom:

1. **Menu bar** (sticky): `Translating/Policy` wordmark; links Projects · Mission · About
   (anchor links into the one page). On narrow phones "Mission" may hide.
2. **Mission hero:** headline "Government, in plain English." plus a one-paragraph lede, and
   a **before-and-after pair**: real statutory text on the left, its plain-English meaning on
   the right. The mockup's example is invented; the real site must use a **real** bill excerpt
   with its real meaning, ideally taken from a Congressional Dashboard summary, with a link to the source.
3. **Projects, layout C ("list + wave"):** one full-width row per project. Each row has:
   subdomain code (e.g. `uscongress.`), a "Live" status light, title, one-sentence description,
   a stat line (e.g. "13 of 50 states, more coming"), and "OPEN →". Each project has its own
   accent color (Congress cyan, Statehouse green, ATTRACTOR orange, Inflation amber).
   Hover: a light band sweeps left to right **once** per hover (≈0.9s, approved as is), a left
   accent bar slides in, the title glows in its accent, and a soft spotlight follows the mouse.
   Projects come from one data file, so adding a project is adding one entry.
4. **Who's behind this:** Derek's name, a one-line title, a short bio paragraph, and three
   principles: Plain language · Show the source · Show the cost. **Derek supplies the title and
   bio**; until then the build uses clearly marked placeholders, and the site does not go live
   with placeholders showing.
5. **Footer:** copyright line and the menu links.

**Look:** ATTRACTOR's dark hub style. Void-blue background, cursor-following glow, faint
scanlines, pulsing headline glow; fonts Chakra Petch (display), Inter (body), JetBrains Mono
(labels). Reuse ATTRACTOR's `tokens.css` values directly rather than re-inventing them.
Respect `prefers-reduced-motion` (no wave, pulse or glow animation). Must work at phone width;
touch devices get no hover effects, just the resting design.

Stat lines should be accurate at launch. They may be hand-written in the data file (builder's
call); live counts are not required.

## Back-links in each tool (small tweaks in four other repos)

Each tool gets a small, unobtrusive link back to `https://translatingpolicy.com`, e.g.
"← Translating Policy" in its header or footer. Exact wording, placement and styling are the
builder's call per app, matching each app's own style (Claude's call). These ship **only at
go-live**, once the home page is actually serving at translatingpolicy.com, so no link points at
nothing.

**Canonical address moves too (Claude's call).** In the same go-live change, each tool's own
"official" address (link previews, sitemap, search results) switches to its new subdomain:
ATTRACTOR's `site:` in `astro.config.mjs` (now `attractor-xi.vercel.app`); the Congressional
Dashboard's `og:url` / `og:image` / `twitter:image` in `frontend/index.html` and the
`siteMeta.test.js` checks on them; and the same kind of tags in the other two if present. So
each repo's go-live change is "back-link + address switch + test updates", not a one-line link.
Both dashboards already have `AppHeader.jsx` (the state one also `SiteFooter.jsx`) for the link.
Both dashboards serve their data from the page's own address, so no CORS changes are needed.

Per-repo deploy rules that the plan must respect:
- **congressional-dashboard:** change goes through its own branch + PR. Derek runs the merge
  command (`gh pr merge` is blocked for Claude).
- **state-legislature-dashboard:** pushing to main deploys to production; Derek runs the push.
- **attractor:** pushing to main deploys to Vercel.
- **inflation-reality:** an unmerged redesign branch (`redesign/phase2b`) exists. Put the
  back-link and domain change on main without disturbing that branch, and tell Derek it will need
  the same change when it merges.

## Inflation Reality moves to a subdomain

It is on GitHub Pages at `derektm17.github.io/inflation-reality/` today, and its
`vite.config.js` sets `base: "/inflation-reality/"`. On a custom domain the site lives at the
root, so the move needs: the base path changed to `/`, a `CNAME` file containing
`inflation.translatingpolicy.com`, and the custom domain set in the repo's Pages settings
(with "Enforce HTTPS" once the certificate is issued). The old github.io URL then redirects automatically.

## DNS (GoDaddy, stays there)

Derek enters records in GoDaddy; Claude hands him exact values. Already given to Derek on
2026-10-20 (4 records): `congress` and `statehouse` CNAMEs plus their two `_railway-verify` TXTs.
**As of 2026-10-25 those 4 are not in DNS yet; Derek plans to enter them 2026-10-26.** Still to come:
- bare domain: Vercel's A record for the apex (Vercel supplies the value)
- `www`: CNAME to Vercel
- `attractor`: CNAME to Vercel
- `inflation`: CNAME to `derektm17.github.io`

Do **not** use GoDaddy forwarding. It was considered before the hub site existed and is no longer needed.

The old `www` → LinkHub record values given earlier must **not** be entered. On Railway, the two
LinkHub custom domains (`translatingpolicy.com`, `www.translatingpolicy.com`) should be removed
so they stop showing as unverified (ask Derek before deleting).

Switching to Cloudflare later only means moving these same records; nothing here blocks it.

## Who does what

- **Derek:** enters every GoDaddy record; runs merges/pushes the per-repo rules reserve for him;
  approves deleting the LinkHub Railway domains.
- **Claude:** everything else it has access to. Adding domains in Vercel (hub + `attractor`)
  and setting the Pages custom domain go through the Vercel and `gh` CLIs if they're logged
  in; otherwise Claude hands Derek the exact clicks. Claude confirms each record has
  verified before moving on.

## Constraints

- Stack: **Astro on Vercel**, new public GitHub repo (name is the builder's call, e.g.
  `translatingpolicy`). Mostly static, no client framework needed beyond small vanilla scripts
  for the cursor and spotlight effects.
- Plain-language standard on all copy.
- Old URLs for every tool keep working.
- Ledger: record shipped work with `ledger ship` per Derek's workflow.

## Left to the builder

Repo name and structure; how the project list is stored; exact copy beyond what's above (plain
language, Derek reviews); `www` behavior; back-link wording and placement per app; build order,
as long as back-links ship last.
