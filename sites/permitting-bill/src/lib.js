// Small helpers shared by the page, the data check and the tests.

export function formatDate(dateIso, opts = { month: 'long', day: 'numeric', year: 'numeric' }) {
  const [y, m, d] = dateIso.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString('en-US', { ...opts, timeZone: 'UTC' });
}

// A roll call's three counts must cover all 100 senators.
export function voteTotal(v) {
  return v.yea + v.nay + v.notVoting;
}

export function voteMargin(v) {
  return v.yea - v.nay;
}

// Share of senators voting who voted yes, as a whole percent.
export function yeaShare(v) {
  const voting = v.yea + v.nay;
  return voting ? Math.round((v.yea / voting) * 100) : 0;
}

// Stages run in order; the first one not done is "next".
export function nextStep(steps) {
  return steps.find((s) => !s.done) || null;
}

// How firmly each change is sourced. We could not read the Senate-passed text directly,
// so nothing is labeled as checked against the text.
export const CHECK_LABELS = {
  both: 'CRS summary and a reading of the passed text agree',
  crs: 'CRS summary of the bill as introduced',
  tracker: 'A tracker\u2019s reading of the passed text only',
  reported: 'Reported by a law firm or advocates, not yet confirmed',
};

// Validates the hand-curated data. Returns a list of problems (empty when clean).
export function checkData(raw) {
  const errors = [];
  if (/[\u2013\u2014]/.test(raw)) errors.push('data contains an en dash or em dash');
  const data = JSON.parse(raw);
  const https = (u) => typeof u === 'string' && u.startsWith('https://');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(data.lastVerified || '')) errors.push('lastVerified missing or not YYYY-MM-DD');

  let prev = '';
  for (const s of data.steps || []) {
    if (!s.label || !s.detail) errors.push(`step ${s.label || '?'}: missing text`);
    if (s.date) {
      if (s.date < prev) errors.push(`step ${s.label}: dates out of order`);
      prev = s.date;
    }
    if (s.done && !https(s.source?.url)) errors.push(`step ${s.label}: a finished step needs an https source`);
  }

  for (const v of data.votes || []) {
    if (voteTotal(v) !== 100) errors.push(`roll call ${v.roll}: counts add to ${voteTotal(v)}, not 100`);
    if (!https(v.url)) errors.push(`roll call ${v.roll}: source not https`);
    if (v.parties) {
      const sum = (k) => Object.values(v.parties).reduce((a, p) => a + (p[k] || 0), 0);
      if (sum('yea') !== v.yea || sum('nay') !== v.nay) errors.push(`roll call ${v.roll}: party counts do not match totals`);
    }
  }

  const ids = new Set();
  for (const c of data.changes || []) {
    if (ids.has(c.id)) errors.push(`duplicate change id ${c.id}`);
    ids.add(c.id);
    for (const f of ['title', 'felt', 'mechanics', 'section']) if (!c[f]) errors.push(`${c.id}: missing ${f}`);
    if (!CHECK_LABELS[c.check]) errors.push(`${c.id}: unknown check "${c.check}"`);
    if (!c.sources?.length) errors.push(`${c.id}: no sources`);
    for (const s of c.sources || []) if (!https(s.url)) errors.push(`${c.id}: source not https`);
    for (const n of c.numbers || []) if (!https(n.url)) errors.push(`${c.id}: number ${n.value} has no https source`);
  }

  for (const side of ['support', 'oppose']) {
    for (const p of data.sides?.[side] || []) {
      if (!p.who || !p.claim || !https(p.url)) errors.push(`${side}: ${p.who || '?'} needs who, claim and an https source`);
    }
  }
  if ((data.sides?.support || []).length !== (data.sides?.oppose || []).length) {
    errors.push('supporters and opponents should be listed in equal numbers (balance rule)');
  }
  for (const n of data.myths || []) if (!n.claim || !n.fact || !https(n.url)) errors.push(`myth ${n.claim || '?'} needs claim, fact and an https source`);
  return errors;
}
