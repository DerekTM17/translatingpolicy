// Small date helpers. All "today" math uses US Eastern time, since lapses
// happen at midnight Eastern.

export function todayInEastern(now = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/New_York',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now);
  return parts; // YYYY-MM-DD
}

function toUtcDay(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  return Date.UTC(y, m - 1, d);
}

// Whole calendar days from today (Eastern) to the deadline date.
export function daysUntil(dateIso, now = new Date()) {
  return Math.round((toUtcDay(dateIso) - toUtcDay(todayInEastern(now))) / 86400000);
}

export function formatDate(dateIso, opts = { month: 'long', day: 'numeric', year: 'numeric' }) {
  const [y, m, d] = dateIso.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString('en-US', { ...opts, timeZone: 'UTC' });
}

export function countdownText(days) {
  if (days > 1) return `${days} days left`;
  if (days === 1) return '1 day left';
  if (days === 0) return 'Today';
  return 'Deadline passed';
}

export const fmt = new Intl.NumberFormat('en-US');
