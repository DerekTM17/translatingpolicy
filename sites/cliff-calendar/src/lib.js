// The calendar counts whole dates in US Eastern time.

const easternDate = new Intl.DateTimeFormat('en-US', {
  timeZone: 'America/New_York',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

export function todayInEastern(now = new Date()) {
  const parts = Object.fromEntries(easternDate.formatToParts(now).map(({ type, value }) => [type, value]));
  return `${parts.year}-${parts.month}-${parts.day}`;
}

// Refresh open tabs, including those returning from sleep or the back/forward cache.
export function subscribeToEasternDay(check, win = window, doc = document) {
  const id = win.setInterval(check, 15_000);
  win.addEventListener('focus', check);
  win.addEventListener('pageshow', check);
  doc.addEventListener('visibilitychange', check);
  return () => {
    win.clearInterval(id);
    win.removeEventListener('focus', check);
    win.removeEventListener('pageshow', check);
    doc.removeEventListener('visibilitychange', check);
  };
}

function toUtcDay(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  return Date.UTC(y, m - 1, d);
}

// Whole calendar days from today (Eastern) to the deadline date.
export function daysBetween(today, dateIso) {
  return (toUtcDay(dateIso) - toUtcDay(today)) / 86400000;
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
