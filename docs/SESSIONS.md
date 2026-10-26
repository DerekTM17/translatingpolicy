# Sessions — translatingpolicy hub


## 2026-10-26

#### Handoff — spec + plan approved, ready to build

- **Goal:** build the translatingpolicy.com hub site and move every tool onto translatingpolicy.com subdomains, per the approved spec + plan.
- **Done:**
  - Spec `2026-10-25-translatingpolicy-hub-design.md` approved by Derek (published: https://claude.ai/artifact/9yuFmXP5QSXv93ozbBRkW5).
  - Mockup approved, option C (https://claude.ai/artifact/HBDF9mDHBw7EYUnqJHyJf7; copy: `2026-10-25-translatingpolicy-hub-mockup.html`).
  - Plan `2026-10-26-translatingpolicy-hub-plan.md` approved (https://claude.ai/artifact/G9pg8DYz6ws1c4YieqtQ7V). Execution: **subagent-driven** (Claude's recommendation; Derek accepted).
  - DNS (GoDaddy): `uscongress` CNAME → `ywqn0npo.up.railway.app`, `statehouses` CNAME → `lu8r0gzc.up.railway.app`, plus both `_railway-verify` TXTs. All live (checked via dns.google). Old `congress`/`statehouse` records deleted, and their Railway domains deleted.
  - Railway: both new names show `Verified: yes` (CLI `railway domain status`, 10-26 ~18:00 UTC).
- **Not done / blocked:** certificates for uscongress/statehouses show ISSUE_FAILED "Let's Encrypt rate limit reached". Cause: **Railway-wide incident** "TLS certificate issuance returning rate limit error" (status.railway.com, Identified 17:44 UTC 10-26). It's not our config. The session cron that retried is gone with the old session.
- **Next:** plan Task 1 (scaffold `~/projects/translatingpolicy`). Before that, one quick check: `railway domain status c2e679ea-2e4c-4302-b2b9-04cbc0b0db8d` (in ~/projects/congressional-dashboard) and `d67f5b97-cd9b-4f36-a097-a2583467f701` (in ~/projects/state-legislature-dashboard). If certs are still failing and the incident is resolved, call Railway MCP `retry-domain-certificate` once each. Never delete/re-add.
- **Decisions:** subdomain names are `uscongress.` / `statehouses.` (Derek, 10-26), not congress./statehouse. DNS stays on GoDaddy. No GoDaddy forwarding. LinkHub is off the domain for now. Inflation Reality: saved browser answers not migrated (Derek OK'd).
- **Gotchas:** Derek is on Railway Hobby (no private support; community forum only). Vercel CLI isn't installed and the Vercel connector isn't signed in; Derek runs `! npx vercel login`. `railway` CLI login was renewed 10-26.
- **Resume:** read the plan + spec in `~/drafts/translatingpolicy-hub/`, then invoke superpowers:subagent-driven-development.

#### Handoff — Phase A built, attractor + inflation subdomains live; launch gate blocked on Railway certs

- **Goal:** build the translatingpolicy.com hub and move every tool onto its subdomain, per `docs/superpowers/plans/2026-10-26-translatingpolicy-hub-plan.md` (subagent-driven).
- **Done (verified):**
  - Tasks 1–4: hub built and reviewed (commits 922f80f..efa9329). `npm test` = 24/24 + reading-level gate. Repo https://github.com/DerekTM17/translatingpolicy (public). Vercel project `derektm17s-projects/translatingpolicy`, Git-connected: **push to main = production deploy**. Live at https://translatingpolicy.vercel.app (200, 4 rows, no placeholders). Derek checked it on his phone: OK. Bio = option A, title "Policy Analyst and Builder".
  - Placeholder guard proven live: the first prod deploy failed on placeholders as designed.
  - Task 5: `attractor.translatingpolicy.com` → Vercel project `attractor`, HTTPS 200. `www` → apex 308 redirect set in the Vercel dashboard. Hub apex + www added to Vercel but **GoDaddy @/www still point at parking (deferred to Task 7, by ruling)**. LinkHub's two Railway domains deleted (Derek, CLI).
  - Task 6: inflation-reality main pushed (ba1c9ad: base "/", public/CNAME, test). Pages cname set by the CNAME file, cert approved (exp 2027-01-24). https://inflation.translatingpolicy.com 200, old github.io URL 301s to it. Note left UNCOMMITTED in `~/projects/inflation-reality-phase2b/docs/SESSIONS.md`.
  - `npm run check-links`: attractor OK, inflation OK, apex OK (parking page, proves nothing), uscongress/statehouses FAIL.
- **Blocked:** uscongress/statehouses certs ISSUE_FAILED (Let's Encrypt rate limit, `retryable: false`). Railway incident "TLS certificate issuance returning rate limit error" still Identified (last update 17:44 UTC 10-26). A session cron checks this; it dies with the session.
- **Next:**
  1. Derek: tick **Enforce HTTPS** for inflation-reality (GitHub → Settings → Pages), or `! gh api -X PUT repos/DerekTM17/inflation-reality/pages -F https_enforced=true` (Claude's attempt is blocked by the classifier).
  2. Check certs: `railway domain status c2e679ea-2e4c-4302-b2b9-04cbc0b0db8d` (in ~/projects/congressional-dashboard) and `d67f5b97-cd9b-4f36-a097-a2583467f701` (in ~/projects/state-legislature-dashboard). Retry once (Railway MCP `retry-domain-certificate`) only if retryable. Never delete or re-add.
  3. When `npm run check-links` is all OK → **Task 7**: hand Derek the GoDaddy switch: delete `@` A 13.248.243.5 + 76.223.105.230 and `www` CNAME `@`; add `@` A 216.198.79.1 (the dashboard shows only this one; the CLI also listed 64.29.17.1) and `www` CNAME e745fe0d3a5fa4fa.vercel-dns-017.com. Then check with `curl -s https://translatingpolicy.com/ | grep -o 'class="rowc' | wc -l` → 4 (not `grep -c`: the HTML is one line).
  4. Then Phase C, Tasks 8–12 (back-links). After Task 6, switch `scripts/fetch-fred.mjs:16` in inflation-reality to the new domain.
- **Decisions:** the SDD ledger at `.superpowers/sdd/2026-10-26-translatingpolicy-hub-plan/progress.md` (gitignored) holds every ruling + deferred minor. Read it on resume and collect its `Ruling:` lines for the final report. Copy deviations forced by the FK ≤ 9 gate were approved by Derek with the phone check.
- **Gotchas:**
  - The auto-mode classifier blocks Claude from `gh repo create --push`, `vercel domains add` and `gh api PUT .../pages`. Hand Derek `!` commands.
  - Railway MCP `delete-domain` returned "user did not approve" even though Derek accepted. Use the Railway CLI via `!` instead.
  - Vercel previews sit behind Vercel login (QR on phone). Use the production .vercel.app URL for phone checks.
  - The Vercel MCP connector isn't authorized for team derektm17s-projects (403).
  - The statehouse prod host is statehouse.up.railway.app.
- **Resume:** `cd ~/projects/translatingpolicy`, read this handoff + the SDD ledger, invoke superpowers:subagent-driven-development, and resume at the first task without a `complete` line (Task 7).
