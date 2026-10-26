# translatingpolicy.com Hub Site Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build and launch the translatingpolicy.com hub site, move every tool onto a translatingpolicy.com subdomain, and add a link home from each tool.

**Architecture:** A new static Astro site (`~/projects/translatingpolicy`) on Vercel, styled from ATTRACTOR's tokens. One page, with projects rendered from a single data file. DNS stays on GoDaddy: Derek enters records, Claude supplies the values. Back-links and canonical-address changes in the four existing repos ship last, only once the hub and each subdomain serve over HTTPS.

**Tech Stack:** Astro 5, vanilla JS (no client framework), Vitest, Python reading-level gate copied from ATTRACTOR, Vercel, GitHub Pages (Inflation Reality), Railway (dashboards).

**Spec:** `docs/superpowers/specs/2026-10-25-translatingpolicy-hub-design.md` (currently in `~/drafts/translatingpolicy-hub/`, moved into the repo in Task 1). Approved mockup: `docs/superpowers/specs/2026-10-25-translatingpolicy-hub-mockup.html`, option C. The executor reads the spec and mockup before starting.

## Global Constraints

- Stack: **Astro on Vercel**, new **public** GitHub repo `DerekTM17/translatingpolicy`.
- Look: ATTRACTOR dark hub style. Fonts: Chakra Petch (display), Inter (body), JetBrains Mono (labels). Reuse values from `~/projects/attractor/src/styles/tokens.css`.
- Project accents: Congress `#00b4ff`, Statehouse `#00e88c`, ATTRACTOR `#ff6a00`, Inflation `#ffb830`.
- Wave: sweeps left to right **once** per hover, ~0.9s (copy the mockup's `@keyframes wave` and `.rowc::after`).
- `prefers-reduced-motion`: no wave, pulse, or glow animation. Touch devices (`(hover: none)`): resting design only.
- Plain-language standard: reading-level gate (FK ≤ 9.0) runs in `npm test`.
- The site never goes live with placeholder bio text showing.
- Old URLs for every tool keep working throughout.
- Per-repo deploy rules: congressional-dashboard = own branch + PR, Derek runs `gh pr merge`; state-legislature-dashboard = Derek runs the push to main (it deploys); attractor = push to main deploys; inflation-reality = leave branch `redesign/phase2b` untouched.
- Derek enters every GoDaddy record and approves any Railway domain deletion.
- Use `set -o pipefail` whenever piping test output (ATTRACTOR lesson: `vitest | grep` hides failures).
- Record shipped work with `ledger ship <project> "…" --why "…"` (run `ledger rules` first).

## Review Focus

1. **A project link points at a subdomain that isn't serving HTTPS yet** (the congress/statehouse certificates are blocked as of 10-26). Expect: launch is gated by `npm run check-links`, which fails on any non-200 → Task 2 test + Task 5 gate.
2. **Touch / phone visitors**: no hover state sticks after a tap, and there's no horizontal scroll at 375px → Task 3 test + Task 4 phone check.
3. **Keyboard users**: every project row is reachable by Tab and shows the same highlight on `:focus-visible` as on hover → Task 3 test.
4. **Placeholder text leaks to production**: the production build fails while any `[DEREK:` marker remains → Task 4 test.
5. **Inflation Reality's old URL breaks between deploys** (base path changed before the custom domain works; scheduled deploys on the 13th and 16th) → Task 6 ordering + test.

---

## Phase A: the hub site

### Task 1: Scaffold the repo with ATTRACTOR's look

**Files:**
- Create: `~/projects/translatingpolicy/` (Astro minimal template), `package.json`, `astro.config.mjs`, `src/styles/tokens.css`, `src/styles/global.css`, `src/layouts/BaseLayout.astro`, `src/pages/index.astro` (shell only), `scripts/reading-level.py`, `tests/layout.test.ts`, `.gitignore` (include `.superpowers/`, `dist/`, `node_modules/`)
- Move in: spec + mockup → `docs/superpowers/specs/`, this plan → `docs/superpowers/plans/`

**Interfaces:**
- Produces: `BaseLayout.astro` props `{ title: string; description: string }`, which renders `<head>` (Google Fonts link identical to ATTRACTOR's `BaseLayout.astro`, OG tags, canonical `https://translatingpolicy.com/`) plus a `<slot/>`. `astro.config.mjs` sets `site: 'https://translatingpolicy.com'`. CSS tokens use the names from the mockup's `:root` (`--void`, `--glow`, `--glow-rgb`, `--ink`, `--ink-dim`, `--line`, `--accent`, `--c-*`, `--f-display`, `--f-body`, `--f-mono`).
- `npm test` = `python3 scripts/reading-level.py && vitest run`. `npm run build` = `astro build`.

- [ ] **Step 1:** `npm create astro@latest translatingpolicy -- --template minimal --no-install --no-git` in `~/projects`, then `npm install` and `npm i -D vitest`. `git init`, then move the spec, mockup and plan in.
- [ ] **Step 2: Write the failing test** `tests/layout.test.ts`: build first (`execSync('npx astro build')` in `beforeAll`), then read `dist/index.html` and assert:
  - `<title>` contains `Translating Policy`
  - the HTML includes `family=Chakra+Petch` and `<link rel="canonical" href="https://translatingpolicy.com/"`
  - `og:url` is `https://translatingpolicy.com/`
- [ ] **Step 3:** Run `npx vitest run`. Expected: FAIL.
- [ ] **Step 4:** Implement the BaseLayout and tokens. Copy `scripts/reading-level.py` from ATTRACTOR, adapted to scan `src/data/*.json` text fields and the `.astro` copy blocks this repo adds (keep its FK ≤ 9.0 cap; never loosen it).
- [ ] **Step 5:** Run `npm test`. Expected: PASS.
- [ ] **Step 6:** Commit: `feat: scaffold translatingpolicy hub with ATTRACTOR tokens`.

### Task 2: Project data + link checker

**Files:**
- Create: `src/data/projects.json`, `src/lib/projects.ts`, `scripts/check-links.mjs`, `tests/projects.test.ts`
- Modify: `package.json` (add script `"check-links": "node scripts/check-links.mjs"`)

**Interfaces:**
- Produces: `type Project = { id: string; title: string; host: string /* shown code, e.g. "congress." */; url: string; status: 'Live'; statusNote?: string; description: string; stat: string; accent: 'congress'|'state'|'attractor'|'inflation' }` and `getProjects(): Project[]` (validated, file order).
- Data (copy from the mockup's option C rows, and check each stat against the live tool when writing it):
  - congress: `https://uscongress.translatingpolicy.com`, stat "Bills · votes · CBO costs", statusNote "nightly"
  - statehouse: `https://statehouses.translatingpolicy.com`, stat "13 of 50 states, more coming"
  - attractor: `https://attractor.translatingpolicy.com`, stat "38 proposals · 8 policy areas"
  - inflation: `https://inflation.translatingpolicy.com`, stat "Official CPI data"

- [ ] **Step 1: Write failing tests** in `tests/projects.test.ts`:
  - `getProjects()` returns 4 projects, ids in order `congress, statehouse, attractor, inflation`
  - every `url` matches `/^https:\/\/[a-z]+\.translatingpolicy\.com\/?$/`
  - every `accent` is in the allowed set
  - an entry missing `description` throws (pass a fixture to the validator)
- [ ] **Step 2:** Run `npx vitest run tests/projects.test.ts`. Expected: FAIL.
- [ ] **Step 3:** Implement `src/lib/projects.ts` (plain TS validation, no new dependency).
- [ ] **Step 4:** Implement `scripts/check-links.mjs`: for each project URL plus `https://translatingpolicy.com/`, `fetch` with a 15s timeout, print `OK <url>` or `FAIL <url> <status|error>`, and exit 1 if any fail. TLS errors count as FAIL.
- [ ] **Step 5:** Run `npm test`. Expected: PASS. Run `npm run check-links`. Expected right now: FAIL lines (subdomains not live yet). That's correct; record the output in the commit message body.
- [ ] **Step 6:** Commit: `feat: project data and pre-launch link checker`.

### Task 3: Home page (menu, hero, project rows, about, footer, effects)

**Files:**
- Create: `src/components/SiteNav.astro`, `Hero.astro`, `ProjectRow.astro`, `About.astro`, `SiteFooter.astro`, `src/scripts/effects.ts`, `src/data/hero.json`, `src/data/about.json`, `tests/home.test.ts`
- Modify: `src/pages/index.astro`

**Interfaces:**
- Consumes: `getProjects()` (Task 2), `BaseLayout` (Task 1).
- `ProjectRow.astro` props: `{ project: Project }`. Renders `<a class="rowc" data-p={accent} href={url}>` with structure and classes matching the mockup's option C, including a `<span class="spot">`.
- `hero.json`: `{ headline: "Government, in plain English.", lede: string, before: { text: string; sourceLabel: string; sourceUrl: string }, after: string }`.
- `about.json`: `{ name: "Derek Miller", title: string, bio: string, principles: [{ name, text }] ×3 }`. `title` and `bio` start as `"[DEREK: one-line title]"` / `"[DEREK: bio paragraph]"`. Principles copy comes from the mockup verbatim.
- `effects.ts`: `initEffects(): void`. Sets `--mx/--my` on `body` and `--px/--py` per `.rowc`. Does nothing when `matchMedia('(hover: none)')` or `(prefers-reduced-motion: reduce)` matches.

- [ ] **Step 1: Pick the real before/after example.** Choose one bill that has a `plain_summary` from the live API, `GET https://congressional-dashboard-production.up.railway.app/api/bills/{bill_id}` (production, never the local DB). Then quote ≤ 40 words of that bill's actual text from congress.gov as `before.text`, with `sourceUrl` pointing to the congress.gov text page. `after` is one plain sentence true to the summary. Put both in `hero.json`. Derek reviews this copy in Task 4.
- [ ] **Step 2: Write failing tests** `tests/home.test.ts` (against the built `dist/index.html`):
  - nav has links `#projects`, `#mission`, `#about`
  - exactly 4 `a.rowc` elements, `href`s equal the project URLs in order, each with `data-p`
  - `h1` text is `Government, in plain English.`
  - the before/after block contains a link to `hero.before.sourceUrl`
  - the about section shows 3 principles
  - CSS contains `@media (prefers-reduced-motion: reduce)` and `@media (hover: none)`. The `.rowc:hover` rules sit inside `@media (hover: hover)`, so taps don't stick.
  - `.rowc:focus-visible` gets the same treatment as `:hover`: the selector appears in the same rule as `.rowc:hover`.
- [ ] **Step 3:** Run `npx vitest run tests/home.test.ts`. Expected: FAIL.
- [ ] **Step 4:** Implement the components by porting the mockup's option C CSS and markup. Drop the A/B layouts, the switcher, and their CSS. Wrap the hover-only rules in `@media (hover: hover)`. Load `effects.ts` with a plain `<script>` in `index.astro`.
- [ ] **Step 5:** Run `npm test`. Expected: PASS, reading-level gate included.
- [ ] **Step 6:** `npm run build`, serve `dist/` with `python3 -m http.server` (detached per AGENTS.md), and check by eye in the browser at 1280px and 375px: wave plays once per hover, no horizontal scroll at 375px, Tab moves through the rows with visible highlight. Screenshot both widths.
- [ ] **Step 7:** Commit: `feat: hub home page, layout C with light wave`.

### Task 4: Placeholder guard, GitHub repo, Vercel preview

**Files:**
- Create: `scripts/check-placeholders.mjs`, `tests/placeholders.test.ts`, `README.md` (short: what it is, `npm test`, `npm run check-links`)
- Modify: `package.json` (`"build": "node scripts/check-placeholders.mjs && astro build"`)

**Interfaces:**
- `check-placeholders.mjs`: scans `src/` for `[DEREK:` and exits 1 when `VERCEL_ENV === 'production'` or `--strict` is passed; otherwise it only warns. Previews still build with placeholders.

- [ ] **Step 1: Write failing tests**: running the script with `--strict` against a temp dir containing `[DEREK: x]` exits 1; without it, exits 0 and prints a warning; strict mode on a clean dir exits 0.
- [ ] **Step 2:** Run. Expected: FAIL. **Step 3:** Implement. **Step 4:** `npm test`. Expected: PASS.
- [ ] **Step 5:** Commit: `feat: block production builds that still have placeholders`.
- [ ] **Step 6:** `gh repo create DerekTM17/translatingpolicy --public --source . --push`.
- [ ] **Step 7: Vercel project.** The Vercel CLI isn't installed and the Vercel connector isn't signed in. Ask Derek to run `! npx vercel login`, then `npx vercel link` (new project `translatingpolicy`, connected to the GitHub repo) and `npx vercel` for a preview deploy. If he'd rather click: vercel.com → Add New → Project → import `DerekTM17/translatingpolicy` → Deploy.
- [ ] **Step 8:** Send Derek the preview URL. Ask him to (a) check it on his phone, (b) review the hero before/after copy, and (c) send his one-line title and bio. Put his text into `about.json`, then run `npm test` and `node scripts/check-placeholders.mjs --strict` (expected exit 0). Commit: `content: Derek's bio and title`. Push.

## Phase B: domains (one sitting each, in this order)

### Task 5: Hub + ATTRACTOR domains on Vercel

- [ ] **Step 1:** In Vercel (CLI, `npx vercel domains add`, or Derek clicking), add `translatingpolicy.com` and `www.translatingpolicy.com` to the `translatingpolicy` project (www redirects to the bare domain), and `attractor.translatingpolicy.com` to the existing ATTRACTOR project. Old `attractor-xi.vercel.app` stays.
- [ ] **Step 2:** Read the exact records Vercel asks for (A for `@`, CNAME for `www` and `attractor`). Hand Derek a Claude-in-Chrome prompt in the same format as the 10-26 one: add only these 3 records; **first delete the existing GoDaddy `@` parking A record(s) and the `www` CNAME → `@`** (name them exactly, after checking their current values via `dns.google`); no forwarding; touch nothing else; confirm before saving.
- [ ] **Step 3:** Verify with `curl -s "https://dns.google/resolve?name=<host>&type=A|CNAME"` and then `curl -sI https://<host>/` for all three hosts. Expected: 200 (or 308 for www → apex).
- [ ] **Step 4:** Ask Derek before removing the two LinkHub custom domains on Railway (`cf7b180c-…`, `f532e002-…`, IDs in memory). Delete only on his OK.

### Task 6: Inflation Reality onto `inflation.translatingpolicy.com`

**Files (in `~/projects/inflation-reality`, on `main`):**
- Modify: `vite.config.js` (`base: "/"`)
- Create: `public/CNAME` containing exactly `inflation.translatingpolicy.com`
- Test: `test/domain.test.js` (repo uses `node --test`)

**Do these in one sitting, in this order. The 13th/16th scheduled deploys must not land mid-switch.**

- [ ] **Step 1:** Hand Derek the GoDaddy record: CNAME `inflation` → `derektm17.github.io`. Wait until `dns.google` returns it.
- [ ] **Step 2: Write failing test** `test/domain.test.js`: reads `vite.config.js` and asserts it contains `base: "/"`; reads `public/CNAME` and asserts its trimmed content equals `inflation.translatingpolicy.com`.
- [ ] **Step 3:** `npm test`. Expected: FAIL. **Step 4:** Make the two changes. **Step 5:** `npm test && npm run build`. Expected: PASS; `dist/CNAME` exists.
- [ ] **Step 6:** Commit `feat: serve from inflation.translatingpolicy.com` and push main (deploy runs).
- [ ] **Step 7:** `gh api -X PUT repos/DerekTM17/inflation-reality/pages -f cname=inflation.translatingpolicy.com`. Once the cert issues, `gh api -X PUT repos/DerekTM17/inflation-reality/pages -F https_enforced=true`.
- [ ] **Step 8:** Verify `curl -sI https://inflation.translatingpolicy.com/` → 200, and that the old `derektm17.github.io/inflation-reality/` redirects. Tell Derek that saved answers reset for returning visitors (his decision), and that `redesign/phase2b` needs the same two changes when it merges. Note this in that branch's `docs/SESSIONS.md` handoff, without committing to the branch otherwise.

### Task 7: Launch gate

- [ ] **Step 1:** In the hub repo, `npm run check-links`. Expected: all `OK`. **Do not continue past this step while any line FAILs.** If congress/statehouse certificates are still blocked, stop here and report. Everything above stays live and harmless.
- [ ] **Step 2:** `npx vercel --prod` (or merge to main if Vercel deploys from Git). Then run `curl -s https://translatingpolicy.com/ | grep -c 'class="rowc'`. Expected: `4`.

## Phase C: back-links + canonical addresses (only after Task 7 passes)

Each tool gets a small "← Translating Policy" link to `https://translatingpolicy.com`, styled to match that app, plus its own canonical address switch. One task per repo.

### Task 8: Congressional Dashboard

**Files:** `frontend/src/components/AppHeader.jsx`, `frontend/index.html:15,16,23`, `frontend/src/test/siteMeta.test.js`, plus an AppHeader test next to existing component tests.

- [ ] **Step 1:** New branch `claude/translatingpolicy-backlink`.
- [ ] **Step 2: Failing tests:** `siteMeta.test.js` now expects `og:url` = `https://uscongress.translatingpolicy.com/` and both images = `https://uscongress.translatingpolicy.com/og-image.png`. The AppHeader test expects a link with `href="https://translatingpolicy.com"` and accessible name containing `Translating Policy`.
- [ ] **Step 3:** `cd frontend && npm test`. Expected: FAIL. **Step 4:** Implement. **Step 5:** `npm test`. Expected: PASS.
- [ ] **Step 6:** Commit, push the branch, `gh pr create`. Hand Derek `gh pr merge <n> --merge` (blocked for Claude). After the deploy, verify at `https://uscongress.translatingpolicy.com/`.

### Task 9: State Legislature Dashboard

**Files:** `frontend/src/components/SiteFooter.jsx` (link lives here; also in `AppHeader.jsx` if the header has a brand area. Match the Congress placement), plus a test beside existing component tests. There are no OG tags in `frontend/index.html`, so there's no canonical change.

- [ ] **Steps:** failing test for the link (same assertions as Task 8) → FAIL → implement → `cd frontend && npm test` PASS → commit on main locally → hand Derek `! git -C ~/projects/state-legislature-dashboard push` (push deploys). Verify on `https://statehouses.translatingpolicy.com/`.

### Task 10: ATTRACTOR

**Files:** `astro.config.mjs` (`site: 'https://attractor.translatingpolicy.com'`; update the comment above it), `src/components/SiteNav.astro` and the static footer in `BaseLayout`/`site-footer` (link), and any test that pins `attractor-xi.vercel.app` (grep `tests/` and `src/` first).

- [ ] **Steps:** failing tests (built HTML `og:url` starts with `https://attractor.translatingpolicy.com`; footer contains the back-link) → FAIL → implement → `npm test` (includes reading-level) PASS → `npm run build` → commit → push main (deploys) → verify live.

### Task 11: Inflation Reality back-link

**Files:** the app's footer/header markup in `index.html` or its main view (grep for the footer element first), plus a `node --test` case asserting the link exists in the built `dist/index.html`.

- [ ] **Steps:** failing test → FAIL → implement → `npm test && npm run build` PASS → commit → push main → verify live.

### Task 12: Wrap-up

- [ ] **Step 1:** Run `npm run check-links` in the hub one more time. Expected: all OK.
- [ ] **Step 2:** `ledger rules`, then `ledger ship translatingpolicy "…" --why "…"` and one `ledger ship` per tool repo changed, in plain language.
- [ ] **Step 3:** Update memory `project_translatingpolicy_domain.md`: live, what's left (LinkHub revisit, portfolio link later).
