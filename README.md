# translatingpolicy

The hub site for translatingpolicy.com. It links the policy tools (US Congress dashboard, statehouses dashboard, ATTRACTOR and others). Built with Astro.

## Commands

- `npm test` runs the reading-level check and the test suite.
- `npm run check-links` checks the project links before launch.
- `npm run build` builds the site.

## Placeholders

Text still waiting on the owner is marked `[DEREK: ...]`. Previews build with a warning, but production builds (`VERCEL_ENV=production`) fail while any remain. Check by hand with `node scripts/check-placeholders.mjs --strict`.
